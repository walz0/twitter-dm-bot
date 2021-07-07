const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
const googleAuth = require('./google-auth');
const twitter = require('./twitter');
const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

function parseRecipient(id, url) {
    let start = url.indexOf('messages/') + 'messages/'.length;
    let sliced = url.slice(start);
    let id_index = sliced.indexOf(id);

    return (id_index == 0) ? 
        sliced.slice(id.length).replace('-', '') : 
        sliced.slice(0, id_index).replace('-', '');
}

// Check twitter auth
async function twitterAuth(main) {
    const authenticated = await twitter.verify_credentials();
    if (authenticated) {
        // Run google auth routine
        googleAuth.auth(main);
    }
    else {
        // else delete api keys and tokens and prompt to regenerate
        console.log("User is not authorized, starting API key setup...");
        const app = express();
        app.use(express.urlencoded({ extended: true }));
        app.use(express.json());

        // Start backend
        const port = 4000;
        let server = app.listen(port);

        // Return page with form
        app.get('/', (req, res) => {
            res.sendFile(__dirname + "/assets/twitter_api.html");
        });

        // Save keys to .env file
        app.post('/submit_twitter', async (req, res) => {
            let keys = Object.keys(req.body);
            let output = '';
            keys.forEach((key) => {
                output += key.toUpperCase() + '=' + req.body[key] + '\n';
            })
            // Write new env file
            fs.writeFileSync('.env', output, 'utf8');
            // Start normal process
            twitterAuth(main);
            await browser.close();
        });

        await page.goto('http://localhost:4000/');
    }
}

// Close app if user has no remaining uses
// Maybe pass main in as a callback
function handleUses() {
    if (fs.existsSync('.data')) {
        let data = JSON.parse(fs.readFileSync('.data', 'utf8'));
        // If timer has expired
        if (data.time_stamp - Date.now() < 0) {
            // Replenish uses
            data.remaining = data.max_uses;
            // Timestamp to start 24 hr cycle milliseconds
            let day = 24 * 60 * 60 * 1000;
            data.time_stamp = Date.now() + day;
        }
        fs.writeFileSync('.data', JSON.stringify(data));
    }
    else {
        let data = {
            "max_uses": 5,
            "remaining": 5,
            "time_stamp": Date.now()
        }
        fs.writeFileSync('.data', JSON.stringify(data));
    }
}

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Check remaining uses
handleUses();

function main(auth) {
    const sheets = google.sheets({version: 'v4', auth});
    sheets.spreadsheets.values.get({
        spreadsheetId: '1_WGso2jn7LRHoqj80DvQk3i-SEQnQuv3aV5ii--zew4',
        range: 'Blad1!A2:B',
    }, (err, res) => {
        if (err) {
            // If error occurred, most likely invalid_grant or invalid_credentials, reauth
            fs.unlink('./token.json', (err) => {
                if (err) throw err;
                console.log('token.json has been deleted');
                console.log('Starting the authorization process...');
                googleAuth.auth(main);
                return null;
            });		
            return console.error('The API returned an error: ' + err);
        } 

        // Parse names and links from sheet
        let users = res.data.values.map(
            (row) => [row[0], row[1]], 
            res.data.values
        );

        (async () => {
            // Start backend
            const port = 3000;
            let server = app.listen(port);
    
            // Return page with form
            app.get('/', (req, res) => {
                res.sendFile(__dirname + "/assets/index.html");
            });
    
            app.get('/uses', (req, res) => {
                let uses = JSON.parse(fs.readFileSync('.data', 'utf8'))['remaining'];
                res.send(uses.toString());
            })
   
            // Message to send
            let message = '';
            // Process form submission and get message
            app.post('/submit', async (req, res) => {
                let remaining = JSON.parse(fs.readFileSync('.data', 'utf8'))['remaining'];
                let sender = {
                    'scuba': '1212472220909355008',
                    'walz_dev': '785961919'
                }
                const hasUses = remaining > 0;
                if (hasUses) {
                    if (req.body.message != '') {
                        // Keys
                        let keys = Object.keys(req.body);
                        // Filtered users
                        let userFilter = [];
                        for (var i = 0; i < keys.length; i++) {
                            if (keys[i] !== 'message') {
                                if (keys[i] !== 'all') {
                                    let index = parseInt(keys[i]);
                                    users[index][1] = parseRecipient(sender['scuba'], users[index][1]);
                                    userFilter.push({
                                        "name": users[index][0],
                                        "id": users[index][1]
                                    });
                                }
                            }
                        }
                        // Assign filtered user list
                        users = userFilter;
                        console.log("Selected Users:", users);
            
                        // Assign message
                        // message = String(req.body.message).replace(/\r?\n|\r/g, ' ');
                        message = req.body.message;
                        console.log("Message:", message);
    
                        let data = JSON.parse(fs.readFileSync('.data', 'utf8'));
                        // Decrement uses
                        data.remaining -= 1;
                        fs.writeFileSync('.data', JSON.stringify(data), 'utf8');
                        
                        // Send DMs
                        users.forEach((user) => {
                            twitter.direct_message(user.id, message);
                        });
                        await page.goto('http://localhost:8000');
                    }
                    else {
                        await page.evaluate(() => alert('Please enter a message'));
                    }
                }
            });
    
            // Serve user list
            app.get('/users', (req, res) => {
                res.send(users);
            })

            // Launch setup page to get message input
            await page.goto(`http://localhost:${port}/`);

            // Load error messages
            // let errorMsg = 'These users have either blocked you, or are suspended:\n';
            // if (fs.existsSync('.twitterlog')) {
            //     const errors = fs.readFileSync('.twitterlog', 'utf-8').split('\n');
            //     for (var i = 0; i < errors.length; i++) {
            //         if (errors[i] != '') {
            //             var id = errors[i].slice(errors[i].indexOf('-') + 2);
            //             console.log(id);
            //             var user = await twitter.get_user_by_id(id);
            //             errorMsg += user.name + '  @' + user.username + '\n';
            //         }
            //     }
            //     fs.unlinkSync('.twitterlog');
            // }
        })();
    });
}
// Check twitter authorization
twitterAuth(main);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let server = app.listen(3000, () => {
    console.log('App is now listening on port 3000')
});

// Return page with setup forms
app.get('/setup', (req, res) => {
    res.sendFile(__dirname + "/assets/auth.html");
});

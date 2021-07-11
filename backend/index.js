const fs = require('fs');
const { google } = require('googleapis');
const googleAuth = require('./google-auth');
const twitter = require('./twitter');
const md5 = require('md5');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

let server = app.listen(5000, () => {
    console.log('Backend listening on port 5000');
});

// Writes the google auth token to token.json
app.post('/submit_google', (req, res) => {
    let code = req.body.code;
    console.log(code);
    if (code) {
        let client = googleAuth.getOAuth2Client();
        googleAuth.writeToken(client, code);
        res.sendStatus(200);
    }
    else {
        res.send(500, {error:"No code found"});
    }
});

// Returns a google auth URL if there is no token stored
// Else returns 200
app.get('/check_token', (req, res) => {
    let credentials = googleAuth.getCredentials();
    let response = googleAuth.checkToken(credentials);
    if (response === undefined) {
        res.sendStatus(200);
    }
    else {
        res.send(response);
    }
});

app.get('/clients', (req, res) => {
    // This endpoint should never be called without a token
    const token = googleAuth.getToken();
    if (token) {
        const auth = googleAuth.getOAuth2Client();
        auth.setCredentials(JSON.parse(token));
        const sheets = google.sheets({version: 'v4', auth: auth});
        sheets.spreadsheets.values.get({
            spreadsheetId: '1_WGso2jn7LRHoqj80DvQk3i-SEQnQuv3aV5ii--zew4',
            range: 'Blad1!A2:B',
        }, (err, response) => {
            if (err) {
                // There is an expired token
                // Delete token.json
                fs.unlinkSync('./token.json');
                res.send(500, {error: 'Google auth token is expired'});
            }
            else {
                let users = response.data.values.map(
                    (row) => [row[0], row[1]], 
                    response.data.values
                );
                res.send(users);
            }
        });
    }
    else {
        // No token is present
        res.send(500, {error: 'No google auth token present'});
    }
});

// Returns the client's data (reset timer, remaining uses)
app.get('/data', (req, res) => {
    let data = JSON.parse(fs.readFileSync('.data', 'utf8'));
    res.send(data);
});

app.get('/check_uses', (req, res) => {
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
        let day = 24 * 60 * 60 * 1000;
        let data = {
            "max_uses": 5,
            "remaining": 5,
            "time_stamp": Date.now() + day
        }
        fs.writeFileSync('.data', JSON.stringify(data));
    }
    res.sendStatus(200);
})

app.get('/decrement_uses', (req, res) => {
    if (fs.existsSync('.data')) {
        let data = JSON.parse(fs.readFileSync('.data', 'utf8'));
        if (data.remaining > 0) {
            data.remaining -= 1;
        }
        fs.writeFileSync('.data', JSON.stringify(data));
    }
    res.sendStatus(200);
})

// Returns true if the user is authenticated
app.get('/twitter_auth', async (req, res) => {
    let response = await twitter.verify_credentials();
    console.log(response);
    res.send(response);
})

app.post('/submit_twitter', async (req, res) => {
    let keys = {
        api_key: req.body.api_key,
        api_secret: req.body.api_secret,
        access_token: req.body.access_token,
        token_secret: req.body.token_secret
    }

    // File text output
    let output = '';
    Object.keys(keys).forEach((key) => {
        if (keys[key] === undefined) {
            res.send(500, {error: "Missing one or more arguments"});
        }
        else {
            output += key.toUpperCase() + '=' + req.body[key] + '\n';
        }
    })
    // Write new env file
    fs.writeFileSync('.env', output, 'utf8');
    res.sendStatus(200);
});

app.get('/get_user', async (req, res) => {
    let user = req.body.user;
    if (user === undefined) {
        res.sendStatus(500);
    }
    else {
        let response = await twitter.get_user(user);
        res.send(response);
    }
});

(async () => {
    console.log(await (twitter.verify_credentials()));
    // console.log(await (twitter.direct_message("01412861778653028360", "test")));
})();


app.post('/direct_message', async (req, res) => {
    let id = req.body.id;
    let message = req.body.message;
    if (id === undefined || message === undefined) {
        res.send(500, {error:'Missing one or more requirements'});
    }
    res.send(await twitter.direct_message(id, message));
});

app.post('/token', (req, res) => {
    console.log(req.body);
    let username = req.body.username;
    let hash = req.body.password;
    let userData = JSON.parse(fs.readFileSync("users.json", {encoding: 'utf-8'}));
    let i;
    let foundUser = userData.filter((user, index) => {
        if (username == user.username) {
            if (hash == user.hash) {
                i = index;
                return user;
            }
        }
    }, userData);
    if (i !== undefined) {
        let token = md5(Date.now());
        userData[i]['token'] = token;
        fs.writeFileSync("users.json", JSON.stringify(userData));
        res.send({
            "access_token": token
        });
    }
    else {
        res.send(500, {error: "Incorrect username or password"})
    }
});

app.post('/auth', (req, res) => {
    let token = req.body.token;

    let userData = JSON.parse(fs.readFileSync("users.json", {encoding: 'utf-8'}));
    let foundUser = userData.filter((user) => {
        if (token == user.token) {
            res.sendStatus(200);
        }
    }, userData);
    res.send(500, {error: "Invalid access token"});
});


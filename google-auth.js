const fs = require('fs');
const {google} = require('googleapis');
const open = require('open');

const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_PATH = 'token.json';

function authorize(credentials, callback, win) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback, win);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

async function getNewToken(oAuth2Client, callback, win) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    // Backend server port
    const port = 5000;

    // Start server
    app.listen(port);

    // Return page with form
    app.get('/', (req, res) => {
        res.sendFile(__dirname + "/assets/auth.html");
    });

    // Process form submission and get message
    app.post('/submit', async (req, res) => {
        // Assign code
        let code = req.body.auth_code;

        oAuth2Client.getToken(code, (err, token) => {
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
                callback(oAuth2Client);
                win.loadURL('http://localhost:3000/')
            });
        })
    });

    // Open url in default browser
    open(authUrl);

    // Load auth setup page
    win.loadURL(`http://localhost:${port}/`);
}

const auth = (callback, win) => {
	fs.readFile('credentials.json', (err, content) => {
	  if (err) return console.log('Error loading client secret file:', err);
	  // Authorize a client with credentials, then call the Google Sheets API.
	  authorize(JSON.parse(content), callback, win);
	});
};

exports.auth = auth;
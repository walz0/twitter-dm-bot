const fs = require('fs');
const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_PATH = 'token.json';

const getOAuth2Client = () => {
    let credentials = getCredentials();
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
    return oAuth2Client;
}

const getCredentials = () => {
    const data = fs.readFileSync('./credentials.json', {encoding:'utf8', flag:'r'});
    return JSON.parse(data);
}

const getToken = () => {
    let hasToken = fs.existsSync(TOKEN_PATH);
    if (hasToken) {
        const token = fs.readFileSync(TOKEN_PATH, {encoding:'utf8', flag:'r'});
        return token;
    }
    else {
        return null
    }
}

// Returns url if token is invalid, else undefined
const checkToken = (credentials) => {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    let hasToken = fs.existsSync(TOKEN_PATH);
    if (hasToken) {
        const token = fs.readFileSync(TOKEN_PATH, {encoding:'utf8', flag:'r'});
        oAuth2Client.setCredentials(JSON.parse(token));
    }
    else {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        return authUrl;
    }
}

const writeToken = (oAuth2Client, code) => {
    oAuth2Client.getToken(code, (err, token) => {
        console.log(token);
        oAuth2Client.setCredentials(token);
        // Store the token to disk
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token), {encoding: 'utf8'});
        console.log('Token stored to', TOKEN_PATH);
    });
}

exports.writeToken = writeToken;
exports.checkToken = checkToken;
exports.getToken = getToken;
exports.getCredentials = getCredentials;
exports.getOAuth2Client = getOAuth2Client;
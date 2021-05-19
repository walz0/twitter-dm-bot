const OAuth = require('oauth');
const axios = require('axios');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Log all requests to backend server
let logging = true;
// Request results
let log = [];

if (logging) {
	const app = express();
	app.use(express.urlencoded({ extended: true }));
	app.use(express.json());
    app.use(cors());

    app.listen(8000);

    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/assets/results.html');
    })

    app.get('/log', async (req, res) => {
        for (var i = 0; i < log.length; i++) {
            if (log[i]['user'] == undefined) {
                log[i]['user'] = await get_user_by_id(log[i]['id']);
            }
        }
        res.send(log);
    })

    app.get('/user/:id', async (req, res) => {
        let user = await get_user_by_id(req.params.id);
        res.send(user);
    })

    app.get('/data', async(req, res) => {
        let data = JSON.parse(fs.readFileSync('.data', 'utf8'));
        res.send(data);
    })
}

let oauth = new OAuth.OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    process.env.API_KEY,
    process.env.API_SECRET,
    '1.0',
    null,
    'HMAC-SHA1',
    11
);

const verify_credentials = async() => {
    const url = 'https://api.twitter.com/1.1/account/verify_credentials.json';
    const header = oauth.authHeader(
        url,
        process.env.ACCESS_TOKEN,
        process.env.TOKEN_SECRET,
        'get'
    );
    let output;
    await axios({
        method: 'get',
        url: url,
        headers: {
            "Authorization": header,
        }
    }).then((res) => {
        output = true;
    }).catch((err) => { 
        output = false;
    });
    return output;
}

const get_user_by_id = async(user_id) => {
    const user_url = 'https://api.twitter.com/2/users/' + user_id;
    const header = oauth.authHeader(
        user_url,
        process.env.ACCESS_TOKEN,
        process.env.TOKEN_SECRET,
        'get'
    );
    let output = {};
    await axios({
        method: 'get',
        url: user_url,
        headers: {
            "Authorization": header,
        }
    }).then((res) => {
        let user = res.data.data;
        output = user;
    }).catch((err) => { throw err });
    return output;
}

const get_user = async(user) => {
    const user_url = 'https://api.twitter.com/2/users/by?usernames=' + user;
    const header = oauth.authHeader(
        user_url,
        process.env.ACCESS_TOKEN,
        process.env.TOKEN_SECRET,
        'get'
    );
    let output = {};
    await axios({
        method: 'get',
        url: user_url,
        headers: {
            "Authorization": header,
        }
    }).then((res) => {
        let user = res.data.data[0];
        output = {
            "id": user.id,
            "name": user.name
        }
    }).catch((err) => { throw err });
    return output;
}

const get_users = async (users) => {
    /*
        string[] => Object[] { id, name, username }
    */
    const user_url = 'https://api.twitter.com/2/users/by?usernames=' + users.join(',');
    const header = oauth.authHeader(
        user_url,
        process.env.ACCESS_TOKEN,
        process.env.TOKEN_SECRET,
        'get'
    );
    let output = {};
    await axios({
        method: 'get',
        url: user_url,
        headers: {
            "Authorization": header,
        }
    }).then((res) => {
        for (var i = 0; i < res.data.data.length; i++) {
            let user = res.data.data[i];
            output[String(user.username).toLowerCase()] = {
                "id": user.id,
                "name": user.name
            };
        }
    }).catch((err) => { throw err });
    return output;
}

const direct_message = async (message, recipient_id) => {
    const dm_url = 'https://api.twitter.com/1.1/direct_messages/events/new.json';
    const header = oauth.authHeader(
        dm_url,
        process.env.ACCESS_TOKEN,
        process.env.TOKEN_SECRET,
        'post'
    );
    axios({
        method: 'post',
        url: dm_url,
        headers: {
            "Authorization": header,
            "Content-Type": 'application/json'
        },
        data: {
            "event": {
                "type": "message_create",
                "message_create": {
                    "target": {
                        "recipient_id": recipient_id
                    },
                    "message_data": {
                        "text": message
                    }
                }
            }
        }
    }).then((res) => {
        log.push({
            'type': 'message_create', 
            'id': recipient_id, 
            'status': res.status, 
            'statusText': res.statusText
        });
        console.log(
            recipient_id, 
            res.status, 
            res.statusText
        )})
       .catch((err) => {
            log.push({
                'type': 'message_create', 
                'id': recipient_id, 
                'status': err.response.status, 
                'statusText': err.response.statusText
            });
            console.log("Error: Message could not be sent", 
                        err.response.status, 
                        err.response.statusText);
            fs.appendFile('.twitterlog',
                `${(new Date()).toLocaleString()} - ${recipient_id}\n`,
            () => {});
       });
}

exports.direct_message = direct_message;
exports.get_users = get_users;
exports.get_user = get_user;
exports.get_user_by_id = get_user_by_id;
exports.verify_credentials = verify_credentials;
const twitter = require('twitter');
const OAuth = require('oauth');
const axios = require('axios');
require('dotenv').config();


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

async function get_users(users) {
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
    const output = {};
    await axios({
        method: 'get',
        url: user_url,
        headers: {
            "Authorization": header,
        }
    }).then((res) => {
        for (var i = 0; i < res.data.data.length; i++) {
            let user = res.data.data[i];
            output[user.username] = {
                "id": user.id,
                "name": user.name
            };
        }
    }).catch((err) => { throw err });
    return output;
}

async function direct_message(message, recipient_id) {
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
    }).then((res) => console.log(
        recipient_id, 
        res.status, 
        res.statusText
        ))
       .catch((res) => {
           console.log("Error: Message could not be sent", res.status);
       });
}
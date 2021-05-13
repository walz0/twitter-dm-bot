const twitter = require('twitter');
const OAuth = require('oauth');
const axios = require('axios');
require('dotenv').config();

const consumer_key = "zPOFdtE5g0NiAYyosf0DpMpjA";
const consumer_secret = "WS7SdCZrv5rCPRrODNf7INf8x7Gm8UaF1viYvG3TGiR0Tl9oJG";
const access_token = "785961919-dnEx1nNMqPeJ9KDjaZOWE13QBqmMcWGZy6aHGb4n";
const access_token_secret = "fa0XdIgTPUCqG5Hxokatmx8XhZFoHg0fEU3BJw3pToeYw";
const bearer_token = "AAAAAAAAAAAAAAAAAAAAANJQPgEAAAAAabgxEyjx12dlrHQDuIWQqmncMzU%3DsJGZrnjEOhtWEzDb7OYjhY2VB2mUKgaNgUKLKvex0jJqpCPQFu";

const dm_url = 'https://api.twitter.com/1.1/direct_messages/events/new.json';

axios({
    method: 'post',
    url: dm_url,
    headers: {
        "Authorization": 'OAuth oauth_consumer_key="hy9z7IBnscMhYoUg2kaxRcwo0",oauth_token="785961919-JseVFIfyIJNjgehnzzNtImuVWOfYpH55C7uN2JvV",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1620937711",oauth_nonce="9CaleX8ErU8",oauth_version="1.0",oauth_signature="tRY26j1wUIN7wt4CZShzyBRpPG0%3D"',
        "Content-Type": 'application/json'
    },
    data: {
        "event": {
            "type": "message_create",
            "message_create": {
                "target": {
                    "recipient_id": "785961919"
                },
                "message_data": {
                    "text": "test"
                }
            }
        }
    }
});

// const oauth = new OAuth.OAuth(
//     'https://api.twitter.com/oauth/request_token',
//     'https://api.twitter.com/oauth/access_token',
//     process.env.TWITTER_CONSUMER_KEY,
//     process.env.TWITTER_CONSUMER_SECRET,
//     '1.0A',
//     null,
//     'HMAC-SHA1'
// );

// oauth.post(
//     'https://api.twitter.com/1.1/direct_messages/events/new.json',
//     process.env.TWITTER_ACCESS_TOKEN,
//     process.env.TWITTER_ACCESS_TOKEN_SECRET,
//     {"event": {"type": "message_create", "message_create": {"target": {"recipient_id": "785961919"}, "message_data": {"text": "Hello World!"}}}},
//     function (error, data, response) {
//         if (error) console.error(error);
//         data = JSON.parse(data);
//         console.log(JSON.stringify(data, 0, 2));
//     }
// );


// function direct_message(message, recipient_id) {
//     const client = new twitter({
//         consumer_key: process.env.TWITTER_CONSUMER_KEY,
//         consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
//         access_token: process.env.TWITTER_ACCESS_TOKEN,
//         access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
//     });

//     const getClientCredentials = oauth.client(axios.create(), {
//         url: 'https://oauth.com/2.0/token',
//         grant_type: 'client_credentials',
//         client_id: 'foo',
//         client_secret: 'bar',
//         scope: 'baz'
//     });
//     client.post('direct_messages/events/new.json', {
//         "event": {
//             "type": "message_create",
//             "message_create": {
//                 "target": {
//                     "recipient_id": "785961919"
//                 },
//                 "message_data": {
//                     "text": "Hello World!"
//                 }
//             }
//         }
//     }).then(console.log("test"));
// }

// // direct_message("Hello World!", "785961919");
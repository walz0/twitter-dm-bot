const fs = require('fs');
const twitter = require('./twitter');

const users = JSON.parse(fs.readFileSync('users_id.json', {encoding: 'utf8'}));
console.log(users.length);

let file = fs.createWriteStream('final.txt');

for (var i = 0; i < users.length; i++) {
    console.log(i);
    file.write(users[i] + '\n');
}

file.close();

// const users = JSON.parse(fs.readFileSync('users.json', {encoding: 'utf8'}));

// (async () => {
//     let parsed = [];
//     for (var i = 0; i < users.length; i++) {
//         let start = users[i][1].indexOf('messages/') + 'messages/'.length;
//         let sliced = users[i][1].slice(start);
//         let id = '1212472220909355008';
//         let id_index = sliced.indexOf(id);
    
//         if (id_index != 0) {
//             let user_id = sliced.slice(0, id_index).replace('-', '');
//             let user = await twitter.get_user_by_id(user_id);
//             console.log(user);
//             if (user == undefined) {
//                 // parsed[users[i][0] + 'ERROR'] = user_id;
//                 parsed.push('ERROR :: ' + users[i][0]);
//             }
//             else {
//                 // parsed[user.username] = user.id;
//                 parsed.push(user.username);
//             }
//         }
//         else {
//             let user_id = sliced.slice(id.length).replace('-', '');
//             let user = await twitter.get_user_by_id(user_id);
//             console.log(user);
//             if (user == undefined) {
//                 // parsed[users[i][0] + 'ERROR'] = user_id;
//                 parsed.push('ERROR :: ' + users[i][0]);
//             }
//             else {
//                 // parsed[user.username] = user.id;
//                 parsed.push(user.username);
//             }
//         }
//         await new Promise(resolve => setTimeout(resolve, 100));
//         console.log(i);
//     }
//     console.log(parsed.length);
// 	let file = fs.createWriteStream('users_id.json');
// 	let json = JSON.stringify(parsed);
// 	file.write(json);
// 	file.close();
// })();
var axios = require('axios');
var fs = require('fs');


async function download() {
    const url = 'https://github.com/walz0/twitter-dm-bot/releases/download/1.0.0/twitter-bot-win.zip';
    const path = __dirname + '\\file.zip';
    
    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream'
    })

    response.data.pipe(fs.createWriteStream(path))
    
    return new Promise((resolve, reject) => {
        response.data.on('end', () => {
            console.log('Download complete');
            resolve();
        })
    
        response.data.on('error', err => {
            reject(err);
        })
    })
}

download();
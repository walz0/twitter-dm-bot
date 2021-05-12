const axios = require('axios');
const unzipper = require('unzipper');
const fs = require('fs');
const mv = require('mv');


async function update() {
    let url = '';
    switch(process.platform) {
        case "win32":
            url = 'https://github.com/walz0/twitter-dm-bot/releases/download/1.0.0/twitter-bot-win.zip';
            break;
        case "darwin":
            // url = 'https://github.com/walz0/twitter-dm-bot/releases/download/1.0.0/twitter-bot-win.zip';
            break;
    }
    const path = __dirname + '/bin.zip';
    
    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream'
    })

    console.log("Downloading files from", url);
    response.data.pipe(fs.createWriteStream(path))
    
    return new Promise((resolve, reject) => {
        response.data.on('end', () => {
            console.log('Download complete, extracting files...');
            // Unzip files
            fs.createReadStream(path)
                .pipe(unzipper.Extract({path: __dirname + '/.'}))
                .on('close', () => {
                    // Move files to . 
                    mv('./twitter-bot/', '.', {mkdirp: false, clobber: false}, (err) => {
                        if (err) throw err;
                        // Delete unnecessary files
                        fs.unlink('bin.zip', () => {
                            fs.unlink('twitter-bot', () => {
                                console.log('Update complete.');
                            })
                        })
                    });
                });
            resolve();
        });
        response.data.on('error', err => {
            reject(err);
        })
    })
}

update();
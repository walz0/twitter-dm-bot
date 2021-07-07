const axios = require('axios');
const unzipper = require('unzipper');
const fs = require('fs');
const mv = require('mv');

async function getVersion() {
    let version = await axios.get(
        'https://api.github.com/repos/walz0/twitter-dm-bot/releases')
        .then((res) => {return res.data[0]['tag_name']});
    return version;
}

async function getAssets() {
    let assets = await axios.get(
        'https://api.github.com/repos/walz0/twitter-dm-bot/releases')
        .then((res) => {return res.data[0]['assets']});
    return assets;    
}

async function update() {
    let version = await getVersion();
    let os = process.platform;
    let url = 'https://github.com/walz0/twitter-dm-bot/releases/download/' + version + '/twitter-bot-' + os + '.zip';

    const path = __dirname + '/bin.zip';

    try {
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
                        fs.unlink('bin.zip', () => {
                            console.log('Update complete.');
                        });
                    });
                resolve();
            });
            response.data.on('error', err => {
                reject(err);
            })
        })
    }
    catch {
        console.log('ERROR:Your operating system is not supported.');
    }
}

update();
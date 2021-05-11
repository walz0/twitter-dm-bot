const fs = require('fs');
const puppeteer = require('puppeteer');
const {google} = require('googleapis');

const googleAuth = require('./google-auth');

const express = require('express');
const app = express();
app.use(express.urlencoded());
app.use(express.json());

// Callback from sheets data pull, start bot
function main(auth) {
	const sheets = google.sheets({version: 'v4', auth});
	sheets.spreadsheets.values.get({
		spreadsheetId: '1_WGso2jn7LRHoqj80DvQk3i-SEQnQuv3aV5ii--zew4',
		range: 'Blad1!A2:B',
	}, (err, res) => {
	if (err) {
        // If error occurred, most likely invalid_grant or invalid_credentials, reauth
        fs.unlink('./token.json', (err) => {
            if (err) throw err;
            console.log('token.json has been deleted');
            console.log('Starting the authorization process...');
            googleAuth.auth(main);
            return null;
        });		
		return console.error('The API returned an error: ' + err);
	} 

	// Parse names and links from sheet
	let users = res.data.values.map(
		(row) => [row[0], row[1]], 
		res.data.values
	);

    (async () => {
		const browser = await puppeteer.launch({ 
			executablePath: './chromium/chrome.exe',
			headless: false
		});
		const [page] = await browser.pages();
        page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36');

		// If browser closes prematurely, end node process
		browser.on('disconnected', () => {
			process.kill(process.pid, 'SIGTERM')
		})

		const port = 3000;

        // Start backend
        app.listen(port);

		// Return page with form
		app.get('/', (req, res) => {
			res.sendFile(__dirname + "\\assets\\index.html");
		});

		// Message to send
		let message = '';

		// Process form submission and get message
		app.post('/submit', async (req, res) => {
			// Keys
			let keys = Object.keys(req.body);
			// Filtered users
			let userFilter = [];
			for (var i = 0; i < keys.length; i++) {
				if (keys[i] !== 'message') {
					if (keys[i] !== 'all') {
						userFilter.push(users[parseInt(String(keys[i]))]);
					}
				}
			}
			// Assign filtered user list
			users = userFilter;
			console.log("Selected Users:", users);

			// Assign message
			message = String(req.body.message).replace(/\r?\n|\r/g, ' ');
			console.log("Message:", message);
			// Navigate to twitter
			await page.goto('https://twitter.com/login');
		});

		// Serve user list
		app.get('/users', (req, res) => {
			res.send(users);
		})

		// Launch setup page to get message input
		await page.goto(`http://localhost:${port}/`);

		page.on('domcontentloaded', async () => {
			// Get current page url
			let url = page.url();

			// If logged in successfully
			if (url == "https://twitter.com/") {
				console.log("User authenticated successfully")

				let input = 'div.DraftEditor-root';

				for (var i = 0; i < users.length; i++) {
					let link = users[i][1];
					if (link !== undefined) {
						await page.goto(link);
						await page.waitForSelector(input, {visible: true});
						await page.click(input);
						await page.type(input, message);
	
						// Send the message
						await page.click('div[data-testid=dmComposerSendButton]');
					}
					else {
						console.log(`Error, user ${users[i][0]} is missing DM link`);
					}
				}
				await browser.close();
				process.kill(process.pid, 'SIGTERM')
				console.log("Exiting application...")
			}
		});
		})();
	});
}

// Wait for user authentication before starting bot
googleAuth.auth(main);
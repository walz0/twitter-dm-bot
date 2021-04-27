const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
    const browser = await puppeteer.launch({ 
        headless: false
    });
    const page = await browser.newPage();

    // Update
    page.on('domcontentloaded', async () => {
        // Get current page url
        let url = page.url();

        // Get message to send
        let message = fs.readFileSync('./data/message.txt', 'utf8');

        // Get current set of targets
        const targets = await browser.targets();
        // Get each users dm link
        let regex = /[\r*]/g
        const links = fs.readFileSync('./data/dm_links.txt', 'utf8').replace(regex, '').split('\n');

        // Base URL for sending twitter dm
        base = "https://twitter.com/messages/compose?recipient_id=";

        // If logged in successfully
        if (url == "https://twitter.com/") {
            console.log("User authenticated successfully")

            let input = 'div.DraftEditor-root';

            for (var i = 0; i < links.length; i++) {
                await page.goto(links[i]);
                await page.waitForSelector(input, {visible: true});
                await page.click(input);
                await page.type(input, message);

                // Send the message
                await page.click('div[data-testid=dmComposerSendButton]');
            }
            await browser.close();
        }
    });

    // Initialize
    await page.goto("https://twitter.com/login");
})();

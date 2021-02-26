const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const gc = require("./gcred.json");
const fs = require('fs');

function sendMail(message, all) {
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(gc.i, gc.s, 'https://developers.google.com/oauthplayground');
    oauth2Client.setCredentials({refresh_token: gc.r});
    const accessToken = oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: "nipfjallet5@gmail.com",
            clientId: gc.i,
            clientSecret: gc.s,
            refreshToken: gc.r,
            accessToken: accessToken,
            tls: {
                rejectUnauthorized: false
            }
        }
    });

    const mailOptions = {
        from: 'nipfjalet5@gmail.com',
        to: all ? 'jolundq@gmail.com,ericmarcushjelmberg@gmail.com,marie.ivarsson@cortea.se' : 'jolundq@gmail.com,youone@live.se',
        subject: 'Nya fakturor att signera',
        text: message
    };

    console.log(mailOptions);
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

(async () => {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.setDefaultNavigationTimeout(0);

    await page.goto('https://cortea.realportal.nu/');
    page.on('console', consoleObj => console.log(consoleObj.text()));

    await page.evaluate(() => {
        document.querySelector('#top').style.display = "block";
        document.querySelector('#userPwdLoginPanel').style.visibility = "visible";
        // document.querySelector('#userPwdLoginPanel input[name="password"]').style.visibility = "visible";
        document.querySelector('#userPwdLoginPanel input[name="username"]').style.display = "block";
        document.querySelector('#userPwdLoginPanel input[name="password"]').style.display = "block";
        document.querySelector('#userPwdLoginPanel button[name="login"]').style.display = "block";
    });

    try {
        const [button] = await page.$x("//button[contains(., 'Lösenord')]");
        if (button) {

            const username = await page.$('#userPwdLoginPanel input[name="username"]');
            const password = await page.$('#userPwdLoginPanel input[name="password"]');
            const login = await page.$('#userPwdLoginPanel button[name="login"]');

            username.type('1291');
            await page.waitFor(100);
            password.type(process.argv[2]);
            await page.waitFor(100);
            await login.click();

            await page.waitFor(2000);
            await page.goto('https://cortea.realportal.nu/common/portal.php?menuid=103&pageid=140&pagesize0=20');
            //await page.goto('https://cortea.realportal.nu/common/portal.php?menuid=103&pageid=140');
            await page.waitFor(2000);
      	    await page.screenshot({path: 'screenshot.png'});

            const fakturor = await page.evaluate(() => {
                const fields = ['Lopnr','Namn','OCRFaktnr','Faktdat','Forfaller','Total','Saldo','Faktbild','Attestera'];
                const rows = Array.from(document.querySelectorAll('table.pure-table > tbody > tr'));
                const data = rows.map(r => {
                    const cells = r.childNodes;
                    const rowData = {};
                    cells.forEach((cell, index) => {
                        const content = cell.innerText;
                        rowData[fields[index]] = content;
                    });
                    return rowData
                });
                return data;
            });

            let fakturorna = JSON.parse(fs.readFileSync('fakturor.json'));

            let fakturaList = '';

            let nAdded = 0;
            fakturor.forEach((f, i) => {
                if (i > 1 && i !== fakturor.length-1) {
                    key = fakturor[i].Namn.replace(/ /g,'') + '_' + fakturor[i].Faktdat;
                    if (!(key in fakturorna)) {
                        fakturorna[key] = f;
                        console.log('adding new', key);
                        fakturaList+= `${f.Namn}, ${f.Total} kr, förfaller ${f.Forfaller}\n`;
                        nAdded++;
                    }
                }
            });

            console.log('found', fakturor);
            console.log('added', nAdded);

            fs.writeFileSync('fakturor.json', JSON.stringify(fakturorna));
            // await page.screenshot({path: 'example.png'});

            sendMail('Hej!\n\nDetta mejl genreras automatiskt då nya fakturor har upptäckts på Cortea-portalen. Följande fakturor är nya:\n\n' + fakturaList + '\nMvh Johan', nAdded > 0);
        }
    }
    catch (e) {
        console.log(e);
    }
    await browser.close();
})();

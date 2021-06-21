let CryptoJS = require('crypto-js');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const fs = require('fs');
// const gauth = require('./gauth.json');

async function sendMail(message, nAdded) {

    let gauth;
    if (gauthKey) {
        gauth = JSON.parse(CryptoJS.AES.decrypt(fs.readFileSync('../assets/enc/gauth.json.enc').toString(), CryptoJS.SHA256(gauthKey).toString()).toString(CryptoJS.enc.Utf8));
    }
    else {
        throw(new Error('missing key'));
    }

    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(gauth.fakturor.client_id, gauth.fakturor.client_secret, 'https://developers.google.com/oauthplayground');
    console.log(gauth.fakturor.client_id);
    console.log(gauth.fakturor.client_secret);
    // oauth2Client.setCredentials({refresh_token: gauth.fakturor.refresh_token});
    // oauth2Client.setCredentials({refresh_token: '1//04qMKyLNBbd-XCgYIARAAGAQSNwF-L9IrrcpHVSxczvfQFE3DTmbU3tMfFXqiFo61E8_J-v2srBVshkhTQAr2PsWOoA4cIWAU5HU'});
    // oauth2Client.setCredentials({refresh_token: '1//04zMzuR4YCj6wCgYIARAAGAQSNwF-L9Ir1NDFT61P9QwkzIXnhoNPAdjN7_p-CzLnzeUxrgEvAriaj2MWSHCvvok5p-PW5uN88Y8'});
    // oauth2Client.setCredentials({refresh_token: '1//04NK8XQFITFEbCgYIARAAGAQSNwF-L9IrD9-wxnz91E1ReSA27l7uNAZF1JYJKGasXgEPZKFViifCQ5TFwEhO1l_U11ZV33zKQoU'});
    oauth2Client.setCredentials({refresh_token: '1//04jkkfxInOR9sCgYIARAAGAQSNwF-L9Ir_0CZuL2s34N48HF-3sfnFc0sr-WGfHP9cqG_nwEM4zi-VHsprTvXeOzEejcp-jHct5A'});
    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: "nipfjallet5@gmail.com",
            clientId: gauth.fakturor.client_id,
            clientSecret: gauth.fakturor.client_secret,
            refreshToken: gauth.fakturor.refresh_token,
            accessToken: accessToken.token,
            // accessToken: 'ya29.a0AfH6SMCAmjLWF2i8H3PczgPbrBHRgxfq3lUEU-93M9MHi_ORcqOfwPbCPaMn-nBFrstnZVHuBWIoe-fXL2LqwuxIdSe4925iQeyn3nkkQOyhffCzVRh_SX-PMmlTep-NpB9OrHitXxgpwwTvuSHfOUWZ7w33',
            tls: {
                rejectUnauthorized: false
            }
        }
    });

    const mailOptions = {
        from: 'nipfjalet5@gmail.com',
        to: nAdded > 0 ? 'jolundq@gmail.com,ericmarcushjelmberg@gmail.com,marie.ivarsson@cortea.se' : 'jolundq@gmail.com,youone@live.se',
        subject: `Nya fakturor att signera (${nAdded} st)`,
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

let gauthKey = process.argv[3];

(async () => {

    // sendMail('Hej!\n\nDetta mejl genreras automatiskt då nya fakturor har upptäckts på Cortea-portalen. Följande fakturor är nya:\n\n\nMvh Johan', 0);
    // throw new Error();

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

            console.log(fakturorna);
            let nAdded = 0;
            fakturor.forEach((f, i) => {
                try {
                    if (f.Lopnr) {
                        Number.parseInt(f.Lopnr);
                        // console.log(f.Lopnr, f.Namn);
                        key = f.Lopnr + '_' + f.Namn.replace(/ /g,'') + '_' + f.Faktdat;
                        if (!(key in fakturorna)) {
                            fakturorna[key] = f;
                            console.log('adding new', key);
                            fakturaList+= `${f.Namn}, ${f.Total} kr, förfaller ${f.Forfaller}\n`;
                            nAdded++;
                        }
                    }
                }
                catch (e) {

                }
            });

            console.log('added', nAdded);

            fs.writeFileSync('fakturor.json', JSON.stringify(fakturorna));
            // await page.screenshot({path: 'example.png'});

            sendMail('Hej!\n\nDetta mejl genreras automatiskt då nya fakturor har upptäckts på Cortea-portalen. Följande fakturor är nya:\n\n' + fakturaList + '\nMvh Johan', nAdded);
        }
    }
    catch (e) {
        console.log(e);
    }
    await browser.close();
})();

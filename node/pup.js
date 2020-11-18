const puppeteer = require('puppeteer');
var nodemailer = require('nodemailer');
var fs = require('fs');

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
            password.type(process.argv[0]);
            await page.waitFor(100);
            await login.click();

            await page.waitFor(2000);
            await page.goto('https://cortea.realportal.nu/common/portal.php?menuid=103&pageid=140&pagesize0=20');
            //await page.goto('https://cortea.realportal.nu/common/portal.php?menuid=103&pageid=140');
            await page.waitFor(2000);

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

            let nAdded = 0;
            fakturor.forEach((f, i) => {
                if (i > 1 && i !== fakturor.length-1) {
                    key = fakturor[i].Namn.replace(/ /g,'') + '_' + fakturor[i].Faktdat;
                    if (!(key in fakturorna)) {
                        fakturorna[key] = f;
                        console.log('adding new', key);
                        nAdded++;
                    }
                }
            });

            console.log('added', nAdded);

            fs.writeFileSync('fakturor.json', JSON.stringify(fakturorna));
            // await page.screenshot({path: 'example.png'});
        }
    }
    catch (e) {
        console.log(e);
    }
    await browser.close();
})();

// var transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//         user: 'jolundq@gmail.com',
//         pass: '***REMOVED***'
//     }
// });
//
// var mailOptions = {
//     from: 'jolundq@gmail.com',
//     to: 'jolundq@gmail.com',
//     subject: 'Sending Email using Node.js',
//     text: 'That was easy!'
// };
//
// transporter.sendMail(mailOptions, function(error, info){
//     if (error) {
//         console.log(error);
//     } else {
//         console.log('Email sent: ' + info.response);
//     }
// });
const puppeteer = require('puppeteer');
var nodemailer = require('nodemailer');

(async () => {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();
    // await page.goto('https://cortea.realportal.nu/');
    await page.goto('file:///C:/Users/johan/Desktop/cortea.html');
    // await page.screenshot({path: 'example.png'});
    page.on('console', consoleObj => console.log(consoleObj.text()));

    await page.evaluate(() => {
        document.querySelector('#top').style.display = "block";
        document.querySelector('#userPwdLoginPanel').style.visibility = "visible";
        // document.querySelector('#userPwdLoginPanel input[name="password"]').style.visibility = "visible";
        document.querySelector('#userPwdLoginPanel input[name="username"]').style.display = "block";
        document.querySelector('#userPwdLoginPanel input[name="password"]').style.display = "block";
        document.querySelector('#userPwdLoginPanel button[name="login"]').style.display = "block";
    });
    // await page.waitForSelector('#top', {
    //     visible: true,
    // });

    try {
        const [button] = await page.$x("//button[contains(., 'Lösenord')]");
        // const button = await page.$("#loginPanel");
        if (button) {
            // await button.click();

            // console.log(button);
            // await page.waitFor(1000);

            // await page.waitForSelector('#userPwdLoginPanel', {
            //     visible: true,
            // });

            const username = await page.$('#userPwdLoginPanel input[name="username"]');
            const password = await page.$('#userPwdLoginPanel input[name="password"]');
            const login = await page.$('#userPwdLoginPanel button[name="login"]');

            // console.log(username);

            username.type('1291');
            await page.waitFor(100);
            password.type('');
            await page.waitFor(100);
            await login.click();

            // console.log(username);
            // console.log(password);
            // console.log(login);
            // await page.waitFor(1000);

            await page.waitFor(2000);
            // await page.goto('https://cortea.realportal.nu/common/portal.php?menuid=103&pageid=135');
            await page.goto('file:///C:/Users/johan/Desktop/corteafakthist.html');
            await page.waitFor(2000);

            // const table = await page.$('.pure-table');

            // const dum = await page.$$eval('table.pure-table', (element) => {
            //     return element[1].innerHTML
            // });
            // console.log(dum);


            await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.2.1.min.js' });
            const buttons = await page.evaluate(() => {
                const fields = ['Löpnr','Namn','OCRFaktnr','Faktdat','Förfaller','Total','Saldo','Faktbild','Attestera'];
                const $ = window.$; //otherwise the transpiler will rename it and won't work
                const rows = $($('table.pure-table')[1]).find('tr');
                const data = rows.get().map((row, rindex) => {
                    const cells = $(row).find('td');
                    const rowData = {};
                    cells.get().forEach((cell, index) => {
                        const content = cell.innerText;
                        rowData[fields[index]] = content;
                        // console.log(index, content);
                    });
                    return rowData
                });
                return data;
            });

            console.log(buttons);


            await page.screenshot({path: 'example.png'});

        }
    }
    catch (e) {
        console.log(e);

    }


    // const bodyHandle = await page.$('div.pull-right').first();
    // console.log(bodyHandle);

    // const test = await page.evaluate(() => {
    //     // const buttons = document.querySelector('.btn');
    //     const buttons = document.getElementsByClassName('.btn');
    //     return buttons;
    // });

    // console.log(test);

    // await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.2.1.min.js' });
    // const buttons = await page.evaluate(() => {
    //     const $ = window.$; //otherwise the transpiler will rename it and won't work
    //
    //     $('#userPwdLoginPanel').css('visibility', 'visible');
    //     return $('.btn');
    // });
    //
    // await page.screenshot({path: 'example.png'});

    //
    // console.log(buttons[0]);

    // const CONSOLE = console;
    //
    // let texts = await page.evaluate(() => {
    //     let data = [];
    //     let elements = document.getElementsByClassName('.btn');
    //     elements.
    //     return data;
    // });


    await browser.close();
})();

// var transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//         user: 'jolundq@gmail.com',
//         pass: ''
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
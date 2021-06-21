let CryptoJS = require('crypto-js');
let fs = require('fs');
const { google } = require("googleapis");
const key = process.argv.slice(2)[0];
fakturor = require("./fakturor.json");

let gauth;
if (key) {
        gauth = JSON.parse(CryptoJS.AES.decrypt(fs.readFileSync('../assets/enc/gauth.json.enc').toString(), CryptoJS.SHA256(key).toString()).toString(CryptoJS.enc.Utf8));
}
else {
        throw(new Error('missing key'));
}

const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(gauth.sheets.client_id, gauth.sheets.client_secret, 'https://developers.google.com/oauthplayground');
oauth2Client.setCredentials({refresh_token: gauth.sheets.refresh_token});

const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

return sheets.spreadsheets.values.get({
        spreadsheetId: '1QK8dYXxO-3MDVE62-sLr-GSvazQKfTO8MXngWXiKNTc',
        range: '2021',
})
    .then((data) => {
            console.log(data.data.values);

            Object.entries(fakturor)
                .sort((a,b) => a[1].Lopnr - b[1].Lopnr)
                .forEach(([n,f]) => {
                        console.log([f.Lopnr, f.Namn, f.Faktdat, f.Total.replace(' ','').replace(',00','')].join(','));
                });

    });

// return sheets.spreadsheets.create({
//     resource: {
//         properties:{ title: 'apitest' }
//     }
// });



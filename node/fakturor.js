let CryptoJS = require('crypto-js');
let fs = require('fs');
const { google } = require("googleapis");
const key = process.argv.slice(2)[0];
fakturor = require("./fakturor.json");
// let gauth = require("./gauth.json");

function getColumn(name) {
    return Object.entries(fakturor)
        .sort((a,b) => a[1].Lopnr - b[1].Lopnr)
        // .filter((f) => f[1].Faktdat.startsWith(year))
        .filter((f) => !excluded.includes(f[1].Lopnr))
        .map(([n,f]) => [f[name]]);
}

function updateColumn(colName, resource) {
    return new Promise((resolve, reject) => {
        sheets.spreadsheets.values.update({
            spreadsheetId: '1QK8dYXxO-3MDVE62-sLr-GSvazQKfTO8MXngWXiKNTc',
            range: `${sheetName}!${colName}2:${colName}`,
            valueInputOption: 'USER_ENTERED',
            resource: resource,
        }, (err, result) => {
            if (err) {
                console.log(err);
                reject(err)
            } else {
                console.log(result.data.updatedCells, 'cells updated');
                resolve(result)
            }
        });
    })
}

const year = '2021';
// const sheetName = year;
const sheetName = 'samtliga';

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

const excluded = [
    '41',  //återbetalning  av lån i Handlsbanken
    '183', //Fog & Fönster (fönsterrenovering)
    '191', //Fog & Fönster (fönsterrenovering)
    '192', //Fog & Fönster (fönsterrenovering)
    '203', //Felinmatning Cortea
    '204', //Felinmatning Cortea
];

const foretag = getColumn('Namn');
const datum = getColumn('Faktdat');
const belopp = getColumn('Total').map(value => [value[0].replace(' ','').replace(',00','')]);
const lopnr = getColumn('Lopnr');
const dayOfYear = datum.map(d => {
        return [(Math.ceil((Date.parse(d[0]) - Date.parse(`${year}-01-01`))) / (1000 * 60 * 60 * 24)).toString()];
    });

// Object.entries(fakturor)
//         .sort((a,b) => a[1].Lopnr - b[1].Lopnrhagalundrosson893607
//         .forEach(([n,f]) => {
//             console.log([f.Lopnr, f.Namn, f.Faktdat, f.Total.replace(' ','').replace(',00','')].join(','));
//         });


(async () => {

    await Promise.all([
        updateColumn('A', {values: lopnr}),
        updateColumn('B', {values: foretag}),
        updateColumn('C', {values: datum}),
        // updateColumn('C', {values: dayOfYear}),
        updateColumn('D', {values: belopp}),
    ])

    // console.log('start pause');
    // await new Promise(resolve => setTimeout(resolve, 5000));
    // console.log('end pause');

    // const sortRequest = {
    //     spreadsheetId: '1QK8dYXxO-3MDVE62-sLr-GSvazQKfTO8MXngWXiKNTc',
    //     resource: {
    //         requests: [{
    //             sortRange: {
    //                 range: {
    //                     "sheetId": 453295472,
    //                     "startRowIndex": 1,
    //                     // "endRowIndex": 10,
    //                     // "startColumnIndex": 0,
    //                     "endColumnIndex": 7
    //                 },
    //                 sortSpecs: [
    //                     {
    //                         "dimensionIndex": 1,
    //                         "sortOrder": "ASCENDING"
    //                     },
    //                     {
    //                         "dimensionIndex": 3,
    //                         "sortOrder": "ASCENDING"
    //                     }
    //                 ]
    //             }
    //         }]
    //     }
    // };
    // setTimeout(async () => {
    //     await sheets.spreadsheets.batchUpdate(sortRequest, (err, result) => {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             console.log('sorted');
    //         }
    //     });
    // }, 1000);
    //
    // const firstTotalParams = {
    //     spreadsheetId: '1QK8dYXxO-3MDVE62-sLr-GSvazQKfTO8MXngWXiKNTc',
    //     range: `${sheetName}!E2`,
    //     valueInputOption: 'USER_ENTERED',
    //     resource: {values: [['=D2']]},
    // };
    // setTimeout(async () => {
    //     await sheets.spreadsheets.values.update(firstTotalParams, (err, result) => {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             console.log(result.data.updatedCells, 'filled first total');
    //         }
    //     });
    // }, 2000);
    //
    // const totalsFillRequest = {
    //     spreadsheetId: '1QK8dYXxO-3MDVE62-sLr-GSvazQKfTO8MXngWXiKNTc',
    //     resource: {
    //         requests: [{
    //             repeatCell: {
    //                 range: {
    //                     sheetId: 453295472,
    //                     startRowIndex: 2,
    //                     endRowIndex: 100,
    //                     startColumnIndex: 4,
    //                     endColumnIndex: 5
    //                 },
    //                 cell: {
    //                     userEnteredValue: {
    //                         formulaValue: "=E2+D3"
    //                     }
    //                 },
    //                 fields: "userEnteredValue"
    //             }
    //         }]
    //     }
    // };
    // setTimeout(async () => {
    //     await sheets.spreadsheets.batchUpdate(totalsFillRequest, (err, result) => {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             console.log('filled total range');
    //         }
    //     });
    // }, 3000)

})()

// console.log(dayOfYear);
// datum.forEach(d => {
//     console.log(Math.ceil((Date.parse(d[0]) - Date.parse('2021-01-01'))) / (1000 * 60 * 60 * 24));
// })

// return sheets.spreadsheets.values.get({
//         spreadsheetId: '1QK8dYXxO-3MDVE62-sLr-GSvazQKfTO8MXngWXiKNTc',
//         range: '2021',
// })
//     .then((data) => {
//             console.log(data.data.values);
//
//             // const foretag = Object.entries(fakturor)
//             //     .sort((a,b) => a[1].Lopnr - b[1].Lopnr)
//             //     .map(([n,f]) => f.Namn);
//             // const datum = Object.entries(fakturor)
//             //     .sort((a,b) => a[1].Lopnr - b[1].Lopnr)
//             //     .map(([n,f]) => f.Faktdat);
//             // const belopp = Object.entries(fakturor)
//             //     .sort((a,b) => a[1].Lopnr - b[1].Lopnr)
//             //     .map(([n,f]) => f.Total.replace(' ','').replace(',00',''));
//             //
//             // console.log(datum);
//             //
//             // // Object.entries(fakturor)
//             // //         .sort((a,b) => a[1].Lopnr - b[1].Lopnr)
//             // //         .forEach(([n,f]) => {
//             // //             console.log([f.Lopnr, f.Namn, f.Faktdat, f.Total.replace(' ','').replace(',00','')].join(','));
//             // //         });
//             // console.log(Object.entries(fakturor).length);
//
//     });

// return sheets.spreadsheets.create({
//     resource: {
//         properties:{ title: 'apitest' }
//     }
// });




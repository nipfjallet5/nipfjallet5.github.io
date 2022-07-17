const fs = require('fs');
let CryptoJS = require('crypto-js');
const {exec} = require('child_process');
const { google } = require("googleapis");
const key = process.argv.slice(2)[0];

// let gauth;
// if (key) {
//     gauth = JSON.parse(CryptoJS.AES.decrypt(fs.readFileSync('../assets/enc/gauth.json.enc').toString(), CryptoJS.SHA256(key).toString()).toString(CryptoJS.enc.Utf8));
// }
// else {
//     throw(new Error('missing key'));
// }
// const OAuth2 = google.auth.OAuth2;
// const oauth2Client = new OAuth2(gauth.sheets.client_id, gauth.sheets.client_secret, 'https://developers.google.com/oauthplayground');
// oauth2Client.setCredentials({refresh_token: gauth.sheets.refresh_token});
// const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
//
// lagenheter = {};
//
// sheets.spreadsheets.values
//     .get({
//             spreadsheetId: '1rZ0AuyQzKWsomvxuROrI0rChnTHgKTVXwMFBKnCmYEE',
//             range: 'lägenheter!A2:N22',
//     })
//     .then((data) => {
//             console.log(data.data.values);
//     });

personer = {
    niklas: {alias: 'niklas', bgnamn: 'NIKLAS JANSSON', lght:101, inbetalningar: []},
    sofia: {alias: 'sofia', bgnamn: 'MARKUSSON SOFIA', lght:102, inbetalningar: []},
    hans: {alias: 'hans', bgnamn: 'HANS ANDERSSON', lght:111, inbetalningar: []},
    mona: {alias: 'mona', bgnamn: 'FORSGREN MONA', lght:112, inbetalningar: []},
    therese: {alias: 'therese', bgnamn: 'KARLSSON THERESE', lght:121, inbetalningar: []},
    johan: {alias: 'johan', bgnamn: 'JOHAN LUNDQVIST', lght:122, inbetalningar: []},
    pontus: {alias: 'pontus', bgnamn: 'BELING PONTUS', lght:131, inbetalningar: []},
    gunilla: {alias: 'gunilla', bgnamn: 'BRANDTLER GUNILLA', lght:132, inbetalningar: []},
    eric: {alias: 'eric', bgnamn: 'ERIC HJELMBERG', lght:201, inbetalningar: []},
    kajsa: {alias: 'kajsa', bgnamn: 'KAJSA HULTÉN', lght:211, inbetalningar: []},
    christian: {alias: 'christian', bgnamn: 'CHRISTIAN JOHANSSON', lght:212, inbetalningar: []},
    axel: {alias: 'axel', bgnamn: 'AXEL WESTIN', lght:221, inbetalningar: []},
    elin: {alias: 'elin', bgnamn: 'ALBÅGE ELIN', lght:222, inbetalningar: []},
    jacob: {alias: 'jacob', bgnamn: 'JACOB GUSTIN', lght:231, inbetalningar: []},
    niclas: {alias: 'niclas', bgnamn: 'NICLAS ÖDBRINK', lght:232, inbetalningar: []},
    sara: {alias: 'sara', bgnamn: 'SARA KIHLBERG', lght:311, inbetalningar: []},
    matilda: {alias: 'matilda', bgnamn: 'MATILDA WIDING', lght:312, inbetalningar: []},
    hampus: {alias: 'hampus', bgnamn: 'MALM HAMPUS', lght:321, inbetalningar: []},
    jorgen: {alias: 'jorgen', bgnamn: 'JÖRGEN SÖDERSTRÖM', lght:322, inbetalningar: []},
    frida: {alias: 'frida', bgnamn: 'FRIDA WESTERBERG', lght:331, inbetalningar: []},
    julia: {alias: 'julia', bgnamn: 'JULIA GJEDSTED', lght:332, inbetalningar: []}
}

// const directory = "../../../Google Drive/Nipfjället/bank/bankgiro";
// // const directory = "C:\\Users\\johlun\\Google Drive\\Nipfjället\\bank\\bankgiro";
// fs.readdir(directory, (err, files) => {
//     console.log(files);
//     files.forEach(file => {
//         if (file.endsWith('.xlsx')) {
//             // console.log(directory + '\\' + file);
//             const infile = directory.replace(' ', '\\ ') + '/' + file;
//             const id = file.split('_')[3].split('.')[0];
//             const outfile = directory.replace(' ', '\\ ') + '/bg_' + id + '.txt';
//
//             // console.log(infile);
//             // console.log(outfile);
//             console.log(`ssconvert ${infile} ${outfile}`);
//
//             exec(`ssconvert ${infile} ${outfile}`, function(error, stdout, stderr) {
//                 console.log(stderr);
//             } );
//
//             // ssconvert Bg5347-3385_Insättningsuppgifter_Detaljer_202107* test.txt
//
//         }
//     });
// });

// const directory = "../../../Google Drive/Nipfjället/bank/bankgiro";
const directory = "C:\\Users\\johlun\\Google Drive\\Nipfjället\\bank\\bankgiro";
fs.readdir(directory, (err, files) => {
    console.log(files);

    const persons = {};
    files.forEach(file => {
        if (file.startsWith('bg_')) {
            console.log(directory + '\\' + file);
            const lines = fs.readFileSync(directory + '/' + file).toString().split("\n");
            startLine = 0;
            lines.forEach((l, i) => {
                if (l.includes('Insättningar')) startLine = i + 4;
            })
            // console.log(startLine);
            for (iLine = startLine; iLine < lines.length-1; iLine+=2) {
                // console.log(iLine);
                const modLine = lines[iLine]
                    .replace('Carlstedt Westberg, Frida', 'FRIDA WESTERBERG')
                    .replace('Hjelmberg, Eric', 'ERIC HJELMBERG')
                    .replace('Widing, Matilda', 'MATILDA WIDING')
                    .replace('Sylvia Deziré Olsson', 'DEZIRE OLSSON')
                    .replace('Deziré Olsson', 'DEZIRE OLSSON')
                    .replace('Schubert, Carl', 'CARL SCHUBERT');
                const tokens = modLine.split(',');
                const fullName = tokens[0].replace('"', '').replace('"', '').toUpperCase();
                const amount = Number.parseInt(tokens[tokens.length - 3])
                console.log(fullName, ' ... ' , amount);
                // console.log(tokens);

                if (!persons[fullName]) persons[fullName] = [];
                persons[fullName].push(amount);

            }
            // console.log(lines.length);

            // const infile = directory.replace(' ', '\\ ') + '/' + file;
            // const id = file.split('_')[3].split('.')[0];
            // const outfile = directory.replace(' ', '\\ ') + '/bg_' + id + '.txt';
            //
            // // console.log(infile);
            // // console.log(outfile);
            // console.log(`ssconvert ${infile} ${outfile}`);
            //
            // exec(`ssconvert ${infile} ${outfile}`, function(error, stdout, stderr) {
            //     console.log(stderr);
            // } );
            //
            // // ssconvert Bg5347-3385_Insättningsuppgifter_Detaljer_202107* test.txt
            //
        }
    });

    console.log(persons);
    console.log(Object.keys(persons));
    console.log(Object.keys(persons).length);
    Object.keys(persons).forEach(p => {console.log(p);})

    Object.entries(persons).forEach(([name, amounts]) => {
        if (amounts.length < 20 ) console.log(amounts.length, name);
    })

});




// exec('dir "C:\\Users\\johlun\\Google Drive\\Nipfjället\\bank\\bankgiro"', function(error, stdout, stderr) {
//     console.log(stdout);
// });

// coffeeProcess.stdout.on('data', function(data) {
//     console.log(data);
// });
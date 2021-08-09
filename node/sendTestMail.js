let CryptoJS = require('crypto-js');
const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const fs = require('fs');
// let gauth = require('./gauth.json');

let gauthKey = process.argv[2];

async function sendMail(message) {

    let gauth;
    if (gauthKey) {
        gauth = JSON.parse(CryptoJS.AES.decrypt(fs.readFileSync('../assets/enc/gauth.json.enc').toString(), CryptoJS.SHA256(gauthKey).toString()).toString(CryptoJS.enc.Utf8));
    }
    else {
        throw(new Error('missing key'));
    }

    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(gauth.fakturor.client_id, gauth.fakturor.client_secret, 'https://developers.google.com/oauthplayground');
    // oauth2Client.setCredentials({refresh_token: gauth.fakturor.refresh_token});
    // oauth2Client.setCredentials({refresh_token: '1//04zMzuR4YCj6wCgYIARAAGAQSNwF-L9Ir1NDFT61P9QwkzIXnhoNPAdjN7_p-CzLnzeUxrgEvAriaj2MWSHCvvok5p-PW5uN88Y8'});
    // oauth2Client.setCredentials({refresh_token: '1//04NK8XQFITFEbCgYIARAAGAQSNwF-L9IrD9-wxnz91E1ReSA27l7uNAZF1JYJKGasXgEPZKFViifCQ5TFwEhO1l_U11ZV33zKQoU'});
    oauth2Client.setCredentials({refresh_token: '1//04jkkfxInOR9sCgYIARAAGAQSNwF-L9Ir_0CZuL2s34N48HF-3sfnFc0sr-WGfHP9cqG_nwEM4zi-VHsprTvXeOzEejcp-jHct5A'});
    const accessToken = await oauth2Client.getAccessToken();
    console.log(accessToken);

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
        to: 'jolundq@gmail.com',
        subject: 'api test',
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

sendMail('Test', 0);

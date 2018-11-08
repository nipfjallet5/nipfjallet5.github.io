'use strict';

let CryptoJS = require('crypto-js');
let fs = require('fs');

function encryptFileBase64(inFile, outFile, password) {
    let encrypted_b64 = CryptoJS.AES.encrypt(Buffer(fs.readFileSync(inFile)).toString('base64'), password);
    return fs.writeFile(outFile, encrypted_b64.toString(), (err) => {
        if (err) throw err;
        console.log('Saved!');
    });
}

function decryptFileBase64(inFile, outFile, password) {
    fs.readFile(inFile, (err, data) => {
        if (err) throw err;
        let dectrypted_b64 = CryptoJS.AES.decrypt(data.toString(), password).toString(CryptoJS.enc.Utf8);
        let bitmap = new Buffer(dectrypted_b64, 'base64');
        fs.writeFileSync(outFile, bitmap);
    });
}

function base64_encode(file) {
    let bitmap = fs.readFileSync(file);
    return new Buffer(bitmap).toString('base64');
}

function base64_decode(base64str, file) {
    let bitmap = new Buffer(base64str, 'base64');
    fs.writeFileSync(file, bitmap);
    console.log('******** File created from base64 encoded string ********');
}

let AESencrypt = function(str, key) {
    return CryptoJS.AES.encrypt(str, key);
};

let AESdecrypt = function(str, key) {
    return CryptoJS.AES.decrypt(str, key).toString(CryptoJS.enc.Utf8);
};

// // let password = 'password';
let password = CryptoJS.SHA256("password").toString();
// let crypto = AESencrypt('cleartext', password).toString();
// console.log(crypto);
// let cleartext = AESdecrypt(crypto, password);
// console.log(cleartext);

// encryptFileBase64(fileName, "stadgar.aes", password);
// decryptFileBase64("../assets/enc/data.json.enc", "test.json", password);

fs.readFile('clear/data.json', (err, data) => {
    if (err) throw err;

    let crypto = CryptoJS.AES.encrypt(data.toString(), password).toString();
    return fs.writeFile('../assets/enc/data.json.enc', crypto, (err) => {
        if (err) throw err;
        console.log('Saved!');
    });

    // let cleartext = CryptoJS.AES.decrypt(crypto, password).toString(CryptoJS.enc.Utf8);
    // console.log(cleartext);
});

// fs.readdir("clear/.", function(err, files) {
//
//     files.forEach(function(file) {
//         let outputFile = "../assets/enc/" + file + ".enc";
//         console.log(file, outputFile);
//
//         encryptFileBase64("clear/" + file, outputFile, password);
//
//     })
// });


console.log('hejsan');

// let AESencrypt = function(str, key) {
//     return CryptoJS.AES.encrypt(str, key);
// };
//
// let AESdecrypt = function(str, key) {
//     return CryptoJS.AES.decrypt(str, key).toString(CryptoJS.enc.Utf8);
// };

// function decryptFile(inFile, password) {
//     fs.readFile(inFile, (err, data) => {
//         if (err) throw err;
//         let dectrypted_b64 = CryptoJS.AES.decrypt(data.toString(), password).toString(CryptoJS.enc.Utf8);
//         console.log(dectrypted_b64);
//     });
// }

let accessToken = "U2FsdGVkX189p19Ob4DSM/9t8eIFgKOYYEKDM4ekNsC4VsMFP3pxSm7jPgao6UTwe89bkrrd2zgL+d0sISLA6jW7nc+7HUpUHw8YRxMeqPAsLGHpenmbNddMIYwNlB5N";

$('#password-1').on('keyup',function(event) {
    if ($(this).val().length === 4) {
        console.log('checking password');
        let password = CryptoJS.SHA256($(this).val()).toString();

        $.get('/assets/enc/data.json.enc', function(data) {
            let info = JSON.parse(CryptoJS.AES.decrypt(data, password).toString(CryptoJS.enc.Utf8));
            console.log(info);
            $('#debug').html(JSON.stringify(info));
        }, 'text');

        // let dropbox = new Dropbox.Dropbox({
        //     fetch: fetch,
        //     accessToken: CryptoJS.AES.decrypt(accessToken, password).toString(CryptoJS.enc.Utf8)
        // });
        //
        // dropbox.filesDownload({path: '/data.enc'})
        //     .then(function() {
        //         console.log(arguments[0].fileBlob);
        //         let reader = new FileReader();
        //         reader.onload = function() {
        //             console.log(reader.result);
        //         };
        //         reader.readAsText(arguments[0].fileBlob);
        //     }, console.error);


    }
});
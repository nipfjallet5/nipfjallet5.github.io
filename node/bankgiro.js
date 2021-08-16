const fs = require('fs');
const {exec} = require('child_process');

const directory = "../../../Google Drive/Nipfjället/bank/bankgiro";
// const directory = "C:\\Users\\johlun\\Google Drive\\Nipfjället\\bank\\bankgiro";
fs.readdir(directory, (err, files) => {
    console.log(files);
    files.forEach(file => {
        if (file.endsWith('.xlsx')) {
            // console.log(directory + '\\' + file);
            const infile = directory.replace(' ', '\\ ') + '/' + file;
            const id = file.split('_')[3].split('.')[0];
            const outfile = directory.replace(' ', '\\ ') + '/bg_' + id + '.txt';

            // console.log(infile);
            // console.log(outfile);
            console.log(`ssconvert ${infile} ${outfile}`);

            exec(`ssconvert ${infile} ${outfile}`, function(error, stdout, stderr) {
                console.log(stderr);
            } );

            // ssconvert Bg5347-3385_Insättningsuppgifter_Detaljer_202107* test.txt

        }
    });
});

// exec('dir "C:\\Users\\johlun\\Google Drive\\Nipfjället\\bank\\bankgiro"', function(error, stdout, stderr) {
//     console.log(stdout);
// });

// coffeeProcess.stdout.on('data', function(data) {
//     console.log(data);
// });
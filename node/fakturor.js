fakturor = require("./fakturor.json");

Object.entries(fakturor)
    .sort((a,b) => a[1].Lopnr - b[1].Lopnr)
    .forEach(([n,f]) => {
        console.log([f.Namn, f.Faktdat, f.Total.replace(' ','').replace(',00','')].join(','));
});

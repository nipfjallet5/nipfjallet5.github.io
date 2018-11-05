new Dropbox.Dropbox({
    fetch: fetch,
    accessToken: 'l1NK-ZXx8_AAAAAAAAAAjxQLHJDkg_JoGi-Ki7TguhOnDwp0dEvH9bVPHdUrlAVP'
})
    // .filesDelete({path: "/booking.txt"})
    // .filesUpload({path: "/booking.txt", contents: "content"})
    .filesListFolder({path: ''})
    .then(function(entries) {
        console.log(entries.entries[0].name);
    }, console.error);
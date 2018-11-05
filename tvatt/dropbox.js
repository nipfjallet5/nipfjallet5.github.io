let days = ['', 'M', 'T', 'O', 'T', 'F', 'L', 'S'];

new Dropbox.Dropbox({
    fetch: fetch,
    accessToken: 'l1NK-ZXx8_AAAAAAAAAAjxQLHJDkg_JoGi-Ki7TguhOnDwp0dEvH9bVPHdUrlAVP'
})
    // .filesDelete({path: "/booking.txt"})
    // .filesUpload({path: "/booking.txt", contents: "content"})
    .filesListFolder({path: ''})
    .then(function(entries) {
        console.log(entries.entries[0].name);
        $("#weeks").html(entries.entries[0].name);

        for (let day = 0; day <= 7; day++) {
            $("#weekgrid").append($("<div class='grid-item'>" + days[day] + "</div>"))
        }

        for (let hour = 7; hour<=22; hour++) {
            $("#weekgrid").append($("<div class='grid-item'>" + hour + "</div>"));
            for (let day = 0; day <= 6; day++) {
                $("#weekgrid").append($("<div class='grid-item'>" + "" + "</div>"))
            }
        }
    }, console.error);
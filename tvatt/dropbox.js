// This script is released to the public domain and may be used, modified and
// distributed without restrictions. Attribution not necessary but appreciated.
// Source: https://weeknumber.net/how-to/javascript

// Returns the ISO week of the date.
Date.prototype.getWeek = function() {
    let date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    let week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
        - 3 + (week1.getDay() + 6) % 7) / 7);
};

// Returns the four-digit year corresponding to the ISO week of the date.
Date.prototype.getWeekYear = function() {
    let date = new Date(this.getTime());
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    return date.getFullYear();
};

Date.prototype.getPreviousMonday = function() {
    let date = new Date(this.valueOf());
    let day = this.getDay();
    let diff = this.getDate() - day + (day === 0 ? -6:1); // adjust when day is sunday
    return new Date(date.setDate(diff));
};

Date.prototype.addDays = function(days) {
    this.setDate(this.getDate() + days);
    // let date = new Date(this.valueOf());
    // date.setDate(date.getDate() + days);
    // return date;
};

// let d = new Date('December 01, 2018 03:24:00');
// d.addDays(7);
// console.log(d, d.getWeek(), d.getWeekYear(), d.getPreviousMonday());

let currentDate = new Date();
let currentWeek = currentDate.getWeek();

$(document).ready(function() {
    $("#weekNumber").attr("value", "vecka " + currentWeek).button("refresh");
    console.log($("#weekNumber"), currentWeek);
});

let days = ['', 'M', 'T', 'O', 'T', 'F', 'L', 'S'];


$("#nextWeek").click(event => {
    currentDate.addDays(7);
    $("#weekNumber").attr("value", "vecka " + currentDate.getWeek()).button("refresh");
    console.log(currentDate);
});
$("#prevWeek").click(event => {
    currentDate.addDays(-7);
    $("#weekNumber").attr("value", "vecka " + currentDate.getWeek()).button("refresh");
    console.log(currentDate);
});
$("#weekNumber").click(event => {
    currentDate = new Date();
    $("#weekNumber").attr("value", "vecka " + currentDate.getWeek()).button("refresh");
    console.log(currentDate);
});

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
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

Date.prototype.getDayOffset = function(days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

// let d = new Date('December 01, 2018 03:24:00');
// d.addDays(7);
// console.log(d, d.getWeek(), d.getWeekYear(), d.getPreviousMonday());


let dropbox = new Dropbox.Dropbox({
    fetch: fetch,
    accessToken: 'l1NK-ZXx8_AAAAAAAAAAjxQLHJDkg_JoGi-Ki7TguhOnDwp0dEvH9bVPHdUrlAVP'
});


let getBookings = function() {

    let selectedApartment = $("#selectApartment option:selected").val();
    console.log('selectedApartment', selectedApartment);

    dropbox.filesListFolder({path: ''})
        .then(data => {
            let bookings = data.entries
                .filter(booking => booking.name.startsWith("slot_"))
                .map(booking => {
                    let bookingApartment = booking.name.split('_')[1];
                    let bookingId = booking.name.split('_').slice(2,6).join('_');
                    let bookingClass = bookingApartment === selectedApartment ? 'own-slot' : 'others-slot';
                    let bookingSlot = $("#weekgrid #" + bookingId);
                    if (bookingSlot.data()) {
                        bookingSlot.data().bookedBy = bookingApartment;
                        bookingSlot.html(bookingApartment);
                    }
                    bookingSlot.removeClass('own-slot');
                    bookingSlot.removeClass('others-slot');
                    bookingSlot.addClass(bookingClass);
                    return booking;
                });

            let duplicateBookings = bookings
                .map(booking => {
                    console.log(booking.name, booking.server_modified);
                    return booking.name.split('_').slice(2,6).join('_')
                })
                .reduce((acc, el, i, arr) => {
                    if (arr.indexOf(el) !== arr.lastIndexOf(el)) {
                        if (!acc.hasOwnProperty(el)) acc[el] = [];
                        acc[el].push(bookings[i]);
                    }
                    return acc;
                }, {});

            Object.values(duplicateBookings).map(dbs => {
               return dbs
                   .sort((a, b) => (new Date(a.server_modified) - new Date(b.server_modified)))
                   .reduce((res, db, i, array) => array.slice(1), [])
                   .map(db => {
                       console.log('deleting', db.path_lower);
                       dropbox.filesDelete({path: db.path_lower}).then(() => {
                          console.log('duplicates deleted');
                       });
                       return 0;
                   })
            });

            console.log(duplicateBookings);

        }, console.error);

    dropbox.filesDownload({path: '/tider.json'})
        .then(function() {
            console.log(arguments[0].fileBlob);
        }, console.error);
};


let currentDate = new Date();
let currentWeek = currentDate.getWeek();

let setWeek = function(weekNo) {

    let monday = currentDate.getPreviousMonday();
    console.log(monday);

    let weekGrid = $("#weekgrid");

    weekGrid.html("");
    weekGrid.append($("<div class='grid-header-item'>" + "" + "</div>"));
    for (let day = 0; day <= 6; day++) {
        let dateString = days[day] + "<br>" + monday.getDayOffset(day).getDate() + "/"+ (monday.getDayOffset(day).getMonth() + 1);
        // let dateSpan = $('span');
        weekGrid.append($("<div class='grid-header-item'>" + dateString + "</div>"))
    }

    for (let hour = 7; hour<=22; hour++) {
        weekGrid.append($("<div class='grid-item'>" + hour + "</div>"));

        for (let day = 0; day <= 6; day++) {

            let year = monday.getDayOffset(day).getFullYear();
            let month = monday.getDayOffset(day).getMonth();
            let date = monday.getDayOffset(day).getDate();

            let slotContainer = $("<div class='grid-item'>")
                .attr('id', year + '_' + month + '_' + date + '_' + hour)
                .data({
                    year: year,
                    month: month,
                    day: date,
                    hour: hour,
                    identifier: year + '' + month + '' + date + '' + hour
                })
                .click(function() {

                    let selectedApartment = $("#selectApartment option:selected").val();
                    let slotApartment = $(this).data().bookedBy;

                    let slotNameTemplate = "slot_###_" +
                        $(this).data().year + "_" +
                        $(this).data().month + "_" +
                        $(this).data().day + "_" +
                        $(this).data().hour + "_" +
                        $(this).data().identifier;
                    let slotName = slotNameTemplate.replace('###', selectedApartment);
                    // let bookingSearchQuery = slotNameTemplate.replace('###', '*');
                    let bookingSearchQuery = $(this).data().identifier;

                    console.log(slotName);

                    if (!slotApartment) {
                        console.log('booking');
                        $(this).addClass('checking-slot');
                        console.log('looking for', bookingSearchQuery);
                        dropbox.filesSearch({path: '', query: bookingSearchQuery}).then(data => {
                            console.log('found', data.matches);
                            if (data.matches.length === 0) {
                                dropbox.filesUpload({path: "/" + slotName, contents: "content"}).then(() => {
                                    $(this).html(selectedApartment);
                                    $(this).removeClass('checking-slot');
                                    $(this).addClass('own-slot');
                                    $(this).data().bookedBy = selectedApartment;
                                    console.log('booking created');
                                })
                            }
                            else {
                                console.log("slot is taken");
                                $(this).removeClass('checking-slot');
                                getBookings();
                            }
                        });

                    }
                    else if (slotApartment === selectedApartment) {
                        $(this).html('');
                        $(this).removeClass('own-slot');
                        delete $(this).data().bookedBy;
                        dropbox.filesDelete({path: "/" + slotName})
                            .then(function() {
                                console.log('booking deleted');
                            })
                    }
                    else if (slotApartment !== selectedApartment) {
                        console.log('busy');
                    }
                })
                .appendTo(weekGrid);
        }
    }
};


$(document).ready(function() {
    $("#weekNumber").attr("value", "vecka " + currentWeek).button("refresh");
    setWeek(currentWeek);
    console.log($("#weekNumber"), currentWeek);
    $("#selectApartment").change(event => {
        console.log('changing');
        getBookings();
    })
});

let days = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];

$("#nextWeek").click(event => {
    currentDate.addDays(7);
    $("#weekNumber").attr("value", "vecka " + currentDate.getWeek()).button("refresh");
    setWeek(currentDate.getWeek());
    getBookings();
    // console.log($("#selectApartment option:selected").text());
});
$("#prevWeek").click(event => {
    currentDate.addDays(-7);
    $("#weekNumber").attr("value", "vecka " + currentDate.getWeek()).button("refresh");
    setWeek(currentDate.getWeek());
    getBookings();
    // console.log(currentDate);
});
$("#weekNumber").click(event => {
    currentDate = new Date();
    $("#weekNumber").attr("value", "vecka " + currentDate.getWeek()).button("refresh");
    setWeek(currentDate.getWeek());
    getBookings();
    // console.log(currentDate);
});

getBookings();
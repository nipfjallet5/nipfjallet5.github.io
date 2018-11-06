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

let getSlots = function() {

    let selectedApartment = $("#selectApartment option:selected").val();
    console.log('selectedApartment', selectedApartment);

    dropbox.filesListFolder({path: ''})
        .then(data => {
            data.entries
                .filter(slot => slot.name.startsWith("slot_"))
                .forEach(slot => {
                    let slotApartment = slot.name.split('_')[1];
                    let slotId = slot.name.split('_').slice(2).join('_');
                    // let color = slotApartment === selectedApartment ? 'green' : 'red';
                    let slotClass = slotApartment === selectedApartment ? 'own-slot' : 'others-slot';
                    let slotContainer = $("#weekgrid #" + slotId);
                    // console.log(slotContainer.length);
                    if (slotContainer.data()) {
                        slotContainer.data().bookedBy = slotApartment;
                        slotContainer.html(slotApartment);
                    }
                    slotContainer.removeClass('own-slot');
                    slotContainer.removeClass('others-slot');
                    slotContainer.addClass(slotClass);
                });

            console.log(data.entries);
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

            let slotContainer = $("<div class='grid-item'>")
                .attr('id',
                    monday.getDayOffset(day).getFullYear() + '_' +
                    monday.getDayOffset(day).getMonth() + '_' +
                    monday.getDayOffset(day).getDate() + '_' +
                    hour
                )
                .data({
                    year: monday.getDayOffset(day).getFullYear(),
                    month: monday.getDayOffset(day).getMonth(),
                    day: monday.getDayOffset(day).getDate(),
                    hour: hour,
                })
                .click(function() {

                    let selectedApartment = $("#selectApartment option:selected").val();
                    let slotApartment = $(this).data().bookedBy;

                    let slotName = "slot_" +
                        selectedApartment + "_" +
                        $(this).data().year + "_" +
                        $(this).data().month + "_" +
                        $(this).data().day + "_" +
                        $(this).data().hour;
                    console.log(slotName);

                    if (!slotApartment) {
                        console.log('booking');
                        $(this).html(selectedApartment);
                        $(this).addClass('own-slot');
                        $(this).data().bookedBy = selectedApartment;
                        dropbox.filesUpload({path: "/" + slotName, contents: "content"})
                            .then(function() {
                                console.log('slot created');
                            })
                    }
                    else if (slotApartment === selectedApartment) {
                        console.log('canceling');
                        $(this).html('');
                        $(this).removeClass('own-slot');
                        delete $(this).data().bookedBy;
                        dropbox.filesDelete({path: "/" + slotName})
                            .then(function() {
                                console.log('slot deleted');
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
        getSlots();
    })
});

let days = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];

$("#nextWeek").click(event => {
    currentDate.addDays(7);
    $("#weekNumber").attr("value", "vecka " + currentDate.getWeek()).button("refresh");
    setWeek(currentDate.getWeek());
    getSlots();
    // console.log($("#selectApartment option:selected").text());
});
$("#prevWeek").click(event => {
    currentDate.addDays(-7);
    $("#weekNumber").attr("value", "vecka " + currentDate.getWeek()).button("refresh");
    setWeek(currentDate.getWeek());
    getSlots();
    // console.log(currentDate);
});
$("#weekNumber").click(event => {
    currentDate = new Date();
    $("#weekNumber").attr("value", "vecka " + currentDate.getWeek()).button("refresh");
    setWeek(currentDate.getWeek());
    getSlots();
    // console.log(currentDate);
});

getSlots();
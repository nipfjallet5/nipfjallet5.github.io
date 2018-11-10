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

function hideKeyboard(element) {
    element.attr('readonly', 'readonly'); // Force keyboard to hide on input field.
    element.attr('disabled', 'true'); // Force keyboard to hide on textarea field.
    setTimeout(function() {
        element.blur();  //actually close the keyboard
        // Remove readonly attribute after keyboard is hidden.
        element.removeAttr('readonly');
        element.removeAttr('disabled');
    }, 100);
}

class WeekSelector extends HTMLElement {
    constructor() {
        super();
        let template = document.createElement('template');
        template.innerHTML = `
            <!--<style>-->
                <!--#headerSelected {-->
                     <!--background-color: #ddd;-->
                <!--}-->
            <!--</style>-->
            <input class="headerButton" id="header" type="button">
            <div class="ui-grid-b">
                <div class="ui-block-a"><input class="weekSelectButton" id="previous" type="button" value="förra"></div>
                <div class="ui-block-b"><input class="weekSelectButton" id="current" type="button" value="denna"></div>
                <div class="ui-block-c"><input class="weekSelectButton" id="next" type="button" value="nästa"></div>
            </div>
        `;
        // this.attachShadow({mode: 'open'}).appendChild(template.content.cloneNode(true));
        this.appendChild(template.content.cloneNode(true));
        console.log('WeekSelector constructed');

        this.currentDate = new Date();
        this.currentWeek = this.currentDate.getWeek();
    }

    connectedCallback() {
        console.log('WeekSelector connected');

        let apartmentHeader = $('week-selector #header')
            .attr('value', localStorage.getItem('apartment') + ' ' + localStorage.getItem('name'))
            .button()
            .click(event => {
                localStorage.clear();
                location.reload();
            });

        // let delay;
        // apartmentHeader[0].addEventListener('mousedown', function (e) {
        //     delay = setTimeout(() => {
        //         console.log('press detected');
        //         localStorage.clear();
        //         location.reload();
        //         }, 100);
        // }, true);
        // apartmentHeader[0].addEventListener('mouseup', function (e) {
        //     clearTimeout(delay);
        // });
        // apartmentHeader[0].addEventListener('mouseout', function (e) {
        //     clearTimeout(delay);
        // });

        $('.weekSelectButton').button();

        $('.weekSelectButton#previous').click(event => {
            this.shiftDays(-7);
            $(this).trigger('setWeek', {weekNo: this.currentWeek, mondayDate: this.currentDate.getPreviousMonday()});
        });
        $('.weekSelectButton#current').click(event => {
            this.shiftDays(0);
            $(this).trigger('setWeek', {weekNo: this.currentWeek, mondayDate: this.currentDate.getPreviousMonday()});
        });
        $('.weekSelectButton#next').click(event => {
            this.shiftDays(7);
            $(this).trigger('setWeek', {weekNo: this.currentWeek, mondayDate: this.currentDate.getPreviousMonday()});
        });
    }

    setDate(date) {
        this.currentDate = date;
        this.currentWeek = this.currentDate.getWeek();
        $(this).trigger('setWeek', {weekNo: this.currentWeek, mondayDate: this.currentDate.getPreviousMonday()});
    }

    shiftDays(nDays) {
        if (nDays !== 0) this.currentDate.addDays(nDays);
        else this.currentDate = new Date();
        this.currentWeek = this.currentDate.getWeek();
    }
}
window.customElements.define('week-selector', WeekSelector);

class WeekSchedule extends HTMLElement {

    constructor() {
        super();
        let template = document.createElement('template');
        template.innerHTML = `
            <style>
                #grid-container {
                    display: grid;
                    grid-template-columns: repeat(8, 1fr);
                }
                .date-header-element {
                    font-weight: bold;
                    text-align: center;
                }
                .day-element {
                }
                .date-element {
                    font-size: 10px;
                }
            </style>
            <div id="grid-container">
        `;
        // this.attachShadow({mode: 'open'}).appendChild(template.content.cloneNode(true));
        this.appendChild(template.content.cloneNode(true));
        console.log('WeekSelector constructed');

    }

    connectedCallback() {
        this.weekGrid = $('#grid-container')

    }

    setWeek(weekInfo) {
        console.log('loading week', weekInfo);

        let days = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];

        this.weekGrid.html("");
        this.weekGrid.append($("<div>").attr('id', 'weekNumberElement').addClass('date-header-element').html('v.' + weekInfo.weekNo));

        for (let day = 0; day <= 6; day++) {
            let dayElement = $('<div>')
                .addClass('day-element')
                .html(days[day]);
            let dateElement = $('<div>')
                .addClass('date-element')
                .html(weekInfo.mondayDate.getDayOffset(day).getDate() + "/"+ (weekInfo.mondayDate.getDayOffset(day).getMonth() + 1));
            this.weekGrid.append($('<div>').addClass('date-header-element').append(dayElement).append(dateElement));
        }



    }
}
window.customElements.define('week-schedule', WeekSchedule);

let loadApp = function(){

    let content = $('#content');
    content.html('');

    let weekSelector = $(new WeekSelector());
    let weekSchedule = $(new WeekSchedule());

    weekSelector.on('setWeek', (event, weekInfo) => {
        // console.log('hej');
        weekSchedule[0].setWeek(weekInfo);
    });

    content.append(weekSelector);
    content.append(weekSchedule);

    weekSelector[0].setDate((new Date()))

};

let accessToken = "U2FsdGVkX189p19Ob4DSM/9t8eIFgKOYYEKDM4ekNsC4VsMFP3pxSm7jPgao6UTwe89bkrrd2zgL+d0sISLA6jW7nc+7HUpUHw8YRxMeqPAsLGHpenmbNddMIYwNlB5N";

let loadApartments = function(password) {
    $.get('/assets/enc/data.json.enc', data => {
        try {
            let info = JSON.parse(CryptoJS.AES.decrypt(data, password).toString(CryptoJS.enc.Utf8));

            hideKeyboard($(this));

            Object.entries(info.apartments).map(([apartmentNumber, name]) => {
                console.log(apartmentNumber, name);

                $('<input type="button">')
                    .attr('value', apartmentNumber + '. ' + name)
                    .appendTo($('#content'))
                    .button({
                        mini: true
                    }).button('refresh')
                    .click(event => {
                        console.log('selecting', apartmentNumber + '. ' + name);

                        localStorage.setItem('apartment', apartmentNumber);
                        localStorage.setItem('name', name);
                        localStorage.setItem('dbtoken', CryptoJS.AES.decrypt(accessToken, password).toString(CryptoJS.enc.Utf8));

                        console.log(localStorage);

                        loadApp();
                    })
                    .parent().each((index,item) => {
                        $(item).addClass('apartment-selector');
                    });
            });
        }
        catch (e) {
        }
    }, 'text');
};

$(document).ready(function(){

    if (localStorage.length === 0) {
        // let password = CryptoJS.SHA256('password').toString();
        // loadApartments(password);
    }
    else {
        loadApp();
    }

});

$('#password').on('keyup',function(event) {
    if ($(this).val().length === 4) {
        console.log('checking password', this);

        let password = CryptoJS.SHA256($(this).val()).toString();
        loadApartments(password);

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
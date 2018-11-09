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
            <!--</style>-->
            <div class="ui-grid-b">
                <div class="ui-block-a"><input class="weekSelectButton" id="previous" type="button" value="förra"></div>
                <div class="ui-block-b"><input class="weekSelectButton" id="current" type="button" value="denna"></div>
                <div class="ui-block-c"><input class="weekSelectButton" id="next" type="button" value="nästa"></div>
            </div>
        `;
        // this.attachShadow({mode: 'open'}).appendChild(template.content.cloneNode(true));
        this.appendChild(template.content.cloneNode(true));
        console.log('WeekSelector constructed');
    }

    connectedCallback() {
        console.log('WeekSelector connected');
        $('.weekSelectButton').button().button('refresh');
        $('.weekSelectButton#previous').click(event => {console.log('previous week');});
        $('.weekSelectButton#current').click(event => {console.log('current week');});
        $('.weekSelectButton#next').click(event => {console.log('next week');});
    }
}

customElements.define('week-selector', WeekSelector);


let accessToken = "U2FsdGVkX189p19Ob4DSM/9t8eIFgKOYYEKDM4ekNsC4VsMFP3pxSm7jPgao6UTwe89bkrrd2zgL+d0sISLA6jW7nc+7HUpUHw8YRxMeqPAsLGHpenmbNddMIYwNlB5N";


// $(document).ready(function(){
//
//     // let password = CryptoJS.SHA256('password').toString();
//
//     $.get('/assets/enc/data.json.enc', data => {
//         try {
//             let info = JSON.parse(CryptoJS.AES.decrypt(data, password).toString(CryptoJS.enc.Utf8));
//
//             hideKeyboard($(this));
//
//             let content = $('#content');
//
//             Object.entries(info.apartments).map(([apartmentNumber, name]) => {
//                 console.log(apartmentNumber, name);
//
//                 let apartmentButton = $('<input type="button">')
//                     .attr('value', apartmentNumber + '. ' + name)
//                     .appendTo(content)
//                     .button({
//                         mini: true
//                     }).button('refresh')
//                     .click(event => {
//                         console.log('selecting', apartmentNumber + '. ' + name);
//                         localStorage.setItem('apartment', apartmentNumber);
//                         content.html('');
//                         // let ws = new WeekSelector();
//                         content.append($(new WeekSelector()));
//                         // content.page('refresh', true);
//                     })
//                     .parent().each((index,item) => {
//                         $(item).addClass('apartment-selector');
//                     });
//             });
//         }
//         catch (e) {
//         }
//     }, 'text');
//
//
// });

$('#password').on('keyup',function(event) {
    if ($(this).val().length === 4) {
        console.log('checking password', this);
        let password = CryptoJS.SHA256($(this).val()).toString();

        $.get('/assets/enc/data.json.enc', data => {
            try {
                let info = JSON.parse(CryptoJS.AES.decrypt(data, password).toString(CryptoJS.enc.Utf8));

                hideKeyboard($(this));

                let content = $('#content');

                Object.entries(info.apartments).map(([apartmentNumber, name]) => {
                    console.log(apartmentNumber, name);

                    let apartmentButton = $('<input type="button">')
                        .attr('value', apartmentNumber + '. ' + name)
                        .appendTo(content)
                        .button({
                            mini: true
                        }).button('refresh')
                        .parent().each((index,item) => {
                            $(item).addClass('apartment-selector');
                        })
                        .click(event => {
                            console.log('selecting', apartmentNumber + '. ' + name);
                            localStorage.setItem('apartment', apartmentNumber);
                            content.html('');
                            // let ws = new WeekSelector();
                            content.append($(new WeekSelector()));
                            // content.page('refresh', true);
                        });
                });
            }
            catch (e) {
            }
        }, 'text');


        // $.get('/assets/enc/data.json.enc', function(data) {
        //     let info = JSON.parse(CryptoJS.AES.decrypt(data, password).toString(CryptoJS.enc.Utf8));
        //     console.log(info);
        //     $('#debug').html(JSON.stringify(info));
        //
        //
        // }, 'text');

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
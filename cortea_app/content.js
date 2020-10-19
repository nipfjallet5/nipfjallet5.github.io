// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.text === 'report_back') {
        // Call the specified callback, passing
        // the web-page's DOM content as argument
        sendResponse(document.all[0].outerHTML);
        $('.pure-table > tbody > tr').each((itr, tr) => {
            // console.log(index, $(ui));
            $(tr).find('td').each((itd, td) => {
                console.log($(td).html());

            })

        })
    }
});
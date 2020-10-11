// listen for sendMessage() from content script
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(request.mediaTitle);
        sendSearchRequest(request.mediaTitle);
    });

chrome.webNavigation.onHistoryStateUpdated.addListener(function () {
    console.log("HistoryChanged");
    sendHistoryChangedMessage();
});

function sendRequest() {

    const url = "https://www.imdb.com" + extractMediaUrl(this.responseText);

    const xhr = new XMLHttpRequest();
    xhr.addEventListener("load", extractRatingValue);
    xhr.open("GET", url);
    xhr.send(null);

}

function sendSearchRequest(mediaTitle) {

    var url = "https://www.imdb.com/find?ref_=nv_sr_fn&q=" +
        cleanMediaTitle(mediaTitle) + "&s=all";

    console.log(url);

    const xhr = new XMLHttpRequest();
    xhr.addEventListener("load", sendRequest);
    xhr.open("GET", url);
    xhr.send(null);

}

function extractMediaUrl(responseText) {
    var parser = new DOMParser();
    var dummyDocument = parser.parseFromString(responseText, 'text/html');
    var mediaElement = dummyDocument.getElementsByClassName('result_text')[0];
    var mediaUrl = mediaElement.getElementsByTagName('a')[0].getAttribute('href');

    return mediaUrl;
}

function extractRatingValue() {
    // Extract rating
    var parser = new DOMParser();
    var dummyDocument = parser.parseFromString(this.responseText, 'text/html');
    var spanElements = dummyDocument.getElementsByTagName("span");
    var ratingValue = "";
    for (const span of spanElements) {
        if (span.hasAttribute("itemprop") && span.getAttribute('itemprop') == "ratingValue") {
            ratingValue = span.innerText;
        }
    }

    sendRatingValueMessage(ratingValue);
}

function cleanMediaTitle(mediaTitle) {

    return mediaTitle.replace(/\s/g, "+");

}

function sendHistoryChangedMessage() {
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, function (tabs) {
        for (var tab of tabs) {
            chrome.tabs.sendMessage(tab.id, { stateChanged: "state changed" });
        }
    });
}

function sendRatingValueMessage(ratingValue) {

    console.log("rating bg: " + ratingValue);

    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, function (tabs) {
        for (var tab of tabs) {
            chrome.tabs.sendMessage(tab.id, { "rating": formatRating(ratingValue) });
        }
    });

}

function formatRating(rawRating) {
    return rawRating.replace(/,/g, '.');
}
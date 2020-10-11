window.onload = function () {
    // // Find elements to observe (class: jawBoneContent)
    // var elementsToObserve = document.getElementsByClassName("jawBoneContent");

    // // Get the element that got trigerred
    // var callback = function (mutationList, observer) {

    //     var mediaTitle = "";
    //     for (var mutation of mutationList) {
    //         if (mutation.type == 'childList') {
    //             console.log('A child node has been added or removed.');
    //             mediaTitle = mutation.target.getElementsByClassName("logo")[0].getAttribute("alt");
    //         }
    //     }

    //     // Send the extractd media name
    //     chrome.runtime.sendMessage({ "mediaTitle": mediaTitle }
    //     );        
    // }

    // // Handle observer
    // var observerList = [];
    // var config = { attributes: true, childList: true };
    // for (const elementToObserve of elementsToObserve) {
    //     const observer = new MutationObserver(callback);
    //     observer.observe(elementToObserve, config);

    //     observerList.push(observer);
    // }
};

// Receive the rating from background script
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        if (typeof request.stateChanged !== 'undefined') {

            // Handle messages for historyChanged
            console.log(request.stateChanged);
            // Check if request for rating is neccessary, i.e. user opened media
            if (shouldSendRequestForRating()) {
                console.log("should send!");
                // Get the media title
                const titleContainer = document.getElementsByClassName("previewModal--player-titleTreatment-logo")[0];
                const mediaTitle = titleContainer.getAttribute("alt");
                chrome.runtime.sendMessage({"mediaTitle": mediaTitle}
                );

            } else {
                console.log("should not send");
            }

        } else if (typeof request.rating !== 'undefined') {

            const ratingValue = request.rating;
            console.log("received rating: " + ratingValue);
            // Inject the received rating into the page
            const videoMetadataElement = document.getElementsByClassName("videoMetadata--second-line")[0];

            // Create element that displays the received rating
            const ratingElement = document.createElement('span');
            ratingElement.className = "imdb-rating";
            ratingElement.innerText = "IMDb " + ratingValue;
            ratingElement.style.border = "none";
            ratingElement.style.marginLeft = "0.5em";

            videoMetadataElement.parentNode.appendChild(ratingElement);

        }
    });

function shouldSendRequestForRating() {

    const url = document.location.href;
    console.log("url: " + url);
    const patternMatch = "jbv=";

    if (url.indexOf(patternMatch) != -1) {
        return true;
    } else {
        return false;
    }
}


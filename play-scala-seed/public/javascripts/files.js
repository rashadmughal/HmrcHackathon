/**
 * Description: File retrieval from FileAPI for file upload functionality.
 * Last update: 2017/07/17
 * Author: David Birchall <david.birchall@digital.hmrc.gov.uk>
 *
 */

HMRC.files = (function() {

    function init() {
        subscriptions();
    }

    function subscriptions() {
        events.on('drop', handleEvent.bind(this));
    }

    function handleEvent(data) {
        var files = getFiles(data.fileEvent);
        var filesArr = buildFilesArr(files);
        events.emit("files", filesArr);
    }

    function getFiles(event) {
        var files;
        if(event.originalEvent.dataTransfer) {
            files = event.originalEvent.dataTransfer.files;
        } else if(event.target) {
            files = event.target.files;
        }
        return files;
    }

    function buildFilesArr(files) {
        var filesArr = [];
        for(var prop in files) {
            if(files.hasOwnProperty(prop) || (!!navigator.userAgent.match(/Trident\/7\./) && typeof files[prop] === "object")) {
                filesArr.push(files[prop]);
            }
        }
        return filesArr;
    }

    return {
        init: init,

        // Exposed for test
        getFiles: getFiles,
        buildFilesArr: buildFilesArr,
        handleEvent: handleEvent
    }

})();
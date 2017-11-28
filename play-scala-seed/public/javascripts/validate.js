/**
 * Description: File type and size validation.
 * Last update: 2017/07/05
 * Author: David Birchall <david.birchall@digital.hmrc.gov.uk>
 *
 */

HMRC.validation = (function() {

    var files;

    var msgs = {
        size : 'You chose a document that’s larger than 10GB',
        type : "You chose a document with the extension .exe",
        both: "You chose a document that's larger than 10GB and with the extension .exe"
    };

    var types = {
        size: 'File too large ',
        type: 'File not allowed (.exe)',
        both: 'File too large and not allowed (.exe)'
    };

    function init() {
        watch();
    }

    function watch() {
        events.on('model', getData.bind(this))
        events.on('upload', validateFiles.bind(this))
    }

    function validateFiles() {
        validate(files);
    }

    function validate(files) {

        // reset errors
        var messages = {
            size: '',
            type: ''
        }

        files.forEach(function(file) {
            var ext = getExtension(file.name);

            if (file.size >= 10000000000 && ext === 'exe') {
                // file
                file.state = ERROR;
                file.message = types.both;
                file.notificationMessage = msgs.both;

                // collection
                messages.size = msgs.size;
                messages.type = msgs.type;
            } else if (ext === 'exe') {
                // file
                file.state = ERROR;
                file.message = types.type;
                file.notificationMessage = msgs.type;
                // collection
                messages.type = msgs.type;
                // 10gb
            } else if (file.size >= 10000000000) {
                // file
                file.state = ERROR;
                file.message = types.size + ' ' + formatBytes(file.size);
                file.notificationMessage = msgs.size;

                // collection
                messages.size = msgs.size;
            } else {
                // file
                file.state = PENDING;
                file.message = 'Ready to upload';
            }
        }, this);

        var status = 3;
        if(files.length <= 0) {
            status = 0;
        }
        else if(files.length > 0 && messages.size.length > 0 || messages.type.length > 0) {
            status = 1;
        }


        if (typeof event != 'undefined' && event.target.className === 'delete') {
            status = 2;
            events.emit('validated', {'files': files, 'messages': messages, 'appState': status});
        } else {
            events.emit('validated', {'files': files, 'messages': messages, 'appState': status});
        }
    }

    function getData(data) {
        files = data.files;
    }

    function getExtension(file) {
        var filename = file.toLowerCase();
        var parts = filename.split('.');
        return parts[parts.length - 1];
    }

    function formatBytes(bytes,decimals) {
       if(bytes === 0) return '0 Bytes';
       var k = 1000,
           dm = decimals || 2,
           sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
           i = Math.floor(Math.log(bytes) / Math.log(k));
       return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    return {
        init: init,

        // Exposed for testing
        formatBytes: formatBytes,
        getExtension: getExtension,
        validate: validate
    }

})();
/**
 * Description: File upload using ajax and form object.
 * Last update: 2017/07/17
 * Author: David Birchall <david.birchall@digital.hmrc.gov.uk>
 *
 */

HMRC.upload = (function() {

    var requests = [],
        modelData = {},
        cancelled = '';

    function init() {
        watch();
    }

    function watch() {
        events.on('model', files.bind(this));
        events.on('validated', upload.bind(this));
        events.on('cancelled', cancel.bind(this));
    }

    function files(obj) {
        modelData = obj.files;
    }

    function upload(obj) {
        if(obj.appState === 3) {
            obj.files.forEach(function(file) {
                file.state = 3;
            }, this);

            events.emit('sending', { 'files': modelData});

            formData(modelData)
        } else {
            return;
        }
    }

    function formData(files) {
        var formObj = [];

        jQuery.each(files, function(i, file) {
            var obj = new FormData();
                obj.append('file-' + i, file);
                formObj.push([obj, file.uid]);
        });

        ajax(modelData, formObj);
    }

    function getSnr(url) {
        var url_parts = url.replace(/\/\s*$/,'').split('/');
        url_parts.shift();
        return url_parts[url_parts.length - 1];
    }

    function cancel(uid) {
        function withId(r) {
            return r.uniqueId === uid;
        }
        cancelled = uid;
        requests.find(withId).abort()
    }

    function ajax(modelData, formObj) {

        requests = [];
        formObj.forEach(function(item) {

            var fileFormData = item[0];
            var fileUid = item[1];

            var xhr = $.ajax({
                url: "/zuul/sdes/upload",
                enctype: 'multipart/form-data',
                type: 'POST',
                data: fileFormData,
                cache: false,
                contentType: false,
                processData: false,
                success: function(data, status, jqXHR) {
                    modelData.map(updateState(jqXHR.uniqueId, SUCCESS));

                    events.emit('success', {'files': modelData, 'appState': 3});
                    events.emit('notify', {'title': 'File upload successful',
                        'options': {'body': 'Completed uploading file: ' + modelData.find(findWithId(jqXHR)).name}});
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if(textStatus === 'abort') {
                        modelData.map(updateState(jqXHR.uniqueId, FAILED));
                        modelData.map(updateState(cancelled, CANCELLED));
                    } else {
                        modelData.map(updateState(jqXHR.uniqueId, FAILED));
                        modelData.map(setMessage(jqXHR, 'Failed to upload '));

                        events.emit('notify', { 'title': 'File upload failed',
                            'options': {'body': 'Failed to upload file: ' + modelData.find(findWithId(jqXHR)).name}});
                    }
                    events.emit('failed', {'files': modelData, 'appState': 3});
                },
            })

            xhr.uniqueId = fileUid;
            requests.push(xhr);
        }, this);


        function findWithId(jqXHR) {
            return function findFile(md) {
                return md.uid === jqXHR.uniqueId
            };
        }

        function updateState(id, status) {
            return function setAs(md) {
                if(md.uid === id) {
                    return md.state = status;
                } else return md;
            };
        }

        function setMessage(jqXHR, msg) {
            return function setAs(md) {
                if(md.uid === jqXHR.uniqueId) {
                    return md.message = msg + md.name;
                } else return md;
            };
        }

       }

    return {
        init: init,

        // Exposed for testing
        upload: upload,
        formData: formData,
        getSnr: getSnr,
        ajax: ajax
    }

})();

$(function () {
  $(document).ajaxSend(function(e, xhr, options) {
    xhr.setRequestHeader('X-CSRF-TOKEN', $("input[name=_csrf]" ).val());
  });
});

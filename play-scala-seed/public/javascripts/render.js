/**
 * Description: Dom manipulation and page rendering.
 * Last update: 2017/07/17
 * Author: David Birchall <david.birchall@digital.hmrc.gov.uk>
 *
 */

HMRC.render = (function() {

    function init() {
        cacheDom();
        watch();
    }

    function cacheDom() {
        $container = $('#table');
        $dropContainer = $('#dragandrop');
        $restrictions = $('#upload--restrictions');
        $links = $container.find('.link');
        $input = $('#file');
        $state3 = $('.js-state-3');
    }

    function watch() {
        events.on('model', buildUI.bind(this));
    }

    function buildUI(data) {
        cacheDom();
        removeLinks();

        var status = data.appState,
            frag = document.createDocumentFragment();

        switch(data.appState) {
            case 1:
                updateTitle(data.files, 'Upload Documents');

                if(data.messages.size.length > 0 || data.messages.type.length > 0) {
                    frag.appendChild(buildMessage(data));
                }
                frag.appendChild(buildTable(data));
                frag.appendChild(buildUploadLink());
                if(data.files.length === 0) {
                    var emptyFrag = document.createDocumentFragment();
                    frag = emptyFrag;
                    frag.appendChild(buildResetLink(data));
                    frag.appendChild(buildBackLink());
                }
                render(frag);
                break;
            case 2:
                updateTitle(data.files, 'Upload Documents');

                if(data.messages.size.length > 0 || data.messages.type.length > 0) {
                    frag.appendChild(buildMessage(data));
                }
                frag.appendChild(buildTable(data));
                frag.appendChild(buildUploadLink());
                if(data.files.length === 0) {
                    var emptyFrag = document.createDocumentFragment();
                    frag = emptyFrag;
                    frag.appendChild(buildResetLink(data));
                    frag.appendChild(buildBackLink());
                }
                render(frag);
                break;
            case 3:
                $('#page-title').text('Your documents are uploading');

                $state3.show();
                $dropContainer.hide();
                $restrictions.hide();

                var noCancellations = data.files.filter(cancelled);

                if (noCancellations.length > 0) {
                    updateTitle(noCancellations, 'Your documents are uploading');
                }

                if(!data.files.some(progress)) {
                  if(data.files.some(failed)) {
                     updateTitle(data.files, 'Some of your documents didn\'t upload');
                     frag.appendChild(buildMessage(data));
                  }
                  else if (data.files.filter(success).length) {
                     updateTitle(data.files, 'Uploaded documents');
                     frag.appendChild(buildNotification(data));
                  }
                }

                frag.appendChild(buildTable(data));
                frag.appendChild(buildResetLink(data));
                frag.appendChild(buildBackLink());
                if(data.files.length === 0) {
                    var emptyFrag = document.createDocumentFragment();
                    frag = emptyFrag;
                    frag.appendChild(buildBackLink());
                }
                render(frag);
                break;
            default:
                updateTitle(data.files, "Upload Documents");
                $restrictions.show();
                frag.appendChild(buildTable(data));
                frag.appendChild(buildUploadLink());
                $dropContainer.show();
                if(data.files.length === 0) {
                    var emptyFrag = document.createDocumentFragment();
                    frag = emptyFrag;
                }
                render(frag);
        }

    }

    function render(frag) {
        if($container.children().length > 0) {
            $container.empty();
            $container.append(frag);
        } else {
            $container.append(frag);
        }
    }

    function removeLinks() {
        if($links.length > 0) {
            $links.forEach(function() {
                removeEventListener('click', this.clicked, true);
            }, this);
        }
    }

    function progress(element, index, array) {
        return element.state === IN_PROGRESS
    }

    function failed(element, index, array) {
        return element.state === FAILED
    }

    function success(element, index, array) {
        return element.state === SUCCESS
    }

    function error(element, index, array) {
        return element.state === ERROR
    }

    function cancelled(element, index, array) {
        return element.state === CANCELLED
    }

    function updateTitle(data, defaultMessage){
        if (data.every(success) && data.some(success)) {
            $('#page-title').text('Uploaded Documents');
        } else if (data.some(error) || data.some(failed)) {
            $('#page-title').text('Some of your documents didn\'t upload');
        } else if (data.length ===0) {
            $('#page-title').text('Upload Documents');
        }else {
            $('#page-title').text(defaultMessage);
        }
    }

    function buildTable(data) {
        var frag = document.createDocumentFragment(),
            table = document.createElement('table');

        table.appendChild(buildHeadings(data));
        table.appendChild(buildBody(data));
        frag.appendChild(table);
        return frag;
    }

    function buildHeadings(data) {
        var thead = document.createElement('thead'),
            headRow = document.createElement('tr'),
            fileTitle = document.createElement('th'),
            statusTitle = document.createElement('th'),
            actionTitle = document.createElement('th');

        fileTitle.innerHTML = 'Your selected files';
        statusTitle.innerHTML = 'Status';
        actionTitle.innerHTML = '';

        if(data.appState === 0) {
            statusTitle.innerHTML = 'Size';
        }

        if(data.appState === 3) {
            fileTitle.innerHTML = 'File name'
        }

        headRow.appendChild(fileTitle);
        headRow.appendChild(statusTitle);
        headRow.appendChild(actionTitle);
        thead.appendChild(headRow);

        return thead;
    }

    function buildBody(data) {

        var tbody = document.createElement('tbody');

        data.files.forEach(function(file, index) {
            var row = document.createElement('tr'),
                name = document.createElement('td'),
                status = document.createElement('td'),
                remove = document.createElement('td');

            switch(file.state) {
                case ERROR:
                    var link = document.createElement('a');
                    name.innerHTML = file.name;
                    name.className = 'error';
                    status.innerHTML = file.message;
                    status.className = 'error-field';
                    status.setAttribute('name', 'validation-error');
                    link.innerHTML = 'Delete';
                    link.addEventListener('click', removeLink, true);
                    link.setAttribute('data-file', index);
                    link.className = 'delete';
                    link.id = 'delete-' + file.name;
                    remove.appendChild(link);
                    break;
                case PENDING:
                    var link = document.createElement('a');
                    name.innerHTML = file.name;
                    status.innerHTML = data.status[PENDING];
                    link.innerHTML = 'Delete';
                    link.addEventListener('click', removeLink, true);
                    link.setAttribute('data-file', index);
                    link.className = 'delete';
                    link.id = 'delete-' + file.name;
                    remove.appendChild(link);
                    break;
                case IN_PROGRESS:
                    var link = document.createElement('a');
                    name.innerHTML = file.name;
                    status.innerHTML = data.status[IN_PROGRESS];
                    link.innerHTML = 'Cancel';
                    link.addEventListener('click', cancel, true);
                    link.setAttribute('data-file', file.uid);
                    link.className = 'cancel';
                    link.id = 'cancel-' + file.name;
                    remove.appendChild(link);
                    break;
                case CANCELLED:
                    var link = document.createElement('a');
                    name.innerHTML = file.name;
                    status.innerHTML = data.status[CANCELLED];
                    link.innerHTML = 'Delete';
                    link.addEventListener('click', removeLink, true);
                    link.setAttribute('data-file', index);
                    link.className = 'delete';
                    link.id = 'delete-' + file.name;
                    remove.appendChild(link);
                    break;
                case FAILED:
                    var link = document.createElement('a');
                    name.innerHTML = file.name;
                    status.innerHTML = data.status[FAILED];
                    remove.appendChild(link);
                    break;
                case SUCCESS:
                    name.innerHTML = file.name;
                    status.innerHTML = data.status[SUCCESS];
                    name.id = 'success-' + file.name;
                    break;
                default:
                    var link = document.createElement('a');
                    name.innerHTML = file.name;
                    status.innerHTML = formatBytes(file.size);
                    link.innerHTML = 'Remove';
                    link.addEventListener('click', removeLink, true);
                    link.setAttribute('data-file', index);
                    link.className = 'remove';
                    link.id = 'remove-' + file.name;
                    remove.appendChild(link);
            }
            row.appendChild(name);
            row.appendChild(status);
            row.appendChild(remove);
            tbody.appendChild(row);
        }, this);

        return tbody;
    }

    function removeLink(event) {
        events.emit('remove', event.target.dataset.file);
        if(event.target.className !== 'remove' && event.target.className !== 'delete') {
            events.emit('upload', event);
        }
    }

    function cancel(event) {
        events.emit('cancelled', event.target.dataset.file);
    }

    function clear(event) {
        events.emit('reset', {files: [], 'appState': 0 });
    }

    function buildMessage(data) {
        var frag = document.createDocumentFragment(),
            message = document.createElement('div'),
            heading = document.createElement('h2'),
            list = document.createElement('ul');

            message.className = 'flash error-summary error-summary-show';
            heading.id = 'error-summary-heading';
            heading.className = 'h3-heading';
            heading.innerHTML = 'There were problems with your documents'

        var onlyInvalidFiles = data.files.filter(error);

        for (var prop in onlyInvalidFiles) {
            if(onlyInvalidFiles.hasOwnProperty(prop) || (!!navigator.userAgent.match(/Trident\/7\./) && typeof onlyInvalidFiles[prop] === "object")) {
                var errorItem = document.createElement('li'),
                    fileLink = document.createElement('a');

                fileLink.href = '#delete-' + onlyInvalidFiles[prop].name;
                fileLink.innerHTML = onlyInvalidFiles[prop].notificationMessage;

                errorItem.appendChild(fileLink);
                list.appendChild(errorItem);

            }
        }

        var onlyFailedFiles = data.files.filter(failed);

        for (var prop in onlyFailedFiles) {
            if(onlyFailedFiles.hasOwnProperty(prop) || (!!navigator.userAgent.match(/Trident\/7\./) && typeof onlyFailedFiles[prop] === "object")) {
                var errorItem = document.createElement('li'),
                    fileLink = document.createElement('a');

                fileLink.href = '#delete-' + onlyFailedFiles[prop].name;
                fileLink.innerHTML = onlyFailedFiles[prop].message;

                errorItem.appendChild(fileLink);
                list.appendChild(errorItem);

            }
        }

        // Only append errors if there are any messages
        if (onlyFailedFiles.length || onlyInvalidFiles.length) {
            message.appendChild(heading);
            message.appendChild(list);
            frag.appendChild(message);
        }

        return frag;
    }

    function buildNotification(data) {
        var frag = document.createDocumentFragment(),
            container = document.createElement('div'),
            message = document.createElement('p');

            container.className = 'alert alert--success';
            container.role = 'alert';
            message.className = 'alert__message';
            message.innerHTML = 'You’ve uploaded your documents. <br>'
            container.appendChild(message);
            frag.appendChild(container);

            return frag;
    }

    function buildResetLink(data) {
        var resetLink = document.createElement('a');
        resetLink.innerHTML = 'Upload more documents';
        resetLink.id = "reset-link";
        resetLink.className = "button reset-ready";

        var isPending = data.files.filter(progress).length === 0;

        if (isPending) {
            resetLink.addEventListener('click', function(event) {
                event.preventDefault();
                events.emit('reset', {files: [], 'appState': 0});
                $dropContainer.show();
            });
        } else {
            resetLink.className = 'button disabled';
        }

        return resetLink;
    }

    function buildUploadLink() {
        var upload = document.createElement('div'),
            uploadLink = document.createElement('a');
            upload.className = 'confirmUpload';
            uploadLink.className = 'button';
            uploadLink.id = "upload-link";
            uploadLink.innerHTML = 'Check for errors and upload these files';
            uploadLink.addEventListener('click', function(event) {
                event.preventDefault();
                events.emit('upload', event);
            });
            upload.appendChild(uploadLink);
        return upload;
    }

    function buildBackLink() {
        var backLink = document.createElement('a');
        backLink.className = 'back';
        backLink.innerHTML = 'Back to dashboard';
        backLink.href = '/sdes/verified-landing';
        return backLink;
    }

    function formatBytes(bytes,decimals) {
       if(bytes == 0) return '0 Bytes';
       var k = 1000,
           dm = decimals || 2,
           sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
           i = Math.floor(Math.log(bytes) / Math.log(k));
       return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function getSnr(url) {
        var url_parts = url.replace(/\/\s*$/,'').split('/');
        url_parts.shift();
        return url_parts[url_parts.length - 1];
    }

    return {
        init: init,

        // Exposed for testing
        getSnr: getSnr,
        formatBytes: formatBytes,
        buildBackLink: buildBackLink
    }

})();
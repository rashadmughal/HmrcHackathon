/**
 * Description: Model for file upload functionality.
 * Last update: 2017/07/17
 * Author: David Birchall <david.birchall@digital.hmrc.gov.uk>
 *
 */

HMRC.model = (function() {

    var modelData = {
        status: ['Size', 'Error', 'Ready to upload', 'In progress', 'Cancelled', 'Failed', 'Completed'],
        files: [],
        appState: 0,
        messages: {}
    };

    function watch() {
        events.on("files", addFile.bind(this));
        events.on("remove", removeFile.bind(this));
        events.on("validated", updateModel.bind(this));
        events.on("response", updateStatus.bind(this));
        events.on("sending", updateStatus.bind(this));
        events.on("success", updateModel.bind(this));
        events.on("failed", updateModel.bind(this));
        events.on("reset", updateModel.bind(this));
    }

    function updateStatus(status) {
        status = status;
        events.emit("model", modelData);
    }

    function updateModel(data) {
        modelData.appState = data.appState;
        modelData.files = data.files;
        modelData.files = reorder(modelData.files);
        modelData.messages = data.messages;
        events.emit("model", modelData);
    }

    function addFile(data) {
        if(data.constructor === Array) {
            data.forEach(function(file) {
                file["uid"] = Math.random().toString().split(".")[1];
                if(modelData.files.filter(function(existingFile) {
                    return existingFile.name === file.name
                }).length === 0) {
                  file.status = 0;
                  modelData.files.push(file);
                }
            }, this)
        }
        reorder(modelData.files);
        events.emit("model", modelData);
    }

    function reorder(files) {
        files.sort(function(file1, file2) {
            if(file1.state === ERROR && file2.state !== ERROR) {
                return -1;
            } else if(file1.state !== ERROR && file2.state === ERROR) {
                return 1;
            } else if(file1.state === ERROR && file2.state === ERROR) {
                return file1.name.localeCompare(file2.name);
            }

            if(file1.state === FAILED && file2.state !== FAILED) {
                return 1
            } else if(file1.state !== FAILED && file2.state === FAILED) {
                return -1
            } else if(file1.state === FAILED && file2.state === FAILED) {
                return file1.name.localeCompare(file2.name);
            }

            return file1.name.localeCompare(file2.name);
        });

        return files;
    }

    function removeFile(data) {
        modelData.files.splice(data, 1);
        if(modelData.files.length <= 0) {
            modelData.appState = 0;
        }
        events.emit("model", modelData);
    }

    return {
        watch       : watch,

        // exposed for testing
        addFiles    : addFile,
        removeFiles : removeFile,
        data        : modelData,
        reorder     : reorder
    }

})();
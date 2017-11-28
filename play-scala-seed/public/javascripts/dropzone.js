/**
 * Description: Event emitter for file upload functionality.
 * Last update: 2017/07/17
 * Author: David Birchall <david.birchall@digital.hmrc.gov.uk>
 *
 */

(function() {

    var Dropzone = {
        init: function(config) {
            this.config = config;
            this.cacheDom();
            this.bindEvents();
        },
        cacheDom: function() {
            this.$dropzone = this.config.dropzone;
            this.$input = this.$dropzone.find('#file');
        },
        bindEvents: function() {
            this.$input.on("change", this.handleChange.bind(this));
            this.$input.on("click", this.handleClick.bind(this));
            this.$dropzone.on("dragover", this.handleDrag.bind(this));
            this.$dropzone.on("dragleave", this.handleLeave.bind(this));
            this.$dropzone.on("drop", this.handleDrop.bind(this));
        },
        callback: function(event) {
            events.emit('drop', { "fileEvent" : event });
        },
        handleDrag: function(event) {
            event.preventDefault();
            event.stopPropagation();
            this.$dropzone.addClass("dragover");
        },
        handleLeave: function(event) {
            event.preventDefault();
            event.stopPropagation();
            this.$dropzone.addClass("dragleave");
        },
        handleDrop: function(event) {
            event.preventDefault();
            event.stopPropagation();
            this.$dropzone.removeClass("dragover");
            this.callback(event);
        },
        handleChange: function(event) {
            this.callback(event);
        },
        handleClick: function(event) {
            event.target.value = null;
        }
    }

    HMRC.dropzone = function(config) {
        return Dropzone.init(config);
    }

})();
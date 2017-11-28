/**
 * Description: Used to display notifications.
 * Last update: 2017/07/17
 * Author: David Birchall <david.birchall@digital.hmrc.gov.uk>
 *
 */

HMRC.notify = (function() {

  function watch() {
    events.on("notify", notification.bind(this));
  }

  function notification(data) {

    if(!('Notification' in window)) {
      alert('This browser does not support desktop notifications');
    } else if (Notification.permission === 'granted') {
      var notification = new Notification(data.title, data.options);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission(function(permission) {
        if(permission === 'granted') {
          var notification = new Notification(data.title, data.options);
        }
      });
    }
  }

  return {
    watch: watch,
    notification: notification
  }

})();
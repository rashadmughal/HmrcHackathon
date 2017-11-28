/**
 * Description: Used to define global variables.
 * Last update: 2017/07/17
 * Author: David Birchall <david.birchall@hmrc.digital.co.uk>
 *
 */

try{
    document.body.classList.add('js-enabled');
} catch(e) {

}

var HMRC = {},
    ERROR = 1,
    PENDING = 2,
    IN_PROGRESS = 3,
    CANCELLED = 4,
    FAILED = 5,
    SUCCESS = 6;


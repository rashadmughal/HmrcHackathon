/**
 * Description: Used to execute scripts.
 * Last update: 2017/07/17
 * Author: David Birchall <david.birchall@digital.hmrc.gov.uk>
 *
 */

HMRC.dropzone({
    dropzone: $('#dragandrop')
});
HMRC.files.init();
HMRC.model.watch();
HMRC.render.init();
HMRC.notify.watch();
HMRC.upload.init();
HMRC.validation.init();



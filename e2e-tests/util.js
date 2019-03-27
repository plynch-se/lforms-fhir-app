// Helper functions for the tests.
var EC = protractor.ExpectedConditions;

let util = {
  /**
   * By default, protractor expects it to be angular application. This is used
   * to switch between angular and non angular sites.
   *
   * @param {Boolean} flag
   * @returns {Void}
   */
  setAngularSite: function(flag){
    browser.ignoreSynchronization = !flag;
  },


  /**
   *  Erases the value in the given field.  Leaves the focus in the field
   *  afterward.
   */
  clearField: function(field) {
    field.click();
    field.sendKeys(protractor.Key.CONTROL, 'a'); // select all
    field.sendKeys(protractor.Key.BACK_SPACE); // clear the field
  },


  /**
   *  A replacement for sendKeys that only sends events for the final character
   *  in the string.
   */
  sendKeys: function(field, str) {
    browser.executeScript('arguments[0].value = '+str.slice(0,-1), field.getWebElement());
    field.sendKeys(str.slice(-1));
  },


  /**
   *  Waits for a new window to open after calling the provided function.
   * @param action a function which should trigger the opening of a new window.
   * @return a promise for when the window has opened
   */
  waitForNewWindow: function(action) {
    return browser.getAllWindowHandles().then(function(oldHandles) {
      let oldNumHandles = oldHandles.length;
      action();
      browser.wait(function () {
        return browser.getAllWindowHandles().then(function(newHandles) {
          return newHandles.length > oldNumHandles;
        });
      });
    });
  },

  /**
   *  Switches to the newest window and runs the provided function in that context.
   * @param fn the function to be run against he new window.
   * @return Retuns a promise that resolves to whatever fn returns
   */
  runInNewestWindow: function(fn) {
    browser.sleep(500); // sometimes going to the new window too soon prevents the window from loading
    return browser.getAllWindowHandles().then(function(handles) {
      let newWindowHandle = handles[handles.length-1];
      return browser.switchTo().window(newWindowHandle).then(function () {
        return fn();
      });
    });
  },


  /**
   *  Opens up the SMART app in the SMART on FHIR developer sandbox.
   */
  launchSmartAppInSandbox: function () {
    util.setAngularSite(false);
    browser.get('https://launch.smarthealthit.org/?auth_error=&fhir_version_1=r2'+
     '&fhir_version_2=r3&iss=&launch_ehr=1&launch_url=http%3A%2F%2Flocalhost%3A'+
     '8000%2Flforms-fhir-app%2Flaunch.html&patient=&prov_skip_auth=1&provider='+
     '&pt_skip_auth=1&public_key=&sb=&sde=&sim_ehr=1&token_lifetime=15&user_pt=');
    // Select R3
    // https://stackoverflow.com/a/24259419/360782
    element(by.cssContainingText('#fhir-version-2 option', 'R3 (STU3)')).click();
    let launchURL = element(by.id('launch-url'));
    util.clearField(launchURL);
    //this.sendKeys(launchURL, 'http://localhost:8000/lforms-fhir-app/launch.html');
    launchURL.sendKeys('http://localhost:8000/lforms-fhir-app/launch.html');
    let launchButton = element(by.id('ehr-launch-url'));
    this.waitForNewWindow(function() {launchButton.click()});
    this.runInNewestWindow(function() {
      let iframe = $('#frame');
      var EC = protractor.ExpectedConditions;
      browser.wait(EC.presenceOf(iframe), 2000);
      browser.switchTo().frame(iframe.getWebElement());
      let patient = element(by.id('patient-eb3271e1-ae1b-4644-9332-41e32c829486'));
      browser.wait(EC.presenceOf(patient), 2000);
      patient.click();
      // Wait for the server resources to finish loading.
      var EC = protractor.ExpectedConditions;
      browser.wait(EC.presenceOf($('#qListContainer')), 2000);
      // Wait for the Loading message to go away
      browser.wait(EC.not(EC.textToBePresentInElement($('#qListContainer'),
        "Loading")));
    });
  },

  /**
   *  The input element for uploading files.
   */
  fileInput: element(by.css('input[type=file]')),

  /**
   *  Uploads the requested form from the e2e-tests/data directory.
   * @param formFileName the pathname to the form, relative to the test/data
   *  directory, or an absolute path.
   */
  uploadForm: function(formFileName) {
    let qFilePath = formFileName.indexOf('/') == 0 ? formFileName :
      require('path').resolve(__dirname, 'data', formFileName);
    let upload = $('#upload');
    var EC = protractor.ExpectedConditions;
    browser.wait(EC.elementToBeClickable(upload), 2000);
    browser.executeScript('arguments[0].classList.toggle("hide")', util.fileInput.getWebElement());
    util.fileInput.sendKeys(qFilePath);
    browser.executeScript('arguments[0].classList.toggle("hide")', util.fileInput.getWebElement());
    // Wait for the form to appear, or an error
    var EC = protractor.ExpectedConditions;
    browser.wait(EC.or(EC.presenceOf($('#th_Name')), EC.presenceOf($('.error'))), 2000);
  },


  /**
   *  Temporary files removed by cleanUpTmpFiles.  These should be objects
   *  return by the "tmp" package.
   */
  _tmpFiles: [],


  /**
   *  Uploads a modified form with the given prefix prepended to the form's title, so that
   *  the instance of the form can be found and selected.  This will also modify
   *  the form's first identifier, to make it unique.
   * @param formFilePath the pathname to the form, relative to the test/data
   *  directory.
   * @param prefix the text to prepend to the actual form title and to the
   *  form's first idenifier (so it cannot contain characters that identifer does
   *  not permit).
   */
  uploadFormWithTitleChange: function(formFilePath, prefix) {
    let tmp = require('tmp');
    let tmpObj = tmp.fileSync();
    this._tmpFiles.push(tmpObj);
    let qFilePath = require('path').resolve(__dirname, 'data', formFilePath);
    let fs = require('fs');
    let qData = JSON.parse(fs.readFileSync(qFilePath));
    qData.title = prefix + qData.title;
    qData.name = prefix + qData.name;
    qData.identifier[0].value = prefix + qData.identifier[0].value;
    qData.code[0].display = prefix + qData.code[0].display;
    qData.code[0].code = prefix + qData.code[0].code;
    fs.writeFileSync(tmpObj.name, JSON.stringify(qData, null, 2));
    util.uploadForm(tmpObj.name);
  },


  /**
   *  Deletes temporary files that were created by the tmp package.
   */
  cleanUpTmpFiles: function() {
    for (var i=0, len=this._tmpFiles.length; i<len; ++i) {
      this._tmpFiles[i].removeCallback();
    }
  },


  /**
   *  Waits for the spinner to be gone.
   */
  waitForSpinnerStopped: function () {
    let spinner = $('.spinner');
    browser.wait(function() {
      return spinner.isDisplayed().then(function(isDisp) {
        return isDisp===false
      })
    });
    // Apparently, even waiting for the spinner is not long enough for angular
    // to finish updating elements on the page, so sleep a bit.
    browser.sleep(400);
  },


  /**
   *  Returns a function, which when called, will send the given message to the
   *  log.  The purpose is to be used in .then clauses for debugging.
   */
  log: function(msg) {
    return ()=>console.log(msg);
  },


  /**
   *  Deletes the currently displayed QuestionnaireResponse.
   */
  deleteCurrentQR: function() {
    let deleteBtn = $('#btn-delete');
    browser.wait(EC.presenceOf(deleteBtn), 4000);
    deleteBtn.click();
    util.waitForSpinnerStopped();
  },


  pageObjects: {
    /**
     *  Returns an element finder for the link to show the first saved
     *  questionnaire, or if provided, the first one that matches the given
     *  text.
     * @param matchText the text to the returned Questionnaire should have.
     */
    firstSavedQ: function(matchText) {
      if (matchText)
        return element(by.cssContainingText('#qList a.list-group-item', matchText));
      else
        return $('#qList a.list-group-item:first-child')
    },

    /**
     *  Returns an element finder for the link to show the first saved
     *  QuestionnaireResponse, or if provided, the first saved
     *  QuestionnaireResponse whose label contains the given text.
     * @param matchText the text to the returned QR should have.
     */
    firstSavedQR: function(matchText) {
      if (matchText)
        return element(by.cssContainingText('#qrList a.list-group-item', matchText));
      else
        return $('#qrList a.list-group-item:first-child')
    },

    /**
     *  Returns an element finder for the link to show the first saved USSG
     *  questionnaire.
     */
    firstSavedUSSGQ: function() {
      return element(by.cssContainingText('#qList a.list-group-item', 'Surgeon'));
    },

    /**
     *  Returns an element finder for the message body of the resource dialog.
     */
    resDialogBody: function () {
      return $('#message-body');
    },

    /**
     *  The autocompletion list.
     */
    answerList: $('#searchResults')

  }
}
module.exports = util;
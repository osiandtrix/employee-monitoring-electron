const { app, Notification } = require('electron');
const tracker = require('../base/task-tracker');
const osIntegration = require('../base/os-integration');
const translation = require('../base/translation');

class OsSubmissionHandler {

  constructor() {

    this._inactivityResultAccepted = false;

    this._macBounceId = null;

    this._macInactivityNotify = null;

    tracker.on('activity-proof-request', () => {

    });

    tracker.on('activity-proof-result', result => {
    });

  }

}

module.exports = new OsSubmissionHandler();

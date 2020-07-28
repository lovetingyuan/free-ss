const os = require('os')
const path = require('path')
const WindowsBalloon = require('node-notifier').WindowsBalloon;
const { ssdir } = require('./ssbinconfig')

module.exports = function notify(message, exit = true) {
  notify.notifier = notify.notifier || new WindowsBalloon({
    withFallback: false, // Try Windows Toast and Growl first?
    customPath: path.join(ssdir, `notifu${os.arch() === 'x64' ? '64' : ''}.exe`) // Relative/Absolute path if you want to use your fork of notifu
  });
  notify.notifier.notify(
    {
      title: '✈️ SS Accounts',
      message: message || title,
      sound: false, // true | false.
      time: 1000, // How long to show balloon in ms
      wait: false, // Wait for User Action against Notification
      type: 'info' // The notification type : info | warn | error
    },
    function () {
      exit && setTimeout(() => {
        process.exit(0)
      }, 100);
    }
  );
}

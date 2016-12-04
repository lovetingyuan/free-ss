module.exports = function() {
  'use strict';
  //默认配置
  var defaultConfig = require('./defaultConfig.json');

  var account = require('./account');
  var constValue = require('./enum');
  var file = require('./file');
  if (!file.has(constValue.dirName, 'dir')) {
    require('fs').mkdirSync(constValue.dirName); // 建立shadowsocks目录
    file.Json(constValue.configPath).write(defaultConfig);
  }

  console.log("starting...");
  account.setSSAccount(defaultConfig.accountUrl, function() { // 获取账号并设置
    var startClient = () => {
      require('child_process').execFile(constValue.clientPath, function() {
        console.log("ss client has closed.");
      });
      console.log('ss client has started, you can browse now...');
    };
    if (!file.has(constValue.clientPath, 'file')) {
      console.log("ss client is downloading...");
      require('./net').downloadFile(defaultConfig.clientUrl, constValue.clientPath, () => {
        console.log("ss client has been downloaded...");
        startClient();
      });
    } else {
      startClient();
    }
  });
}

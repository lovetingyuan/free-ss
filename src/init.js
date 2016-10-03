module.exports = function() {
  'use strict';
  //默认配置
  const defaultConfig = {
    "configs": [],
    "strategy": null,
    "index": 0,
    "global": false,
    "enabled": true,
    "shareOverLan": false,
    "isDefault": false,
    "localPort": 1080,
    "pacUrl": null,
    "useOnlinePac": false,
    "availabilityStatistics": false,
    "autoCheckUpdate": true,
    "logViewer": null,
    "isVerboseLogging": false,
    "proxy": null,
    "hotkey": null
  };

  let account = require('./account');
  let constValue = require('./enum');
  let client = require('./client');
  let file = require('./file');
  if (!file.has(constValue.dirName, 'dir')) {
    require('fs').mkdirSync(constValue.dirName); // 建立shadowsocks目录
    file.Json(constValue.configPath).write(defaultConfig);
  }

  let ssClientProcessHandler;
  let lastestHash = '';
  let timer;

  function onCloseClient() {
    console.log('ss client has closed.');
    timer && clearInterval(timer);
  }

  console.log("starting fq...");
  console.log('getting ss account...');
  account.setSSAccount().then(function() {
    console.log('get ss account successfully...');
    if (!file.has(constValue.clientPath, 'file')) {
      console.log('no ss client, downloading...');
      return client.downloadClient();
    }
  }).then(function() {
    return Promise.all([client.getLastClientInfo(), client.getClientSha1()]);
  }).then(values => {
    lastestHash = values[0].sha1;
    if (values[0].sha1 !== values[1]) {
      console.log('ss client is out of date, updating...');
      return client.downloadClient();
    } else {
      ssClientProcessHandler = client.startClient(onCloseClient);
    }
  }).then(function() {
    if (ssClientProcessHandler) return;
    console.log('ss client downloaded done...');
    return client.getClientSha1();
  }).then(function(localHash) {
    if (ssClientProcessHandler) return ssClientProcessHandler;
    if (lastestHash && localHash && lastestHash === localHash) {
      ssClientProcessHandler = client.startClient(onCloseClient);
    } else {
      console.log('check sha1 failed...');
    }
    return ssClientProcessHandler;

  }).then(function(ssHandler) {
    if (ssHandler) {
      timer = setInterval(function() {
        account.setSSAccount().then(function() {
          ssClientProcessHandler.kill();
          ssClientProcessHandler = null;
          setTimeout(function() {
            ssClientProcessHandler = client.startClient(onCloseClient);
          });
        });
      }, 60 * 60 * 1000); // 一个小时之后重新获取账户信息
    } else {
      console.log('please try again');
    }
  }).catch((...e) => {
    console.log('sorry, errors happened: ', e);
  });
}

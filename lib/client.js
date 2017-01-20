'use strict';

var fs = require('fs');
var path = require('path');
var URL = require('url');

var _require = require('./const'),
    githubBaseUrl = _require.githubBaseUrl,
    githubHeaders = _require.githubHeaders,
    dirName = _require.dirName;

var clientProcess = null;
var debug = function debug(content) {
  console.log('freess: ' + content);
};

function downloadClient(clientPath, remoteConfig) {
  var fs = require('fs');
  var https = require('https');
  return new Promise(function (resolve, reject) {
    var has = require('./file').has;
    if (has(clientPath, 'file')) {
      debug("正在更新客户端...");
    } else {
      debug("正在下载客户端...");
    }
    var clientUrlObj = URL.parse(githubBaseUrl + '/bin/ss');
    https.get(Object.assign({}, clientUrlObj, {
      headers: githubHeaders
    }), function (res) {
      var writeStream = fs.createWriteStream(clientPath);
      res.pipe(writeStream);
      writeStream.on('close', function () {
        var _require2 = require('./file'),
            getSHA = _require2.getSHA;

        if (getSHA(clientPath) !== remoteConfig.sha.toLowerCase()) {
          fs.unlinkSync(clientPath);
          debug('抱歉，客户端校验错误');
          reject();
        } else {
          resolve(remoteConfig);
        }
      }).on('error', reject);
    });
  });
}

function startClient(remoteConfig, timer) {
  var clientPath = path.join(dirName, remoteConfig.clientName);

  var _require3 = require('./account'),
      setAccount = _require3.setAccount;

  var childProcess = require('child_process');
  debug('正在设置账号...');
  return setAccount(remoteConfig).then(function () {
    if (clientProcess) {
      debug('正在重启客户端...');
      clientProcess.kill();
    } else {
      debug('正在启动客户端...');
    }
    clientProcess = childProcess.execFile(clientPath, function () {
      if (clientProcess.exitCode == 0) {
        debug('客户端已经退出，感谢使用');
        clearInterval(timer);
      }
    });
    setTimeout(function () {
      debug('OK, 现在可以科学上网');
    }, 1000);
  });
}
module.exports = {
  downloadClient: downloadClient,
  startClient: startClient
};
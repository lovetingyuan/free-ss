'use strict';

var os = require('os');
var path = require('path');
var fs = require('fs');
var version = require('../package.json').version;

var _require = require('./const'),
    dirName = _require.dirName,
    githubBaseUrl = _require.githubBaseUrl;

var _require2 = require('./request'),
    request = _require2.request;

var _require3 = require('./file'),
    has = _require3.has,
    getSHA = _require3.getSHA;

var _require4 = require('./client'),
    startClient = _require4.startClient,
    downloadClient = _require4.downloadClient;

var appName = require('../package.json').name;

var debug = function debug(content) {
  if (process.env.NODE_ENV === 'TEST') return;
  console.log(appName + ': ' + content);
};
var autoGoogle = false;
module.exports = function main() {
  if (os.platform() !== 'win32') {
    return debug('目前仅支持windows平台');
  }
  var args = process.argv.slice(2);
  var restartTime = 60 * 60 * 1000;
  var usage = '用法：ss [ OPTIONS ] \nOPTIONS: -t=重启客户端的时间间隔(分钟)\n-s 表示自动打开google';
  if (process.env.NODE_ENV !== 'TEST') {
    if (args.length > 1) {
      console.log(usage);
    } else if (args.length === 1) {
      if (args[0] === '-h') {
        return console.log(usage);
      }
      if (args[0] === '-v') {
        return console.log(appName + '\u7248\u672C: ' + version);
      } else if (/^-t=\d+$/.test(args[0])) {
        restartTime = args[0].split('=')[1] * 60 * 1000 || restartTime;
        if (restartTime < 10 * 60 * 1000) {
          console.log('重启间隔时间最少为10分钟！');
          restartTime = 10 * 60 * 1000;
        }
      } else if (args[0] === '-s') {
        autoGoogle = true;
      } else {
        console.log('ss -h 获取帮助');
      }
    }
  }

  debug('\u8BF7\u7A0D\u5019(' + version + ') ...');
  return request('https://registry.npmjs.org/' + appName).then(function (_data) {
    var data = JSON.parse(_data);
    var latestVersion = data['dist-tags'].latest;
    if (latestVersion !== version) {
      debug('\u7248\u672C' + version + '\u5DF2\u7ECF\u5E9F\u5F03\uFF0C\u8BF7\u66F4\u65B0' + appName + '\u7684\u6700\u65B0\u7248\u672C' + latestVersion);
    }
    debug('正在配置...');
    return request(githubBaseUrl + '/bin/config');
  }, function (err) {
    if (err.code === 'ETIMEDOUT') {
      return Promise.reject('网络异常，请稍候重试');
    }
    return Promise.reject(err);
  }).then(function (_remoteConfig) {
    var remoteConfig = JSON.parse(_remoteConfig);
    var configPath = path.join(dirName, remoteConfig.configName);
    if (!has(dirName, 'dir')) {
      fs.mkdirSync(dirName);
      fs.writeFileSync(configPath, JSON.stringify(remoteConfig.config, null, 2));
    }
    return remoteConfig;
  }).then(function (remoteConfig) {
    var clientPath = path.join(dirName, remoteConfig.clientName);
    if (getSHA(clientPath) !== remoteConfig.sha.toLowerCase()) {
      return downloadClient(remoteConfig);
    }
    return remoteConfig;
  }).then(function (remoteConfig) {
    var timer = setInterval(function () {
      startClient(remoteConfig, timer).then(function () {
        debug('客户端已经重启');
      }).catch(function (err) {
        debug('\u62B1\u6B49\uFF0C\u53D1\u751F\u4E86\u9519\u8BEF\uFF1A' + (err.message || err));
        process.exit(0);
      });
    }, restartTime || remoteConfig.interval || 60 * 60 * 1000);
    return startClient(remoteConfig, timer, autoGoogle);
  }).then(function (clientProcessId) {
    return {
      result: 'success',
      data: clientProcessId
    };
  }).catch(function (err) {
    debug('\u62B1\u6B49\uFF0C\u53D1\u751F\u4E86\u9519\u8BEF\uFF1A' + (err.message || err));
    if (process.env.NODE_ENV !== 'TEST') {
      process.exit(0);
    }
    return {
      result: 'error',
      data: err
    };
  });
};
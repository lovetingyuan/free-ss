'use strict';

module.exports = function () {
  var os = require('os');
  var path = require('path');
  var fs = require('fs');
  var URL = require('url');
  var version = require('../package.json').version;
  var debug = function debug(content) {
    if (process.env.NODE_ENV === 'TEST') return;
    console.log('freess(' + version + '): ' + content);
  };
  if (os.platform() !== 'win32') {
    return debug('目前仅支持windows平台');
  }

  var _require = require('./const'),
      dirName = _require.dirName,
      githubBaseUrl = _require.githubBaseUrl;

  var args = process.argv.slice(2);
  var restartTime = 60 * 60 * 1000;
  var usage = '用法：ss [ OPTIONS ] \nOPTIONS: -t=restart_interval_time(minites)  重启客户端的时间间隔(分钟)';
  if (process.env.NODE_ENV !== 'TEST') {
    if (args.length > 1) {
      console.log(usage);
    } else if (args.length === 1) {
      if (args[0] === '-h') {
        console.log(usage);
        return;
      }
      if (args[0] === '-v') {
        console.log('freess版本: ' + version);
        return;
      } else if (/^-t=\d+$/.test(args[0])) {
        restartTime = args[0].split('=')[1] * 60 * 1000 || restartTime;
      } else {
        console.log('ss -h 获取帮助');
      }
    }
  }

  var _require2 = require('./request'),
      request = _require2.request;

  debug('请稍候 ...');
  return request(githubBaseUrl + '/package.json').then(function (data) {
    data = JSON.parse(data);
    if (data.version !== version) {
      debug('\u7248\u672C' + version + '\u5DF2\u7ECF\u5E9F\u5F03\uFF0C\u8BF7\u66F4\u65B0freess\u7684\u6700\u65B0\u7248\u672C' + data.version);
    }
    debug('正在配置...');
    return request(githubBaseUrl + '/bin/config');
  }, function (err) {
    if (err.code === 'ETIMEDOUT') {
      return Promise.reject('网络异常，请稍候重试');
    }
    return Promise.reject(err);
  }).then(function (remoteConfig) {
    remoteConfig = JSON.parse(remoteConfig);
    var configPath = path.join(dirName, remoteConfig.configName);

    var _require3 = require('./file'),
        has = _require3.has;

    if (!has(dirName, 'dir')) {
      fs.mkdirSync(dirName);
      fs.writeFileSync(configPath, JSON.stringify(remoteConfig.config, null, 2));
    }
    return remoteConfig;
  }).then(function (remoteConfig) {
    var clientPath = path.join(dirName, remoteConfig.clientName);

    var _require4 = require('./file'),
        getSHA = _require4.getSHA;

    if (getSHA(clientPath) !== remoteConfig.sha.toLowerCase()) {
      var _require5 = require('./client'),
          downloadClient = _require5.downloadClient;

      return downloadClient(remoteConfig);
    }
    return remoteConfig;
  }).then(function (remoteConfig) {
    var _require6 = require('./client'),
        startClient = _require6.startClient;

    var timer = setInterval(function () {
      startClient(remoteConfig, timer).then(function () {
        debug('客户端已经重启');
      }).catch(function (err) {
        debug('抱歉，发生了错误：' + err);
        process.exit(0);
      });
    }, restartTime || remoteConfig.interval || 60 * 60 * 1000);
    return startClient(remoteConfig, timer);
  }).then(function (clientProcessId) {
    return {
      result: 'success',
      data: clientProcessId
    };
  }).catch(function (err) {
    debug('抱歉，发生了错误：' + err);
    if (process.env.NODE_ENV !== 'TEST') {
      process.exit(0);
    }
    return {
      result: 'error',
      data: err
    };
  });
};
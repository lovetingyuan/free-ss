  // 本人github上存放最新的ss客户端文件和配置文件
  // 账号通过远程接口获取
  // 通过第三方模块进行改写
  // 提示语改成汉语
  // 本人github上的配置文件的内容包括： {
  //  config: // 代表ss客户端本身的config,
  //  sha: // ss客户端的哈希
  //  accountUrl: // 免费账号的地址，
  //  interval: // 多长时间后重启客户端,
  //  configName: // ss客户端配置文件的名称
  //  clientName: // ss客户端的名称，
  //  configKey: 'configs',//表示上面config字段中代表账户的属性名
  // }
  // 上面的config字段内容：{
  //  ...本身的config字段，
  //  _configs: 表示
  // }
  // 流程：
  // 1 如果不是windows平台则给出提示语并退出主进程
  // 2 校验模块版本是否是最新，通过与github上的packagejson version比较，否则给出更新提示语，并借此测试网络是否能正常访问，如果不可以则提示并退出主程序
  // 3 如果第一次使用进行本地初始化工作，下载配置文件和客户端
  // 4 如果不是第一次使用，则检测客户端版本是否是最新，通过与本人github上的ss客户端版本进行比较，如果不是最新则下载配置文件和客户端，配置文件通过与当前配置水合写入本地
  // 5 校验客户端sha，如果不一致则给出提示并退出主程序，同时删除客户端和配置文件
  // 6 获取最新账号，写入配置，启动客户端，定时器重启客户端
  module.exports = function() {
    var os = require('os');
    var path = require('path');
    var fs = require('fs');
    var URL = require('url');
    var debug = function(content) {
      console.log('freess: ' + content);
    };
    if (os.platform() !== 'win32') {
      return debug('目前仅支持windows平台');
    }
    const {
      dirName,
      githubBaseUrl
    } = require('./const');

    var {request} = require('./request');
    debug('自由无价...');
    request(githubBaseUrl + '/package.json').then(data => {
      data = JSON.parse(data);
      var currentVersion = require('../package.json').version;
      if (data.version !== currentVersion) {
        debug(`版本${currentVersion}已经废弃，请更新freess的最新版本${data.version}`);
      }
      debug('正在配置...');
      return request(githubBaseUrl + '/bin/config');
    }, function(err) {
      if (err.code === 'ETIMEDOUT') {
        return '抱歉，网络错误，请稍候重试';
      }
      return err;
    }).then(function(remoteConfig) {
      remoteConfig = JSON.parse(remoteConfig);
      var configPath = path.join(dirName, remoteConfig.configName);
      var { has } = require('./file');
      if (!has(dirName, 'dir')) {
        fs.mkdirSync(dirName);
        fs.writeFileSync(configPath, JSON.stringify(remoteConfig.config, null, 2));
      }
      return remoteConfig;
    }).then(remoteConfig => {
      var clientPath = path.join(dirName, remoteConfig.clientName);
      var {getSHA}  = require('./file');
      if (getSHA(clientPath) !== remoteConfig.sha.toLowerCase()) {
        let { downloadClient } = require('./client');
        return downloadClient(clientPath, remoteConfig);
      }
      return remoteConfig;
    }).then(function(remoteConfig) {
      var { startClient } = require('./client');
      var timer = setInterval(function() {
        startClient(remoteConfig, timer).then(function() {
          debug('客户端已经重启');
        }).catch(function(err) {
          debug('抱歉，发生了错误：' + err);
          process.exit(0);
        });
      }, remoteConfig.interval || 60 * 60 * 1000);
      return startClient(remoteConfig, timer);
    }).catch(function(err) {
      debug('抱歉，发生了错误：' + err);
      process.exit(0);
    });

  }

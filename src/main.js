const os = require('os');
const path = require('path');
const fs = require('fs');
const version = require('../package.json').version;
const {
  dirName,
  githubBaseUrl,
} = require('./const');
const { request } = require('./request');
const { has, getSHA } = require('./file');
const { startClient, downloadClient } = require('./client');
const appName = require('../package.json').name;

const debug = (content) => {
  if (process.env.NODE_ENV === 'TEST') return;
  console.log(`${appName}: ${content}`);
};
let autoGoogle = false;
module.exports = function main() {
  if (os.platform() !== 'win32') {
    return debug('目前仅支持windows平台');
  }
  const args = process.argv.slice(2);
  let restartTime = 60 * 60 * 1000;
  const usage = '用法：ss [ OPTIONS ] \nOPTIONS: -t=重启客户端的时间间隔(分钟)\n-s 表示自动打开google';
  if (process.env.NODE_ENV !== 'TEST') {
    if (args.length > 1) {
      console.log(usage);
    } else if (args.length === 1) {
      if (args[0] === '-h') {
        return console.log(usage);
      }
      if (args[0] === '-v') {
        return console.log(`${appName}版本: ${version}`);
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

  debug(`请稍候(${version}) ...`);
  return request(`https://registry.npmjs.org/${appName}`).then((_data) => {
    const data = JSON.parse(_data);
    const latestVersion = data['dist-tags'].latest;
    if (latestVersion !== version) {
      debug(`版本${version}已经废弃，请更新${appName}的最新版本${latestVersion}`);
    }
    debug('正在配置...');
    return request(`${githubBaseUrl}/bin/config`);
  }, (err) => {
    if (err.code === 'ETIMEDOUT') {
      return Promise.reject('网络异常，请稍候重试');
    }
    return Promise.reject(err);
  })
    .then((_remoteConfig) => {
      const remoteConfig = JSON.parse(_remoteConfig);
      const configPath = path.join(dirName, remoteConfig.configName);
      if (!has(dirName, 'dir')) {
        fs.mkdirSync(dirName);
        fs.writeFileSync(configPath, JSON.stringify(remoteConfig.config, null, 2));
      }
      return remoteConfig;
    })
    .then((remoteConfig) => {
      const clientPath = path.join(dirName, remoteConfig.clientName);
      if (getSHA(clientPath) !== remoteConfig.sha.toLowerCase()) {
        return downloadClient(remoteConfig);
      }
      return remoteConfig;
    })
    .then((remoteConfig) => {
      const timer = setInterval(() => {
        startClient(remoteConfig, timer).then(() => {
          debug('客户端已经重启');
        }).catch((err) => {
          debug(`抱歉，发生了错误：${err.message || err}`);
          process.exit(0);
        });
      }, restartTime || remoteConfig.interval || 60 * 60 * 1000);
      return startClient(remoteConfig, timer, autoGoogle);
    })
    .then(clientProcessId => ({
      result: 'success',
      data: clientProcessId,
    }))
    .catch((err) => {
      debug(`抱歉，发生了错误：${err.message || err}`);
      if (process.env.NODE_ENV !== 'TEST') {
        process.exit(0);
      }
      return {
        result: 'error',
        data: err,
      };
    });
};

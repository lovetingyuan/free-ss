  const { request } = require('./request');
  const path = require('path');
  const { dirName } = require('./const');
  const fs = require('fs');

  function setAccount(remoteConfig) {
    const configPath = path.join(dirName, remoteConfig.configName);
    return request(remoteConfig.accountUrl).then((_data) => {
      const data = JSON.parse(_data);
      if (data.result) {
        if (data.data.length === 0) {
          return Promise.reject('没有可用账号');
        }
        const accounts = [];
        data.data.forEach((v) => {
          const account = Object.assign({}, remoteConfig.accountSchema);
          remoteConfig.accountKeys.forEach((key, i) => {
            account[key] = v[i];
          });
          accounts.push(account);
        });
        // eslint-disable-next-line global-require, import/no-dynamic-require
        const localConfig = require(configPath);
        // eslint-disable-next-line no-underscore-dangle
        localConfig._version = remoteConfig.clientVersion;
        localConfig[remoteConfig.accountKey] = accounts;
        fs.writeFileSync(configPath, JSON.stringify(localConfig, null, 2));
        return localConfig;
      }
      return Promise.reject(data.data || '无法获取可用账号');
    });
  }
  exports.setAccount = setAccount;

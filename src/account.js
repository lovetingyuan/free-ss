function setAccount(remoteConfig) {
  var { request } = require('./request');
  var path = require('path');
  var { dirName } = require('./const');
  var configPath = path.join(dirName, remoteConfig.configName);
  return request(remoteConfig.accountUrl).then(function(data) {
    data = JSON.parse(data);
    if (data.result && data.data.length) {
      var accounts = [],
        fs = require('fs');
      data.data.forEach(v => {
        let account = Object.assign({}, remoteConfig.accountSchema);
        remoteConfig.accountKeys.forEach((key, i) => {
          account[key] = v[i];
        });
        accounts.push(account);
      });
      var localConfig = require(configPath);
      localConfig[remoteConfig.accountKey] = accounts;
      fs.writeFileSync(configPath, JSON.stringify(localConfig, null, 2));
      return localConfig;
    } else {
      return Promise.reject(data.data);
    }
  });
}
exports.setAccount = setAccount;
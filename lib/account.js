'use strict';

function setAccount(remoteConfig) {
  var _require = require('./request'),
      request = _require.request;

  var path = require('path');

  var _require2 = require('./const'),
      dirName = _require2.dirName;

  var configPath = path.join(dirName, remoteConfig.configName);
  return request(remoteConfig.accountUrl).then(function (data) {
    data = JSON.parse(data);
    if (data.result && data.data.length) {
      var accounts = [],
          fs = require('fs');
      data.data.forEach(function (v) {
        var account = Object.assign({}, remoteConfig.accountSchema);
        remoteConfig.accountKeys.forEach(function (key, i) {
          account[key] = v[i];
        });
        accounts.push(account);
      });
      var localConfig = require(configPath);
      localConfig._version = remoteConfig.clientVersion;
      localConfig[remoteConfig.accountKey] = accounts;
      fs.writeFileSync(configPath, JSON.stringify(localConfig, null, 2));
      return localConfig;
    } else {
      return Promise.reject(data.data);
    }
  });
}
exports.setAccount = setAccount;
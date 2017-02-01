'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _require = require('./request'),
    request = _require.request;

var path = require('path');

var _require2 = require('./const'),
    dirName = _require2.dirName;

var fs = require('fs');

function setAccount(remoteConfig) {
  var configPath = path.join(dirName, remoteConfig.configName);
  return request(remoteConfig.accountUrl).then(function (_data) {
    var data = JSON.parse(_data);
    if (data.result && data.data.length) {
      var _ret = function () {
        var accounts = [];
        data.data.forEach(function (v) {
          var account = Object.assign({}, remoteConfig.accountSchema);
          remoteConfig.accountKeys.forEach(function (key, i) {
            account[key] = v[i];
          });
          accounts.push(account);
        });
        // eslint-disable-next-line global-require, import/no-dynamic-require
        var localConfig = require(configPath);
        // eslint-disable-next-line no-underscore-dangle
        localConfig._version = remoteConfig.clientVersion;
        localConfig[remoteConfig.accountKey] = accounts;
        fs.writeFileSync(configPath, JSON.stringify(localConfig, null, 2));
        return {
          v: localConfig
        };
      }();

      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    }
    return Promise.reject(data.data);
  });
}
exports.setAccount = setAccount;
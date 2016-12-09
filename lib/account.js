'use strict';

function setSSAccount(accountUrl) {
  'use strict';

  var _require = require('./enum'),
      configPath = _require.configPath;

  var grabUrl = require('./net').grabUrl;
  return grabUrl(accountUrl).then(function (data) {
    var file = require('./file');
    var config = file.Json(configPath).read();
    var sampleServer = config.configs[0];
    var configs = [];
    var h4s = data.match(/<h4>(.*)?<\/h4>/g).slice(0, 18).filter(function (v, i) {
      return i % 6 < 4;
    }).map(function (v) {
      return v.replace(/<h4>[\s\S]+?:([\s\S]*)?<\/h4>/, '$1');
    });
    for (var i = 0; i < h4s.length; i += 4) {
      if (h4s[i] && h4s[i + 1] && h4s[i + 2] && h4s[i + 3]) {
        configs.push(Object.assign({}, sampleServer, {
          "server": h4s[i],
          "server_port": +h4s[i + 1],
          "password": h4s[i + 2],
          "method": h4s[i + 3]
        }));
      }
    }
    if (!configs.length) {
      throw Error('no available ss account...');
    }
    return configs;
  }).then(function (configs) {
    var file = require('./file');
    var config = file.Json(configPath).read();
    config.index = 0;
    config.configs = configs;
    file.Json(configPath).write(config);
  });
}

exports.setSSAccount = setSSAccount;
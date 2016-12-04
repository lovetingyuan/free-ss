function setSSAccount(accountUrl, callback) {
  'use strict';
  var constValue = require('./enum');
  require('./net').grabUrl(accountUrl, function(data) {
    var file = require('./file');
    var config = file.Json(constValue.configPath).read();
    var h4s = data.match(/<h4>(.*)?<\/h4>/g).slice(0, 18).filter((v, i) => {
      return i % 6 < 4;
    }).map((v) => {
      return v.replace(/<h4>[\s\S]+?:([\s\S]*)?<\/h4>/, '$1');
    });
    config.configs = [];
    for (var i = 0; i < h4s.length; i += 4) {
      if (h4s[i] && h4s[i + 1] && h4s[i + 2] && h4s[i + 3]) {
        config.configs.push({
          "server": h4s[i],
          "server_port": +h4s[i + 1],
          "password": h4s[i + 2],
          "method": h4s[i + 3],
          "remarks": "ishadowsocks",
          "auth": false
        });
      }
    }
    if (!config.configs.length) {
      console.error('no available ss account...');
      return;
    }
    config.index = 0;
    file.Json(constValue.configPath).write(config);
    callback();
  });
}

exports.setSSAccount = setSSAccount;

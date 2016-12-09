'use strict';

function getLastClientInfo() {
  var _require = require('./net'),
      grabUrl = _require.grabUrl;
  // https://api.github.com/repos/shadowsocks/shadowsocks-windows/releases/latest


  return grabUrl({
    protocol: 'https:',
    host: 'api.github.com',
    path: '/repos/shadowsocks/shadowsocks-windows/releases/latest',
    headers: {
      'User-Agent': 'lovetingyuan/fq'
    }
  }).then(function (data) {
    var releaseInfo = JSON.parse(data);
    return {
      version: releaseInfo.name,
      sha1: releaseInfo.body.match(/[A-Z0-9]{40}/i)[0].toUpperCase(),
      downloadUrl: releaseInfo.assets[0].browser_download_url
    };
  });
}

function downloadClient() {
  'use strict';

  var fs = require('fs');

  var _require2 = require('./net'),
      githubGet = _require2.githubGet;

  var clientUrl = githubGet('https://api.github.com/repos/lovetingyuan/fq/contents/bin/ss');
  var https = require('https');

  var _require3 = require('./enum'),
      clientPath = _require3.clientPath;

  return new Promise(function (resolve, reject) {
    https.get(clientUrl, function (res) {
      var writeStream = fs.createWriteStream(clientPath);
      res.pipe(writeStream);
      writeStream.on('close', resolve);
      writeStream.on('error', reject);
    });
  });
}

function startClient(callback) {
  var _require4 = require('./enum'),
      clientPath = _require4.clientPath;

  setTimeout(function () {
    console.log('ss client has started, you can browse now...');
  }, 2000);
  return require('child_process').execFile(clientPath, callback);
}

function getClientSha1() {
  var _require5 = require('./enum'),
      clientPath = _require5.clientPath;

  var crypto = require('crypto'),
      fs = require('fs');
  return new Promise(function (resolve, reject) {
    fs.readFile(clientPath, function (err, data) {
      if (err) return reject(err);
      var result = crypto.createHash('sha1').update(data, 'utf8').digest('hex');
      resolve(result.toUpperCase());
    });
  });
}

module.exports = {
  getLastClientInfo: getLastClientInfo,
  startClient: startClient,
  downloadClient: downloadClient,
  getClientSha1: getClientSha1
};
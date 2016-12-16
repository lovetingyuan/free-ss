function getLastClientInfo() {
  let { grabUrl } = require('./net');
  // https://api.github.com/repos/shadowsocks/shadowsocks-windows/releases/latest
  return grabUrl({
    protocol: 'https:',
    host: 'api.github.com',
    path: '/repos/shadowsocks/shadowsocks-windows/releases/latest',
    headers: {
      'User-Agent': 'lovetingyuan/fq'
    }
  }).then(function(data) {
    let releaseInfo = JSON.parse(data.response);
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
  var { githubGet } = require('./net');
  var clientUrl = githubGet('https://api.github.com/repos/lovetingyuan/fq/contents/bin/ss');
  var https = require('https');
  let { clientPath } = require('./enum');
  return new Promise(function(resolve, reject) {
    https.get(clientUrl, function(res) {
      let writeStream = fs.createWriteStream(clientPath);
      res.pipe(writeStream);
      writeStream.on('close', resolve);
      writeStream.on('error', reject);
    });
  });
}


function startClient(callback) {
  const { clientPath } = require('./enum');
  setTimeout(function() {
    console.log('ss client has started, you can browse now...');
  }, 2000);
  return require('child_process').execFile(clientPath, callback);
}

function getClientSha1() {
  var { clientPath } = require('./enum');
  var crypto = require('crypto'),
    fs = require('fs');
  return new Promise(function(resolve, reject) {
    fs.readFile(clientPath, function(err, data) {
      if (err) return reject(err);
      const result = crypto.createHash('sha1')
        .update(data, 'utf8')
        .digest('hex');
      resolve(result.toUpperCase());
    });
  });
}

module.exports = {
  getLastClientInfo,
  startClient,
  downloadClient,
  getClientSha1
}

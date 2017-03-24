'use strict';

var _require = require('./const'),
    githubHost = _require.githubHost,
    githubHeaders = _require.githubHeaders;

var URL = require('url');

function request(_url) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var url = _url + '?_t=' + Date.now();
  var urlObj = URL.parse(url);
  if (urlObj.hostname === githubHost) {
    // eslint-disable-next-line no-param-reassign
    options.headers = Object.assign(options.headers || {}, githubHeaders);
  }
  if (!options.timeout) {
    options.timeout = 10000; // eslint-disable-line no-param-reassign
  }
  // eslint-disable-next-line global-require, import/no-dynamic-require

  var _require2 = require(urlObj.protocol.slice(0, -1)),
      getData = _require2.get;

  return new Promise(function (resolve, reject) {
    getData(Object.assign(options, urlObj), function (res) {
      res.setEncoding('utf8');
      if (res.statusCode !== 200) {
        reject(res.statusCode);
        res.resume();
        return;
      }
      var payload = '';
      res.on('data', function (chunk) {
        return payload += chunk;
      }).on('end', function () {
        resolve(payload);
      });
    }).on('error', reject);
  });
}

exports.request = request;
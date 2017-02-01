const {
  githubHost,
  githubHeaders,
} = require('./const');
const URL = require('url');

function request(_url, options = {}) {
  const url = `${_url}?_t=${Date.now()}`;
  const urlObj = URL.parse(url);
  if (urlObj.hostname === githubHost) {
    // eslint-disable-next-line no-param-reassign
    options.headers = Object.assign(options.headers || {}, githubHeaders);
  }
  if (!options.timeout) {
    options.timeout = 10000; // eslint-disable-line no-param-reassign
  }
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const { get: getData } = require(urlObj.protocol.slice(0, -1));
  return new Promise((resolve, reject) => {
    getData(Object.assign(options, urlObj), (res) => {
      res.setEncoding('utf8');
      if (res.statusCode !== 200) {
        reject(res.statusCode);
        res.resume();
        return;
      }
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (e) => {
      reject(e);
    });
  });
}

exports.request = request;

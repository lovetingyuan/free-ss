const {
  githubHost,
  githubHeaders
} = require('./const');
const URL = require('url');

function request(url, options = {}) {
  url = `${url}?_t=${Date.now()}`;
  var urlObj = URL.parse(url);
  if (urlObj.hostname === githubHost) {
    options.headers = Object.assign(options.headers || {}, githubHeaders);
  }
  if(!options.timeout) {
    options.timeout = 10000;
  }
  var { get: getData } = require(urlObj.protocol.slice(0, -1));
  return new Promise(function(resolve, reject) {
    getData(Object.assign(options, urlObj), res => {
      res.setEncoding('utf8');
      if(res.statusCode !== 200) {
        reject(res.statusCode);
        res.resume();
        return;
      }
      var data = "";
      res.on('data', chunk => {
        data += chunk;
      });
      res.on("end", function() {
        resolve(data);
      });
    }).on("error", (e) => {
      reject(e);
    });
  });
}

exports.request = request;
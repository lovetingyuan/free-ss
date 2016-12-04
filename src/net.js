/**
 * 抓取网页数据
 * @param  {string}   url      要抓取的地址，必须是合法的地址
 * @param  {Function} callback 抓取成功后的回调函数，参数是网页的数据
 */
function grabUrl(url, options) {
  'use strict';
  let URL = require('url');
  if(typeof url === 'string') {
    url = Object.assign({}, URL.parse(url), options || {});
  }
  var protocal = url.protocol.slice(0, -1) || 'http';
  return new Promise(function(resolve, reject) {
    require(protocal).get(url, res => {
      res.setEncoding('utf8');
      var data = "";
      res.on('data', chunk => {
        data += chunk;
      });
      res.on("end", function() {
        resolve(data);
      });
      res.on('error', function(e) {
        reject(e);
      });
    }).on("error", (e) => {
      console.error('function grabUrl: error ' + e);
    });
  });
}

exports.grabUrl = grabUrl;

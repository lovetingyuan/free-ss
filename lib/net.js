/**
 * 抓取网页数据
 * @param  {string}   url      要抓取的地址，必须是合法的地址
 * @param  {Function} callback 抓取成功后的回调函数，参数是网页的数据
 */
function grabUrl(url, callback) {
    'use strict';
    var protocal = url.substring(0, url.indexOf(':')).toLowerCase();
    var data = "";
    require(protocal).get(url, function(res) {
        res.on('data', chunk => {
            data += chunk;
        });
        res.on("end", () => {
            callback && callback(data);
        });
    }).on("error", (e) => {
        console.error('function grabUrl: error ' + e);
    });
}

function downloadFile(url, path, callback) {
    'use strict';
    var fs = require('fs');
    var https = require('http');
    http.get(url, function(res) {
        var writeStream = fs.createWriteStream(path);
        res.pipe(writeStream);
        writeStream.on('close', function() {
            callback();
        });
    });
}

exports.grabUrl = grabUrl;
exports.downloadFile = downloadFile;

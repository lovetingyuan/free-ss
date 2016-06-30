/**
 * 抓取网页数据
 * @param  {string}   url      要抓取的地址，必须是合法的地址
 * @param  {Function} callback 抓取成功后的回调函数，参数是网页的数据
 */
function grabUrl(url, callback) {
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
    var fs = require('fs');
    require('download')(url, path, {
        extract: true
    }).then(() => {
        fs.readdir(path, function(e, files) {
            if (e) {
                console.error(e);
                return;
            }
            var clientFilePath = require('./enum').clientPath;
            for(var i = 0; i < files.length; i++) {
                if (files[i].indexOf('.exe') === files[i].length - 4) {
                    fs.renameSync(path + '/' + files[i], clientFilePath);
                    callback && callback();
                    break;
                }
            }
        });
    });
}

exports.grabUrl = grabUrl;
exports.downloadFile = downloadFile;

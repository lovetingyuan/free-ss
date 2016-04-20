/**
 * 抓取网页数据
 * @param  {string}   url      要抓取的地址，必须是合法的地址
 * @param  {Function} callback 抓取成功后的回调函数，参数是网页的数据
 */
function grabUrl(url, callback) {
    var protocal = url.substring(0, url.indexOf(':')).toLowerCase();
    if (protocal !== 'http' && protocal !== 'https') {
        protocal = 'http';
    }
    var http = require(protocal);
    var data = "";
    http.get(url, function(res) {
        res.on('data', function(chunk) {
            data += chunk;
        });
        res.on("end", function() {
            callback(data);
        });
    }).on("error", function() {
        callback(null);
    });
}

/**
 * 下载文件至指定目录
 * @date   2016-03-18
 * @param  {string}   path          存储路径
 * @param  {string}   name          文件名
 * @param  {string}   link          下载地址
 * @param  {Function} callback      下载完成后执行的方法
 */
function downloadFile(path, name, link, callback) {
    var Download = require('download');
    new Download({
            mode: '777',
            extract: true
        }).get(link)
        .rename(name)
        .dest(path)
        .run(callback);
}

exports.grabUrl = grabUrl;
exports.downloadFile = downloadFile;

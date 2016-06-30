/**
 * 获取ss client的最新版本号和下载地址
 * @param  {string} githubPageData github网页数据
 * @return {object}                包含版本号和下载地址的对象
 */
function getClientInfo(callback) {
    require('./net').grabUrl("https://github.com/shadowsocks/shadowsocks-windows/releases/",
        function(data) {
            data.match(/release-title">[\s\S]+?>([\d\.]+?)</);
            var latestVersion = RegExp.$1;
            data.match(/release-downloads">[\s\S]+?href="([\s\S]+?)"/);
            var downloadLink = 'https://github.com' + RegExp.$1;
            if (latestVersion && downloadLink) {
                callback && callback(latestVersion, downloadLink);
            } else {
                console.error('function getClientInfo: cant get client info');
            }
        });
}

function startClient(clientPath, callback) {
    if (require('./file').has(clientPath, 'file')) {
        require('child_process').execFile(clientPath, callback);
    } else {
        console.error('function startClient: client doesnt exist');
    }
}

exports.getClientInfo = getClientInfo;
exports.startClient = startClient;

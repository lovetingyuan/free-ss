/**
 * 获取ss client的最新版本号和下载地址
 * @param  {string} githubPageData github网页数据
 * @return {object}                包含版本号和下载地址的对象
 */
function getClientInfo(callback) {
    var network = require('./net');
    network.grabUrl("https://github.com/shadowsocks/shadowsocks-windows/releases/", function(data) {
        if (!data) {
            console.log("无法获取客户端页面数据...");
            return;
        }
        var cheerio = require("cheerio");
        var $ = cheerio.load(data, {
            decodeEntities: false
        });
        var latestVersion = $(".release-title a").eq(0).text() || null;
        var downloadLink = $("ul.release-downloads a").attr('href');
        if (downloadLink && downloadLink.lastIndexOf(".zip") === (downloadLink.length - 4)) {
            downloadLink = "https://github.com" + $("ul.release-downloads a").attr('href');
        } else {
            downloadLink = null;
        }
        if (latestVersion && downloadLink) {
            callback(latestVersion, downloadLink);
        } else {
            console.log("获取客户端信息时发生错误...");
        }
    });
}

function startClient(clientPath, callback) {
    var child_process = require('child_process');
    var file = require('./file');
    if (file.has(clientPath, 'file') && clientPath.lastIndexOf(".exe") === (clientPath.length - 4)) {
        child_process.execFile(clientPath, callback);
    } else {
        console.log('客户端不存在或者不是可执行文件...');
    }
}

function updateVersionInfo(version, versionPath) {
    var dealJson = require('./file').ReadWriteJson();
    dealJson.write(versionPath, {
        version: version
    });
}

function getLocalVersion(versionPath) {
    var file = require('./file');
    var dealJson = file.ReadWriteJson();
    if (!file.has(versionPath, 'file')) {
        dealJson.write(versionPath, {
            version: ""
        });
        return null;
    } else {
        var versionInfo = dealJson.read(versionPath);
        if (typeof versionInfo === 'object' && !!versionInfo) {
            return versionInfo.version;
        } else {
            return null;
        }
    }
}

exports.getClientInfo = getClientInfo;
exports.startClient = startClient;
exports.updateVersionInfo = updateVersionInfo;
exports.getLocalVersion = getLocalVersion;

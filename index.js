/*

    tingyuan 2015 12
    感谢 http://www.ishadowsocks.net/ 提供的免费账号
    自由无价
    https://github.com/lovetingyuan/fq

*/
"use strict";

//默认配置
var defaultConfig = {
    "configs": [],
    "strategy": null,
    "index": 0,
    "global": false,
    "enabled": true,
    "shareOverLan": false,
    "isDefault": false,
    "localPort": 1080,
    "pacUrl": null,
    "useOnlinePac": false,
    "availabilityStatistics": false,
    "autoCheckUpdate": false,
    "logViewer": null
};

var dirName = "shadowsocks";
var clientName = "shadowsocks.exe";
var clientFilePath = dirName + "/" + clientName;
var configFilePath = dirName + "/gui-config.json";

try {
    /* 检查用户是否安装依赖 */
    if (require('cheerio') && require('download')) {
        buildConfigDir();
    }
} catch (e) {
    if (e && e.code && e.code.toUpperCase() === 'MODULE_NOT_FOUND') {
        var process = require('child_process');
        console.log('start to install modules, please wait...');
        process.exec('npm install',
            function(error, stdout, stderr) {
                if (error === null) {
                    console.log("install successfully!");
                    buildConfigDir();
                } else {
                    console.log('install failed...try again...');
                    return;
                }
            });
    } else {
        console.log('sorry, failed with unknown reason...');
        return;
    }
}


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

function getLatestVersion(githubPageData) {
    var cheerio = require("cheerio");
    var $ = cheerio.load(githubPageData, {
        decodeEntities: false
    });
    return $(".release-title a").eq(0).text();
}

function getLatestDownloadLink(githubPageData) {
    var cheerio = require("cheerio");
    var $ = cheerio.load(githubPageData, {
        decodeEntities: false
    });
    return "https://github.com" + $("ul.release-downloads a").attr('href');
}

/**
 * 初始化目录
 * @author tingyuan
 * @date   2016-03-18
 */
function buildConfigDir() {
    var fs = require('fs');
    var buildConfigFile = () => {
        if (has(configFilePath, "file")) {
            updateConfigFile();
        } else {
            writeJson(configFilePath, JSON.stringify(defaultConfig, null, 4), updateConfigFile);
        }
    };
    if (has(dirName, "dir")) {
        buildConfigFile();
    } else {
        fs.mkdir(dirName, function() {
            buildConfigFile();
        });
    }
}

/**
 * 读取JSON数据
 * @param  {string}   jsonPath json文件路径
 * @param  {Function} callback 读取完毕时的回调函数，参数是json文件的json对象
 */
function readJson(jsonPath, callback) {
    var fs = require('fs');
    fs.readFile(jsonPath, 'utf8', function(err, content) {
        if (err) {
            console.log('read json file error');
        } else {
            try {
                var jsonObj = JSON.parse(content);
                callback(jsonObj);
            } catch (e) {
                console.log('fail to parse json file ' + e);
            }
        }
    });
}

/**
 * 将json数据写入文件中
 * @param  {string}   path     json文件的路径
 * @param  {object/string}   content  json数据，可以是对象或者合法的字符串
 * @param  {Function} callback 写入成功后的回调函数
 */
function writeJson(path, content, callback) {
    var fs = require('fs');
    if (typeof content === 'object') {
        try {
            content = JSON.stringify(content, null, 4);
            fs.writeFile(path, content, 'utf8', callback);
        } catch (e) {
            console.log("invalid json string: " + e.toString());
            return;
        }
    } else if (typeof content === 'string') {
        fs.writeFile(path, content, 'utf8', callback);
    } else {
        console.log("error with reason: " + e.toString());
        return;
    }
}

/**
 * 获取免费ss账号
 * @param  {string} freePageData ss page data
 * @return {array}              获取到的账号数据
 */
function getFreeAccount(freePageData) {
    var cheerio = require("cheerio");
    var $ = cheerio.load(freePageData, {
        decodeEntities: false
    });
    var $targets = $("#free h4");
    var accountInfo = [];
    var oneAccount = {};
    var keys = ['server', 'server_port', 'password', 'method', 'remarks'];
    $targets.each(function(index, ele) {
        if (index % 6 < 4) {
            oneAccount[keys[index % 6]] = $(ele).text().split(":")[1];
        } else if (index % 6 === 4) {
            oneAccount[keys[4]] = 'ishadowsocks';
        } else {
            accountInfo.push(oneAccount);
            oneAccount = {};
        }
    });
    var accountNum = accountInfo.length;
    if (accountNum !== 3) {
        console.log("there is some errors happened");
        return;
    }
    var i, j;
    for (i = 0; i < accountNum; i++) {
        for (j = 0; j < keys.length; j++) {
            if (!accountInfo[i][keys[j]]) {
                console.log("there is some errors happened");
                return;
            }
        }
    }
    var port;
    for (i = 0; i < accountInfo.length; i++) {
        port = accountInfo[i]['server_port'];
        accountInfo[i]['server_port'] = parseInt(port, 10);
        accountInfo[i]['auth'] = false;
    }
    return accountInfo;
}

function updateConfigFile() {
    grabUrl("http://www.ishadowsocks.net/", function(_data) {
        if (!_data) {
            console.log("fail to get ss account");
            return;
        }
        readJson(configFilePath, function(jsonObj) {
            jsonObj.configs = getFreeAccount(_data);
            writeJson(configFilePath, jsonObj, startSsClient);
        });
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

/**
 * 判断有没有那个目录或文件
 * @param  {string}  filepath 文件或文件夹的路径
 * @param  {string}  mode     可取'file'或者'dir'，指定类型，可以为空，此时代表文件或目录均可
 * @return {Boolean}          true代表存在，否则代表不存在
 */
function has(filepath, mode) {
    var stat, fs = require('fs');
    if (mode === 'file') {
        try {
            stat = fs.statSync(filepath);
            return stat.isFile();
        } catch (e) {
            return false;
        }
    } else if (mode === 'dir') {
        try {
            stat = fs.statSync(filepath);
            return stat.isDirectory();
        } catch (e) {
            return false;
        }
    } else {
        try {
            fs.statSync(filepath);
            return true;
        } catch (e) {
            return false;
        }
    }
}

function startExeFile(filepath, callback) {
    var child_process = require('child_process');
    child_process.execFile(filepath, callback);
}

function startSsClient() {
    console.log("starting ss client...");
    grabUrl("https://github.com/shadowsocks/shadowsocks-windows/releases/", function(data) {
        if (!data) {
            console.log("fail to get client page data");
            return;
        }
        var latestVersion = getLatestVersion(data);
        var downloadLink = getLatestDownloadLink(data);

        var startClient = () => {
            startExeFile(clientFilePath, function() {
                console.log("you have closed ss client...");
                return;
            });
            setTimeout(function() {
                console.log("ss client has started, you can browse now...");
            });
        };
        var downloadClient = (config) => {
            console.log('downloading ss client, please wait...');
            downloadFile(dirName, clientName, downloadLink, function() {
                console.log("download successfully");
                config.version = latestVersion;
                writeJson(configFilePath, JSON.stringify(config, null, 4), startClient);
            });
        };

        readJson(configFilePath, function(ssconfig) {
            if (has(clientFilePath, "file")) {
                if (latestVersion != ssconfig.version) {
                    console.log('ss client is outofdate, start to update client...');
                    downloadClient(ssconfig);
                } else {
                    startClient();
                }
            } else {
                console.log('no ss client, start to download client...');
                downloadClient(ssconfig);
            }
        });
    });
}

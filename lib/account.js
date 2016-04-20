function getAccountInfo(callback) {
    var network = require('./net');
    network.grabUrl("http://www.ishadowsocks.net/", function(_data) {
        if (!_data) {
            console.log("无法获取账号页面数据...");
            return;
        }

        var cheerio = require("cheerio");
        var $ = cheerio.load(_data, {
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
        var i, j;
        var validAccount = {};
        for (i = 0; i < accountInfo.length; i++) {
            validAccount[i] = true;
            for (j = 0; j < keys.length; j++) {
                if (!accountInfo[i][keys[j]]) {
                    console.log("获取账号时发生了一些错误...");
                    validAccount[i] = false;
                    break;
                }
            }
        }
        var port, index = null;
        for (i = 0; i < accountInfo.length; i++) {
            if (validAccount[i] && index === null) {
                index = i;
            }
            port = accountInfo[i]['server_port'];
            accountInfo[i]['server_port'] = parseInt(port, 10);
            accountInfo[i]['auth'] = false;
        }
        callback(accountInfo, index);
    });
}

function updateAccountInfo(defaultConfig, accountInfo, index, configPath) {
    var file = require('./file');
    var dealJson = file.ReadWriteJson();
    if (!file.has(configPath, 'file')) {
        defaultConfig.configs = accountInfo;
        if (index !== null) {
            defaultConfig.index = index;
        }
        dealJson.write(configPath, defaultConfig);
    } else {
        var config = dealJson.read(configPath);
        if (typeof config === 'object' && !!config) {
            config.configs = accountInfo;
            if (index !== null) {
                config.index = index;
            }
            dealJson.write(configPath, config);
        }
    }
}

exports.getAccountInfo = getAccountInfo;
exports.updateAccountInfo = updateAccountInfo;

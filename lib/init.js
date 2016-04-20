function init() {
    'use strict';
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
        "autoCheckUpdate": true,
        "logViewer": null
    };

    var dirName = "shadowsocks";
    var clientName = "shadowsocks.exe";
    var clientPath = dirName + "/" + clientName;
    var configPath = dirName + "/gui-config.json";
    var versionPath = dirName + "/user.json";

    var account = require('./account');
    var file = require('./file');

    if (!file.has(dirName, 'dir')) {
        file.buildDir(dirName);
    }
    console.log("开启科学上网...");
    account.getAccountInfo(function(accountInfo, index) {
        if (index === null) {
            console.log("抱歉，现在可能没有可用的账户...");
        }
        account.updateAccountInfo(defaultConfig, accountInfo, index, configPath);
        var client = require('./client');
        client.getClientInfo(function(latestVersion, downloadLink) {
            var startClient = function() {
                client.startClient(clientPath, function() {
                    console.log("你已经关闭了ss客户端，感谢使用.");
                });
                setTimeout(function() {
                    console.log("客户端已经启动，现在可以科学上网...");
                });
            };
            var downloadClient = function() {
                var network = require('./net');
                network.downloadFile(dirName, clientName, downloadLink, function() {
                    if (file.has(clientPath, 'file')) {
                        console.log("客户端已下载完成，现在启动客户端...");
                        client.updateVersionInfo(latestVersion, versionPath);
                        startClient();
                    } else {
                        console.log("抱歉，客户端下载失败，请重试...");
                    }
                });
            };
            if (!file.has(clientPath, 'file')) {
                console.log("客户端不存在，开始下载，请稍候...");
                downloadClient();
            } else if (client.getLocalVersion(versionPath) !== latestVersion) {
                console.log("客户端有更新，正在更新，请稍候...");
                downloadClient();
            } else {
                startClient();
            }
        });
    });
}

exports.init = init;

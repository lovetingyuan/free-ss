module.exports = function() {
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

    var account = require('./account');
    var constValue = require('./enum');
    var file = require('./file');
    if (!file.has(constValue.dirName, 'dir')) {
        require('fs').mkdirSync(constValue.dirName); // 建立shadowsocks目录
        file.Json(constValue.configPath).write(defaultConfig);
        file.Json(constValue.versionPath).write({
            version: ''
        });
    }

    console.log("starting...");
    account.setSSAccount(constValue.configPath, function() { // 获取账号并设置
        var client = require('./client');
        var localVersion = require('./file').Json(constValue.versionPath).read().version;
        client.getClientInfo(function(latestVersion, downloadLink) {
            var startClient = () => {
                client.startClient(constValue.clientPath, function() {
                    console.log("ss client has closed.");
                });
                console.log('ss client has started...');
            };
            if (!file.has(constValue.clientPath, 'file') || localVersion !== latestVersion) {
                console.log("ss client is " + (!file.has(constValue.clientPath, 'file') ?
                        "downloading" : "updating") + "(take few minutes)...");
                downloadClient(downloadLink, latestVersion, startClient);
            } else {
                startClient()
            }
        });
    });

    function downloadClient(downloadLink, latestVersion, callback) {
        require('./net').downloadFile(downloadLink, constValue.dirName, function() {
            console.log("ss client has been downloaded...")
            require('./file').Json(constValue.versionPath).write({
                version: latestVersion
            });
            callback();
        });
    }
}

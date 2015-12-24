//默认配置
var defaultConfig = {
    "configs": [{
        "server": "103.11.143.189",
        "server_port": 14599,
        "password": "QduJLDXg",
        "method": "chacha20",
        "remarks": "新加坡电信优化节点"
    }, {
        "server": "free-b-us-ejd7.ssnx.cf",
        "server_port": 14599,
        "password": "QduJLDXg",
        "method": "chacha20",
        "remarks": "Free B西雅图"
    }, {
        "server": "free-b-jp-b3v1.ssnx.cf",
        "server_port": 14599,
        "password": "QduJLDXg",
        "method": "rc4-md5",
        "remarks": "免费B-日本-新进"
    }, {
        "server": "free-b-us-ebsw.ssnx.cf",
        "server_port": 14599,
        "password": "QduJLDXg",
        "method": "rc4-md5",
        "remarks": "免费-B计划-美国节点"
    }, {
        "server": "free-b-us-ec3e.ssnx.cf",
        "server_port": 14599,
        "password": "QduJLDXg",
        "method": "rc4-md5",
        "remarks": "洛杉矶免费节点"
    }],
    "strategy": null,
    "index": 5,
    "global": false,
    "enabled": true,
    "shareOverLan": false,
    "isDefault": false,
    "localPort": 1080,
    "pacUrl": null,
    "useOnlinePac": false,
    "availabilityStatistics": false
};
// Utility function that downloads a URL and invokes
// callback with the data.
function download(url, callback) {
    var http = require("http");
    http.get(url, function(res) {
        var data = "";
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

var fs = require('fs');
var dirName = "Shadowsocks";
var clientName = "Shadowsocks.exe";
var clientFilePath = dirName + "/" + clientName;
var configFilePath = dirName + "/gui-config.json";

fs.exists(dirName, function(exists) {
    if (!exists) {
        fs.mkdirSync(dirName);
    }
});

fs.exists(configFilePath, function(exist) {
    if (!exist) {
        fs.writeFile(configFilePath,
            JSON.stringify(defaultConfig, null, 2), 'utf8', updateConfigFile);
    } else {
        updateConfigFile();
    }
});

function updateConfigFile() {
    var accountInfo = [];
    download("http://www.ishadowsocks.com/", function(data) {
        var cheerio = require("cheerio");
        if (data) {
            var $ = cheerio.load(data, {
                decodeEntities: false
            });
            var $targets = $("#free h4");
            var oneaccount = {};
            var keys = ['server', 'server_port', 'password', 'method', 'remarks'];
            if ($targets.length !== 6 * 3) {
                console.log("attension!! there is some errors happened!");
                return;
            }
            $targets.each(function(index, ele) {
                if (index % 6 < 4) {
                    oneaccount[keys[index % 6]] = $(ele).text().split(":")[1];
                } else if (index % 6 === 4) {
                    oneaccount[keys[4]] = 'ishadowsocks';
                } else {
                    accountInfo.push(oneaccount);
                    oneaccount = {};
                }
            });

            fs.readFile(configFilePath, 'utf8', function(err, data) {
                if (err) {
                    console.log('readfile error');
                } else {
                    try {
                        var ssconfig = JSON.parse(data);
                        for (var i = 0; i < ssconfig.configs.length; i++) {
                            if (ssconfig.configs[i].remarks === 'ishadowsocks') {
                                ssconfig.configs.splice(i, 1);
                                i--;
                            }
                        }
                        var usingIndex = ssconfig.configs.length;
                        accountInfo.forEach(function(element, index, array) {
                            ssconfig.configs.push(element);
                        });
                        ssconfig.index = usingIndex;
                        fs.writeFile(configFilePath,
                            JSON.stringify(ssconfig, null, 4), 'utf8', startSsClient);
                    } catch (error) {
                        console.log('parse json error');
                    }
                }
            });
        } else {
            console.log("download error");
        }
    });
}

function startSsClient() {
    console.log("starting ss client...");

    var exeClient = () => {
        console.log('ss client has started, you can browse now...');
        var process = require('child_process');
        process.execFile(clientFilePath,
            function(error, stdout, stderr) {
                console.log("you have closed this.....");
            }
        );
    };
    fs.exists(clientFilePath, function(exists) {
        if (exists) {
            exeClient();
        } else {
            console.log('no ss client, start to download client...');
            var Download = require('download');
            new Download({
                    mode: '777'
                }).get('http://tingyuan.me/fq/Shadowsocks.exe')
                .rename("Shadowsocks.exe")
                .dest(dirName)
                .run(exeClient);
        }
    });
}

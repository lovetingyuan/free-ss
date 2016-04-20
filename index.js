/*

    tingyuan 2015 12
    感谢 http://www.ishadowsocks.net/ 提供的免费账号
    自由无价
    https://github.com/lovetingyuan/fq

*/
"use strict";

(function() {
    var init = require('./lib/init').init;
    try {
        /* 检查用户是否安装依赖 */
        if (require('cheerio') && require('download')) {
            init();
        }
    } catch (e) {
        if (e && e.code && e.code.toUpperCase() === 'MODULE_NOT_FOUND') {
            var process = require('child_process');
            console.log('开始安装依赖，请稍候......');
            process.exec('npm install',
                function(error, stdout, stderr) {
                    if (!error) {
                        console.log("依赖安装完毕...");
                        init();
                    } else {
                        console.log('依赖安装失败，请重试...');
                        return;
                    }
                });
        } else {
            console.log('抱歉，出现了未知的错误');
            console.log(e);
            return;
        }
    }
})();

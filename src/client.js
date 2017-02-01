 const fs = require('fs');
 const path = require('path');
 const URL = require('url');
 const has = require('./file').has;

 const {
   githubBaseUrl,
   githubHeaders,
   dirName,
 } = require('./const');
 const https = require('https');
 const { getSHA } = require('./file');

 let clientProcess = null;
 const debug = content => {
   if (process.env.NODE_ENV === 'TEST') return;
   console.log(`freess: ${content}`);
 };

 function downloadClient(remoteConfig) {
   const clientPath = path.join(dirName, remoteConfig.clientName);
   return new Promise((resolve, reject) => {
     if (has(clientPath, 'file')) {
       debug('正在更新客户端...');
     } else {
       debug('正在下载客户端...');
     }
     const clientUrlObj = URL.parse(`${githubBaseUrl}/bin/ss`);
     https.get(Object.assign({}, clientUrlObj, {
       headers: githubHeaders,
     }), (res) => {
       const writeStream = fs.createWriteStream(clientPath);
       res.pipe(writeStream);
       writeStream.on('close', () => {
         if (getSHA(clientPath) !== remoteConfig.sha.toLowerCase()) {
           fs.unlinkSync(clientPath);
           debug('抱歉，客户端校验错误');
           reject();
         } else {
           resolve(remoteConfig);
         }
       })
         .on('error', reject);
     });
   });
 }
 let listened = false;
 const { setAccount } = require('./account');
 const childProcess = require('child_process');

 function startClient(remoteConfig, timer) {
   const clientPath = path.join(dirName, remoteConfig.clientName);
   debug('正在设置账号...');
   if (!listened) {
     listened = true;
     process.on('exit', () => {
       clientProcess.kill();
       clearInterval(timer);
     });
   }

   return setAccount(remoteConfig).then(() => {
     if (clientProcess) {
       debug('正在重启客户端...');
       clientProcess.kill();
     } else {
       debug(`正在启动客户端(${remoteConfig.clientVersion})...`);
     }
     clientProcess = childProcess.execFile(clientPath, () => {
       if (clientProcess.exitCode === 0) {
         debug('客户端已经退出，感谢使用');
         clearInterval(timer);
       }
     });
     setTimeout(() => {
       debug('OK, 现在可以科学上网');
     }, 1500);
     return clientProcess.pid;
   });
 }
 module.exports = {
   downloadClient,
   startClient,
 };

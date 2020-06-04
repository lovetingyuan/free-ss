const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')
const fetchConfig = require('../lib/data')

const WindowsBalloon = require('node-notifier').WindowsBalloon;

const notifier = new WindowsBalloon({
  withFallback: false, // Try Windows Toast and Growl first?
  customPath: path.resolve(__dirname, 'notifu.exe') // Relative/Absolute path if you want to use your fork of notifu
});

const defaultGuiConfig = {
  "version": "4.1.10.0",
  "configs": [],
  "strategy": "com.shadowsocks.strategy.ha",
  "index": -1,
  "global": false,
  "enabled": true,
  "shareOverLan": false,
  "isDefault": false,
  "isIPv6Enabled": false,
  "localPort": 1080,
  "portableMode": true,
  "showPluginOutput": true,
  "pacUrl": null,
  "gfwListUrl": null,
  "useOnlinePac": false,
  "secureLocalPac": true,
  "availabilityStatistics": false,
  "autoCheckUpdate": true,
  "checkPreRelease": false,
  "isVerboseLogging": true,
  "logViewer": {
    "topMost": false,
    "wrapText": false,
    "toolbarShown": false,
    "Font": "Consolas, 8pt",
    "BackgroundColor": "Black",
    "TextColor": "White"
  },
  "proxy": {
    "useProxy": false,
    "proxyType": 0,
    "proxyServer": "",
    "proxyPort": 0,
    "proxyTimeout": 3,
    "useAuth": false,
    "authUser": "",
    "authPwd": ""
  },
  "hotkey": {
    "SwitchSystemProxy": "",
    "SwitchSystemProxyMode": "",
    "SwitchAllowLan": "",
    "ShowLogs": "",
    "ServerMoveUp": "",
    "ServerMoveDown": "",
    "RegHotkeysAtStartup": false
  }
}

if (process.platform !== 'win32') {
  console.log('sorry, this script could only run at windows os.')
  process.exit(0)
}

const SS = fs.readdirSync(__dirname).find(v => v.startsWith('Shadowsocks') && v.endsWith('.exe'))

function notify(title, message) {
  notifier.notify(
    {
      title,
      message: message || title,
      sound: false, // true | false.
      time: 1000, // How long to show balloon in ms
      wait: false, // Wait for User Action against Notification
      type: 'info' // The notification type : info | warn | error
    },
    function (error, response) {
      setTimeout(() => {
        process.exit(0)
      }, 100);
    }
  );
}

function findPid() {
  const ret = childProcess.execSync(`tasklist /FI "IMAGENAME eq ${SS}" /FO csv /NH`).toString('utf8')
  if (!ret.includes(SS)) return
  const targetProcess = ret.toString('utf8').trim().split('\r\n')
  if (targetProcess.length) {
    const pid = targetProcess[0].split(',').map(v => v.trim())[1]
    const _pid = Number.parseInt(JSON.parse(pid), 10)
    if (!Number.isNaN(_pid)) return _pid
  }
}

function killProcess(pid, sig = 'SIGINT') {
  if (typeof pid === 'number') {
    process.kill(pid, sig)
  }
}

function startss() {
  const bin = path.posix.join(__dirname, SS)
  return childProcess.spawn(bin, {
    detached: true
  })
}

const genAccount = ([server, port, password, method]) => {
  return {
    "server": server,
    "server_port": port,
    "password": password,
    "method": method,
    "plugin": "",
    "plugin_opts": "",
    "plugin_args": "",
    "remarks": "",
    "timeout": 10
  }
}

const dirname = /snapshot/.test(__dirname) ? process.cwd() : __dirname

const Delay = function () {
  this.promise = new Promise((resolve, reject) => {
    this.resolve = resolve
    this.reject = reject
  })
}
function getRequest(url) {
  const { promise, resolve, reject } = new Delay()
  const request = require(url.split(':')[0])
  const req = request.get(url, function (res) {
    if (res.statusCode !== 200) {
      reject(new Error('Bad http code: ' + res.statusCode))
      return
    }
    const bodyChunks = [];
    res.on('data', function (chunk) {
      bodyChunks.push(chunk);
    }).on('end', function () {
      const body = Buffer.concat(bodyChunks);
      resolve(body.toString('utf8'))
    }).on('error', reject)
  });

  req.on('error', reject);
  return promise
}

function writeAccounts (accounts) {
  let guiConfig
  try {
    guiConfig = require('./gui-config.json')
  } catch (err) {
    guiConfig = defaultGuiConfig
  }
  guiConfig.configs = accounts.map(account => genAccount(account))
  const configPath = path.resolve(dirname, 'gui-config.json')
  fs.writeFileSync(configPath, JSON.stringify(guiConfig, null, 2))
}

function updateAccounts() {
  const { JSDOM } = require('jsdom')
  return getRequest(fetchConfig.normal.url + '?_t=' + Date.now()).then(data => {
    const dom = new JSDOM(data);
    const doc = dom.window.document
    const accounts = fetchConfig.normal.callback(doc)
    try { dom.window.close() } catch (err) {}
    writeAccounts(accounts)
  })
}

function updateAccountsByQR() {
  const qrImgDist = path.join(__dirname, 'ss_qrimg_temp')
  if (!fs.existsSync(qrImgDist)) {
    fs.mkdirSync(qrImgDist)
  }
  const PNG = require('pngjs').PNG
  const jsQR = require('jsqr')
  return getRequest(fetchConfig.qrcode.url + '?_t=' + Date.now()).then(data => {
    const { promise, resolve, reject } = new Delay()
    const result = []
    const uris = fetchConfig.qrcode.callback(data)
    if (!uris || !uris.length) {
      return reject(new Error('no available accounts.'))
    }
    uris.forEach((base64, i) => {
      const data = base64.replace(/^data:image\/\w+;base64,/, '');
      const file = path.resolve(qrImgDist, i + '.png')
      fs.writeFileSync(file, data, { encoding: 'base64' });
      fs.createReadStream(file).pipe(new PNG()).on("parsed", function () {
        const code = jsQR(this.data, this.width, this.height);
        if (code) {
          const account = Buffer.from(code.data.slice(5), 'base64').toString('utf8').trim()
          const [method, password, server, port] = account.split(/@|:/)
          result.push([server, port - 0, password, method])
        } else {
          result.push(null)
        }
        if (result.length === uris.length) {
          const accounts = result.filter(Boolean)
          if (!accounts.length) {
            reject(new Error('no available accounts.'))
          } else {
            resolve(accounts)
          }
        }
      });
    })
    return promise
  }).then(accounts => {
    writeAccounts(accounts)
    fs.readdirSync(qrImgDist).forEach(file => {
      fs.unlinkSync(path.join(qrImgDist, file))
    })
  })
}

function main() {
  console.log('Please wait...')
  Promise.resolve().then(() => {
    killProcess(findPid())
    return updateAccounts().catch(err => {
      console.log(err.message)
      return updateAccountsByQR()
    })
  }).then(() => {
    console.info('✈️  SS accounts updated!')
    startss()
    notify('Update successfully!')
  }).catch(err => {
    console.error('Error:')
    console.error(err)
    notify('Update failed!', err && err.message)
  })
}

main()

const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')
const fetchConfig = require('../../lib/data')
const pkg = require('./package.json')
const got = require('got')
const os = require('os')

const WindowsBalloon = require('node-notifier').WindowsBalloon;
const ssdir = path.resolve(__dirname, '../ss');

const notifier = new WindowsBalloon({
  withFallback: false, // Try Windows Toast and Growl first?
  customPath: path.join(ssdir, `notifu${os.arch() === 'x64' ? '64' : ''}.exe`) // Relative/Absolute path if you want to use your fork of notifu
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
  console.warn('Sorry, this program could only run at windows os.')
  process.exit(0)
}

const SS = fs.readdirSync(ssdir).find(v => v.startsWith('Shadowsocks') && v.endsWith('.exe'))

function notify(message, exit = true) {
  notifier.notify(
    {
      title: '✈️ SS Accounts',
      message: message || title,
      sound: false, // true | false.
      time: 1000, // How long to show balloon in ms
      wait: false, // Wait for User Action against Notification
      type: 'info' // The notification type : info | warn | error
    },
    function () {
      exit && setTimeout(() => {
        process.exit(0)
      }, 100);
    }
  );
}

function startss() {
  const ret = childProcess.execSync(`tasklist /FI "IMAGENAME eq ${SS}" /FO csv /NH`).toString('utf8')
  if (ret.includes(SS)) {
    const targetProcess = ret.toString('utf8').trim().split('\r\n')
    if (targetProcess.length) {
      const pid = targetProcess[0].split(',').map(v => v.trim())[1]
      const _pid = Number.parseInt(JSON.parse(pid), 10)
      if (!Number.isNaN(_pid)) {
        process.kill(_pid, 'SIGINT')
      }
    }
  }
  const bin = path.posix.join(ssdir, SS)
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

function getRequest(url, headers = {}) {
  return got(url, {
    headers
  }).then(res => {
    return res.body;
  })
}

function writeAccounts(accounts) {
  let guiConfig
  try {
    guiConfig = require('./gui-config.json')
  } catch (err) {
    guiConfig = defaultGuiConfig
  }
  guiConfig.configs = accounts.map(account => genAccount(account))
  const configPath = path.resolve(ssdir, 'gui-config.json')
  fs.writeFileSync(configPath, JSON.stringify(guiConfig, null, 2))
}

function updateAccounts() {
  const { JSDOM } = require('jsdom')
  return getRequest(fetchConfig.normal.url + '?_t=' + Date.now()).then(data => {
    const dom = new JSDOM(data);
    const accounts = fetchConfig.normal.callback(dom.window.document)
    try { dom.window.close() } catch (err) { }
    return accounts
  }).catch(noop)
}

function updateAccountsByQR() {
  const PNG = require('pngjs').PNG
  const jsQR = require('jsqr')
  return getRequest(fetchConfig.qrcode.url + '?_t=' + Date.now()).then(data => {
    const uris = fetchConfig.qrcode.callback(data)
    const accounts = uris.map((base64) => {
      const base64str = base64.replace(/^data:image\/\w+;base64,/, '');
      const { data, width, height } = PNG.sync.read(Buffer.from(base64str, 'base64'));
      const code = jsQR(data, width, height);
      if (code) {
        const account = Buffer.from(code.data.slice(5), 'base64').toString('utf8').trim()
        const [method, password, server, port] = account.split(/@|:/)
        const _account = [server, port - 0, password, method]
        if (_account.filter(Boolean).length === 4) {
          return _account
        }
      }
    }).filter(Boolean)
    return accounts
  }).catch(noop)
}

function checkUpdate() {
  getRequest('https://api.github.com/repos/lovetingyuan/free-ss/contents/windows/package.json', {
    'content-type': 'application/json',
    accept: 'application/vnd.github.VERSION.raw',
    'user-agent': 'nodejs-chrome-' + Date.now()
  }).then(res => {
    res = JSON.parse(res)
    if (res.version !== pkg.version) {
      notify('💡 有新的版本', false)
    }
  }).catch(noop)
}

function noop() {}
function main() {
  console.log('🙂 Please wait...')
  checkUpdate()
  Promise.all([
    updateAccounts(),
    updateAccountsByQR()
  ]).then(([accounts1, accounts2]) => {
    const accounts = [
      ...Array.isArray(accounts1) ? accounts1 : [],
      ...Array.isArray(accounts2) ? accounts2 : [],
    ]
    if (!accounts.length) {
      notify('😔 暂无可用账号')
    } else {
      writeAccounts(accounts)
      startss()
      console.info('✈️  SS accounts updated!')
      notify('😊 更新成功')
    }
  })
}

main()

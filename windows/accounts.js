const { JSDOM } = require('jsdom')
const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')
const fetchData = require('../lib/data')

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
  const bin = path.posix.join(__dirname, 'snoretoast-x86.exe')
  return childProcess.spawn(bin, ['-t', title, '-m', message || title, '-silent'], {
    detached: true
  })
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
const CONFIGPATH = path.resolve(dirname, 'gui-config.json')

function updateAccounts() {
  return JSDOM.fromURL(fetchData.url + '?_t=' + Date.now(), {
  }).then(dom => {
    const doc = dom.window.document
    const accounts = fetchData.callback(doc)
    let guiConfig
    try {
      guiConfig = require('./gui-config.json')
    } catch (err) {
      guiConfig = defaultGuiConfig
    }
    guiConfig.configs = accounts.map(account => genAccount(account))
    fs.writeFileSync(CONFIGPATH, JSON.stringify(guiConfig, null, 2))
    try { dom.window.close() } catch (err) { }
  })
}

function main() {
  Promise.resolve().then(() => {
    killProcess(findPid())
    return updateAccounts()
  }).then(() => {
    console.info('ss accounts updated!')
    startss()
    notify('Update successfully!')
  }).then(() => {
    process.exit(0)
  }).catch(err => {
    console.error('Error:')
    console.error(err)
    notify('Update failed!', err && err.message)
  })
}

main()


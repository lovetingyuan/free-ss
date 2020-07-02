const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')
const accountsProviders = require('../../lib/node')
const pkg = require('./package.json')
const got = require('got')
const os = require('os')

const WindowsBalloon = require('node-notifier').WindowsBalloon;

let ssdir = path.resolve(__dirname, '../ss');
if (__filename.endsWith('index.js')) {
  ssdir = path.resolve(__dirname, '../../ss')
}

const defaultGuiConfig = require('../ss/_gui-config.default.json')

if (process.platform !== 'win32') {
  console.warn('Sorry, this program could only run at windows os.')
  process.exit(0)
}

const SS = fs.readdirSync(ssdir).find(v => v.startsWith('Shadowsocks') && v.endsWith('.exe'))

function notify(message, exit = true) {
  notify.notifier = notify.notifier || new WindowsBalloon({
    withFallback: false, // Try Windows Toast and Growl first?
    customPath: path.join(ssdir, `notifu${os.arch() === 'x64' ? '64' : ''}.exe`) // Relative/Absolute path if you want to use your fork of notifu
  });
  notify.notifier.notify(
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
  const bin = path.join(ssdir, SS)
  return childProcess.spawn(bin, {
    detached: true
  })
}

const genAccount = ({server, port, password, method}) => {
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

function checkUpdate() {
  got('https://api.github.com/repos/lovetingyuan/free-ss/contents/windows/node/package.json', {
    headers: {
      'content-type': 'application/json',
      accept: 'application/vnd.github.VERSION.raw',
      'user-agent': 'nodejs-chrome-' + Date.now()
    }
  }).then(res => {
    res = JSON.parse(res.body)
    if (res.version !== pkg.version) {
      notify('💡 有新的版本', false)
    }
  }).catch(() => {})
}

function main() {
  console.log(' 🙂 Please wait...')
  checkUpdate()
  const tasks = accountsProviders.map(provider => {
    const { url, callback } = provider
    return got(url + '?_t=' + Date.now(), {
      headers: {}
    }).then(res => callback(res.body)).catch(err => [])
  })
  Promise.all(tasks).then(([accounts1, accounts2]) => {
    const accounts = accounts1.concat(accounts2)
    if (!accounts.length) {
      notify('😔 暂无可用账号')
    } else {
      writeAccounts(accounts)
      startss()
      console.info('✈️  SS accounts updated!')
      notify('😊 更新成功:' + accounts.length)
    }
  })
}

main()

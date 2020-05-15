const { JSDOM } = require('jsdom')
const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')

if (process.platform !== 'win32') {
  console.log('sorry, this script could only run at windows os.')
  process.exit(0)
}

const SS = 'Shadowsocks.exe'

function notify(title, message) {
  return childProcess.spawn('./snoretoast-x86.exe', ['-t', title, '-m', message || title], {
    detached: true
  })
}

function exitApp(delay = 1000) {
  setTimeout(() => {
    process.exit(0)
  }, delay);
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
  return childProcess.spawn('./' + SS, {
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
  return JSDOM.fromURL('https://my.ishadowx.biz/?_t=' + Date.now(), {
  }).then(dom => {
    const doc = dom.window.document
    const items = [...doc.querySelectorAll('.portfolio-item')]
    let guiConfig
    try {
      guiConfig = require('./gui-config.json')
    } catch (err) {
      guiConfig = require('./gui-config.default.json')
    }
    guiConfig.configs = []
    items.forEach(item => {
      const account = []
      item.querySelectorAll('h4').forEach((h4, i) => {
        const value = h4.textContent.split(':')[1]
        if (value) {
          account.push(i === 1 ? parseInt(value.trim(), 10) : value.trim())
        }
      })
      if (account.length === 4) {
        guiConfig.configs.push(genAccount(account))
      }
    })
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
    exitApp(300)
  }).catch(err => {
    console.error('Error:')
    console.error(err)
    notify('Update failed!', err && err.message)
  })
}

main()


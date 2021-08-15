const fetch = require('node-fetch')
const clipboardy = require('clipboardy');
const childProcess = require('child_process')
const path = require('path')
const fs = require('fs')
const ssDir = path.resolve(__dirname, 'shadowsocks')

const atob = (a) => {
  return Buffer.from(a, 'base64').toString('utf-8');
}
const request = url => {
  return fetch(url).then(r => {
    if (r.ok) return r.text()
    return Promise.reject(`fetch error: ${r.status}, ${r.statusText}`)
  })
}

function parseSSUrl (url) {
  url = url.slice('ss://'.length)
  const [mp, sp, remarks] = url.split(/@|#/)
  const [method, password] = atob(mp).split(':')
  const [server, port] = sp.split(':')
  return {
    server,
    server_port: Number(port),
    password,
    method,
    remarks: decodeURIComponent(remarks),
    timeout: 10,
    warnLegacyUrl: false
  }
}

function updateAccounts(accounts) {
  const configFile = path.resolve(ssDir, 'gui-config.json')
  if (!fs.existsSync(configFile)) {
    console.log('no shadowsocks config file, please run ss client first.')
    restartClient()
    setTimeout(() => {
      process.exit(0) 
    });
  }
  const config = require(configFile)
  config.configs = accounts;
  config.enabled = true
  console.log('updating ss config...')
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2))
}

function restartClient() {
  const ssbinName = 'Shadowsocks.exe'
  const ssbinPath = path.resolve(ssDir, ssbinName)
  const ret = childProcess.execSync(`tasklist /FI "IMAGENAME eq ${ssbinName}" /FO csv /NH`).toString('utf8')
  if (ret.includes(ssbinName)) {
    console.log('closing current client...')
    const targetProcess = ret.toString('utf8').trim().split('\r\n')
    if (targetProcess.length) {
      const pid = targetProcess[0].split(',').map(v => v.trim())[1]
      const _pid = Number.parseInt(JSON.parse(pid), 10)
      if (!Number.isNaN(_pid)) {
        process.kill(_pid, 'SIGINT')
      }
    }
    console.log('restarting ss client...')
  } else {
    console.log('starting ss client...')
  }
  return childProcess.spawn(ssbinPath, {
    detached: true
  })
}

function fetchAccounts() {
  console.log('start fetching accounts...')
  return request('https://raw.fastgit.org/freefq/free/master/v2').catch(() => {
    return request('https://bulink.me/sub/mn2fa/ss')
  }).then(r => {
    const str = atob(r)
    const ssAccounts = str.split('\n').filter(a => a.startsWith('ss://'))
    if (!ssAccounts.length) {
      return Promise.reject(new Error('no available accounts.'))
    }
    console.log(`fetched ${ssAccounts.length} accounts.`)
    clipboardy.writeSync(ssAccounts.join('\n'));
    return ssAccounts.map(parseSSUrl)
  })
}

function main () {
  return fetchAccounts().then(accounts => {
    if (accounts) {
      updateAccounts(accounts)
      restartClient()
      console.log('done, quit after 3 seconds.')
      setTimeout(() => {
        process.exit(0)
      }, 3000)
    }
  }).catch(err => {
    const msg = err instanceof Error ? err.message : (err ? err.toString() : 'unknown reason.')
    console.error('failed, ' + msg)
  })
}

main();

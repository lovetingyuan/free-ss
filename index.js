#! /usr/bin/node
const fetch = require('node-fetch')
const clipboardy = require('clipboardy');
const childProcess = require('child_process')
const path = require('path')
const fs = require('fs')

const atob = (a) => {
  return Buffer.from(a, 'base64').toString('utf-8');
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
  const configFile = path.resolve(__dirname, 'shadowsocks', 'gui-config.json')
  if (!fs.existsSync(configFile)) {
    console.log('no shadowsocks config file, please run ss first.')
    restartClient(true)
  } else {
    const config = require(configFile)
    config.configs = accounts;
    config.enabled = true
    console.log('updating ss config...')
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2))
    restartClient()
  }
}

function restartClient(first) {
  if (process.platform !== 'win32') {
    console.log('only support windows currently.')
    return
  }
  const ssbinName = 'Shadowsocks.exe'
  const ssbinPath = path.resolve(__dirname, 'shadowsocks', ssbinName)
  if (first) {
    childProcess.spawn(ssbinPath, {
      detached: true
    })
    setTimeout(() => {
      process.exit(0) 
    });
  }
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
  }
  console.log('starting ss client...')
  return childProcess.spawn(ssbinPath, {
    detached: true
  })
}

function fetchAccounts() {
  console.log('start fetching accounts...')
  return fetch('https://raw.fastgit.org/freev2/free/main/v2').then(res => res.text()).then(r => {
    const str = atob(r)
    const ssAccounts = str.split('\n').filter(a => a.startsWith('ss://'))
    if (!ssAccounts.length) {
      return console.log('No avaliable accounts.')
    }
    console.log(`fetched ${ssAccounts.length} accounts.`)
    clipboardy.writeSync(ssAccounts.join('\n'));
    return ssAccounts.map(parseSSUrl)
  }).catch(e => {
    console.warn('failed to fetch accounts, ' + e.message)
  })
}

function main () {
  return fetchAccounts().then(accounts => {
    return updateAccounts(accounts)
  }).then(() => {
    console.log('done!')
    process.exit(0)
  }).catch(err => {
    console.error(err)
  })
}

main();

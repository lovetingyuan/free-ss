const { JSDOM } = require('jsdom')
const fs = require('fs')
const path = require('path')
const notifier = require('node-notifier')

if (process.platform !== 'win32') {
  console.log('sorry, this script could only run at windows os.')
  process.exit(0)
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

try {
  require('./gui-config.json')
  updateAccounts()
} catch (err) {
  fs.writeFileSync(
    path.join(__dirname, 'gui-config.json'),
    JSON.stringify(require('./gui-config.default.json'), null, 2)
  )
  updateAccounts()
}

function updateAccounts() {
  return JSDOM.fromURL('https://my.ishadowx.biz/?_t=' + Date.now(), {
  }).then(dom => {
    const doc = dom.window.document
    const items = [...doc.querySelectorAll('.portfolio-item')]
    const guiConfig = require('./gui-config.json')
    guiConfig.configs = []
    items.forEach(item => {
      const account = []
        ;[...item.querySelectorAll('h4')].forEach((h4, i) => {
          const value = h4.textContent.split(':')[1]
          if (value) {
            account.push(i === 1 ? parseInt(value.trim(), 10) : value.trim())
          }
        })
      if (account.length === 4) {
        guiConfig.configs.push(genAccount(account))
      }
    })
    fs.writeFileSync(require.resolve('./gui-config.json'), JSON.stringify(guiConfig, null, 2))
    dom.window.close()
    console.info('free ss updated!')
    notifier.notify({
      title: 'Update successfully!',
      message: 'Please restart your shadowsocks client.',
      timeout: 1
    });
  }).catch(err => {
    console.error('Error:')
    console.error(err)
    notifier.notify({
      title: 'Update failed!',
      message: err && err.message,
      wait: true
    });
  });
}


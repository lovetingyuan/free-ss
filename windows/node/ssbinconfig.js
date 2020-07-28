const path = require('path')
const fs = require('fs')

let ssdir = path.resolve(__dirname, '../ss');
if (__filename.endsWith('index.js')) {
  ssdir = path.resolve(__dirname, '../../ss')
}

module.exports = {
  ssdir,
  updateGuiConfig (callback) {
    const defaultGuiConfig = require('../ss/_gui-config.default.json')
    const currentGuiConfigPath = path.resolve(ssdir, 'gui-config.json')
    let guiConfig = defaultGuiConfig
    if (!fs.existsSync(currentGuiConfigPath)) {
      fs.writeFileSync(currentGuiConfigPath, JSON.stringify(defaultGuiConfig))
    } else {
      guiConfig = JSON.parse(fs.readFileSync(currentGuiConfigPath, 'utf8'))
    }
    const newConfig = callback(guiConfig)
    fs.writeFileSync(currentGuiConfigPath, JSON.stringify(newConfig))
  },
  getSSBinInfo () {
    const SS = fs.readdirSync(ssdir).find(v => v.startsWith('Shadowsocks') && v.endsWith('.exe'))
    return [SS, path.join(ssdir, SS)]
  }
}

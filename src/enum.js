const homeDir = require('os').homedir();
module.exports = {
  dirName: homeDir + "/shadowsocks",
  clientName: homeDir + "/shadowsocks.exe",
  clientPath: homeDir + "/shadowsocks/shadowsocks.exe",
  configPath: homeDir + "/shadowsocks/gui-config.json",
}

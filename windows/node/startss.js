const childProcess = require('child_process')
const { updateGuiConfig, getSSBinInfo } = require('./ssbinconfig')

module.exports = function startss(accounts) {
  updateGuiConfig(config => {
    config.configs = accounts.map(({ server, port, password, method }) => ({
      "server": server,
      "server_port": port,
      "password": password,
      "method": method,
      "plugin": "",
      "plugin_opts": "",
      "plugin_args": "",
      "remarks": "",
      "timeout": 10
    }))
    return config
  })
  const [ssbinName, ssbinPath] = getSSBinInfo()
  const ret = childProcess.execSync(`tasklist /FI "IMAGENAME eq ${ssbinName}" /FO csv /NH`).toString('utf8')
  if (ret.includes(ssbinName)) {
    const targetProcess = ret.toString('utf8').trim().split('\r\n')
    if (targetProcess.length) {
      const pid = targetProcess[0].split(',').map(v => v.trim())[1]
      const _pid = Number.parseInt(JSON.parse(pid), 10)
      if (!Number.isNaN(_pid)) {
        process.kill(_pid, 'SIGINT')
      }
    }
  }
  return childProcess.spawn(ssbinPath, {
    detached: true
  })
}

var path = require('path');
function home(path) {
	return path.resolve(process.env.HOME, path);
}
var ss = 'shadowsocks';
module.exports = {
  dirName: home(ss),
  clientName: home(`${ss}.exe`),
  clientPath: home(`${ss}/${ss}.exe`),
  configPath: home(`${ss}/gui-config.json`),
};

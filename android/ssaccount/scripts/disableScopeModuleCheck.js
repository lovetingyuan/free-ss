const pluginpath = require.resolve('react-dev-utils/ModuleScopePlugin')

const fs = require('fs')

fs.writeFileSync(pluginpath, `
module.exports = class ModuleScopePlugin {
  constructor () {}
  apply (resolver) {
    resolver.hooks.file.tapAsync(
      'ModuleScopePlugin',
      (request, contextResolver, callback) => {
        // do nothing
        return callback()
      }
    );
  }
}
`)

module.exports = () => {}

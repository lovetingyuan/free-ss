function getAccount (server, port, method, password) {
  if ([...arguments].filter(Boolean).length !== arguments.length) return;
  return {
    server, port: typeof port !== 'number' ? parseInt(port, 10) : port, password, method
  }
}

module.exports = (parseHtml, parseQrcode, decodeBase64) => {
  return [{
    url: 'https://3.weiwei.in/2020.html',
    callback(htmlstr) {
      const doc = parseHtml(htmlstr)
      return [...doc.querySelectorAll('table tr')].map(tr => {
        const tds = [...tr.querySelectorAll('td')]
        if (tds.length < 4) return
        const [server, port, method, password] = tds.slice(0, 4).map(td => td.textContent.trim())
        return getAccount(server, port, method, password)
      }).filter(Boolean)
    }
  }, {
    url: 'https://io.freess.info/',
    callback(htmlstr) {
      const uris = htmlstr.match(/"data:image.+?"/g) || []
      let _async = false
      const _getAccount = code => {
        let accountstr = code.trim()
        if (!code.includes('@')) { // still base64
          accountstr = decodeBase64(code.slice('ss://'.length)).trim()
        }
        const [method, password, server, port] = accountstr.split(/@|:/)
        return getAccount(server, port, method, password)
      }
      const results = uris.map(v => {
        const base64 = v.slice(1, -1).trim()
        const qrcode = parseQrcode(base64)
        if (typeof qrcode.then === 'function') {
          _async = true
          return qrcode.then(_getAccount)
        } else {
          return _getAccount(qrcode)
        }
      })
      if (_async) {
        return Promise.all(results).then(accounts => accounts.filter(Boolean))
      }
      return results.filter(Boolean)
    }
  }]
}

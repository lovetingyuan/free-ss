function getAccount(server, port, method, password) {
  if ([...arguments].filter(Boolean).length !== arguments.length) return;
  return {
    server, port: typeof port !== 'number' ? parseInt(port, 10) : port, password, method
  }
}

module.exports.getAccount = getAccount

function decodeBase64 (base64) {
  if (typeof Buffer === 'function') {
    return Buffer.from(base64, 'base64').toString('utf8')
  } else if (typeof atob === 'function') {
    return atob(base64)
  }
}

module.exports.parseSSProtocol = function parseSSProtocol(ss) { // eg: ss://YWVLnd0ZjoxOTYwNg==
  if (!ss) return null
  let accountstr = ss.trim().slice('ss://'.length)
  if (!accountstr.includes('@')) { // still base64
    accountstr = decodeBase64(accountstr).trim()
  }
  const [method, password, server, port] = accountstr.split(/@|:/)
  return getAccount(server, port, method, password)
}

module.exports.parseQRcodeByUrl = async function parseQRcodeByUrl (uri, getRequest) {
  const parseQrResult = await getRequest('https://zxing.org/w/decode?u=' + encodeURIComponent(uri))
  if (parseQrResult) {
    const result = parseQrResult.match(/ss:\/\/.+?</mg)
    if (result && result.length) {
      return result[0].slice(0, -1)
    }
  }
  return ''
}

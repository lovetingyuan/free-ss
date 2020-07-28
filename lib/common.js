function getAccount(server, port, method, password) {
  if ([...arguments].filter(Boolean).length !== arguments.length) return;
  if (typeof port === 'string' && !/^\d+$/.test(port)) return
  if (password.includes('\n')) return
  if (method.includes('<') && method.includes('>')) return
  return {
    server, port: Number(port), password, method
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

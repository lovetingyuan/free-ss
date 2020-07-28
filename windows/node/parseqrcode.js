function parseQRcodeByBase64 (base64) {
  const PNG = require('pngjs').PNG
  const jsQR = require('jsqr')
  const base64str = base64.replace(/^data:image\/\w+;base64,/, '');
  const { data, width, height } = PNG.sync.read(Buffer.from(base64str, 'base64'));
  const code = jsQR(data, width, height);
  if (code) {
    return code.data
  }
  return '';
}

function parseQRcodeByUrl (url) {
  const got = require('got')
  return got('http://api.qrserver.com/v1/read-qr-code/?fileurl=' + encodeURIComponent(url), {
    responseType: 'json'
  }).then(res => {
    if (!res.body[0].symbol[0].error) return res.body[0].symbol[0].data
  }).catch(() => {
    return got('https://zxing.org/w/decode?u=' + encodeURIComponent(url)).then((parseQrResult) => {
      const result = parseQrResult.match(/ss:\/\/.+?</mg)
      if (result && result.length) {
        return result[0].slice(0, -1)
      }
    }).catch(() => '')
  })
}

module.exports = function parseQrcode (uri) {
  if (uri.startsWith('data:')) {
    return parseQRcodeByBase64(uri)
  }
  return parseQRcodeByUrl(uri)
}

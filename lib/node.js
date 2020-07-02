function parseHtml(html) {
  const jsdom = require('jsdom')
  const { JSDOM } = jsdom
  const doc = new JSDOM(html)
  global.window = doc.window;
  return doc.window.document;
}

function parseQrcode(base64) {
  const PNG = require('pngjs').PNG
  const jsQR = require('jsqr')
  let base64str = base64
  if (base64.startsWith('data:')) {
    base64str = base64.replace(/^data:image\/\w+;base64,/, '');
  }
  const { data, width, height } = PNG.sync.read(Buffer.from(base64str, 'base64'));
  const code = jsQR(data, width, height);
  if (code) {
    return code.data
  }
  return ''
}

function decodeBase64 (base64) {
  return Buffer.from(base64, 'base64').toString('utf8')
}

const main = require('./providers')

module.exports = main(parseHtml, parseQrcode, decodeBase64)

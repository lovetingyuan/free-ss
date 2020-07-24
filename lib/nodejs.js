function parseHtml(html) {
  const jsdom = require('jsdom')
  const { JSDOM } = jsdom
  const doc = new JSDOM(html)
  global.window = doc.window;
  return doc.window.document;
}

function parseQRcodeByBase64(uri) {
  const PNG = require('pngjs').PNG
  const jsQR = require('jsqr')
  const base64str = uri.replace(/^data:image\/\w+;base64,/, '');
  const { data, width, height } = PNG.sync.read(Buffer.from(base64str, 'base64'));
  const code = jsQR(data, width, height);
  if (code) {
    return code.data
  }
  return '';
}

module.exports = require('./providers')(parseHtml, parseQRcodeByBase64)

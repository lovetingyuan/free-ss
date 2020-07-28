module.exports = function parseHtml(html) {
  const jsdom = require('jsdom')
  const { JSDOM } = jsdom
  const doc = new JSDOM(html)
  global.window = doc.window;
  setTimeout(() => {
    doc.window.close() 
  });
  return doc.window.document;
}

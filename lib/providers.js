const { parseQRcodeByUrl, parseSSProtocol, getAccount } = require('./common')

module.exports = (parseHtml, parseQRcodeByBase64) => {
  return [
    async function (getRequest) {
      const htmlstr = await getRequest('https://3.weiwei.in/2020.html' + '?_t=' + Date.now())
      if (!htmlstr) return []
      const doc = parseHtml(htmlstr)
      return [...doc.querySelectorAll('table tr')].map(tr => {
        const tds = [...tr.querySelectorAll('td')]
        if (tds.length < 4) return
        const [server, port, method, password] = tds.slice(0, 4).map(td => td.textContent.trim())
        return getAccount(server, port, method, password)
      }).filter(Boolean)
    },
    async function (getRequest) {
      const htmlstr = await getRequest('https://io.freess.info/' + '?_t=' + Date.now())
      if (!htmlstr || !/"data:image/.test(htmlstr)) return []
      const results = (htmlstr.match(/"data:image.+?"/g) || []).map(async (v) => {
        const base64 = v.slice(1, -1).trim()
        return parseSSProtocol(await parseQRcodeByBase64(base64))
      })
      return Promise.all(results).then(accounts => accounts.filter(Boolean))
    },
    async function (getRequest) {
      const url = 'https://my.freeshadowsocks.org/'
      const htmlstr = await getRequest(url + '?_t=' + Date.now())
      if (!htmlstr) return []
      const doc = parseHtml(htmlstr)
      const results = Array.from(doc.querySelectorAll('.ss a[href$=".png"]')).map(async (a) => {
        let href = a.getAttribute('href')
        if (!href.startsWith('http')) {
          href = url + (href[0] === '/' ? href.slice(1) : href)
        }
        return parseSSProtocol(await parseQRcodeByUrl(href, getRequest))
      })
      return Promise.all(results).then(accounts => accounts.filter(Boolean))
    }
  ]
}

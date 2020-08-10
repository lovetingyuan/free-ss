const { parseSSProtocol, getAccount } = require('./common')

module.exports = (getRequest, parseHtml, parseQrcode) => {
  return [
    async function () {
      const htmlstr = await getRequest('https://my.ishadowx.biz/' + '?_t=' + Date.now())
      if (!htmlstr) return []
      const doc = parseHtml(htmlstr)
      return Array(...doc.querySelectorAll('.portfolio-item')).map(container => {
        const h4s = [...container.querySelectorAll('h4')]
        const [server, port, password, method] = h4s.map(n => n.textContent.trim().split(':')[1])
        return getAccount(server, port, method, password)
      }).filter(Boolean)
    },
    async function () {
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
    async function () {
      const htmlstr = await getRequest('https://io.freess.info/' + '?_t=' + Date.now())
      if (!htmlstr || !/"data:image/.test(htmlstr)) return []
      const results = (htmlstr.match(/"data:image.+?"/g) || []).map(async (v) => {
        const base64 = v.slice(1, -1).trim()
        return parseSSProtocol(await parseQrcode(base64))
      })
      return Promise.all(results).then(accounts => accounts.filter(Boolean))
    },
    async function () {
      const url = 'https://my.freeshadowsocks.org/'
      const htmlstr = await getRequest(url + '?_t=' + Date.now())
      if (!htmlstr) return []
      const doc = parseHtml(htmlstr)
      const results = Array.from(doc.querySelectorAll('.ss a[href$=".png"]')).map(async (a) => {
        let href = a.getAttribute('href')
        if (!href.startsWith('http')) {
          href = url + (href[0] === '/' ? href.slice(1) : href)
        }
        return parseSSProtocol(await parseQrcode(href))
      })
      return Promise.all(results).then(accounts => accounts.filter(Boolean))
    }
  ]
}

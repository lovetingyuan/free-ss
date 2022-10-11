import get from '../utils/get'

export default {
  name: 'weiwei',
  url: 'https://3.weiwei.in/2020.html',
  getAccounts() {
    return get('https://3.weiwei.in/2020.html').then((htmlStr) => {
      const domparser = new DOMParser()
      const doc = domparser.parseFromString(htmlStr, 'text/html')

      return Array.from(doc.querySelectorAll('table tr'))
        .map((tr) => {
          const tds = Array.from(tr.querySelectorAll('td'))
          if (tds.length < 4) return
          const [server, port, method, password] = tds
            .slice(0, 4)
            .map((td) => td.textContent?.trim())
          return `ss://${btoa(
            `${method}:${password}@${server}:${port}`
          )}#weiwei`
        })
        .filter(Boolean)
    })
  },
}

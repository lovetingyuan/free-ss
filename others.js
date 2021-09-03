
const { createDocument } = require('domino')
const { PNG } = require('pngjs')
const jsQR = require('jsqr')
const fetch = require('node-fetch')

function getAccount(server, port, method, password) { // check account validation
  if ([...arguments].filter(Boolean).length !== arguments.length) return;
  if (typeof port === 'string' && !/^\d+$/.test(port)) return
  if (password.includes('\n')) return
  if (method.includes('<') && method.includes('>')) return
  return {
    server, port: Number(port), password, method
  }
}

function parseSSUrl(ss) { // eg: ss://YWVLnd0ZjoxOTYwNg==
  if (!ss) return null
  let accountStr = ss.trim().slice('ss://'.length)
  if (!accountStr.includes('@')) {
    accountStr = Buffer.from(accountStr, 'base64').toString('utf8').trim()
  }
  const [method, password, server, port] = accountStr.split(/@|:/)
  return getAccount(server, port, method, password)
}

function request(url, headers = {}) {
  let resolve, reject;
  const task = new Promise((...args) => {
    [resolve, reject] = args
    fetch(url, {
      headers: {
        'content-type': 'text/html',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36',
        ...headers
      },
    }).then(r => r.text()).then(resolve, reject)
  })
  setTimeout(() => {
    reject(new Error(`request for ${url} is timeout`))
  }, 15 * 1000);
  return task
}

function parseQRCode(uri) {
  if (uri.startsWith('data:image/')) {
    const base64 = uri.replace(/^data:image\/\w+;base64,/, '');
    const { data, width, height } = PNG.sync.read(Buffer.from(base64, 'base64'));
    const code = jsQR(data, width, height);
    return code ? code.data : ''
  }
  return fetch('http://api.qrserver.com/v1/read-qr-code/?fileurl=' + encodeURIComponent(uri))
    .then(r => r.json())
    .then(res => {
      if (!res[0].symbol[0].error) return res[0].symbol[0].data
      return Promise.reject()
    }).catch(() => {
      return fetch('https://zxing.org/w/decode?u=' + encodeURIComponent(uri)).then(r => r.text())
        .then((parseQrResult) => {
          const result = parseQrResult.match(/ss:\/\/.+?</mg)
          if (result && result.length) {
            return result[0].slice(0, -1)
          }
        }).catch(() => '')
    })
}

const accountsProviders = {
  async 'https://my.ishadowx.biz/'(url) {
    const htmlStr = await request(url)
    if (!htmlStr) return []
    const doc = createDocument(htmlStr)
    return Array.from(doc.querySelectorAll('.portfolio-item')).map(container => {
      const h4s = Array.from(container.querySelectorAll('h4'))
      const [server, port, password, method] = h4s.map(n => n.textContent.trim().split(':')[1])
      return getAccount(server, port, method, password)
    }).filter(Boolean)
  },
  async 'https://3.weiwei.in/2020.html'(url) {
    const htmlStr = await request(url)
    if (!htmlStr) return []
    const doc = createDocument(htmlStr)
    return Array.from(doc.querySelectorAll('table tr')).map(tr => {
      const tds = Array.from(tr.querySelectorAll('td'))
      if (tds.length < 4) return
      const [server, port, method, password] = tds.slice(0, 4).map(td => td.textContent.trim())
      return getAccount(server, port, method, password)
    }).filter(Boolean)
  },
  async 'https://io.freess.info/'(url) {
    const htmlStr = await request(url)
    if (!htmlStr || !/"data:image\//.test(htmlStr)) return []
    const tasks = (htmlStr.match(/"data:image\/.+?"/g) || []).map(async (v) => {
      const base64 = v.slice(1, -1).trim()
      return parseSSUrl(await parseQRCode(base64))
    })
    return Promise.all(tasks).then(accounts => accounts.filter(Boolean))
  },
  // async 'https://get.freeshadowsocks.org/'(url) {
  //   const htmlStr = await request(url)
  //   if (!htmlStr) return []
  //   const doc = createDocument(htmlStr)
  //   const results = Array.from(doc.querySelectorAll('.ss a[href$=".png"]')).map(async (a) => {
  //     let href = a.getAttribute('href')
  //     if (!href.startsWith('http')) {
  //       href = url + (href[0] === '/' ? href.slice(1) : href)
  //     }
  //     return parseSSUrl(await parseQRCode(href))
  //   })
  //   return Promise.all(results).then(accounts => accounts.filter(Boolean))
  // }
}

module.exports = function main() {
  const start = Date.now()
  const tasks = Object.entries(accountsProviders).map(([url, handler], i) => {
    return handler(url).then(res => {
      console.log(`${i + 1}(${res.length}) done, spend ${Math.round((Date.now() - start)/ 1000)}s.`)
      return res
    }).catch(err => {
      console.log(`${i + 1}(${url}) failed: ${err && err.message}.`)
      return []
    })
  })
  return Promise.all(tasks).then((accountsList) => {
    return accountsList
      .reduce((a, b) => a.concat(b), [])
      .filter(Boolean)
      .map(({ server, port, password, method }) => {
        return 'ss://' + Buffer.from(`${method}:${password}@${server}:${port}`, 'utf-8').toString('base64') + '#' + server
      })
  })
}

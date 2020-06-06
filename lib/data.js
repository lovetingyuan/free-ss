module.exports = {
  normal: [{
    // url: 'https://iss.ishadow.pub/',
    url: 'https://my.ishadowx.biz/',
    callback(doc) {
      const items = [...doc.querySelectorAll('.portfolio-item')]
      const accounts = []
      /**
       * [
       *    [server, port, password, method]
       * ]
       */
      items.forEach(item => {
        const account = []
        item.querySelectorAll('h4').forEach((h4, i) => {
          const value = h4.textContent.split(':')[1]
          if (value) {
            account.push(i === 1 ? parseInt(value.trim(), 10) : value.trim())
          }
        })
        if (account.filter(Boolean).length === 4) {
          accounts.push(account)
        }
      })
      return accounts
    }
  }, {
    url: 'https://3.weiwei.in/2020.html',
    callback(doc) {
      const accounts = []
        ;[...doc.querySelectorAll('table tr')].forEach(tr => {
          const tds = [...tr.querySelectorAll('td')]
          if (tds.length < 4) return
          const [server, port, method, password] = tds.slice(0, 4).map(td => td.textContent.trim())
          const account = [server, parseInt(port, 10), password, method]
          if (account.filter(Boolean).length === 4) {
            accounts.push(account)
          }
        })
      return accounts
    }
  }][1],
  qrcode: {
    url: 'https://io.freess.info/',
    callback(htmlstr) {
      const uris = htmlstr.match(/"data:image.+?"/g) || []
      return uris.map(v => v.slice(1, -1).trim())
    }
  }
}

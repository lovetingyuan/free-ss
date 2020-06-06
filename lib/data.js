module.exports = {
  normal: {
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
  },
  qrcode: {
    url: 'https://io.freess.info/',
    callback(htmlstr) {
      const uris = htmlstr.match(/"data:image.+?"/g) || []
      return uris.map(v => v.slice(1, -1).trim())
    }
  }
}

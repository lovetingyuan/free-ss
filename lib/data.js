module.exports = {
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
      if (account.length === 4) {
        accounts.push(account)
      }
    })
    return accounts
  }
}

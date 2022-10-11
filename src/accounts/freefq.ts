import get from '../utils/get'
import normalizeAccount from '../utils/normalizeAccount'

export default {
  name: 'freefq',
  url: 'https://github.com/freefq/free',
  getAccounts() {
    return get('https://raw.fastgit.org/freefq/free/master/v2').then((r) => {
      const str = atob(r)
      return str
        .split('\n')
        .map((v) => v.trim())
        .filter((a) => a.startsWith('ss://'))
        .map(normalizeAccount)
    })
  },
}

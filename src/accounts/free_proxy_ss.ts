import get from '../utils/get'
import normalizeAccount from '../utils/normalizeAccount'

export default {
  name: 'proxy ss',
  url: 'https://github.com/learnhard-cn/free_proxy_ss',
  getAccounts() {
    return get(
      'https://ghproxy.com/https://raw.githubusercontent.com/learnhard-cn/free_proxy_ss/main/free'
    ).then((r) => {
      const str = atob(r)
      return str
        .split('\n')
        .map((v) => v.trim())
        .filter((a) => a.startsWith('ss://'))
        .map(normalizeAccount)
    })
  },
}

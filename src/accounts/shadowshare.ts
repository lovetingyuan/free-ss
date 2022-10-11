import get from '../utils/get'
import normalizeAccount from '../utils/normalizeAccount'

export default {
  name: 'shadowshare',
  url: 'https://github.com/Pawdroid/Free-servers',
  getAccounts() {
    return get(
      `https://ghproxy.com/https://raw.githubusercontent.com/Pawdroid/Free-servers/main/sub`
    ).then((res) => {
      return atob(res)
        .trim()
        .split('\n')
        .map((v) => {
          if (v.startsWith('ss://')) {
            return normalizeAccount(v)
          }
        })
        .filter(Boolean)
    })
  },
}

// https://gateway.ipfs.io/ipns/k2k4r8n888sny0v16vyfxbjwqrk0vgvh9k84xixh5k6ejdywbdc509ax/
// https://github.com/vpei/Free-Node-Merge
import get from '../utils/get'
import normalizeAccount from '../utils/normalizeAccount'

export default {
  name: 'node merge',
  url: 'https://github.com/vpei/Free-Node-Merge',
  getAccounts() {
    return get(
      'https://raw.iqiq.io/vpei/Free-Node-Merge/main/out/node.txt'
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

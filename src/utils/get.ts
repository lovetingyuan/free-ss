import { fetch, ResponseType } from '@tauri-apps/api/http'

export default function get(url: string) {
  const { hostname, origin } = new URL(url)
  return fetch<string>(url, {
    method: 'GET',
    responseType: ResponseType.Text,
    timeout: 60,
    headers: {
      origin,
      host: hostname,
      referrer: url,
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.102 Safari/537.36 Edg/104.0.1293.70',
    },
  }).then((res) => {
    if (res.ok) return res.data
    return Promise.reject(new Error(`网络错误:${res.status}@${hostname}`))
  })
}

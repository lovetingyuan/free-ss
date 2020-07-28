import { HTTP } from '@ionic-native/http'
import jsQR from 'jsqr'
import providers from 'providers'

export const getRequest = (url: string, headers?: any): Promise<string> => {
  const _url = new URL(url)
  return HTTP.get(url, {}, Object.assign({
    'User-Agent': 'ionic-' + Date.now(),
    'Host': _url.host,
  }, headers)).then(res => {
    if (res.status === 200) {
      return res.data
    }
    return ''
  })
}

export const parseHtml = (html: string) => {
  const domparser = new DOMParser()
  return domparser.parseFromString(html, 'text/html')
}

function parseQRcodeByBase64 (base64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const id = '__$$canvas__'
    const err = new Error('Failed to parse QR code.')
    let canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) {
      canvas = document.createElement('canvas')
      canvas.id = id
      canvas.style.display = 'none'
      document.body.appendChild(canvas)
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return reject(err)
    }
    const image = new Image();
    image.onload = function () {
      canvas.width = image.width
      canvas.height = image.height
      try {
        ctx.drawImage(image, 0, 0);
        const { data, width, height } = ctx.getImageData(0, 0, image.width, image.height)
        const code = jsQR(data, width, height);
        if (code) {
          resolve(code.data)
        } else {
          reject(err)
        }
      } catch (err) {
        reject(err)
      }
    };
    image.onerror = reject
    image.src = base64
  })
}

function parseQRcodeByUrl (url: string) {
  console.log(url)
  return getRequest('http://api.qrserver.com/v1/read-qr-code/?fileurl=' + encodeURIComponent(url)).then(res => {
    console.log(11, res)
    const _res = JSON.parse(res) as any
    if (!_res[0].symbol[0].error) return _res[0].symbol[0].data
  }).catch(() => {
    return getRequest('https://zxing.org/w/decode?u=' + encodeURIComponent(url)).then((parseQrResult) => {
      console.log(22, parseQrResult)
      const result = parseQrResult.match(/ss:\/\/.+?</mg)
      if (result && result.length) {
        return result[0].slice(0, -1)
      }
    }).catch(() => '')
  })
}

export function parseQrcode (uri: string) {
  if (uri.startsWith('data:')) {
    return parseQRcodeByBase64(uri)
  }
  return parseQRcodeByUrl(uri)
}

export default providers(getRequest, parseHtml, parseQrcode)

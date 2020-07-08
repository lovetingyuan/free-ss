import jsQR from 'jsqr'
import main from './providers'

export function parseHtml(html) {
  const domparser = new DOMParser()
  return domparser.parseFromString(html, 'text/html')
}

export function parseQRcodeByBase64(base64) {
  const { promise, resolve, reject } = new function () {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }
  const id = '__canvas__'
  const err = new Error('Failed to parse QR code.')
  let canvas = document.getElementById(id);
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
  return promise
}

export default main(parseHtml, parseQRcodeByBase64)

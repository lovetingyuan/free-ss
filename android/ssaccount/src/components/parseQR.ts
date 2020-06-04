import jsQR from "jsqr";

const Delay = function (this: any) {
  this.promise = new Promise((resolve, reject) => {
    this.resolve = resolve
    this.reject = reject
  })
} as any as {
  new(): {
    promise: Promise<string>, resolve: (a: any) => any, reject: (a: any) => any
  }
}

const parseQR = (base64: string): Promise<any> => {
  const { promise, resolve, reject } = new Delay()
  const id = '__canvas__'
  const err = new Error('Failed to parse QR code.')
  let canvas = document.getElementById(id) as HTMLCanvasElement
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
        const account = atob(code.data.slice(5)).trim()
        const [method, password, server, port] = account.split(/@|:/)
        resolve([server, parseInt(port, 10), password, method])
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

export default parseQR

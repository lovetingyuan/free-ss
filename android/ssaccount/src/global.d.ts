
declare interface Account {
  server: string
  port: number
  password: string
  method: string
}

declare module '../../../../lib/browser' {
  interface Provider {
    url: string
    callback: (a: string) => Account[]
  }
  var a: Provider[]
  export default a;
}

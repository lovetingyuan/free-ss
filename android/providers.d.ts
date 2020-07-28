declare interface Account {
  server: string
  port: number
  password: string
  method: string
}

declare module "providers" {
  interface Providers {
    (a: Function, b: (html: string) => Document, c: (url: string) => Promise<string>): (() => Promise<Account>)[]
  }
  const providers: Providers
  export default providers
}

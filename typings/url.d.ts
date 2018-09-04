interface URL {
  href: string
  readonly origin: string
  protocol: string
  username: string
  password: string
  host: string
  hostname: string
  port: string
  pathname: string
  search: string
  readonly searchParams: URLSearchParams
  hash: string

  toJSON(): string
  toString(): string
}

interface URLSearchParams extends Map<string, string> {
  append(name: string, value: string): void
  delete(name: string): boolean
  get(name: string): string | undefined
  getAll(name: string): string[]
  has(name: string): boolean
  set(name: string, value: string): this

  sort(): void

  toString(): string
}

declare const URL: {
  prototype: URL
  new(url: string, base?: string | URL): URL
  createObjectURL(object: any): string
  revokeObjectURL(url: string): void
}

interface Console {
  log(...p: any[]): void
}

interface Clients {
  claim(): Promise<void>
}

interface ExtendableEvent {
  readonly request: Request
  waitUntil(p: Promise<any>): void
  respondWith(p: Promise<any>): void
}

interface ServiceWorkerGlobalScope {
  readonly clients: Clients
  skipWaiting(): Promise<void>
  addEventListener(event: string, cb: (event: ExtendableEvent) => any): void
}

interface Performance {
  now(): number
}

declare const console: Console
declare const self: ServiceWorkerGlobalScope
declare const performance: Performance

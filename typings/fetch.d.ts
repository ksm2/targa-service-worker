interface Request {
  readonly url: string
  readonly method: string
}

declare const Request: {
  new(url: string): Request
}

interface Response {
  body: ReadableStream<Uint8Array>
}

interface ResponseOptions {
  headers: { [headerName: string]: string }
}

declare const Response: {
  new(rs: ReadableStream<Uint8Array>, options: ResponseOptions): Response
}

declare function fetch(r: Request | string): Promise<Response>;

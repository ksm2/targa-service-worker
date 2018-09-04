interface BlobPropertyBag {
  type?: string;
}

interface Blob {
  readonly size: number
  readonly type: string

  slice(start?: number, end?: number, contentType?: string): Blob
}

declare var Blob: {
  prototype: Blob
  new(blobParts?: BlobPart[], options?: BlobPropertyBag): Blob
}

interface Body {
  readonly body: ReadableStream<Uint8Array>
  readonly bodyUsed: boolean

  arrayBuffer(): Promise<ArrayBuffer>
  blob(): Promise<Blob>
  json(): Promise<any>
  text(): Promise<string>
}

interface Headers {
  append(name: string, value: string): void;
  delete(name: string): void;
  get(name: string): string | null;
  has(name: string): boolean;
  set(name: string, value: string): void;
  forEach(callbackfn: (value: string, key: string, parent: Headers) => void, thisArg?: any): void;
}

declare var Headers: {
  prototype: Headers;
  new(init?: HeadersInit): Headers;
};

interface Request extends Body {
  readonly url: string
  readonly method: string
}

declare const Request: {
  new(url: string): Request
}

interface Response extends Body {
}

interface ResponseInit {
  headers?: HeadersInit;
  status?: number;
  statusText?: string;
}

declare const Response: {
  prototype: Response;
  new(body?: BodyInit | null, init?: ResponseInit): Response;
  error(): Response;
  redirect(url: string, status?: number): Response;
}

declare function fetch(r: Request | string): Promise<Response>
type BlobPart = BufferSource | Blob | string
type BodyInit = Blob | BufferSource | URLSearchParams | ReadableStream<Uint8Array> | string
type BufferSource = ArrayBufferView | ArrayBuffer
type HeadersInit = Headers | string[][] | Record<string, string>;

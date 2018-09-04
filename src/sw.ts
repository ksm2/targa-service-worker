import { TargaToPNGTransformer } from './TargaToPNGTransformer'

self.addEventListener('install', (e) => {
  e.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  const url = new URL(request.url)

  if (url.pathname.endsWith('.tga')) {
    console.log(`Handle Targa request ${url}`)
    e.respondWith(handleTargaRequest(request))
  }
})

async function handleTargaRequest(request: Request): Promise<Response> {
  // Fetch Targa image
  const response = await fetch(request)

  // Get Readable Stream of it
  const rs = response.body!

  // Transform Targa image data to PNG via a transform stream
  const transformer = new TransformStream(new TargaToPNGTransformer())
  const pngStream = rs.pipeThrough(transformer)

  // Write PNG data to new response
  const headers = { 'content-type': 'image/png' }
  return new Response(pngStream, { headers })
}

/**
 * Concats a byte array to a given buffer.
 */
export function concatByteArray(buffer: ArrayBuffer | SharedArrayBuffer, byteArray: Uint8Array): Uint8Array {
  if (!byteArray.length) {
    return new Uint8Array(buffer)
  }

  if (!buffer.byteLength) {
    return byteArray
  }

  const result = new Uint8Array(buffer.byteLength + byteArray.byteLength)
  result.set(new Uint8Array(buffer), 0)
  result.set(byteArray, buffer.byteLength)

  return result
}

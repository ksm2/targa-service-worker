/**
 * Create the initial CRC table needed to calculate the checksums.
 */
function createCrcTable(): number[] {
  const crcTable = []
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1))
    }
    crcTable[n] = c
  }

  return crcTable
}

/**
 * Initialized CRC Table
 */
const CRC_TABLE = createCrcTable()

export function crc32(uint8Array: Uint8Array): number {
  let crc = 0 ^ (-1)

  for (const byte of uint8Array) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 0xFF]
  }

  return (crc ^ (-1)) >>> 0
}

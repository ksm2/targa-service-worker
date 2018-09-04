import { ByteBuffer } from './ByteBuffer'
import { PNGChunk, PNGColorType, PNGCompressionMethod, PNGFilterMethod, PNGHeader, PNGInterlaceMethod } from './pngs'
import { StreamProducer } from './StreamProducer'

/**
 * The PNGProducer writes PNG data to a stream.
 *
 * @author Konstantin Simon Maria Möllers
 */
export class PNGProducer extends StreamProducer {
  /**
   * Write the first 8 fixed bytes to the PNG stream.
   *
   * @see http://www.libpng.org/pub/png/spec/1.2/PNG-Structure.html#PNG-file-signature
   */
  writePNGMagic() {
    this.writeUint8Array(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]))
  }

  /**
   * Write the PNG header chunk to the PNG stream.
   */
  writePNGHeader(header: PNGHeader) {
    // Get properties from the header
    const {
      width,
      height,
      bitDepth = 8,
      colorType = PNGColorType.RGB,
      compressionMethod = PNGCompressionMethod.INFLATE_DEFLATE,
      filterMethod = PNGFilterMethod.ADAPTIVE,
      interlaceMethod = PNGInterlaceMethod.NONE,
    } = header

    // Write properties to a byte buffer
    const data = ByteBuffer.allocate(13)
      .writeUint32(width)
      .writeUint32(height)
      .writeUint8(bitDepth)
      .writeUint8(colorType)
      .writeUint8(compressionMethod)
      .writeUint8(filterMethod)
      .writeUint8(interlaceMethod)
      .flip()

    // Pack everything in a chunk and write it to the stream
    const chunk: PNGChunk = { data, type: 'IHDR' }
    this.writePNGChunk(chunk)
  }

  /**
   * Write the RGB + filter pixel rows to the PNG stream.
   */
  writePNGData(imageData: ByteBuffer) {
    // Apply DEFLATE on image data and write it to the stream
    const data = imageData.deflate()
    this.writePNGChunk({ data, type: 'IDAT' })
  }

  /**
   * Write the end chunk to the PNG stream.
   */
  writePNGEnd() {
    this.writePNGChunk({ type: 'IEND' })
  }

  /**
   * Writes any PNG chunk to the PNG stream.
   */
  writePNGChunk(chunk: PNGChunk) {
    // Write the chunk length to the PNG stream
    const length = chunk.data ? chunk.data.length : 0
    this.writeUint32(length)

    // Write type and data to new byte buffer
    const chunkByteArray = ByteBuffer.allocate(length + 4)
      .writeFixedLengthASCII(chunk.type)
    if (chunk.data) {
      chunkByteArray.writeByteArray(chunk.data)
    }
    chunkByteArray.flip()

    // Write data to the stream
    this.writeByteArray(chunkByteArray)

    // Calculate CRC32 on the new byte buffer
    this.writeUint32(chunkByteArray.crc32())
  }
}

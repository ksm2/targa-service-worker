import { StreamConsumer } from './StreamConsumer'
import { TargaBitDepth, TargaHeader, TargaType } from './targas'

/**
 * The TargaConsumer reads Targa image data from a stream.
 *
 * @author Konstantin Simon Maria Möllers
 */
export class TargaConsumer extends StreamConsumer {
  /**
   * Reads and validates the Targa header.
   */
  async readTargaHeader(): Promise<TargaHeader> {
    const header = await this.readTargaHeaderBlock()
    console.log('Read Targa header: %o', header)

    if (header.hasPalette) {
      throw new Error('Sorry, this implementation does not support Targas using palettes.')
    }

    if (header.type !== TargaType.BGR && header.bitDepth !== 24) {
      throw new Error('Sorry, this implementation only supports uncompressed 24 bit BGR encoded Targas.')
    }

    if (!header.startsTop || header.startsRight) {
      throw new Error('Sorry, this implementation only supports Targas starting on the top left.')
    }

    // Skip image ID
    await this.skipBytes(header.idLength)

    // Skip palette
    await this.skipBytes(header.paletteLength)

    return header
  }

  /**
   * Reads the Targa header block from the stream.
   */
  private async readTargaHeaderBlock(): Promise<TargaHeader> {
    const idLength = await this.readUint8()
    const hasPalette = await this.readBoolean()
    const type = await this.readUint8() as TargaType
    if (!(type in TargaType)) {
      throw new Error(`Found illegal image type: ${type}.`)
    }

    // Read palette information
    const paletteStart = await this.readUint16(true)
    const paletteLength = await this.readUint16(true)
    const bitsPerPalette = await this.readUint8()

    // Read dimensional information
    const left = await this.readUint16(true)
    const top = await this.readUint16(true)
    const width = await this.readUint16(true)
    const height = await this.readUint16(true)
    const bitDepth = await this.readUint8() as TargaBitDepth

    // Read image attribute information
    const attribs = await this.readUint8()
    const attribPerPixel = attribs & 0b00_0_0_1111
    const startsRight = (attribs & 0b00_0_1_0000) > 0
    const startsTop = (attribs & 0b00_1_0_0000) > 0

    return {
      idLength, hasPalette, type,
      paletteStart, paletteLength, bitsPerPalette,
      left, top, width, height, bitDepth,
      attribPerPixel, startsRight, startsTop,
    }
  }
}

import { concatByteArray } from './concatByteArray'

/**
 * A StreamConsumer receives byte arrays from an async iterator.
 *
 * @author Konstantin Simon Maria Möllers
 */
export class StreamConsumer {
  private readonly reader: AsyncIterator<Uint8Array | undefined>
  private view?: DataView
  private bytes?: Uint8Array
  private position: number = 0

  constructor(reader: AsyncIterator<Uint8Array | undefined>) {
    this.reader = reader
  }

  /**
   * Reads a signed 8 bit integer.
   */
  readInt8(): Promise<number> {
    return this.readData(1, (v, o) => v.getInt8(o))
  }

  /**
   * Reads an unsigned 8 bit integer.
   */
  readUint8(): Promise<number> {
    return this.readData(1, (v, o) => v.getUint8(o))
  }

  /**
   * Reads a signed 16 bit integer.
   */
  readInt16(littleEndian = false): Promise<number> {
    return this.readData(2, (v, o) => v.getInt16(o, littleEndian))
  }

  /**
   * Reads an unsigned 16 bit integer.
   */
  readUint16(littleEndian = false): Promise<number> {
    return this.readData(2, (v, o) => v.getUint16(o, littleEndian))
  }

  /**
   * Reads a signed 32 bit integer.
   */
  readInt32(littleEndian = false): Promise<number> {
    return this.readData(4, (v, o) => v.getInt32(o, littleEndian))
  }

  /**
   * Reads an unsigned 32 bit integer.
   */
  readUint32(littleEndian = false): Promise<number> {
    return this.readData(4, (v, o) => v.getUint32(o, littleEndian))
  }

  /**
   * Reads a boolean from an 8 bit integer.
   */
  readBoolean(): Promise<boolean> {
    return this.readData(1, (v, o) => v.getUint8(o) > 0)
  }

  /**
   * Reads a byte array with a given length.
   */
  async readUint8Array(byteLength: number): Promise<Uint8Array> {
    const [, bytes] = await this.ensureDataAvailable(byteLength)
    const uint8Array = bytes.slice(this.position, this.position + byteLength)
    this.position += byteLength

    return uint8Array
  }

  /**
   * Skips the given amount of bytes.
   */
  skipBytes(bytes: number): Promise<void> {
    return this.readData(bytes, () => {})
  }

  /**
   * Gets the remaining available data from the current read buffer.
   */
  getRemainingData(): ArrayBuffer {
    if (!this.view) {
      return new ArrayBuffer(0)
    }

    return this.view.buffer.slice(this.position)
  }

  /**
   * Reads arbitrary data with a given byte length from the stream.
   */
  protected async readData<T>(bytes: number, extractor: (dv: DataView, offset: number) => T): Promise<T> {
    // Is enough data available?
    const [view] = await this.ensureDataAvailable(bytes)

    // Extract data from data view with callback
    const returnValue = extractor(view, this.position)
    this.position += bytes

    return returnValue
  }

  /**
   * Ensures that enough data is readable. If not, more data is requested from the async iterator.
   */
  private async ensureDataAvailable(bytes: number): Promise<[DataView, Uint8Array]> {
    if (!this.view || !this.bytes || this.position + bytes > this.view.byteLength) {
      // Pull new data from the reader
      const { value, done } = await this.reader.next()
      if (done) {
        throw new Error(`Cannot read ${bytes} bytes of data because stream is closed.`)
      }
      const pulledData = value as Uint8Array
      console.log(`Downloaded ${pulledData.length} bytes of data`)

      // Create buffer from remaining data and pulled data
      this.bytes = concatByteArray(this.getRemainingData(), pulledData)

      // Assign new buffer to a data view and reset position
      this.view = new DataView(this.bytes.buffer)
      this.position = 0
    }

    return [this.view, this.bytes]
  }
}

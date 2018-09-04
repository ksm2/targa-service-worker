import { ByteBuffer } from './ByteBuffer'

/**
 * A StreamProducer receives an enqueueable object which byte arrays are written to.
 *
 * @author Konstantin Simon Maria Möllers
 */
export class StreamProducer {
  private readonly writer: EnqueueableInterface<Uint8Array>

  constructor(writer: EnqueueableInterface<Uint8Array>) {
    this.writer = writer
  }

  /**
   * Writes a signed 8 bit integer.
   */
  writeInt8(value: number): void {
    return this.writeData(1, v => v.setInt8(0, value))
  }

  /**
   * Writes an unsigned 8 bit integer.
   */
  writeUint8(value: number): void {
    return this.writeData(1, v => v.setUint8(0, value))
  }

  /**
   * Writes a signed 16 bit integer.
   */
  writeInt16(value: number, littleEndian = false): void {
    return this.writeData(2, v => v.setInt16(0, value, littleEndian))
  }

  /**
   * Writes an unsigned 16 bit integer.
   */
  writeUint16(value: number, littleEndian = false): void {
    return this.writeData(2, v => v.setUint16(0, value, littleEndian))
  }

  /**
   * Writes a signed 32 bit integer.
   */
  writeInt32(value: number, littleEndian = false): void {
    return this.writeData(4, v => v.setInt32(0, value, littleEndian))
  }

  /**
   * Writes an unsigned 32 bit integer.
   */
  writeUint32(value: number, littleEndian = false): void {
    return this.writeData(4, v => v.setUint32(0, value, littleEndian))
  }

  /**
   * Writes a boolean from an 8 bit integer.
   */
  writeBoolean(value: boolean): void {
    return this.writeData(1, v => v.setUint8(0, value ? 1 : 0))
  }

  /**
   * Writes a fixed-length string.
   */
  writeFixedLengthString(value: string, fixedLength = value.length): void {
    this.writeData(fixedLength, (v) => {
      for (let i = 0; i < fixedLength; i += 1) {
        const code = value.charCodeAt(i) & 0xFF
        v.setUint8(i, code)
      }
    })
  }

  /**
   * Writes a {@see ByteBuffer} to this stream.
   */
  writeByteArray(byteArray: ByteBuffer): void {
    return this.writeUint8Array(byteArray.getUint8Array())
  }

  /**
   * Writes a byte array to this stream.
   */
  writeUint8Array(value: Uint8Array): void {
    const { length } = value

    return this.writeData(length, (v) => {
      new Uint8Array(v.buffer).set(value)
    })
  }

  /**
   * Skips the given amount of bytes.
   */
  skipBytes(bytes: number): void {
    return this.writeData(bytes, () => {
    })
  }

  /**
   * Writes arbitrary data with a given byte length from the stream.
   */
  protected writeData(bytes: number, integrator: (dv: DataView) => void): void {
    const uint8Array = new Uint8Array(bytes)
    const dv = new DataView(uint8Array.buffer)
    integrator(dv)

    this.writer.enqueue(uint8Array)
  }
}

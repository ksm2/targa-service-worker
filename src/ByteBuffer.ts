import { crc32 } from './crc32'

const BUFFER = Symbol('Buffer')
const VIEW = Symbol('View')
const POSITION = Symbol('Position')
const LIMIT = Symbol('Limit')

/**
 * Created on 2018-09-03.
 *
 * @author Konstantin Simon Maria Möllers
 */
export class ByteBuffer {
  private readonly [BUFFER]: ArrayBuffer
  private readonly [VIEW]: DataView
  private [POSITION]: number
  private [LIMIT]: number

  constructor(capacity = 65_536) {
    this[POSITION] = 0
    this[LIMIT] = capacity
    this[BUFFER] = new ArrayBuffer(capacity)
    this[VIEW] = new DataView(this[BUFFER])
  }

  get capacity(): number {
    return this[BUFFER].byteLength
  }

  get position(): number {
    return this[POSITION]
  }

  get limit(): number {
    return this[LIMIT]
  }

  get length(): number {
    return this[LIMIT] - this[POSITION]
  }

  /**
   * Creates a {@see Uint8Array} from the byte buffer's data.
   */
  getUint8Array(): Uint8Array {
    return new Uint8Array(this[BUFFER], this.position, this.length)
  }

  /**
   * Calculates a CRC32 on the byte buffer's data.
   */
  crc32(): number {
    return crc32(this.getUint8Array())
  }

  /**
   * Skips a number of bytes in the buffer.
   */
  skip(bytes: number) {
    this.ensureWithinLimit(bytes, 'skipping')
    this[POSITION] += bytes
  }

  /**
   * Clears the buffer by resetting position and limit.
   */
  clear(): this {
    this[POSITION] = 0
    this[LIMIT] = this.capacity
    return this
  }

  /**
   * Rewinds the buffer by resetting the position.
   */
  rewind(): this {
    this[POSITION] = 0
    return this
  }

  /**
   * Flips the buffer by setting the limit and resetting the position.
   */
  flip(): this {
    this[LIMIT] = this[POSITION]
    this[POSITION] = 0
    return this
  }

  /**
   * Writes a signed 8 bit integer.
   */
  readInt8(): number {
    return this.readData(1, (v, o) => v.getInt8(o))
  }

  /**
   * Writes a signed 8 bit integer.
   */
  writeInt8(value: number): this {
    return this.writeData(1, (v, o) => v.setInt8(o, value))
  }

  /**
   * Reads an unsigned 8 bit integer.
   */
  readUint8(): number {
    return this.readData(1, (v, o) => v.getUint8(o))
  }

  /**
   * Writes an unsigned 8 bit integer.
   */
  writeUint8(value: number): this {
    return this.writeData(1, (v, o) => v.setUint8(o, value))
  }

  /**
   * Reads a signed 16 bit integer.
   */
  readInt16(littleEndian = false): number {
    return this.readData(2, (v, o) => v.getInt16(o, littleEndian))
  }

  /**
   * Writes a signed 16 bit integer.
   */
  writeInt16(value: number, littleEndian = false): this {
    return this.writeData(2, (v, o) => v.setInt16(o, value, littleEndian))
  }

  /**
   * Reads an unsigned 16 bit integer.
   */
  readUint16(littleEndian = false): number {
    return this.readData(2, (v, o) => v.getUint16(o, littleEndian))
  }

  /**
   * Writes an unsigned 16 bit integer.
   */
  writeUint16(value: number, littleEndian = false): this {
    return this.writeData(2, (v, o) => v.setUint16(o, value, littleEndian))
  }

  /**
   * Reads a signed 32 bit integer.
   */
  readInt32(littleEndian = false): number {
    return this.readData(4, (v, o) => v.getInt32(o, littleEndian))
  }

  /**
   * Writes a signed 32 bit integer.
   */
  writeInt32(value: number, littleEndian = false): this {
    return this.writeData(4, (v, o) => v.setInt32(o, value, littleEndian))
  }

  /**
   * Reads an unsigned 32 bit integer.
   */
  readUint32(littleEndian = false): number {
    return this.readData(4, (v, o) => v.getUint32(o, littleEndian))
  }

  /**
   * Writes an unsigned 32 bit integer.
   */
  writeUint32(value: number, littleEndian = false): this {
    return this.writeData(4, (v, o) => v.setUint32(o, value, littleEndian))
  }

  /**
   * Reads a boolean from an 8 bit integer.
   */
  readBoolean(): boolean {
    return this.readData(1, (v, o) => v.getUint8(o) > 0)
  }

  /**
   * Writes a boolean from an 8 bit integer.
   */
  writeBoolean(value: boolean): this {
    return this.writeData(1, (v, o) => v.setUint8(o, value ? 1 : 0))
  }

  /**
   * Reads a fixed-length ASCII string.
   */
  readFixedLengthASCII(fixedLength: number): string {
    return String.fromCharCode(...this.readUint8Array(fixedLength))
  }

  /**
   * Writes a fixed-length ASCII string.
   */
  writeFixedLengthASCII(value: string, fixedLength = value.length): this {
    return this.writeData(fixedLength, (v, o) => {
      for (let i = 0; i < fixedLength; i += 1) {
        const code = value.charCodeAt(i) & 0xFF
        v.setUint8(o + i, code)
      }
    })
  }

  /**
   * Reads a variable-length ASCII string with the length written first as unsigned 32 bit integer.
   */
  readASCII(littleEndian = false): string {
    const length = this.readUint32(littleEndian)
    return this.readFixedLengthASCII(length)
  }

  /**
   * Writes a variable-length ASCII string with the length written first as unsigned 32 bit integer.
   */
  writeASCII(value: string, littleEndian = false): this {
    this.writeUint32(value.length, littleEndian)
    return this.writeFixedLengthASCII(value)
  }

  /**
   * Reads a {@see Uint8Array} from this buffer.
   */
  readUint8Array(byteLength: number): Uint8Array {
    this.ensureWithinLimit(byteLength, 'reading')
    const uint8Array = new Uint8Array(this[BUFFER].slice(this[POSITION], this[POSITION] + byteLength))
    this[POSITION] += byteLength

    return uint8Array
  }

  /**
   * Writes a {@see Uint8Array} to this buffer.
   */
  writeUint8Array(byteArray: Uint8Array): this {
    const byteLength = byteArray.length
    this.ensureWithinLimit(byteLength, 'writing')
    new Uint8Array(this[BUFFER], this[POSITION]).set(byteArray)
    this[POSITION] += byteLength

    return this
  }

  /**
   * Writes a {@see ByteBuffer} to this one.
   */
  writeByteArray(byteArray: ByteBuffer): this {
    const length = byteArray.length
    return this.writeData(length, (v, o) => {
      new Uint8Array(v.buffer, o, length).set(byteArray.getUint8Array())
    })
  }

  /**
   * Reads arbitrary data with a given byte length from the buffer.
   */
  private readData<T>(bytes: number, extractor: (dv: DataView, offset: number) => T): T {
    // Is limit not reached?
    this.ensureWithinLimit(bytes, 'reading')

    // Integrate data to data view from callback
    const value = extractor(this[VIEW], this[POSITION])
    this[POSITION] += bytes
    return value
  }

  /**
   * Writes arbitrary data with a given byte length to the buffer.
   */
  private writeData(bytes: number, integrator: (dv: DataView, offset: number) => void): this {
    // Is limit not reached?
    this.ensureWithinLimit(bytes, 'writing')

    // Integrate data to data view from callback
    integrator(this[VIEW], this[POSITION])
    this[POSITION] += bytes
    return this
  }

  private ensureWithinLimit(bytes: number, operation: string) {
    if (this.position + bytes > this.limit) {
      throw new TypeError(`Reached limit of ${this.limit} bytes while ${operation} ${bytes} bytes`)
    }
  }
}

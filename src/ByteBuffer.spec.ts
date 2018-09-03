import { expect } from 'chai'
import 'mocha'
import { ByteBuffer } from './ByteBuffer'

describe('ByteBuffer', () => {

  it('is initialized correctly', () => {
    const buffer = new ByteBuffer()
    expect(buffer.position).to.equal(0)
    expect(buffer.capacity).to.equal(2 ** 16)
    expect(buffer.limit).to.equal(2 ** 16)
    expect(buffer.length).to.equal(2 ** 16)
  })

  it('can skip bytes', () => {
    const buffer = new ByteBuffer()
    expect(buffer.position).to.equal(0)
    expect(buffer.limit).to.equal(2 ** 16)

    buffer.skip(42)
    expect(buffer.position).to.equal(42)
    expect(buffer.limit).to.equal(2 ** 16)

    buffer.skip(1337)
    expect(buffer.position).to.equal(42 + 1337)
    expect(buffer.limit).to.equal(2 ** 16)
  })

  it('cannot skip over capacity', () => {
    const buffer = new ByteBuffer(4)
    buffer.skip(4)
    expect(() => buffer.skip(4)).to.throw('Reached limit of 4 bytes while skipping 4 bytes')
  })

  it('cannot skip over limit', () => {
    const buffer = new ByteBuffer(8)
    buffer.skip(4)
    buffer.flip()
    expect(buffer.limit).to.equal(4)
    expect(() => buffer.skip(8)).to.throw('Reached limit of 4 bytes while skipping 8 bytes')
  })

  it('cannot read over capacity', () => {
    const buffer = new ByteBuffer(4)
    buffer.readInt32()
    expect(() => buffer.readInt32()).to.throw('Reached limit of 4 bytes while reading 4 bytes')
  })

  it('cannot read over limit', () => {
    const buffer = new ByteBuffer(8)
    buffer.readInt32()
    buffer.flip()
    expect(buffer.limit).to.equal(4)
    buffer.readInt32()
    expect(() => buffer.readInt32()).to.throw('Reached limit of 4 bytes while reading 4 bytes')
  })

  it('cannot write over capacity', () => {
    const buffer = new ByteBuffer(4)
    buffer.writeInt32(1337)
    expect(() => buffer.writeInt32(42)).to.throw('Reached limit of 4 bytes while writing 4 bytes')
  })

  it('cannot write over limit', () => {
    const buffer = new ByteBuffer(8)
    buffer.writeInt32(1337)
    buffer.flip()
    expect(buffer.limit).to.equal(4)
    buffer.writeInt32(1337)
    expect(() => buffer.writeInt32(42)).to.throw('Reached limit of 4 bytes while writing 4 bytes')
  })

  it('can be written with booleans', async () => {
    const buffer = new ByteBuffer()

    buffer.writeBoolean(true)
    expect(buffer.position).to.equal(1)
    expect(buffer.capacity).to.equal(2 ** 16)
    expect(buffer.limit).to.equal(2 ** 16)
    expect(buffer.length).to.equal(2 ** 16 - 1)

    buffer.writeBoolean(false)
    expect(buffer.position).to.equal(2)
    expect(buffer.capacity).to.equal(2 ** 16)
    expect(buffer.limit).to.equal(2 ** 16)
    expect(buffer.length).to.equal(2 ** 16 - 2)

    buffer.flip()
    expect(buffer.position).to.equal(0)
    expect(buffer.capacity).to.equal(2 ** 16)
    expect(buffer.limit).to.equal(2)
    expect(buffer.length).to.equal(2)

    expect(buffer.readBoolean()).to.equal(true)
    expect(buffer.readBoolean()).to.equal(false)

    expect(buffer.position).to.equal(2)
    expect(buffer.limit).to.equal(2)
    expect(buffer.length).to.equal(0)
  })

  it('can be written with bytes', async () => {
    const buffer = new ByteBuffer()

    buffer.writeUint8(42)
    expect(buffer.position).to.equal(1)
    expect(buffer.capacity).to.equal(2 ** 16)
    expect(buffer.limit).to.equal(2 ** 16)
    expect(buffer.length).to.equal(2 ** 16 - 1)

    buffer.writeInt8(-42)
    expect(buffer.position).to.equal(2)
    expect(buffer.capacity).to.equal(2 ** 16)
    expect(buffer.limit).to.equal(2 ** 16)
    expect(buffer.length).to.equal(2 ** 16 - 2)

    buffer.flip()
    expect(buffer.position).to.equal(0)
    expect(buffer.capacity).to.equal(2 ** 16)
    expect(buffer.limit).to.equal(2)
    expect(buffer.length).to.equal(2)

    expect(buffer.readUint8()).to.equal(42)
    expect(buffer.readInt8()).to.equal(-42)

    expect(buffer.position).to.equal(2)
    expect(buffer.limit).to.equal(2)
    expect(buffer.length).to.equal(0)
  })

  it('can be written with words', async () => {
    const buffer = new ByteBuffer()

    buffer.writeUint16(42)
    expect(buffer.position).to.equal(2)
    expect(buffer.capacity).to.equal(2 ** 16)
    expect(buffer.limit).to.equal(2 ** 16)
    expect(buffer.length).to.equal(2 ** 16 - 2)

    buffer.writeInt16(-42)
    expect(buffer.position).to.equal(4)
    expect(buffer.capacity).to.equal(2 ** 16)
    expect(buffer.limit).to.equal(2 ** 16)
    expect(buffer.length).to.equal(2 ** 16 - 4)

    buffer.flip()
    expect(buffer.position).to.equal(0)
    expect(buffer.capacity).to.equal(2 ** 16)
    expect(buffer.limit).to.equal(4)
    expect(buffer.length).to.equal(4)

    expect(buffer.readUint16()).to.equal(42)
    expect(buffer.readInt16()).to.equal(-42)

    expect(buffer.position).to.equal(4)
    expect(buffer.limit).to.equal(4)
    expect(buffer.length).to.equal(0)
  })

  it('can be written with integers', async () => {
    const buffer = new ByteBuffer()

    buffer.writeUint32(42)
    expect(buffer.position).to.equal(4)
    expect(buffer.capacity).to.equal(2 ** 16)
    expect(buffer.limit).to.equal(2 ** 16)
    expect(buffer.length).to.equal(2 ** 16 - 4)

    buffer.writeInt32(-42)
    expect(buffer.position).to.equal(8)
    expect(buffer.capacity).to.equal(2 ** 16)
    expect(buffer.limit).to.equal(2 ** 16)
    expect(buffer.length).to.equal(2 ** 16 - 8)

    buffer.flip()
    expect(buffer.position).to.equal(0)
    expect(buffer.capacity).to.equal(2 ** 16)
    expect(buffer.limit).to.equal(8)
    expect(buffer.length).to.equal(8)

    expect(buffer.readUint32()).to.equal(42)
    expect(buffer.readInt32()).to.equal(-42)

    expect(buffer.position).to.equal(8)
    expect(buffer.limit).to.equal(8)
    expect(buffer.length).to.equal(0)
  })

  it('can be written with fixed-length ASCII strings', async () => {
    const buffer = new ByteBuffer()

    buffer.writeFixedLengthASCII('hello world')
    expect(buffer.position).to.equal(11)
    expect(buffer.capacity).to.equal(2 ** 16)
    expect(buffer.limit).to.equal(2 ** 16)
    expect(buffer.length).to.equal(2 ** 16 - 11)

    buffer.flip()
    expect(buffer.position).to.equal(0)
    expect(buffer.capacity).to.equal(2 ** 16)
    expect(buffer.limit).to.equal(11)
    expect(buffer.length).to.equal(11)

    expect(buffer.readFixedLengthASCII(11)).to.equal('hello world')

    expect(buffer.position).to.equal(11)
    expect(buffer.limit).to.equal(11)
    expect(buffer.length).to.equal(0)
  })

  it('can be written with flexible length ASCII strings', async () => {
    const buffer = new ByteBuffer()

    buffer.writeASCII('hello world')
    expect(buffer.position).to.equal(15)
    expect(buffer.capacity).to.equal(2 ** 16)
    expect(buffer.limit).to.equal(2 ** 16)
    expect(buffer.length).to.equal(2 ** 16 - 15)

    buffer.flip()
    expect(buffer.position).to.equal(0)
    expect(buffer.capacity).to.equal(2 ** 16)
    expect(buffer.limit).to.equal(15)
    expect(buffer.length).to.equal(15)

    expect(buffer.readASCII()).to.equal('hello world')

    expect(buffer.position).to.equal(15)
    expect(buffer.limit).to.equal(15)
    expect(buffer.length).to.equal(0)
  })

  it('can be written with Uint8Arrays', async () => {
    const buffer = new ByteBuffer()

    const array = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    buffer.writeUint8Array(array)
    expect(buffer.position).to.equal(array.length)
    expect(buffer.capacity).to.equal(2 ** 16)
    expect(buffer.limit).to.equal(2 ** 16)
    expect(buffer.length).to.equal(2 ** 16 - array.length)

    buffer.flip()
    expect(buffer.position).to.equal(0)
    expect(buffer.capacity).to.equal(2 ** 16)
    expect(buffer.limit).to.equal(array.length)
    expect(buffer.length).to.equal(array.length)

    expect(buffer.readUint8Array(array.length)).to.eql(array)

    expect(buffer.position).to.equal(array.length)
    expect(buffer.limit).to.equal(array.length)
    expect(buffer.length).to.equal(0)

    buffer.rewind()
    expect(buffer.position).to.equal(0)
    expect(buffer.limit).to.equal(array.length)
    expect(buffer.length).to.equal(array.length)

    expect(buffer.getUint8Array()).to.eql(array)
  })

  it('can calculate the CRC32', async () => {
    const buffer = new ByteBuffer()

    const array = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    buffer.writeUint8Array(array)
    buffer.flip()
    expect(buffer.crc32()).to.equal(622876539)
  })
})

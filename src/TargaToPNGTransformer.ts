import { AsyncArrayIterator } from './AsyncArrayIterator'
import { ByteBuffer } from './ByteBuffer'
import { PNGProducer } from './PNGProducer'
import { TargaConsumer } from './TargaConsumer'

/**
 * The TargaToPNGTransformer is a streams transformer which receives Targa data and outputs PNG data.
 */
export class TargaToPNGTransformer implements TransformStreamTransformer<Uint8Array, Uint8Array> {
  private chunks = new AsyncArrayIterator<Uint8Array>()
  private promise?: Promise<void>

  /**
   * Is called when the transformation starts.
   */
  async start(controller: TransformStreamDefaultController<Uint8Array>) {
    this.promise = this.convert(controller).catch(error => controller.error(error))
  }

  /**
   * Is called when a new chunk of data is coming in.
   */
  async transform(chunk: Uint8Array, controller: TransformStreamDefaultController<Uint8Array>) {
    this.chunks.enqueue(chunk)
  }

  /**
   * Is called when the final data came in. After `flush` resolves, `controller` is not available anymore!
   */
  async flush(controller: TransformStreamDefaultController<Uint8Array>) {
    this.chunks.flush()
    await this.promise!
  }

  /**
   * The asynchronous conversion processor.
   */
  private async convert(controller: TransformStreamDefaultController<Uint8Array>) {
    const consumer = new TargaConsumer(this.chunks)
    const producer = new PNGProducer(controller)

    // Write PNG magic
    producer.writePNGMagic()

    // Get image dimensions from Targa source and write them to our PNG
    const { width, height } = await consumer.readTargaHeader()
    producer.writePNGHeader({ width, height })

    // Read Targa's BGR (blue, green, red) image data and write it as RGB to a byte buffer
    const now = performance.now()
    const byteBuffer = ByteBuffer.allocate(height * (1 + width * 3))
    for (let row = 0; row < height; row += 1) {
      // Set row's filter: "0" means "no filter"
      byteBuffer.writeUint8(0)

      //
      const colorTriples = await consumer.readUint8Array(width * 3)
      this.convertBGRToRGB(colorTriples)
      byteBuffer.writeUint8Array(colorTriples)
    }
    byteBuffer.flip()
    console.log(`Copied data in ${performance.now() - now} ms`)

    // Deflate byte buffer and write data chunk to stream
    producer.writePNGData(byteBuffer)

    // Write PNG end chunk to stream
    producer.writePNGEnd()
  }

  /**
   * Converts BGR bytes to RGB bytes By swapping R and B.
   */
  private convertBGRToRGB(bytes: Uint8Array): void {
    for (let i = 0; i < bytes.byteLength; i += 3) {
      // Swap blue and red channels
      [bytes[i + 2], bytes[i]] = [bytes[i], bytes[i + 2]]
    }
  }
}

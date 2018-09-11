import { Data, Deflate } from 'pako'
import { AsyncArrayIterator } from './AsyncArrayIterator'
import { ByteBuffer } from './ByteBuffer'
import { PNGProducer } from './PNGProducer'
import { PNGFilter } from './pngs'
import { TargaConsumer } from './TargaConsumer'

/**
 * The TargaToPNGTransformer is a streams transformer which receives Targa data and outputs PNG data.
 */
export class TargaToPNGTransformer implements TransformStreamTransformer<Uint8Array, Uint8Array> {
  private chunkQueue = new AsyncArrayIterator<Uint8Array>()
  private doneConverting?: Promise<void>

  /**
   * Is called when the transformation starts.
   */
  async start(controller: TransformStreamDefaultController<Uint8Array>) {
    this.doneConverting = this.convert(controller).catch(error => controller.error(error))
  }

  /**
   * Is called when a new chunk of data is coming in.
   */
  async transform(chunk: Uint8Array, controller: TransformStreamDefaultController<Uint8Array>) {
    this.chunkQueue.enqueue(chunk)
  }

  /**
   * Is called when the final data came in. After `flush` resolves, `controller` is not available anymore!
   */
  async flush(controller: TransformStreamDefaultController<Uint8Array>) {
    this.chunkQueue.flush()
    await this.doneConverting!
  }

  /**
   * The asynchronous conversion processor.
   */
  private async convert(controller: TransformStreamDefaultController<Uint8Array>) {
    const consumer = new TargaConsumer(this.chunkQueue)
    const producer = new PNGProducer(controller)

    // Write PNG magic
    producer.writePNGMagic()

    // Get image dimensions from Targa source and write them to our PNG
    const { width, height } = await consumer.readTargaHeader()
    producer.writePNGHeader({ width, height })

    // Read Targa's BGR (blue, green, red) image data and write it as RGB to a byte buffer
    const now = performance.now()
    await this.convertData(consumer, producer, width, height)
    console.log(`Converted data in ${performance.now() - now} ms`)

    // Write PNG end chunk to stream
    producer.writePNGEnd()
  }

  /**
   * Converts the image data from Targa to PNG.
   */
  private convertData(consumer: TargaConsumer, producer: PNGProducer, width: number, height: number): Promise<void> {
    return new Promise<void>(async (resolve) => {
      const deflate = new Deflate({ level: 1 })

      // Write each new deflated data chunk to stream
      deflate.onData = (data: Data) => {
        const uint8Array = data as Uint8Array
        const deflatedBuffer = ByteBuffer.fromUint8Array(uint8Array)

        producer.writePNGData(deflatedBuffer)
      }

      // Wait for deflating to end
      deflate.onEnd = () => resolve()

      for (let row = 0; row < height; row += 1) {
        const byteBuffer = ByteBuffer.allocate(1 + width * 3)
        // Set row's filter (we only use "none" = "0")
        byteBuffer.writeUint8(PNGFilter.NONE)

        // Get BGR bytes of the row and convert them to RGB
        const colorTriples = await consumer.readUint8Array(width * 3)
        this.convertBGRToRGB(colorTriples)
        byteBuffer.writeUint8Array(colorTriples)
        byteBuffer.flip()

        // Push new data to deflate
        const lastRow = row + 1 === height
        deflate.push(byteBuffer.getUint8Array(), lastRow)
      }
    })
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

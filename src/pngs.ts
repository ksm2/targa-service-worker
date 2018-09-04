import { ByteBuffer } from './ByteBuffer'

/**
 * The PNG header chunk structure.
 */
export interface PNGHeader {
  width: number
  height: number
  bitDepth?: PNGBitDepth
  colorType?: PNGColorType
  compressionMethod?: PNGCompressionMethod
  filterMethod?: PNGFilterMethod
  interlaceMethod?: PNGInterlaceMethod
}

/**
 * Possible bit depth to use.
 */
export type PNGBitDepth = 1 | 2 | 4 | 8 | 16

/**
 * The PNG's allowed color types.
 */
export enum PNGColorType {
  GRAYSCALE = 0,
  RGB = 2,
  INDEXED = 3,
  GRAYSCALE_ALPHA = 4,
  RGBA = 6,
}

/**
 * The PNG's allowed compression methods.
 */
export enum PNGCompressionMethod {
  INFLATE_DEFLATE = 0,
}

/**
 * The PNG's allowed filter methods.
 */
export enum PNGFilterMethod {
  ADAPTIVE = 0,
}

/**
 * The PNG's allowed interlace methods.
 */
export enum PNGInterlaceMethod {
  NONE = 0,
  ADAM7 = 1,
}

/**
 * The adaptive filter to use for each pixel row.
 */
export enum PNGFilter {
  NONE = 0,
  SUB = 1,
  UP = 2,
  AVERAGE = 3,
  PAETH = 4,
}

/**
 * A PNG's chunk structure.
 */
export interface PNGChunk {
  type: string
  data?: ByteBuffer
}

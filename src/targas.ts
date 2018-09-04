/**
 * A Targa type specifies how image data is encoded in the data block.
 */
export enum TargaType {
  NO_DATA = 0,

  INDEXED = 1,
  BGR = 2,
  GRAY = 3,

  INDEXED_COMPRESSED = 9,
  BGR_COMPRESSED = 10,
  GRAY_COMPRESSED = 11,
}

export type TargaBitDepth = 1 | 8 | 15 | 16 | 24 | 32

/**
 * The Targa's header structure.
 */
export interface TargaHeader {
  idLength: number
  hasPalette: boolean
  type: TargaType
  paletteStart: number
  paletteLength: number
  bitsPerPalette: number
  left: number
  top: number
  width: number
  height: number
  bitDepth: TargaBitDepth
  attribPerPixel: number
  startsRight: boolean
  startsTop: boolean
}

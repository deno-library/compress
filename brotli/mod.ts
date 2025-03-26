import zlib from "node:zlib";
import { promisify } from "node:util";
import type { Buffer } from "node:buffer";

const compress: (
  buffer: zlib.InputType,
  options?: zlib.BrotliOptions,
) => Promise<Buffer> = promisify(zlib.brotliCompress);
const compressSync: (
  buf: zlib.InputType,
  options?: zlib.BrotliOptions,
) => Buffer = zlib.brotliCompressSync;
const uncompress: (
  buffer: zlib.InputType,
  options?: zlib.BrotliOptions,
) => Promise<Buffer> = promisify(zlib.brotliDecompress);
const uncompressSync: (
  buf: zlib.InputType,
  options?: zlib.BrotliOptions,
) => Buffer = zlib.brotliDecompressSync;
export { compress, compressSync, uncompress, uncompressSync };

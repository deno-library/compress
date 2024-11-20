/**
 * Compresses the input data using the DEFLATE algorithm.
 * 
 * @param bytes - The input data as a Uint8Array to be compressed.
 * @param level - The compression level (default is DEFAULT_LEVEL).
 * @returns A Uint8Array containing the compressed data.
 */
export { deflateRaw } from "./deflate_raw.ts";
/**
 * Decompresses a raw Uint8Array data.
 * @param arr - The Uint8Array data to decompress.
 * @returns The decompressed Uint8Array data.
 */
export { inflateRaw } from "./inflate_raw.ts";

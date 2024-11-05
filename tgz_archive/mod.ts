import * as tar from "../tar_archive/mod.ts";
import { gunzipFile, gzipFile } from "../gzip/gzip_file.ts";
import type { compressInterface, uncompressInterface } from "../interface.ts";
import { path } from "../deps.ts";

/**
 * @module
 * @description This module provides functions to compress and uncompress files using tar and gzip formats.
 * @exports uncompress
 * @exports compress
 */
 
/**
 * Uncompresses a .tgz or .gz file to a specified destination.
 * @param {string} src - The source file path.
 * @param {string} dest - The destination directory path.
 * @param {uncompressInterface} [options] - Optional parameters for uncompression.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
export async function uncompress(src: string, dest: string, options?: uncompressInterface): Promise<void> {
  const filename = path.basename(src);
  const extname = path.extname(filename);
  const tarFilename = extname === ".tgz"
    ? filename.slice(0, -3) + "tar"
    : (extname === ".gz" ? filename.slice(0, -3) : filename);
  const tmpDir = await Deno.makeTempDir();
  const tmpPath = path.join(tmpDir, tarFilename);
  await gunzipFile(src, tmpPath);
  await tar.uncompress(tmpPath, dest, options);
  await Deno.remove(tmpDir, { recursive: true });
}

/**
 * Compresses a file to a .tgz format.
 * @param {string} src - The source file path.
 * @param {string} dest - The destination file path.
 * @param {compressInterface} [options] - Optional parameters for compression.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
export async function compress(
  src: string,
  dest: string,
  options?: compressInterface,
): Promise<void> {
  const filename = path.basename(src);
  const tmpDir = await Deno.makeTempDir();
  const tmpPath = path.join(tmpDir, filename);
  await tar.compress(src, tmpPath, options);
  await gzipFile(tmpPath, dest);
  await Deno.remove(tmpDir, { recursive: true });
}

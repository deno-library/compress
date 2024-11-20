/**
 * Computes the Adler-32 checksum.
 *
 * The Adler-32 is a checksum algorithm which may be used to validate data integrity.
 * This algorithm divides the input data into two parts for calculation, resulting in a final 32-bit checksum.
 *
 * @param {number} adler - The initial Adler-32 value, usually set to 1.
 * @param {Uint8Array} buf - The buffer containing the data to be processed.
 * @param {number} len - The number of bytes from the buffer to process.
 * @param {number} pos - The starting position in the buffer.
 * @returns {number} The computed Adler-32 checksum.
 */
export default function adler32(adler: number, buf: Uint8Array, len: number, pos: number) {
  let s1 = (adler & 0xffff) | 0;
  let s2 = ((adler >>> 16) & 0xffff) | 0;
  let n = 0;

  while (len !== 0) {
    // Set limit ~ twice less than 5552, to keep
    // s2 in 31-bits, because we force signed ints.
    // in other case %= will fail.
    n = len > 2000 ? 2000 : len;
    len -= n;

    do {
      s1 = (s1 + buf[pos++]) | 0;
      s2 = (s2 + s1) | 0;
    } while (--n);

    s1 %= 65521;
    s2 %= 65521;
  }

  return (s1 | (s2 << 16)) | 0;
}

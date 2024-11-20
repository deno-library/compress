/**
 * Generates a lookup table for the CRC-32 algorithm.
 *
 * This function creates a table that is used to speed up the computation of CRC-32 checksums.
 * The table is precomputed using the polynomial `0xEDB88320`, which is a common choice for CRC-32.
 *
 * @returns {number[]} An array of 256 32-bit integers representing the lookup table.
 */
export function makeTable() {
  let c: number;
  const table = [];
  const m = 0xEDB88320;

  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (m ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c;
  }

  return table;
}

// Create table on load. Just 255 signed longs. Not a problem.
const crcTable = makeTable();

/**
 * Computes the CRC-32 checksum for a given buffer.
 *
 * This function calculates the CRC-32 checksum using a precomputed lookup table.
 * The initial CRC value is XORed with -1, and the result is XORed again with -1 before returning.
 * This is a common practice to ensure the checksum is consistent with standard CRC-32 implementations.
 *
 * @param {number} crc - The initial CRC-32 value, usually set to 0.
 * @param {Uint8Array} buf - The buffer containing the data to be processed.
 * @param {number} len - The number of bytes from the buffer to process.
 * @param {number} pos - The starting position in the buffer.
 * @returns {number} The computed CRC-32 checksum.
 */
export function crc32(crc: number, buf: Uint8Array, len: number, pos: number) {
  const t = crcTable;
  const end = pos + len;
  const f = 0xFF;

  crc ^= -1;

  for (let i = pos; i < end; i++) {
    crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & f];
  }

  return (crc ^ (-1)); // >>> 0;
}

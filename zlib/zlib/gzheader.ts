/**
 * Represents the gzip header structure.
 *
 * This class encapsulates the fields and properties of a gzip header, which are used during the gzip compression and decompression processes.
 * It includes various metadata fields such as text flag, modification time, extra flags, operating system, extra field, file name, comment, header CRC, and completion status.
 */
export default class GZheader {
  /* true if compressed data believed to be text */
  text: number = 0;
  /* modification time */
  time: number = 0;
  /* extra flags (not used when writing a gzip file) */
  xflags: number = 0;
  /* operating system */
  os: number = 0;
  /* pointer to extra field or Z_NULL if none */
  extra: Uint8Array | null = null;
  /* extra field length (valid if extra != Z_NULL) */
  extra_len: number = 0; // Actually, we don't need it in JS,
  // but leave for few code modifications

  //
  // Setup limits is not necessary because in js we should not preallocate memory
  // for inflate use constant limit in 65536 bytes
  //

  /* space at extra (only when reading header) */
  // extra_max  = 0;
  /* pointer to zero-terminated file name or Z_NULL */
  name: string | null = "";
  /* space at name (only when reading header) */
  // name_max   = 0;
  /* pointer to zero-terminated comment or Z_NULL */
  comment: string | null = "";
  /* space at comment (only when reading header) */
  // comm_max   = 0;
  /* true if there was or will be a header crc */
  hcrc: number = 0;
  /* true when done reading gzip header (not used when writing a gzip file) */
  done: boolean = false;
}

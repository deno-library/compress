import type { DeflateState } from "./deflate.ts";
import type { InflateState } from "./inflate.ts";

/**
 * Represents a zlib stream used for compression and decompression.
 *
 * This class encapsulates the input and output buffers, state information, and other metadata required for the compression and decompression processes.
 */
export default class ZStream {
  /**
   * The next input byte to be processed.
   * @type {Uint8Array | null}
   */
  input: Uint8Array | null = null; // JS specific, because we have no pointers

  /**
   * The index of the next input byte to be processed.
   * @type {number}
   */
  next_in = 0;

  /**
   * The number of bytes available at the input buffer.
   * @type {number}
   */
  avail_in = 0;

  /**
   * The total number of input bytes read so far.
   * @type {number}
   */
  total_in = 0;

  /**
   * The next output byte should be placed here.
   * @type {Uint8Array | null}
   */
  output: Uint8Array | null = null; // JS specific, because we have no pointers

  /**
   * The index of the next output byte to be placed.
   * @type {number}
   */
  next_out = 0;

  /**
   * The remaining free space at the output buffer.
   * @type {number}
   */
  avail_out = 0;

  /**
   * The total number of bytes output so far.
   * @type {number}
   */
  total_out = 0;

  /**
   * The last error message, or an empty string if no error.
   * @type {string}
   */
  msg = ""; /*Z_NULL*/

  /**
   * The internal state of the stream, not visible to applications.
   * @type {InflateState | DeflateState | null}
   */
  state: InflateState | DeflateState | null = null;

  /**
   * The best guess about the data type: binary or text.
   * @type {number}
   */
  data_type = 2 /*Z_UNKNOWN*/;

  /**
   * The Adler-32 value of the uncompressed data.
   * @type {number}
   */
  adler = 0;
}

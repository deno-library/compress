// from https://github.com/nodeca/pako
import { concatUint8Array } from "../utils/uint8.ts";
import * as zlibInflate from "./zlib/inflate.ts";
import STATUS from "./zlib/status.ts";
import { type CODE, message as msg } from "./zlib/messages.ts";
import ZStream from "./zlib/zstream.ts";
import GZheader from "./zlib/gzheader.ts";

/**
 * Options for the Inflate class.
 */
export interface InflateOptions {
  windowBits?: number; // Size of the window for compression
  dictionary?: Uint8Array; // Dictionary for decompression
  chunkSize?: number; // Size of chunks to process
  to?: string; // Output format
  raw?: boolean; // Indicates if raw inflation is required
}

/**
 * Required options for the Inflate class.
 */
interface InflateOptionsRequired {
  windowBits: number; // Required window size
  dictionary?: Uint8Array; // Optional dictionary
  chunkSize: number; // Required chunk size
  to: string; // Required output format
  raw?: boolean; // Indicates if raw inflation is required
}

/**
 * Class for inflating compressed data.
 */
export class Inflate {
  err: STATUS = 0; // error code, if happens (0 = Z_OK)
  msg = ""; // error message
  ended = false; // used to avoid multiple onEnd() calls
  strm: ZStream;
  options: InflateOptionsRequired;
  header: GZheader;

  /**
   * Creates an instance of Inflate.
   * @param options - Options for the inflation process.
   */
  constructor(options: InflateOptions) {
    this.options = {
      chunkSize: 16384,
      windowBits: 0,
      to: "",
      ...options,
    };

    const opt = this.options;

    // Force window size for `raw` data, if not set directly,
    // because we have no header for autodetect.
    if (opt.raw && (opt.windowBits >= 0) && (opt.windowBits < 16)) {
      opt.windowBits = -opt.windowBits;
      if (opt.windowBits === 0) opt.windowBits = -15;
    }

    // If `windowBits` not defined (and mode not raw) - set autodetect flag for gzip/deflate
    if (
      (opt.windowBits >= 0) && (opt.windowBits < 16) &&
      !(options && options.windowBits)
    ) {
      opt.windowBits += 32;
    }

    // Gzip header has no info about windows size, we can do autodetect only
    // for deflate. So, if window size not set, force it to max when gzip possible
    if ((opt.windowBits > 15) && (opt.windowBits < 48)) {
      // bit 3 (16) -> gzipped data
      // bit 4 (32) -> autodetect gzip/deflate
      if ((opt.windowBits & 15) === 0) {
        opt.windowBits |= 15;
      }
    }

    this.strm = new ZStream();
    this.strm.avail_out = 0;

    let status = zlibInflate.inflateInit2(
      this.strm,
      opt.windowBits,
    );

    if (status !== STATUS.Z_OK) {
      throw new Error(msg[status as CODE]);
    }

    this.header = new GZheader();
    zlibInflate.inflateGetHeader(this.strm, this.header);

    // Setup dictionary
    if (opt.dictionary) {
      if (opt.raw) { //In raw mode we need to set the dictionary early
        status = zlibInflate.inflateSetDictionary(this.strm, opt.dictionary);
        if (status !== STATUS.Z_OK) {
          throw new Error(msg[status as CODE]);
        }
      }
    }
  }

  /**
   * Pushes data to be inflated.
   * @param data - The compressed data to inflate.
   * @param mode - The mode for inflation (finish or no flush).
   * @returns The inflated data as a Uint8Array.
   */
  push(data: Uint8Array, mode: boolean | number): Uint8Array {
    const strm = this.strm;
    const chunkSize = this.options.chunkSize;
    const dictionary = this.options.dictionary;
    const chunks: Uint8Array[] = [];
    let status;

    // Flag to properly process Z_BUF_ERROR on testing inflate call
    // when we check that all output data was flushed.
    let allowBufError = false;

    if (this.ended) {
      throw new Error("can not call after ended");
    }

    let _mode = (mode === ~~mode)
      ? mode
      : ((mode === true) ? STATUS.Z_FINISH : STATUS.Z_NO_FLUSH);

    strm.input = data;
    strm.next_in = 0;
    strm.avail_in = strm.input.length;

    do {
      if (strm.avail_out === 0) {
        strm.output = new Uint8Array(chunkSize);
        strm.next_out = 0;
        strm.avail_out = chunkSize;
      }

      status = zlibInflate.inflate(
        strm,
        STATUS.Z_NO_FLUSH,
      ); /* no bad return value */

      if (status === STATUS.Z_NEED_DICT && dictionary) {
        status = zlibInflate.inflateSetDictionary(this.strm, dictionary);
      }

      if (status === STATUS.Z_BUF_ERROR && allowBufError === true) {
        status = STATUS.Z_OK;
        allowBufError = false;
      }

      if (status !== STATUS.Z_STREAM_END && status !== STATUS.Z_OK) {
        this.ended = true;
        throw new Error(this.strm.msg);
      }

      if (strm.next_out) {
        if (
          strm.avail_out === 0 || status === STATUS.Z_STREAM_END ||
          (strm.avail_in === 0 &&
            (_mode === STATUS.Z_FINISH || _mode === STATUS.Z_SYNC_FLUSH))
        ) {
          chunks.push(strm.output!.subarray(0, strm.next_out));
        }
      }

      // When no more input data, we should check that internal inflate buffers
      // are flushed. The only way to do it when avail_out = 0 - run one more
      // inflate pass. But if output data not exists, inflate return Z_BUF_ERROR.
      // Here we set flag to process this error properly.
      //
      // NOTE. Deflate does not return error in this case and does not needs such
      // logic.
      if (strm.avail_in === 0 && strm.avail_out === 0) {
        allowBufError = true;
      }
    } while (
      (strm.avail_in > 0 || strm.avail_out === 0) &&
      status !== STATUS.Z_STREAM_END
    );

    if (status === STATUS.Z_STREAM_END) {
      _mode = STATUS.Z_FINISH;
    }

    // Finalize on the last chunk.
    if (_mode === STATUS.Z_FINISH) {
      status = zlibInflate.inflateEnd(this.strm);
      this.ended = true;
      if (status !== STATUS.Z_OK) throw new Error(this.strm.msg);
    }

    // callback interim results if Z_SYNC_FLUSH.
    if (_mode === STATUS.Z_SYNC_FLUSH) {
      strm.avail_out = 0;
    }

    return concatUint8Array(chunks);
  }
}

/**
 * Inflates the input data with the given options.
 * @param input - The compressed data to inflate.
 * @param options - Options for the inflation process.
 * @returns The inflated data as a Uint8Array.
 */
export function inflate(
  input: Uint8Array,
  options: InflateOptions = {},
): Uint8Array {
  const inflator = new Inflate(options);
  const result = inflator.push(input, true);
  // That will never happens, if you don't cheat with options :)
  if (inflator.err) throw inflator.msg || msg[inflator.err as CODE];
  return result;
}

/**
 * Inflates raw compressed data with the given options.
 * @param input - The raw compressed data to inflate.
 * @param options - Options for the inflation process.
 * @returns The inflated data as a Uint8Array.
 */
export function inflateRaw(
  input: Uint8Array,
  options: InflateOptions = {},
): Uint8Array {
  options.raw = true;
  return inflate(input, options);
}

/**
 * Alias for the inflate function, specifically for gzip.
 */
export const gunzip = inflate;

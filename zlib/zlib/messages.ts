/**
 * Maps error codes to their corresponding error messages.
 *
 * This object provides a mapping from integer error codes to human-readable error messages.
 * These messages can be used to provide more detailed feedback about the status of operations.
 */
export const message = {
  2: "need dictionary", /* Z_NEED_DICT       2  */
  1: "stream end", /* Z_STREAM_END      1  */
  0: "", /* Z_OK              0  */
  "-1": "file error", /* Z_ERRNO         (-1) */
  "-2": "stream error", /* Z_STREAM_ERROR  (-2) */
  "-3": "data error", /* Z_DATA_ERROR    (-3) */
  "-4": "insufficient memory", /* Z_MEM_ERROR     (-4) */
  "-5": "buffer error", /* Z_BUF_ERROR     (-5) */
  "-6": "incompatible version", /* Z_VERSION_ERROR (-6) */
};

/**
 * Type representing the possible error codes.
 *
 * This type defines the set of valid error codes that can be returned by various functions in the compression/decompression process.
 */
export type CODE = 2 | 1 | 0 | "-1" | "-2" | "-3" | "-4" | "-5" | "-6";

/**
 * Configuration interface for compression operations.
 *
 * @interface compressInterface
 */
export interface compressInterface {
  /**
   * Specifies whether to exclude the source directory from the compression.
   * If set to true, the `src` directory will not be included in the compressed output.
   * By default, the `src` directory is included.
   *
   * @type {boolean}
   * @memberof compressInterface
   */
  excludeSrc?: boolean;

  /**
   * Specifies whether to enable debug mode.
   * In debug mode, all files and folders being processed will be listed.
   * By default, no such information is displayed.
   *
   * @type {boolean}
   * @memberof compressInterface
   */
  debug?: boolean;
}

/**
 * Configuration interface for uncompression (decompression) operations.
 *
 * @interface uncompressInterface
 */
export interface uncompressInterface {
  /**
   * Specifies whether to enable debug mode.
   * In debug mode, all files and folders being processed will be listed.
   * By default, no such information is displayed.
   *
   * @type {boolean}
   * @memberof uncompressInterface
   */
  debug?: boolean;
}
export * as tar from "./tar/mod.ts";
export * as tgz from "./tgz/mod.ts";
export * as zip from "./zip/mod.ts";
export {
  gunzipFile,
  gzipFile,
  GzipStream,
  /** slow */
  // gzip,
  // gunzip,
} from "./gzip/mod.ts";
/** slow */
// export { deflateRaw, inflateRaw } from "./deflate/mod.ts";
/** fast */
export {
  deflate,
  deflateRaw,
  gunzip,
  gzip,
  inflate,
  inflateRaw,
} from "./zlib/mod.ts";

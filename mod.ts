export * as tar from "./tar/mod.ts";
export { gzip, gunzip, GzipStream } from "./gzip/mod.ts";
/** slow */
// export { deflateRaw, inflateRaw } from "./deflate/mod.ts";
/** very fast */
export { deflate, inflate, deflateRaw, inflateRaw } from "./zlib/mod.ts";

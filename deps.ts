export { EventEmitter } from "node:events";
export { ensureDir, exists } from "jsr:@std/fs@1.0.5";
export * as path from "jsr:@std/path@1.0.8";
export { Buffer, copy, readAll, writeAll } from "jsr:@std/io@0.225.0";
export { crc32, Crc32Stream } from "jsr:@deno-library/crc32@1.0.2";
export type { Reader, Writer } from "jsr:@std/io@0.225.0/types";
export {
    TarStream,
    type TarStreamInput,
    UntarStream,
} from "jsr:@std/tar@0.1.3";
export {
    type EntryMetaData,
    terminateWorkers,
    ZipReader,
    ZipReaderStream,
    ZipWriter,
    ZipWriterStream,
} from "jsr:@zip-js/zip-js@2.7.53";

import { Crc32Stream, EventEmitter, writeAll } from "../deps.ts";
import { concatUint8Array } from "../utils/uint8.ts";
import { getHeader, putLong } from "./gzip.ts";
import { Deflate } from "../zlib/mod.ts";
import type { Writer as StdWriter } from "../deps.ts";

type File = Deno.FsFile;

interface Options {
  onceSize?: number;
}

export default class Writer extends EventEmitter implements StdWriter {
  private writer!: File;
  private bytesWritten = 0;
  private path: string;
  private chuncks: Uint8Array[] = [];
  private onceSize: number;
  private chuncksBytes = 0;
  private crc32Stream = new Crc32Stream();
  private deflate: Deflate = new Deflate({ raw: true });

  constructor(
    path: string,
    options?: Options,
  ) {
    super();
    this.path = path;
    this.onceSize = options?.onceSize ?? 1024 * 1024;
  }

  async setup(name?: string, timestamp?: number): Promise<void> {
    this.writer = await Deno.open(this.path, {
      write: true,
      create: true,
      truncate: true,
    });
    const headers = getHeader({
      timestamp,
      name,
    });
    await this.writer.write(headers);
  }

  async write(p: Uint8Array): Promise<number> {
    const readed = p.byteLength;
    const copy = new Uint8Array(p);
    this.chuncks.push(copy);
    this.chuncksBytes += readed;
    this.bytesWritten += readed;
    this.crc32Stream.append(copy);
    if (readed < 16384) {
      const buf = concatUint8Array(this.chuncks);
      const compressed = this.deflate.push(buf, true);
      await writeAll(this.writer, compressed);
      const tail = this.getTail();
      await this.writer.write(tail);
    } else if (this.chuncksBytes >= this.onceSize) {
      const buf = concatUint8Array(this.chuncks);
      const compressed = this.deflate.push(buf, false);
      await writeAll(this.writer, compressed);
      this.chuncks.length = 0;
      this.chuncksBytes = 0;
      this.emit("bytesWritten", this.bytesWritten);
    }
    return readed;
  }

  close(): void {
    this.emit("bytesWritten", this.bytesWritten);
    this.writer.close();
  }

  private getTail() {
    const arr: number[] = [];
    putLong(parseInt(this.crc32Stream.crc32, 16), arr);
    putLong(this.bytesWritten, arr);
    return new Uint8Array(arr);
  }
}

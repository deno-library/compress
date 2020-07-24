import { EventEmitter } from "../deps.ts";
import { concatUint8Array } from "../utils/uint8.ts";
import { gunzip } from "./gzip.ts";

type File = Deno.File;

interface Options {
  onceSize?: number;
}

export default class Writer extends EventEmitter implements Deno.Writer {
  protected writer!: File;
  protected bytesWritten = 0;
  private path: string;
  private chuncks: Uint8Array[] = [];
  private onceSize: number;
  private chuncksBytes = 0;
  private fn: Function;

  constructor(
    path: string,
    fn: Function,
    options?: Options,
  ) {
    super();
    this.path = path;
    this.fn = fn;
    this.onceSize = options?.onceSize ?? 1024 * 1024;
  }

  async setup(): Promise<void> {
    this.writer = await Deno.open(this.path, {
      write: true,
      create: true,
      truncate: true,
    });
  }

  async write(p: Uint8Array): Promise<number> {
    const readed = p.byteLength;
    // this.chuncks.push(Uint8Array.from(p));
    this.chuncks.push(new Uint8Array(p));
    this.chuncksBytes += readed;
    this.bytesWritten += readed;

    if (this.chuncksBytes >= this.onceSize) {
      const buf = concatUint8Array(this.chuncks);
      console.log(buf)
      console.log(gunzip(buf))
      await Deno.writeAll(this.writer, this.fn(buf));
      
      this.chuncks.length = 0;
      // this.chuncks.push(new Uint8Array([31, 139, 8, 0, 0, 0, 0, 0, 0]));
      this.chuncksBytes = 0;
      this.emit("bytesWritten", this.bytesWritten);
    }
    return readed;
  }

  async close(): Promise<void> {
    if (this.chuncks.length > 0) {
      const buf = concatUint8Array(this.chuncks);
      await Deno.writeAll(this.writer, this.fn(buf, undefined));
    }
    this.emit("bytesWritten", this.bytesWritten);
    Deno.close(this.writer.rid);
  }
}

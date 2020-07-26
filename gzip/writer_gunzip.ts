import { EventEmitter, Crc32Stream } from "../deps.ts";
import { concatUint8Array } from "../utils/uint8.ts";
import { inflate } from "../deflate/inflate.ts";
import { checkHeader, checkTail } from "./gzip.ts";

type File = Deno.File;

interface Options {
  onceSize?: number;
}

export default class Writer extends EventEmitter implements Deno.Writer {
  protected writer!: File;
  protected bytesWritten = 0; // readed size of reader
  private path: string;
  private chuncks: Uint8Array[] = [];
  private onceSize: number;
  private chuncksBytes = 0;
  private isCheckHeader = false;
  private writtenSize: number = 0; // written size of writer
  private crc32Stream = new Crc32Stream();

  constructor(
    path: string,
    options?: Options,
  ) {
    super();
    this.path = path;
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
    this.chuncksBytes += readed;
    this.bytesWritten += readed;
    const arr = Array.from(p);
    if (!this.isCheckHeader) {
      this.isCheckHeader = true;
      checkHeader(arr);
    }
    if (readed < 16384) {
      const { size, crc32 } = checkTail(arr);
      this.chuncks.push(new Uint8Array(arr));
      const buf = concatUint8Array(this.chuncks);
      const decompressed = inflate(buf);
      this.writtenSize += decompressed.byteLength;
      await Deno.writeAll(this.writer, decompressed);
      this.crc32Stream.append(decompressed);
      if (crc32 !== parseInt(this.crc32Stream.crc32, 16)) {
        throw "Checksum does not match";
      }
      if (size !== this.writtenSize) {
        throw "Size of decompressed file not correct";
      }
      return readed;
    }
    this.chuncks.push(new Uint8Array(arr));
    if (this.chuncksBytes >= this.onceSize) {
      const buf = concatUint8Array(this.chuncks);
      const decompressed = inflate(buf);
      this.writtenSize += decompressed.byteLength;
      await Deno.writeAll(this.writer, decompressed);
      this.crc32Stream.append(decompressed);
      this.chuncks.length = 0;
      this.chuncksBytes = 0;
      this.emit("bytesWritten", this.bytesWritten);
    }
    return readed;
  }

  close(): void {
    this.emit("bytesWritten", this.bytesWritten);
    Deno.close(this.writer.rid);
  }
}

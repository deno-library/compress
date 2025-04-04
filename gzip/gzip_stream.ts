import { copy, EventEmitter } from "../deps.ts";
import GzipWriter from "./writer_gzip.ts";
import GunzipWriter from "./writer_gunzip.ts";

/** 
 * @symbol GzipStream 
 * @description A class for compressing and uncompressing files using Gzip.
 */
export class GzipStream extends EventEmitter {
  constructor() {
    super();
  }

  async compress(src: string, dest: string): Promise<void> {
    // reader
    const stat = await Deno.stat(src);
    const size = stat.size;
    using reader = await Deno.open(src, {
      read: true,
    });
    // writer
    using writer = new GzipWriter(dest, {
      onceSize: size > 50 * 1024 * 1024 ? 1024 * 1024 : 512 * 1024,
    });
    await writer.setup(
      src,
      stat.mtime ? Math.round(stat.mtime.getTime() / 1000) : 0,
    );
    writer.on("bytesWritten", (bytesWritten: number) => {
      const progress = (100 * bytesWritten / size).toFixed(2) + "%";
      this.emit("progress", progress);
    });

    /** 1: use Deno.copy */
    await copy(reader, writer, {
      bufSize: 1024 * 1024,
    });
  }

  async uncompress(src: string, dest: string): Promise<void> {
    // reader
    const size = (await Deno.stat(src)).size;
    using reader = await Deno.open(src, {
      read: true,
    });
    // writer
    using writer = new GunzipWriter(dest, {
      onceSize: size > 50 * 1024 * 1024 ? 1024 * 1024 : 512 * 1024,
    });
    await writer.setup();
    writer.on("bytesWritten", (bytesWritten: number) => {
      const progress = (100 * bytesWritten / size).toFixed(2) + "%";
      this.emit("progress", progress);
    });
    // write
    await copy(reader, writer, {
      bufSize: 1024 * 1024,
    });
  }
}

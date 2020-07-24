import { EventEmitter } from "../deps.ts";
import { gzip, gunzip } from "./gzip.ts";
import Writer from "./writer_decode.ts";
export { gzip, gunzip };

export class GzipStream extends EventEmitter {
  constructor() {
    super();
  }

  async compress(src: string, dest: string): Promise<void> {
    const size = (await Deno.stat(src)).size;
    const reader = await Deno.open(src, {
      read: true,
    });
    // writer
    const writer = await Deno.open(dest, {
      write: true,
      create: true,
      truncate: true,
    });
    const data = await Deno.readAll(reader);
    await Deno.writeAll(writer, gzip(data));
    // return this.compose(src, dest, gzip);
  }

  async uncompress(src: string, dest: string): Promise<void> {
    const size = (await Deno.stat(src)).size;
    const reader = await Deno.open(src, {
      read: true,
    });
    // writer
    const writer = await Deno.open(dest, {
      write: true,
      create: true,
      truncate: true,
    });
    const data = await Deno.readAll(reader);
    await Deno.writeAll(writer, gunzip(data));
    // // reader
    // const size = (await Deno.stat(src)).size;
    // const reader = await Deno.open(src, {
    //   read: true,
    // });
    // // writer
    // const writer = new Writer(dest, gunzip, {
    //   onceSize: size > 50 * 1024 * 1024 ? 1024 * 1024 : 512 * 1024,
    // });
    // await writer.setup();
    // writer.on("bytesWritten", (bytesWritten: number) => {
    //   const progress = (100 * bytesWritten / size).toFixed(2) + "%";
    //   console.log(progress);
    //   this.emit("progress", progress);
    // });

    // await Deno.copy(reader, writer, {
    //   bufSize: 1024 * 1024,
    // });

    // await writer.close();
    // reader.close();
  }

  private async compose(
    src: string,
    dest: string,
    fn: Function,
  ): Promise<void> {
    // reader
    const size = (await Deno.stat(src)).size;
    const reader = await Deno.open(src, {
      read: true,
    });
    // writer
    const writer = new Writer(dest, fn, {
      onceSize: size > 50 * 1024 * 1024 ? 1024 * 1024 : 512 * 1024,
    });
    await writer.setup();
    writer.on("bytesWritten", (bytesWritten: number) => {
      const progress = (100 * bytesWritten / size).toFixed(2) + "%";
      console.log(progress);
      this.emit("progress", progress);
    });

    /** 1: use Deno.copy */
    await Deno.copy(reader, writer, {
      bufSize: 1024 * 1024,
    });

    /** 2: not use Deno.copy */
    // let readed: number | null;
    // const n = 16384; //16kb
    // while (true) {
    //   const p: Uint8Array = new Uint8Array(n);
    //   readed = await reader.read(p);
    //   if (readed === null) break;
    //   if (readed < n) {
    //     await writer.write(p.subarray(0, readed));
    //     break;
    //   } else {
    //     await writer.write(p);
    //   }
    // }

    await writer.close();
    reader.close();
  }
}

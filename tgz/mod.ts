import * as tar from "../tar/mod.ts";
import { GzipStream } from "../gzip/gzip_stream.ts";
import { compressInterface } from "../interface.ts";
import { path } from "../deps.ts";

export async function uncompress(src: string, dest: string): Promise<void> {
  const gzip = new GzipStream();
  // gzip.on("progress", (progress: string) => {
  //   console.log(progress); // 0.00% => 100.00%
  // });
  const filename = path.basename(src);
  const tmpDir = await Deno.makeTempDir();
  const tmpPath = path.join(tmpDir, filename);
  await gzip.uncompress(src, tmpPath);
  await tar.uncompress(tmpPath, dest);
  await Deno.remove(tmpPath);
}

export async function compress(
  src: string,
  dest: string,
  options?: compressInterface,
): Promise<void> {
  const gzip = new GzipStream();
  // gzip.on("progress", (progress: string) => {
  //   console.log(progress); // 0.00% => 100.00%
  // });
  const filename = path.basename(src);
  const tmpDir = await Deno.makeTempDir();
  const tmpPath = path.join(tmpDir, filename);
  await tar.compress(src, tmpPath, options);
  await gzip.compress(tmpPath, dest);
  await Deno.remove(tmpPath);
}

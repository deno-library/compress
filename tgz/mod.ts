import * as tar from "../tar/mod.ts";
import { gzipFile, gunzipFile } from "../gzip/gzip_file.ts";
import { compressInterface } from "../interface.ts";
import { path } from "../deps.ts";

export async function uncompress(src: string, dest: string): Promise<void> {
  const filename = path.basename(src);
  const tmpDir = await Deno.makeTempDir();
  const tmpPath = path.join(tmpDir, filename);
  await gunzipFile(src, tmpPath);
  await tar.uncompress(tmpPath, dest);
  await Deno.remove(tmpDir, { recursive: true });
}

export async function compress(
  src: string,
  dest: string,
  options?: compressInterface,
): Promise<void> {
  const filename = path.basename(src);
  const tmpDir = await Deno.makeTempDir();
  const tmpPath = path.join(tmpDir, filename);
  await tar.compress(src, tmpPath, options);
  await gzipFile(tmpPath, dest);
  await Deno.remove(tmpDir, { recursive: true });
}

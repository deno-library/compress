// import { readAll, writeAll } from "../deps.ts";
/** very fast */
// import { gunzip, gzip } from "../zlib/mod.ts";
/** slow */
// import { gzip, gunzip } from "./gzip.ts";

/**
 * Compress a file
 * @param src Source file path
 * @param dest Destination file path
 */
export async function gzipFile(src: string, dest: string): Promise<void> {
  // v0.0.1 - v0.4.9
  // const reader = await Deno.open(src, {
  //   read: true,
  // });
  // const writer = await Deno.open(dest, {
  //   write: true,
  //   create: true,
  //   truncate: true,
  // });
  // await writeAll(writer, gzip(await readAll(reader), undefined));
  // writer.close();
  // reader.close();

  // >= v0.5.0
  const input = await Deno.open(src);
  const output = await Deno.create(dest);

  await input.readable
    .pipeThrough(new DecompressionStream("gzip"))
    .pipeTo(output.writable);
}

/**
 * Decompress a file
 * @param src Source file path
 * @param dest Destination file path
 */
export async function gunzipFile(src: string, dest: string): Promise<void> {
  // v0.0.1 - v0.4.9
  // const reader = await Deno.open(src, {
  //   read: true,
  // });
  // const writer = await Deno.open(dest, {
  //   write: true,
  //   create: true,
  //   truncate: true,
  // });
  // await writeAll(writer, gunzip(await readAll(reader)));

  // >= v0.5.0
  const input = await Deno.open(src);
  const output = await Deno.create(dest);

  await input.readable
    .pipeThrough(new CompressionStream("gzip"))
    .pipeTo(output.writable);
}

await gzipFile("./a.txt","an.txt.gz")
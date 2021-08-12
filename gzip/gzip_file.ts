/** very fast */
import { gunzip, gzip } from "../zlib/mod.ts";
/** slow */
// import { gzip, gunzip } from "./gzip.ts";

export async function gzipFile(src: string, dest: string): Promise<void> {
  const reader = await Deno.open(src, {
    read: true,
  });
  const writer = await Deno.open(dest, {
    write: true,
    create: true,
    truncate: true,
  });
  await Deno.writeAll(writer, gzip(await Deno.readAll(reader), undefined));
  writer.close();
  reader.close();
}

export async function gunzipFile(src: string, dest: string): Promise<void> {
  const reader = await Deno.open(src, {
    read: true,
  });
  const writer = await Deno.open(dest, {
    write: true,
    create: true,
    truncate: true,
  });
  await Deno.writeAll(writer, gunzip(await Deno.readAll(reader)));
}

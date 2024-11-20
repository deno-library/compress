import type { compressInterface, uncompressInterface } from "../interface.ts";
import { path, exists } from "../deps.ts";
import {
  type EntryMetaData,
  terminateWorkers,
  ZipReaderStream,
  ZipWriter,
} from "../deps.ts";

/**
 * Uncompresses a file.
 * @param {string} src - Source file path.
 * @param {string} dest - Destination file path.
 * @param {uncompressInterface} [options] - Optional parameters.
 */
export async function uncompress(
  src: string,
  dest: string,
  options?: uncompressInterface,
): Promise<void> {
  await exists(src, { isFile: true });
  for await (
    const entry of (await Deno.open(src))
      .readable
      .pipeThrough(new ZipReaderStream())
  ) {
    const filePath = path.resolve(dest, entry.filename);
    if (options?.debug) console.log(filePath);
    await Deno.mkdir(path.dirname(filePath), { recursive: true });
    if (entry.directory) continue;
    await entry.readable?.pipeTo((await Deno.create(filePath)).writable);
  }
  await terminateWorkers();
}

/**
 * Compresses a file.
 * @param {string} src - Source file path.
 * @param {string} dest - Destination file path.
 * @param {compressInterface} [options] - Optional parameters.
 */
export async function compress(
  src: string,
  dest: string,
  options?: compressInterface,
): Promise<void> {
  await exists(src, { isFile: true });
  const zipWriter = new ZipWriter((await Deno.create(dest)).writable);
  const inputs: Promise<EntryMetaData>[] = [];
  const stat = await Deno.lstat(src);
  if (stat.isFile) {
    inputs.push(
      zipWriter.add(path.basename(src), (await Deno.open(src)).readable, {
        directory: false,
        uncompressedSize: stat.size,
      }),
    );
    if (options?.debug) console.log(path.resolve(src));
  } else {
    const appendFolder = async (folder: string, prefix?: string) => {
      let nowLoopList: string[][] = [[folder, prefix || ""]];
      let nextLoopList: string[][] = [];

      while (nowLoopList.length > 0) {
        for (const [folder, prefix] of nowLoopList) {
          for await (const entry of Deno.readDir(folder)) {
            const { isDirectory, name } = entry;
            const fileName = prefix ? `${prefix}/${name}` : name;
            const filePath = path.resolve(folder, name);
            if (options?.debug) console.log(path.resolve(filePath));
            const stat = await Deno.stat(filePath);
            if (isDirectory) {
              inputs.push(zipWriter.add(`${fileName}/`, undefined, {
                directory: true,
              }));
              nextLoopList.push([filePath, fileName]);
            } else {
              inputs.push(
                zipWriter.add(fileName, (await Deno.open(filePath)).readable, {
                  directory: false,
                  uncompressedSize: stat.size,
                }),
              );
            }
          }
        }
        nowLoopList = nextLoopList;
        nextLoopList = [];
      }
    };
    if (options?.excludeSrc) {
      await appendFolder(src);
    } else {
      const folderName = path.basename(src);
      inputs.push(zipWriter.add(path.basename(`${folderName}/`), undefined, {
        directory: true,
      }));
      if (options?.debug) console.log(path.resolve(src));
      await appendFolder(src, folderName);
    }
  }

  try {
    await Promise.all(inputs);
    await zipWriter.close();
    // print progress
    // await zipWriter.close(undefined, {
    //   onprogress: (progress, total, entry) => {
    //     console.log(progress, total, entry)
    //     return undefined
    //   }
    // });
  } finally {
    await terminateWorkers();
  }
}

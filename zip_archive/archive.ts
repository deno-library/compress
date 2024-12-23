import type { compressInterface, uncompressInterface } from "../interface.ts";
import { path } from "../deps.ts";
import {
  terminateWorkers,
  ZipReader,
  ZipWriterStream,
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
  const stat = await Deno.stat(src);
  if(stat.isDirectory) {
    throw new Error("The source path is a directory, not a file: ${src}")
  }
  using srcFile = await Deno.open(src);
  const zipReader = new ZipReader(srcFile);
  try {
    const entries = await zipReader.getEntries();
    for (const entry of entries) {
      const filePath = path.resolve(dest, entry.filename);
      if (options?.debug) console.log(filePath);
      await Deno.mkdir(path.dirname(filePath), { recursive: true });
      if (entry.directory || !entry.getData) continue;
      await entry.getData((await Deno.create(filePath)).writable);
    }
  } finally {
    await zipReader.close();
    await terminateWorkers();
  }
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
  const stat = await Deno.stat(src);
  const zipper = new ZipWriterStream();
  zipper.readable.pipeTo((await Deno.create(dest)).writable);

  if (stat.isFile) {
    (await Deno.open(src)).readable.pipeTo(
      zipper.writable(path.basename(src)),
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
            if (isDirectory) {
              emptyReadableStream().pipeTo(
                zipper.writable(`${fileName}/`),
              );
              nextLoopList.push([filePath, fileName]);
            } else {
              (await Deno.open(filePath)).readable.pipeTo(
                zipper.writable(fileName),
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
      emptyReadableStream().pipeTo(zipper.writable(`${folderName}/`));
      if (options?.debug) console.log(path.resolve(src));
      await appendFolder(src, folderName);
    }
  }
  await zipper.close();
  await terminateWorkers();
}

const emptyReadableStream = () => {
  return new ReadableStream({
    start(controller) {
      controller.close();
    },
  });
};

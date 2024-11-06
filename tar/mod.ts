import type { compressInterface, uncompressInterface } from "../interface.ts";
import { path, exists } from "../deps.ts";
import { UntarStream } from "../deps.ts";
import { TarStream, type TarStreamInput } from "../deps.ts";

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
    const entry of (await Deno.open(src)).readable.pipeThrough(new UntarStream())
  ) {
    const filePath = path.resolve(dest, entry.path);
    if (options?.debug) console.log(filePath);
    await Deno.mkdir(path.dirname(filePath), { recursive: true });
    await entry.readable?.pipeTo((await Deno.create(filePath)).writable);
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
  const inputs: TarStreamInput[] = [];
  const stat = await Deno.lstat(src);
  if (stat.isFile) {
    inputs.push({
      type: "file",
      path: path.basename(src),
      size: stat.size,
      readable: (await Deno.open(src)).readable,
      options: {
        mtime: (stat?.mtime ?? new Date()).valueOf() / 1000 | 0,
      },
    });
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
              inputs.push({
                type: "directory",
                path: `${fileName}/`,
                options: {
                  mtime: ~~((stat?.mtime ?? new Date())
                    .valueOf() /
                    1000),
                },
              });
              nextLoopList.push([filePath, fileName]);
            } else {
              inputs.push({
                type: "file",
                path: fileName,
                size: stat.size,
                readable: (await Deno.open(filePath)).readable,
                options: {
                  mtime: (stat?.mtime ?? new Date()).valueOf() /
                      1000 | 0,
                },
              });
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
      inputs.push({
        type: "directory",
        path: path.basename(`${folderName}/`),
      });
      if (options?.debug) console.log(path.resolve(src));
      await appendFolder(src, folderName);
    }
  }

  await ReadableStream.from(inputs)
    .pipeThrough(new TarStream())
    .pipeTo((await Deno.create(dest)).writable);
}

import { Tar, Untar, ensureDir, resolve, basename } from "../deps.ts";
import { compressInterface } from "../interface.ts";

export async function uncompress(src: string, dest: string): Promise<void> {
  const reader = await Deno.open(src, { read: true });
  const untar = new Untar(reader);
  for await (const entry of untar) {
    const filePath = resolve(dest, entry.fileName);
    if (entry.type === "directory") {
      await ensureDir(filePath);
      continue;
    }
    const file = await Deno.open(filePath, { write: true, create: true });
    await Deno.copy(entry, file);
    await file.close();
  }
  reader.close();
}

export async function compress(
  src: string,
  dest: string,
  options?: compressInterface,
): Promise<void> {
  const tar = new Tar();
  const stat = await Deno.lstat(src);
  if (stat.isFile) {
    await tar.append(basename(src), {
      filePath: src,
    });
  } else {
    const appendFolder = async (folder: string, prefix?: string) => {
      for await (const { isDirectory, name } of Deno.readDir(folder)) {
        const fileName = prefix ? `${prefix}/${name}` : name;
        const filePath = resolve(folder, name);
        if (isDirectory) {
          await tar.append(
            `${fileName}/`,
            { reader: new Deno.Buffer(), contentSize: 0 },
          );
          await appendFolder(filePath, fileName);
        } else {
          await tar.append(fileName, {
            filePath,
          });
        }
      }
    };
    if (options?.excludeSrc) {
      await appendFolder(src);
    } else {
      const folderName = basename(src);
      await tar.append(
        `${folderName}/`,
        { reader: new Deno.Buffer(), contentSize: 0 },
      );
      await appendFolder(src, folderName);
    }
  }
  const writer = await Deno.open(dest, { write: true, create: true });
  await Deno.copy(tar.getReader(), writer);
  writer.close();
}

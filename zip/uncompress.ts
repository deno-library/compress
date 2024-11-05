import { exists, join } from "./deps.ts";

export interface uncompressInterface {
  // Whether to overwrite existing files
  overwrite?: boolean;
  // Whether to include the file name in the destination path
  includeFileName?: boolean;
}

/**
 * Uncompresses a zip file.
 * @param src - The path to the zip file.
 * @param dest - The path where the extracted files will be placed. Defaults to "./" if not provided.
 * @param options - Optional uncompression options.
 * @returns A promise that resolves to the path of the extracted files, or `false` if the uncompression process failed.
 * @throws Throws an error if the zip file does not exist.
 */
export async function uncompress(
  src: string,
  dest: string = "./",
  options?: uncompressInterface,
): Promise<string | false> {
  // check if the zip file is exist
  if (!await exists(src)) {
    throw "this file does not found";
  }

  // the file name with aut extension
  const fileNameWithOutExt = getFileNameFromPath(src);
  // get the extract file and add fileNameWithOutExt whene options.includeFileName is true
  const fullDestinationPath = options?.includeFileName
    ? join(dest, fileNameWithOutExt)
    : dest;

  // return the unzipped file path or false whene the unzipping Process failed
  return await uncompressProcess(src, fullDestinationPath, options)
    ? fullDestinationPath
    : false;
};

const uncompressProcess = async (
  zipSourcePath: string,
  destinationPath: string,
  options?: uncompressInterface,
): Promise<boolean> => {
  const cmd = Deno.build.os === "windows" ? "PowerShell" : "unzip";
  const args = Deno.build.os === "windows"
    ? [
      "Expand-Archive",
      "-Path",
      `"${zipSourcePath}"`,
      "-DestinationPath",
      `"${destinationPath}"`,
      options?.overwrite ? "-Force" : "",
    ]
    : [options?.overwrite ? "-o" : "", zipSourcePath, "-d", destinationPath];
  const p = new Deno.Command(cmd, {
    args: args,
    stderr: "piped",
    stdout: "piped",
  });
  const child = p.spawn();
  const processStatus = (await child.status).success;
  return processStatus;
};

function getFileNameFromPath(filePath: string): string {
  return filePath.split("/").at(-1)?.split(".").slice(0, -1).join(".") || "";
}

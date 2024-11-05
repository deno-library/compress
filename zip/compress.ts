import { exists, join } from "./deps.ts";

export interface compressInterface {
  // Indicates whether to overwrite the existing archive file
  overwrite?: boolean;
  // An array of flags to customize the compression process
  flags?: string[];
}

/**
 * Compresses the specified files into an archive.
 *
 * @param src - The file(s) to compress. It can be a single file or an array of files.
 * @param dest - The name of the archive file. Defaults to "./archive.zip".
 * @param options - Optional compress options.
 * @returns A promise that resolves to a boolean indicating whether the compression was successful.
 */
export async function compress(
  src: string | string[],
  dest: string = "./archive.zip",
  options?: compressInterface,
): Promise<boolean> {
  return await compressProcess(src, dest, options);
}

const compressProcess = async (
  src: string | string[],
  dest: string = "./archive.zip",
  options?: compressInterface,
): Promise<boolean> => {
  if (await exists(dest) && !(options?.overwrite)) {
    throw `The archive file ${
      join(Deno.cwd(), dest)
    } already exists, Use the {overwrite: true} option to overwrite the existing archive file`;
  }
  const filesList = typeof src === "string"
    ? src
    : src.join(Deno.build.os === "windows" ? ", " : " ");

  const cmd = Deno.build.os === "windows" ? "PowerShell" : "zip";
  const args = Deno.build.os === "windows"
    ? [
      "Compress-Archive",
      "-Path",
      filesList,
      "-DestinationPath",
      dest,
      options?.overwrite ? "-Force" : "",
    ]
    : ["-r", ...options?.flags ?? [], dest, ...filesList.split(" ")];
  const p = new Deno.Command(cmd, {
    args: args,
    stderr: "piped",
    stdout: "piped",
  });
  const child = p.spawn();
  const processStatus = (await child.status).success;
  return processStatus;
};

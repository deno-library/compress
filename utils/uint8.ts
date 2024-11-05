import type { Reader } from "../deps.ts";

/**
 * Reads a message from the provided Deno.Reader instance.
 * @param reader - The Deno.Reader instance to read from.
 * @returns A Promise that resolves to a Uint8Array or null if no more data is available.
 */
export async function readMsg(reader: Reader): Promise<Uint8Array | null> {
  const arr: Uint8Array[] = [];
  const n = 100;
  let readed: number | null;
  while (true) {
    const p: Uint8Array = new Uint8Array(n);
    readed = await reader.read(p);
    if (readed === null) break;
    if (readed < n) {
      arr.push(p.subarray(0, readed));
      break;
    } else {
      arr.push(p);
    }
  }
  if (readed === null) return null;
  const result = concatUint8Array(arr);
  return result;
}

/**
 * Concatenates multiple Uint8Array instances into a single Uint8Array.
 * @param arr - An array of Uint8Array instances to concatenate.
 * @returns A single Uint8Array containing all the concatenated data.
 */
export function concatUint8Array(arr: Uint8Array[]): Uint8Array {
  const length = arr.reduce((pre, next) => pre + next.length, 0);
  const result = new Uint8Array(length);
  let offset = 0;
  for (const v of arr) {
    result.set(v, offset);
    offset += v.length;
  }
  return result;
}

import { numberToHex, hexToUint8Array, uint8ArrayToHex } from "./hex.ts";

export function crc32(arr: Uint8Array | string) {
  if (typeof arr === "string") {
    arr = new TextEncoder().encode(arr);
  }
  let crc = -1, i, j, l, temp, poly = 0xEDB88320;

  for (i = 0, l = arr.length; i < l; i += 1) {
    temp = (crc ^ arr[i]) & 0xff;
    for (j = 0; j < 8; j += 1) {
      if ((temp & 1) === 1) {
        temp = (temp >>> 1) ^ poly;
      } else {
        temp = (temp >>> 1);
      }
    }
    crc = (crc >>> 8) ^ temp;
  }

  return numberToHex(crc ^ -1);
}

export class Crc32Stream {
  private bytes: number[] = [];
  private poly = 0xEDB88320;
  private crc = 0 ^ -1;
  private encoder = new TextEncoder();

  constructor() {
    this.init();
  }

  init() {
    let c, n, k;

    for (n = 0; n < 256; n += 1) {
      c = n;
      for (k = 0; k < 8; k += 1) {
        if (c & 1) {
          c = this.poly ^ (c >>> 1);
        } else {
          c = c >>> 1;
        }
      }
      this.bytes[n] = c >>> 0;
    }
  }

  reset() {
    this.init();
  }

  append(arr: Uint8Array | string) {
    if (typeof arr === "string") {
      arr = this.encoder.encode(arr);
    }

    let crc = this.crc;

    for (let i = 0, l = arr.length; i < l; i += 1) {
      crc = (crc >>> 8) ^ this.bytes[(crc ^ arr[i]) & 0xff];
    }

    this.crc = crc;

    return numberToHex(crc ^ -1);
  }
}

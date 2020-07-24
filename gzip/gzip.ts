import { crc32, Crc32Stream } from "../utils/crc32.ts";
import { deflate, inflate } from "../deflate/mod.ts";

// magic numbers marking this file as GZIP
const ID1 = 0x1F;
const ID2 = 0x8B;

const compressionMethods = {
  "deflate": 8,
};
const possibleFlags = {
  "FTEXT": 0x01,
  "FHCRC": 0x02,
  "FEXTRA": 0x04,
  "FNAME": 0x08,
  "FCOMMENT": 0x10,
};
// const osMap = {
//   "fat": 0, // FAT file system (DOS, OS/2, NT) + PKZIPW 2.50 VFAT, NTFS
//   "amiga": 1, // Amiga
//   "vmz": 2, // VMS (VAX or Alpha AXP)
//   "unix": 3, // Unix
//   "vm/cms": 4, // VM/CMS
//   "atari": 5, // Atari
//   "hpfs": 6, // HPFS file system (OS/2, NT 3.x)
//   "macintosh": 7, // Macintosh
//   "z-system": 8, // Z-System
//   "cplm": 9, // CP/M
//   "tops-20": 10, // TOPS-20
//   "ntfs": 11, // NTFS file system (NT)
//   "qdos": 12, // SMS/QDOS
//   "acorn": 13, // Acorn RISC OS
//   "vfat": 14, // VFAT file system (Win95, NT)
//   "vms": 15, // MVS (code also taken for PRIMOS)
//   "beos": 16, // BeOS (BeBox or PowerMac)
//   "tandem": 17, // Tandem/NSK
//   "theos": 18, // THEOS
// };
const os = {
  "darwin": 3,
  "linux": 3,
  "windows": 0,
};

const osCode = os[Deno.build.os] ?? 255;
export const DEFAULT_LEVEL = 6;

function putByte(n: number, arr: number[]) {
  arr.push(n & 0xFF);
}

// LSB first
function putShort(n: number, arr: number[]) {
  arr.push(n & 0xFF);
  arr.push(n >>> 8);
}

// LSB first
function putLong(n: number, arr: number[]) {
  putShort(n & 0xffff, arr);
  putShort(n >>> 16, arr);
}

function putString(s: string, arr: number[]) {
  var i, len = s.length;
  for (i = 0; i < len; i += 1) {
    putByte(s.charCodeAt(i), arr);
  }
}

function readByte(arr: number[]): number {
  return arr.shift()!;
}

function readShort(arr: number[]) {
  return arr.shift()! | (arr.shift()! << 8);
}

function readLong(arr: number[]) {
  var n1 = readShort(arr),
    n2 = readShort(arr);

  // JavaScript can't handle bits in the position 32
  // we'll emulate this by removing the left-most bit (if it exists)
  // and add it back in via multiplication, which does work
  if (n2 > 32768) {
    n2 -= 32768;

    return ((n2 << 16) | n1) + 32768 * Math.pow(2, 16);
  }

  return (n2 << 16) | n1;
}

function readString(arr: number[]) {
  var charArr = [];

  // turn all bytes into chars until the terminating null
  while (arr[0] !== 0) {
    charArr.push(String.fromCharCode(arr.shift()!));
  }

  // throw away terminating null
  arr.shift();

  // join all characters into a cohesive string
  return charArr.join("");
}

/*
	 * Reads n number of bytes and return as an array.
	 *
	 * @param arr- Array of bytes to read from
	 * @param n- Number of bytes to read
	 */
function readBytes(arr: number[], n: number) {
  var i, ret = [];
  for (i = 0; i < n; i += 1) {
    ret.push(arr.shift());
  }

  return ret;
}

interface Options {
  level: number;
  timestamp?: number;
  name?: string;
}

export function gzip(
  bytes: Uint8Array,
  options: Options = { level: DEFAULT_LEVEL },
): Uint8Array {
  let flags: number = 0;
  let level: number = options.level;
  const out: number[] = [];

  putByte(ID1, out);
  putByte(ID2, out);

  putByte(compressionMethods["deflate"], out);

  if (options.name) {
    flags |= possibleFlags["FNAME"];
  }

  putByte(flags, out);
  putLong(options.timestamp || Math.floor(Date.now() / 1000), out);

  // put deflate args (extra flags)
  if (level === 1) {
    // fastest algorithm
    putByte(4, out);
  } else if (level === 9) {
    // maximum compression (fastest algorithm)
    putByte(2, out);
  } else {
    putByte(0, out);
  }

  // OS identifier
  putByte(osCode, out);

  if (options.name) {
    // ignore the directory part
    putString(options.name.substring(options.name.lastIndexOf("/") + 1), out);

    // terminating null
    putByte(0, out);
  }

  deflate(bytes, level).forEach(function (byte) {
    putByte(byte, out);
  });

  putLong(parseInt(crc32(bytes), 16), out);
  putLong(bytes.length, out);

  return new Uint8Array(out);
}

export function gunzip(bytes: Uint8Array): Uint8Array {
  const arr = Array.from(bytes);
  let t: number;
  var flags,
    mtime,
    xFlags,
    crc,
    size,
    res;

  // check the first two bytes for the magic numbers
  if (readByte(arr) !== ID1 || readByte(arr) !== ID2) {
    throw "Not a GZIP file";
  }
  if (readByte(arr) !== 8) {
    throw "Unsupported compression method";
  }

  flags = readByte(arr);
  mtime = readLong(arr);
  xFlags = readByte(arr);
  readByte(arr); // os, throw away

  // just throw away the bytes for now
  if (flags & possibleFlags["FEXTRA"]) {
    t = readShort(arr);
    readBytes(arr, t);
  }

  // just throw away for now
  if (flags & possibleFlags["FNAME"]) {
    readString(arr);
  }

  // just throw away for now
  if (flags & possibleFlags["FCOMMENT"]) {
    readString(arr);
  }

  // just throw away for now
  if (flags & possibleFlags["FHCRC"]) {
    readShort(arr);
  }

  // give deflate everything but the last 8 bytes
  // the last 8 bytes are for the CRC32 checksum and filesize
  res = inflate(new Uint8Array(arr.splice(0, arr.length - 8)));

  // if (flags & possibleFlags["FTEXT"]) {
  //   res = Array.prototype.map.call(res, function (byte) {
  //     return String.fromCharCode(byte);
  //   }).join("");
  // }

  crc = readLong(arr) >>> 0;
  if (crc !== parseInt(crc32(res), 16)) {
    throw "Checksum does not match";
  }

  size = readLong(arr);
  if (size !== res.length) {
    throw "Size of decompressed file not correct";
  }

  return res;
}

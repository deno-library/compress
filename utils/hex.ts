export function numberToHex(n: number): string {
  return (n >>> 0).toString(16);
}

export function hexToUint8Array(str: string): Uint8Array {
  if (str.length === 0 || str.length % 2 !== 0) {
    throw new Error(`The string "${str}" is not valid hex.`);
  }
  return new Uint8Array(
    str.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
  );
}

export function uint8ArrayToHex(bytes: Uint8Array): string {
  return bytes.reduce(
    (str, byte) => str + byte.toString(16).padStart(2, "0"),
    "",
  );
}
export function arraySet(
  src: Uint8Array,
  src_offset: number,
  len: number,
  dest: Uint8Array,
  dest_offset: number,
) {
  dest.set(src.subarray(src_offset, src_offset + len), dest_offset);
}

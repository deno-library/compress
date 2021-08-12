import { assert, assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { deflate, inflate } from "../mod.ts";

Deno.test("deflate", () => {
  const str = "hello world!";
  const bytes = new TextEncoder().encode(str);
  const compressed = deflate(bytes);
  const decompressed = inflate(compressed);
  assert(str === new TextDecoder().decode(decompressed));
});

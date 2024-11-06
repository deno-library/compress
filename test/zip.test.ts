import { assert, assertEquals } from "jsr:@std/assert";
import { zip } from "../mod.ts";

Deno.test("zip.compress file", async () => {
  const src = "./test/dir/root.txt";
  const dest = "./test.zip";
  try {
    await zip.compress(src, dest, { debug: true });
    const stat = await Deno.lstat(dest);
    assertEquals(stat.size, 255);
    await Deno.remove(dest);
  } catch (error) {
    console.error(error);
    assert(false);
  }
});

Deno.test("zip.compress folder", async () => {
  const src = "./test/dir";
  const dest = "./deno.zip";
  try {
    await zip.compress(src, dest, { debug: true });
    const stat = await Deno.lstat(dest);
    assertEquals(stat.size, 943);
    await Deno.remove(dest);
  } catch (error) {
    console.error(error);
    assert(false);
  }
});

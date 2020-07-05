import {
  assert,
  assertEquals,
} from "https://deno.land/std/testing/asserts.ts";
import { tar } from "../mod.ts";

Deno.test("tar.compress file", async () => {
  const src = "./test/tar/tar.txt";
  const dest = "./test.tar";
  try {
    await tar.compress(src, dest);
    const stat = await Deno.lstat(dest);
    /**
     * 2048 = 512 (header) + 512 (content) + 1024 (footer)
     */
    assertEquals(stat.size, 2048);
    await Deno.remove(dest);
  } catch (error) {
    assert(false);
  }
});

Deno.test("tar.compress folder", async () => {
  const src = "./test/tar";
  const dest = "./test.tar";
  try {
    await tar.compress(src, dest);
    const stat = await Deno.lstat(dest);
    /**
     * 2560 = 512 (header) + 0 (content) + 512 (header) + 512 (content) + 1024 (footer)
     */
    assertEquals(stat.size, 2560);
    await Deno.remove(dest);
  } catch (error) {
    assert(false);
  }
});

Deno.test("tar.uncompress", async () => {
  const src = "./test/deno.tar";
  const dest = "./tar";
  const landTxtPath = "./tar/archive/deno/land/land.txt";
  const landTxtSize = 5;
  const landTxtContent = "land\n";
  try {
    await tar.uncompress(src, dest);
    const stat = await Deno.lstat(landTxtPath);
    assertEquals(stat.size, landTxtSize);
    const buf = await Deno.readFile(landTxtPath);
    const content = new TextDecoder().decode(buf);
    assertEquals(content, landTxtContent);
    await Deno.remove(dest, { recursive: true });
  } catch (error) {
    assert(false);
  }
});
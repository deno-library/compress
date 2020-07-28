import * as tgz from "./tgz/mod.ts";

// await tgz.uncompress("zfx.tar.gz", "./");

await tgz.compress("./zfx", "./zfx2.tar.gz");
import * as tgz from "./tgz/mod.ts";


console.time("a")

await tgz.compress("./zfx", "./zfx3.tar.gz");
await tgz.uncompress("./zfx3.tar.gz", "./zfx3");
console.timeEnd("a")
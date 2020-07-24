# compress
compress and uncompress for Deno

* [x] tar
* [x] deflate
* [x] gzip
* [ ] tgz
* [ ] zip

## Useage  

### tar 
> --allow-read --allow-write

__defination__
```ts
import { tar } from "https://deno.land/x/compress@v0.0.2/mod.ts";
export interface compressInterface {
  excludeSrc?: boolean; // exclude src directory, default: include src directory
}
tar.compress(src, dest, options?: compressInterface): Promise<void>;
tar.uncompress(src, dest): Promise<void>;
```

__exmaple__
```ts
import { tar } from "https://deno.land/x/compress@v0.0.2/mod.ts";

// compress folder
await tar.compress("./test","./test.tar");
// compress folder, exclude src directory
await tar.compress("./test","./test.tar", { excludeSrc: true });
// compress file
await tar.compress("./test.txt","./test.tar");
await tar.uncompress("./test.tar","./test");
```

### deflate
```ts
import { deflate, inflate } from "https://deno.land/x/compress@v0.0.2/mod.ts";
const str = "hello world!";
const bytes = new TextEncoder().encode(str);
const compressed = deflate(bytes);
const decompressed = inflate(compressed);
assert(str === new TextDecoder().decode(decompressed));
```

### gzip
Gzip only support compressing a single file. if you want to compress a dir with gzip, then you may need tgz instead.

> --allow-read --allow-write --allow-net

__defination__
```ts
class Gzip {
  compress(src: string, dest: string): Promise<void>;
  uncompress(src: string, dest: string): Promise<void>;
}
```

__exmaple__
```ts
import { Gzip } from "https://deno.land/x/compress@v0.0.2/mod.ts";
const gzip = new Gzip();
await gzip.compress("./deno.txt", "./deno.txt.gz");
await gzip.uncompress("./deno.txt.gz", "./deno.txt");
```

### tgz
__defination__
```ts
import { tgz } from "https://deno.land/x/compress@v0.0.2/mod.ts";
interface compressInterface {
  excludeSrc?: boolean; // exclude src directory, default: include src directory
}
tgz.compress(src, dest, options?: compressInterface): Promise<void>;
tgz.uncompress(src, dest): Promise<void>;
```

### zip
__defination__
```ts
import { zip } from "https://deno.land/x/compress@v0.0.2/mod.ts";
interface compressInterface {
  excludeSrc?: boolean; // exclude src directory, default: include src directory
}
zip.compress(src, dest, options?: compressInterface): Promise<void>;
zip.uncompress(src, dest): Promise<void>;
```

## test
```ts
deno test --allow-read --allow-write --allow-net
```
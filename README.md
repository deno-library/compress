# compress
compress and uncompress for Deno

* [x] tar
* [x] deflate
* [x] gzip
* [ ] tgz
* [ ] zip

## Useage  
If you read and write files, need the following permissions
> --allow-read --allow-write

### tar 

__defination__
```ts
import { tar } from "https://deno.land/x/compress@v0.1.0/mod.ts";
export interface compressInterface {
  excludeSrc?: boolean; // exclude src directory, default: include src directory
}
tar.compress(src, dest, options?: compressInterface): Promise<void>;
tar.uncompress(src, dest): Promise<void>;
```

__exmaple__
```ts
import { tar } from "https://deno.land/x/compress@v0.1.0/mod.ts";
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
import { deflate, inflate } from "https://deno.land/x/compress@v0.1.0/mod.ts";
const str = "hello world!";
const bytes = new TextEncoder().encode(str);
const compressed = deflate(bytes);
const decompressed = inflate(compressed);
assert(str === new TextDecoder().decode(decompressed));
```

### gzip
GzipStream only supports compressing and decompressing a single file.

__defination__
```ts
interface GzipOptions {
  level: number;
  timestamp?: number;
  name?: string;
}
gzip(bytes: Uint8Array, options?:GzipOptions): Uint8Array;
gunzip(bytes: Uint8Array): Uint8Array;
class GzipStream {
  compress(src: string, dest: string): Promise<void>;
  uncompress(src: string, dest: string): Promise<void>;
  on(event: "progress", listener: (percent: string) => void): this;
}
```

__exmaple__  
compress and uncompress file, only supports compressing and decompressing a single file 

no stream, loading all data into memory
```ts
// need --allow-net for use https://github.com/hazae41/denoflate
// not export in mod.ts and not in deps.ts for it requires permission --allow-net  
// so you must import from this file
import { gzipFile, gunzipFile } from "https://deno.land/x/compress@v0.1.0/gzip/gzip_file.ts";
await gzipFile("./deno.txt", "./deno.txt.gz"); // stream
await gunzipFile("./deno.txt.gz", "./deno.txt");
```

stream, only gzip.compress is available
```ts
import { GzipStream } from "https://deno.land/x/compress@v0.1.0/mod.ts";
const gzip = new GzipStream();
gzip.on("progress", (progress: string) => {
  console.log(progress); // 0.00% => 100.00%
});
await gzip.compress("./big.exe", "./big.exe.gz");
// Having problems with streaming decompression, don't use.
await gzip.uncompress("./deno.txt.gz", "./deno.txt");
```

gzip or gunzip string, this is a pure JavaScript implementation.
> If you want to run fast, you may need https://github.com/hazae41/denoflate
```ts
import { gzip, gunzip } from "https://deno.land/x/compress@v0.1.0/mod.ts";
// gzip
const bytes = new TextEncoder().encode("hello");
const compressed = gzip(bytes);
// gunzip
const decompressed = gunzip(compressed);
```

### tgz
__defination__
```ts
import { tgz } from "https://deno.land/x/compress@v0.1.0/mod.ts";
interface compressInterface {
  excludeSrc?: boolean; // exclude src directory, default: include src directory
}
tgz.compress(src, dest, options?: compressInterface): Promise<void>;
tgz.uncompress(src, dest): Promise<void>;
```

### zip
__defination__
```ts
import { zip } from "https://deno.land/x/compress@v0.1.0/mod.ts";
interface compressInterface {
  excludeSrc?: boolean; // exclude src directory, default: include src directory
}
zip.compress(src, dest, options?: compressInterface): Promise<void>;
zip.uncompress(src, dest): Promise<void>;
```

## test
```ts
deno test --allow-read --allow-write
```
# compress
compress and uncompress for Deno

* [x] tar
* [x] deflate
* [x] gzip
* [x] tgz
* [ ] zip

## Useage  
If you read and write files, need the following permissions
> --allow-read --allow-write

### tar 

#### defination
```ts
import { tar } from "https://deno.land/x/compress@v0.2.2/mod.ts";
export interface compressInterface {
  excludeSrc?: boolean; // exclude src directory, default: include src directory
}
tar.compress(src, dest, options?: compressInterface): Promise<void>;
tar.uncompress(src, dest): Promise<void>;
```

#### exmaple
```ts
import { tar } from "https://deno.land/x/compress@v0.2.2/mod.ts";
// compress folder
await tar.compress("./test","./test.tar");
// compress folder, exclude src directory
await tar.compress("./test","./test.tar", { excludeSrc: true });
// compress file
await tar.compress("./test.txt","./test.tar");
// uncompress
await tar.uncompress("./test.tar","./dest");
```

### deflate  
This is a pure TypeScript implementation of deflate.
```ts
import { 
  deflate, 
  inflate, 
  /** Compress data using deflate, and do not append a zlib header. */
  deflateRaw, 
  inflateRaw
 } from "https://deno.land/x/compress@v0.2.2/mod.ts";
const str = "hello world!";
const bytes = new TextEncoder().encode(str);
// with zlib header
const compressed = deflate(bytes);
const decompressed = inflate(compressed);
// no zlib header
const compressed = deflateRaw(bytes);
const decompressed = inflateRaw(compressed);
```

### gzip

#### defination
```ts
interface GzipOptions {
  level: number;
  timestamp?: number;
  name?: string;
}
gzip(bytes: Uint8Array, options?:GzipOptions): Uint8Array;
gunzip(bytes: Uint8Array): Uint8Array;
gzipFile(src: string, dest: string): Promise<void>;
gunzipFile(src: string, dest: string): Promise<void>;
class GzipStream {
  compress(src: string, dest: string): Promise<void>;
  uncompress(src: string, dest: string): Promise<void>;
  on(event: "progress", listener: (percent: string) => void): this;
}
```

#### exmaple 
compress and uncompress file, only supports compressing and decompressing a single file 

__stream mode__  
used to read and write large files
```ts
import { GzipStream } from "https://deno.land/x/compress@v0.2.2/mod.ts";
const gzip = new GzipStream();
gzip.on("progress", (progress: string) => {
  console.log(progress); // 0.00% => 100.00%
});
await gzip.compress("./big.mkv", "./big.mkv.gz");
await gzip.uncompress("./big.mkv.gz", "./big.mkv");
```  

__no stream mode__  
loading all data into memory, so can't get `progress` event
```ts
import { gzipFile, gunzipFile } from "https://deno.land/x/compress@v0.2.2/mod.ts";
await gzipFile("./deno.txt", "./deno.txt.gz"); // stream
await gunzipFile("./deno.txt.gz", "./deno.txt");
```

**gzip/gunzip string or bytes**  
> This is a pure TypeScript implementation. Almost as fast as Rust implementation.
```ts
import { gzip, gunzip } from "https://deno.land/x/compress@v0.2.2/mod.ts";
// gzip
const bytes = new TextEncoder().encode("hello");
const compressed = gzip(bytes);
// gunzip
const decompressed = gunzip(compressed);
```

### tgz  

#### defination
```ts
import { tgz } from "https://deno.land/x/compress@v0.2.2/mod.ts";
interface compressInterface {
  excludeSrc?: boolean; // exclude src directory, default: include src directory
}
tgz.compress(src, dest, options?: compressInterface): Promise<void>;
tgz.uncompress(src, dest): Promise<void>;
```  

#### exmaple
```ts
import { tgz } from "https://deno.land/x/compress@v0.2.2/mod.ts";
// compress folder
await tgz.compress("./test","./test.tar.gz");
// compress folder, exclude src directory
await tgz.compress("./test","./test.tar.gz", { excludeSrc: true });
// compress file
await tgz.compress("./test.txt","./test.tar.gz");
// uncompress 
await tgz.uncompress("./test.tar.gz","./dest");
```

### zip
#### defination
```ts
import { zip } from "https://deno.land/x/compress@v0.2.2/mod.ts";
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

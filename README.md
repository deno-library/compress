# compress
compress and uncompress for Deno

* [x] tar
* [ ] gzip
* [ ] tgz
* [ ] zip

## useage  
```ts
import { tar, gzip, tgz, zip } from "https://deno.land/x/unrar@v0.0.1/mod.ts";

export interface compressInterface {
  excludeSrc?: boolean; // exclude src directory, default: include src directory
}

await tar.compress(src, dest, options?: compressInterface);
await tar.uncompress(src, dest);

await gzip.compress(src, dest, options?: compressInterface);
await gzip.uncompress(src, dest);

await tgz.compress(src, dest, options?: compressInterface);
await tgz.uncompress(src, dest);

await zip.compress(src, dest, options?: compressInterface);
await zip.uncompress(src, dest);
```

## exmaple 

### tar
```ts
import { tar } from "https://deno.land/x/unrar@v0.0.1/mod.ts";

// compress folder
await tar.compress("./test","./test.tar");
// compress folder, exclude src directory
await tar.compress("./test","./test.tar", { excludeSrc: true });
// compress file
await tar.compress("./test.txt","./test.tar");
await tar.uncompress("./test.tar","./test");
```

## test
```ts
deno test --allow-read --allow-write 
```
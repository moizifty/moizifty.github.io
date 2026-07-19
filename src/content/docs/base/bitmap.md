---
title: Bitmap
order: 8
---

`src/bitmap` centers on one `Bitmap` type that every decoder converts into:

```c
typedef struct Bitmap
{
    u8 *pixels;
    vec2i size;
    BitmapFormatKind fmt; // e.g. BITMAP_FORMAT_R8G8B8A8, BITMAP_FORMAT_B8G8R8A8
    u64 bytesPerPixel;
} Bitmap;
```

## Decoders

All three are written from scratch, no `stb_image`. PNG (`bitmapPNG.h`, via `bitmapFromPNGPath`/`Raw`) walks the chunk stream (`IHDR`/`IDAT`/`PLTE`/`IEND`) and pipes `IDAT` data through my own [DEFLATE decoder](/projects/base/compression/). QOI (`bitmapQOI.h`, `bitmapFromQOIPath`/`Raw`) is built on [`Bitstream`](/projects/base/datastructures/). DDS (`bitmapDDS.h`, `bitmapFromDDSPath`/`Raw`) includes DXT1/DXT3/DXT5 block decompression (`bitmapDDSCalculateColorsFromDXT1Block` and friends).

## Direct pixel access (`bitmapCore.h`)

`bitmapPush` allocates a new `Bitmap` of a given size and format from an arena. `bitmapGetPixelColor4u8`/`bitmapSetPixelColor4u8` are the per-pixel read/write, and `bitmapClear`/`bitmapDrawPixel`/`bitmapDrawRect`/`bitmapDrawLine` do the obvious. `bitmapBlitToBitmap` copies a region between bitmaps through a `BitmapSampler`, which controls edge addressing (wrap/clamp/discard) and alpha blending. `bitmapFastBlitToBitmap` skips the sampler entirely for a same-format straight copy when you don't need any of that.

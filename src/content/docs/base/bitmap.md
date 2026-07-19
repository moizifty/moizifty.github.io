---
title: Bitmap
order: 7
---

`src/bitmap` centers on one `Bitmap` type that every decoder converts
into:

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

All three are implemented from scratch — no `stb_image`.

- **PNG** (`bitmapPNG.h`) — `bitmapFromPNGPath`/`Raw`. Walks the chunk
  stream (`IHDR`/`IDAT`/`PLTE`/`IEND`) and pipes `IDAT` data through the
  [DEFLATE decoder](/projects/base/compression/).
- **QOI** (`bitmapQOI.h`) — `bitmapFromQOIPath`/`Raw`, built on
  [`Bitstream`](/projects/base/datastructures/).
- **DDS** (`bitmapDDS.h`) — `bitmapFromDDSPath`/`Raw`, including DXT1/
  DXT3/DXT5 block decompression (`bitmapDDSCalculateColorsFromDXT1Block`
  and friends).

## Direct pixel access (`bitmapCore.h`)

- `bitmapPush` — allocate a new `Bitmap` of a given size/format from an
  arena.
- `bitmapGetPixelColor4u8` / `bitmapSetPixelColor4u8` — per-pixel
  read/write.
- `bitmapClear`, `bitmapDrawPixel`, `bitmapDrawRect`, `bitmapDrawLine`.
- `bitmapBlitToBitmap` — copy a region between bitmaps, resolved through a
  `BitmapSampler` (edge addressing: wrap/clamp/discard, plus an alpha
  `BitmapBlendOp`). `bitmapFastBlitToBitmap` skips the sampler for a
  same-format straight memcpy-style copy.

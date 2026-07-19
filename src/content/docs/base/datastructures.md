---
title: Data structures
order: 6
---

Currently just one thing here: `Bitstream` (`src/datastructures/bitstream.h`), a bit-level reader over a `U8Array`, used by the format decoders ([`compression/compressionDeflate`](/projects/base/compression/), [`bitmap/bitmapQOI`](/projects/base/bitmap/)) to read a stream `n` bits at a time instead of whole bytes.

```c
typedef struct Bitstream
{
    U8Array bytes;
    u64 bitIndex;
} Bitstream;
```

`bitstreamPopBit`/`bitstreamPopBitsAsU8`/`bitstreamPopBitsAsU64` pop `n` bits LSB-first, and the `Reversed` variants do the same but bit-reversed, which I needed for codes read MSB-first like DEFLATE's Huffman codes. For byte-aligned reads there's `bitstreamPopU8`/`U16LE`/`U16BE`/`U32LE`/`U32BE`/`U64LE`/`U64BE`, and every one of those has a `bitstreamPeek*` counterpart that reads without consuming. `bitstreamPopTillNextByte` discards whatever's left in the current byte, for formats that byte-align between sections (DEFLATE's stored blocks do this).

All the pop/peek functions return `bool`, `false` means the stream ran out of bits before it could satisfy the read.

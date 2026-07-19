---
title: Data structures
order: 5
---

Currently just one thing: `Bitstream` (`src/datastructures/bitstream.h`) —
a bit-level reader over a `U8Array`, used by the format decoders
(`compression/compressionDeflate`, `bitmap/bitmapQOI`) to read a stream
`n` bits at a time instead of whole bytes.

```c
typedef struct Bitstream
{
    U8Array bytes;
    u64 bitIndex;
} Bitstream;
```

- `bitstreamPopBit` / `bitstreamPopBitsAsU8` / `bitstreamPopBitsAsU64` —
  pop `n` bits, LSB-first.
- `bitstreamPopBitsReversedAsU8` / `...U64` — same, but bit-reversed —
  needed for codes read MSB-first, like DEFLATE's Huffman codes.
- `bitstreamPopU8` / `U16LE` / `U16BE` / `U32LE` / `U32BE` / `U64LE` /
  `U64BE` — byte-aligned reads, both endiannesses.
- `bitstreamPeek*` — same shapes as the `Pop*` functions, without
  consuming.
- `bitstreamPopTillNextByte` — discard the remaining bits in the current
  byte, for formats that byte-align between sections (DEFLATE's stored
  blocks do this).

All of the pop/peek functions return `bool` — `false` means the stream ran
out of bits before it could satisfy the read.

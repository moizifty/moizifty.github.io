---
title: Compression
order: 6
---

Two independent compressors under `src/compression`.

## DEFLATE (`compressionDeflate.h`)

Decode-only (`compressionDeflateUncompress`), built on
[`Bitstream`](/projects/base/datastructures/). Implements canonical
Huffman decoding — `compressionDeflateGenerateHuffmanCodes` builds codes
from a table of code lengths, `compressionDeflateDecodeHuffmanCode` walks
them bit by bit — plus DEFLATE's literal/length + distance dual-tree block
format (`compressionDeflateDecodeHuffmanBlock`).

This is what backs PNG decoding: `bitmap/bitmapPNG.h` includes it directly
to decompress `IDAT` chunk data.

## LZ4M (`compressionLZ.h`)

A custom LZ4-like compressor, both directions —
`compressionLZ4MCompress`/`compressionLZ4MUncompress`. Own format,
documented inline in the header:

- Each block starts with a 1-byte token: the high nibble is the literal
  run length ("len"), the low nibble is the backreference match length.
- Either nibble being 15 means "read more" — keep consuming 0xFF
  continuation bytes and adding them to the length, stopping at the first
  byte that isn't 255 (if the raw literal length is exactly 15, an extra
  0 byte follows so this doesn't ambiguously read forever).
- After the token: `len` literal bytes, then a 2-byte little-endian
  `offset` — how far back to copy the backreference from.

`compressionLZ4MSubByteDict` is the compressor's match-finder — a hash
table of byte sequences (`CompressionLZ4MSubByteDictSlot` buckets) used to
find backreference candidates during compression.

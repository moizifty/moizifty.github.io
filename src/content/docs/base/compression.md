---
title: Compression
order: 7
---

Two independent compressors under `src/compression`.

## DEFLATE (`compressionDeflate.h`)

Decode-only (`compressionDeflateUncompress`), built on [`Bitstream`](/projects/base/datastructures/). It implements canonical Huffman decoding: `compressionDeflateGenerateHuffmanCodes` builds codes from a table of code lengths, and `compressionDeflateDecodeHuffmanCode` walks them bit by bit, plus DEFLATE's literal/length and distance dual-tree block format (`compressionDeflateDecodeHuffmanBlock`). This is what backs PNG decoding, `bitmap/bitmapPNG.h` includes it directly to decompress `IDAT` chunk data.

## LZ4M (`compressionLZ.h`)

This one is my own take on LZ4, both directions (`compressionLZ4MCompress`/`compressionLZ4MUncompress`), with my own format. Each compressed block begins with a 1-byte token: the high 4 bits are the length of the literal run that follows ("len"), the low 4 bits are the match length for a backreference.

If "len" is 15, that means read more, keep consuming 0xFF continuation bytes and adding them to the length until you hit a byte that isn't 255 (if the raw literal length is exactly 15, there's an extra 0 byte after it so this doesn't ambiguously keep reading). After that comes `len` literal bytes to write straight to the output, then a 2-byte little-endian `offset`, how far back to go to start the backreference. If the match length was 15, you do the same continuation trick to get the real backreference length.

`compressionLZ4MSubByteDict` is the compressor's match-finder, a hash table of byte sequences (`CompressionLZ4MSubByteDictSlot` buckets) used to find backreference candidates while compressing.

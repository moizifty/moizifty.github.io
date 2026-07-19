---
title: Third-party
order: 14
---

One vendored dependency: `ts_stb_sprintf.h`, a modified copy of Sean
Barrett/RAD Game Tools' public-domain `stb_sprintf` (via Dion Systems'
Telescope codebase fork, per the file's header comment). It's a full,
fast `sprintf`-family implementation — used to back `basePrintf` and the
rest of Base's formatted output rather than relying on the platform CRT,
so format strings behave the same across MSVC and GCC/Clang (notably for
64-bit integers, which the two disagree on otherwise).

Everything else in Base is written from scratch — this is the one
exception, and it's kept isolated in its own folder rather than mixed into
`src/base`.

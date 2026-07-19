---
title: Tests
order: 13
---

`src/tests` isn't an automated test suite — it's a scratch program
(`main.c`) used to manually exercise whatever part of Base is being worked
on: the C lexer, `basePrintf`, OS process/net calls, the renderer, bitmap
loading, LZ4M compression, all wired up ad hoc and commented in/out as
needed. It's built the same way the other entry points are (unity build,
pulling in `base`, `os`, `renderer`, `bitmap`, `compression`,
`datastructures`, and `bss` directly via `#include`).

`main_linux.c` is a minimal Linux entry point — just `base` + `os/core`,
with an empty `ProgramMain` — used to confirm the Linux backend compiles
and runs at all, separate from whatever Windows-only experiment is
currently in `main.c`.

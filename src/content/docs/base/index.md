---
title: Overview
order: 0
---

Base is a library used across all of my C programs. It has work-in-progress
Linux support and (currently more complete) Windows support.

It bundles two extra tools:

- **[Metagen](/projects/base/metagen/)** — a metagenerator for C source: type
  reflection at runtime, embedding files into headers, and a `defer`
  statement implementation for C.
- **[BSS](/projects/base/bss/)** (`base/bss`) — a small interpreted build
  scripting language, Python-like semantics with C-like syntax.

The Windows support is ahead of Linux right now — more of the Win32 API is
wrapped than the Linux equivalent — but most programs (including `amp`)
compile fine on both.

## Building

There are three build scripts, used to build the test `.c` file in
`base/tests`. Builds tend to use unity builds — all `.c`/`.h` files pulled
into a single translation unit (not the game engine, though).

| Script      | Platform | Notes                                                            |
| ----------- | -------- | ----------------------------------------------------------------- |
| `build.bs`  | Linux    |                                                                     |
| `build.bat` | Windows  |                                                                     |
| `build.bss` | Windows  | Written in Base's own script language (`.bss`) — currently Windows-only |

## Quick example

A minimal program using Base's `defer` (via Metagen) and command-line
parsing (via `baseCmdline.h`) together:

```c
#include "base.h"
#include "baseCmdline.h"

int main(int argc, char **argv) {
    int *count = cmdlineInt("count", 1, "number of times to greet");
    cmdlineParse(argc, argv);

    FILE *log = fopen("run.log", "w");
    defer(fclose(log));

    for (int i = 0; i < *count; i++) {
        fprintf(log, "hello #%d\n", i);
    }

    return 0;
}
```

Compiled as a unity build via `build.bs` / `build.bat`, then run through
Metagen with the `defers` arg so the `defer(fclose(log))` call gets
expanded before the real compile.

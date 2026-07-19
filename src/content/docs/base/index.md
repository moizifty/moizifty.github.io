---
title: Overview
order: 0
---

Base is a library used across all of my C programs. It is cross platform, currently only supporting Linux and Windows. The support for Linux is functional (most programs compile) but is still incomplete.

Within Base, there are 2 extra tools which are compiled as executables but can also be used as a library.

- **[Metagen](/projects/base/metagen/)** (`base/metagen`) — A metacode generator for C source files. See **[Metagen](/projects/base/metagen/)** for more information.
- **[BSS](/projects/base/bss/)** (`base/bss`) — a small interpreted build
  scripting language, Python-like semantics with C-like syntax. See **[BSS](/projects/base/bss/)** for more information

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

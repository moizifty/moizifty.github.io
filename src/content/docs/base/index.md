---
title: Overview
order: 0
---

Base is a library used across all of my C programs. It is cross platform, currently only supporting Linux and Windows. The support for Linux is functional (most programs compile) but is still incomplete.

Within Base, there are 2 extra tools which are compiled as executables but can also be used as a library.

- **[Metagen](/projects/base/metagen/)** (`base/metagen`) — A metacode generator for C source files. See **[Metagen](/projects/base/metagen/)** for more information.
- **[BSS](/projects/base/bss/)** (`base/bss`) — a small interpreted build
  scripting language, Python like semantics with C like syntax. See **[BSS](/projects/base/bss/)** for more information

## Using Base

Using Base is as simple as doing `git clone https://github.com/moizifty/base` and including the headers and source files you need. Base is built aroound being used in `Unity builds` so the source and headers must both be included. 

```c
#include "base/base.h"
#include "os/core/osCore.h"

#include "base/base.c"
#include "os/core/osCore.c"

#include "os/core/osEntryPoint.c"

void ProgramMain(Str8List *args)
{
    basePrintf("Whatsup!\n");
}
```

There are three example build scripts, used to build the test `.c` file in
`base/tests`.

| Script      | Platform | Notes                                                            |
| ----------- | -------- | ----------------------------------------------------------------- |
| `build.bs`  | Linux    |                                                                     |
| `build.bat` | Windows  |                                                                     |
| `build.bss` | Windows  | Written in Base's own script language (`.bss`) — currently Windows-only |

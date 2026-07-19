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

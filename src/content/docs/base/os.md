---
title: OS
order: 4
---

`src/os` is the single point of contact for every platform-specific
operation — arenas, files, threads, windowing, and sockets all go through
here rather than hitting Win32/POSIX directly. It's split into three areas,
each with backends selected at compile time via `OS_WIN32`/`OS_LINUX`.

## Core (`os/core`)

Memory, files, processes, time. Backends live in `core/win32` and
`core/linux`.

- **Memory** — `OSReserveMemory`/`OSCommitMemory`/`OSDecommitMemory`/`OSFreeMemory`/`OSSetAccessMemory`.
  Arenas are wired straight to these: `arenaReserveImpl`/`arenaCommitImpl`/
  `arenaDecommitImpl`/`arenaFreeImpl` default to the `OS*Memory` functions
  unless overridden, so growing an arena is a page-level `VirtualAlloc`/
  `mmap` call, not `malloc`.
- **Files** — `OSFileOpen`/`Write`/`Close`, `OSFileReadAll`/`WriteAll`,
  `OSPathExists`/`IsDirectory`/`Delete`, `OSFindFileBegin`/`Next`/`End` for
  directory iteration, `OSGetFilePaths` for a recursive glob.
- **Processes** — `OSProcessOpen`/`Wait`/`ReadStdoutStderr`/`Close`,
  `OSDynamicLibraryOpen`/`GetExportAddress`/`Close`.
- **Time** — `OSGetSytemTime`/`OSGetLocalTime` (return `DateTime`),
  `OSGetPerformanceCounter`/`Frequency` for high-res timing.
- **Misc** — `OSGetEnvironmentVar`, cursor/window coordinate helpers,
  `OSSetThreadDebuggerName` for naming threads in a debugger.

## Gfx (`os/gfx`)

Window creation and the input/event loop. Win32-only right now
(`gfx/win32`).

```c
OSGfxState *gfx = OSGfxInit(arena);
OSHandle wnd = OSGfxWindowOpen(STR8_LIT("title"), Vec2i(1280, 720), Vec2i(100, 100));
OSGfxWindowFirstPaint(wnd);

OSEventList events = OSGfxProcessEvents(arena);
bool stillRunning = OSGfxProcessInputEvents(arena);

if (OSGfxIsKeyPressed(OS_KEY_A)) { /* ... */ }
```

`OSGfxIsKeyHeld`/`IsKeyPressed`/`IsKeyReleased` read the per-frame key
state updated by `OSGfxProcessInputEvents`; `OSGfxProcessEvents` returns
the raw `OSEventList` (window close, lost focus, key press/release) if you
need the events themselves rather than polled state.

## Net (`os/net`)

Berkeley-socket-shaped API — `OSNetSocketCreate`/`Bind`/`Listen`/`Accept`/
`Connect`, `OSNetSocketSend`/`SendTo`/`Recieve`/`RecieveFrom`, plus
`OSNetSocketPollArray`/`PollList` for polling multiple sockets. Address
resolution goes through `OSNetGetAddrInfo`/`OSNetStr8ToAddr`/
`OSNetAddrToStr8`, and raw sockets are supported for hand-building packets
— `OSNetIPHeader` and `OSNetICMPCommonHeader`/`OSNetICMPEcho` are laid out
with `#pragma pack(push, 1)` for that.

`os/net/osNetHTTP.h` adds a minimal HTTP packet parser
(`OSNetHttpPacketFromStr8`) for reading a response straight off a socket
without a real HTTP client — headers, status line, and body.

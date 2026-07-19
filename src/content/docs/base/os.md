---
title: OS
order: 5
---

`src/os` is the single point of contact for every platform-specific operation, arenas, files, threads, windowing, sockets, all of it goes through here instead of hitting Win32/POSIX directly. It's split into three areas, each with backends picked at compile time via `OS_WIN32`/`OS_LINUX`.

## Core (`os/core`)

Memory, files, processes, time. Backends live in `core/win32` and `core/linux`.

Memory is `OSReserveMemory`/`OSCommitMemory`/`OSDecommitMemory`/`OSFreeMemory`/`OSSetAccessMemory`, and arenas are wired straight to these: `arenaReserveImpl`/`arenaCommitImpl`/`arenaDecommitImpl`/`arenaFreeImpl` default to the `OS*Memory` functions unless I override them, so growing an arena is a page-level `VirtualAlloc`/`mmap` call, not `malloc`.

Files are `OSFileOpen`/`Write`/`Close`, `OSFileReadAll`/`WriteAll`, `OSPathExists`/`IsDirectory`/`Delete`, `OSFindFileBegin`/`Next`/`End` for walking a directory, and `OSGetFilePaths` for a recursive glob. Processes get `OSProcessOpen`/`Wait`/`ReadStdoutStderr`/`Close`, plus `OSDynamicLibraryOpen`/`GetExportAddress`/`Close` for loading DLLs/shared objects. Time is `OSGetSytemTime`/`OSGetLocalTime` (both return a `DateTime`) and `OSGetPerformanceCounter`/`Frequency` for high-res timing. There's also `OSGetEnvironmentVar`, cursor/window coordinate helpers, and `OSSetThreadDebuggerName` for naming threads so they show up nicely in a debugger.

## Gfx (`os/gfx`)

Window creation and the input/event loop. Win32-only right now (`gfx/win32`), Linux windowing isn't there yet.

```c
OSGfxState *gfx = OSGfxInit(arena);
OSHandle wnd = OSGfxWindowOpen(STR8_LIT("title"), Vec2i(1280, 720), Vec2i(100, 100));
OSGfxWindowFirstPaint(wnd);

OSEventList events = OSGfxProcessEvents(arena);
bool stillRunning = OSGfxProcessInputEvents(arena);

if (OSGfxIsKeyPressed(OS_KEY_A)) { /* ... */ }
```

`OSGfxIsKeyHeld`/`IsKeyPressed`/`IsKeyReleased` read the per-frame key state that `OSGfxProcessInputEvents` updates. If you want the raw events instead of polled state, `OSGfxProcessEvents` gives you the `OSEventList` directly, window close, lost focus, key press/release.

## Net (`os/net`)

A Berkeley-socket-shaped API, `OSNetSocketCreate`/`Bind`/`Listen`/`Accept`/`Connect`, `OSNetSocketSend`/`SendTo`/`Recieve`/`RecieveFrom`, and `OSNetSocketPollArray`/`PollList` for polling more than one socket at once. Address resolution goes through `OSNetGetAddrInfo`/`OSNetStr8ToAddr`/`OSNetAddrToStr8`. Raw sockets are supported too for hand-building packets, `OSNetIPHeader` and `OSNetICMPCommonHeader`/`OSNetICMPEcho` are laid out with `#pragma pack(push, 1)` for exactly that.

`os/net/osNetHTTP.h` adds a minimal HTTP packet parser (`OSNetHttpPacketFromStr8`) for reading a response straight off a socket without needing a real HTTP client, headers, status line, and body.

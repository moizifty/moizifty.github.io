---
title: Base
order: 1
---

`src/base` is the foundation everything else in the repo builds on.

## Core types (`baseCoreTypes.h`)

Fixed-width aliases (`u8`..`u64`, `i8`..`i64`, `f32`, `f64`), plus the two
types used everywhere else in the codebase:

```c
typedef struct str8 { u8 *data; u64 len; } str8;      // length-prefixed string, not null-terminated
typedef struct ArrayView { void *data; u64 len; u64 elemSize; } ArrayView;
```

`ArrayView` isn't used as much anymore, since i've refactored Base a few times, for type specific ArrayView's which are generally preferred.

`null`, `global` (`extern`), `threadlocal`, and `readonly` (a
executable section placed const attribute, platform specific) are also defined here,
since almost everything else depends on them.

## Arenas (`baseMemory.h`)

The only allocator. I don't use `malloc`/`free`. Arenas
reserve a large virtual address range up front and commit pages as you
push into them:

```c
Arena *arena = arenaAlloc(BASE_MEGABYTES(64)); // or arenaAllocDefault() for BASE_ARENA_DEFAULT_SIZE

MyStruct *s = arenaPushType(arena, MyStruct);
MyStruct *arr = arenaPushArray(arena, MyStruct, 100);

ArenaTemp temp = arenaTempBegin(arena);
// scratch work using `arena`...
arenaTempEnd(temp); // rewinds arena->pos back to the checkpoint

arenaFree(arena);
```

`arenaPush` zeroes the memory it returns; `arenaPushNoZero` skips that.
`arenaPopTo`/`arenaPop` roll the arena back manually.
[`baseThreadsGetCtx`](#threading--per-thread-context-basethreadsh) exposes
two scratch arenas per thread (`baseTempBegin`/`baseTempEnd`) for
throwaway work without owning an arena — used all over the rest of the
codebase (see the `StructToStr8` example in
[Metagen](/projects/base/metagen/)).

`arenaReserveImpl`/`arenaCommitImpl`/`arenaDecommitImpl`/
`arenaFreeImpl` default to [`os/core`](/projects/base/os/)'s
`OSReserveMemory`/`OSCommitMemory`.

## Strings (`baseStrings.h`)

`str8` (and `str16`/`str32` for wide strings) are the string type
everywhere, a pointer + length, not null-terminated, so slicing never
copies:

```c
str8 a = STR8_LIT("hello world"); // compile-time-sized literal
str8 b = STR8(cstring);           // runtime strlen()

str8 first = Str8SubStr8(a, 0, 5);          // "hello"
bool eq = Str8Equals(first, STR8_LIT("hello"), 0);
Str8List parts = Str8Split(arena, a, STR8_LIT(" "), 0, 0);
str8 joined = Str8ListJoin(arena, &parts, &(Str8ListJoinParams){.sep = STR8_LIT(", ")});
str8 msg = Str8PushFmt(arena, "count: %llu", count);
```

`Str8List` is a linked list of `str8` slices — the standard way to build
up text piece by piece (`Str8ListPushLast`/`PushLastFmt`) before joining
or writing it out; it's what
[Metagen](/projects/base/metagen/)'s code generation and
[`os/core`](/projects/base/os/)'s file APIs both use. Also here: UTF-8/
UTF-16 codepoint decode/encode, and `U64FromStr8`/`I64FromStr8`/
`F64FromStr8` (and `Try*` variants) for parsing numbers out of text.

## Formatted output (`baseCore.h`)

`basePrintf`/`baseEPrintf` (stdout/stderr) are `stb_sprintf`-backed
`printf` replacements with inline ANSI color tags —
`basePrintf("{r}error{}: %S\n", msg)` — seen throughout Metagen's and the
tools' console output. `Str8PushFmt`/`Str8ListPushLastFmt` use the same
formatting engine to build `str8`s instead of printing.

## Generic intrusive containers (`baseCore.h`)

Rather than one generic container implementation, Base generates
type specific linked list/array code per type via macros expanded at the
call site:

- `BASE_CREATE_LL_DECLS_DEFS(Name, ElemType)` — a doubly-linked list where
  each node wraps a `val` of `ElemType` (`Name` + `NameNode` types,
  `NamePushLast`/`PushFirst`/`First`/`WhereList`/`FlattenToArray`
  functions).
- `BASE_CREATE_EFFICIENT_LL_DECLS(Name, NodeType)` — same shape, but for
  when the element type itself already has `next`/`prev` pointers (no
  extra node wrapper) — this is what most of Base's own list types use
  (`Str8ListNode`, `MetagenCStruct`, `JSONObjMemb`, etc., each declared
  with their own `next`/`prev` fields and wired up this way).
- `BASE_CREATE_ARRAY_VIEW_DECLS_DEFS(Name, ElemType)` — a `{data, len}`
  view struct for `ElemType` (`U8Array`, `MetagenStructMembArray`,
  `FontGlyphArray`, and similar, across most modules documented here, are
  all generated this way).

`BASE_LIST_FOREACH(NodeType, name, list)` iterates any of them. The
underlying `BaseDllNodeInsertEx`/`BaseDllRemoveEx` macros are the actual
doubly-linked-list splice logic everything above expands into.

`U8Array` (byte view) gets extra helpers beyond the generic array-view
macro: `U8ArrayReadLittleEndianU64`/`U32`/`U16` and big-endian
equivalents, used by the binary format parsers
([`font`](/projects/base/font/), [`bitmap`](/projects/base/bitmap/),
[`compression`](/projects/base/compression/)).

## Math (`baseMath.h`)

A full vector/matrix/quaternion library — `vec2f`/`vec2i`/`vec2f64`
(+ `i8`/`u8` variants), `vec3f`/`vec4f` and their integer variants,
`quatf`, `mat3f`, `mat4f`, and range/AABB types `rangef`/`rangei`/
`range2f`/`range2i`/`range3f`.

## Threading & per-thread context (`baseThreads.h`)

```c
typedef struct BaseThreadCtx
{
    Arena *scratchArenas[2];
    // + thread name, thread-local log
} BaseThreadCtx;
```

Each thread gets a `BaseThreadCtx` (`baseThreadsCreateCtx`/
`SetCtx`/`GetCtx`) holding two scratch arenas, a debugger visible thread
name (`baseThreadsSetName`/`GetName`), and a thread-local
[`Log`](#logging-baselogh). `baseTempBegin(Arena **conflictsToCheck, u64 count)`
hands back a scratch arena from that pair — passing in the arenas you're
*already* using so it can hand you the other one instead of aliasing your
own arena in a reentrant call.

## Logging (`baseLog.h`)

An in memory log (`Log`, chunked `LogEntryChunkList`, 
`logCreate`, then `logInfoFmt`/`logWarningFmt`/
`logErrorFmt`/`logDebugFmt` append entries, `logOutputToConsole`/
`logOutputToFile` flush them. The `logThread*` variants operate on the
current thread's log (from `BaseThreadCtx`) without passing a `Log*`
around explicitly.

## Hashing (`baseHash.h`)

Just `baseHashDJB2(u8 *bytes, u64 len)` — DJB2, used internally wherever a
cheap string hash is needed (the [Metagen](/projects/base/metagen/) type
dictionary, for instance).

## Paths (`basePath.h`)

`pathFromStr8` splits a `str8` into a `Path` — directory list, filename,
extension, for working with path components without re-parsing the
string repeatedly. Not used anywhere currently as its fairly new.

## URIs (`baseUri.h`)

`baseUriParseFromStr8`/`Copy` parse a URI into scheme, `userinfo`/`host`/
`port`/`path`, query, and fragment — used alongside
[`os/net`](/projects/base/os/)'s HTTP packet parsing.

## Terminal (`baseTerm.h`)

`termClear`/`termSetChar`/`termDrawLine` for drawing directly into a
terminal buffer, plus the raw ANSI escape codes (`BASE_TERMINAL_FG_*`,
`BASE_TERMINAL_BOLD_CODE`, ...) that are used by `basePrintf`'s `{r}`/`{g}`style
color tags.

## C lexer (`baseCLexer.h`)

A hand written C lexer, which tokenizes C style source code, its not a full parser
as that is overkill for what i need to use this for. The lexer is also whitespace aware
so that you can parse whitespace based text. 

[Metagen](/projects/base/metagen/) is built on this.

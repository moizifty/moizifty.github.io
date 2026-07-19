---
title: Metagen
order: 1
---

Metagen is a standalone command-line tool (`src/metagen`, builds to `mg.exe`)
that reads C source files and generates code from marker macros left in
them. It isn't a Clang-based tool — it tokenizes source with Base's own
hand-written C lexer (`baseCLexer`) and works on the token stream directly.

It has its own private copy of `base/` and `os/` under `src/metagen/base`
and `src/metagen/os` (see `src/metagen/readme.txt`) so it can always be
built, even if the marker macros it's about to process would otherwise
produce code that doesn't compile yet against the "real" `base`.

## Marker macros

These live in `base/baseMetagen.h` and expand to nothing in a normal build
— they only matter to metagen itself, which scans for their lexemes in the
token stream:

| Macro                             | Purpose                                             |
| ---------------------------------- | ---------------------------------------------------- |
| `metagen_introspect(...)`          | Generate a reflection table for the struct/enum below it |
| `metagen_introspectenum(...)`      | Same, for enums                                     |
| `metagen_introspectexclude(...)`   | Exclude a member from the generated reflection table |
| `metagen_introspectnote(...)`      | Attach a note string to a member (read by things like `cmdlineStruct`) |
| `metagen_genprintstructmemb(...)`  | Generate the custom-type switch cases for `StructToStr8` |
| `metagen_gentable(...)`            | Generate a lookup table                             |
| `metagen_embedfile(name, path, mode)` | Embed a file's bytes as a generated array         |
| `metagen_defer`                    | Mark a scope's defer statements for the defer pass  |
| `metagen_lambda(...)`              | Mark an inline lambda for the lambda pass           |

Metagen runs as two independent passes, chosen with CLI flags.

## Metadata pass (`--metadata`)

Walks every `metagen_introspect(...)`-tagged struct or enum, parses its
member declarations (name, type, size, offset, array/pointer-ness), and
writes a `<file>.gen.h` / `<file>.gen.c` pair next to the input containing
a `MetagenStructMemb` array and a `MetagenStruct` descriptor for it — the
reflection data consumed at runtime via the `Any` type and `StructToStr8`.

```c
metagen_introspect()
typedef struct DateTime
{
    u16 year;
    u8 month; // 1 - 12
    u8 dayOfWeek; // 1 - 7
    u8 day; // 1 - 31
    ...
} DateTime;
```

generates:

```c
extern MetagenStructMembArray gDateTimeMembDefsTable;
extern MetagenStruct gDateTimeStructInfo;
```

`only: "x", "y"` restricts the table to specific members — used on
`vec2f`/`vec2i`/`vec3f` in `baseMath.h`, since those structs union a named
`x`/`y`/`z` view over a `v[]` array and reflecting both would just
duplicate the same bytes:

```c
metagen_introspect(only: "x", "y")
typedef struct vec2f
{
    union { struct { f32 x, y; }; f32 v[2]; };
} vec2f;
```

`metagen_genprintstructmemb()` (used once, in `base/baseMetagen.c`) collects
every introspected type across all processed files and generates the
`METAGEN_PRINT_MEMB_CUSTOM` switch cases in `baseMetagenCommon.gen.h`, so
`StructToStr8` knows how to recursively print a struct-typed member, not
just primitives. `metagen_embedfile(name, path, mode)` embeds a file's raw
bytes as a generated `u8[]` array under `name`.

## Defer pass (`--defers`)

Walks `defer(...)` calls and rewrites the *source itself* into a parallel
`metagen_defer_temp/` folder, which you compile from instead of the
original source:

```
src
|--- main.c
|--- another.c <-- this has a defer statement
|--- another.h
```

becomes:

```
metagen_defer_temp
|--- src
     |--- main.c
     |--- another.c
     |--- another.h
```

`defer(...)` emits its code at `return`, `break`, `goto`, and `continue`
statements, as well as at the end of the enclosing block if it wasn't
already emitted earlier in that block. It's been reliable in practice.

## Lambdas

The same `--defers` pass also expands `metagen_lambda(...)`:

```c
metagen_lambda((int a, int b){
    printf("%lld", a + b);
});

metagen_lambda(void (int a, int b){
    printf("%lld", a + b);
});

metagen_lambda(int (int a, int b){
    return printf("%lld", a + b);
});
```

Each gets replaced with a call to a generated `__metagen_lambda_##someid`
function.

## CLI

```
mg --metadata --defers <path>
```

| Flag               | Effect                                              |
| ------------------ | ---------------------------------------------------- |
| `--metadata`        | Run the metadata pass over `<path>`                 |
| `--defers`           | Run the defer/lambda pass over `<path>`              |
| `--clean-metadata`  | Delete previously generated `*.gen.*` files under `<path>` |
| `--clean-defer`     | Delete the `metagen_defer_temp` folder               |

`<path>` is a single positional argument — a file or folder to process.

---
title: Metagen
order: 2
---

Metagen is a standalone command line tool (`src/metagen`, builds to `src/metagen/builds/mg.exe`)
that lex's C source files and generates code from marker macros left in
them. It doesnt use clang but instead tokenizes source with Base's own
hand-written C lexer (`base/baseCLexer.c`) and works on the token stream directly. 

It has its own private copy of `base/` and `os/` under `src/metagen/base`
and `src/metagen/os` (see `src/metagen/readme.txt`) so it can always be
built in the case that it generates incorrect or broken code.

## Marker macros

These live in `base/baseMetagen.h` and expand to nothing in a normal build
— they only matter to metagen itself, which scans for their lexemes in the
token stream:

| Macro                             | Purpose                                             |
| ---------------------------------- | ---------------------------------------------------- |
| `metagen_introspect(...)`          | Generate a reflection table for the struct/enum below it |
| `metagen_introspectexclude(...)`   | Exclude a member from the generated reflection table |
| `metagen_introspectnote(...)`      | Attach a note string to a member (read by things like `cmdlineStruct`) |
| `metagen_embedfile(name, path, mode)` | Embed a file's bytes as a generated array         |
| `metagen_defer`                    | Mark a scope's defer statements for the defer pass  |
| `metagen_lambda(...)`              | Mark an inline lambda for the lambda pass           |

Metagen runs as two togglable passes, chosen with CLI flags.

## Metadata pass (`--metadata`)

Walks every `metagen_introspect(...)` tagged struct or enum, parses its
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

`only: "x", "y"` restricts the table to specific members — this is useful for only 
restricting the generated info to certain fields on unions.

```c
metagen_introspect(only: "x", "y")
typedef struct vec2f
{
    union { struct { f32 x, y; }; f32 v[2]; };
} vec2f;
```

`metagen_embedfile(name, path, mode)` embeds a file's raw
bytes as a generated `u8[]` array under `name`.

```c
metagen_embedfile(gFontData, "../font.ttf", binary)

// this generates:
U8Array gFontData = {...};
```

## Defer pass (`--defers`)

Walks `metagen_defer(...)` calls and rewrites the *source itself* into a parallel
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

`metagen_defer(...)` emits its code at `return`, `break`, `goto`, and `continue`
statements, as well as at the end of the enclosing block if it wasn't
already emitted earlier in that block. It's been reliable in practice.

Due to how they function, sadly, `metagen_defer` and `metagen_lambda` cant be used in `base` itself, since that means you will have to metagen code for base and it becomes a bit cumbersome to juggle between `metagen_defer_temp/base` and regular `base`.

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

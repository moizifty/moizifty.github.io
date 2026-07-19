---
title: Command-line parsing
order: 4
---

Base has its own mechanism for parsing command-line arguments, in `src/baseCmdLine.h`, inspired by Go's `flag` package. You register every arg up front, then call `cmdlineParse` once on the full arg list.

## Registering args

Four types: `i64`, `bool`, `str8`, and `str8list`. Each one has a version that allocates and hands you back a pointer, and a `Var` version where you pass in your own pointer to fill instead:

```c
i64 *count = cmdlineI64(STR8_LIT("count"), 1, STR8_LIT("how many times to run"), CMDLINE_ARG_PRESENCE_OPTIONAL);
bool *verbose = cmdlineBool(STR8_LIT("verbose"), false, STR8_LIT("verbose output"), CMDLINE_ARG_PRESENCE_OPTIONAL);
str8 *outPath = cmdlineStr8(STR8_LIT("out"), STR8_LIT("./out"), STR8_LIT("output path"), CMDLINE_ARG_PRESENCE_REQUIRED);

// or bind directly into an existing variable instead of getting a pointer back
i64 myCount;
cmdlineI64Var(&myCount, STR8_LIT("count"), 1, STR8_LIT("how many times to run"), CMDLINE_ARG_PRESENCE_OPTIONAL);
```

A `str8list` arg collects one value per occurrence, so `--include a --include b` ends up as `{"a", "b"}` once parsed.

Anything on the command line that isn't a registered flag falls through to a trailing list instead of erroring, as long as you've called `cmdlineTrailing` to opt into that (this is what Metagen uses for its input path):

```c
Str8List *inputArgs = cmdlineTrailing(STR8_LIT("input"));
```

If you register zero flags and never call `cmdlineTrailing`, passing any argument at all is treated as an error, `cmdlineParse` assumes you wanted a no-args program.

## Parsing

```c
if (!cmdlineParse(*args))
{
    cmdlineUsage();
    return;
}
```

`cmdlineParse` takes the raw arg list, matches each `-name`/`--name` against what you registered (both prefixes work identically, and it strips them either way), fills in values, and flags required args that never showed up. It returns `false` on any problem, missing required arg, wrong type after a flag, unrecognised flag, and you're expected to call `cmdlineUsage()` yourself when that happens, it's not automatic. `cmdlineUsage()` prints each registered arg's name, whether it's optional or mandatory, its default, and its help text, generated entirely from what you registered.

## Struct mode

This is the part that leans on Metagen. Tag struct members with `metagen_introspectnote` using an `@cmdline name, default, help text` note, and `cmdlineStruct` reads Metagen's generated reflection table to register and bind every tagged member in one call:

```c
metagen_introspect()
typedef struct BuildArgs
{
    metagen_introspectnote("@cmdline verbose, false, print extra build output")
    bool verbose;

    metagen_introspectnote("@cmdline jobs, 4, number of parallel build jobs")
    i64 jobs;
} BuildArgs;

// after metagen's metadata pass has generated gBuildArgsMembDefsTable for this struct:
BuildArgs args = {0};
cmdlineStruct(BuildArgs, args);
cmdlineParse(*programArgs);
```
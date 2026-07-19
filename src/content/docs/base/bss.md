---
title: BSS
order: 3
---

BSS (`src/bss`) is an interpreted language for writing small scripts, build scripts in particular. Its semantics lean Python, but I use C-like syntax on purpose, I hate both batch and bash which motivated me to write this.

## Types

There's really only 5 types: `int` (signed 64-bit), `bool` (`true`/`false`), `string` (`"..."`, uses `~` as the escape character instead of a backslash), `array`, and `object`. Arrays and objects both use the same `{...}` syntax, the only difference is whether the entries are named:

```
{1, 2, 3}                             // array
{a = 90, b = {1, 2, 3}, c = {ca = 9}} // object, nesting works fine
```

You can't mix named and unnamed entries in the same `{}`, it's one or the other.

## Variables

There's no `let`/`var` keyword. Assigning to a name declares it if it doesn't already exist in the current scope:

```
x = 5;
name = "moiz";
x = "moiz"; // <- redeclared
```

Every statement needs a trailing `;`, and `//` starts a line comment.

## Control flow

`if`/`else if`/`else`, `while`, and `for x in container` all skip the parens around the condition, same as Go:

```
if x > 5 {
    print("big");
} else if x == 5 {
    print("exactly 5");
} else {
    print("small");
}

while x > 0 {
    x = x - 1;
}

for item in someArray {
    print(item);
}
```

`for` only works over arrays right now, looping over an object isn't a thing yet.

## Functions

Functions only get declared at the top level of a file, there's no nested or anonymous functions:

```
fn add(a, b) {
    return a + b;
}
```

Calling one also has to be a plain identifier, `add(1, 2)` works but you can't call the result of an expression, functions aren't values you can pass around and call dynamically yet even though they're technically stored as a value kind internally.

## Operators

`==`/`!=` bind loosest, then `<`/`>`/`&&`/`||` all sharing one precedence level (comparisons and logical ops aren't actually split apart yet), then `+`/`-`, then `*`/`/`, then function calls/subscript/`.` access binding tightest. There's no `<=`, `>=`, or `%`, and no compound assignment like `+=`, just plain `=`.

`+` does different things depending on the operands: two ints add normally, but `+` with an array on either side appends the other value onto that array in place rather than concatenating two arrays, and `+` with a string on either side stringifies the other operand and concatenates.

## Builtins

| Call | Does |
| --- | --- |
| `print(x)` | prints `x` to stdout, coerced to a string |
| `run(cmd)` | runs `cmd` through `cmd.exe` (Windows only right now) and returns `{out, err}` |
| `len(x)` | length of a string or array |
| `tostring(x)` | stringifies any value |
| `join(arr, sep)` | joins an array into a string with `sep` between entries |
| `qoute(x)` | wraps a string (or every string in an array) in double quotes, yes it's meant to say "quote", I noticed way too late and now every script that calls it depends on the typo |
| `getenv(name)` | reads an environment variable |
| `hasflag(name)` | true if `name` was passed as a command-line flag to the script |
| `pathexists(path)` | true if `path` exists on disk |

## Running a script

```
bss.exe script.bss --someflag
```

Everything after the script path gets collected as flags, which is what `hasflag` checks against. This is also exactly how `build.bss` gets invoked from `build.bat`, `bss.exe build.bss %*`, passing whatever args the build script was called with straight through.

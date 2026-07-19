---
title: Metagen
order: 1
---

Base's metagenerator lives under `src/metagen` and can be used to:

- get reflection data for types at runtime
- embed files into headers
- generate `defer` statements for C (its coolest feature)

## Defer statements

Metagen works by tokenizing all source code passed to it. If it sees a
`defer(...)` call, it writes generated code out to a temp folder, which you
then compile from instead of the original source. Since builds are usually
unity builds (a single file including everything else), this fits naturally.

Given a layout like:

```
src
|--- main.c
|--- another.c <-- this has a defer statement
|--- another.h
```

running metagen with the `defers` arg generates:

```
metagen_defers_temp
|--- src
     |--- main.c
     |--- another.c
     |--- another.h
```

You then compile `main.c` from `metagen_defers_temp` instead of the
original `src`.

`defers` emits defer code at `return`, `break`, `goto`, and `continue`
statements, as well as at the end of blocks if it wasn't already emitted
earlier in that block. It's been reliable in practice.

## Lambdas

Metagen also supports generating lambdas:

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

Each of these gets replaced with a call to a generated
`__metagen_lambda_##someid` function.

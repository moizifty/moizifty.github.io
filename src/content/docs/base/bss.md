---
title: BSS
order: 2
---

BSS (`src/bss`) is an interpreted language for writing small scripts —
build scripts in particular. Its semantics are similar to Python, but it
uses C-like syntax on purpose.

## Types

BSS only has 5 types:

- **int** — signed 64-bit integer
- **bool** — `true` or `false`
- **string** — UTF-8 string
- **array** — `{n1, n2, n3}`
- **object** — essentially a scope you can access into

Objects must name their inner variables — unlike arrays, they can't be
unnamed:

```
{a = 90, b = {1, 2, 3}, c = {ca = 9, cb = 121}}
```

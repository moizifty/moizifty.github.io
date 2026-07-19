---
title: Command-line parsing
order: 3
---

Base provides a mechanism for parsing command-line arguments in
`src/baseCmdline.h`, inspired by Go's `flag` package. Arguments are defined
inline as function calls, each returning a pointer to the argument; once
the args are parsed, that pointer's value is updated in place.

## Struct introspection

Base combines this with its type-introspection ability via
`cmdlineStruct`. Each member of a struct can carry a
`metagen_introspectnote`, which Metagen adds to the generated introspection
data. `cmdlineStruct` reads that note to automatically create the
corresponding arguments and bind them to the struct's members.

In practice: define one large struct holding every command-line argument,
pass it to `cmdlineStruct`, then call `cmdlineParse`.

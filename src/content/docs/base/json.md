---
title: JSON
order: 10
---

A small JSON parser (`src/json`) that parses into a single `JSONValue`
tree via `JSONValueFromStr8`:

```c
typedef enum JSONValueKind
{
    JSON_VALUE_INVALID,
    JSON_VALUE_BOOL,
    JSON_VALUE_NULL,
    JSON_VALUE_OBJ,
    JSON_VALUE_ARRAY,
    JSON_VALUE_NUMBER,
    JSON_VALUE_STRING,
} JSONValueKind;
```

Every value also keeps `strRep` — the original source-text slice it was
parsed from.

## Path lookups

Rather than walking the tree by hand, look values up with a dotted path
string:

```c
JSONValue root = JSONValueFromStr8(arena, jsonText);

f64 count = jsonFindNumber(&root, STR8_LIT("obj.child.count"), 0);
str8 name = jsonFindStr8(&root, STR8_LIT("obj.child.array.0.name"), STR8_LIT(""));
bool ok = jsonFindBool(&root, STR8_LIT("obj.flag"), false);
```

Array indices are just numeric path segments — `obj.child.array.9`, or
nested further like `obj.child.array.12.name.len.1`. Each `jsonFind*`
variant takes a default value returned if the path doesn't resolve or
doesn't match the expected kind. `jsonFind` itself returns the raw
`JSONValue*` (or `null`) if you need the kind or a sub-tree rather than a
coerced scalar; `jsonArrayIndex` indexes an array value directly.

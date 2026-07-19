---
title: JSON
order: 11
---

A small JSON parser (`src/json`) that parses into a single `JSONValue` tree via `JSONValueFromStr8`:

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

Every value also keeps `strRep` around, the original source-text slice it was parsed from.

## Path lookups

Rather than walking the tree by hand I look values up with a dotted path string instead:

```json

{
    "obj": 
    {
        "child":
        {
            "array":
            [
                {
                    "name": "Test1"
                },

                {
                    "name": "Test2"
                },

                {
                    "name": "Test3"
                },
            ],

            "count": 3
        },

        "flag": true
    }
}

```

```c
JSONValue root = JSONValueFromStr8(arena, jsonText);

// = 3
f64 count = jsonFindNumber(&root, STR8_LIT("obj.child.count"), 0);

// = Test1
str8 name = jsonFindStr8(&root, STR8_LIT("obj.child.array.0.name"), STR8_LIT(""));

// = Test1, Test2, Test3
JSONValuePtrList names = jsonFindAll(&root, STR8_LIT("obj.child.array.name"));

// false
bool ok = jsonFindBool(&root, STR8_LIT("obj.flag"), false);
```

Array indices are just numeric path segments, `obj.child.array.9`, and you can nest as deep as you want, `obj.child.array.12.name.len.1`. Every `jsonFind*` variant takes a default value to fall back on if the path doesn't resolve or doesn't match the kind you asked for. `jsonFind` on its own returns the raw `JSONValue*` (or `null`) if you want the kind or a sub-tree instead of a coerced scalar, and `jsonArrayIndex` indexes an array value directly.

Nothing in the codebase actually parses JSON yet, this was written ahead of needing it, mainly for parsing gltf 3d model files.

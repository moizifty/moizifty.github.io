---
title: Font
order: 8
---

`src/font` is a from-scratch TrueType parser and glyph rasterizer — no
FreeType or `stb_truetype`.

## Parsing (`fontTTF.*`)

Parses the TTF table set directly off the raw file bytes: `cmap` (formats
4 and 12, for codepoint → glyph index), `head`, `hhea`, `hmtx`, `loca`, and
`glyf` — including composite glyphs
(`fontTTFParseCompositeGlyphNumContoursAndPoints`).

```c
Font font = fontTTFParseFromFile(arena, STR8_LIT("fonts/Verdana.ttf"));
if (font.error != FONT_ERROR_NONE) { /* missing/unsupported table */ }
```

`fontTTFParseFromFile`/`FromU8Array` run the whole table set and hand back
a `Font` with its parsed tables and computed `FontMetrics` (units-per-em,
bounds, ascent/descent/line gap).

## Rasterizing (`fontCore.*`)

A glyph's outline becomes a `FontGlyphShape` — points, contours, and
per-edge winding. `fontRasteriseGlyphShapeToBitmap` scan-converts that
onto a `Bitmap` at a given pixel size, with a choice of
`FontRasteriseAntiAliasingKind`:

- `FONT_RASTERISE_ANTI_ALIASING_NONE`
- `FONT_RASTERISE_ANTI_ALIASING_NAIVE`
- `FONT_RASTERISE_ANTI_ALIASING_COVERAGE_ACCUMULATION`

`fontRasteriseCodepointToBitmap` does codepoint → glyph lookup and
rasterization in one call; `fontGetGlyphIndexFromCodepoint`/
`fontGetGlyphFromCodepoint` expose the lookup on its own.

## Atlases (`fontAtlas.*`)

```c
RangeI64Array ranges = /* codepoint ranges to bake */;
FontAtlas atlas = fontAtlasFromCodepointRanges(arena, font, ranges, pixelSize, false);

FontAtlasGlyph glyph;
if (fontAtlasTryGetGlyphFromCodepoint(atlas, 'A', &glyph)) {
    // glyph.pos / glyph.size locate it in atlas.bitmap
}
```

`fontAtlasFromCodepointRanges` rasterizes every codepoint in the given
ranges into one atlas `Bitmap`, plus a `FontAtlasGlyph` table (position,
size, bearings, advance width). ASCII is packed first in the glyph array
for O(1) access by ASCII code; anything else goes through
`fontAtlasTryGetGlyphFromCodepoint`.

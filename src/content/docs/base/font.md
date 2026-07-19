---
title: Font
order: 9
---

`src/font` is a from-scratch TrueType parser and glyph rasterizer, no FreeType, no `stb_truetype`.

## Parsing (`fontTTF.*`)

Parses the TTF table set directly off the raw file bytes: `cmap` (formats 4 and 12, for codepoint to glyph index), `head`, `hhea`, `hmtx`, `loca`, and `glyf`, including composite glyphs (`fontTTFParseCompositeGlyphNumContoursAndPoints`).

```c
Font font = fontTTFParseFromFile(arena, STR8_LIT("fonts/Verdana.ttf"));
if (font.error != FONT_ERROR_NONE) { /* missing/unsupported table */ }
```

`fontTTFParseFromFile`/`FromU8Array` run the whole table set and hand back a `Font`, with its parsed tables and a computed `FontMetrics` (units-per-em, bounds, ascent/descent/line gap).

## Rasterizing (`fontCore.*`)

A glyph's outline becomes a `FontGlyphShape`, points, contours, and per-edge winding. `fontRasteriseGlyphShapeToBitmap` scan-converts that onto a `Bitmap` at a given pixel size, and you get to pick the `FontRasteriseAntiAliasingKind`: none, naive, or coverage accumulation. `fontRasteriseCodepointToBitmap` does the codepoint to glyph lookup and rasterization in one call if you don't need the intermediate shape, and `fontGetGlyphIndexFromCodepoint`/`fontGetGlyphFromCodepoint` expose that lookup on its own.

## Atlases (`fontAtlas.*`)

```c
RangeI64Array ranges = /* codepoint ranges to bake */;
FontAtlas atlas = fontAtlasFromCodepointRanges(arena, font, ranges, pixelSize, false);

FontAtlasGlyph glyph;
if (fontAtlasTryGetGlyphFromCodepoint(atlas, 'A', &glyph)) {
    // glyph.pos / glyph.size locate it in atlas.bitmap
}
```

`fontAtlasFromCodepointRanges` rasterizes every codepoint in the given ranges into one atlas `Bitmap`, plus a `FontAtlasGlyph` table with position, size, bearings and advance width for each one. ASCII gets packed first in the glyph array so lookups by ASCII code are fast, anything outside that range goes through `fontAtlasTryGetGlyphFromCodepoint` instead.

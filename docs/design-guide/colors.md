---
title: Colors
sidebar_position: 13
---

# Colors

Shapes can carry a color. Like every other operation, `colorize()` returns a **new**
shape — one with a color attribute — and leaves the original untouched.

```js jscad
import { colorize, cylinder, hslToRgb, translate } from '@jscad/modeling'

export const main = () => Array.from({ length: 8 }, (_, i) => colorize(
  hslToRgb([i / 8, 0.72, 0.55]),
  translate([i * 7 - 24.5, 0, 0], cylinder({ radius: 3, height: 10, segments: 32 }))
))
```

Color is not only about how a model looks on screen. It also drives filament
selection when printing, so **apply color as the last step in a design** — boolean
operations on already-colored shapes can give the result a color you did not intend.

## colorize

`colorize()` takes RGB components between 0 and 1 — not 0 to 255 — and an optional
fourth value for alpha.

```js jscad
import { colorize, sphere, translate } from '@jscad/modeling'

export const main = () => [
  translate([-12, 0, 0], colorize([1, 0, 0], sphere({ radius: 5 }))),
  colorize([1, 0.5, 0.3], sphere({ radius: 5 })),
  translate([12, 0, 0], colorize([1, 0.5, 0.3, 0.6], sphere({ radius: 5 })))
]
```

It accepts several shapes at once, so a whole assembly can be colored in one call:

```js
const redParts = colorize([1, 0, 0], chassis, bracket, cover)
```

:::warning[Transparency is order-dependent]

Transparent shapes are drawn after opaque ones, but among themselves the drawing
order decides what shows through what. A shape may not look transparent depending on
what sits behind it. If a result looks wrong, try a different alpha value, or reorder
the shapes returned from `main`.

:::

## Named colors

`colorNameToRgb()` looks up any of the 147
[CSS extended color keywords](https://www.w3.org/TR/css3-color/#svg-color). Names are
case-insensitive, so `'RED'` and `'red'` are the same.

```js jscad
import { colorNameToRgb, colorize, cuboid, translate } from '@jscad/modeling'

const swatches = ['tomato', 'goldenrod', 'mediumseagreen', 'steelblue', 'blueviolet']

export const main = () => swatches.map((name, i) => colorize(
  colorNameToRgb(name),
  translate([i * 9 - 18, 0, 0], cuboid({ size: [8, 8, 8] }))
))
```

The full table is also available directly as `cssColors`, keyed by name:

```js
import { colorize, cssColors, sphere } from '@jscad/modeling'

const mysphere = colorize(cssColors.fuchsia, sphere())
```

## Converting between color spaces

Colors rarely start life as JSCAD's 0-to-1 RGB triples. These functions convert from
the notations you are more likely to have — a hex string from a
[color parameter](./parameters.md#parameter-types), or an HSL value you are stepping
through to build a palette.

| Function | Takes | Returns |
| --- | --- | --- |
| `colorNameToRgb(name)` | CSS color keyword | `[r, g, b]` |
| `hexToRgb(hex)` | `'#rrggbb'` or `'#rrggbbaa'` | `[r, g, b]` or `[r, g, b, a]` |
| `rgbToHex(rgb)` | `[r, g, b]` | `'#rrggbb'` |
| `hslToRgb(hsl)` | `[h, s, l]` | `[r, g, b]` |
| `rgbToHsl(rgb)` | `[r, g, b]` | `[h, s, l]` |
| `hsvToRgb(hsv)` | `[h, s, v]` | `[r, g, b]` |
| `rgbToHsv(rgb)` | `[r, g, b]` | `[h, s, v]` |

Every component, hue included, runs from 0 to 1.

- **r, g, b** — red, green, blue of the
  [RGB color model](https://en.wikipedia.org/wiki/RGB_color_model)
- **h, s, l** — hue, saturation, lightness of the
  [HSL color model](https://en.wikipedia.org/wiki/HSL_and_HSV)
- **h, s, v** — hue, saturation, value of the
  [HSV color model](https://en.wikipedia.org/wiki/HSL_and_HSV)

```js jscad
import { colorize, cuboid, hexToRgb, hslToRgb, hsvToRgb, translate } from '@jscad/modeling'

export const main = () => [
  translate([-12, 0, 0], colorize(hexToRgb('#000080'), cuboid({ size: [8, 8, 8] }))),
  colorize(hslToRgb([0.9166, 1, 0.5]), cuboid({ size: [8, 8, 8] })),
  translate([12, 0, 0], colorize(hsvToRgb([0.9166, 1, 1]), cuboid({ size: [8, 8, 8] })))
]
```

HSL is the convenient space for generating a palette in code, because stepping the
hue while holding saturation and lightness gives evenly-weighted colors — which is
what the example at the top of this page does.

## Coloring individual faces

Most shapes carry one color for the whole geometry. A
[polyhedron](./3d-primitives.md#polyhedron) is the exception: its `colors` option
takes one RGBA value per face, in the same order as `faces`.

```js jscad
import { polyhedron } from '@jscad/modeling'

export const main = () => polyhedron({
  points: [[10, 10, 0], [10, -10, 0], [-10, -10, 0], [-10, 10, 0], [0, 0, 14]],
  faces: [[0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4], [1, 0, 3], [2, 1, 3]],
  colors: [
    [1, 0.3, 0.3, 1], [0.3, 1, 0.4, 1], [0.3, 0.5, 1, 1],
    [1, 0.85, 0.2, 1], [0.6, 0.6, 0.6, 1], [0.6, 0.6, 0.6, 1]
  ]
})
```

:::info[Changed in v3]

`offset()` and the extrusions now preserve the color of the shape they are given, so
a colored profile stays colored through to the solid. In v2 the color was dropped and
had to be reapplied afterwards.

:::

## Colors from parameters

A `color` [design parameter](./parameters.md) arrives as a CSS hex string, which
`hexToRgb()` turns into something `colorize()` accepts:

```js jscad
import { colorize, hexToRgb, roundedCuboid } from '@jscad/modeling'

export const getParameterDefinitions = () => [
  { name: 'shell', type: 'color', initial: '#FFB431', caption: 'Shell color' }
]

export const main = (params) => colorize(
  hexToRgb(params.shell),
  roundedCuboid({ size: [24, 16, 8], roundRadius: 2, segments: 32 })
)
```

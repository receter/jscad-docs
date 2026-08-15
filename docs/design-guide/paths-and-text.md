---
title: Paths and Text
sidebar_position: 7
---

# Paths and Text

A **path** is a series of points connected by infinitely thin line segments. Paths
have no area and no volume — they are lines, not shapes — but they are the raw
material for a lot of useful geometry: give a path thickness and it becomes a 2D
shape, close it and it can be extruded into a solid.

**Text** is built from paths. Each character is a set of single-line strokes, so
everything on this page about paths applies to text too.

```js jscad
import { arc, line, path2, TAU } from '@jscad/modeling'

export const main = () => [
  line([[-30, -10], [-30, 10], [-14, 10]]),
  arc({ center: [0, 0], radius: 10, startAngle: 0, endAngle: TAU * 0.75, segments: 48 }),
  path2.close(path2.fromPoints({}, [[20, -10], [34, -10], [27, 10]]))
]
```

## Creating a path

`line()` builds a path from an array of 2D points:

```js jscad
import { line } from '@jscad/modeling'

export const main = () => line([[10, 10], [-10, 10], [-10, -10], [10, -10]])
```

`path2.fromPoints()` does the same but takes options, of which `closed` is the useful
one — a closed path has a final segment joining its last point back to its first:

```js jscad
import { path2 } from '@jscad/modeling'

export const main = () => path2.fromPoints(
  { closed: true },
  [[10, 10], [-10, 10], [-10, -10], [10, -10]]
)
```

An open path is what you extend; a closed path is final. Paths can also be joined and
closed after the fact:

```js jscad
import { line, path2 } from '@jscad/modeling'

export const main = () => {
  const top = line([[10, 10], [-10, 10]])
  const bottom = line([[-10, -10], [10, -10]])

  return path2.close(path2.concat(top, bottom))
}
```

:::info[Changed in v3]

`path2.fromPoints()` takes `closed`, not `close`. A misspelt option is silently
ignored, leaving the path open — worth checking first if an extrusion comes out
hollow.

:::

## Curved paths

Curves are approximated with line segments. The `arc` primitive draws one about a
`center` at a given `radius`, optionally between a start and end angle.

| Option | Default |
| --- | --- |
| `center` | `[0, 0]` |
| `radius` | `1` |
| `startAngle` | `0` |
| `endAngle` | `TAU` |
| `segments` | `32` |
| `makeTangent` | `false` |

```js jscad
import { arc, TAU } from '@jscad/modeling'

export const main = () => [
  arc({ center: [-14, 0], radius: 10, startAngle: TAU / 4, segments: 48 }),
  arc({ center: [14, 0], radius: 10, startAngle: TAU / 2, endAngle: TAU, segments: 6 })
]
```

`makeTangent` adds short line segments at both ends so the gradient at the edges is
tangent to the arc — useful when the arc is one piece of a longer path.

## Extending a path

Every append function returns a **new** path, leaving the original alone.

`path2.appendPoints()` adds straight segments:

```js jscad
import { line, path2 } from '@jscad/modeling'

export const main = () => path2.appendPoints(
  [[-27, 22], [-27, -27], [27, -22]],
  line([[27, -22], [27, 22]])
)
```

`path2.appendArc()` adds a curve, following the
[SVG elliptical arc specification](http://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands).
`endpoint` is required; `radius` takes separate X and Y values, so arcs can be
elliptical.

| Option | Default |
| --- | --- |
| `endpoint` | *required* |
| `radius` | `[0, 0]` |
| `xaxisRotation` | `0` |
| `clockwise` | `false` |
| `large` | `false` |
| `segments` | `16` |

```js jscad
import { path2 } from '@jscad/modeling'

export const main = () => {
  let shape = path2.fromPoints({}, [[27.5, -22.96875]])
  shape = path2.appendPoints([[27.5, -3.28125]], shape)
  shape = path2.appendArc({ endpoint: [12.5, -22.96875], radius: [15, -19.6875] }, shape)

  return shape
}
```

`path2.appendBezier()` adds a Bézier curve. It starts at the path's last point and
ends at the last control point, with the points in between shaping the transition.

Passing `null` as the first control point mirrors the path's previous point into the
curve, which makes the join between two curves smooth instead of kinked:

```js jscad
import { path2 } from '@jscad/modeling'

export const main = () => {
  let shape = path2.fromPoints({}, [[10, -20]])
  shape = path2.appendBezier({ controlPoints: [[10, -10], [25, -10], [25, -20]] }, shape)
  // null first control point: continue smoothly out of the previous curve
  shape = path2.appendBezier({ controlPoints: [null, [25, -30], [40, -30], [40, -20]] }, shape)

  return shape
}
```

## Turning a path into a 2D shape

A **closed** path encloses an area, so its points can become a 2D shape directly:

```js jscad
import { geom2, line, path2 } from '@jscad/modeling'

export const main = () => {
  const triangle = line([[10, 10], [-10, 10], [-10, -10], [10, 10]])

  return geom2.fromPoints(path2.toPoints(triangle))
}
```

An **open** path has no interior, so instead give it thickness with
[`offset()`](./offsets.md) — the result is a 2D shape wrapped around the line:

```js jscad
import { line, offset } from '@jscad/modeling'

export const main = () => {
  const path = line([[10, 10], [-10, 10], [-10, -10]])

  return offset({ delta: 2, corners: 'chamfer' }, path)
}
```

:::info[Changed in v3]

This was `expand()` in v2. `expand()` and `offset()` are now one function — see
[Offsets](./offsets.md).

:::

## Turning a path into a 3D shape

A closed path can go straight into `extrudeLinear()`:

```js jscad
import { extrudeLinear, path2 } from '@jscad/modeling'

export const main = () => {
  const profile = path2.fromPoints({ closed: true }, [[0, 0], [12, 0], [6, 10]])

  return extrudeLinear({ height: 15 }, profile)
}
```

For an open path, offset it into a 2D shape first, then extrude — that is how walls
and ribs following a line are made.

## Text

`vectorChar()` converts one ASCII character into an object describing it. `height` is
the height of an uppercase character.

| Option | Default |
| --- | --- |
| `xOffset` | `0` |
| `yOffset` | `0` |
| `height` | `14` |
| `extrudeOffset` | `0` |
| `font` | `'hershey simplex'` (built in) |

It returns `{ width, height, paths }`, where `paths` is a list of ready-to-use
path2 objects:

```js jscad
import { vectorChar } from '@jscad/modeling'

export const main = () => vectorChar({ height: 30 }, 'H').paths
```

:::warning[Changed in v3]

Two things moved:

- **Options are no longer optional.** `vectorChar('H')` threw in v3; it must be
  `vectorChar({}, 'H')`.
- **You get paths, not raw segments.** v2 returned `{ segments }` of bare point
  arrays, which every design had to convert by hand:

  ```js
  // v2 — no longer needed
  const paths = outlines.segments.map((segment) => path2.fromPoints({close: false}, segment))
  ```

  v3 returns `paths` already built. Delete the conversion step.

Note also that the default `height` is now `14`, not `21`.

:::

### Text strings

`vectorText()` does the same for a whole string. Split lines with `\n`.

| Option | Default |
| --- | --- |
| `xOffset` | `0` |
| `yOffset` | `0` |
| `height` | `14` |
| `lineSpacing` | `30/14` |
| `letterSpacing` | `0` |
| `align` | `'left'` |
| `extrudeOffset` | `0` |
| `font` | `'hershey simplex'` (built in) |

It returns one entry per **line** of text, each holding the characters on that line.
So reaching the paths means flattening twice:

```js jscad
import { vectorText } from '@jscad/modeling'

const textPaths = (options, text) => vectorText(options, text)
  .flatMap((line) => line.chars)
  .flatMap((char) => char.paths)

export const main = () => textPaths({ height: 20, align: 'center' }, 'JSCAD\nRocks!')
```

:::warning[Changed in v3]

`vectorText()` now returns a **nested** structure — an array of lines, each
`{ width, height, chars }`, each character `{ width, height, paths }`. v2 returned one
flat array of segments. The two-step `flatMap` above is the replacement for v2's
`outlines.map(...)`.

The `input` option is also gone: `vectorText({ input: 'JSCAD' })` throws. Pass the
text as the second argument.

Keeping the line and character structure is what makes per-line and per-character
work — measuring, colouring, spacing — possible without re-parsing.

:::

### Text as a solid

Character strokes are open paths, so give them width with `offset()` and extrude:

```js jscad
import { extrudeLinear, offset, union, vectorText } from '@jscad/modeling'

const textPaths = (options, text) => vectorText(options, text)
  .flatMap((line) => line.chars)
  .flatMap((char) => char.paths)

export const main = () => union(
  textPaths({ height: 20 }, 'JSCAD').map((path) => extrudeLinear(
    { height: 4 },
    offset({ delta: 0.9, corners: 'round', segments: 8 }, path)
  ))
)
```

`extrudeOffset` exists for exactly this case: it shrinks the glyphs by the width you
are about to add, so the letters keep their intended size after offsetting.

### Other fonts

The built-in font is
[Hershey simplex](http://paulbourke.net/dataformats/hershey/), supplied by the
[JSCAD vector font project](https://github.com/lautr3k/jscad-vector-fonts). That
project ships several compiled fonts and a utility for converting more.

To use one, put the compiled font in your [project](./projects.md), import it, and
pass it as `font`:

```js
import { vectorText } from '@jscad/modeling'
import { cncVector } from './fonts/cncVector.js'

const textPaths = (options, text) => vectorText(options, text)
  .flatMap((line) => line.chars)
  .flatMap((char) => char.paths)

export const main = () => textPaths(
  { height: 42, align: 'right', font: cncVector },
  'JSCAD\nROCKS!!'
)
```

*Note: these are single-line stroke fonts, not TrueType. Rendering TrueType glyphs
needs a separate library to turn them into outlines first.*

*Only ASCII characters are supported. Unsupported characters are replaced with a
question mark.*

---
title: Math Guide
sidebar_position: 3
---

# Math Guide

Two things trip people up more than anything else in JSCAD: which way the axes point,
and the fact that every angle is in radians. This page covers both, along with the
helpers for converting between units and choosing a resolution.

## Orientation

All internal calculations in JSCAD — and in the libraries it builds on — follow the
[right-hand rule](https://en.wikipedia.org/wiki/Right-hand_rule).

That gives this coordinate system:

- **positive X** points to the right
- **positive Y** points to the back
- **positive Z** points up

```js jscad
import { colorize, cuboid, cylinder, rotateX, rotateY, translate, union } from '@jscad/modeling'

// An arrow along +Z, which we rotate into place for each axis.
const arrow = (length) => union(
  cylinder({ radius: 0.6, height: length, center: [0, 0, length / 2] }),
  cylinder({ radius: 1.6, height: 4, center: [0, 0, length + 1] })
)

export const main = () => [
  colorize([0.85, 0.2, 0.2], rotateY(Math.PI / 2, arrow(20))),  // X
  colorize([0.2, 0.7, 0.3], rotateX(-Math.PI / 2, arrow(20))),  // Y
  colorize([0.25, 0.45, 0.95], arrow(20)),                      // Z
  colorize([0.6, 0.6, 0.65], cuboid({ size: [3, 3, 3] }))
]
```

Rotate the model above: the red arrow is +X, green is +Y, blue is +Z. The viewer on
every page in this guide draws the same three axes in the same three colors.

### Positive rotations

The right-hand rule also fixes which way a positive angle turns. Point your right
thumb along the positive axis, and your fingers curl in the direction of a positive
rotation:

- from **positive X** towards **positive Y**, about the **Z** axis
- from **positive Y** towards **positive Z**, about the **X** axis
- from **positive Z** towards **positive X**, about the **Y** axis

```js jscad
import { colorize, cuboid, rotateZ, TAU, translate } from '@jscad/modeling'

export const main = () => {
  // An arm along +X, rotated about Z in positive steps: it sweeps towards +Y.
  const arm = cuboid({ size: [20, 3, 1], center: [10, 0, 0] })

  return [0, 1, 2, 3].map((i) => colorize(
    [0.2 + i * 0.2, 0.5, 0.95 - i * 0.2],
    translate([0, 0, i * 2], rotateZ(i * TAU / 16, arm))
  ))
}
```

It takes a while to internalise, and the fastest way to learn it is to rotate a shape
by both a positive and a negative angle and watch which way it goes.

## Angles are radians

Every angle in the JSCAD API is in radians, never degrees. A full turn is 2π.

`TAU` is exported for exactly this, and makes fractions of a circle readable:

```js
import { TAU } from '@jscad/modeling'

TAU        // a full turn
TAU / 2    // half a turn
TAU / 4    // a quarter turn
```

Reaching for `TAU / 8` says "an eighth of a turn" far more directly than
`Math.PI / 4` does.

### Converting to and from degrees

When a measurement arrives in degrees — from a drawing, a datasheet, or a
[design parameter](./design-guide/parameters.md) — convert it:

```js
import { degToRad, radToDeg } from '@jscad/modeling'

const myradians = degToRad(90)          // 1.5707... (π / 2)
const mydegrees = radToDeg(Math.PI / 2) // 90
```

```js jscad
import { colorize, cuboid, degToRad, rotateZ, translate } from '@jscad/modeling'

export const main = () => [0, 15, 30, 45, 60].map((degrees, i) => colorize(
  [0.2, 0.55 + i * 0.08, 0.95],
  translate([0, 0, i * 2.5], rotateZ(degToRad(degrees), cuboid({ size: [24, 3, 2] })))
))
```

## Resolution

Round shapes are approximated with straight segments, and the `segments` option sets
how many. Passing a number directly is fine when you just want "smoother" — but
sometimes a design has a real tolerance to hit, expressed as a distance or an angle
between points rather than a count.

`radiusToSegments()` converts such a tolerance into the segment count that satisfies
it:

```js
import { radiusToSegments } from '@jscad/modeling'

// A 3.5 mm arc, cut on a laser that wants moves of at least 0.1 mm:
const bylength = radiusToSegments(3.5, 0.1, 0)

// The same arc, but limiting the angle between points instead:
const byangle = radiusToSegments(3.5, 0, TAU / 300)
```

The three arguments are the radius, the minimum segment **length**, and the minimum
**angle** in radians. Pass `0` for whichever one you are not constraining.

```js jscad
import { arc, colorize, offset, radiusToSegments, translate } from '@jscad/modeling'

export const main = () => {
  const radius = 14

  // Coarse and fine tolerances, side by side.
  return [0.5, 4].map((minimumLength, i) => {
    const segments = radiusToSegments(radius, minimumLength, 0)
    const shape = arc({ radius, segments })

    return colorize(
      i === 0 ? [0.2, 0.6, 1] : [1, 0.55, 0.2],
      translate([i * 34 - 17, 0, 0], offset({ delta: 0.6 }, shape))
    )
  })
}
```

*Note: a tight tolerance on a large radius produces a lot of segments, and both
calculation and rendering slow down accordingly. Develop with a coarse value and
raise it only for the final output.*

## Tolerance

Geometry comparisons cannot use exact equality — floating point makes that
meaningless. JSCAD compares within an **epsilon** instead: two points closer together
than the epsilon are treated as the same point.

`EPS` and `NEPS` are the library's default tolerances. In practice you rarely use
them directly, because the useful epsilon depends on how large the geometry is —
which is what [`measureEpsilon()`](./design-guide/measurements.md#epsilon) gives you:

```js
import { measureEpsilon, snap } from '@jscad/modeling'

const epsilon = measureEpsilon(myshape)
```

`snap()` rounds a geometry's points to its own epsilon, which is the usual fix for a
mesh that arrived from an external file with almost-but-not-quite coincident
vertices.

## Working with vectors and matrices

For designs that need to compute positions rather than write them out, the maths
modules are exported as namespaces:

| Namespace | Covers |
| --- | --- |
| `vec2`, `vec3`, `vec4` | vector arithmetic |
| `mat4` | 4×4 transformation matrices |
| `line2`, `line3` | infinite lines |
| `plane` | planes |

```js
import { mat4, TAU, transform, cube } from '@jscad/modeling'

const matrix = mat4.fromZRotation(mat4.create(), TAU / 8)
const myshape = transform(matrix, cube({ size: 10 }))
```

Matrix constructors follow a `from…` naming convention — `fromXRotation`,
`fromTranslation`, `fromScaling` — and take the output matrix as their first
argument. See [Matrix transform](./design-guide/transforms.md#matrix-transform).

Two smaller helpers round out the set: `flatten()` flattens nested arrays, and
`coalesce()` flattens *and* drops `null` and `undefined` — handy when assembling a
parts list where some pieces are conditional.

```js
import { coalesce } from '@jscad/modeling'

export const main = (params) => coalesce([
  baseplate(),
  params.showLid ? lid() : null,
  params.showFeet ? [footLeft(), footRight()] : null
])
```

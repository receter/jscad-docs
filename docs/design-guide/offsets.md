---
title: Offsets
sidebar_position: 11
---

# Offsets

Offsetting grows or shrinks a shape by a fixed distance, holding that distance
everywhere along its boundary. A positive `delta` expands, a negative one contracts.

It is how clearances, wall thicknesses and rounded outlines get made — anything where
the requirement is "the same distance from this edge, all the way round".

```js jscad
import { offset, star, translate } from '@jscad/modeling'

export const main = () => {
  const shape = star({ vertices: 5, outerRadius: 14, innerRadius: 7 })

  return [
    translate([-32, 0, 0], offset({ delta: -1.5 }, shape)),
    shape,
    translate([32, 0, 0], offset({ delta: 3, corners: 'round', segments: 16 }, shape))
  ]
}
```

:::info[Changed in v3]

v2 had two functions. `expand()` worked on 2D and 3D shapes, `offset()` only on 2D,
and they otherwise did the same job. v3 unifies them into a single `offset()` that
handles 2D and 3D alike.

```js
// v2
const grown = expand({ delta: 2, corners: 'round' }, shape)

// v3
const grown = offset({ delta: 2, corners: 'round' }, shape)
```

`expansions.expand()` still exists in the v2 compatibility shim, aliased to
`offset()`, but new designs should call `offset()` directly.

:::

## Options

| Option | Default | Meaning |
| --- | --- | --- |
| `delta` | `1` | Distance to offset — positive outwards, negative inwards |
| `corners` | `'edge'` | How convex corners are filled: `'edge'`, `'chamfer'` or `'round'` |
| `segments` | `16` | Segments used per full rotation when `corners` is `'round'` |

## Corner styles

Growing a shape leaves a gap at every convex corner, and `corners` decides what fills
it. `'edge'` extends the two sides until they meet, keeping the corner sharp;
`'chamfer'` cuts across it; `'round'` arcs around it at the offset distance.

```js jscad
import { offset, polygon, translate } from '@jscad/modeling'

export const main = () => {
  const shape = polygon({ points: [[0, 0], [20, 0], [20, 14], [8, 20]] })

  return ['edge', 'chamfer', 'round'].map((corners, i) => translate(
    [i * 32 - 32, 0, 0],
    offset({ delta: 3, corners, segments: 16 }, shape)
  ))
}
```

Only convex corners are affected — concave ones need no filling, so all three styles
agree there.

## Contracting

A negative `delta` pulls the boundary inwards. Contract further than the shape is
thick and parts of it disappear, which is a legitimate way to test for thin walls.

```js jscad
import { offset, polygon, subtract } from '@jscad/modeling'

export const main = () => {
  const shape = polygon({ points: [[0, 0], [40, 0], [40, 24], [16, 30], [0, 20]] })

  // the ring between an outer and an inner offset: a wall of known thickness
  return subtract(
    offset({ delta: 2, corners: 'round', segments: 16 }, shape),
    offset({ delta: -2, corners: 'round', segments: 16 }, shape)
  )
}
```

## Offsetting paths

A [path](./paths-and-text.md) has no interior, so offsetting one gives a band of
`delta` on each side rather than a larger version of it. This is how a line becomes a
shape.

```js jscad
import { arc, offset, TAU } from '@jscad/modeling'

export const main = () => {
  const path = arc({ radius: 16, endAngle: TAU * 0.75, segments: 48 })

  return offset({ delta: 2, corners: 'round', segments: 16 }, path)
}
```

The distinction matters when converting v2 designs: on a closed 2D shape `offset()`
enlarges, on a path it outlines. Reach for the [subtract of two
offsets](#contracting) when you want a wall from a closed shape.

## Offsetting 3D shapes

`offset()` accepts 3D geometry too. With `corners: 'round'` it rounds every edge and
corner at once, which is the quickest way to take the hard edges off a part.

```js jscad
import { cuboid, offset } from '@jscad/modeling'

export const main = () => offset(
  { delta: 2, corners: 'round', segments: 16 },
  cuboid({ size: [16, 24, 10] })
)
```

:::info[New in v3]

Offsetting 3D geometry was not possible with v2's `offset()`, and v2's `expand()`
warned that the 3D case was very CPU intensive. v3's implementation is the supported
path for both.

For heavy rounding, [`minkowskiSum()`](./operations.md#minkowski-sum) is often the
better tool — summing a solid with a sphere rounds it, and with a cube chamfers it.

:::

Keep `segments` modest while iterating. Every extra segment multiplies out across
every edge and corner of the solid, and the cost climbs quickly.

## Offsetting a list of points

`offsetFromPoints()` works one level below the geometry functions, on a bare array of
2D points, and returns a new array. Useful when building geometry procedurally and
you want the offset before a shape exists.

| Option | Default |
| --- | --- |
| `delta` | `1` |
| `corners` | `'edge'` |
| `segments` | `16` |
| `closed` | `false` |

```js jscad
import { geom2, offsetFromPoints } from '@jscad/modeling'

export const main = () => {
  const points = [[0, 0], [24, 0], [24, 16], [10, 22]]
  const wider = offsetFromPoints({ delta: 4, corners: 'round', segments: 16, closed: true }, points)

  return geom2.fromPoints(wider)
}
```

## Related

- [Paths and Text](./paths-and-text.md) — offsetting is how strokes gain width
- [Extrusions](./extrusions.md#what-happened-to-extruderectangular) — offset plus
  extrude replaces the removed `extrudeRectangular()`

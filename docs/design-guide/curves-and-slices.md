---
title: Curves and Slices
sidebar_position: 11
---

# Curves and Slices

The [extrusions](./extrusions.md) each sweep a profile in one fixed way — straight
up, around an axis, along a helix. When none of them fits, `extrudeFromSlices()`
gives you the level underneath: you describe the cross section at every step, and
JSCAD stitches the steps into a solid.

Bézier curves supply the maths for driving that — a smooth function you can sample at
each step for a position, a scale, or a direction.

```js jscad
import { bezier, extrudeFromSlices, mat4, slice } from '@jscad/modeling'

export const main = () => {
  const square = slice.fromVertices([[10, 10], [-10, 10], [-10, -10], [10, -10]])

  // Two curves, sampled per slice to scale the profile in X and Y.
  const xCurve = bezier.create([1, 2, 0.4, 1])
  const yCurve = bezier.create([1, 2, 0.5])

  return extrudeFromSlices({
    numberOfSlices: 20,
    callback: (progress, index, base) => {
      const lifted = slice.transform(
        mat4.fromTranslation(mat4.create(), [0, 0, 30 * progress]),
        base
      )
      return slice.transform(
        mat4.fromScaling(mat4.create(), [
          bezier.valueAt(progress, xCurve),
          bezier.valueAt(progress, yCurve),
          1
        ]),
        lifted
      )
    }
  }, square)
}
```

:::info[New in v3]

None of this was in the v2 user guide. `bezier` and `slice` are documented here for
the first time, and both changed shape in v3 — a slice's data is now `contours`
rather than `edges`.

:::

## Slices

A **slice** is one planar cross section: a list of contours, each a list of 3D
vertices that all lie in the same plane.

```js
// the data structure
{ contours: [ [[0, 0, 1], [4, 0, 1], [4, 3, 1]] ] }
```

Build one from a flat list of vertices, which may be 2D or 3D:

```js
import { slice } from '@jscad/modeling'

const square = slice.fromVertices([[10, 10], [-10, 10], [-10, -10], [10, -10]])
```

Or from the outlines of an existing 2D shape, which is how you turn any
[2D primitive](./2d-primitives.md) into a starting profile:

```js
import { circle, geom2, slice } from '@jscad/modeling'

const profile = slice.fromOutlines(geom2.toOutlines(circle({ radius: 5, segments: 32 })))
```

Slices are transformed with matrices rather than the usual transform functions:
`slice.transform(matrix, myslice)`. See
[Matrix transform](./transforms.md#matrix-transform) for building the matrices.

:::warning[`fromGeom2` was renamed]

Examples in the JSCAD repository still call `slice.fromGeom2(myshape)`. That function
does not exist in `@jscad/modeling@3.0.7-alpha.0` — it is now
`slice.fromOutlines(geom2.toOutlines(myshape))`. Code copied from those examples will
fail with *"slice.fromGeom2 is not a function"*.

:::

## Extruding from slices

`extrudeFromSlices()` calls your callback once per slice and lofts the results
together.

| Option | Default | Meaning |
| --- | --- | --- |
| `numberOfSlices` | `2` | How many slices the callback produces |
| `callback` | — | `(progress, index, base) => slice` |
| `capStart` | `true` | Close the solid at the start |
| `capEnd` | `true` | Close the solid at the end |
| `close` | `false` | Join the last slice back to the first |
| `repair` | `true` | Repair gaps in the result |

The callback receives:

- **`progress`** — how far along, from 0 to 1
- **`index`** — the slice number, from 0 to `numberOfSlices - 1`
- **`base`** — the base object you passed in, unchanged

Return a slice, or `null` to skip that step.

Because each slice is generated independently, successive slices need not have the
same number of points — which is how you morph one profile into another:

```js jscad
import { circle, extrudeFromSlices, geom2, mat4, slice } from '@jscad/modeling'

export const main = () => extrudeFromSlices({
  numberOfSlices: 6,
  callback: (progress, index) => {
    // Each slice is a fresh polygon, gaining both radius and sides as it climbs.
    const profile = circle({ radius: 2 + 5 * progress, segments: 4 + index * index })
    const lifted = slice.fromOutlines(geom2.toOutlines(profile))

    return slice.transform(
      mat4.fromTranslation(mat4.create(), [0, 0, progress * 20]),
      lifted
    )
  }
}, circle({ radius: 4, segments: 4 }))
```

Passing a 2D shape with no callback simply extrudes it, which is a quick way to check
your base is what you think it is.

## Bézier curves

A Bézier curve in JSCAD is a mathematical object, not geometry. You create one from
control points and then *sample* it — it never becomes a shape by itself.

```js
import { bezier } from '@jscad/modeling'

const curve = bezier.create([[0, 0], [10, 20], [20, 0]])
```

The first and last control points are the endpoints; the ones between pull the curve
towards them without being touched.

| Function | Returns |
| --- | --- |
| `bezier.create(points)` | a curve from the control points |
| `bezier.valueAt(t, curve)` | the point at `t`, where `t` runs 0 to 1 |
| `bezier.tangentAt(t, curve)` | the direction of travel at `t` |
| `bezier.length(segments, curve)` | approximate arc length |
| `bezier.lengths(segments, curve)` | cumulative length at each segment |
| `bezier.arcLengthToT({distance}, curve)` | the `t` at a given distance along the curve |

Control points can have any number of dimensions, and that decides what the curve
produces. One-dimensional control points give a scalar function — useful for driving
a scale or a radius:

```js
const widths = bezier.create([1, 2, 0.4, 1])
bezier.valueAt(0.5, widths)   // a number
```

Two- or three-dimensional points give a path through space:

```js
const path = bezier.create([[0, 0, 0], [10, 20, 5], [20, 0, 10]])
bezier.valueAt(0.5, path)     // [10, 10, 5]
```

`arcLengthToT()` matters when you want *evenly spaced* samples. Stepping `t` in equal
increments does not step evenly along the curve — the curve moves faster where the
control points pull harder.

### Sweeping a profile along a curve

Combining the two halves of this page — sample a 3D curve for position, its tangent
for direction, and emit a slice at each step — gives a tube following an arbitrary
path:

```js jscad
import {
  bezier, circle, colorize, extrudeFromSlices, geom2, mat4, slice, vec3
} from '@jscad/modeling'

// A matrix rotating vector `from` onto vector `to`.
const rotationBetween = (from, to) => {
  const a = vec3.normalize(vec3.create(), from)
  const b = vec3.normalize(vec3.create(), to)
  const axis = vec3.cross(vec3.create(), a, b)
  const angle = Math.acos(Math.min(1, Math.max(-1, vec3.dot(a, b))))

  if (vec3.length(axis) < 1e-6) return mat4.create()
  return mat4.fromRotation(mat4.create(), angle, vec3.normalize(axis, axis))
}

export const main = () => {
  const controlPoints = [[10, 6, 0], [-6, 6, 20], [8, -6, 24], [-10, -6, 4]]
  const curve = bezier.create(controlPoints)

  const profile = slice.fromOutlines(geom2.toOutlines(circle({ radius: 1.6, segments: 24 })))
  const startDirection = [0, 0, 1]

  return colorize([0.25, 0.65, 0.95], extrudeFromSlices({
    numberOfSlices: 60,
    callback: (progress) => {
      const position = bezier.valueAt(progress, curve)
      const tangent = bezier.tangentAt(progress, curve)

      const rotation = rotationBetween(startDirection, tangent)
      const translation = mat4.fromTranslation(mat4.create(), position)

      return slice.transform(mat4.multiply(mat4.create(), translation, rotation), profile)
    }
  }, profile))
}
```

Rotating a profile onto a tangent is the fiddly part of any sweep. Watch for the
degenerate case where the tangent points opposite the starting direction — the
rotation axis vanishes and the orientation flips.

## 3D paths

`path3` is new in v3: the 3D counterpart of [`path2`](./paths-and-text.md), a list of
ordered vertices in space.

```js
import { path3 } from '@jscad/modeling'

let mypath = path3.fromVertices({ closed: true }, [[0, 0, 0], [4, 0, 0], [4, 3, 2]])
mypath = path3.concat(mypath, path3.fromVertices({}, [[8, 3, 2]]))
```

It supports `create`, `fromVertices`, `toVertices`, `clone`, `close`, `concat`,
`reverse`, `transform`, `equals`, `isA` and `validate`, and can be measured.

:::warning[Nothing consumes a path3 yet]

In `@jscad/modeling@3.0.7-alpha.0`, `path3` is a data structure and little more:

- **It does not render.** The viewer converts geom2, geom3 and path2; a path3 is
  skipped, so a design returning one shows nothing at all — here or in the JSCAD
  applications.
- **Operations silently ignore it.** `offset()`, `extrudeLinear()` and `hull()` all
  return the path unchanged rather than erroring, and `hull()` discards its other
  arguments. `union()` at least throws *"union unsupported geometry type"*.

So a path3 is currently useful for holding and transforming a set of 3D vertices —
computing a route, then reading it back with `toVertices()` to drive something else.
To make a visible shape from a 3D route, sample it into slices as
[above](#sweeping-a-profile-along-a-curve).

:::

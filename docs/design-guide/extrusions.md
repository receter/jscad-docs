---
title: Extrusions
sidebar_position: 9
---

# Extrusions

Extruding turns a two dimensional shape into a three dimensional one. In every
extrusion a continuous solid is formed with a cross section matching the 2D shape it
started from.

Drawing a profile and sweeping it is often far easier than assembling the same solid
from primitives — and it keeps the design parametric, because changing the profile
changes the solid.

```js jscad
import { extrudeLinear, star } from '@jscad/modeling'

export const main = () => extrudeLinear(
  { height: 10 },
  star({ vertices: 8, outerRadius: 20, innerRadius: 10 })
)
```

:::warning[Orientation matters]

For extrusions to produce correct solids, the 2D shape must be wound
counterclockwise. A clockwise profile extrudes into a solid whose faces point
inwards. See [Orientation](./transforms.md#orientation).

:::

## Linear extrude

Extrudes a 2D shape upwards along the Z axis to the given `height`. Accepts `geom2`
shapes and closed `path2` paths.

The shape can also be twisted during the extrusion: `twistAngle` is the total
rotation about the Z axis, and `twistSteps` is how many intermediate slices are used
to get there. Increasing `twistSteps` makes the twist smoother.

| Option | Default |
| --- | --- |
| `height` | `1` |
| `twistAngle` | `0` |
| `twistSteps` | `1` |

```js jscad
import { extrudeLinear, rectangle } from '@jscad/modeling'

export const main = () => extrudeLinear(
  { height: 20 },
  rectangle({ size: [20, 25] })
)
```

Because the profile can sit anywhere on the plane, twisting it about the origin
produces a wide range of shapes:

```js jscad
import { extrudeLinear, rectangle, TAU } from '@jscad/modeling'

export const main = () => extrudeLinear(
  { height: 40, twistAngle: TAU / 2, twistSteps: 40 },
  rectangle({ size: [20, 6] })
)
```

## Rotate extrude

Sweeps a 2D shape in a rotation about the Z axis, producing shapes of revolution. The
profile is placed away from the axis and swept around it, so where you put the shape
determines the result.

`segments` sets the number of segments in a full rotation; increasing it improves the
surface. `angle` sweeps less than a full turn, and `startAngle` sets where the sweep
begins.

| Option | Default |
| --- | --- |
| `angle` | `TAU` |
| `startAngle` | `0` |
| `overflow` | `'cap'` |
| `segments` | `12` |

```js jscad
import { circle, extrudeRotate } from '@jscad/modeling'

export const main = () => extrudeRotate(
  { segments: 64 },
  circle({ radius: 4, center: [12, 0] })
)
```

Sweeping part of a turn leaves the ends open, capped so the result is still a solid:

```js jscad
import { circle, extrudeRotate, TAU } from '@jscad/modeling'

export const main = () => extrudeRotate(
  { segments: 32, angle: TAU / 2, startAngle: 0 },
  circle({ radius: 4, center: [12, 0] })
)
```

## Helical extrude

Sweeps a 2D shape along a helix — the extrusion for threads, springs and coils.

`pitch` is the elevation gained per turn. `height` sets the total height instead, and
is ignored when `pitch` is given. `endOffset` shifts the final radius, which produces
tapered helices and flat spirals. A positive `angle` gives a right-hand rotation, a
negative one a left-hand rotation.

| Option | Default |
| --- | --- |
| `angle` | `TAU` |
| `startAngle` | `0` |
| `pitch` | `10` |
| `height` | — (ignored if `pitch` is set) |
| `endOffset` | `0` |
| `segmentsPerRotation` | `32` |

```js jscad
import { circle, extrudeHelical, TAU } from '@jscad/modeling'

export const main = () => extrudeHelical(
  { angle: TAU * 3, pitch: 10, segmentsPerRotation: 64 },
  circle({ radius: 2, center: [12, 0], segments: 24 })
)
```

Giving `endOffset` a negative value pulls the sweep inwards as it climbs, producing a
tapered coil:

```js jscad
import { circle, extrudeHelical, TAU } from '@jscad/modeling'

export const main = () => extrudeHelical(
  { angle: TAU * 4, pitch: 8, endOffset: -18, segmentsPerRotation: 64 },
  circle({ radius: 1.5, center: [20, 0], segments: 16 })
)
```

:::info[New in v3]

`extrudeHelical()` is new in v3. In v2 the same shapes had to be assembled by hand,
usually with `extrudeFromSlices()`.

:::

## Project

A projection is the two dimensional shadow of a three dimensional shape. JSCAD uses a
parallel projection, so the result is the same whether the shape is near the
projection plane or far from it.

`axis` and `origin` define the plane to project onto, and can be positioned anywhere
about the shape.

| Option | Default |
| --- | --- |
| `axis` | `[0, 0, 1]` |
| `origin` | `[0, 0, 0]` |

```js jscad
import { project, sphere } from '@jscad/modeling'

export const main = () => project({}, sphere({ radius: 20, segments: 8 }))
```

Projecting onto a different plane gives a different outline of the same solid:

```js jscad
import { cuboid, project, rotateZ, TAU, union } from '@jscad/modeling'

export const main = () => {
  const shape = union(
    cuboid({ size: [30, 10, 10] }),
    rotateZ(TAU / 4, cuboid({ size: [30, 10, 10] }))
  )

  return project({ axis: [0, 0, 1] }, shape)
}
```

## Extruding from slices

`extrudeFromSlices()` builds a solid from a sequence of cross sections, giving full
control over how the profile changes along the sweep. It is the most general of the
extrusions, and the one to reach for when none of the others fit.

## What happened to `extrudeRectangular`?

:::warning[Removed in v3]

`extrudeRectangular()` no longer exists. It swept an upright rectangle along the
outlines of a 2D shape, producing a wall. That is now done by offsetting the shape
first and extruding the result.

The related change is that v2's `expand()` and `offset()` have been unified. There is
one `offset()` function, taking a `delta` distance, `corners` (`'edge'`, `'chamfer'`
or `'round'`) and `segments` for round corners. It now works on 3D geometry too,
which `offset()` could not do in v2.

:::

For a **path**, `offset()` produces the wall directly — the path has no interior, so
offsetting it in both directions gives a band of the requested width:

```js jscad
import { arc, extrudeLinear, offset, TAU } from '@jscad/modeling'

export const main = () => {
  const path = arc({ radius: 20, endAngle: TAU * 0.75, segments: 64 })
  const band = offset({ delta: 1.5, corners: 'round', segments: 16 }, path)

  return extrudeLinear({ height: 8 }, band)
}
```

For a **closed 2D shape**, `offset()` grows or shrinks the whole shape rather than
outlining it. To get a wall, subtract an inner offset from an outer one:

```js jscad
import { extrudeLinear, offset, star, subtract } from '@jscad/modeling'

export const main = () => {
  const profile = star({ vertices: 6, outerRadius: 20, innerRadius: 10 })
  const wall = subtract(
    offset({ delta: 1.5, corners: 'edge' }, profile),
    offset({ delta: -1.5, corners: 'edge' }, profile)
  )

  return extrudeLinear({ height: 8 }, wall)
}
```

:::note

The v2 compatibility shim still exposes `extrusions.extrudeRectangular()`, defined as
`extrudeLinear(options, offset(options, geometry))`. That matches v2 for paths, but
for closed 2D shapes it grows the shape instead of outlining it — so prefer writing
the intent out explicitly, as above.

:::

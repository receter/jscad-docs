---
title: 3D Primitives
sidebar_position: 5
---

# 3D Primitives

A 3D primitive is a shape with three dimensions — width, depth and height, or X, Y
and Z. Closed 3D shapes have a measurable volume.

The mathematical study of 3D shapes is called
[solid geometry](https://simple.m.wikipedia.org/wiki/Solid_geometry).

```js jscad
import { cuboid, cylinder, sphere, torus, translate } from '@jscad/modeling'

export const main = () => [
  translate([-18, 0, 0], cuboid({ size: [10, 10, 10] })),
  translate([-6, 0, 0], sphere({ radius: 6 })),
  translate([6, 0, 0], cylinder({ radius: 5, height: 12 })),
  translate([20, 0, 0], torus({ innerRadius: 2, outerRadius: 6 }))
]
```

## Resolution of shapes

Every rounded shape takes a `segments` option, controlling tessellation. Setting
`segments` to 8 means 8 polygons make up a full revolution. Omitting it uses the
default.

This lets each design choose how much detail it needs — but be aware that
calculation and rendering time rise with it. For spheres, the polygon count grows
quadratically as `segments` increases.

```js jscad
import { sphere, translate } from '@jscad/modeling'

export const main = () => [8, 16, 32, 64].map((segments, i) =>
  translate([(i - 1.5) * 14, 0, 0], sphere({ radius: 6, segments }))
)
```

When a design needs a specific resolution expressed as a distance or angle between
points rather than a segment count, use `radiusToSegments()` to work out the number
of segments required.

## Cuboid

A shape formed from six rectangular faces, each at right angles to the next, with
opposite faces equal.

*[Learn about cuboids at MathIsFun.com](http://www.mathsisfun.com/geometry/cuboids-rectangular-prisms.html)*

`size` specifies the extent along the X, Y and Z axes. Cuboids can be created at a
requested `center`.

| Option | Default |
| --- | --- |
| `size` | `[2, 2, 2]` |
| `center` | `[0, 0, 0]` |

```js jscad
import { cuboid } from '@jscad/modeling'

export const main = () => cuboid({ size: [10, 20, 30], center: [0, 0, 0] })
```

### Cube

A special case of the cuboid, where all six faces are squares. It takes a single
number for `size`.

| Option | Default |
| --- | --- |
| `size` | `2` |
| `center` | `[0, 0, 0]` |

```js jscad
import { cube } from '@jscad/modeling'

export const main = () => cube({ size: 15 })
```

### Rounded cuboid

A cuboid whose corners and edges are rounded, controlled by `roundRadius`.

| Option | Default |
| --- | --- |
| `size` | `[2, 2, 2]` |
| `center` | `[0, 0, 0]` |
| `roundRadius` | `0.2` |
| `segments` | `32` |

```js jscad
import { roundedCuboid } from '@jscad/modeling'

export const main = () => roundedCuboid({
  size: [20, 30, 15],
  roundRadius: 3,
  segments: 32
})
```

## Ellipsoid

A surface with three pairwise perpendicular axes of symmetry meeting at a center.

`radius` gives the size along the X, Y and Z axes.

| Option | Default |
| --- | --- |
| `radius` | `[1, 1, 1]` |
| `center` | `[0, 0, 0]` |
| `segments` | `32` |
| `axes` | `[[1, 0, 0], [0, -1, 0], [0, 0, 1]]` |

```js jscad
import { ellipsoid } from '@jscad/modeling'

export const main = () => ellipsoid({ radius: [5, 10, 20], segments: 64 })
```

`axes` takes three vectors for the X, Y and Z base vectors, which tilts the ellipsoid
without a separate rotation:

```js jscad
import { ellipsoid } from '@jscad/modeling'

export const main = () => ellipsoid({
  radius: [12, 6, 9],
  segments: 64,
  axes: [[1, 1, 0], [0, -1, 1], [-1, 0, 1]]
})
```

### Sphere

A ball, where every point on the surface is the same distance from the center.

*[Learn about spheres at MathIsFun.com](http://www.mathsisfun.com/geometry/sphere.html)*

| Option | Default |
| --- | --- |
| `radius` | `1` |
| `center` | `[0, 0, 0]` |
| `segments` | `32` |

```js jscad
import { sphere } from '@jscad/modeling'

export const main = () => sphere({ radius: 10, center: [0, 0, 0], segments: 64 })
```

### Geodesic sphere

A convex polyhedron built from triangles. The base form is the icosahedron, with 20
faces; `frequency` sets how finely each face is subdivided, and should be a multiple
of 6.

| Option | Default |
| --- | --- |
| `radius` | `1` |
| `frequency` | `6` |

```js jscad
import { geodesicSphere } from '@jscad/modeling'

export const main = () => geodesicSphere({ radius: 15, frequency: 18 })
```

## Cylinder

A shape with two flat circular ends and the same cross-section throughout, extending
along the Z axis.

*[Learn about cylinders at MathIsFun.com](http://www.mathsisfun.com/geometry/cylinder.html)*

| Option | Default |
| --- | --- |
| `radius` | `1` |
| `height` | `2` |
| `center` | `[0, 0, 0]` |
| `segments` | `32` |

```js jscad
import { cylinder } from '@jscad/modeling'

export const main = () => cylinder({ radius: 5, height: 20, segments: 64 })
```

### Elliptic cylinder

`cylinderElliptic` builds the whole family of cylindrical shapes — including cones,
by giving the two ends different radii.

| Option | Default |
| --- | --- |
| `height` | `2` |
| `startRadius` | `[1, 1]` |
| `endRadius` | `[1, 1]` |
| `startAngle` | `0` |
| `endAngle` | `TAU` |
| `center` | `[0, 0, 0]` |
| `segments` | `32` |

```js jscad
import { cylinderElliptic, translate } from '@jscad/modeling'

export const main = () => [
  translate([-12, 0, 0], cylinderElliptic({
    height: 20,
    startRadius: [10, 5],
    endRadius: [8, 3]
  })),
  translate([12, 0, 0], cylinderElliptic({
    height: 20,
    startRadius: [8, 8],
    endRadius: [0, 0] // a cone
  }))
]
```

### Rounded cylinder

A cylinder with rounded ends, controlled by `roundRadius`.

| Option | Default |
| --- | --- |
| `radius` | `1` |
| `height` | `2` |
| `roundRadius` | `0.2` |
| `center` | `[0, 0, 0]` |
| `segments` | `32` |

```js jscad
import { roundedCylinder } from '@jscad/modeling'

export const main = () => roundedCylinder({
  radius: 8,
  height: 30,
  roundRadius: 3,
  segments: 64
})
```

## Torus

A shape made by revolving a small (inner) circle along the circumference of a larger
(outer) circle.

*[Learn about the torus at MathIsFun.com](http://www.mathsisfun.com/geometry/torus.html)*

| Option | Default |
| --- | --- |
| `innerRadius` | `1` |
| `innerSegments` | `32` |
| `innerRotation` | `0` |
| `outerRadius` | `4` |
| `outerSegments` | `32` |
| `outerRotation` | `TAU` |
| `startAngle` | `0` |

```js jscad
import { torus } from '@jscad/modeling'

export const main = () => torus({ innerRadius: 4, outerRadius: 20 })
```

Reducing the segment counts turns the same function into a range of ring-like
shapes — a hexagonal ring made from a square profile, for instance:

```js jscad
import { torus } from '@jscad/modeling'

export const main = () => torus({
  innerRadius: 5,
  outerRadius: 20,
  innerSegments: 4,
  outerSegments: 6
})
```

## Polyhedron

A shape built directly from a list of 3D points and the faces connecting them, for
when no other primitive fits.

Each face must list its vertices counterclockwise, following the right hand rule, or
it will face the wrong way. `orientation` flips the interpretation for all faces at
once.

| Option | Default |
| --- | --- |
| `points` | *required* |
| `faces` | *required* |
| `colors` | `undefined` |
| `orientation` | `'outward'` |

```js jscad
import { polyhedron } from '@jscad/modeling'

export const main = () => polyhedron({
  points: [[10, 10, 0], [10, -10, 0], [-10, -10, 0], [-10, 10, 0], [0, 0, 10]],
  faces: [[0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4], [1, 0, 3], [2, 1, 3]],
  orientation: 'inward'
})
```

`colors` takes one RGBA color per face, in the same order as `faces`, letting a
single polyhedron carry a different color on each of its faces.

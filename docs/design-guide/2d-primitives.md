---
title: 2D Primitives
sidebar_position: 6
---

# 2D Primitives

A 2D primitive is a shape with two dimensions — width and length, or X and Y. It has
no thickness, though JSCAD draws it as a very thin shape so you can see it.

One way of thinking about 2D shapes is anything that lies flat on a piece of paper,
like a drawn circle or square. The mathematical study of them is called
[plane geometry](https://en.m.wikipedia.org/wiki/Plane_(geometry)).

2D shapes matter because they are the starting point for
[extrusions](./extrusions.md): draw a profile, then sweep it into a solid.

```js jscad
import { circle, rectangle, star, translate, triangle } from '@jscad/modeling'

export const main = () => [
  translate([-15, 0, 0], rectangle({ size: [8, 12] })),
  translate([-5, 0, 0], circle({ radius: 5 })),
  translate([6, 0, 0], star({ vertices: 5, outerRadius: 5 })),
  translate([17, 0, 0], triangle({ type: 'SSS', values: [8, 8, 8] }))
]
```

## Resolution of shapes

As with 3D shapes, every rounded 2D shape takes a `segments` option controlling
tessellation. Setting `segments` to 8 means 8 segments span a full revolution.
Omitting it uses the default.

## Rectangle

A shape with four straight sides, where every interior angle is a right angle.

*[Learn about rectangles at MathIsFun.com](http://www.mathsisfun.com/geometry/rectangle.html)*

`size` gives the extent across the X and Y axes.

| Option | Default |
| --- | --- |
| `size` | `[2, 2]` |
| `center` | `[0, 0]` |

```js jscad
import { rectangle } from '@jscad/modeling'

export const main = () => rectangle({ size: [30, 40], center: [0, 0] })
```

### Square

The specialised square takes a single number for all sides.

| Option | Default |
| --- | --- |
| `size` | `2` |
| `center` | `[0, 0]` |

```js jscad
import { square } from '@jscad/modeling'

export const main = () => square({ size: 30 })
```

### Rounded rectangle

A rectangle with rounded corners, controlled by `roundRadius`.

| Option | Default |
| --- | --- |
| `size` | `[2, 2]` |
| `center` | `[0, 0]` |
| `roundRadius` | `0.2` |
| `segments` | `32` |

```js jscad
import { roundedRectangle } from '@jscad/modeling'

export const main = () => roundedRectangle({
  size: [40, 25],
  roundRadius: 5,
  segments: 32
})
```

## Ellipse

A shape surrounding two focal points, such that for every point on the curve the sum
of the distances to the two focal points is constant.

`radius` gives the size along the X and Y axes. `startAngle` and `endAngle` cut the
ellipse into an arc-like wedge.

| Option | Default |
| --- | --- |
| `radius` | `[1, 1]` |
| `center` | `[0, 0]` |
| `startAngle` | `0` |
| `endAngle` | `TAU` |
| `segments` | `32` |

```js jscad
import { ellipse } from '@jscad/modeling'

export const main = () => ellipse({ radius: [20, 10], segments: 64 })
```

```js jscad
import { ellipse, TAU } from '@jscad/modeling'

export const main = () => ellipse({
  radius: [20, 10],
  startAngle: TAU / 4,
  endAngle: TAU / 2,
  segments: 64
})
```

### Circle

A curve drawn at a constant distance from a center point.

*[Learn about circles at MathIsFun.com](http://www.mathsisfun.com/algebra/circle-equations.html)*

| Option | Default |
| --- | --- |
| `radius` | `1` |
| `center` | `[0, 0]` |
| `startAngle` | `0` |
| `endAngle` | `TAU` |
| `segments` | `32` |

```js jscad
import { circle } from '@jscad/modeling'

export const main = () => circle({ radius: 15, segments: 64 })
```

:::tip[Angles are radians]

Every angle in JSCAD is in radians. `TAU` is exported as a full turn (2π), which
makes fractions of a circle read naturally: `TAU / 4` is a quarter turn. To work in
degrees, convert with `degToRad()`.

:::

## Polygon

A closed shape with straight sides, built from a list of points.

*[Learn about polygons at MathIsFun.com](http://www.mathsisfun.com/geometry/polygons.html)*

```js jscad
import { polygon } from '@jscad/modeling'

export const main = () => polygon({
  points: [[0, 0], [30, 0], [30, 20], [15, 30], [0, 20]]
})
```

:::warning[Point order matters]

Points must be given in counterclockwise order. If a polygon that will be extruded is
wound the other way, the faces of the resulting solid point inwards.

If you cannot control the ordering, pass `orientation: 'clockwise'` and JSCAD will
correct it for you.

:::

A polygon can also be built from several outlines, which is how holes and multi-part
profiles are described. Pass a nested array of points, or points plus `paths`:

```js jscad
import { polygon } from '@jscad/modeling'

const roof = [[10, 11], [0, 11], [5, 20]]
const wall = [[0, 0], [10, 0], [10, 10], [0, 10]]

export const main = () => polygon({ points: [roof, wall] })
```

`paths` indexes into a flat list of points instead, which is convenient when points
are shared or generated:

```js
polygon({ points: [...roof, ...wall], paths: [[0, 1, 2], [3, 4, 5, 6]] })
```

| Option | Default |
| --- | --- |
| `points` | *required* |
| `paths` | `undefined` |
| `orientation` | `'counterclockwise'` |

## Star

A shape made from straight rays extending from a center.

`vertices` is the number of points (P) and `density` controls how the points are
connected (Q), producing the classic P/Q star polygons. Leave `innerRadius` at 0 and
JSCAD calculates it from the density.

*See [The Inner Radius of n/m Stars by Julian D. A. Wiseman](http://www.jdawiseman.com/papers/easymath/surds_star_inner_radius.html)
for the mathematics.*

| Option | Default |
| --- | --- |
| `vertices` | `5` |
| `density` | `2` |
| `outerRadius` | `1` |
| `innerRadius` | `0` (calculated) |
| `startAngle` | `0` |
| `center` | `[0, 0]` |

```js jscad
import { star, translate } from '@jscad/modeling'

export const main = () => [
  translate([-25, 0, 0], star({ vertices: 8, outerRadius: 20 })),
  translate([25, 0, 0], star({ vertices: 12, outerRadius: 20, innerRadius: 10 }))
]
```

## Triangle

A triangle described the way a trigonometry problem is: by which sides and angles are
known. `type` is a string of `S` for each known side and `A` for each known angle,
and `values` supplies them in that order. Angles are in radians.

*[Learn about solving triangles at MathIsFun.com](https://www.mathsisfun.com/algebra/trig-solving-triangles.html)*

The triangle is always constructed counterclockwise from the origin.

| Option | Default |
| --- | --- |
| `type` | `'SSS'` |
| `values` | `[1, 1, 1]` |

```js jscad
import { degToRad, triangle } from '@jscad/modeling'

export const main = () => triangle({
  type: 'AAS',
  values: [degToRad(62), degToRad(35), 20]
})
```

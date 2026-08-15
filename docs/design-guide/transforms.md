---
title: Transforms
sidebar_position: 8
---

# Transforms

Any shape can be transformed — moved somewhere else, rotated by an angle, scaled up
or down. Every transform **returns a new shape** and leaves the original alone.

```js jscad
import { cuboid, rotateZ, TAU, translate } from '@jscad/modeling'

export const main = () => {
  const original = cuboid({ size: [20, 8, 4] })

  return [0, 1, 2, 3, 4, 5].map((i) =>
    translate([0, 0, i * 6], rotateZ(i * TAU / 12, original))
  )
}
```

Because the original is never modified, the result has to be captured:

```js
const myshape = circle({ radius: 5 })
const newshape = scale([5, 10], myshape) // a new circle, scaled as requested
```

To replace the original, assign back to it:

```js
let myshape = circle({ radius: 5 })
myshape = scale([5, 10], myshape)
```

Transforms can be nested, but **order matters** — rotating then translating is not
the same as translating then rotating:

```js
let myshape = scale([5, 10], circle({ radius: 5 }))
myshape = translate([0, 0, 10], rotateX(TAU / 8, myshape))
```

Most transforms accept several shapes at once, and return a single shape or an array
depending on what they were given.

## Orientation

The standard for 3D systems — graphics cards, design tools, and JSCAD alike — is the
[right-hand rule](https://en.wikipedia.org/wiki/Right-hand_rule). JSCAD produces
shapes and applies transforms following it throughout.

That gives this orientation of the coordinate system:

- positive X points to the right
- positive Y points to the back
- positive Z points to the top

and these positive rotations:

- from positive X to positive Y, about the Z axis
- from positive Y to positive Z, about the X axis
- from positive Z to positive X, about the Y axis

It takes a little while to internalise, and is easiest to learn by rotating a shape
by both positive and negative angles and watching what happens. The
[Math Guide](../math-guide.md#orientation) shows the axes and rotations as models you
can turn.

## Translate

Moves every point in a shape by a fixed `offset`. Values may be positive or negative.

*[Learn about translation at MathIsFun.com](http://www.mathsisfun.com/geometry/translation.html)*

| Argument | Default |
| --- | --- |
| `offset` | `[0, 0, 0]` |

```js jscad
import { sphere, translate } from '@jscad/modeling'

export const main = () => [
  sphere({ radius: 5 }),
  translate([15, 7, -10], sphere({ radius: 5 }))
]
```

There are single-axis versions too:

```js
let myshape = sphere({ radius: 5 })
myshape = translateX(3, myshape)
myshape = translateY(7, myshape)
myshape = translateZ(-10, myshape)
```

## Rotate

Rotates a shape about the X, Y and Z axes. Angles are in **radians**, and may be
positive or negative.

*[Learn about rotation at MathIsFun.com](http://www.mathsisfun.com/geometry/rotation.html)*

| Argument | Default |
| --- | --- |
| `angles` | `[0, 0, 0]` |

```js jscad
import { cuboid, rotate, TAU } from '@jscad/modeling'

export const main = () => rotate(
  [TAU / 4, TAU / 24, TAU / 12],
  cuboid({ size: [5, 20, 5] })
)
```

Single-axis versions apply one rotation at a time:

```js
let myshape = cuboid({ size: [5, 20, 5] })
myshape = rotateX(TAU / 4, myshape)
myshape = rotateY(TAU / 24, myshape)
myshape = rotateZ(TAU / 12, myshape)
```

To think in degrees, convert with `degToRad()`:

```js jscad
import { cuboid, degToRad, rotate } from '@jscad/modeling'

export const main = () => rotate(
  [degToRad(90), degToRad(15), degToRad(30)],
  cuboid({ size: [5, 20, 5] })
)
```

## Scale

Enlarges or shrinks a shape by a factor along each axis. The result is a
[similar shape](https://en.wikipedia.org/wiki/Scaling_(geometry)) in the geometric
sense.

| Argument | Default |
| --- | --- |
| `factors` | `[1, 1, 1]` |

```js jscad
import { scale, sphere, translate } from '@jscad/modeling'

export const main = () => [
  sphere({ radius: 5 }),
  translate([25, 0, 0], scale([2, 1, 3], sphere({ radius: 5 })))
]
```

Single-axis versions take one factor:

```js
let myshape = sphere({ radius: 5 })
myshape = scaleX(2, myshape)
myshape = scaleY(4, myshape)
myshape = scaleZ(6, myshape)
```

## Mirror

Reflects a shape about a plane, described by an `origin` the plane passes through and
a `normal` perpendicular to it.

*[Learn about reflection at MathIsFun.com](http://www.mathsisfun.com/geometry/reflection.html)*

| Option | Default |
| --- | --- |
| `origin` | `[0, 0, 0]` |
| `normal` | `[0, 0, 1]` (mirror about the Z axis) |

```js jscad
import { cuboid, mirror, translate, union } from '@jscad/modeling'

export const main = () => {
  const bracket = union(
    cuboid({ size: [20, 4, 4], center: [10, 0, 0] }),
    cuboid({ size: [4, 4, 16], center: [18, 0, 8] })
  )

  return [bracket, mirror({ origin: [0, 0, 0], normal: [1, 0, 0] }, bracket)]
}
```

Simple versions mirror about a single axis through the origin:

```js
let myshape = cuboid({ size: [5, 20, 5] })
myshape = mirrorX(myshape)
myshape = mirrorY(myshape)
myshape = mirrorZ(myshape)
```

:::info[Fixed in v3]

Mirroring a 2D shape (`geom2`) produced an incorrectly wound result in v2. v3
corrects the transform, so mirrored 2D shapes extrude the right way round.

:::

## Center

Centers shapes about the chosen axes, or relative to a given point. The center of a
shape is the midpoint between its minimum and maximum bounds.

| Option | Default |
| --- | --- |
| `axes` | `[true, true, true]` |
| `relativeTo` | `[0, 0, 0]` |

```js jscad
import { center, cuboid } from '@jscad/modeling'

export const main = () => {
  const offCenter = cuboid({ size: [10, 10, 10], center: [20, 20, 20] })

  return [offCenter, center({ axes: [true, true, false] }, offCenter)]
}
```

Simple versions center about a single axis:

```js
let myshape = sphere({ radius: 5 })
myshape = centerX(myshape)
myshape = centerY(myshape)
myshape = centerZ(myshape)
```

## Align

Aligns the boundaries of several shapes. Each shape is translated so its boundary
lands at the requested position on each axis.

`modes` takes one of `'center'`, `'min'`, `'max'` or `'none'` per axis. `relativeTo`
gives the point to align to — a `null` on an axis means "use the group's own bounding
box". With `grouped: true` all shapes move together, keeping their positions relative
to one another.

| Option | Default |
| --- | --- |
| `modes` | `['center', 'center', 'min']` |
| `relativeTo` | `[0, 0, 0]` |
| `grouped` | `false` |

```js jscad
import { align, cuboid, translate } from '@jscad/modeling'

export const main = () => {
  const shapes = [
    cuboid({ size: [6, 6, 6], center: [0, 0, 12] }),
    cuboid({ size: [10, 10, 14], center: [14, 6, 3] }),
    cuboid({ size: [8, 12, 4], center: [-9, -8, 20] })
  ]

  return [
    shapes,
    translate([0, 40, 0], align({ modes: ['center', 'center', 'min'] }, shapes))
  ]
}
```

Align returns a single shape when given one, and an array when given several.

## Matrix transform

The transforms above are conveniences over matrix mathematics. `transform()` applies
a 4×4 matrix directly, which is what you want when combining several operations into
one step, or when reusing a matrix across many shapes.

*[Learn about matrix mathematics at MathIsFun.com](http://www.mathsisfun.com/algebra/matrix-introduction.html)*

```js jscad
import { cube, mat4, TAU, transform } from '@jscad/modeling'

export const main = () => {
  let matrix = mat4.create()
  matrix = mat4.multiply(matrix, matrix, mat4.fromXRotation(mat4.create(), TAU / 9))
  matrix = mat4.multiply(matrix, matrix, mat4.fromZRotation(mat4.create(), TAU / 9))
  matrix = mat4.multiply(matrix, matrix, mat4.fromTranslation(mat4.create(), [-5, 0, 0]))
  matrix = mat4.multiply(matrix, matrix, mat4.fromScaling(mat4.create(), [1.1, 1.2, 1.3]))

  return transform(matrix, cube({ size: 10 }))
}
```

:::info[Changed in v3]

The `mat4` constructors follow the `from…` naming used across the maths modules:
`fromXRotation`, `fromYRotation`, `fromZRotation`, `fromTranslation`, `fromScaling`.
Each takes the output matrix as its first argument. Some unused `mat4` functions were
removed in v3.

:::

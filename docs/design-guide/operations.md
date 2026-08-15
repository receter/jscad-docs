---
title: Operations
sidebar_position: 9
---

# Operations

Any shape — a primitive, or the result of an earlier operation — can be passed to an
operation to be combined with others: removing a hole from a board, merging parts
into an assembly, wrapping a set of points in a shell.

As with transforms, operations **return a new shape** and never change their inputs.

```js jscad
import { colorize, cuboid, cylinder, subtract, translate, union } from '@jscad/modeling'

export const main = () => {
  const plate = cuboid({ size: [40, 24, 6] })
  const holes = [-12, 0, 12].map((x) =>
    translate([x, 0, 0], cylinder({ radius: 4, height: 10, segments: 32 }))
  )

  return colorize([0.35, 0.7, 0.9], subtract(plate, union(holes)))
}
```

Operations expect all their inputs to be of the same kind — either all 2D (`geom2`)
or all 3D (`geom3`).

## Union

Combines shapes into one, merging any overlap. Building complex parts out of simple
ones, then using the whole as a single object, is the backbone of most designs.

```
+-------+            +-------+
|       |            |       |
|   A   |            |       |
|    +--+----+   =   |       +----+
+----+--+    |       +----+       |
     |   B   |            |       |
     |       |            |       |
     +-------+            +-------+
```

```js jscad
import { cube, cylinder, union } from '@jscad/modeling'

export const main = () => union(
  cube({ size: 10 }),
  cylinder({ radius: 4, height: 14 })
)
```

## Intersect

Keeps only the space present in *every* given shape.

```
+-------+
|       |
|   A   |
|    +--+----+   =   +--+
+----+--+    |       +--+
     |   B   |
     |       |
     +-------+
```

```js jscad
import { cube, cylinder, intersect } from '@jscad/modeling'

export const main = () => intersect(
  cube({ size: 10 }),
  cylinder({ radius: 4, height: 14 })
)
```

## Subtract

Removes every subsequent shape from the first one. The first shape given is the base
for all the subtractions.

```
+-------+            +-------+
|       |            |       |
|   A   |            |       |
|    +--+----+   =   |    +--+
+----+--+    |       +----+
     |   B   |
     |       |
     +-------+
```

```js jscad
import { cube, cylinder, subtract } from '@jscad/modeling'

export const main = () => subtract(
  cube({ size: 10 }),
  cylinder({ radius: 4, height: 14 })
)
```

:::info[Changed in v3]

2D booleans were rewritten on top of the
[Martinez](https://github.com/w8r/martinez) algorithm, which is faster and handles
tricky overlapping cases more reliably. Operations also accept empty and sparse
lists, and empty geometries, so building an array of parts that may be empty no
longer needs guarding.

:::

## Hull

Wraps the given shapes in their
[convex hull](https://en.m.wikipedia.org/wiki/Convex_hull) — the shape a taut sheet
would make if stretched around all of them. It works on mixed shapes, such as a
circle and a square.

```
+-------+           +-------+
|       |           |        \
|   A   |           |         \
|       |           |          \
+-------+           +           \
                 =   \           \
      +-------+       \           +
      |       |        \          |
      |   B   |         \         |
      |       |          \        |
      +-------+           +-------+
```

```js jscad
import { cuboid, hull, sphere, translate } from '@jscad/modeling'

export const main = () => hull(
  cuboid({ size: [10, 10, 4] }),
  translate([0, 0, 20], sphere({ radius: 3, segments: 32 }))
)
```

Hull accepts `geom2`, `geom3` and `path2` shapes, as long as they are all of the same
kind.

## Hull chain

Hulls each *pair* of shapes in sequence — A+B, B+C, C+D — then unions the results.
This traces a shape along a path of positions, which is how tubes, fillets and
organic-looking connections are usually built.

```
+-------+   +-------+     +-------+   +------+
|       |   |       |     |        \ /       |
|   A   |   |   C   |     |         |        |
|       |   |       |     |                  |
+-------+   +-------+     +                  +
                      =   \                 /
      +-------+            \               /
      |       |             \             /
      |   B   |              \           /
      |       |               \         /
      +-------+                +-------+
```

```js jscad
import { hullChain, sphere, translate } from '@jscad/modeling'

export const main = () => hullChain(
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => translate(
    [i * 6 - 24, Math.sin(i / 2) * 12, 0],
    sphere({ radius: 2 + Math.cos(i / 2) * 1.5, segments: 24 })
  ))
)
```

## Scission

*Scission: "the act of cutting or dividing, as with an edged instrument."*

Splits a shape into its disconnected pieces, returning an array. This is what you
need when a boolean operation has left several separate solids in one geometry, when
making molds from the pieces of a cut, or when taking an imported STL apart.

```
+-------+            +-------+
|       |            |       |
|   +---+            | A +---+
|   |    +---+   =   |   |    +---+
+---+    |   |       +---+    |   |
     +---+   |            +---+   |
     |       |            |    B  |
     +-------+            +-------+
```

```js jscad
import { colorize, cuboid, scission, translate, union } from '@jscad/modeling'

const palette = [[1, 0.3, 0.3], [0.3, 1, 0.4], [0.3, 0.5, 1]]

export const main = () => {
  const separateSolids = union(
    cuboid({ size: [8, 8, 8], center: [-14, 0, 0] }),
    cuboid({ size: [8, 8, 8], center: [0, 0, 0] }),
    cuboid({ size: [8, 8, 8], center: [14, 0, 0] })
  )

  // one geometry in, three pieces out
  const pieces = scission(separateSolids)

  return pieces.map((piece, i) => colorize(palette[i % 3], piece))
}
```

*Note: scission currently supports 3D geometries only.*

## Minkowski sum

Inflates one shape by the form of another: the set of all points `a + b` where `a` is
in the first shape and `b` in the second. Summing a solid with a sphere rounds all of
its edges and corners; summing with a cube chamfers them.

```js jscad
import { cuboid, minkowskiSum, sphere } from '@jscad/modeling'

export const main = () => minkowskiSum(
  cuboid({ size: [16, 16, 16] }),
  sphere({ radius: 3, segments: 16 })
)
```

Convex shapes give the best performance. Non-convex shapes work as long as the second
operand is convex, but require decomposition and are much slower.

:::info[New in v3]

`minkowskiSum()` is new in v3, along with `geom3.isConvex()` for checking whether the
fast path applies.

:::

## Related

- [Transforms](./transforms.md) — position shapes before combining them
- [Extrusions](./extrusions.md) — turn 2D profiles into the solids these operations combine

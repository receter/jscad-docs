---
title: Anatomy of a Design
sidebar_position: 2
---

# Anatomy of a Design

A JSCAD design is an ES module that exports one function, `main`, which returns a
shape.

```js jscad
import { sphere } from '@jscad/modeling'

export const main = () => sphere({ radius: 10 })
```

That is the whole contract. Everything else in this guide is about what you can put
inside `main`.

:::info[Changed in v3]

Designs are ES modules now. The same design in v2 used CommonJS:

```js
// v2
const { sphere } = require('@jscad/modeling').primitives

const main = () => sphere({ radius: 10 })

module.exports = { main }
```

In v3, `import` replaces `require()`, `export` replaces `module.exports`, and
`sphere` comes straight from `@jscad/modeling` rather than from its `primitives`
namespace.

:::

## Returning several shapes

`main` may also return an array of shapes. They are rendered together, and stay
separate objects — useful when a design has several parts, or when parts should keep
different colors.

```js jscad
import { cube, cylinder, sphere, translate } from '@jscad/modeling'

export const main = () => {
  const a = translate([-14, 0, 0], cube({ size: 8 }))
  const b = sphere({ radius: 5 })
  const c = translate([14, 0, 0], cylinder({ radius: 4, height: 10 }))

  return [a, b, c] // an array of shapes
}
```

Arrays may be nested to any depth, so building up a list of parts from several
sources needs no flattening:

```js
export const main = () => [baseplate(), [leftArm(), rightArm()], fasteners()]
```

## Splitting a design into functions

`main` is ordinary JavaScript, so a design can be broken into as many functions as it
needs. Anything that repeats, or that has a name worth giving, is a candidate.

```js jscad
import { cuboid, sphere, translate, union } from '@jscad/modeling'

const wheel = (radius) => sphere({ radius, segments: 32 })

const axle = (length) => cuboid({ size: [length, 3, 3] })

const wheelPair = ({ span, radius }) => union(
  axle(span),
  translate([-span / 2, 0, 0], wheel(radius)),
  translate([span / 2, 0, 0], wheel(radius))
)

export const main = () => [
  translate([0, -8, 0], wheelPair({ span: 24, radius: 5 })),
  translate([0, 8, 0], wheelPair({ span: 24, radius: 5 }))
]
```

Once a design outgrows a single file, move those functions into files of their own —
see [Projects](./projects.md).

## Asynchronous designs

`main` may be `async`. The JSCAD applications await the result before rendering,
which makes it possible to load data or geometry while the design is being built.

```js
export const main = async (params) => {
  const profile = await loadProfile(params.profileName)
  return extrudeLinear({ height: 10 }, profile)
}
```

:::info[New in v3]

v2 required `main` to return synchronously. v3 reworked evaluation in both the CLI
and the web applications to support asynchronous functions.

:::

## Next steps

- [Design Parameters](./parameters.md) — let people change the design without editing it
- [3D Primitives](./3d-primitives.md) — the shapes available to return

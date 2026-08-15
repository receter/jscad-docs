---
title: Design Guide
sidebar_position: 1
slug: /design-guide
---

# Design Guide

Creating a JSCAD design starts by writing a small script that calls functions to
create and manipulate shapes. Designs are written in JavaScript.

*[Find out more about JavaScript at W3Schools](https://www.w3schools.com/js/default.asp)*

The JSCAD applications execute the script, generate shapes, apply transforms, perform
operations, and render the result for viewing.

```js jscad
import { colorize, cylinder, subtract, translate, union } from '@jscad/modeling'

export const main = () => {
  const body = cylinder({ radius: 20, height: 8 })
  const spindle = cylinder({ radius: 4, height: 14 })
  const bolts = [0, 1, 2, 3].map((i) =>
    translate(
      [Math.cos(i * Math.PI / 2) * 13, Math.sin(i * Math.PI / 2) * 13, 0],
      cylinder({ radius: 2, height: 10 })
    )
  )

  return colorize([0.3, 0.6, 0.9], subtract(body, union(spindle, ...bolts)))
}
```

## How the guide is organised

| Page | What it covers |
| --- | --- |
| [Anatomy of a Design](./anatomy.md) | The structure every design shares |
| [Design Parameters](./parameters.md) | Making designs interactive |
| [Projects](./projects.md) | Splitting a design across several files |
| [3D Primitives](./3d-primitives.md) | Cuboids, spheres, cylinders, tori, polyhedra |
| [2D Primitives](./2d-primitives.md) | Rectangles, ellipses, polygons, stars |
| [Transforms](./transforms.md) | Moving, rotating, scaling and aligning shapes |
| [Operations](./operations.md) | Combining shapes with booleans and hulls |
| [Extrusions](./extrusions.md) | Turning 2D shapes into 3D ones |

## Importing the modeling library

In v3 every modeling function is exported directly from `@jscad/modeling`. Import
only what a design uses:

```js
import { cuboid, rotateZ, subtract } from '@jscad/modeling'
```

:::info[Changed in v3]

v2 designs used `require()` and reached into namespaces:

```js
// v2
const { cuboid } = require('@jscad/modeling').primitives
const { subtract } = require('@jscad/modeling').booleans
```

The namespaces still exist in v3 for compatibility, but the flat exports are the
documented way to write new designs.

:::

## Shapes are never modified

Every primitive, transform and operation **returns a new shape** and leaves its
inputs untouched. This is worth internalising early, because it is the single most
common source of confusion:

```js
const myshape = circle({ radius: 5 })
scale([2, 2], myshape) // discarded — myshape is unchanged
```

To keep a result, assign it:

```js
let myshape = circle({ radius: 5 })
myshape = scale([2, 2], myshape)
```

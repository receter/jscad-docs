---
title: Quick Reference
sidebar_position: 2
---

# Quick Reference

Every function in one place, with a working call for each. This page answers "what is
it called and what does it take?" — the [Design Guide](./design-guide/index.md)
explains what each one is for, and the
[API reference](https://openjscad.xyz/docs/) gives full signatures.

Everything comes from a single flat import:

```js
import { cuboid, rotateZ, subtract, translate } from '@jscad/modeling'
```

:::info[Changed in v3]

v2 reached into namespaces — `require('@jscad/modeling').primitives` and friends. In
v3 every function below is exported directly from `@jscad/modeling`. The namespaces
still exist for compatibility, but the flat imports are the documented form.

:::

## [3D primitives](./design-guide/3d-primitives.md)

| Call |
| --- |
| `const myshape = cube({ center: [6.5, 6.5, 6.5], size: 7 })` |
| `const myshape = cuboid({ center: [6.5, 6.5, 6.5], size: [3, 5, 7] })` |
| `const myshape = roundedCuboid({ size: [10, 20, 10], roundRadius: 2, segments: 16 })` |
| `const myshape = sphere({ center: [-5, -5, -5], radius: 5, segments: 32 })` |
| `const myshape = ellipsoid({ radius: [4, 6, 8], segments: 64 })` |
| `const myshape = geodesicSphere({ radius: 15, frequency: 18 })` |
| `const myshape = cylinder({ height: 10, radius: 4, segments: 32 })` |
| `const myshape = cylinderElliptic({ height: 10, startRadius: [1, 2], endRadius: [2, 1], segments: 32 })` |
| `const myshape = roundedCylinder({ height: 10, radius: 2, roundRadius: 0.5, segments: 16 })` |
| `const myshape = torus({ innerRadius: 10, outerRadius: 100, innerSegments: 32, outerSegments: 8 })` |
| `const myshape = polyhedron({ points: mypoints, faces: myfaces, orientation: 'inward' })` |

## [2D primitives](./design-guide/2d-primitives.md)

| Call |
| --- |
| `const myshape = square({ center: [6.5, 6.5], size: 10 })` |
| `const myshape = rectangle({ center: [6.5, 6.5], size: [10, 20] })` |
| `const myshape = roundedRectangle({ size: [10, 20], roundRadius: 2, segments: 64 })` |
| `const myshape = circle({ radius: 3.5, startAngle: TAU / 4, endAngle: TAU / 2, segments: 64 })` |
| `const myshape = ellipse({ radius: [7, 9], startAngle: TAU / 4, endAngle: TAU / 2, segments: 64 })` |
| `const myshape = polygon({ points: [[10, 11], [0, 11], [5, 20]] })` |
| `const myshape = star({ vertices: 8, outerRadius: 10 })` |
| `const myshape = triangle({ type: 'AAS', values: [degToRad(62), degToRad(35), 7] })` |

## [Paths](./design-guide/paths-and-text.md)

| Call |
| --- |
| `const mypath = line([[10, 10], [-10, 10]])` |
| `const mypath = arc({ center: [2, 2], radius: 2, startAngle: TAU / 2, endAngle: TAU, segments: 64 })` |
| `const mypath = path2.fromPoints({ closed: true }, [[0, 0], [12, 0], [6, 10]])` |
| `const mypath = path2.appendPoints([[-27, 22], [-27, -27]], oldpath)` |
| `const mypath = path2.appendArc({ endpoint: [12.5, -22.9], radius: [15, -19.7] }, oldpath)` |
| `const mypath = path2.appendBezier({ controlPoints: [[10, -10], [25, -10], [25, -20]] }, oldpath)` |
| `const mypath = path2.concat(pathA, pathB)` |
| `const mypath = path2.close(oldpath)` |
| `const mypoints = path2.toPoints(mypath)` |

## [Text](./design-guide/paths-and-text.md#text)

| Call |
| --- |
| `const mychar = vectorChar({ height: 18 }, '!')` |
| `const mylines = vectorText({ height: 18, align: 'right' }, 'line1\nline2')` |

:::warning[Changed in v3]

Options are no longer optional — `vectorChar('H')` throws. The `input` option is
gone; pass the text as the second argument. `vectorChar` now returns `paths`
(path2 objects) rather than raw `segments`, and `vectorText` returns one entry per
line, each holding `chars`. See [Text](./design-guide/paths-and-text.md#text).

:::

## [Transforms](./design-guide/transforms.md)

| Call |
| --- |
| `const newshape = translate([5, 0, 10], oldshape)` |
| `const newshape = translateX(5, oldshape)` |
| `const newshape = translateY(0.5, oldshape)` |
| `const newshape = translateZ(5, oldshape)` |
| `const newshape = rotate([TAU / 8, 0, 0], oldshape)` |
| `const newshape = rotateX(TAU / 8, oldshape)` |
| `const newshape = rotateY(TAU / 8, oldshape)` |
| `const newshape = rotateZ(TAU / 8, oldshape)` |
| `const newshape = scale([5, 1, 10], oldshape)` |
| `const newshape = scaleX(5, oldshape)` |
| `const newshape = scaleY(0.5, oldshape)` |
| `const newshape = scaleZ(5, oldshape)` |
| `const newshape = mirror({ origin: [5, 5, 5], normal: [0, 0, 1] }, oldshape)` |
| `const newshape = mirrorX(oldshape)` |
| `const newshape = mirrorY(oldshape)` |
| `const newshape = mirrorZ(oldshape)` |
| `const newshape = center({ axes: [true, true, false], relativeTo: [15, 10, 0] }, oldshape)` |
| `const newshape = centerX(oldshape)` |
| `const newshape = centerY(oldshape)` |
| `const newshape = centerZ(oldshape)` |
| `const newshapes = align({ modes: ['min', 'center', 'none'], relativeTo: [10, null, 10], grouped: true }, shapeA, shapeB)` |
| `const newshape = transform(mat4.fromXRotation(mat4.create(), TAU / 8), oldshape)` |

*Note: the single-axis rotations take the angle first — `rotateX(angle, shape)`.
Angles are always in radians.*

*Note: `center()` positions relative to `relativeTo`. The v2 user guide called that
option `center`, which never worked in either version.*

## [Operations](./design-guide/operations.md)

| Call |
| --- |
| `const newshape = union(shapeA, shapeB)` |
| `const newshape = subtract(shapeA, shapeB)` |
| `const newshape = intersect(shapeA, shapeB)` |
| `const newshapes = scission(bigshape)` |
| `const newshape = hull(shapeA, shapeB)` |
| `const newshape = hullChain(shapeA, shapeB, shapeC)` |
| `const newshape = minkowskiSum(shapeA, shapeB)` |

## [Extrusions](./design-guide/extrusions.md)

| Call |
| --- |
| `const newshape = extrudeLinear({ height: 20, twistAngle: TAU / 2, twistSteps: 20 }, oldshape)` |
| `const newshape = extrudeRotate({ startAngle: 0, angle: TAU / 2, segments: 64 }, oldshape)` |
| `const newshape = extrudeHelical({ angle: TAU * 3, pitch: 10, segmentsPerRotation: 64 }, oldshape)` |
| `const newshape = extrudeFromSlices({ numberOfSlices: 10, callback: mycallback }, oldshape)` |
| `const newshape = project({ axis: [0, 0, 1], origin: [0, 0, 0] }, oldshape)` |

:::warning[Removed in v3]

`extrudeRectangular()` no longer exists. Offset the shape first, then extrude — see
[what happened to extrudeRectangular](./design-guide/extrusions.md#what-happened-to-extruderectangular).

:::

## [Offsets](./design-guide/offsets.md)

| Call |
| --- |
| `const newshape = offset({ delta: 2, corners: 'round', segments: 64 }, oldshape)` |
| `const newshape = offset({ delta: -4, corners: 'chamfer' }, oldshape)` |
| `const newpoints = offsetFromPoints({ delta: 4, corners: 'round', closed: true }, mypoints)` |

:::warning[Changed in v3]

`expand()` and `offset()` are now one function. Replace `expand(...)` with
`offset(...)` — the options are the same.

:::

## [Colors](./design-guide/colors.md)

| Call |
| --- |
| `const newshape = colorize([1, 0, 0], oldshape)` |
| `const newshape = colorize([1, 0, 0, 0.6], oldshape)` |
| `const newshape = colorize(colorNameToRgb('lightblue'), oldshape)` |
| `const newshape = colorize(cssColors.fuchsia, oldshape)` |
| `const newshape = colorize(hexToRgb('#000080'), oldshape)` |
| `const newshape = colorize(hslToRgb([0.9166, 1, 0.5]), oldshape)` |
| `const newshape = colorize(hsvToRgb([0.9166, 1, 1]), oldshape)` |
| `const myhex = rgbToHex([0, 0, 0.5])` |
| `const myhsl = rgbToHsl([1, 0, 1])` |
| `const myhsv = rgbToHsv([1, 0, 1])` |

## [Measurements](./design-guide/measurements.md)

| Call |
| --- |
| `const myarea = measureArea(myshape)` |
| `const mybounds = measureBoundingBox(myshape)` |
| `const [mycenter, myradius] = measureBoundingSphere(myshape)` |
| `const mycenter = measureCenter(myshape)` |
| `const mycenter = measureCenterOfMass(myshape)` |
| `const mydimensions = measureDimensions(myshape)` |
| `const myepsilon = measureEpsilon(myshape)` |
| `const myvolume = measureVolume(myshape)` |
| `const total = measureAggregateArea(shapeA, shapeB)` |
| `const total = measureAggregateBoundingBox(shapeA, shapeB)` |
| `const total = measureAggregateEpsilon(shapeA, shapeB)` |
| `const total = measureAggregateVolume(shapeA, shapeB)` |

## [Maths and utilities](./math-guide.md)

| Call |
| --- |
| `const myradians = degToRad(90)` |
| `const mydegrees = radToDeg(Math.PI)` |
| `const mysegments = radiusToSegments(3.5, 0.1, 0)` |
| `const myflat = flatten(nestedArray)` |
| `const myparts = coalesce([partA, [partB, null], undefined])` — flatten and drop nullish |
| `TAU` — a full turn in radians |
| `EPS`, `NEPS` — default tolerances |

## Modifiers

Mesh clean-up, mostly needed after importing external geometry.

| Call |
| --- |
| `const newshape = snap(myshape)` |
| `const newshape = retessellate(myshape)` |
| `const newshape = generalize({ snap: true, simplify: true, triangulate: false }, myshape)` |

## Design structure

| Call |
| --- |
| `export const main = (params) => myshape` |
| `export const getParameterDefinitions = () => [{ name: 'size', type: 'int', initial: 10 }]` |

See [Anatomy of a Design](./design-guide/anatomy.md) and
[Design Parameters](./design-guide/parameters.md).

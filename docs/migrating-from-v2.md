---
title: Migrating from v2
sidebar_position: 7
---

# Migrating from v2

Everything that changed between JSCAD v2 and v3, in one place. Each entry links to
the page that explains it properly.

Work through it roughly in order: the module format has to change before anything
else compiles, and the renamed functions are easier to spot once it does.

## 1. Modules and imports

Designs are ES modules, and the whole API is a single flat set of exports.

```js
// v2
const { cuboid } = require('@jscad/modeling').primitives
const { subtract } = require('@jscad/modeling').booleans

const main = () => subtract(cuboid({ size: [10, 10, 10] }), cuboid({ size: [5, 5, 20] }))

module.exports = { main }
```

```js
// v3
import { cuboid, subtract } from '@jscad/modeling'

export const main = () => subtract(cuboid({ size: [10, 10, 10] }), cuboid({ size: [5, 5, 20] }))
```

The old namespaces (`primitives`, `booleans`, `transforms` …) still exist for
compatibility, so a v2-style `require` may keep working — but flat imports are the
documented form and the namespaces are not guaranteed to stay.

In a [project](./design-guide/projects.md), relative imports need the file extension,
and the project's `package.json` needs `"type": "module"`:

```js
import { tire } from './tire.js'   // not './tire'
```

See [Anatomy of a Design](./design-guide/anatomy.md).

## 2. Renamed and removed functions

| v2 | v3 | Notes |
| --- | --- | --- |
| `expand({delta, corners}, shape)` | `offset({delta, corners}, shape)` | One function now; `offset()` also handles 3D. [Offsets](./design-guide/offsets.md) |
| `extrudeRectangular({size, height}, shape)` | *removed* | Offset, then extrude. [Extrusions](./design-guide/extrusions.md#what-happened-to-extruderectangular) |
| `expansions.expand` | `offsets.offset` | The namespace was renamed too |
| `poly3.fromPoints(points)` | `poly3.create([points])` | `create` and `fromPoints` unified |
| `poly3.fromPointsAndPlane` | `poly3.fromVerticesAndPlane` | |
| `poly3.toPoints` | `poly3.toVertices` | |
| `geom2.create(sides)` | `geom2.create(outlines)` | Takes outlines now; `geom2.fromSides()` for the old form |
| `geom3.fromPoints` / `toPoints` | `geom3.fromVertices` / `toVertices` | |
| `geom3.fromPointsConvex` | `geom3.fromVerticesConvex` | |
| `poly2.flip` | `poly2.reverse` | |
| `slice.fromGeom2(shape)` | `slice.fromOutlines(geom2.toOutlines(shape))` | [Curves and Slices](./design-guide/curves-and-slices.md#slices) |
| `to/fromCompactBinary` | *removed* | Gone from `geom2`, `geom3` and `path2` |

The `mat4` API is unchanged between v2 and v3 — every function, same names.

:::warning[`extrudeRectangular` is not a straight swap]

The v2 compatibility shim defines it as `extrudeLinear(options, offset(options, geometry))`.
That matches v2 for **paths**, but for a closed 2D shape it grows the shape instead of
outlining it. Write the intent out explicitly rather than relying on the shim — see
[Extrusions](./design-guide/extrusions.md#what-happened-to-extruderectangular).

:::

## 3. Text

The biggest behavioural change, and the one most likely to break silently.

```js
// v2
const outlines = vectorChar('H')
const paths = outlines.segments.map((s) => path2.fromPoints({ close: false }, s))
```

```js
// v3
const paths = vectorChar({}, 'H').paths
```

Three separate changes:

- **Options are mandatory.** `vectorChar('H')` throws *"text must be a single
  character"*. Pass `{}` if you have no options.
- **You get path2 objects.** v2 returned `{ segments }` of bare point arrays that
  every design converted by hand. v3 returns `paths`, already built — delete the
  conversion step.
- **`vectorText()` returns a nested structure**: an array of lines, each
  `{ width, height, chars }`, each character `{ width, height, paths }`. v2 returned
  one flat array.

```js
// v3: reaching the paths of a whole string
const paths = vectorText({ height: 20 }, 'JSCAD')
  .flatMap((line) => line.chars)
  .flatMap((char) => char.paths)
```

The `input` option is gone — pass the text as the second argument.

One default really moved: `letterSpacing` went from `1` to `0`, so v2 text renders
tighter unless you set it. `height` (14) and `lineSpacing` (30/14) are unchanged —
the v2 guide listed them as 21 and 1.4, which never matched the library.

See [Paths and Text](./design-guide/paths-and-text.md#text).

## 4. Options the old guide got wrong

These are **not** v3 changes — the v2 library always behaved this way. They are listed
because the v2 user guide documented them incorrectly, so code copied from it fails
in both versions.

| Where | The old guide said | The API actually takes |
| --- | --- | --- |
| `path2.fromPoints` | `close: true` | `closed: true` |
| `center` | `center: [x, y, z]` | `relativeTo: [x, y, z]` |
| `align` | `alignTo: [x, y, z]` | `relativeTo: [x, y, z]` |
| `mat4` constructors | `mat4.rotationX(a)` | `mat4.fromXRotation(out, a)` |
| `rotateX` etc. | `rotateX(shape)` | `rotateX(angle, shape)` |
| `vectorText` | `{ input: 'text' }` | text as the second argument |

`path2.fromPoints({ close: true }, …)` is the nastiest: an unknown option is ignored
rather than rejected, so the path silently stays open and the failure only surfaces
later as a hollow extrusion.

Separately, genuinely non-camelCase parameter names *were* corrected across the v3
API, so check any option that was previously spelled unusually.

## 5. Geometry data structures

Only relevant if your design reaches inside a geometry rather than using the API.

| Geometry | v2 | v3 |
| --- | --- | --- |
| `geom2` | `{ sides: [[vec2, vec2], …] }` | `{ outlines: [[vec2, …], …] }` |
| `poly2` | `{ vertices: […] }` | `{ points: […] }` |
| `slice` | `{ edges: […] }` | `{ contours: […] }` |
| `geom3` | `{ polygons: [poly3, …] }` | unchanged |
| `path2` | `{ points: […], isClosed }` | unchanged |

`poly2` was enhanced from a bare container into a complete geometry, gaining `clone`,
`isA`, `isConvex`, `isSimple`, `measureBoundingBox`, `reverse`, `toPoints`,
`toString`, `transform` and `validate`.

`slice` is new as a public geometry, and `path3` is new entirely — see
[Curves and Slices](./design-guide/curves-and-slices.md).

## 6. Importing external files

v2 let a design `require()` an STL and handled the conversion invisibly. v3 does not
support importing non-standard file types, so designs read the file and deserialize
it themselves:

```js
import fs from 'fs'
import { deserialize } from '@jscad/io'

const content = fs.readFileSync('./bracket.stl')
const shape = deserialize({ output: 'geometry' }, 'model/stl', content.buffer)
```

**AMF support was removed** — convert AMF files with v2 or another tool first. GCODE
was dropped as well. **3MF is new**, both in and out.

See [File Formats](./file-formats.md) and
[Projects](./design-guide/projects.md#including-external-geometry).

:::info[There is no `use()` function]

The [V3 wiki page](https://github.com/jscad/OpenJSCAD.org/wiki/JSCAD-V3) describes a
`use()` for loading external files. It was never shipped — `deserialize()` is the way.

:::

## 7. Behaviour that changed without an API change

These compile fine and produce different results, so they are worth checking
explicitly:

- **2D booleans were rewritten** on the
  [Martinez](https://github.com/w8r/martinez) algorithm — faster, and more reliable
  on tricky overlaps. Results may differ slightly from v2 at the edges.
- **Mirroring a 2D shape was fixed.** v2 produced an incorrectly wound `geom2`; if a
  design compensated for that, remove the workaround.
  [Transforms](./design-guide/transforms.md#mirror)
- **Colour is preserved** through `offset()` and the extrusions. If a design
  reapplied colour afterwards, it no longer needs to.
- **Empty and sparse lists are accepted** by all operations, as are empty
  geometries — guards around possibly-empty parts lists can go.
- **`ellipsoid` keeps its `axes` option.** The wiki says it was removed; it was not.

## 8. What is new

Nothing here needs migrating, but these are the reasons to move:

| Feature | Where |
| --- | --- |
| `extrudeHelical()` — threads, springs, coils | [Extrusions](./design-guide/extrusions.md#helical-extrude) |
| `minkowskiSum()` — round or chamfer every edge at once | [Operations](./design-guide/operations.md#minkowski-sum) |
| `offset()` on 3D geometry | [Offsets](./design-guide/offsets.md#offsetting-3d-shapes) |
| Asynchronous `main()` | [Anatomy](./design-guide/anatomy.md#asynchronous-designs) |
| `path3` — 3D paths | [Curves and Slices](./design-guide/curves-and-slices.md#3d-paths) |
| `geom3.isConvex()`, `geom3.fromVerticesConvex()` | — |
| `snap()`, `retessellate()`, `generalize()` — mesh clean-up | [Quick Reference](./quick-reference.md#modifiers) |

## Known rough edges in the alpha

v3 is published as an alpha, and a few things do not yet match their documentation:

- **The TypeScript definitions are stale.** `@jscad/modeling`'s `index.d.ts` still
  describes the v2 namespaced API, and its `package.json` "exports" has no `types`
  condition, so TypeScript cannot resolve it at all. Expect to declare what you use.
- **`connectors` is not exported.** The source is in the package; the module is not
  reachable from `@jscad/modeling`.
- **`path3` has no consumers.** It does not render, and `offset()`, `extrudeLinear()`
  and `hull()` return it unchanged instead of erroring.
- **`cylinder({ start, end })` is silently ignored.** Examples in the repository use
  it; `cylinder` reads only `center`, `height`, `radius` and `segments`.
- **Some repository examples are stale**, notably `slice.fromGeom2`.

## Getting help

If something here is wrong or incomplete, the
[JSCAD user group](https://openjscad.xyz/forum.html) and
[Discord](https://openjscad.xyz/discord.html) are the fastest routes to an answer —
and [corrections to this page](./contribute.md) are welcome.

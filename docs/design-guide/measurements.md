---
title: Measurements
sidebar_position: 13
---

# Measurements

Measuring a shape is often the easiest way to position the next one. Rather than
hard-coding where a part ends, ask it — then the design keeps working when a
parameter changes. Measurements are especially useful for shapes imported from
external formats, whose dimensions you do not control.

```js jscad
import {
  colorize, cuboid, measureBoundingBox, rotate, subtract, translate
} from '@jscad/modeling'

// Draw the bounding box of whatever it is given, as a wireframe cage.
const cage = (bounds) => {
  const [[left, front, bottom], [right, back, top]] = bounds
  const size = [right - left, back - front, top - bottom]
  const center = [(left + right) / 2, (front + back) / 2, (bottom + top) / 2]
  const t = 0.6

  return colorize([0.85, 0.2, 0.2], subtract(
    cuboid({ size, center }),
    cuboid({ size: [size[0] + t, size[1] - t, size[2] - t], center }),
    cuboid({ size: [size[0] - t, size[1] + t, size[2] - t], center }),
    cuboid({ size: [size[0] - t, size[1] - t, size[2] + t], center })
  ))
}

export const main = () => {
  const shape = rotate([0.4, 0.2, 0.3], cuboid({ size: [8, 45, 4] }))

  return [shape, cage(measureBoundingBox(shape))]
}
```

Every measurement function also has an **aggregate** form, which measures several
geometries together and takes them as separate arguments:

```js
measureVolume(partA)                    // one shape
measureAggregateVolume(partA, partB)    // both together
```

*Note: aggregate measurements do not account for overlap. Two shapes that intersect
have their volumes summed twice in the overlapping region. Union them first if that
matters.*

## Bounding box

Returns the minimum and maximum corners as `[[minX, minY, minZ], [maxX, maxY, maxZ]]`.

```js
const bounds = measureBoundingBox(sphere({ radius: 5 }))
// [[-5, -5, -5], [5, 5, 5]]
```

Read positionally, the two points are
`[[left, front, bottom], [right, back, top]]` — which is usually how you want them
when placing a neighbouring part.

`measureAggregateBoundingBox()` returns the single box enclosing everything given:

```js jscad
import { cuboid, measureAggregateBoundingBox, sphere, translate } from '@jscad/modeling'

export const main = () => {
  const parts = [
    translate([-14, 0, 0], sphere({ radius: 6 })),
    translate([12, 4, 3], cuboid({ size: [10, 8, 14] }))
  ]

  const [min, max] = measureAggregateBoundingBox(...parts)
  const size = max.map((v, i) => v - min[i])
  const center = max.map((v, i) => (v + min[i]) / 2)

  // a base plate sized to whatever the parts happen to occupy
  const plate = translate(
    [center[0], center[1], min[2] - 2],
    cuboid({ size: [size[0] + 6, size[1] + 6, 2] })
  )

  return [...parts, plate]
}
```

## Dimensions

The width, depth and height of a shape — the size of its bounding box, without the
position.

```js
const dimensions = measureDimensions(sphere({ radius: 5 }))
// [10, 10, 10]
```

## Center

The midpoint of the bounding box.

```js
const center = measureCenter(sphere({ radius: 5 }))
// [0, 0, 0]
```

This is a purely geometric center, and takes no account of where the material
actually is.

## Center of mass

Where the shape would balance, assuming uniform density.

```js
const center = measureCenterOfMass(sphere({ radius: 5 }))
```

For a symmetrical shape this matches `measureCenter()`. For anything asymmetrical it
does not, and the difference is the point:

```js jscad
import {
  colorize, cuboid, cylinder, measureCenter, measureCenterOfMass, sphere, translate, union
} from '@jscad/modeling'

export const main = () => {
  // A deliberately lopsided part: a long light arm with a heavy block at one end.
  const part = union(
    cuboid({ size: [40, 6, 6] }),
    translate([16, 0, 0], cuboid({ size: [14, 16, 16] }))
  )

  const marker = (color, at) => colorize(color, translate(at, sphere({ radius: 2.2, segments: 24 })))

  return [
    colorize([0.6, 0.68, 0.75], part),
    marker([0.2, 0.5, 1], measureCenter(part)),          // bounding-box center
    marker([1, 0.3, 0.2], measureCenterOfMass(part))     // where it balances
  ]
}
```

*Note: the center of mass of a path is always zero, since paths have no volume.*

## Volume

```js
const volume = measureVolume(sphere({ radius: 5 }))
```

*Note: the volume of a 2D shape is always zero.*

`measureAggregateVolume()` sums several shapes — handy for estimating material use:

```js jscad
import { cuboid, cylinder, measureAggregateVolume, subtract, translate } from '@jscad/modeling'

export const getParameterDefinitions = () => [
  { name: 'holes', type: 'int', initial: 3, min: 0, max: 6, caption: 'Holes' }
]

export const main = (params) => {
  const plate = cuboid({ size: [50, 20, 6] })
  const holes = Array.from({ length: params.holes }, (_, i) => translate(
    [i * 12 - (params.holes - 1) * 6, 0, 0],
    cylinder({ radius: 3, height: 10, segments: 32 })
  ))

  const drilled = subtract(plate, ...holes)

  // How much material the drilling removed, to two decimal places.
  const removed = measureAggregateVolume(plate) - measureAggregateVolume(drilled)
  console.log(`removed ${removed.toFixed(2)} cubic units`)

  return drilled
}
```

## Area

Works on both 2D and 3D shapes: for a 2D shape it is the enclosed area, for a 3D
shape the total surface area.

```js
const area = measureArea(sphere({ radius: 5 }))
```

*Note: the area of a path is always zero, as paths are infinitely thin.*

## Bounding sphere

The approximate sphere enclosing a shape, as `[center, radius]`.

```js
const [center, radius] = measureBoundingSphere(cube({ size: 4 }))
// [[0, 0, 0], 3.46...]
```

Useful for a quick "could these two possibly touch?" test before doing the expensive
boolean.

## Epsilon

The epsilon of a shape — the tolerance below which two points are treated as the same
one. Various internal operations use it to decide minimum distances between points
and planes.

```js
const epsilon = measureEpsilon(sphere({ radius: 5 }))
```

It scales with the size of the geometry, so a large model has a larger epsilon than a
small one. `measureAggregateEpsilon()` gives the combined epsilon for several
geometries, which is what you want before comparing shapes of different sizes.

## All of them

| Function | Returns | 2D | 3D |
| --- | --- | :-: | :-: |
| `measureArea` | number | ● | ● |
| `measureBoundingBox` | `[[min], [max]]` | ● | ● |
| `measureBoundingSphere` | `[center, radius]` | ● | ● |
| `measureCenter` | `[x, y, z]` | ● | ● |
| `measureCenterOfMass` | `[x, y, z]` | ● | ● |
| `measureDimensions` | `[w, d, h]` | ● | ● |
| `measureEpsilon` | number | ● | ● |
| `measureVolume` | number | 0 | ● |
| `measureAggregateArea` | number | ● | ● |
| `measureAggregateBoundingBox` | `[[min], [max]]` | ● | ● |
| `measureAggregateEpsilon` | number | ● | ● |
| `measureAggregateVolume` | number | 0 | ● |

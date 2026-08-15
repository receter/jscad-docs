---
title: Projects
sidebar_position: 4
---

# Projects

As a design grows, the need for smaller, reusable parts becomes obvious. That is the
point at which to reach for a *project*.

A project is a directory containing several files, each holding part of the design.
A design for an RC car, for instance, has parts worth separating:

```
rc-car/
  package.json
  index.js
  chassis.js
  body.js
  tire.js
```

## The entry point

`index.js` is the entry point. Its `main` function creates each of the pieces, moves
them into position, and returns the complete design.

```js
import { chassis } from './chassis.js'
import { body } from './body.js'
import { tire } from './tire.js'
import { translate } from '@jscad/modeling'

export const main = (params) => {
  const wheelbase = params.wheelbase

  const tires = [
    [-wheelbase / 2, -20],
    [-wheelbase / 2, 20],
    [wheelbase / 2, -20],
    [wheelbase / 2, 20]
  ].map(([x, y]) => translate([x, y, 0], tire(params)))

  return [chassis(params), body(params), tires]
}
```

Each part file exports the function that builds it:

```js
// tire.js
import { subtract, cylinder } from '@jscad/modeling'

export const tire = ({ tireRadius = 12, tireWidth = 8 }) => subtract(
  cylinder({ radius: tireRadius, height: tireWidth }),
  cylinder({ radius: tireRadius * 0.5, height: tireWidth + 1 })
)
```

:::info[Changed in v3]

Parts are imported as ES modules, and paths include the file extension:

```js
// v3
import { tire } from './tire.js'

// v2
const tire = require('./tire')
```

Note the `.js` — ES modules do not resolve extensions the way CommonJS did.

:::

## Declaring the project a module

Add a `package.json` next to `index.js` with `"type": "module"`, so that the files
are treated as ES modules:

```json
{
  "name": "rc-car",
  "version": "0.0.1",
  "description": "A parametric RC car",
  "main": "index.js",
  "type": "module",
  "license": "MIT"
}
```

The `main` field names the entry point. Drag the whole folder onto a JSCAD instance,
or point the CLI at it, and the project is loaded as one design.

## Parameters across files

Parts can declare their own parameters, and the entry point can gather them up. This
keeps each part responsible for its own inputs.

```js
// mountPlate.js
import { cuboid } from '@jscad/modeling'

export const getParameterDefinitions = () => [
  { name: 'plate-group', type: 'group', initial: 'open', caption: 'Mounting Plate' },
  { name: 'plateLength', type: 'float', initial: 25, caption: 'length', min: 25, max: 200 }
]

export const create = (length) => cuboid({ size: [length, 10, 1] })
```

```js
// index.js
import * as mountPlate from './mountPlate.js'
import { sphereShape } from './subFolder/sphereShape.js'

export const getParameterDefinitions = () => {
  const globalParams = [
    { name: 'showPlate', type: 'checkbox', checked: true, caption: 'Show plate:' },
    { name: 'showSphere', type: 'checkbox', checked: true, caption: 'Show sphere:' }
  ]

  // Load the parameters defined in the mountPlate sub-file,
  // and add them to the project parameters.
  globalParams.push(...mountPlate.getParameterDefinitions())
  return globalParams
}

export const main = (params) => {
  let results = []
  results = params.showPlate ? results.concat(mountPlate.create(params.plateLength)) : results
  results = params.showSphere ? results.concat(sphereShape(3)) : results
  return results
}
```

Sub-folders work exactly as you would expect — `./subFolder/sphereShape.js` above is
an ordinary relative import.

## Including external geometry

Projects can also hold external formats such as STL. Place the file in the project
directory alongside the other parts:

```
rc-car/
  package.json
  index.js
  chassis.js
  body.js
  tire.js
  rc_receiver.stl
```

Reading the file and turning it into geometry is now an explicit step, using
`deserialize()` from [`@jscad/io`](https://www.npmjs.com/package/@jscad/io):

```js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { translate } from '@jscad/modeling'
import { deserialize } from '@jscad/io'

import { chassis } from './chassis.js'

const loadStl = (filepath) => {
  let fullpath = filepath
  if (!path.isAbsolute(fullpath)) {
    const dirname = path.dirname(fileURLToPath(import.meta.url))
    fullpath = path.join(dirname, filepath)
  }

  const results = fs.readFileSync(fullpath)
  const content = results.buffer
    ? results.buffer.slice(results.byteOffset, results.byteOffset + results.length)
    : results

  return deserialize({ output: 'geometry' }, 'model/stl', content)
}

const receiver = loadStl('./rc_receiver.stl')

export const main = (params) => [chassis(params), translate([0, 0, 12], receiver)]
```

:::warning[Changed in v3]

v2 let a design `require('./rc_receiver.stl')` directly and handled the conversion
behind the scenes. v3 does not: importing non-standard file types is no longer
possible, so designs read the file themselves and call `deserialize()`.

`deserialize()` takes the MIME type of the format — `model/stl` above — and returns
geometry when called with `{ output: 'geometry' }`.

:::

Once loaded, an imported mesh behaves like any other shape: transform it, subtract
from it, or split it apart with
[`scission()`](./operations.md#scission).

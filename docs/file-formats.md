---
title: File Formats
sidebar_position: 4
---

# File Formats

JSCAD reads and writes a range of 2D and 3D formats. Import turns a file into
geometry your design can use; export turns the design's output into a file another
tool can open.

| Format | Extension | Import | Export | Notes |
| --- | --- | :-: | :-: | --- |
| [JSCAD](https://openjscad.xyz) | `.jscad`, `.js` | — | ● | JSCAD design source, for 2D and 3D models |
| [STL](https://en.wikipedia.org/wiki/STL_(file_format)) | `.stl` | ● | ● | Surface geometry of 3D objects. Binary by default; `.stla` forces ASCII, `.stlb` binary |
| [3MF](https://en.wikipedia.org/wiki/3D_Manufacturing_Format) | `.3mf` | ● | ● | 3D Manufacturing Format, the modern replacement for STL |
| [OBJ](https://en.wikipedia.org/wiki/Wavefront_.obj_file) | `.obj` | ● | ● | Wavefront geometry |
| [DXF](https://www.autodesk.com/techpubs/autocad/acadr14/dxf/) | `.dxf` | ● | ● | AutoCAD Drawing Interchange, 2D and 3D |
| [SVG](https://www.w3.org/TR/SVG/) | `.svg` | ● | ● | Scalable Vector Graphics, 2D only |
| [X3D](http://www.web3d.org/x3d/what-x3d) | `.x3d` | ● | ● | Web3D format for 3D objects |
| [JSON](https://www.json.org/json-en.html) | `.json` | ● | ● | JSCAD's own geometry, serialised |

*Note: JSCAD designs are JavaScript, so a file saved with the ordinary `.js`
extension is loaded as a design.*

:::warning[Changed in v3]

- **AMF support was removed.** v2 could read and write `.amf`; v3 cannot. Convert
  existing AMF files with v2 or another tool before bringing them into a v3 project.
- **3MF is new**, both in and out. It carries colour and units, which STL does not,
  and is the better choice for anything headed to a printer that supports it.
- **GCODE was dropped** from the IO packages entirely.

:::

## Importing

Reading a file is an explicit step in v3. `deserialize()` from
[`@jscad/io`](https://www.npmjs.com/package/@jscad/io) takes the format's MIME type
and the file contents, and returns geometry:

```js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { deserialize } from '@jscad/io'

const loadStl = (filepath) => {
  const dirname = path.dirname(fileURLToPath(import.meta.url))
  const results = fs.readFileSync(path.join(dirname, filepath))
  const content = results.buffer
    ? results.buffer.slice(results.byteOffset, results.byteOffset + results.length)
    : results

  return deserialize({ output: 'geometry' }, 'model/stl', content)
}

export const main = () => loadStl('./bracket.stl')
```

Once loaded, imported geometry behaves like anything else — transform it, subtract
from it, or split it with [`scission()`](./design-guide/operations.md#scission). See
[Projects](./design-guide/projects.md#including-external-geometry) for how to lay the
files out.

:::warning[Changed in v3]

v2 let a design `require('./bracket.stl')` and handled the conversion invisibly. v3
does not support importing non-standard file types, so designs read the file and call
`deserialize()` themselves.

:::

## MIME types

`deserialize()` and `serialize()` are keyed by MIME type rather than by extension:

| Format | MIME type |
| --- | --- |
| STL | `model/stl` |
| 3MF | `model/3mf` |
| OBJ | `model/obj` |
| DXF | `image/vnd.dxf` |
| SVG | `image/svg+xml` |
| X3D | `model/x3d+xml` |
| JSON | `application/json` |
| JSCAD | `application/javascript` |

`@jscad/io` also exports `getMimeType()`, plus `supportedInputExtensions()` and
`supportedOutputExtensions()` if you need to check what a given build supports at
runtime.

## Exporting

Exporting is the mirror image — `serialize()` turns geometry into file contents:

```js
import fs from 'fs'
import { serialize } from '@jscad/io'

const data = serialize({ formatName: 'stlb' }, myshape)
fs.writeFileSync('./bracket.stl', Buffer.from(data[0]))
```

From the website and the command line utility this happens for you: pick a format and
JSCAD writes the file.

## Which format to choose

- **3D printing** — 3MF if your slicer takes it, since it carries colour and units.
  STL otherwise; it is universal but dimensionless and colourless.
- **Laser cutting or CNC** — DXF or SVG, both 2D. Remember that a
  [path](./design-guide/paths-and-text.md) exports as a line, while a 2D shape
  exports as a closed outline.
- **Handing geometry to another 3D tool** — OBJ or X3D.
- **Round-tripping within JSCAD** — JSON, which preserves JSCAD's own geometry
  exactly.

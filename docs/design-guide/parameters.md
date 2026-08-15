---
title: Design Parameters
sidebar_position: 3
---

# Design Parameters

A design becomes interactive by exporting a second function,
`getParameterDefinitions()`. The JSCAD applications turn what it returns into a form,
and pass the values the reader chooses into `main`.

```js jscad
import { cuboid, subtract, translate } from '@jscad/modeling'

export const getParameterDefinitions = () => [
  { name: 'length', type: 'int', initial: 60, caption: 'Length' },
  { name: 'width', type: 'int', initial: 40, caption: 'Width' },
  { name: 'holeRadius', type: 'float', initial: 6, step: 0.5, caption: 'Hole radius' }
]

export const main = (params) => subtract(
  cuboid({ size: [params.length, params.width, 6] }),
  translate(
    [0, 0, 0],
    cuboid({ size: [params.holeRadius * 2, params.holeRadius * 2, 10] })
  )
)
```

The examples on this site render with each parameter's initial value. In the JSCAD
applications the same design gains a panel of inputs.

## Declaring parameters

`getParameterDefinitions()` returns an array of objects. Each one needs at least a
`name` and a `type`; `caption` is the label shown to the reader.

```js
export const getParameterDefinitions = () => [
  { name: 'length', type: 'int', initial: 150, caption: 'Length?' },
  { name: 'width', type: 'int', initial: 100, caption: 'Width?' }
]
```

The values arrive as a single object, keyed by `name`:

```js
export const main = (params) => {
  const length = params.length
  const width = params.width
  // ...
}
```

## Parameter types

Parameters are rendered as fields on an HTML form, so the available types follow
[HTML input types](https://www.w3schools.com/html/html_form_input_types.asp).

*Note: browsers differ, and will fall back to a text field for types they do not
support.*

| Type | Example | Value passed to `main` |
| --- | --- | --- |
| `checkbox` | `{name: 'big', type: 'checkbox', checked: true, caption: 'Big?'}` | `true` if checked, otherwise `false` |
| `checkbox` | `{name: 'big', type: 'checkbox', checked: true, initial: 20, caption: 'Big?'}` | `20` if checked, otherwise `false` |
| `color` | `{name: 'color', type: 'color', initial: '#FFB431', caption: 'Color?'}` | `"#rrggbb"` — convert with `hexToRgb()` |
| `date` | `{name: 'birthday', type: 'date', caption: 'Birthday?'}` | `"YYYY-MM-DD"` |
| `email` | `{name: 'address', type: 'email', caption: 'Email?'}` | string |
| `float` | `{name: 'angle', type: 'float', initial: 2.5, step: 0.5, caption: 'Angle?'}` | number |
| `int` | `{name: 'age', type: 'int', initial: 20, caption: 'Age?'}` | integer |
| `number` | `{name: 'angle', type: 'number', initial: 2.5, step: 0.5, caption: 'Angle?'}` | number |
| `password` | `{name: 'secret', type: 'password', caption: 'Secret?'}` | string |
| `slider` | `{name: 'count', type: 'slider', min: 2, max: 10, initial: 4, caption: 'How many?'}` | number |
| `text` | `{name: 'name', type: 'text', caption: 'Name?'}` | string |
| `url` | `{name: 'webpage', type: 'url', caption: 'Web page?'}` | string |
| `group` | `{name: 'balloon', type: 'group', caption: 'Balloons'}` | nothing — a heading only |

Definitions also accept `initial`, `max`, `maxLength`, `min`, `pattern`,
`placeholder`, `size` and `step` to constrain and guide input.

:::tip[Use `hexToRgb` for color parameters]

A `color` parameter arrives as a CSS hex string, while `colorize()` expects RGB
components between 0 and 1. `hexToRgb()` bridges the two:

```js
import { colorize, hexToRgb, sphere } from '@jscad/modeling'

export const main = (params) => colorize(hexToRgb(params.color), sphere())
```

:::

## Choices

The `choice` type presents a drop-down list. `captions` are what the reader sees;
`values` are what `main` receives.

```js jscad
import { cuboid, roundedCuboid } from '@jscad/modeling'

export const getParameterDefinitions = () => [
  {
    name: 'rounded',
    type: 'choice',
    caption: 'Rounded edges',
    values: [0, 1],
    captions: ['No', 'Yes (slow!)'],
    initial: 1
  }
]

export const main = (params) => params.rounded
  ? roundedCuboid({ size: [20, 20, 20], roundRadius: 3, segments: 32 })
  : cuboid({ size: [20, 20, 20] })
```

If `captions` is omitted, the values themselves are shown.

## Grouping parameters

Long forms are easier to read when broken into sections. A `group` parameter starts a
new section; `initial: 'open'` or `initial: 'closed'` sets whether it begins expanded.

```js
export const getParameterDefinitions = () => [
  { name: 'plateGroup', type: 'group', initial: 'open', caption: 'Mounting plate' },
  { name: 'plateLength', type: 'float', initial: 25, min: 25, max: 200, caption: 'Length' },
  { name: 'plateWidth', type: 'float', initial: 10, min: 5, max: 100, caption: 'Width' },

  { name: 'holeGroup', type: 'group', initial: 'closed', caption: 'Holes' },
  { name: 'holeCount', type: 'int', initial: 4, min: 0, max: 12, caption: 'Count' }
]
```

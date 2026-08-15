---
title: Introduction
sidebar_position: 1
slug: /intro
---

# JSCAD User Guide

JSCAD provides a programmer's approach to designing 3D models. It is an open source
set of modular, browser and command line tools for creating parametric 2D and 3D
designs with JavaScript code. It offers a quick, precise and reproducible method for
generating 3D models, and is especially useful for 3D printing.

JSCAD lets you:

- create and manipulate 3D models, as well as 2D models
- use ordinary JavaScript concepts and libraries
- save models as STL and other formats

:::info[This guide covers JSCAD v3]

JSCAD v3 changes how designs are written. Designs are now
[ES modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules),
and the whole modeling API is available as a single flat set of exports:

```js
import { cuboid, subtract, translate } from '@jscad/modeling'
```

If you are reading code written for v2, you will see `require()` and nested
namespaces instead. Pages throughout this guide call out what changed.

:::

## A first design

Every design is a module that exports a `main` function returning a shape. Here is a
complete one — drag the model to look around.

```js jscad
import { cuboid, subtract, sphere } from '@jscad/modeling'

export const main = () => subtract(
  cuboid({ size: [10, 10, 10] }),
  sphere({ radius: 6.5 })
)
```

Every example in this guide runs in your browser, using the same
`@jscad/modeling` library the JSCAD applications use. The code you see is the code
being rendered — edit it in your own editor and you will get the same shape.

## Where to run designs

JSCAD is available as:

- a [website](https://openjscad.xyz) for quickly creating models
- a command line utility for complex projects and file format conversions
- [NPM packages](https://github.com/jscad/OpenJSCAD.org/blob/V3/packages/README.md)
  for building custom applications or websites
- [source code](https://github.com/jscad/OpenJSCAD.org) for extending or changing
  functionality

## Getting help

Questions about JSCAD are best asked in the
[JSCAD user group](https://openjscad.xyz/forum.html) or on
[Discord](https://openjscad.xyz/discord.html).

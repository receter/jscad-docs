---
title: Contribute
sidebar_position: 6
---

# Contribute

The JSCAD Organization is maintained by volunteers, and anyone is welcome to pitch
in. A few guidelines make that easier for everyone.

## Improving these docs

This guide lives alongside JSCAD itself in the
[OpenJSCAD.org repository](https://github.com/jscad/OpenJSCAD.org). Pages are Markdown
— fix a typo, sharpen an explanation, or add a missing example and open a pull
request.

Examples on this site are live: a fenced block tagged `jscad` is compiled and
rendered in the reader's browser.

````md
```js jscad
import { cuboid } from '@jscad/modeling'

export const main = () => cuboid({ size: [10, 20, 30] })
```
````

That means an example is real code, not a snippet that drifts out of date — it has to
`export` a `main` function that returns geometry, exactly like a design would.

Before opening a pull request, check that every example still runs:

```sh
npm run check:examples
```

It evaluates each `jscad` block in `docs/` and fails on any that errors or produces
no geometry.

:::tip[Writing for v3]

This guide documents JSCAD v3. When a v2 design would have been written differently,
say so inline rather than leaving readers to work it out:

```md
:::info[Changed in v3]
`expand()` has been merged into `offset()`.
:::
```

Note the bracket form — `:::info[Title]`. A space instead of brackets renders as
literal text.

:::

## Reporting a bug

Bug reports go to [GitHub Issues](https://github.com/jscad/OpenJSCAD.org/issues/).
Please read the
[Reporting Issues](https://github.com/jscad/OpenJSCAD.org/wiki/Reporting-Issues)
guide first — a report that includes the design that triggered it, the version, and
what you expected instead gets fixed far faster.

Since v3 is in alpha, it helps to say which you were using. The version is in your
`package.json`, or run:

```sh
npm list @jscad/modeling
```

## Contributing code

Changes are accepted as
[pull requests](https://github.com/jscad/OpenJSCAD.org/pulls/). See the
[contributing guidelines](https://github.com/jscad/OpenJSCAD.org/blob/master/CONTRIBUTING.md)
for the conventions the project follows.

Bug reports and pull requests are only accepted on **GitHub**.

If you have a larger change or a new feature in mind, start a conversation with the
[core developers](https://openjscad.nodebb.com/category/5/development-discussions)
before writing it. It is a much better use of your time than finding out afterwards
that the design was going somewhere else.

## Asking a question

Questions about *using* the website, the application, or the command line utility are
not bug reports. Ask them in the
[JSCAD user group](https://openjscad.xyz/forum.html) or on
[Discord](https://openjscad.xyz/discord.html), where more people will see them.

## Supporting JSCAD

Running the organisation is not free — hosting, domains, and the time that keeps it
all working. If you cannot contribute technically, financial support helps.

- [Become a backer](https://opencollective.com/openjscad#backer)
- [Become a sponsor](https://opencollective.com/openjscad#sponsor) — organisations
  get their logo and a link on the [Open Collective page](https://opencollective.com/openjscad)

Thank you to everyone who already
[contributes](https://opencollective.com/openjscad) 🙏

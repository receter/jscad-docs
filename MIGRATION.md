# Userguide migration status

Tracks the migration of the English JSCAD v2 userguide
(`CONTEXT/userguide-backup-master/pages/en/`, DokuWiki source) into this Docusaurus
site, rewritten for JSCAD v3.

Last updated: 2026-08-15

## Where things stand

| | Pages | Source lines |
| --- | ---: | ---: |
| Migrated | 36 | 1,029 |
| Partially migrated | 1 | 19 |
| Not migrating | 2 | 64 |
| Outstanding | 23 | 874 |
| **Total** | **62** | **1,986** |

36 of 62 source pages are done — 58% of pages, 52% of the source by volume.

The counts are pages of *DokuWiki source*, not pages of the new site. The v2 guide
split topics across many small files that DokuWiki stitched together with `{{page>}}`
includes; we consolidate those into one page per topic, so 36 source pages became 10
site pages.

## Batch 1 — shipped

| Site page | v2 sources absorbed | Source lines |
| --- | ---: | ---: |
| [docs/intro.md](docs/intro.md) | 1 | 20 |
| [docs/design-guide/index.md](docs/design-guide/index.md) | 1 | 23 |
| [docs/design-guide/anatomy.md](docs/design-guide/anatomy.md) | 1 | 54 |
| [docs/design-guide/parameters.md](docs/design-guide/parameters.md) | 1 | 64 |
| [docs/design-guide/projects.md](docs/design-guide/projects.md) | 1 | 60 |
| [docs/design-guide/3d-primitives.md](docs/design-guide/3d-primitives.md) | 6 | 261 |
| [docs/design-guide/2d-primitives.md](docs/design-guide/2d-primitives.md) | 5 | 165 |
| [docs/design-guide/transforms.md](docs/design-guide/transforms.md) | 8 | 217 |
| [docs/design-guide/operations.md](docs/design-guide/operations.md) | 7 | 77 |
| [docs/design-guide/extrusions.md](docs/design-guide/extrusions.md) | 5 | 88 |

## Outstanding

### Design Guide — 9 pages, 452 lines

Completing this section finishes the guide's core.

| Source | Lines | Note |
| --- | ---: | --- |
| `design_guide_path` | 128 | |
| `design_guide_measurements` | 115 | |
| `design_guide_text` | 103 | `vectorChar`/`vectorText` return path2 objects in v3 |
| `design_guide_color` | 36 | |
| `design_guide_expand` | 23 | `expand()` is now `offset()` |
| `design_guide_offset` | 22 | v3 `offset()` also works on 3D geometry |
| `design_guide_attributes` | 11 | section index — folds into its topic page |
| `design_guide_expansions` | 8 | section index — folds into its topic page |
| `design_guide_others` | 6 | section index — folds into its topic page |

### Quick Reference — 8 pages, 177 lines

Terse function listings. Needs a decision first: whether this section still earns its
place next to the generated [API reference](https://openjscad.xyz/docs/), or whether
it becomes a single cheat-sheet page.

| Source | Lines |
| --- | ---: |
| `quick_reference_shapes` | 35 |
| `quick_reference_transforms` | 32 |
| `quick_reference_general` | 30 |
| `quick_reference_operations` | 26 |
| `jscad_quick_reference` | 19 |
| `quick_reference_conversion` | 13 |
| `quick_reference_expansions` | 11 |
| `quick_reference_text` | 11 |

`quick_reference_parameters` was already migrated, as
[Design Parameters](docs/design-guide/parameters.md).

### User Guide — 3 pages, 167 lines

| Source | Lines | Note |
| --- | ---: | --- |
| `user_guide_website` | 109 | **Rewrite, not migrate** — documents the v2 web UI. v3 ships a new UI migrated from jscadui. |
| `user_guide_help` | 43 | Links to other designs and sites; check every link still resolves |
| `user_guide_formats` | 15 | v3 dropped GCODE and added a 3MF deserializer |

### Math Guide — 2 pages, 41 lines

| Source | Lines |
| --- | ---: |
| `math_guide_conversions` | 36 |
| `jscad_design_math` | 5 |

### Other — 1 page, 37 lines

| Source | Lines | Note |
| --- | ---: | --- |
| `contribute` | 37 | **Replace, not migrate** — explains how to edit the DokuWiki. Needs rewriting for this repo. |

## Partially migrated

- `math_guide_orientation` (19 lines) — the right-hand rule and axis conventions are
  covered in [Transforms § Orientation](docs/design-guide/transforms.md). Its diagrams
  and the rest of the Math Guide framing still need a home.

## Not migrating

- `sidebar` (63 lines) — DokuWiki navigation, replaced by `sidebars.ts`.
- `test3` — empty file.

## New v3 material with no v2 source

Batch 1 already documents `extrudeHelical`, `minkowskiSum`, `triangle` and `arc`.
Still undocumented anywhere: `path3`, the modifiers (`snap`, `coalesce`,
`generalize`, `retessellate`), curves and `bezier`, connectors, and
`hullPoints2`/`hullPoints3`.

61 of the 96 flat functions exported by `@jscad/modeling` appear in the migrated
pages. Most of the remaining 35 are measurements and color conversions, which land
naturally in the outstanding Design Guide pages.

A "Migrating from v2" page is planned but not written. Until it exists, v2 differences
are called out inline with `:::info[Changed in v3]` admonitions.

## Proposed batch 2

Finish the Design Guide — offsets, colors, measurements, and text & paths. That is
five topic pages covering nine source pages and 452 lines, and would leave only the
Quick Reference, User Guide and Math Guide sections.

## Conventions

- One site page per topic; v2's per-function files become H2 sections.
- Examples are ```js jscad fenced blocks, rendered live in the browser by
  `src/components/JscadViewer`. The v2 screenshots are deliberately unused.
- v3 differences are noted inline with `:::info[Changed in v3]`.

Run `npm run check:examples` before calling a page done — it evaluates every live
example in `docs/` and fails on any that does not produce geometry.

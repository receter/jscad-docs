# Userguide migration status

Tracks the migration of the English JSCAD v2 userguide
(`CONTEXT/userguide-backup-master/pages/en/`, DokuWiki source) into this Docusaurus
site, rewritten for JSCAD v3.

Last updated: 2026-08-15 (batch 3)

## Where things stand

| | Pages | Source lines |
| --- | ---: | ---: |
| Migrated | 59 | 1,813 |
| Not migrating | 2 | 64 |
| Outstanding | 1 | 109 |
| **Total** | **62** | **1,986** |

59 of 62 source pages are done — 95% of pages, 91% of the source by volume. One page
remains, and it needs writing rather than migrating.

The counts are pages of *DokuWiki source*, not pages of the new site. The v2 guide
split topics across many small files that DokuWiki stitched together with `{{page>}}`
includes; we consolidate those into one page per topic, so 59 source pages became 19
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
| [docs/design-guide/paths-and-text.md](docs/design-guide/paths-and-text.md) | 3 | 237 |
| [docs/design-guide/transforms.md](docs/design-guide/transforms.md) | 8 | 217 |
| [docs/design-guide/operations.md](docs/design-guide/operations.md) | 7 | 77 |
| [docs/design-guide/extrusions.md](docs/design-guide/extrusions.md) | 5 | 88 |

## Batch 2 — shipped

Completes the Design Guide.

| Site page | v2 sources absorbed | Source lines |
| --- | ---: | ---: |
| [docs/design-guide/offsets.md](docs/design-guide/offsets.md) | 3 | 53 |
| [docs/design-guide/colors.md](docs/design-guide/colors.md) | 2 | 47 |
| [docs/design-guide/measurements.md](docs/design-guide/measurements.md) | 1 | 115 |

(`paths-and-text.md` also shipped in this batch; it is listed above because it sits
with the primitives in the sidebar.)

## Batch 3 — shipped

Everything outside the Design Guide.

| Site page | v2 sources absorbed | Source lines |
| --- | ---: | ---: |
| [docs/quick-reference.md](docs/quick-reference.md) | 8 | 177 |
| [docs/math-guide.md](docs/math-guide.md) | 3 | 60 |
| [docs/file-formats.md](docs/file-formats.md) | 1 | 15 |
| [docs/more-designs.md](docs/more-designs.md) | 1 | 43 |
| [docs/contribute.md](docs/contribute.md) | 1 | 37 |

The eight Quick Reference pages were collapsed into one cheat sheet, and the Math
Guide's three into one page — including `math_guide_orientation`, which is no longer
half-migrated.

## Outstanding

### The website page — 1 page, 109 lines

`user_guide_website` walks through the v2 web application screen by screen. v3 ships
a different UI, migrated from jscadui, so none of that content carries over. This is
authoring work against the running application — including fresh screenshots — not a
migration, and it should be written by someone who has the v3 UI in front of them.

## Not migrating

- `sidebar` (63 lines) — DokuWiki navigation, replaced by `sidebars.ts`.
- `test3` — empty file.

## New v3 material with no v2 source

90 of the 96 flat functions exported by `@jscad/modeling` now appear in the docs. The
six that do not are all low-level helpers with no v2 source and little standalone
value in a user guide: `aboutEqualNormals`, `hueToColorComponent`,
`interpolateBetween2DPointsForY`, `solve2Linear`, and `hullPoints2` / `hullPoints3`.
They are covered by the generated API reference.

Bigger gaps, none of which the v2 guide covered either, so they are new work rather
than migration:

- **`path3`** — 3D paths, new in v3 and undocumented here.
- **Curves** — the `curves` module and `bezier`.
- **Connectors** — geometry carrying a plane and a perpendicular vector.

A "Migrating from v2" page is planned but not written. Until it exists, v2 differences
are called out inline with `:::info[Changed in v3]` admonitions.

## What is left

The migration itself is done bar the website page. What remains is new material:

1. **The website page** — needs the v3 UI in front of you, plus screenshots.
2. **A "Migrating from v2" page** — the inline `:::info[Changed in v3]` notes are
   scattered across seventeen pages; collecting them into one reference would serve
   the large existing v2 audience.
3. **path3, curves and connectors** — v3 features the v2 guide never covered.
4. **Link rot** — four links in `user_guide_help` were dead and were dropped (see
   below). The rest are worth re-checking periodically.

### Links dropped from More Designs

Checked 2026-08-15, all failing consistently across retries:

| Link | Result |
| --- | --- |
| `gitpharm01.github.io` | 404 |
| `johanlagerloef.com/openvelodrome/` | no connection |
| `gen.haxit.org/organizer/` | 526 (Cloudflare origin unreachable) |
| `www.nametag-designer.com` | 520 (Cloudflare origin error) |

The two Cloudflare errors mean the domain resolves but its backend is down, so those
two may be worth re-testing before writing them off permanently.

## Conventions

- One site page per topic; v2's per-function files become H2 sections.
- The Quick Reference is one cheat sheet, not eight stubs — the v2 split was an
  artifact of DokuWiki includes, and the content is homogeneous tables of call
  examples.
- Examples are ```js jscad fenced blocks, rendered live in the browser by
  `src/components/JscadViewer`. The v2 screenshots are deliberately unused.
- v3 differences are noted inline with `:::info[Changed in v3]`.

Run `npm run check:examples` before calling a page done — it evaluates every live
example in `docs/` and fails on any that does not produce geometry.

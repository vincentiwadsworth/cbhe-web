# Specification: Fix Image Paths and Card Aspect Ratio

## Purpose

Normalize all content-collection image references through `resolveImageUrl()` so they remain correct under any future `BASE_URL` change, and make `CourseCard`'s default variant render at a 1:1 aspect ratio for visual consistency with the rest of the Capacitación page.

## Requirements

### Functional

#### REQ-01: Content-collection image references MUST go through `resolveImageUrl()`

**WHEN** the frontmatter image of a content entry (`cursos` or `articulos`) is referenced in a render path, **THEN** the value **SHALL** be passed through `resolveImageUrl()` from `src/utils/images.ts` before reaching the DOM (either as an `<img src>` or inside a CSS `background-image: url(...)` value).

The following 7 references across 5 files are in scope:

| File | Line | Reference | Treatment |
|------|------|-----------|-----------|
| `src/components/CourseCard.astro` | 98 | `data.image` | `src={resolveImageUrl(data.image)}` |
| `src/pages/capacitacion/[slug].astro` | 99 | `curso.data.image` | `src={resolveImageUrl(curso.data.image)}` |
| `src/pages/index.astro` | 537 | `articulo.data.image` | `src={resolveImageUrl(articulo.data.image)}` |
| `src/pages/index.astro` | 573 | `curso.data.image` | `src={resolveImageUrl(curso.data.image)}` |
| `src/pages/novedades.astro` | 46 | `${featured.data.image}` inside `url('…')` | wrap the expression: `` url('${resolveImageUrl(featured.data.image)}') `` |
| `src/pages/novedades.astro` | 84 | `${articulo.data.image}` inside `url('…')` | wrap the expression: `` url('${resolveImageUrl(articulo.data.image)}') `` |
| `src/pages/novedades/[slug].astro` | 67 | `articulo.data.image` | `src={resolveImageUrl(articulo.data.image)}` |

Imports MUST be added in files that do not already import `resolveImageUrl`:

- `src/components/CourseCard.astro` → `import { resolveImageUrl } from "../utils/images";`
- `src/pages/capacitacion/[slug].astro` → `import { resolveImageUrl } from "../../utils/images";`
- `src/pages/novedades.astro` → `import { resolveImageUrl } from "../utils/images";`
- `src/pages/novedades/[slug].astro` → `import { resolveImageUrl } from "../../utils/images";`

`src/pages/index.astro` already imports `resolveImageUrl` (line 13); no import change is required there.

**Special edge case — inline `background-image: url(...)`**: in `src/pages/novedades.astro` the wrap goes **inside** the template-literal expression, not around the full `url(...)` literal. Wrapping the full string would produce `url('/images/...')` double-wrapped or break the CSS. Only the expression inside `${…}` receives the call.

#### REQ-02: `CourseCard` default variant MUST render at 1:1 aspect ratio

**WHEN** `CourseCard` is rendered with `variant="default"` (the default), **THEN** the image container **SHALL** use Tailwind v4's `aspect-square` class (1:1) instead of `aspect-video` (16:9).

The single change is in `src/components/CourseCard.astro` line 54:

```diff
 const imageClasses = {
-  default: "aspect-video",
+  default: "aspect-square",
   compact: "aspect-4/3",
   featured: "aspect-21/9",
 };
```

The `compact` (4:3) and `featured` (21:9) variants **MUST NOT** change. The no-image fallback path (lines 110-120, which also uses `imageClasses[variant]`) **MUST** automatically inherit the new 1:1 shape and remain visually consistent.

### Non-Functional

#### REQ-03: Build MUST pass with zero new warnings

**WHEN** the change is applied, **THEN** `npx astro build` **SHALL** complete successfully and **SHALL NOT** introduce new warnings or errors related to missing imports, unresolved references, or image paths.

#### REQ-04: Generated HTML MUST contain valid image URLs

**WHEN** the production build completes, **THEN** every `<img src>` and inline `background-image: url(...)` value derived from a content collection image **SHALL** resolve to a valid path under the current `BASE_URL` (currently `/`), with no double-slash, no `undefined` literals, and no malformed `url()` strings.

## Scenarios

### Scenario 1: CourseCard default variant renders square image (happy path)

- **GIVEN** a `cursos` entry with `image: /images/cursos/inspector-soldadura.webp` is rendered inside `CourseCard` with no explicit `variant` prop
- **WHEN** the page builds and is served
- **THEN** the rendered `<img>` carries `src="/images/cursos/inspector-soldadura.webp"`
- **AND** the image wrapper div carries the `aspect-square` class (1:1)
- **AND** the image fills the wrapper via `object-cover` without overflow at 320 / 640 / 1024 / 1440 px viewports

### Scenario 2: Featured article background image on `/novedades` resolves correctly (inline `url(...)` edge case)

- **GIVEN** `novedades.astro` is built and a `featured` article has `image: /images/novedades/hero-evento.webp`
- **WHEN** the resulting HTML is inspected
- **THEN** the inline `style="background-image: url('…')"` value **SHALL** contain exactly one `url('…')` wrapper and one `/images/novedades/hero-evento.webp` value
- **AND** the wrap is **not** applied to the literal `url(...)` token itself — only the expression inside `${…}` receives `resolveImageUrl()`

### Scenario 3: Compact and featured variants remain visually unchanged (regression guard)

- **GIVEN** `CourseCard` is rendered with `variant="compact"` (used by `RelatedCourses`) or `variant="featured"`
- **WHEN** the page builds
- **THEN** `compact` images render at 4:3 (`aspect-4/3`)
- **AND** `featured` images render at 21:9 (`aspect-21/9`)
- **AND** no other layout, padding, typography, or hover effect changes

### Scenario 4: No-image fallback renders a square colored tile (consistency)

- **GIVEN** a `cursos` entry with no `image` field
- **WHEN** the card is rendered with `variant="default"`
- **THEN** the fallback div uses the same `imageClasses.default` value (`aspect-square`)
- **AND** the icon (`material-symbols:school`) is centered inside a square colored tile with no distortion

### Scenario 5: Build passes and HTML output is valid (build + verification)

- **GIVEN** the changes from REQ-01 and REQ-02 are applied
- **WHEN** `npx astro build` is run
- **THEN** the command exits 0 with no new warnings
- **AND** `dist/**/*.html` contains `<img src="/images/...">` for every `data.image` and `url('/images/...')` for every inline background
- **AND** no occurrence of the literal string `undefined` appears inside an `src` or `url(...)` value

## Non-Goals

- No changes to `CourseCard` `compact` (4:3) or `featured` (21:9) variants.
- No redesign of card layout, padding, typography, or hover effects.
- No changes to hardcoded images (partners, hero, carousel, logos) — they already use `resolveImageUrl()`.
- No changes to `src/pages/capacitacion.astro` — it already wraps all images correctly.
- No introduction of a test runner, unit tests, or visual regression tests.
- No changes to the `resolveImageUrl()` helper itself.

## Constraints

- `astro.config.mjs` `base` is currently `/`; the change is defensive and must not break the current production behavior on `cbhe.org.bo`.
- `resolveImageUrl()` is identity for root-relative paths under `base: "/"`; build output for content-collection images must match today's output exactly.
- The `novedades.astro` inline-style wrap is a CSS expression — the `url('…')` literal must remain syntactically valid CSS after the change.
- Edits stay inside the 5 files listed in REQ-01 plus the single line in REQ-02. No other files are touched.

## Acceptance Evidence

| REQ | Verification |
|-----|--------------|
| REQ-01 | `grep -n "resolveImageUrl" src/components/CourseCard.astro src/pages/capacitacion/[slug].astro src/pages/index.astro src/pages/novedades.astro "src/pages/novedades/[slug].astro"` shows the import in 4 of the 5 files (index already had it) and the wrap on all 7 listed lines. |
| REQ-01 | `grep -n "data\.image\|articulo\.data\.image\|curso\.data\.image" src/ -r` returns only the `resolveImageUrl(...)`-wrapped forms (no raw `src={data.image}` left in the 5 in-scope files). |
| REQ-02 | `grep -n "aspect-square\|aspect-video" src/components/CourseCard.astro` shows `aspect-square` on the `default` key and `aspect-video` is gone. `compact` and `featured` keys are unchanged. |
| REQ-03 | `npx astro build` exits 0; output contains no new `warn` lines (only pre-existing build noise, if any). |
| REQ-04 | `rg "src=\"/images/" dist/**/*.html` lists every content-collection image with a single root-relative path. `rg "url\\(['\\\"]?/images/" dist/**/*.html` lists every inline background with exactly one `url('…')` wrapper. `rg "undefined" dist/**/*.html` returns no matches inside `src=` or `url(...)` values. |
| REQ-04 | `rg "url\\('url\\(" dist/**/*.html` is empty (no double-wrapped inline styles). |
| Visual | `npx astro preview` (or local dev) at 375 / 768 / 1440 px viewports: `/capacitacion/` shows square course cards with no overflow or distortion; `/novedades/` shows the featured article image and grid tile images without broken `url(...)` values. |

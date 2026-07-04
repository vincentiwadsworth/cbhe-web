# Design: Fix Image Paths and Card Aspect Ratio

## Overview

Two defensive fixes applied mechanically across 5 files. First, all `data.image` references from content collections (`cursos`, `articulos`) are routed through `resolveImageUrl()` so image paths remain correct when `astro.config.mjs` `base` changes. Without this, root-relative paths like `/images/cursos/foo.webp` bypass the helper and break under subpath deployments. Second, `CourseCard` default variant swaps `aspect-video` (16:9) for `aspect-square` (1:1), aligning its visual proportion with the rest of the Capacitación page. Both changes are identity-preserving under the current `base: "/"` — zero visual regression expected.

## File-by-File Changes

| # | File | Action | Current | Target | Why | Notes |
|---|------|--------|---------|--------|-----|-------|
| 1 | `src/components/CourseCard.astro` | Add import | No `resolveImageUrl` import | `import { resolveImageUrl } from "../utils/images";` (after line 2) | Required for wrapping `data.image` | Place alongside existing `Icon` import |
| 2 | `src/components/CourseCard.astro:54` | Modify | `default: "aspect-video"` | `default: "aspect-square"` | 1:1 proportion matches Capacitación visual consistency | `compact` (4:3) and `featured` (21:9) untouched |
| 3 | `src/components/CourseCard.astro:98` | Modify | `src={data.image}` | `src={resolveImageUrl(data.image)}` | Defensive base-path handling | No-image fallback at line 112 already uses `imageClasses[variant]` — inherits new 1:1 automatically |
| 4 | `src/pages/capacitacion/[slug].astro` | Add import | No `resolveImageUrl` import | `import { resolveImageUrl } from "../../utils/images";` (after line 11) | Required for wrapping hero image | Place after last existing import |
| 5 | `src/pages/capacitacion/[slug].astro:99` | Modify | `src={curso.data.image}` | `src={resolveImageUrl(curso.data.image)}` | Hero `<img>` in course detail | Semantic location: `src` attribute of `<img>` inside `<figure>`, ~line 99. Use `curso.data.image` as anchor text |
| 6 | `src/pages/index.astro:537` | Modify | `src={articulo.data.image}` | `src={resolveImageUrl(articulo.data.image)}` | Latest-articles grid tile image | `resolveImageUrl` already imported at line 13 |
| 7 | `src/pages/index.astro:573` | Modify | `src={curso.data.image}` | `src={resolveImageUrl(curso.data.image)}` | Featured courses image | Same file, no additional import needed |
| 8 | `src/pages/novedades.astro` | Add import | No `resolveImageUrl` import | `import { resolveImageUrl } from "../utils/images";` (after line 7) | Required for inline `url(...)` wraps | After `parseDateToTimestamp` import |
| 9 | `src/pages/novedades.astro:46` | Modify | `` `${featured.data.image}` `` inside `url('…')` | `` `${resolveImageUrl(featured.data.image)}` `` inside `url('…')` | Featured article background image | **Critical edge case**: wrap only the expression inside `${…}`, NOT the outer `url(...)` literal. Double-wrap would produce `url('url('/images/...')')` — broken CSS |
| 10 | `src/pages/novedades.astro:84` | Modify | `` `${articulo.data.image}` `` inside `url('…')` | `` `${resolveImageUrl(articulo.data.image)}` `` inside `url('…')` | Grid tile background images | Same pattern as line 46 |
| 11 | `src/pages/novedades/[slug].astro` | Add import | No `resolveImageUrl` import | `import { resolveImageUrl } from "../../utils/images";` (after line 5) | Required for article hero image | After `parseDateToISO` import |
| 12 | `src/pages/novedades/[slug].astro:67` | Modify | `src={articulo.data.image}` | `src={resolveImageUrl(articulo.data.image)}` | Article detail hero `<img>` | Only image reference in this file |

**Files NOT touched**: `src/pages/capacitacion.astro` (already uses `resolveImageUrl` on all images), `src/utils/images.ts` (no changes to the helper itself), hardcoded images (partners, hero, carousel), `CourseCard` compact/featured variants.

## Commit Strategy

**One commit**, title: `fix(images+cards): wrap content collection images and set CourseCard to 1:1`

Rationale: all 12 edits serve one cohesive goal — consistent image path handling + visual consistency. Splitting would create artificial review units that don't make sense independently (a file missing the import but having the wrap would be broken).

**Edit order within the commit** (applied sequentially in a single staging pass):

1. **Add missing `import` statements** — 4 files (CourseCard, capacitacion/[slug], novedades, novedades/[slug])
2. **Apply `resolveImageUrl()` wraps** — 7 locations across 5 files
3. **Apply the aspect-ratio swap** — 1 location (CourseCard line 54)

Order matters: imports must land before wraps to avoid "undefined symbol" errors at any intermediate commit state. The aspect-ratio change is pure CSS and goes last as the lowest-risk edit.

## Verification Plan

Commands runnable on Windows (PowerShell). Tested: `findstr` and `Select-String` are available; `rg` (ripgrep) is NOT — all commands include Windows fallbacks.

### Step 1: Build

```bash
npx astro build
```

**Expected**: exit code 0, no new warnings or errors.

### Step 2: Verify `resolveImageUrl` wrappers in source

```powershell
# Each import is present (PowerShell)
Select-String -Path src/components/CourseCard.astro,src/pages/capacitacion/`[slug`].astro,src/pages/novedades.astro,"src/pages/novedades/[slug].astro" -Pattern "resolveImageUrl" | Select-Object -First 10
```

**Expected**: 4 imports + all 7 wrapped references. `index.astro` shows its pre-existing import.

### Step 3: Verify no raw `data.image` left behind

```powershell
# In-scope files only — no raw src={data.image} remains
Select-String -Path src/components/CourseCard.astro,src/pages/capacitacion/`[slug`].astro,src/pages/index.astro,src/pages/novedades.astro,"src/pages/novedades/[slug].astro" -Pattern 'src=\{.*data\.image[^)]'
```

**Expected**: zero matches (all wrapped through `resolveImageUrl()`).

### Step 4: Verify aspect-ratio change in source

```powershell
Select-String -Path src/components/CourseCard.astro -Pattern "aspect-square|aspect-video"
```

**Expected**: `aspect-square` appears once (line 54, `default` key). `aspect-video` does NOT appear.

### Step 5: Verify generated HTML image paths

```powershell
# All <img src> start with /images/ — no double-slash, no undefined
Get-ChildItem -Path dist -Recurse -Filter *.html | Select-String -Pattern 'src="/images/.*\.(webp|jpg|png)' | Select-Object -First 20
```

### Step 6: Verify inline background-image URLs (novedades edge case)

```powershell
# Single url(...) wrapper, no double-wrap
Get-ChildItem -Path dist -Recurse -Filter *.html | Select-String -Pattern "url\('/images/" | Select-Object -First 10
```

**Expected**: matches like `url('/images/novedades/foo.webp')` — single wrapper, valid path.

### Step 7: Verify no `undefined` in image attributes

```powershell
Get-ChildItem -Path dist -Recurse -Filter *.html | Select-String -Pattern 'src="undefined|url\(\x27undefined'
```

**Expected**: zero matches.

## Rollback Plan

Revert the single commit with `git revert <commit-hash>`. No data migration, no schema changes, no environment-side effects. If the commit is already merged to `main`, revert creates a new commit; the site returns to its prior state on next deploy. All changes are additive (imports + wraps + one class swap) — there is no state to unwind beyond the git tree.

## Addressed Risks

**Risk A.1 (line number drift)**: The file-by-file table above uses semantic anchors (`src={...data.image}` pattern, `<img>` inside `<figure>`) alongside~line numbers. `capacitacion/[slug].astro:99` is particularly sensitive — the design explicitly calls out "`src` attribute of `<img>` inside `<figure>`" as the semantic location. The `sdd-tasks` phase must use pattern-matching (`Select-String` or `findstr`) rather than blind line numbers for edits near that region.

**Risk A.2 (rg not available on Windows)**: Confirmed — `rg` is NOT installed. Verification plan uses PowerShell `Select-String` and `Get-ChildItem` exclusively, with `findstr` as a secondary fallback. All 7 verification steps above are Windows-native. The `sdd-apply` phase must use `Get-ChildItem ... | Select-String` for build output verification, not `rg`.

## Carried Risks

None. The change is mechanical: import additions, function wraps, and one Tailwind class swap. `resolveImageUrl()` is identity for root-relative paths under `base: "/"` (confirmed in `astro.config.mjs`), so the build output is byte-identical to current production. No regressions possible.

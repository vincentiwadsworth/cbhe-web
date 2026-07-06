# Verify Report: fix-image-paths-and-card-aspect

## Commit
- SHA: 74b9059
- Branch: feat/custom-domain
- Files: 11 (5 code + 5 openspec + 1 helper)

## Summary
The implementation fully satisfies all 4 requirements. All 7 content-collection image references are now wrapped with `resolveImageUrl()`, the CourseCard default variant renders at 1:1 aspect ratio, the build passes with zero new warnings, and the generated HTML contains valid image URLs with no undefined or double-wrapped values. The helper `src/utils/images.ts` is now committed alongside its consumers.

## Per-REQ Results

### REQ-01: PASS
- **Evidence**:
  - `grep -n "resolveImageUrl" src/components/CourseCard.astro src/pages/capacitacion/[slug].astro src/pages/index.astro src/pages/novedades.astro src/pages/novedades/[slug].astro` confirms 4 new imports + 7 wrapped references (2 in index.astro, 2 in novedades.astro, 1 each in CourseCard, capacitacion/[slug], novedades/[slug])
  - `grep -n 'src={.*data\.image[^}]*\}'` on the 5 in-scope files returns zero matches — no raw `data.image` remains in any `src={...}`
  - File-by-file wrap counts:
    - `CourseCard.astro`: 1 wrap (line 99)
    - `capacitacion/[slug].astro`: 1 wrap (line 100)
    - `index.astro`: 2 wraps (lines 537, 573)
    - `novedades.astro`: 2 wraps (lines 47, 85 — inline `background-image` expression-only)
    - `novedades/[slug].astro`: 1 wrap (line 68)
  - Total: 7 wraps, matching spec exactly.
- **Notes**: The `resolveImageUrl` import in `index.astro` was pre-existing (line 13), correctly not duplicated.

### REQ-02: PASS
- **Evidence**:
  - `grep -n "aspect-square\|aspect-video\|aspect-4/3\|aspect-21/9" src/components/CourseCard.astro` shows:
    - Line 55: `default: "aspect-square"` (changed from `aspect-video`)
    - Line 56: `compact: "aspect-4/3"` (unchanged)
    - Line 57: `featured: "aspect-21/9"` (unchanged)
  - `aspect-video` is absent from the file.
  - The no-image fallback (lines 112-113) uses `imageClasses[variant]` and therefore automatically inherits the new `aspect-square` for default variant.
- **Notes**: Code-level verified. Visual confirmation at 375/768/1440 px viewports is required by user (no browser in this environment).

### REQ-03: PASS
- **Evidence**:
  - `npx astro build` exited 0, built 29 pages in 4.36s.
  - Only warning is the pre-existing CSS warning: `.accordion-group::details-content > *` (Lightning CSS pseudo-element rule) — unrelated to this change (no CSS files touched; only `src` attributes, one Tailwind `aspect-*` class swap, and imports).
- **Notes**: Zero new warnings introduced by this change.

### REQ-04: PASS
- **Evidence**:
  - `grep -r 'src="/images/' dist/**/*.html` shows all content-collection images resolve to valid root-relative paths (e.g., `/images/nfpa25.jpg`, `/images/cursos/inspector-soldadura.webp`, `/images/descarga (2).png`).
  - `grep -r "url('/images/" dist/**/*.html` confirms inline `background-image` values have exactly one `url('…')` wrapper with valid paths.
  - `grep -r 'src="undefined"\|url.*undefined' dist/**/*.html` returns no matches.
  - `grep -r "url('url(" dist/**/*.html` returns no matches (no double-wrap).
  - External URLs (e.g., `https://cbhe.org.bo/media/...`) are returned as-is by `resolveImageUrl()` (identity for absolute URLs), correctly preserved.
- **Notes**: All image URLs in `dist/` are valid.

## Findings

### CRITICAL
- None

### WARNING
- None

### SUGGESTION
- Consider adding `src/utils/images.ts` to the repo's initial commit history if not already present (it was added in commit `6c9529b`, an ancestor of the base commit `1523fe4`, so this is now resolved).
- The `aspect-ratio` verification is code-level only; user should visually confirm square cards at mobile (375px), tablet (768px), and desktop (1440px) on `/capacitacion/`.

## Verdict
- **ready-to-merge**: all 4 REQs PASS, zero CRITICAL, zero WARNING
- Reason: Implementation matches spec, design, and tasks exactly; build passes; generated HTML is valid.

## Visual verification (user responsibility)
- Open `/capacitacion/` at mobile 375px width and confirm course cards show square (1:1) images with no overflow or distortion.
- Open `/capacitacion/` at tablet 768px and desktop 1440px widths — confirm square aspect maintained.
- Open `/novedades/` and verify the featured article background image and grid tile images render without broken `url(...)` values.
- Open a course detail page (`/capacitacion/<slug>/`) and confirm hero image loads correctly.
- Open an article detail page (`/novedades/<slug>/`) and confirm hero image loads correctly.
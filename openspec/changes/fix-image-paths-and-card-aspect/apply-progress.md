# Apply Progress: fix-image-paths-and-card-aspect

## Status: complete
## Date: 2026-07-03T21:09:56-04:00
## Commit: 2f6bee2a47fc8d2bf403c41a0a4190d11733c337

## Edits applied
- `src/components/CourseCard.astro`: added `import { resolveImageUrl } from "../utils/images"`; `imageClasses.default` `aspect-video` -> `aspect-square`; wrapped `src={data.image}` -> `src={resolveImageUrl(data.image)}`.
- `src/pages/capacitacion/[slug].astro`: added `resolveImageUrl` import after `RelatedCourses` import; wrapped hero `<img>` `src={curso.data.image}` -> `src={resolveImageUrl(curso.data.image)}`.
- `src/pages/index.astro`: wrapped `src={articulo.data.image}` (Novedades grid) and `src={curso.data.image}` (Cursos Destacados) with `resolveImageUrl()` — import already present at line 13, no import added.
- `src/pages/novedades.astro`: added `resolveImageUrl` import after `parseDateToTimestamp`; wrapped the expression inside the inline `url('...')` template literals for `featured.data.image` and `articulo.data.image` (expression-only inside `${...}`, NOT the outer `url()` literal).
- `src/pages/novedades/[slug].astro`: added `resolveImageUrl` import after `parseDateToISO`; wrapped hero `<img>` `src={articulo.data.image}` -> `src={resolveImageUrl(articulo.data.image)}`.

Total: 12 edits (4 imports + 7 wraps + 1 aspect swap) across 5 files. 12 insertions / 8 deletions.

## Verification results
- Build: PASS — `npx astro build` exit 0; 29 pages built; `dist/` produced. One PRE-EXISTING CSS warning on `.accordion-group::details-content > *` (Lightning CSS "pseudo-element followed by `>`" rule) — unrelated to this change (no CSS was touched; only `src` attrs, one Tailwind `aspect-*` class swap, and imports).
- Step 3a (resolveImageUrl refs): PASS — confirmed present in all 5 in-scope files (imports + 7 wraps). NOTE: the task command's `Select-Object -First 20` cap truncated output (`capacitacion.astro` pre-existing refs consumed the row budget); re-ran scoped checks to confirm `novedades.astro` (3 refs: import + 2 inline wraps) and `index.astro` (2 new wraps at 537/573).
- Step 3b (no raw data.image in src=): PASS (with caveat) — the task's regex `src=\{[^}]*data\.image[^}]*\}` is OVERLY BROAD: `[^}]*` matches `resolveImageUrl(...)` because that substring contains no `}` brace, so the pattern matches wrapped forms too. It returned 5 matches — all correctly-wrapped. Corrected check using a negative lookahead `src=\{(?!resolveImageUrl)[^}]*data\.image` returned `RAW_UNWRAPPED_MATCH_COUNT=0` — zero raw unwrapped forms remain.
- Step 3c (aspect-square swap): PASS — `default: "aspect-square"` present; `aspect-video` absent.
- Step 3d (HTML image paths): PASS — 20 valid `src="/images/..."` matches across `index.html` and `capacitacion/*` pages.
- Step 3e (inline background URLs): PASS — valid `url('/images/...')` present (e.g. `/images/descarga (2).png`); full `https://...` URLs correctly returned as-is by `resolveImageUrl` (identity for absolute URLs). No double-wrap.
- Step 3f (no undefined): PASS — `UNDEFINED_MATCH_COUNT=0`.
- Bonus (spec REQ-04 double-wrap): PASS — `DOUBLE_WRAP_MATCH_COUNT=0` (no `url('url(`).

## Risks discovered
1. **`src/utils/images.ts` is UNTRACKED in git** (not committed). The 5-file commit references `resolveImageUrl()` from this uncommitted helper. The build passes (the file exists on disk), but the commit in isolation is NOT self-contained — checking out only this commit would fail to build (missing the helper). The commit was scoped to the 5 files per the apply task's explicit staging instructions ("verify only the 5 expected files are staged"). This is a PRE-EXISTING repo state, not introduced by this change (`index.astro` already imported the helper before this change). RECOMMENDATION: commit `src/utils/images.ts` (and the `openspec/changes/fix-image-paths-and-card-aspect/` dir) before pushing or opening a PR, so the helper lands in history alongside its consumers.
2. **Task Step 3b verification regex is overly broad.** The verify phase (and any future re-verification) should use the negative-lookahead variant `src=\{(?!resolveImageUrl)[^}]*data\.image`, or an exact-literal search for `src={data.image}` / `src={articulo.data.image}` / `src={curso.data.image}`, instead of the original `src=\{[^}]*data\.image[^}]*\}` which produces false positives on wrapped forms.
3. **Pre-existing CSS build warning** on `.accordion-group::details-content > *` (Lightning CSS pseudo-element rule) — unrelated to this change, present before; no CSS was touched. Surfaced for awareness only.

## Next
sdd-verify

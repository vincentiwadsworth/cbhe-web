# Proposal: Fix Image Paths and Card Aspect Ratio

## Why

Content collection images (`data.image` from cursos, artículos) bypass the `resolveImageUrl()` helper in 7 locations across 5 files. This works today with `base: "/"` but breaks silently if `base` ever changes. Separately, `CourseCard` default variant uses `aspect-video` (16:9) while the rest of the site uses square proportions — a visual inconsistency on the Capacitación page. Both fixes are mechanical, low-risk, and defensive.

## What Changes

| File | Line(s) | Change |
|------|---------|--------|
| `src/components/CourseCard.astro` | 2 | Add `import { resolveImageUrl } from "../utils/images"` |
| `src/components/CourseCard.astro` | 54 | `aspect-video` → `aspect-square` (default variant only) |
| `src/components/CourseCard.astro` | 98 | `data.image` → `resolveImageUrl(data.image)` |
| `src/pages/capacitacion/[slug].astro` | ~10 | Add `import { resolveImageUrl } from "../../utils/images"` |
| `src/pages/capacitacion/[slug].astro` | 99 | `curso.data.image` → `resolveImageUrl(curso.data.image)` |
| `src/pages/index.astro` | 537 | `articulo.data.image` → `resolveImageUrl(articulo.data.image)` |
| `src/pages/index.astro` | 573 | `curso.data.image` → `resolveImageUrl(curso.data.image)` |
| `src/pages/novedades.astro` | ~7 | Add `import { resolveImageUrl } from "../utils/images"` |
| `src/pages/novedades.astro` | 46 | `` `${featured.data.image}` `` → `` `${resolveImageUrl(featured.data.image)}` `` |
| `src/pages/novedades.astro` | 84 | `` `${articulo.data.image}` `` → `` `${resolveImageUrl(articulo.data.image)}` `` |
| `src/pages/novedades/[slug].astro` | ~5 | Add `import { resolveImageUrl } from "../../utils/images"` |
| `src/pages/novedades/[slug].astro` | 67 | `articulo.data.image` → `resolveImageUrl(articulo.data.image)` |

**Note**: `src/pages/index.astro` already imports `resolveImageUrl` — no import change needed.

## Acceptance Criteria

- [ ] `npx astro build` passes without warnings or errors.
- [ ] `dist/**/*.html` contains `<img src="/images/..."` paths consistent with the current `base: "/"` config (no double-slash, no broken URLs).
- [ ] CourseCard images render at 1:1 aspect ratio (square) on mobile, tablet, and desktop viewports.
- [ ] No image overflow or distortion in any CourseCard variant.
- [ ] Fallback state (no image) renders square colored background, visually consistent.
- [ ] Featured article background images on `/novedades` resolve correctly (no broken `url(...)` in inline styles).

## Out of Scope

- `CourseCard` variants `compact` (4:3) and `featured` (21:9) — aspect ratios unchanged.
- Redesign of CourseCard layout, padding, typography, or hover effects.
- Changes to hardcoded images (partners, hero, carousel, logos) — already use `resolveImageUrl()`.
- Any changes to `src/pages/capacitacion.astro` — it already wraps all images correctly.
- Adding tests or test infrastructure — not applicable (no test runner).

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| `resolveImageUrl()` returns unexpected path for current `base: "/"` | **LOW** | Function is identity for root-relative paths when `base` is `/`; verify with build output inspection |
| Typo or missing import causes build error | **LOW** | Build will fail immediately — no silent failure. Build step catches it |
| Aspect ratio change breaks card layout on narrow viewports | **LOW** | Pure CSS swap; Tailwind `object-cover` handles overflow; verify with visual inspection |
| `novedades.astro` inline `background-image: url(...)` double-wraps | **LOW** | Only wrap the expression inside the template literal, not the full `url()` — verified in exploration |

## Open Questions

None — all decisions are closed. The change is purely mechanical with no design or product forks.

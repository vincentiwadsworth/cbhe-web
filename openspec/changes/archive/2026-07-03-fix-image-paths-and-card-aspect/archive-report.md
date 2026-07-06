# SDD Archive Report — fix-image-paths-and-card-aspect

**Archived**: 2026-07-03
**Status**: Complete
**Mode**: OpenSpec (filesystem)

---

## Change Summary

- **Name**: fix-image-paths-and-card-aspect
- **Branch**: feat/custom-domain
- **Commit**: `74b9059`
- **Author**: vincentiwadsworth
- **Date**: 2026-07-03
- **Sprint**: sprint-entrega (Change-A of 3)
- **Delivery strategy**: single-pr-default

---

## Why

Content-collection images (`data.image` from `cursos`, `articulos`) bypassed `resolveImageUrl()` in 7 locations across 5 files. This worked under `base: "/"` but would silently break if `base` ever changed. Separately, `CourseCard` default variant used `aspect-video` (16:9) while the rest of the Capacitación page used square proportions — a visual inconsistency. Both fixes are mechanical, low-risk, and defensive.

---

## What

| # | File | Change |
|---|------|--------|
| 1 | `src/components/CourseCard.astro` | Added `resolveImageUrl` import; wrapped `data.image` in `resolveImageUrl()`; swapped `default: "aspect-video"` → `default: "aspect-square"` |
| 2 | `src/pages/capacitacion/[slug].astro` | Added `resolveImageUrl` import; wrapped `curso.data.image` in `resolveImageUrl()` |
| 3 | `src/pages/index.astro` | Wrapped `articulo.data.image` (line 537) and `curso.data.image` (line 573) — import was pre-existing |
| 4 | `src/pages/novedades.astro` | Added `resolveImageUrl` import; wrapped the expression inside two inline `url('...')` template literals (expression-only inside `${...}`, NOT the outer `url()` literal) |
| 5 | `src/pages/novedades/[slug].astro` | Added `resolveImageUrl` import; wrapped `articulo.data.image` in `resolveImageUrl()` |

**Totals**: 12 edits (4 imports + 7 `resolveImageUrl()` wraps + 1 CSS class swap) across 5 files. 11 files in commit (5 code + 5 openspec artifacts + 1 helper).

---

## Outcomes

| Check | Result |
|-------|--------|
| **Build** | ✅ PASS — `npx astro build` exits 0, 29 pages in 4.36s |
| **Spec coverage** | 4/4 REQs PASS |
| **7 image wraps** | All 7 `data.image` references wrapped across 5 files |
| **Aspect swap** | `aspect-video` removed, `aspect-square` on default variant |
| **Inline `url()` edge case** | Expression-only wrap — no double-wrapped CSS |
| **No undefined** | Zero `src="undefined"` or `url(undefined)` in build output |
| **Critical issues** | 0 |
| **Warnings** | 0 new; 1 pre-existing CSS warning (`.accordion-group::details-content > *` — Lightning CSS pseudo-element rule, unrelated to this change) |
| **Visual verification** | Pending — user responsibility at 3 viewports (mobile 375, tablet 768, desktop 1280) |

---

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| No delta specs created | Change is cross-cutting (image paths + CSS class). Existing specs (`detail-pages`, `chatbot-message-rendering`) don't cover image paths or course card aspect ratio. The change's own `spec.md` is the source of truth. |
| Single commit, not chained | All 12 edits serve one cohesive goal. Splitting would create artificial review units. |
| Expression-only wrap for inline styles | Wrapping the full `url(...)` literal would produce broken CSS (`url('url('/images/...')')`); only the `${expression}` inside the template literal receives `resolveImageUrl()`. |

---

## Risks Addressed

| Risk | Severity | Resolution |
|------|----------|------------|
| `resolveImageUrl()` returns unexpected path under `base: "/"` | LOW | Function is identity for root-relative paths; build output verified byte-identical |
| Typo/missing import causes build error | LOW | Build caught immediate failures (applied in TASK-01 before TASK-02) |
| Aspect ratio change breaks card layout | LOW | Pure CSS swap; `object-cover` handles overflow |
| Inline `background-image` double-wrap | LOW | Verified via build output grep: zero `url('url(` occurrences |

## Risks Deferred

| Risk | Note |
|------|------|
| Pre-existing CSS warning | `.accordion-group::details-content > *` — Lightning CSS pseudo-element rule. Unrelated, present before this change. |

---

## Files Affected

```
MODIFIED (5 files — code):
  src/components/CourseCard.astro              (+3/-1)
  src/pages/capacitacion/[slug].astro          (+2/-1)
  src/pages/index.astro                        (+2/-2)
  src/pages/novedades.astro                    (+3/-2)
  src/pages/novedades/[slug].astro             (+2/-1)

INCLUDED (1 file — helper, already existed):
  src/utils/images.ts                          (unchanged, 30 lines)

CREATED (1 file — post-commit, on disk only):
  openspec/changes/archive/2026-07-03-fix-image-paths-and-card-aspect/verify-report.md

ARCHIVED (5 artifacts — committed in 74b9059):
  openspec/changes/archive/2026-07-03-fix-image-paths-and-card-aspect/proposal.md
  openspec/changes/archive/2026-07-03-fix-image-paths-and-card-aspect/spec.md
  openspec/changes/archive/2026-07-03-fix-image-paths-and-card-aspect/design.md
  openspec/changes/archive/2026-07-03-fix-image-paths-and-card-aspect/tasks.md
  openspec/changes/archive/2026-07-03-fix-image-paths-and-card-aspect/apply-progress.md

Code total: +12/-8 (12 edits, net +4 lines)
```

---

## Verification Results

- **Tasks**: All 5 tasks complete (4 implementation + 1 build verification). No unchecked items in persisted `tasks.md`.
- **Spec compliance**: REQ-01 (wraps) ✅, REQ-02 (aspect) ✅, REQ-03 (build) ✅, REQ-04 (HTML URLs) ✅
- **Edge cases**: Inline `background-image` expression-only wrap verified; no-image fallback inherits `aspect-square` automatically; compact/featured variants untouched; external absolute URLs preserved as-is by `resolveImageUrl()` identity path
- **Critical issues**: 0 | **Warnings**: 0 new

---

## Archival Storage

| Item | Location |
|------|----------|
| Archive directory | `openspec/changes/archive/2026-07-03-fix-image-paths-and-card-aspect/` |
| Archive report | (this file) |
| Source of truth | Change's own `spec.md` — no delta specs merged into main specs |
| Engram | topic_key `sdd/fix-image-paths-and-card-aspect/archive-report` |

---

## Status

- **ready-to-merge**: commit `74b9059` on `feat/custom-domain` (not pushed)

## Next Steps

1. **User**: Visual verification at 3 viewports (mobile 375, tablet 768, desktop 1280) on `/capacitacion/` and `/novedades/`
2. **User**: `git push` when ready
3. **User**: Open PR (or let CI auto-open from the push)

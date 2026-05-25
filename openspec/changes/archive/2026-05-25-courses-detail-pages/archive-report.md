# SDD Archive Report — courses-detail-pages

**Archived**: 2026-05-25
**Status**: Complete
**Mode**: Hybrid (Engram + OpenSpec filesystem)

---

## Summary

Transformed CBHE's course listing and detail pages from unstructured markdown dumps into decision-support enrollment experiences. Built 6 reusable Astro components, restructured 2 pages, and added 1 icon config change across 4 chained PRs (~1,996 lines added total).

---

## What Was Built

### 6 New Components

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| CourseCard | `src/components/CourseCard.astro` | 194 | Reusable card with 3 variants (default/compact/featured), smart CTA routing |
| CourseCurriculum | `src/components/CourseCurriculum.astro` | 299 | Custom mdToHtml parser + H2 section extraction + per-type CSS rendering |
| CourseInstructor | `src/components/CourseInstructor.astro` | 199 | Instructor grid with credential badge extraction (NFPA, AWS, years) |
| CourseFAQ | `src/components/CourseFAQ.astro` | 119 | Native details/summary accordion, zero JavaScript |
| CourseCTA | `src/components/CourseCTA.astro` | 105 | Sticky mobile CTA bar with IntersectionObserver + desktop inline |
| RelatedCourses | `src/components/RelatedCourses.astro` | 71 | Category-matched related courses with fill-to-3 fallback |

### 2 Modified Pages

| Page | File | Lines | Change |
|------|------|-------|--------|
| Detail page | `src/pages/capacitacion/[slug].astro` | 718 | Restructured to 11-section decision-first layout (+673/-150) |
| Listing page | `src/pages/capacitacion.astro` | 293 | Replaced inline cards with `<CourseCard>` component |

### 1 Config Change

| File | Change |
|------|--------|
| `astro.config.mjs` | Added `"person"` to material-symbols include list |

---

## Component API Surface

### CourseCard.astro
```typescript
interface Props {
  course: CollectionEntry<"cursos">;
  variant?: "default" | "compact" | "featured";
  ctaText?: string;
  ctaHref?: string;
}
```

### CourseCurriculum.astro
- Exports: `mdToHtml(md: string): string` (lightweight markdown converter)
- Section extraction: Audience (Dirigido a), Objectives (Objetivo), Curriculum (Temario)
- All other H2 sections → prose-styled fallback

### CourseInstructor.astro
```typescript
interface Props {
  instructors: Array<{ name: string; bio?: string }>;
}
```
- Credential badges: regex for "NFPA", "AWS", "\d+ años"

### CourseFAQ.astro
```typescript
interface Props {
  faqs?: Array<{ question: string; answer: string }>;
  className?: string;
}
```
- Default: 5 standard CBHE FAQs (certificate, attendance, refunds, etc.)

### CourseCTA.astro
```typescript
interface Props {
  canvaLink?: string;
  whatsappNumber?: string;
  className?: string;
}
```

### RelatedCourses.astro
```typescript
interface Props {
  currentSlug: string;
  category: string;
  allCourses: CollectionEntry<"cursos">[];
}
```

---

## Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Custom `mdToHtml()` (~40 lines) instead of `marked` npm dep | Zero dependency, full control, enough for controlled content |
| Server-side H2 section parsing vs CSS hiding | Eliminates Content component duplicate-render risk |
| Single CourseCard with `variant` prop vs 3 components | Simpler, shared markup, no duplication |
| Native `<details>/<summary>` for FAQ | Zero JS, keyboard-native, accessible |
| IntersectionObserver for sticky CTA (~15 lines client JS) | Follows existing `initLoadMore()` pattern, mobile-only |
| Category-first related course matching | Simple but effective; fill-to-3 prevents empty sections |

---

## Files Affected

```
CREATED (6 files):
  src/components/CourseCard.astro          (+194)
  src/components/CourseCurriculum.astro    (+299)
  src/components/CourseInstructor.astro    (+199)
  src/components/CourseFAQ.astro           (+119)
  src/components/CourseCTA.astro           (+105)
  src/components/RelatedCourses.astro      (+71)

MODIFIED (3 files):
  src/pages/capacitacion/[slug].astro      (+673/-150)
  src/pages/capacitacion.astro             (+4/-73)
  astro.config.mjs                         (+1)

Total: ~1,996 lines (1,664 added, 223 removed, net +1,441)
```

---

## Verification Results

- **Build**: ✅ PASS — 27 pages in ~5.78s, zero errors
- **Tasks**: 10/10 complete across 4 chained PRs
- **Spec compliance**: 11/11 requirements, 22/22 scenarios — all COMPLIANT
- **Edge cases**: 8 tested (no image, no instructors, no description, no audience, canvaLink present/absent, single course, JS disabled)
- **Critical issues**: 0 | **Warnings**: 0

---

## Engram Artifact References

| Artifact | Engram ID | Topic Key |
|----------|-----------|-----------|
| Proposal | #680 | `sdd/courses-detail-pages/proposal` |
| Spec | #682 | `sdd/courses-detail-pages/spec` |
| Design | #684 | `sdd/courses-detail-pages/design` |
| Tasks | #689 | `sdd/courses-detail-pages/tasks` |
| Apply-progress | #694 | `sdd/courses-detail-pages/apply-progress` |
| Verify-report | #706 | `sdd/courses-detail-pages/verify-report` |
| **Archive-report** | (this save) | `sdd/courses-detail-pages/archive-report` |

---

## Archival Storage

| Location | Path |
|----------|------|
| Main spec (source of truth) | `openspec/specs/detail-pages/spec.md` |
| Archive folder | `openspec/changes/archive/2026-05-25-courses-detail-pages/` |
| Engram | topic_key `sdd/courses-detail-pages/archive-report` |

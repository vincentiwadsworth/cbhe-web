# Apply Progress — courses-detail-pages

## PR 1 of 4 — CourseCard.astro + listing page + icon config

### Status: COMPLETED ✅

### Implementation Date
2026-05-25

### Commits
1. `334f40f` feat(config): add person icon for instructor badge
2. `74fad2d` feat(components): create CourseCard with default/compact/featured variants  
3. `23dc159` refactor(capacitacion): replace inline cards with CourseCard component

### Files
| File | Action | Lines |
|------|--------|-------|
| `astro.config.mjs` | Modified | +1 |
| `src/components/CourseCard.astro` | Created | +194 |
| `src/pages/capacitacion.astro` | Modified | +4 / -73 |
| **Total** | | **+199 / -73 (net +126)** |

### Tasks Completed
- [x] Task 9: Add "person" icon to astro.config.mjs
- [x] Task 1: Create CourseCard.astro (3 variants: default/compact/featured)
- [x] Task 8: Update capacitacion.astro (replace inline cards with CourseCard)

### Build Result
- `npx astro build`: PASS — 27 pages, zero errors
- 8 non-draft courses render as CourseCards (default variant)
- Category badges differentiated: Curso (primary) vs Certificación (tertiary)
- Canva secondary icon-links present where canvaLink exists
- Load-more pattern preserved

### Remaining PRs
- **PR 2** (Tasks 2-3): CourseCurriculum.astro + CourseInstructor.astro
- **PR 3** (Tasks 4-6): CourseFAQ.astro + CourseCTA.astro + RelatedCourses.astro
- **PR 4** (Tasks 7, 10): [slug].astro assembly + verification

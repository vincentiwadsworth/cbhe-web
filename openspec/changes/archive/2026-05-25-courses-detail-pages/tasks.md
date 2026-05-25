# Tasks: Courses Detail Pages + Card Improvements

## Status
- **Status**: complete (all 4 PRs merged, build verified)
- **Task count**: 10 (10/10 complete)
- **Actual lines changed**: ~1,996 (1,486 new + ~510 modified across 9 files)
- **Delivery strategy**: auto-chain → 4 stacked PRs
- **Chain strategy**: stacked-to-main

## Review Workload Forecast

| Metric | Value |
|--------|-------|
| Chained PRs recommended | yes |
| 400-line budget risk by PR | low (all slices well under 400) |
| Largest PR | PR 1: ~166 lines |
| Smallest PR | PR 4: ~125 lines |
| Risk level | low — independent components, clear boundaries |

## PR Slice Boundaries

| PR # | Focus | Tasks | Est. Lines | Dependencies |
|------|-------|-------|-----------|-------------|
| PR 1 | CourseCard component + Listing integration | 1, 8, 9 | ~166 | None (standalone) |
| PR 2 | Detail section parsing (Curriculum + Instructor) | 2, 3 | ~175 | None (standalone) |
| PR 3 | Detail interactive components (FAQ + CTA + Related) | 4, 5, 6 | ~190 | Uses CourseCard (PR 1) for RelatedCourses |
| PR 4 | Detail page assembly + verification | 7, 10 | ~125 | Depends on all above |

## Task List

---

### PR 1 — CourseCard Component + Listing Integration

#### Task 1: Create `CourseCard.astro` component (3 variants)

**Description**: Extract inline card markup from `capacitacion.astro` into a reusable component with three variants (`default`, `compact`, `featured`). Smart CTA routing: links to detail page, adds secondary Canva icon-link if `canvaLink` exists.

**File**: `src/components/CourseCard.astro` (create)

**Dependencies**: None

**Acceptance**:
- [ ] `<article>` root element with `glass-card` class
- [ ] Props: `course`, `variant` (default|compact|featured), `ctaText?`, `ctaHref?`
- [ ] `variant="default"`: image + aspect-video, category badge, `<h3>` title, description (line-clamp-2), date+price meta, CTA button
- [ ] `variant="compact"`: smaller image (aspect-4/3), no description, reduced padding, CTA defaults to "Ver detalles"
- [ ] `variant="featured"`: larger image (aspect-21/9), `<h2>` title, full description (no clamp), prominent badge
- [ ] Category badge: "Curso" → `bg-primary-container/10` + `school` icon, "Certificación" → `tertiary` + award icon
- [ ] CTA smart routes: detail page `capacitacion/{id}`; if `canvaLink` exists, add secondary icon-link "Ver en Canva"
- [ ] CTA text/href overridable via props
- [ ] All interactive elements `min-h-[44px]`, semantic HTML
- [ ] `loading="lazy"` on images, `aspect-video`/`aspect-4/3` for CLS prevention

**Estimated lines**: ~140

---

#### Task 8: Update `capacitacion.astro` listing page

**Description**: Replace inline card markup (lines 228-295) with `<CourseCard variant="default">`. Keep load-more pattern, sorting, hero section, and everything else unchanged.

**File**: `src/pages/capacitacion.astro` (modify)

**Dependencies**: Task 1 (CourseCard.astro must exist)

**Acceptance**:
- [ ] Inline `<article>` block replaced with `<CourseCard course={curso} variant="default" />`
- [ ] Load-more pattern (`data-load-more-item`) still works — wrap CourseCard in same structure or apply `data-load-more-item` to it
- [ ] Sorting by startDate preserved
- [ ] Visual output identical or improved vs inline markup
- [ ] Modality badge in existing position still renders

**Estimated lines changed**: ~25 (replace ~68 inline lines with ~10 of component usage)

---

#### Task 9: Update `astro.config.mjs` — add "person" icon

**Description**: Add `"person"` to the `material-symbols` include list for the Instructor section heading and Audience Fit section.

**File**: `astro.config.mjs` (modify)

**Dependencies**: None

**Acceptance**:
- [ ] `"person"` added to the `include["material-symbols"]` array
- [ ] Ionic/astro-icon builds without error

**Estimated lines**: +1

---

### PR 2 — Detail Section Parsing Components

#### Task 2: Create `CourseCurriculum.astro` component

**Description**: Parse `curso.body` (raw markdown) into H2-delimited sections server-side. Implement a ~40-line `mdToHtml()` function that converts basic markdown (paragraphs, bold, H3, lists, links) to HTML. Render sections with per-type CSS hooks:
- `## Dirigido a` / `## ¿Quiénes pueden participar?` → audience card with person icon
- `## Objetivo` → capability cards with check-circle icon per list item
- `## Temario` → H3 module cards with `bg-primary-container/10`
- All other H2 sections → prose-styled fallback (using `prose` classes for unmatched sections like Agenda, Contacto, Metodología)

**File**: `src/components/CourseCurriculum.astro` (create)

**Dependencies**: None

**Acceptance**:
- [x] Exports `mdToHtml(markdown: string): string` converting paragraphs, `<strong>`, `<h3>`, `<ul>/<li>`, `<a>` to HTML
- [x] Splits body into sections by `^## ` heading regex
- [x] Audience extraction: case-insensitive match for "Dirigido a" or "¿Quiénes pueden participar?"
- [x] Objectives extraction: case-insensitive match for "Objetivo" → bullet list items → capability cards
- [x] Curriculum extraction: "Temario" → CSS-scope H3 -> module card styling
- [x] Unmatched H2 sections render with prose classes
- [x] Missing sections are gracefully omitted (no empty containers)
- [x] Section `id` attributes for anchor navigation
- [x] Zero client JS — all rendering at build time

**Estimated lines**: ~110

---

#### Task 3: Create `CourseInstructor.astro` component

**Description**: Extract inline instructor markup from `[slug].astro` (lines 131-145) into a reusable component. Add credential badge extraction: regex for "NFPA", "AWS", "\\d+ años" in bio text. Render grid of instructor cards with name, badge tags, and condensed bio.

**File**: `src/components/CourseInstructor.astro` (create)

**Dependencies**: None

**Acceptance**:
- [x] Props: `instructors: Array<{name: string; bio?: string}>`
- [x] Single instructor: highlighted card with `<h3>` name
- [x] Multiple instructors: 1-col mobile / 2-col desktop grid (`grid grid-cols-1 sm:grid-cols-2`)
- [x] Credential badges: scan bio for "NFPA", "AWS", "\\d+ años" → render as styled tags
- [x] Bio text rendered as condensed paragraph (max 3 lines with line-clamp, expandable)
- [x] Empty instructors array → renders nothing (null)
- [x] Section heading `<h2>`: "Instructor(es)" with `person` icon

**Estimated lines**: ~65

---

### PR 3 — Detail Interactive Components

#### Task 4: Create `CourseFAQ.astro` component

**Description**: Extract "Información importante" H2 section from course body and render as an accessible accordion using native `<details>/<summary>` elements. Zero JavaScript.

**File**: `src/components/CourseFAQ.astro` (create)

**Dependencies**: None (receives pre-parsed HTML for the FAQ section)

**Acceptance**:
- [x] Props: `faqs?: Array<{question, answer}>` + `className?` — defaults to CBHE-standard 5-FAQ set
- [x] Wraps each FAQ in a `<details>/<summary>` accordion item with native keyboard support
- [x] Native HTML accordion — keyboard-operable with Enter/Space, zero JS
- [x] Styled with MD3 tokens, smooth open/close via CSS `grid-template-rows` transition
- [x] Section heading `<h2>`: "Preguntas frecuentes", custom caret via Icon rotate
- [x] Missing content → renders default FAQs (never empty)

**Estimated lines**: ~40 | **Actual**: 119

---

#### Task 5: Create `CourseCTA.astro` component

**Description**: Dual-mode CTA component: sticky bottom bar on mobile (`< 768px`) + inline buttons on desktop. Uses IntersectionObserver (~15 lines client JS) to show/hide sticky bar when user scrolls past the hero CTA.

**File**: `src/components/CourseCTA.astro` (create)

**Dependencies**: None

**Acceptance**:
- [x] Props: `canvaLink?: string`, `whatsappNumber?: string` (default "59178500177"), `className?`
- [x] Desktop (>= 768px): hidden (replaced by in-page CTAs in [slug].astro)
- [x] Mobile (< 768px): `position: fixed; bottom: 0` sticky bar with `pb-[env(safe-area-inset-bottom)]`
- [x] IntersectionObserver script: sticky bar hidden when hero sentinel is in viewport, visible when scrolled past
- [x] Both buttons `min-h-[44px]`, adequate spacing
- [x] `will-change: transform` + `transition: transform 300ms ease` for smooth slide
- [x] Respects `prefers-reduced-motion` (via global.css rule)
- [x] WhatsApp SVG icon inline + Canva text button

**Estimated lines**: ~85 | **Actual**: 105

---

#### Task 6: Create `RelatedCourses.astro` component

**Description**: Display up to 3 related courses below the detail page CTA. Match by `category`, exclude current course, fill remaining slots with most recent courses.

**File**: `src/components/RelatedCourses.astro` (create)

**Dependencies**: Task 1 (CourseCard.astro for rendering) — but import is internal, PR 3 comes after PR 1 merges

**Acceptance**:
- [x] Props: `currentSlug: string`, `category: string`, `allCourses: CollectionEntry<"cursos">[]`
- [x] Filters by category, excludes current, picks 3 (same-category first, then fill with others)
- [x] If fewer than 3 category matches, fills with most recent from any category
- [x] Only 1 course total → renders nothing (empty fragment)
- [x] Renders each course as `<CourseCard variant="compact" />`
- [x] Section heading `<h2>`: "Cursos relacionados"
- [x] 1-col mobile / 2-col md / 3-col lg grid

**Estimated lines**: ~65 | **Actual**: 71

---

### PR 4 — Detail Page Assembly + Verification

#### Task 7: Update `[slug].astro` detail page

**Description**: Restructure into the 11-section decision-first layout. Replace inline markup with new components. Parse `curso.body` through `CourseCurriculum` for section extraction. Wire in all detail components in order:
1. **Outcome Hero**: image/fallback + title (`<h1>`) + subtitle description + WhatsApp CTA
2. **Quick Facts**: startDate, modality, price, registrationDeadline in horizontal scroll bar
3. **Who Is This For**: audience content from CourseCurriculum
4. **Learning Outcomes**: capability cards from CourseCurriculum (Objetivo)
5. **Curriculum**: module cards from CourseCurriculum (Temario)
6. **Instructor**: `<CourseInstructor>` component
7. **Social Proof**: (placeholder — descriptive text from course body or omit if none)
8. **Practical Details**: Agenda + "Información importante" content from CourseCurriculum
9. **FAQ**: `<CourseFAQ>` component
10. **Final CTA**: inline `<CourseCTA>` (desktop mode)
11. **Related Courses**: `<RelatedCourses>` component
- Plus `<CourseCTA>` sticky bar (mobile mode) at page level

**File**: `src/pages/capacitacion/[slug].astro` (modify)

**Dependencies**: Tasks 2, 3, 4, 5, 6

**Acceptance**:
- [x] All 11 sections present in order (missing sections omitted gracefully)
- [x] Each `<section>` has `aria-labelledby` pointing to heading `id`
- [x] Heading hierarchy: h1 (title) → h2 (section headings) → h3 (module/instructor names) — no skips
- [x] Quick Facts: horizontal scroll on mobile `< 768px` with `scroll-snap-type: x mandatory`
- [x] Audience Fit: styled card with groups icon
- [x] Learning Outcomes: check-circle icons per capability
- [x] Curriculum: module cards via CourseCurriculum component
- [x] Instructor: credential badges via CourseInstructor component
- [x] FAQ: native `<details>/<summary>` accordion via CourseFAQ component
- [x] Related Courses: up to 3 compact cards via RelatedCourses component
- [x] Breadcrumb preserved
- [x] Sticky mobile CTA bar (via CourseCTA) at page root
- [x] All images `loading="eager"` for hero (above fold), aspect-ratio via container
- [x] Zero horizontal overflow at 375px (Quick Facts bar uses scrollbar-none)
- [x] All touch targets ≥ 44px

**Estimated lines changed**: ~120 | **Actual**: 673 insertions, 150 deletions (new file: ~720 lines)

---

#### Task 10: Build verification

**Description**: Run `npx astro build` and verify zero exit code. Spot-check 5 varied course output HTML files in `dist/` for correct section rendering.

**Dependencies**: Tasks 1-9

**Acceptance**:
- [x] `npx astro build` exits with code 0
- [x] No TypeScript or import errors
- [x] `dist/capacitacion/*.html` files exist for all 8 non-draft courses
- [x] Manual inspection of 3 diverse courses covers: full course (NFPA-70), course with all sections (Python), course with no objectives (Evaluacion Riesgos)

---

## Execution Order

```
PR 1 (main) ─────────────────────────────────────┐
  Task 9: astro.config.mjs (person icon)         │
  Task 1: CourseCard.astro                       │
  Task 8: Update capacitacion.astro              │
PR 1 merges ─────────────────────────────────────┤
                                                  │
PR 2 (main) ─────────────────────────────────────┤
  Task 2: CourseCurriculum.astro                  │
  Task 3: CourseInstructor.astro                  │
PR 2 merges ─────────────────────────────────────┤
                                                  │
PR 3 (main) ─────────────────────────────────────┤
  Task 4: CourseFAQ.astro                         │
  Task 5: CourseCTA.astro                         │
  Task 6: RelatedCourses.astro                    │
PR 3 merges ─────────────────────────────────────┤
                                                  │
PR 4 (main) ─────────────────────────────────────┤
  Task 7: Update [slug].astro                     │
  Task 10: Build verification                      │
PR 4 merges ─────────────────────────────────────┘
```

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| `mdToHtml()` misses markdown edge cases | Medium | Content is controlled by CBHE team (no user-generated); 3 sample files audited for patterns |
| Section heading variants not exhaustive | Low | Case-insensitive regex, 3 known patterns mapped; unmatched sections fall through to prose |
| Sticky CTA flickers on iOS Safari | Low | GPU layer promotion via `transform: translateZ(0)` + `will-change: transform` |
| Glass-card dark mode | Low | Already handled in global.css `.glass-card` class |
| Load-more pattern breaks with CourseCard | Low | Apply `data-load-more-item` to CourseCard's `<article>` root |

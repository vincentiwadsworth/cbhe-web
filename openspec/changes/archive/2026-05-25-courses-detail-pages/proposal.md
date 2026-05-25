# Proposal: Courses Detail Pages + Card Improvements

**Change name**: `courses-detail-pages`
**Status**: proposed
**Date**: 2026-05-25
**Topic key**: `sdd/courses-detail-pages/proposal`

---

## Executive Summary

Upgrade the course detail page (`src/pages/capacitacion/[slug].astro`) and listing cards (inline in `src/pages/capacitacion.astro`) to follow 2026 conversion best practices for educational content. This means restructuring the learner decision journey from "here's a course" to "here's why this course is right for you," extracting a reusable `CourseCard.astro` component, and improving mobile-first responsiveness and accessibility.

The detail page currently renders course content as raw markdown without structure, uses a generic hero, and offers only WhatsApp as a CTA. The listing page has inline card markup that can't be reused. Both pages lack the information hierarchy that drives enrollment decisions.

---

## Intent

Transform course pages from information dumps into decision-support experiences that help learners answer: "Is this course right for me, and what will I be able to do after?"

---

## Current State

### Detail page (`src/pages/capacitacion/[slug].astro`, 195 lines)
- **Hero**: Image + title + metadata pills (category, modality)
- **Info cards**: Start date, price, registration deadline in `surface-container-low` cards
- **Description box**: Left-bordered accent box
- **Canva link CTA**: Prominent card with link to Canva design
- **Instructors**: Grid of name + bio cards
- **Course body**: Raw markdown rendered via `prose` classes (contains objectives, target audience, curriculum modules, agenda, contact info — all unstructured)
- **Final CTA**: Canva link + WhatsApp button
- **Back link**: Simple text link to listing

### Listing page (`src/pages/capacitacion.astro`, 363 lines)
- Cards are inline `<article>` elements with glass-card styling (lines 229-296)
- Each card: image/placeholder → category → title → description (line-clamp-2) → date + price → CTA button
- CTA logic: if `canvaLink` exists → "Ver más" (external link), else → "Ver detalles" (internal link to `capacitacion/${curso.id}`)
- Load-more pagination via `data-load-more` attribute

### Content schema (`src/content.config.ts`)
- Frontmatter: `title`, `category`, `modality`, `image`, `startDate`, `price`, `registrationDeadline`, `canvaLink`, `description`, `instructors[]`, `draft`
- Markdown body: freeform sections (varies per course: objectives, target audience, modules, agenda, contact)

### Design system
- MD3 tokens in `src/styles/global.css` (50 tokens, light + dark mode)
- Tailwind v4 with `@theme` configuration
- Inter font family (400-800), Latin subset
- 33 Material Symbols icons pre-loaded

---

## Proposed Changes

### 1. Redesign Course Detail Page — Decision-First Structure

**Problem**: Current layout follows a "document" pattern (image → title → metadata → body) instead of a "decision" pattern that guides learners toward enrollment.

**Proposed section order** (following 2026 best practices for educational content):

| # | Section | Purpose | Source |
|---|---------|---------|--------|
| 1 | **Breadcrumb** | Orientation | Existing |
| 2 | **Outcome Hero** | Headline communicates what they'll be able to DO, not just the title. Subtitle with key differentiator (modality, duration, certification). Primary CTA immediately visible. | Enhanced existing hero |
| 3 | **Quick Facts Bar** | Sticky/compact bar with date, modality, price, deadline — scannable at a glance | Reorganized info cards |
| 4 | **Who Is This For?** | Audience fit section — helps learners self-qualify | Extract from markdown "Dirigido a" |
| 5 | **What You'll Achieve** | Outcomes as capability statements | Extract from markdown "Objetivo" |
| 6 | **Curriculum** | Structured modules with capability language | Extract from markdown "Temario" / modules |
| 7 | **Instructor Credibility** | Specific evidence (credentials, experience, NFPA authorization) | Enhanced existing section |
| 8 | **Social Proof** | Testimonials or stats (15,275+ professionals trained) | New section, reuse existing stats |
| 9 | **Practical Details** | Agenda, methodology, requirements | Extract from markdown "Agenda", "Metodología" |
| 10 | **FAQ / Policies** | Attendance requirements, certificate conditions, refunds | Extract from markdown "Información importante" |
| 11 | **Final CTA** | Multiple options: WhatsApp, email, Canva | Enhanced existing CTA |

**Key structural changes**:
- Hero H1 remains the course title (for SEO), but add an outcome-oriented subtitle/tagline below it
- Move the Canva CTA from mid-page to the final CTA area (reduce distraction)
- Parse markdown body into structured sections using heading detection (H2/H3 patterns)
- Add a table of contents / jump nav for long courses (desktop) or anchor links (mobile)

### 2. Extract `CourseCard.astro` Component

**Problem**: Card markup is duplicated inline in the listing page (67 lines of inline HTML). If we ever need cards elsewhere (homepage featured courses, related courses), we'd duplicate again.

**Proposed component**: `src/components/CourseCard.astro`

```
Props:
  - course: CollectionEntry<"cursos">
  - variant: "default" | "compact" | "featured" (default: "default")
  - ctaText?: string (override default CTA text)
  - ctaHref?: string (override default CTA href)

Responsibilities:
  - Image with fallback placeholder
  - Category badge + modality badge
  - Title (linked to detail page)
  - Description with line-clamp
  - Date + price metadata
  - CTA button (smart: Canva link → external, no Canva → detail page)
  - Accessible: proper aria-labels, heading hierarchy
```

**Variants**:
- `default`: Full card for listing page (current design, improved)
- `compact`: Smaller card for "related courses" section
- `featured`: Larger card with more prominent image for homepage (future)

### 3. Redesign Course Cards — Better Information Hierarchy

**Current issues**:
- Category and title compete for attention (same visual weight)
- Description is line-clamped but may not be the most useful preview
- No visual differentiation between "Curso" and "Certificación"
- CTA goes to Canva (external) when available, bypassing the detail page entirely

**Proposed improvements**:
- Category as small label, title as dominant text
- Add a visual badge for "Certificación" vs "Curso" (different color/weight)
- Show key differentiator: duration or key topic count if available
- CTA always goes to detail page (internal), Canva link becomes secondary action
- Add hover state with subtle scale + shadow (existing `group-hover:scale-105` is good)

### 4. Structured Curriculum Rendering

**Problem**: Course body markdown renders as raw prose. Modules, objectives, and agenda sections have no visual distinction.

**Approach**: Since we're NOT adding new CMS fields, we'll parse the markdown body server-side to extract structured sections:

1. Render markdown to HTML (existing `Content` component)
2. Use Astro's `collectLinks` or a simple regex/heading parser to identify section boundaries
3. Wrap identified sections in styled containers:
   - **Objetivo** → outcome cards with checkmark icons
   - **Dirigido a** → audience list with person icons
   - **Temario** → accordion or expandable module cards
   - **Agenda** → timeline-style layout
   - **Información importante** → alert/info box
   - **Contacto** → contact card

**Alternative**: If parsing proves fragile, use CSS to style markdown sections based on heading text patterns (e.g., `h2:has-text("Objetivo")` → specific styles). This is less robust but zero-risk.

**Decision**: Start with CSS-based styling of markdown sections (lower risk, no parsing complexity). If that's insufficient, move to server-side parsing in a follow-up.

### 5. Enhanced Instructor Section

**Problem**: Instructor cards show name + bio but don't highlight credibility signals (NFPA authorization, years of experience, specific achievements).

**Proposed improvements**:
- Parse bio for credibility signals (keywords: "NFPA", "autorizado", "años", "experiencia", "miembro")
- Display credential badges/icons next to instructor name
- Add a "credentials" sub-section if bio contains structured info
- Keep it simple: no new fields, just better visual presentation of existing bios

### 6. Related Courses Section

**Problem**: No cross-linking between courses. Learners who land on one course have no path to discover others.

**Proposed**: Add a "Cursos relacionados" section at the bottom of the detail page:
- Filter by same `category` (Curso vs Certificación)
- Show 3 courses using the new `CourseCard.astro` with `variant="compact"`
- Exclude current course
- If fewer than 3 matches, fill with most recent courses

### 7. Mobile-First Responsive Improvements

**Current mobile issues** (inferred from desktop-first layout):
- Info cards stack vertically but take full width — could be more compact
- Instructor grid is 1-col on mobile (correct) but cards are large
- CTA section has stacked buttons that may be too tall on small screens
- No sticky CTA on mobile scroll

**Proposed**:
- Quick facts bar as horizontal scroll on mobile (like app store metadata)
- Sticky bottom CTA bar on mobile (WhatsApp + Canva)
- Reduce padding and font sizes proportionally
- Ensure all touch targets ≥ 44×44px (already done with `min-h-[44px]`)
- Test at 375px viewport width

### 8. Accessibility Audit Pass

**Checklist** (based on ui-ux-pro-max skill):
- [ ] Color contrast ≥ 4.5:1 for all text (verify with design tokens)
- [ ] Focus rings visible on all interactive elements (existing `:focus-visible` is good)
- [ ] Heading hierarchy: h1 → h2 → h3, no skips
- [ ] Alt text on all images (existing, verify quality)
- [ ] ARIA labels on icon-only buttons
- [ ] Skip links for keyboard navigation
- [ ] `prefers-reduced-motion` respected (existing, verify all new animations)
- [ ] Semantic HTML: `<article>`, `<section>`, `<nav>`, `<time>`
- [ ] Breadcrumb uses proper `aria-label` and structured data
- [ ] Course cards use `<article>` with proper heading hierarchy

---

## Out of Scope

These are explicitly NOT part of this change:

| Item | Reason |
|------|--------|
| CMS integration changes | Sveltia CMS works fine; no changes needed |
| New content collection fields | We're working with existing frontmatter |
| Payment/registration system | WhatsApp/email is the current flow; keep it |
| Search functionality | Separate feature, needs its own proposal |
| RSS/iCal/PDF generation | Nice-to-have, not conversion-critical |
| Dark mode redesign | Existing dark mode works; audit only |
| Internationalization | Spanish-only for now |

---

## Files to Change

| File | Change |
|------|--------|
| `src/pages/capacitacion/[slug].astro` | Major rewrite — new section structure, styled markdown sections |
| `src/pages/capacitacion.astro` | Replace inline card markup with `<CourseCard>` component |
| `src/components/CourseCard.astro` | **NEW** — reusable course card component |
| `src/styles/global.css` | Add CSS rules for styled markdown sections (curriculum, objectives, etc.) |
| `src/components/CourseCard.astro` | **NEW** — reusable course card |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Markdown parsing is fragile (courses have varied section headings) | Medium | Start with CSS-based styling; parse only if CSS proves insufficient |
| Related courses logic may show irrelevant courses | Low | Category-based matching is simple but effective; can refine later |
| Page size increases with more sections | Low | Astro SSG means zero runtime cost; only build time |
| Breaking existing links or bookmarks | Low | URL structure unchanged (`/capacitacion/[slug]`) |
| Canva link CTA removal frustrates users | Medium | Keep Canva link but move to final CTA area, not remove |

---

## Success Criteria

1. **Build passes**: `npx astro build` completes without errors
2. **All 25 courses render correctly**: No broken layouts, all sections visible
3. **Card component works**: Listing page uses `<CourseCard>` with identical visual output (or better)
4. **Mobile responsive**: Tested at 375px, 768px, 1024px, 1440px
5. **Accessibility**: No contrast violations, proper heading hierarchy, keyboard navigable
6. **No regressions**: All existing links, images, and metadata preserved

---

## Recommended Next Step

After proposal approval, proceed to **spec phase** (`sdd-spec`) to define detailed requirements for each section of the detail page, the CourseCard component API, and the CSS styling rules for markdown sections.

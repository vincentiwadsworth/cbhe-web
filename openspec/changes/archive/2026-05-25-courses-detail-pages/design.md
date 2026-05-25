# Design: Courses Detail Pages + Card Improvements

## Technical Approach

Parse `curso.body` (raw markdown) into H2-delimited sections server-side. A lightweight 40-line `mdToHtml()` function converts basic markdown (paragraphs, bold, H3, lists, links) to HTML — no external dependency. This eliminates the `Content` component for the detail page, giving full control over section extraction, ordering, and CSS scoping. The listing page (`capacitacion.astro`) extracts inline card markup into a reusable `CourseCard.astro` component with three variants.

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Parse raw `curso.body` + custom converter | Full control, no Content dup, ~40 lines of regex | **Chosen** — avoids dual-render conflicts, gives per-section CSS hooks |
| `Content` component + CSS hiding | Simpler but fragile — must hide extracted sections via CSS, duplication risk | Rejected — prone to layout bugs with complex markdown |
| Add `marked` npm dependency | 30KB, proper parsing | Rejected — overkill for our content (lists, paragraphs, bold) |
| CourseCard as single component with `variant` prop | 3 variants in one file, shared markup | **Chosen** — simpler than 3 separate components |
| Sticky CTA with IntersectionObserver | Adds ~15 lines of client JS | **Chosen** — follows existing `initLoadMore()` pattern, scroll-triggered on mobile only |

## Component Tree

```
NEW:
  CourseCard.astro       { course, variant, ctaText?, ctaHref? }
    → variant: "default" | "compact" | "featured"
    → Renders: <article> with glass-card, image, category badge, title, desc, meta, CTA

  CourseCurriculum.astro { bodyHtml: string, sections: Map }
    → Renders extracted H2 sections with per-type CSS wrappers
    → Special: Temario H3s get bg-primary-container/10 module cards
    → Default: prose-styled for unmatched sections

  CourseInstructor.astro { instructors: Array<{name, bio}> }
    → Credential parsing: regex for "NFPA", "AWS", "\d+ años"
    → Renders: grid of cards with name, badge tags, condensed bio

  CourseFAQ.astro        { policies: string }
    → Renders policies from "Información importante" section
    → Uses <details>/<summary> for accordion (zero JS)

  CourseCTA.astro        { canvaLink?, whatsapp: string }
    → Sticky bar (mobile) + inline CTA (desktop)
    → Client JS: IntersectionObserver toggles sticky bar visibility

  RelatedCourses.astro   { currentId, category, allCourses }
    → Filter by category, exclude self, fill to 3 with recent courses
    → Renders: <CourseCard variant="compact"> per match

MODIFIED:
  [slug].astro           → replaces inline markup with new components
  capacitacion.astro     → replaces inline card HTML with <CourseCard>
  astro.config.mjs       → add "person" to icon include list
```

## Data Flow

```
Content Collection (glob .md)
  → getCollection("cursos", filter !draft)
  → [slug].astro:
      1. Find curso by c.id === slug
      2. Parse curso.body → Section[] (split by /## /, match heading text)
      3. Render structured sections via CourseCurriculum
      4. Extract Dirigido a → <section> audience card
      5. Extract Objetivo → <section> capability cards
      6. Extract Temario → CSS-styled module cards (H3 wrapper)
      7. Remaining sections → prose fallback
      8. CourseInstructor ← curso.data.instructors
      9. CourseFAQ ← extract "Información importante"
     10. CourseCTA (sticky mobile bar)
     11. RelatedCourses ← filter by category, exclude self, fill to 3

  → capacitacion.astro:
      1. getCollection("cursos") → sort by startDate
      2. Map to <CourseCard variant="default">
      3. Load-more pattern unchanged
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/components/CourseCard.astro` | Create | Reusable card, 3 variants, smart CTA routing |
| `src/components/CourseCurriculum.astro` | Create | Section parser + HTML renderer for markdown body |
| `src/components/CourseInstructor.astro` | Create | Instructor grid with credential badge extraction |
| `src/components/CourseFAQ.astro` | Create | Accordion from policies markdown |
| `src/components/CourseCTA.astro` | Create | Sticky mobile bar + inline desktop CTA |
| `src/components/RelatedCourses.astro` | Create | Category-matched course cards (3 max) |
| `src/pages/capacitacion/[slug].astro` | Modify | Restructure: new section order, extract markdown |
| `src/pages/capacitacion.astro` | Modify | Replace inline cards with `<CourseCard>` |
| `astro.config.mjs` | Modify | Add `"person"` to material-symbols include |

## Interfaces / Contracts

```typescript
// CourseCard.astro props (TypeScript interface)
interface Props {
  course: CollectionEntry<"cursos">;
  variant?: "default" | "compact" | "featured";
  ctaText?: string;
  ctaHref?: string;
}

// CourseCurriculum.astro — section type discriminator
type SectionType = "intro" | "objetivo" | "dirigido-a" | "temario" | "agenda" | "info-importante" | "contacto" | "metodologia" | "other";

interface Section {
  heading: string;      // "Objetivo", "Dirigido a", etc.
  content: string;      // raw markdown content
  htmlContent: string;  // converted HTML
  type: SectionType;
}

// mdToHtml(md: string): string  — lightweight converter
// Handles: **bold**, [links](url), ### H3, - list, blank-line paragraphs
```

## CSS Strategy

- **Reuse MD3 tokens**: `primary-container`, `surface-container-low`, `on-surface-variant` from global.css
- **Prose fallback**: `@tailwindcss/typography` for unmatched sections (Agenda, Contacto, Metodología)
- **Curriculum modules**: CSS scoping — H3s within Temario get `bg-primary-container/10 rounded-lg p-4`
- **CourseCard glass-card**: Reuse existing `.glass-card` utility class
- **Mobile-first**: Base styles for 375px, `sm:` (640px), `md:` (768px), `lg:` (1024px)
- **New component classes**: `.curriculum-module`, `.capability-card`, `.audience-card` — scoped to component `<style>` tags
- **Sticky bar**: `fixed bottom-0` on mobile, `pb-[env(safe-area-inset-bottom)]`

## Responsive Strategy

| Breakpoint | Layout |
|-----------|--------|
| 375px (base) | Single column, stack cards, horizontal scroll Quick Facts, sticky CTA bar |
| 768px (md) | Quick Facts inline row, 2-col instructor grid, CTA buttons side-by-side |
| 1024px (lg) | 2-col Quick Facts, larger hero image, compact cards in 3-col grid |
| 1280px (xl) | Max-width container at `max-w-5xl` for readable line length |

- **Sticky CTA**: `position: fixed; bottom: 0` at `<768px`, hidden at `≥768px` via IntersectionObserver
- **Quick Facts bar**: `overflow-x: auto; scroll-snap-type: x mandatory` on mobile, inline flex on desktop
- **Touch**: all CTAs `min-h-[44px]`, tap targets spaced ≥8px

## Performance

- Zero client JS for rendering (only ~15 lines for sticky CTA scroll detection)
- All images `loading="lazy"` with `aspect-video` or `aspect-4/3` to prevent CLS
- Preconnect for external origins (Canva, WhatsApp) via `<link rel="preconnect">` in Layout.astro
- No new npm dependencies — lightweight `mdToHtml()` is ~40 lines, runs at build time
- SSG output: one HTML file per course, ~15-25KB each uncompressed

## Accessibility

- **Heading hierarchy**: h1 (title) → h2 (section headings) → h3 (curriculum modules, instructor names)
- **ARIA landmarks**: `<nav>` (breadcrumb), `<article>` (CourseCards), `<section aria-labelledby>` per section
- **Skip link**: already present in Layout.astro → `#main-content`
- **Focus**: `:focus-visible` ring from global.css, tab order follows visual order
- **Reduced motion**: `.reveal` animations disabled via `prefers-reduced-motion` (already in global.css)
- **Contrast**: all text uses MD3 token pairs verified ≥4.5:1 in light mode
- **FAQ accordion**: native `<details>/<summary>` — keyboard-operable with Enter/Space, zero JS

## Testing Strategy

| Layer | What | How |
|-------|------|-----|
| Build | All 25 courses render without error | `npx astro build` — zero exit code |
| Visual | Section extraction correct for 5 varied courses | Manual inspection of `.html` output files |
| Responsive | No horizontal overflow at 375px | Browser DevTools device emulation |
| A11y | Heading hierarchy, landmarks, contrast | axe DevTools + manual keyboard tab-through |
| Regression | Listing page cards visually match current | Screenshot comparison, load-more still works |
| Edge | Missing sections (no Objetivo, no instructors) | Test with minimal markdown courses |

## Open Questions

- None — all design decisions resolved

## Migration / Rollout

No migration required. The change is self-contained: detail page structure changes, listing page swaps to CourseCard component. Existing URLs and content files are untouched.

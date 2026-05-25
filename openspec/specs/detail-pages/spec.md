# Detail Pages Specification

## Purpose

Transform course detail pages from unstructured markdown dumps into decision-support experiences that guide learners through the enrollment journey. Extract a reusable `CourseCard` component from inline listing markup and apply mobile-first, accessible patterns across both pages.

---

## Requirements

### Requirement: Detail page follows decision-first 11-section layout

The detail page MUST render sections in this order: Outcome Hero → Quick Facts → Who Is This For → Learning Outcomes → Curriculum → Instructor → Social Proof → Practical Details → FAQ → Final CTA → Related Courses. Each section MUST use semantic HTML (`<section>`) with `aria-labelledby` pointing to the section heading.

#### Scenario: Default layout renders all 11 sections

- GIVEN a course with full frontmatter (instructors, canvaLink, description) and rich markdown body
- WHEN the detail page renders
- THEN all 11 sections appear in order
- AND each `<section>` has a heading (`<h2>`) with matching `id`

#### Scenario: Missing sections are gracefully omitted

- GIVEN a course with no instructors and no canvaLink
- WHEN the detail page renders
- THEN Instructor section and Canva link in Final CTA are absent
- AND remaining sections preserve their order without gaps

#### Scenario: Outcome Hero shows title, subtitle, and primary CTA

- GIVEN a course page
- WHEN the hero section renders
- THEN the `<h1>` shows the course title
- AND a subtitle communicates a key outcome or differentiator
- AND a primary CTA button ("Consultar por WhatsApp") is immediately visible above the fold

### Requirement: Quick Facts Bar shows key metadata at a glance

The Quick Facts section MUST display startDate, modality, price, and registrationDeadline in a compact horizontal row. On mobile (< 768px) the bar MUST enable horizontal scrolling with `overflow-x: auto` and `scroll-snap-type: x mandatory`.

#### Scenario: Desktop shows full inline row

- GIVEN a viewport ≥ 768px
- WHEN Quick Facts renders
- THEN all facts display in a single inline row without scrolling

#### Scenario: Mobile scrolls horizontally

- GIVEN a viewport < 768px
- WHEN Quick Facts renders
- THEN the container has `overflow-x: auto` with visible scroll affordance
- AND each fact card is `scroll-snap-align: start`

#### Scenario: Missing fields are omitted

- GIVEN a course with no `registrationDeadline`
- WHEN Quick Facts renders
- THEN the deadline card is absent
- AND the row does not show empty placeholders

### Requirement: Audience Fit section helps learners self-qualify

The "Who Is This For" section MUST extract content from the markdown heading "Dirigido a" (or "¿Quiénes pueden participar?"). It MUST render as a styled card with person icon.

#### Scenario: Heading-matched extraction works

- GIVEN a course whose markdown has `## Dirigido a` followed by paragraph text
- WHEN the page renders
- THEN the Audience Fit section shows that paragraph text in a styled card with person icon

#### Scenario: Fallback heading is supported

- GIVEN a course whose markdown uses `## ¿Quiénes pueden participar?`
- WHEN the page renders
- THEN the same Audience Fit section renders the content

#### Scenario: Missing audience section hides the block

- GIVEN a course with no matching heading in its markdown
- WHEN the page renders
- THEN the "Who Is This For" section is omitted

### Requirement: Learning Outcomes renders objectives as capability cards

The "What You'll Achieve" section MUST extract content from the markdown heading "Objetivo". List items MUST render as individual capability cards with a checkmark icon.

#### Scenario: Objectives render as capability cards

- GIVEN a course with `## Objetivo` followed by a bullet list
- WHEN the section renders
- THEN each bullet appears as a separate card with `Icon name="check-circle"` and the capability text

#### Scenario: No objectives section is handled gracefully

- GIVEN a course with no `## Objetivo` heading
- WHEN the page renders
- THEN the Learning Outcomes section is omitted

### Requirement: Structured Curriculum renders modules with capability language

The Curriculum section MUST use CSS to style markdown headings under `## Temario` into module cards. `<h3>` headings inside Temario become module titles with themed backgrounds. List items become capability pills or description text.

#### Scenario: Modules render as styled cards

- GIVEN a course with `## Temario` containing `<h3>` sub-headings and lists
- WHEN the Curriculum section renders
- THEN each `<h3>` appears as a styled module card header with `bg-primary-container/10`
- AND list items appear with bullet or pill styling

#### Scenario: Curriculum section is omitted when no Temario exists

- GIVEN a course with no `## Temario` heading
- WHEN the page renders
- THEN the Curriculum section is absent

#### Scenario: CSS selector approach does not break other H3 elements

- GIVEN a course with `<h3>` headings both inside and outside Temario
- WHEN the page renders
- THEN only `<h3>` elements scoped under the Temario section receive module styling
- AND other `<h3>` elements retain default prose styling

### Requirement: Instructor section shows credibility signals

Instructor cards MUST show name, credential badges (NFPA, AWS, years of experience extracted from bio), and a condensed bio. The section heading MUST be "Instructor(es)" with a person icon.

#### Scenario: Single instructor renders as highlighted card

- GIVEN a course with one instructor who has a bio containing "NFPA" and "22 años"
- WHEN the Instructor section renders
- THEN the instructor name appears as `<h3>`
- AND "NFPA" badge appears as a styled tag
- AND the condensed bio renders below

#### Scenario: Multiple instructors render in grid

- GIVEN a course with 3 instructors
- WHEN the section renders
- THEN instructors display in a 1-col mobile / 2-col desktop grid

#### Scenario: No instructors results in omitted section

- GIVEN a course with empty `instructors` array
- WHEN the page renders
- THEN the Instructor section is absent

### Requirement: Related Courses section shows 3 course cards

The detail page MUST include a "Cursos relacionados" section below the Final CTA. It MUST match by `category`, exclude the current course, and use `CourseCard` with `variant="compact"`. If fewer than 3 matches, fill with most recent courses.

#### Scenario: Category match returns 3+ courses

- GIVEN a course with `category: "Curso"` and 5 other "Curso" entries
- WHEN the Related Courses section renders
- THEN exactly 3 related courses display
- AND the current course is excluded

#### Scenario: Fewer than 3 category matches

- GIVEN a course with `category: "Certificación"` and only 1 other certification
- WHEN the section renders
- THEN the 1 matching certification displays
- AND the remaining slots fill with the most recent courses (any category)

#### Scenario: No related courses at all

- GIVEN only 1 course exists in the collection
- WHEN the page renders
- THEN the Related Courses section is omitted entirely

### Requirement: CourseCard component supports 3 variants

A reusable `CourseCard.astro` component MUST accept `course`, `variant`, `ctaText`, and `ctaHref` props. The `variant` prop MUST support `"default"`, `"compact"`, and `"featured"`.

#### Scenario: Default variant renders full card

- GIVEN `variant="default"`
- WHEN the component renders
- THEN it shows: image with fallback, category label, title (`<h3>`), description (line-clamp-2), date, price, and CTA button
- AND the card uses `<article>` with proper `<hgroup>` or heading hierarchy

#### Scenario: Compact variant renders smaller card

- GIVEN `variant="compact"`
- WHEN the component renders
- THEN the image is smaller (aspect-16/9 → aspect-4/3), description is omitted, and padding is reduced
- AND the CTA button text defaults to "Ver detalles"

#### Scenario: Featured variant renders hero-style card

- GIVEN `variant="featured"`
- WHEN the component renders
- THEN the image is larger (aspect-21/9), title uses `<h2>`, description shows full text (no line-clamp)
- AND category badge is more prominent

#### Scenario: CTA smart-routes based on canvaLink

- GIVEN a course with `canvaLink` and `variant="default"`
- WHEN the card renders
- THEN the primary CTA links to the detail page (`capacitacion/{id}`)
- AND a secondary "Ver en Canva" icon-only link appears

#### Scenario: CTA text and href can be overridden

- GIVEN `ctaText="Inscribirme"` and `ctaHref="/formulario"` are passed
- WHEN the card renders
- THEN the button shows "Inscribirme" and links to `/formulario`

### Requirement: Listing page uses CourseCard component

The listing page (`capacitacion.astro`) MUST replace inline card markup with `<CourseCard variant="default" />`. Visual output MUST be identical or improved.

#### Scenario: All cards render via CourseCard

- GIVEN the listing page loads
- WHEN the course grid renders
- THEN each course appears as a `<CourseCard>` with `variant="default"`
- AND the load-more pattern continues to work

#### Scenario: Category badge differentiates Curso vs Certificación

- GIVEN a "Certificación" course
- WHEN its card renders
- THEN the category badge uses a distinct color (`tertiary`) and includes an award icon
- AND a "Curso" card uses `primary` color with school icon

#### Scenario: CTA always goes to detail page

- GIVEN any listing card
- WHEN the button renders
- THEN it always links to `capacitacion/{id}` regardless of canvaLink presence
- AND if canvaLink exists, a small secondary icon is added

### Requirement: Mobile-first responsive layout works down to 375px

The detail page MUST function at 375px viewport width with no horizontal overflow, all touch targets ≥ 44px, and readable text.

#### Scenario: Sticky bottom CTA on mobile

- GIVEN a viewport < 768px
- WHEN the user scrolls past the first viewport
- THEN a sticky bottom bar appears with WhatsApp + Canva buttons
- AND the bar has `position: fixed; bottom: 0` with proper `safe-area-inset-bottom` padding

#### Scenario: No content overflows at 375px

- GIVEN a viewport width of 375px
- WHEN the page renders
- THEN no horizontal scrollbar appears
- AND all text remains readable (no truncation or overlap)

#### Scenario: Touch targets meet 44px minimum

- GIVEN all interactive elements on the page
- WHEN measured
- THEN every button, link, and interactive control has `min-height: 44px` or an expanded click area

### Requirement: Course pages pass accessibility audit

All course pages MUST satisfy: sequential heading hierarchy (h1 → h2 → h3, no skips), ARIA landmarks on every `<section>`, keyboard-navigable accordion/module sections, focus management on route change, and `prefers-reduced-motion` respected for all new animations.

#### Scenario: Heading hierarchy has no skips

- GIVEN a fully rendered detail page
- WHEN the headings are extracted
- THEN the sequence follows h1 → h2 → h3 without missing levels

#### Scenario: Keyboard navigation reaches all interactive elements

- GIVEN a keyboard-only user
- WHEN tabbing through the page
- THEN every button, link, and interactive section receives visible focus
- AND all accordion/toggle sections are operable with Enter/Space

#### Scenario: Reduced motion disables scroll-triggered animations

- GIVEN `prefers-reduced-motion: reduce` is set
- WHEN the page renders
- THEN all `.reveal` and entrance animations are disabled
- AND content is fully visible on load

---

## Out of Scope

- CMS field changes (no new frontmatter)
- Payment/registration integration
- Search or filtering
- iCal/PDF export
- Dark mode redesign

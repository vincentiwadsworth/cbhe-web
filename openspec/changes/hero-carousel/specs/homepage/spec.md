# Delta for Homepage

## ADDED Requirements

### Requirement: Image Rotation Cycle

The homepage hero MUST cycle through exactly 3 images in fixed sequence with a 19.5s ±0.5s total cycle. Each image MUST remain fully visible for ~5s before a 1.5s crossfade to the next. The cycle MUST loop continuously with zero JavaScript.

#### Scenario: Full cycle completes in expected time

- GIVEN the hero carousel is rendered
- WHEN 19.5s elapses
- THEN the sequence has returned to the first image
- AND each image has been visible at full opacity for ~5s

#### Scenario: Zero-JS operation

- GIVEN the page loads
- WHEN inspected
- THEN no script element drives the animation
- AND only CSS keyframes control the cycle

### Requirement: Crossfade Transition

Image transitions MUST use CSS `opacity` keyframes only, with a 1.5s crossfade duration and linear easing. Transitions MUST be GPU-composited — the animation MUST NOT trigger layout or paint on any frame.

#### Scenario: GPU-composited rendering

- GIVEN the carousel is animating
- WHEN a CSS paint inspector captures rendering
- THEN only composite layers update (no layout or paint triggers)

### Requirement: Decorative Dot Indicators

Exactly 3 dots MUST appear below the hero image area. The active dot MUST have visibly distinct styling (higher opacity or different color). Dots MUST track the active image in sync with crossfade timing. Dots MUST use `aria-hidden="true"` and MUST NOT be clickable, focusable, or interactive.

#### Scenario: Dots synchronize with active image

- GIVEN the carousel is cycling
- WHEN image 2 reaches full opacity
- THEN dot 2 has active styling
- AND dots 1 and 3 have inactive styling

#### Scenario: Dots are decorative only

- GIVEN dots are rendered
- WHEN a user clicks or tabs to a dot
- THEN no action occurs
- AND the dot has no keyboard focus
- AND the dot has `aria-hidden="true"`

### Requirement: Reduced-Motion Fallback

When `prefers-reduced-motion: reduce` is set, the carousel MUST display the first image statically at full opacity. All CSS animations MUST be disabled. No crossfade, no dot transitions, no movement of any kind.

#### Scenario: Static display in reduced motion

- GIVEN `prefers-reduced-motion: reduce` is active
- WHEN the page loads
- THEN only the first image is visible at full opacity
- AND no CSS animation runs

### Requirement: Image Loading Priority

The first carousel image MUST use `fetchpriority="high"`. Subsequent images SHOULD use `loading="lazy"`. All images MUST be ≤100KB after optimization.

#### Scenario: First image loads with priority

- GIVEN the page loads
- WHEN the first `<img>` is inspected
- THEN it has `fetchpriority="high"` or equivalent native priority hint

#### Scenario: Lazy loading on subsequent images

- GIVEN the page loads
- WHEN images 2 and 3 are inspected
- THEN they have `loading="lazy"` set

### Requirement: Accessibility and Alt Text

Each hero image MUST have a unique, descriptive `alt` attribute describing its visual content. The carousel container SHOULD use `role="region"` with an `aria-label` describing it as a decorative gallery. Dots MUST use `aria-hidden="true"`.

#### Scenario: All images have descriptive alt text

- GIVEN the hero carousel renders
- WHEN each `<img>` element is inspected
- THEN each has a non-empty `alt` describing the image content

#### Scenario: Dots are hidden from screen readers

- GIVEN the dots are rendered
- WHEN a screen reader reads the page
- THEN the dots are not announced
- AND each dot has `aria-hidden="true"`

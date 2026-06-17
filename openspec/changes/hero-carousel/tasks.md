# Tasks: Hero Carousel

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~80-100 |
| 500-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | auto-forecast |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
500-line budget risk: Low

## Phase 1: Image Preparation

- [ ] 1.1 Download jakub-pabis gas flare from Unsplash, resize to 1200px width, save as WebP ≤100KB at `public/images/hero/hero-gas-flare.webp`
- [ ] 1.2 Download odile-j4UCo blue flame from Unsplash, recompress to WebP ≤80KB at `public/images/hero/hero-blue-flame.webp`
- [ ] 1.3 Move `public/hero-inicio.webp` → `public/images/hero/hero-gasoducto.webp`

## Phase 2: Core Implementation — `src/pages/index.astro`

- [ ] 2.1 Add inline `<style>` block with shared `@keyframes crossfade` and per-image animation declarations (negative delays: -6.5s, -13s), plus dot keyframe animation
- [ ] 2.2 Replace the single `<img>` wrapper (L66-76) with a Grid-stacked container: 3 `<img>` elements in `grid-area: 1/1`, each with unique descriptive `alt`, `fetchpriority="high"` on first, `loading="lazy"` on images 2-3
- [ ] 2.3 Keep the gradient overlay `<div>` OUTSIDE the image grid stack (absolute positioned over the grid container) so it applies uniformly
- [ ] 2.4 Add decorative dot indicators: 3 `<span>` elements in a flex container below the image area, with `aria-hidden="true"`, synced animation via matching `animation-delay` values
- [ ] 2.5 Update the hero `<header>` semantics: add `role="region"` and `aria-label="Galería decorativa del sector hidrocarburífero"` to the carousel wrapper

## Phase 3: Verification

- [ ] 3.1 Run `npx astro build` — zero errors, 27+ pages built
- [ ] 3.2 Confirm 3 images crossfade in sequence (19.5s cycle, 1.5s fade)
- [ ] 3.3 Confirm decorative dots are `aria-hidden="true"`, non-focusable, and visually track the active image
- [ ] 3.4 Confirm `prefers-reduced-motion: reduce` shows static first image
- [ ] 3.5 Confirm each image ≤100KB

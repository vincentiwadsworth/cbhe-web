# Proposal: Hero Carousel

## Intent

Replace the static hero image on the homepage with a CSS-only crossfade carousel of 3 upstream oil & gas images, increasing visual engagement without JS overhead or page weight.

## Scope

### In Scope
- CSS-only crossfade carousel (3 images, 19.5s cycle, 1.5s crossfade)
- Image optimization: resize/recompress jakub-pabis gas flare (≤100KB) + odile-j4UCo blue flame (≤80KB)
- Image directory: `public/images/hero/` with descriptive filenames
- Decorative dots (CSS-only indicators, no JS)
- Reduced-motion support via `prefers-reduced-motion`

### Out of Scope
- Clickable navigation / interactive dots (confirmed decorative only)
- Swipe/touch support (decorative carousel)
- More than 3 images
- Content collection or CMS integration
- SSG build-time image pipeline (manual optimization)

## Capabilities

### New Capabilities
None — design change to existing page, no new spec-level capability.

### Modified Capabilities
None — no existing spec requirements change.

## Approach

CSS-only crossfade via stacked Grid cells + opacity keyframes:
1. Stack 3 `<img>` elements in the same `grid` cell inside the hero `<div class="absolute inset-0 z-0">`
2. Each image gets a dedicated `@keyframes crossfade-N` — holds opacity 1 for ~5s, crossfades to 0 over 1.5s
3. Combined cycle: 3 × 6.5s = 19.5s total
4. Decorative dots: 3 `<span>` elements with matching `@keyframes dot-active-N` (opacity toggle)
5. GPU-composited (opacity only), zero JS
6. `prefers-reduced-motion`: show first image only, no animation

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/pages/index.astro` (L64-96) | Modified | Replace static `<img>` with 3-image crossfade + dots |
| `public/images/hero/` | New | Image directory (3 webp files) |
| `public/hero-inicio.webp` | Moved | Relocate to `public/images/hero/` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Crossfade timing feels off | Medium | Tweak keyframe % during visual review |
| Image loading jank on slow connection | Low | All ≤100KB after optimization |
| Layout regression vs current hero | Low | Same grid/object-fit pattern as current code |

## Rollback Plan

Revert `src/pages/index.astro` hero section (L64-96) to previous single-`<img>` state (git revert or manual restore). Current code at L64-96 is the safe fallback — no migration or data loss. If `public/hero-inicio.webp` was moved, restore copy to `/public` root.

## Dependencies

None. All assets local. No external APIs, libraries, or JS required.

## Success Criteria

- [ ] `npx astro build` passes without errors
- [ ] 3 images crossfade in browser (19.5s loop, 1.5s fade transitions)
- [ ] Decorative dots visually track the active image
- [ ] `prefers-reduced-motion: reduce` shows static first image, no animation
- [ ] Each image ≤100KB after optimization
- [ ] No visual layout shift vs current hero section

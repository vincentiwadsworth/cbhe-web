# Design: Hero Carousel

## Technical Approach

CSS-only crossfade via Grid-stacked images + opacity `@keyframes`. Single-phase animation with staggered delays matches the 19.5s cycle. Dots are styled `<span>` siblings synced to image keyframes via equivalent delay values.

### Layout Structure

```
header (relative, min-h, overflow-hidden)
└── div.hero-carousel (absolute inset-0 z-0, grid)
    ├── img#hero-img-1   ← grid-area: 1 / 1 (stacked)
    ├── img#hero-img-2   ← grid-area: 1 / 1
    ├── img#hero-img-3   ← grid-area: 1 / 1
    └── div.hero-gradient (absolute inset-0, gradient overlay)
        [gradient overlay — shared, outside the image stack grid]
└── div.hero-dots (relative z-10, flex, justify-center)
    ├── span.dot-1
    ├── span.dot-2
    └── span.dot-3
└── div (relative z-10, text content)
```

The gradient overlay stays OUTSIDE the grid stack so it applies uniformly over all images without per-image keyframe complexity.

### Keyframe Timing

| Image | Visible | Crossfade out | Cycle position | Animation delay |
|-------|---------|---------------|----------------|-----------------|
| 1 | 0s–5s | 5s–6.5s | 0–6.5s | 0s |
| 2 | 6.5s–11.5s | 11.5s–13s | 6.5s–13s | -6.5s |
| 3 | 13s–18s | 18s–19.5s | 13s–19.5s | -13s |

All 3 images share one `@keyframes crossfade`:
```css
@keyframes crossfade {
  0%, 76.9% { opacity: 1; }   /* visible ~5s */
  84.6%     { opacity: 0; }   /* fade out over 1.5s */
  100%      { opacity: 0; }   /* hidden rest of cycle */
}
```

Per-image animation:
```css
.hero-img { grid-area: 1/1; animation: crossfade 19.5s infinite; }
.hero-img:nth-child(1) { animation-delay: 0s; }
.hero-img:nth-child(2) { animation-delay: -6.5s; }
.hero-img:nth-child(3) { animation-delay: -13s; }
```

Negative delays start each image at the correct phase of the cycle instantly (no initial waiting).

### Dot Indicators

Same keyframe pattern, different CSS property (background-color opacity):

```css
@keyframes dot-cycle {
  0%, 76.9% { background: var(--color-inverse-on-surface); }
  84.6%, 100% { background: var(--color-inverse-on-surface)/30; }
}
.hero-dot { animation: dot-cycle 19.5s infinite; }
.hero-dot:nth-child(1) { animation-delay: 0s; }
.hero-dot:nth-child(2) { animation-delay: -6.5s; }
.hero-dot:nth-child(3) { animation-delay: -13s; }
```

Dots use `aria-hidden="true"`, `role="presentation"`, no `tabindex`.

### Affected Files

| File | Change |
|------|--------|
| `src/pages/index.astro` (L64-96) | Replace `<img>` + gradient wrapper with 3-image grid stack + gradient + dots + `<style>` block |
| `public/images/hero/` | New directory with 3 `.webp` images |
| `public/hero-inicio.webp` | Move to `public/images/hero/hero-gasoducto.webp` |

No changes to `src/styles/global.css` — existing `prefers-reduced-motion: reduce` rule (line 126) already kills all animations site-wide.

### Image Files

| File | Source | Action | Target size |
|------|--------|--------|-------------|
| `hero-gasoducto.webp` | `hero-inicio.webp` (move) | Already 92KB ✅ | ≤100KB |
| `hero-gas-flare.webp` | jakub-pabis (Unsplash) | Resize to 1200px + recompress | ≤100KB |
| `hero-blue-flame.webp` | odile-j4UCo (Unsplash) | Recompress | ≤80KB |

### Reduced Motion

Existing global CSS (`* { animation-duration: 0.01ms !important }`) kills all carousel animation automatically. First image stays visible at full opacity because all `opacity: 0` keyframes collapse to near-instant.

### Accessibility

- Each `<img>` gets unique descriptive `alt`
- Carousel wrapper: `role="region" aria-label="Galería decorativa del sector hidrocarburífero"`
- Dots: `aria-hidden="true"`, non-focusable, decorative only
- Gradient overlay: no alt needed (presentational)

### Rollback

Revert `src/pages/index.astro` L64-96 to single `<img>` with `hero-inicio.webp`. Restore image to `public/`. Single git revert.

# Visual Verify Report — Change-A `fix-image-paths-and-card-aspect`

- **Branch:** `feat/custom-domain`
- **HEAD:** `d1a6caf` (archive commit)
- **Change commit:** `74b9059`
- **Verified by:** Playwright (chromium) against `npx astro preview` on `http://localhost:4321`
- **Date:** 2026-07-06
- **Change archive:** `openspec/changes/archive/2026-07-03-fix-image-paths-and-card-aspect/`

---

## 1. Build status — PASS

```
[14:06:21] [build] 29 page(s) built in 4.56s
[14:06:21] [build] Complete!
```

- 29 static pages built, exit code 0
- 1 warning (pre-existing, unrelated to this change): `.accordion-group::details-content > *` (Lightning CSS rejects pseudo-element followed by `>` combinator — CSS file not touched by this change)
- No new warnings introduced

---

## 2. Image path verification — PASS (all 7 locations)

| # | File | Line | Treatment | Result | Evidence |
|---|------|------|-----------|--------|----------|
| 1 | `src/components/CourseCard.astro` | 99 | `src={resolveImageUrl(data.image)}` | PASS | `/capacitacion/` HTML shows `src="/images/nfpa25.jpg"`, `/images/cursos/inspector-soldadura.webp`, etc. — all loaded with `naturalWidth > 0` |
| 2 | `src/pages/capacitacion/[slug].astro` | 100 | `src={resolveImageUrl(curso.data.image)}` | PASS | `/capacitacion/inspector-soldadura-cawi-cwi-aws/` hero `<img src="/images/cursos/inspector-soldadura.webp">` loaded (1200×675 natural) |
| 3 | `src/pages/index.astro` | 537 | `src={resolveImageUrl(articulo.data.image)}` | PASS | Home page Novedades section: `<img src="/images/descarga (2).png">` loaded (1600×1200 natural) |
| 4 | `src/pages/index.astro` | 573 | `src={resolveImageUrl(curso.data.image)}` | PASS | Home page Cursos section: `<img src="/images/nfpa25.jpg">` loaded (720×720 natural) |
| 5 | `src/pages/novedades.astro` | 47 | `` `url('${resolveImageUrl(featured.data.image)}')` `` | PASS | `/novedades/` featured bg: `background-image: url('https://cbhe.org.bo/...XL.jpg')` — single wrapper, no double-wrap |
| 6 | `src/pages/novedades.astro` | 85 | `` `url('${resolveImageUrl(articulo.data.image)}')` `` | PASS | Grid items: `url('/images/descarga (2).png')` + 4 external URLs preserved as-is — all single-wrapper |
| 7 | `src/pages/novedades/[slug].astro` | 68 | `src={resolveImageUrl(articulo.data.image)}` | PASS | `/novedades/la-transición-.../` hero: `<img src="/images/descarga (2).png">` loaded (1600×1200 natural) |

**Negative checks**:
- `rg "url\\('url\\(" dist/**/*.html` → 0 matches (no double-wrapping)
- `rg "src=\"undefined\"|url.*undefined" dist/**/*.html` → 0 matches (no undefined leakage)
- All 4 imports confirmed in source (`grep -n "resolveImageUrl"`)

---

## 3. Aspect ratio verification — PASS (1:1 at all 3 viewports)

Counts on `/capacitacion/` at each viewport (after `window.scrollTo(0, scrollHeight)` to trigger lazy loads):

| Viewport | aspect-square | aspect-video | aspect-4/3 | aspect-21/9 | First 3 cards (px) | Aspect |
|----------|---------------|--------------|------------|-------------|--------------------|--------|
| 375 × 812 (mobile) | **8** | 0 | 1 | 0 | 343×343, 343×343, 343×343 | **1.000** |
| 768 × 1024 (tablet) | **8** | 0 | 1 | 0 | 336×336, 336×336, 336×336 | **1.000** |
| 1440 × 900 (desktop) | **8** | 0 | 1 | 0 | 384×384, 384×384, 384×384 | **1.000** |

- **8 CourseCard default-variant wrappers** carry `aspect-square` at every viewport (1:1 ratio confirmed via `getBoundingClientRect()`)
- **0 elements** with `aspect-video` — confirming the swap took effect
- **1 compact-variant element** still uses `aspect-4/3` (RelatedCourses) — unchanged, regression guard passed
- **0 featured-variant elements** used on this page (out of scope per spec, not present)
- `object-cover` on the `<img>` prevents overflow / distortion even when source aspect ≠ 1:1

---

## 4. Per-page findings

### 4.1 Home `/` (desktop 1440×900)
- **Status**: PASS
- **Screenshot**: `home-desktop-1440.png`
- Hero carousel, alianzas, afiliados, testimonios, novedades, cursos sections all render
- Novedades section image (line 537): `/images/descarga (2).png` — loaded, 1600×1200
- Cursos section image (line 573): `/images/nfpa25.jpg` — loaded, 720×720
- 27 `<img>` total, **0 missing alt**, 8 with `alt=""` (decorative carousel duplicates, appropriate)
- 23 headings, sane order: h1 (hero) → h2 (section) → h3 (article) — no skipped levels
- `lang="es"`, has `<main>`, has h1

### 4.2 Capacitación `/capacitacion/`
- **Status**: PASS
- **Screenshots**: `capacitacion-mobile-375.png`, `capacitacion-tablet-768.png`, `capacitacion-desktop-1440.png`
- **Primary verification target for this change**
- 8 CourseCard default-variant cards, all 1:1 at all 3 viewports (see §3)
- 1 RelatedCourses compact (4:3) card, unchanged
- All images load when scrolled into view
- 26 `<img>` total, **0 missing alt**
- Skip link "Saltar al contenido principal" is the first focused element when Tab is pressed
- 0 console errors

### 4.3 Course detail `/capacitacion/inspector-soldadura-cawi-cwi-aws/`
- **Status**: PASS
- **Screenshot**: `curso-detail-1440.png`
- Hero image (line 99 wrap): `/images/cursos/inspector-soldadura.webp` — loaded (1200×675 natural, 832×468 displayed)
- Related courses use `aspect-4/3` compact variant — unchanged
- 0 console errors

### 4.4 Novedades `/novedades/`
- **Status**: PASS
- **Screenshot**: `novedades-desktop-1440.png`
- **Critical page for REQ-01 inline `url()` edge case**
- Featured bg (line 47): single `url('https://cbhe.org.bo/media/k2/items/cache/b05b9575dfafbeb31354c15a00c57d7b_XL.jpg')` — external absolute URL preserved, 607×358
- Grid bg items (line 85): single wrappers with mix of `/images/descarga (2).png` (local) and external absolute URLs — all single-wrapper, no double-wrap
- 6 `background-image` elements inspected — **0 double-wraps** (`url('url('` count = 0)
- 0 console errors

### 4.5 Novedad detail `/novedades/la-transición-energética-.../`
- **Status**: PASS
- **Screenshot**: `novedad-detail-1440.png`
- Hero image (line 67 wrap): `/images/descarga (2).png` — loaded (1600×1200 natural, 832×624 displayed)
- 0 console errors

---

## 5. Console errors and network failures

### Console errors (per page, with image route active)

| Page | Errors | Source |
|------|--------|--------|
| `/` | 0 | n/a |
| `/capacitacion/` | 0 | n/a |
| `/capacitacion/inspector-soldadura-cawi-cwi-aws/` | 0 | n/a |
| `/novedades/` | 0 | n/a |
| `/novedades/la-transición-.../` | 0 | n/a |

**Pre-existing (out of scope)**: On the very first page load (before installing the cbhe.org.bo→localhost route) the home page shows 2 CORS errors loading `https://cbhe.org.bo/site.webmanifest` from origin `http://localhost:4321`. Not a build issue, not introduced by this change, and won't occur in production where origin matches.

### Network failures (image requests, with route active)

| Status | Count | Notes |
|--------|-------|-------|
| 200 OK | 13 of 13 requested | All local images served via route fulfill from `http://127.0.0.1:4321` |
| 4xx / 5xx | **0** | No broken images |

---

## 6. Accessibility quick check

| Check | Result | Evidence |
|-------|--------|----------|
| `<html lang="es">` | PASS | All pages |
| `<main>` landmark | PASS | All pages |
| `<h1>` on page | PASS | All pages |
| Heading order sane | PASS | h1 → h2 → h3, no skipped levels (sample: home) |
| Skip link works | PASS | First Tab focuses "Saltar al contenido principal" link on `/capacitacion/` |
| Image alt coverage | PASS | 0 missing alts on `/capacitacion/` (26/26) and home (27/27) |
| Empty alt on decorative imgs | Appropriate | 8 imgs with `alt=""` on home — duplicate partner logos for carousel animation, correctly marked decorative |
| Min target size | PASS | Buttons have `min-h-[44px]` / `min-w-[44px]` (visible in HTML) |

No accessibility regressions introduced by the aspect-square change.

---

## 7. Layout overflow (side-finding, not in scope)

A pre-existing horizontal overflow at the **768px tablet viewport** was observed — `document.documentElement.scrollWidth = 1006` vs `innerWidth = 768` (overflow 238px). Root cause: the desktop nav (`class="hidden md:flex items-center space-x-8"`) becomes visible at `md` (768px) but the 7 nav items + "Afiliarse" button total 643px wide and don't fit in 768px. **Confirmed pre-existing**: the same overflow exists on the home page (no CourseCard, no aspect-square change). Out of scope for change-A.

At 1440px and 375px, no overflow.

---

## 8. Verdict — SHIP-READY

All 4 REQs from `spec.md` are visually confirmed:

- **REQ-01** (7 image references wrapped) — PASS
- **REQ-02** (CourseCard default at 1:1) — PASS at 375 / 768 / 1440
- **REQ-03** (build zero new warnings) — PASS (only pre-existing CSS warning)
- **REQ-04** (HTML has valid URLs, no `undefined` or double-wrap) — PASS

The 8 CourseCard default-variant cards render square (343 / 336 / 384 px) at all three viewports, images load with no broken URLs, accessibility is intact, and the 7 in-scope `resolveImageUrl` wraps are confirmed both in source and in rendered HTML.

**Action items for the orchestrator**: none. The pre-existing 768px nav overflow is a separate concern that should be tracked as a follow-up but is not blocking change-A.

---

## Screenshots produced

| File | Page | Viewport | Size (bytes) |
|------|------|----------|--------------|
| `home-desktop-1440.png` | `/` | 1440×900 | 2,163,720 |
| `capacitacion-mobile-375.png` | `/capacitacion/` | 375×812 | 849,734 |
| `capacitacion-tablet-768.png` | `/capacitacion/` | 768×1024 | 1,047,675 |
| `capacitacion-desktop-1440.png` | `/capacitacion/` | 1440×900 | 1,496,122 |
| `curso-detail-1440.png` | `/capacitacion/inspector-soldadura-cawi-cwi-aws/` | 1440×900 | 1,199,387 |
| `novedades-desktop-1440.png` | `/novedades/` | 1440×900 | 460,461 |
| `novedad-detail-1440.png` | `/novedades/la-transición-.../` | 1440×900 | 1,222,644 |

All screenshots saved at the working-directory root (where Playwright dropped them).

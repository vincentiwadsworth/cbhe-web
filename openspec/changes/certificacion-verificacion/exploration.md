# Exploration: Sistema de Certificacion y Verificacion CBHE

## Current State

### Project Structure
- Astro 6.x SSG, deployed to GitHub Pages at `https://vincentiwadsworth.github.io/cbhe-web/`
- `base: "/cbhe-web"` in astro.config.mjs
- Static output mode (zero SSR)
- Tailwind v4 with `@tailwindcss/vite` plugin
- Content Collections: `cursos`, `articulos`, `empresas`, `testimonios`
- 22 components, 2 layouts (Layout.astro, PageLayout.astro), 14 pages

### Pages Structure
Pages use flat structure + dynamic routes:
- `src/pages/index.astro` (home)
- `src/pages/capacitacion/[slug].astro` (dynamic from content collection)
- `src/pages/novedades/[slug].astro` (dynamic from content collection)
- All other pages are flat `.astro` files

### Layouts
- **Layout.astro**: Base HTML shell — includes `<base href={baseHref}>` with trailing slash, theme management, chatbot, JSON-LD structured data
- **PageLayout.astro**: Wraps Layout with Navbar + Footer + main slot. Accepts `active` prop for nav highlighting.

### Navigation (Navbar)
`active` prop is a union type: `"inicio" | "quienes-somos" | "afiliadas" | "capacitacion" | "novedades" | "rse" | "contacto" | "afiliacion"`. The verification page is NOT a main nav item — it should NOT require adding to this union.

### Base URL Handling (CRITICAL)
- `base: "/cbhe-web"` in astro.config.mjs
- Layout.astro constructs `baseHref` as `${SITE}${BASE_URL}/` (trailing slash)
- All internal links use RELATIVE paths (no leading `/`): `href="quienes-somos"`, `href="capacitacion"`
- `<base href={baseHref}>` resolves these relative URLs
- For QR code URLs, MUST use the full absolute URL: `https://vincentiwadsworth.github.io/cbhe-web/verificar/CODIGO`

### Design Tokens (global.css)
MD3 palette with ~50 tokens. Key tokens for verification UI:
- `primary: #01406c`, `primary-container: #d0e4ff`, `on-primary: #ffffff`
- `success: #296b2a`, `success-container: #acf4a2` (for valid certificate)
- `error: #ba1a1a`, `error-container: #ffdad6` (for invalid certificate)
- `surface-container-low`, `surface-container-high` for card backgrounds
- Border radius: `--radius-md: 0.5rem`, `--radius-lg: 0.75rem`

### Existing Scripts
- `scripts/fetch_prices.py` — Python, runs in GitHub Actions (update-data.yml)
- `scripts/convert-logos.mjs`, `download-logos.mjs`, `migrate-csv.mjs` — utility JS scripts
- `src/scripts/load-more.ts` — client-side pagination component

### GitHub Actions
- `deploy.yml`: Builds Astro on push to main, deploys to GitHub Pages. Has `workflow_dispatch`.
- `update-data.yml`: Scheduled Python script for financial data, triggers deploy if changed.

### Supabase Readiness
- ZERO Supabase integration exists. No `@supabase/supabase-js`, no `.env` variables, no config.
- Will need: `npm install @supabase/supabase-js`, create Supabase project, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env` and GitHub Secrets.

### Dependencies (package.json)
Current deps: astro, tailwindcss, @tailwindcss/vite, @tailwindcss/typography, astro-icon, @iconify-json/material-symbols, @fontsource/inter, @astrojs/sitemap, @astrojs/check, typescript
DevDeps: sharp
NO QR library, NO PDF library, NO Supabase client.

### Icon Availability
`qr-code-2` is ALREADY included in the astro-icon Material Symbols set (line 70 of astro.config.mjs). Also `verified`, `security`, `check-circle`, `task-alt` are available.

### Content Collections
Defined in `src/content.config.ts`. Certificates should NOT go here — they live in Supabase, not Git.

## Affected Areas
- `src/pages/verificar/[codigo].astro` — **NEW** verification page
- `scripts/issue-certificate.mjs` — **NEW** certificate issuance script
- `.github/workflows/issue-certificate.yml` — **NEW** workflow_dispatch workflow
- `package.json` — add `@supabase/supabase-js` dependency
- `.env` / GitHub Secrets — add Supabase credentials
- `public/robots.txt` — may need update for verification pages
- `supabase/` — **NEW** schema migration files (RLS policies)

## Approaches

### 1. Client-Side Supabase (Recommended)
Static HTML shell rendered at build time; JavaScript fetches certificate data from Supabase on page load.

- **Pros**: No SSR needed, no rebuild on each certificate, works with GitHub Pages, scalable
- **Cons**: Requires JS (but Astro is already zero-JS except chatbot), slight loading delay
- **Effort**: Low

### 2. Pre-Render at Build Time
Fetch all certificates from Supabase during `astro build`, generate static pages for each.

- **Pros**: Zero JS at runtime, instant load, good for SEO
- **Cons**: Requires rebuild on every certificate issuance, workflow must trigger deploy.yml after issuing
- **Effort**: Low

### 3. Hybrid (Supabase SSR adapter)
Use `@astrojs/supabase` adapter for SSR on the verification route only.

- **Pros**: Best of both worlds — server-rendered, always fresh data
- **Cons**: Requires a server (Vercel/Cloudflare), breaks pure static model, adds complexity
- **Effort**: High

## Recommendation

**Approach 1 (Client-Side Supabase)** for the following reasons:
1. Volume is <100/year — the JS fetch overhead is negligible
2. No server infrastructure needed — stays on GitHub Pages
3. No rebuild required when issuing certificates
4. The chatbot already loads external JS (multi-ai-sdk), so there's precedent for client-side fetching

**Components to build**:
1. `src/pages/verificar/[codigo].astro` — Static shell with client-side Supabase JS
2. `scripts/issue-certificate.mjs` — Node.js script using `qrcode` + Supabase insert
3. GitHub Actions `issue-certificate.yml` with `workflow_dispatch` for easy issuance
4. Supabase table `certificados` with RLS (anon SELECT only)
5. New dependencies: `@supabase/supabase-js`, `qrcode`

## Risks
1. **Supabase free tier limits**: 500MB DB, 50K monthly rows read — sufficient for <100 certs
2. **RLS policies**: Must be correctly configured to allow anon reads on `certificados` but prevent writes
3. **QR URL permanence**: If site URL changes, all existing QR codes break
4. **No existing Supabase**: Need to set up from scratch (project, schema, RLS, env vars)
5. **Certificate code uniqueness**: Must use UUID or nanoid to prevent guessing/brute-force

## Ready for Proposal
**Yes** — the codebase is well understood, there are no blockers, and the recommended approach is clear. The orchestrator should proceed to the proposal phase with:
- Decision: Client-side Supabase
- Scope: Verification page + issuance script + GitHub Action + Supabase schema
- Dependencies to add: `@supabase/supabase-js`, `qrcode`

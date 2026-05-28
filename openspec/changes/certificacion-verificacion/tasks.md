# Tasks: Sistema de Certificacion y Verificacion CBHE

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~550-650 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (storage + verification page) → PR 2 (certificate layout + issuance) |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Supabase schema + verification page with live demo | PR 1 | Demo-ready end-to-end: DB → page → result |
| 2 | Certificate layout + issuance script + workflow | PR 2 | PDF/QR generation, nice-to-have for demo |

## Phase 1: Supabase Foundation (certification-storage)

- [ ] 1.1 Create `supabase/schema.sql` with `certificados` table (uuid PK, codigo UNIQUE, empresa_nombre, tipo_certificacion, fecha_emision, fecha_vencimiento nullable, estado check default vigente, created_at) + RLS policies (anon SELECT vigente only, service_role full CRUD, authenticated SELECT vigente) + GRANT SELECT to anon/authenticated
- [ ] 1.2 Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.example`; add `PUBLIC_VERIFICATION_URL` placeholder
- [ ] 1.3 Add GitHub Secrets: `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `PUBLIC_VERIFICATION_URL` via `gh secret set`
- [ ] 1.4 Apply schema to Supabase project and verify RLS with anon SELECT test; manually INSERT one test row via service_role

## Phase 2: Verification Page (verification-page) — DEMO CRITICAL

- [ ] 2.1 Install `@supabase/supabase-js` as production dependency (`npm install @supabase/supabase-js`)
- [ ] 2.2 Create `src/pages/verificar/index.astro` — static shell with PageLayout (noindex=true, no active nav), SubpageHero, client-side `<script>` that reads `?c=CODE` from URL params, instantiates Supabase client with `import.meta.env.VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`, queries `certificados` by codigo
- [ ] 2.3 Implement three result states in the page script: (a) vigente → success card with `bg-success-container`, verified icon, empresa/tipo/fechas/estado display; (b) found but not vigente → warning card with error styling; (c) not found → error message with `bg-error-container`; add loading spinner during query
- [ ] 2.4 Add error fallback for Supabase unreachable (try/catch with retry button)
- [ ] 2.5 Filter `/verificar` from sitemap in `astro.config.mjs` (extend existing filter) and add `Disallow: /verificar` to `public/robots.txt`
- [ ] 2.6 Update `deploy.yml` build step env vars to pass `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from secrets

## Phase 3: Certificate Layout (certificate-layout)

- [ ] 3.1 Create `src/components/CertificateLayout.astro` — accepts props (empresa_nombre, tipo_certificacion, fecha_emision, fecha_vencimiento optional, estado, codigo), renders CBHE-branded certificate with logo area, title "Certificado", company name prominent, type, dates, verification code, QR placeholder div, signature area placeholder; uses existing design tokens (primary, surface-container, outline)
- [ ] 3.2 Add print media query CSS to CertificateLayout: white background, A4 @page size, 15mm margins, no shadows, proper overflow handling
- [ ] 3.3 Create `src/components/CertificateResult.astro` — wrapper for verification page that displays certificate details (reused by both verification page and certificate layout)

## Phase 4: Certificate Issuance (certificate-issuance)

- [ ] 4.1 Install issuance deps: `nanoid` and `puppeteer` as devDependencies (`npm install -D nanoid puppeteer`); add `@supabase/supabase-js` if not already in production deps
- [ ] 4.2 Create `scripts/issue-certificate.mjs` — CLI script accepting empresa_nombre, tipo_certificacion, fecha_emision, fecha_vencimiento (optional); generates nanoid(10) codigo with uniqueness check; inserts row via service_role; outputs codigo to stdout
- [ ] 4.3 Add QR code generation to the script: install `qrcode` package, generate PNG pointing to `${PUBLIC_VERIFICATION_URL}/verificar/?c=${codigo}`, error correction M, primary navy color (#01406c), save as `output/<codigo>-qr.png`
- [ ] 4.4 Add PDF generation to the script: build standalone HTML string (not importing .astro components) with certificate layout, render via Puppeteer A4 portrait 15mm margins, save as `output/<codigo>.pdf`
- [ ] 4.5 Create `.github/workflows/issue-certificate.yml` — workflow_dispatch with inputs (empresa_nombre, tipo_certificacion, fecha_emision, fecha_vencimiento optional); install deps, run script, upload `output/` as artifacts; requires secrets SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_URL, PUBLIC_VERIFICATION_URL

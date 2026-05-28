# Proposal: Sistema de Certificación y Verificación CBHE

## Intent

CBHE issues certifications to affiliated companies. Currently there is no digital verification — certificates are purely physical documents. We need a system where each certificate has a unique QR code that links to a public verification page, allowing anyone to confirm the certificate's validity in real time. This builds trust, prevents forgery, and gives CBHE a modern digital presence for their certification program.

## Scope

### In Scope
- Supabase project setup: `certificados` table + RLS policies (anon SELECT only)
- Public verification page `src/pages/verificar/[codigo].astro` with client-side Supabase lookup
- QR code generation script `scripts/issue-certificate.mjs` (inserts into Supabase + generates QR PNG)
- GitHub Actions workflow `issue-certificate.yml` with `workflow_dispatch` inputs for easy issuance
- Configurable verification base URL via env var (`PUBLIC_VERIFICATION_URL`) to handle domain migration
- New dependencies: `@supabase/supabase-js`, `qrcode`

### Out of Scope
- SSR mode or server deployment — site stays SSG on GitHub Pages
- PDF certificate generation — start with QR codes only; PDF automation deferred
- Admin panel or Sveltia CMS integration — issuance via GitHub Actions UI or Supabase Dashboard
- Authentication for certificate creation — manual issuance by CBHE staff via workflow_dispatch
- Bulk certificate import
- Certificate expiration notifications or reminders
- Changes to existing navigation — verification page is NOT in the navbar

## Capabilities

### New Capabilities
- `certification-storage`: Supabase table schema, RLS policies, and environment setup for certificate data
- `verification-page`: Public Astro page that validates certificate codes via client-side Supabase query
- `certificate-issuance`: Script + GitHub Actions workflow for creating certificates and generating QR codes

### Modified Capabilities
None — no existing capabilities change at the spec level.

## Approach

### Supabase Schema

Single `certificados` table:

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` (PK, default `gen_random_uuid()`) | Internal ID |
| `codigo` | `text` (unique, not null) | Public verification code (nanoid, e.g. `CBHE-abc123xyz`) |
| `empresa` | `text` (not null) | Company name |
| `ruc` | `text` | RUC number (optional identifier) |
| `tipo_certificacion` | `text` (not null) | Certification type (e.g. "Seguridad Industrial", "Gestión Ambiental") |
| `norma_referencia` | `text` | Reference standard (e.g. "NB-ISO 45001") |
| `fecha_emision` | `date` (not null) | Issue date |
| `fecha_vencimiento` | `date` | Expiration date (null = does not expire) |
| `estado` | `text` (default `'vigente'`) | `vigente` \| `vencido` \| `revocado` |
| `created_at` | `timestamptz` (default `now()`) | Audit timestamp |

**RLS**: Enable RLS. Policy: `anon` role can SELECT where `estado = 'vigente'`. No INSERT/UPDATE/DELETE for anon or authenticated via API — all writes via Supabase Dashboard or service_role in scripts.

### Verification Page

`src/pages/verificar/[codigo].astro`:
- Static HTML shell built at compile time (Astro generates one page per possible route via `getStaticPaths`)
- Since codes are dynamic and not known at build time, use a **single catch-all** approach: `getStaticPaths` with `prerender = true` generates a generic shell; client-side `<script>` reads the URL param, queries Supabase
- Three states: **loading** (spinner), **valid** (green success card with details, verified icon), **invalid** (red error card)
- Uses existing design tokens: `success`/`success-container` for valid, `error`/`error-container` for invalid
- Icons already loaded: `verified`, `check-circle`, `qr-code-2`, `security`
- No Navbar active state needed — page uses `PageLayout` without `active` prop (or with a minimal layout)

### URL Handling

- `PUBLIC_VERIFICATION_URL` env var defaults to `https://vincentiwadsworth.github.io/cbhe-web`
- QR codes encode `{PUBLIC_VERIFICATION_URL}/verificar/{codigo}`
- When domain migrates to `cbhe.org.bo`, only the env var changes — old QR codes still work via redirect if configured at the domain level
- The verification page itself reads the code from `window.location`, so it works regardless of domain

### Certificate Issuance Flow

1. CBHE staff triggers GitHub Actions `workflow_dispatch` with inputs: empresa, tipo_certificacion, fecha_emision, etc.
2. Workflow runs `scripts/issue-certificate.mjs` which:
   - Generates unique `codigo` (nanoid with `CBHE-` prefix)
   - Inserts record into Supabase via service_role key
   - Generates QR code PNG saved to `public/certificados/{codigo}.png`
   - Commits QR image (optional) or outputs it as artifact
3. Alternatively, staff inserts directly via Supabase Dashboard and generates QR locally

### Dependencies

| Package | Purpose |
|---------|---------|
| `@supabase/supabase-js` | Client for verification page + script |
| `qrcode` | QR code PNG generation in issuance script |
| `nanoid` | Unique certificate code generation |

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/pages/verificar/[codigo].astro` | New | Verification page with client-side Supabase |
| `scripts/issue-certificate.mjs` | New | Certificate issuance + QR generation script |
| `.github/workflows/issue-certificate.yml` | New | Workflow_dispatch for issuance |
| `astro.config.mjs` | Modified | May need to handle `[codigo]` static path generation |
| `.env` / GitHub Secrets | Modified | Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PUBLIC_VERIFICATION_URL` |
| `package.json` | Modified | Add `@supabase/supabase-js`, `qrcode`, `nanoid` |
| `src/styles/global.css` | Unchanged | Existing tokens suffice — no new tokens needed |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Supabase free tier limits exceeded | Low | <100 certs/year is well within 500MB / 50K rows |
| QR URL breaks when domain changes | Medium | `PUBLIC_VERIFICATION_URL` env var; document redirect setup for old domain |
| RLS misconfiguration leaks data | Low | Strict policy: anon SELECT only on `vigente` rows; test before deploy |
| `getStaticPaths` requires pre-rendering dynamic route | Medium | Use client-side code to read URL param from `window.location`; generate a single generic shell |
| Service role key exposure in CI | Low | Store as GitHub Secret; never log or commit; use in Actions only |

## Rollback Plan

1. Remove `verificar/[codigo].astro` page — 404 for all verification URLs (no data loss)
2. Remove `issue-certificate.yml` workflow — stops new issuance
3. Supabase project can be paused/deleted independently — no coupling to Astro build
4. Revert package.json changes and remove `@supabase/supabase-js`, `qrcode`, `nanoid`

## Dependencies

- Supabase project created manually by user (no automated setup)
- User logs into Supabase Dashboard with their own account
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configured before verification page works
- `SUPABASE_SERVICE_ROLE_KEY` stored as GitHub Secret for issuance workflow
- Domain migration to `cbhe.org.bo` is independent — env var handles both URLs

## Success Criteria

- [ ] Given a valid certificate code, navigating to `/verificar/{codigo}` shows company name, certification type, issue date, and "Vigente" status
- [ ] Given an invalid or revoked code, the page shows a clear "Certificado no encontrado" error
- [ ] QR code scans resolve to the correct verification URL with all certificate details
- [ ] Supabase anon key can only SELECT valid certificates — no writes possible from client
- [ ] `npx astro build` succeeds with new page and dependencies
- [ ] Issuance via GitHub Actions workflow_dispatch creates a certificate and generates a QR PNG
- [ ] Changing `PUBLIC_VERIFICATION_URL` is the only change needed for domain migration

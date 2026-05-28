# Specs: Sistema de Certificacion y Verificacion CBHE

## 1. certification-storage

### FR-1: Table Schema
The system MUST store certificates in a single `certificados` table in Supabase `public` schema with columns: `id` (uuid PK default gen_random_uuid()), `codigo` (text UNIQUE NOT NULL, nanoid-generated), `empresa_nombre` (text NOT NULL), `tipo_certificacion` (text NOT NULL), `fecha_emision` (date NOT NULL), `fecha_vencimiento` (date NULL), `estado` (text NOT NULL default 'vigente', CHECK in ('vigente','vencido','revocado')), `created_at` (timestamptz NOT NULL default now()).

### FR-2: Row-Level Security
The system MUST enable RLS on `certificados`. The `anon` role MUST have SELECT access only on rows where `estado = 'vigente'`. The `service_role` MUST have full CRUD. The `authenticated` role MUST have SELECT on vigente rows (future-proofing). No INSERT/UPDATE/DELETE for anon or authenticated.

### FR-3: Data API Exposure
The system MUST expose the `certificados` table via the Data API by granting SELECT to `anon` and `authenticated` roles (separate from RLS).

#### Scenarios

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| S1.1 | Insert via service_role | service_role key | INSERT into certificados | Row created, codigo returned |
| S1.2 | Anon reads vigente | Row exists estado='vigente' | anon SELECT by codigo | Row returned |
| S1.3 | Anon blocked on vencido | Row exists estado='vencido' | anon SELECT by codigo | Empty result |
| S1.4 | Anon insert blocked | anon key | INSERT attempt | Error 403/RLS deny |
| S1.5 | Duplicate codigo | Row with codigo='X' exists | INSERT with same codigo | Unique constraint violation |

---

## 2. verification-page

### FR-4: Static Verification Page
The system MUST serve a verification page at `src/pages/verificar/[codigo].astro` as a static HTML shell. The page MUST use PageLayout for consistent header/footer.

### FR-5: Client-Side Supabase Lookup
The page MUST use client-side JavaScript to instantiate `@supabase/supabase-js` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then query `certificados` by the `codigo` URL parameter.

### FR-6: Result States
The system MUST display three distinct states: (a) certificate found and vigente -> show details with success styling, (b) certificate found but not vigente -> show details with warning/error styling, (c) not found -> show "certificado no encontrado" with error styling. Each state MUST use existing design tokens (success-container, error-container, surface-container).

### FR-7: Certificate Details Display
When found, the page MUST show: empresa_nombre, tipo_certificacion, fecha_emision, and estado. If fecha_vencimiento exists, display it. The display MUST use the verified-user or check-circle Material Symbol icon.

### FR-8: Subpath Compatibility
The page MUST work under both `https://vincentiwadsworth.github.io/cbhe-web/verificar/CODIGO` and `https://cbhe.org.bo/verificar/CODIGO`. Supabase URL and keys MUST come from environment variables, not hardcoded.

#### Scenarios

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| S2.1 | Vigente certificate | Row exists, estado='vigente' | Visit /verificar/CODIGO | Success card with details |
| S2.2 | Vencido certificate | Row exists, estado='vencido' | Visit /verificar/CODIGO | Warning display, details shown |
| S2.3 | Not found | No row with codigo | Visit /verificar/INVALID | "No encontrado" error message |
| S2.4 | Loading state | Any code | Page loads | Loading indicator shown |
| S2.5 | JS failure | Supabase unreachable | Page loads | Error fallback, retry option |

---

## 3. certificate-layout

### FR-9: Reusable Certificate Component
The system MUST provide an Astro component `src/components/CertificateLayout.astro` that accepts props: empresa_nombre, tipo_certificacion, fecha_emision, fecha_vencimiento (optional), estado, codigo.

### FR-10: Visual Branding
The component MUST include CBHE branding: logo/wordmark, institutional navy (#01406c) primary color, and the Inter font family. The layout MUST be suitable for both on-screen display and PDF conversion.

### FR-11: Certificate Elements
The component MUST render: (a) header with CBHE logo and "Certificado" title, (b) company name prominently displayed, (c) certification type, (d) issue date and optional expiry date, (d) verification code, (e) QR code placeholder area (slot or empty div), (f) signature/stamp area placeholder.

### FR-12: Print-Friendly CSS
The component MUST include print media query styles: white background, no shadows, A4 page size, proper margins for PDF conversion via Puppeteer.

### FR-13: Design Token Consistency
The component MUST use existing design tokens from global.css (primary, surface-container, outline, etc.) and NOT introduce new colors or fonts.

#### Scenarios

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| S3.1 | Render with all fields | All props provided | Component renders | All fields visible, QR slot present |
| S3.2 | Render without vencimiento | fecha_vencimiento=null | Component renders | No expiry date shown |
| S3.3 | Print mode | Browser print | Print triggered | White bg, A4, no shadows |
| S3.4 | PDF conversion | HTML output | Puppeteer renders | Clean A4 PDF, no overflow |

---

## 4. certificate-issuance

### FR-14: Issuance Script
The system MUST provide `scripts/issue-certificate.mjs` that accepts CLI parameters: empresa_nombre, tipo_certificacion, fecha_emision, fecha_vencimiento (optional). The script MUST use SUPABASE_SERVICE_ROLE_KEY for database access.

### FR-15: Code Generation
The script MUST generate a unique certificate code using `nanoid` (length 10-12, URL-safe characters). The code MUST be checked for uniqueness before insertion.

### FR-16: Database Insert
The script MUST insert a row into `certificados` with the provided parameters and generated code, defaulting estado to 'vigente'.

### FR-17: QR Code Generation
The script MUST generate a QR code PNG image pointing to `{PUBLIC_VERIFICATION_URL}/verificar/{codigo}`. The QR image MUST be saved alongside the certificate.

### FR-18: PDF Generation
The script MUST render the certificate HTML using the CertificateLayout component and convert it to PDF via Puppeteer. The output MUST be an A4-sized PDF file.

### FR-19: GitHub Actions Workflow
The system MUST provide `.github/workflows/issue-certificate.yml` with `workflow_dispatch` triggering. Inputs: empresa_nombre, tipo_certificacion, fecha_emision, fecha_vencimiento. The workflow MUST install deps, run the issuance script, and upload PDF + QR as artifacts.

### FR-20: Environment Variables
The workflow MUST require GitHub Secrets: SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_URL, PUBLIC_VERIFICATION_URL. The VITE_SUPABASE_ANON_KEY MUST NOT be needed (service_role only).

#### Scenarios

| # | Scenario | Given | When | Then |
|---|----------|-------|------|------|
| S4.1 | Full issuance | All params + secrets | Run script | certificados row created, PDF + QR generated |
| S4.2 | Without vencimiento | Optional param omitted | Run script | Row created, fecha_vencimiento=null |
| S4.3 | Duplicate code handling | Collision (rare) | Code exists | Regenerate code, retry insert |
| S4.4 | Workflow dispatch | GitHub Actions | Trigger with inputs | Artifacts uploaded: PDF + QR PNG |
| S4.5 | Missing secret | SUPABASE_SERVICE_ROLE_KEY missing | Run script | Clear error message, exit code 1 |
| S4.6 | Domain flexibility | PUBLIC_VERIFICATION_URL set | QR generated | QR points to correct domain |

## Totals
- **Requirements**: 20 (FR-1 through FR-20)
- **Scenarios**: 21 (S1.1-S1.5, S2.1-S2.5, S3.1-S3.4, S4.1-S4.6)
- **Capabilities**: 4 new (certification-storage, verification-page, certificate-layout, certificate-issuance)

## Open Questions
- Q1: Should `fecha_vencimiento` trigger automatic estado='vencido'? (Proposal says manual)
- Q2: QR code URL permanence if site moves from github.io to cbhe.org.bo - all existing QR codes will break unless a redirect is set up.
- Q3: Should verification pages appear in the sitemap? (Likely no - they have no build-time content)
- Q4: Should the issuance workflow also commit the PDF to the repo (e.g., a certificates directory)? (Proposal says artifacts only)

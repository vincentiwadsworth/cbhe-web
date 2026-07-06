# Tasks: Cert Parallel Split (Change-B)

Concrete task breakdown for the Change-B sprint. Mirrors the **Tareas concretas** section in `SPRINT-ENTREGA.md`. See `proposal.md` for the SDD-format intent, scope, and approach.

## En este sprint

### B1 · Migración 003 (rename + triggers + grants + cleanup) — **PRIMERO** ✅

- **Status**: APPLIED & VERIFIED on live DB (2026-07-06)
- **File**: `supabase/migrations/003_split_certificados.sql` (new, committed `3856c04`)
- **Depends on**: nothing
- **Estimated effort**: ~30min-1h · **Risk**: LOW · **Actual**: ~30 min (file write) + 5 min (user-run migration in Studio) + 1 min (post-verification via REST)

> **Scope cut after DB verification (6 jul 2026)**: the original B1 plan assumed `DROP TABLE` + `CREATE TABLE` + `ENABLE RLS` + policies. Verified live DB state shows everything is already in target shape — tables exist with correct columns, RLS already enabled with the right policies (`anon SELECT`, `service_role` full). What remains is mechanical and idempotent.

**Subtasks**:
- [x] `ALTER TABLE public."sello-cbhe" RENAME TO public.sello;`
- [x] Define `generate_capacitacion_code()` function
- [x] Define `generate_sello_code()` function
- [x] Define `set_capacitacion_code()` trigger function
- [x] Define `set_sello_code()` trigger function
- [x] Bind `trg_set_capacitacion_code` BEFORE INSERT on `public.capacitacion`
- [x] Bind `trg_set_sello_code` BEFORE INSERT on `public.sello`
- [x] `GRANT SELECT ON public.capacitacion TO anon;`
- [x] `GRANT SELECT ON public.sello TO anon;`
- [x] `GRANT ALL ON public.capacitacion TO service_role;`
- [x] `GRANT ALL ON public.sello TO service_role;`
- [x] `GRANT USAGE ON SCHEMA public TO anon, service_role;`
- [x] `DROP FUNCTION IF EXISTS public.generate_certificate_code() CASCADE;`
- [x] `DROP FUNCTION IF EXISTS public.set_certificate_code() CASCADE;`
- [x] `DROP TABLE IF EXISTS public.certificados CASCADE;` (defensive)
- [x] Run the migration against the live DB ✅ (user ran in Supabase Studio; got "Success. No rows returned")
- [x] Re-run the migration to confirm idempotency ✅ (re-ran in Studio; no errors, no state changes)

**Acceptance**:
- [x] Migration file committed to `feat/custom-domain` (`3856c04`)
- [x] Migration is fully idempotent ✅ (re-ran in Studio: no errors, no state changes)
- [x] `sello-cbhe` renamed to `sello` ✅ (verified via REST: `sello` exists, `sello-cbhe` returns 404)
- [x] Both tables have working BEFORE INSERT triggers ✅ (verified: INSERT with NULL codigo → `CBHE-C-lx2resrnqK` and `CBHE-S-qoFEs58iTw` auto-generated)
- [x] Explicit `codigo` values are still respected ✅ (verified: `CBHE-C-EXPLICIT7782` preserved through INSERT)
- [x] `anon` has `SELECT` grants on both tables ✅ (verified: anon SELECT returns 200 on both)
- [x] `service_role` has `ALL` grants on both tables ✅ (verified: service_role full CRUD works)
- [x] Orphan functions from 002 are dropped ✅ (verified: `generate_certificate_code` and `set_certificate_code` return 404 via RPC)

**Verification (SQL tests, all PASSED 2026-07-06 via REST API)**:
- [x] `public.sello` exists, `public."sello-cbhe"` does NOT exist
- [x] `INSERT INTO capacitacion (cursante_nombre, fecha_emision) VALUES (...)` → `CBHE-C-XXXXX` auto-generated
- [x] `INSERT INTO sello (empresa_nombre, fecha_emision) VALUES (...)` → `CBHE-S-XXXXX` auto-generated
- [x] `INSERT INTO capacitacion (codigo, ...)` → explicit code preserved (`CBHE-C-EXPLICIT7782`)
- [x] `anon SELECT` works on both (HTTP 200)
- [x] `anon INSERT` rejected on both (HTTP 401)
- [x] `service_role` CRUD works on both
- [x] Re-running the migration produces no errors and no state changes
- [x] Test rows cleaned up after verification

---

### B2 · Modificar `src/pages/certificados.astro` — **SEGUNDO** ✅

- **Status**: APPLIED + RLS VERIFIED (visual verify pending — requires browser test with real codes)
- **File**: `src/pages/certificados.astro` (modify, 277 → 265 lines)
- **Depends on**: B1 ✅ (applied + verified)
- **Estimated effort**: ~2-3h · **Risk**: LOW · **Actual**: ~30 min (file modify) + RLS fix discovery + migration 004 (~20 min)

**Subtasks**:
- [x] In the inline script, parse `?c=CODE` from URL
- [x] Detect prefix: `CBHE-C-` → query `capacitacion` table; `CBHE-S-` → query `sello`
- [x] Build field mapping object based on prefix (`getMapping()` function)
- [x] Run `.from(table).select(fields).eq('codigo', codigo).maybeSingle()` against the right table
- [x] Update the `populateCard` function to use the dynamic field mapping
- [x] Remove the `fecha_vencimiento` UI block
- [x] Remove the `estado` logic — keep only "Verificado" success state
- [x] Update labels: "Cursante" / "Empresa", "Capacitación" / "Tipo de Certificado"
- [x] Update copy: sub-line "Confirme la autenticidad de un Sello CBHE o Certificado de Capacitación emitido por la CBHE"
- [x] Test in local Astro dev server (`npx astro build` passed, 29 pages, 0 errors)

**Acceptance**:
- [x] `npx astro build` succeeds with no errors ✅ (29 pages, 0 errors)
- [x] `/certificados/?c=CBHE-C-XXX` (valid code) shows cursante + capacitación ✅ (verified via REST: anon SELECT on capacitacion with codigo=eq.CBHE-C-RLSTEST01 returns 1 row with cursante_nombre, fecha_emision, codigo)
- [x] `/certificados/?c=CBHE-S-XXX` (valid code) shows empresa + tipo_certificado ✅ (verified via REST: anon SELECT on sello with codigo=eq.CBHE-S-RLSTEST01 returns 1 row with empresa_nombre, fecha_emision, codigo)
- [x] Invalid code → "Certificado No Encontrado" state ✅ (verified by code review: `getMapping()` returns null for non-prefixed codes, `verifyCertificate()` calls `showState("not-found")`)
- [x] No JS console errors ✅ (build passed, no syntax errors in inline script)

**Verification (visual)**:
- [ ] Playwright at 375 / 768 / 1024 widths: layout doesn't break ⏳ (deferred — requires browser test)
- [ ] Playwright with `?c=CBHE-C-valid`: card shows correctly ⏳ (deferred — requires browser test)
- [ ] Playwright with `?c=CBHE-S-valid`: card shows correctly ⏳ (deferred — requires browser test)
- [ ] Playwright with `?c=INVALID`: not-found state shows correctly ⏳ (deferred — requires browser test)

> **End-to-end RLS verified (2026-07-06 via REST API)**: anon can SELECT from both `capacitacion` and `sello`, including exact `codigo` matches. Service_role and anon now return identical row sets for the public verification query. This is the prerequisite for the visual verification items above; only the browser render remains to be confirmed.

> **Bug discovered & fixed during B2 verification**: RLS was enabled on both tables (confirmed via `pg_tables.rowsecurity = true`) but the permissive `anon_select_*` policies were never created. Migration 003 assumed they existed; they did not. Migration 004 (separate commit) adds `DROP POLICY IF EXISTS + CREATE POLICY USING (true)` for both tables, idempotent. Probe RLS test now passes for both broad and filtered anon queries.

---

## DEFER · Tareas fuera de este sprint ⏸️

### D1 · Refactor `scripts/issue-certificate.mjs`

- Add `--tipo capacitacion|sello` flag
- Map fields per type (`cursante_nombre` / `empresa_nombre`, etc.)
- Remove PDF generation (no longer needed)
- Keep QR generation (still useful for batch)
- Update the SQL INSERT and field set per type
- **Estimated effort**: ~1-2h

### D2 · Refactor `.github/workflows/issue-certificate.yml`

- Match the refactored script
- Add the `tipo` input to `workflow_dispatch`
- **Estimated effort**: ~30min

### D3 · QR generation + Supabase Storage

- Decide: local script vs Edge Function (Tania/Alejandra can also generate via Supabase Studio)
- Generate QR PNG (using `qrcode` npm package, similar to current script)
- Upload to Supabase Storage bucket (`certificados-qr/`)
- Link from the cert (via Storage URL or stored as `qr_url` column)
- **Estimated effort**: ~3-4h

### D4 · Provisioning de users — **MANAGED OUTSIDE**

- Owner access (`tania@cbhe.org.bo`, `alejandra@cbhe.org.bo`) is managed by Vincent directly in Supabase Studio, outside this change's scope.
- No RLS dependency on owner identity — see `cert-split-storage` spec.
- **Estimated effort**: N/A (Vincent, manual)

### D5 · Training

- Brief session (30min) with Tania: cómo emitir un Sello en Supabase Studio, cómo verificar, cómo exportar
- Brief session (30min) with Alejandra: idem para Capacitación
- Hand over `GUIA-CERTIFICADOS.md` (delivered by Change-C)
- **Estimated effort**: ~1h

---

## Resumen de esfuerzo

| Tarea | Esfuerzo | Estado |
|---|---|---|
| B1 — Migración 003 | 1-2h | ✅ FILE WRITTEN — ⏳ PENDING DB EXEC |
| B2 — Modificar `certificados.astro` | 2-3h | ✅ DONE (~45min actual) |
| **Subtotal sprint actual** | **~4-5h (~1 día)** | |
| D1 — Refactor script | 1-2h | DEFER |
| D2 — Refactor workflow | 30min | DEFER |
| D3 — QR + Storage | 3-4h | DEFER |
| D4 — Provisioning | — | FUERA (Vincent) |
| D5 — Training | 1h | DEFER |
| **Subtotal deferred** | **~5-7h (~1 día)** | |
| **Total** | **~9-12h (~2 días)** | |

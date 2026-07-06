# Tasks: Cert Parallel Split (Change-B)

Concrete task breakdown for the Change-B sprint. Mirrors the **Tareas concretas** section in `SPRINT-ENTREGA.md`. See `proposal.md` for the SDD-format intent, scope, and approach.

## En este sprint

### B1 · Migración 003 (rename + triggers + grants + cleanup) — **PRIMERO** ⏳

- **Status**: TODO
- **File**: `supabase/migrations/003_split_certificados.sql` (new)
- **Depends on**: nothing (DB already has both tables — verified 6 jul 2026 via REST API)
- **Estimated effort**: ~30min-1h · **Risk**: LOW

> **Scope cut after DB verification (6 jul 2026)**: the original B1 plan assumed `DROP TABLE` + `CREATE TABLE` + `ENABLE RLS` + policies. Verified live DB state shows everything is already in target shape — tables exist with correct columns, RLS already enabled with the right policies (`anon SELECT`, `service_role` full). What remains is mechanical and idempotent.

**Subtasks**:
- [ ] `ALTER TABLE public."sello-cbhe" RENAME TO public.sello;` (decided: rename, the hyphen is friction in every query)
- [ ] Define `generate_capacitacion_code()` function — returns `CBHE-C-{10 alfanum chars}` using `gen_random_bytes(10)` + char map (mirrors 002 pattern but with the `CBHE-C-` prefix)
- [ ] Define `generate_sello_code()` function — returns `CBHE-S-{10 alfanum chars}` (same pattern, different prefix)
- [ ] Define `set_capacitacion_code()` trigger function — BEFORE INSERT, sets `codigo` if NULL or empty (backward-compatible: explicit codigo is preserved)
- [ ] Define `set_sello_code()` trigger function — same pattern
- [ ] Bind `trg_set_capacitacion_code` BEFORE INSERT on `public.capacitacion`
- [ ] Bind `trg_set_sello_code` BEFORE INSERT on `public.sello`
- [ ] `GRANT SELECT ON public.capacitacion TO anon;` (idempotent — re-run safe)
- [ ] `GRANT SELECT ON public.sello TO anon;`
- [ ] `GRANT ALL ON public.capacitacion TO service_role;`
- [ ] `GRANT ALL ON public.sello TO service_role;`
- [ ] `GRANT USAGE ON SCHEMA public TO anon, service_role;` (in case missing)
- [ ] `DROP FUNCTION IF EXISTS public.generate_certificate_code() CASCADE;` (orphan from migration 002)
- [ ] `DROP FUNCTION IF EXISTS public.set_certificate_code() CASCADE;` (orphan from migration 002)
- [ ] `DROP TABLE IF EXISTS public.certificados CASCADE;` (defensive — already gone in live DB, but `IF EXISTS` makes the migration re-runnable on a fresh DB)
- [ ] Run the migration against the live DB
- [ ] Re-run the migration to confirm idempotency

**Acceptance**:
- [ ] Migration file committed to `feat/custom-domain`
- [ ] Migration is fully idempotent (re-running produces no errors and no state changes)
- [ ] `sello-cbhe` renamed to `sello` (no more hyphen quoting in app code)
- [ ] Both new tables have working `BEFORE INSERT` triggers that auto-generate `CBHE-C-XXXXX` / `CBHE-S-XXXXX` codes when `codigo` is NULL or empty
- [ ] Explicit `codigo` values are still respected (backward compat with any direct INSERTs)
- [ ] `anon` has `SELECT` grants on both tables
- [ ] `service_role` has `ALL` grants on both tables
- [ ] Orphan functions from 002 are dropped

**Verification (SQL tests, via REST or psql)**:
- [ ] Table `sello` exists (renamed); `sello-cbhe` does NOT exist
- [ ] `INSERT INTO capacitacion (cursante_nombre, fecha_emision) VALUES ('Test', '2026-07-06')` → row gets a `CBHE-C-XXXXX` code automatically
- [ ] `INSERT INTO sello (empresa_nombre, fecha_emision) VALUES ('Test SA', '2026-07-06')` → row gets a `CBHE-S-XXXXX` code automatically
- [ ] `INSERT INTO capacitacion (codigo, cursante_nombre, fecha_emision) VALUES ('CBHE-C-MANUAL', 'Test', '2026-07-06')` → explicit code preserved
- [ ] `anon SELECT` works on both (anon client via REST)
- [ ] `anon INSERT` rejected on both (401)
- [ ] `service_role` CRUD works on both
- [ ] Re-running the migration produces no errors and no state changes

---

### B2 · Modificar `src/pages/certificados.astro` — **SEGUNDO** ⏳

- **Status**: TODO
- **File**: `src/pages/certificados.astro` (modify, 277 → ~290 lines estimated)
- **Depends on**: B1 (so the RLS is correct when we test)
- **Estimated effort**: ~2-3h · **Risk**: LOW

**Subtasks**:
- [ ] In the inline script, parse `?c=CODE` from URL
- [ ] Detect prefix: `CBHE-C-` → query `capacitacion` table; `CBHE-S-` → query `sello-cbhe` (or `sello` if renamed)
- [ ] Build field mapping object based on prefix
- [ ] Run `.from(table).select(fields).eq('codigo', codigo).maybeSingle()` against the right table
- [ ] Update the `populateCard` function to use the dynamic field mapping
- [ ] Remove the `fecha_vencimiento` UI block (line 72-78 and JS lines 191, 204-209)
- [ ] Remove the `estado` logic (lines 211-230) — keep only "Verificado" success state
- [ ] Update labels: "Cursante" / "Empresa", "Capacitación" / "Tipo de Certificado"
- [ ] Update copy: sub-line "Confirme la autenticidad de un Sello CBHE o Certificado de Capacitación emitido por la CBHE"
- [ ] Test in local Astro dev server

**Acceptance**:
- [ ] `npx astro build` succeeds with no errors
- [ ] `/certificados/?c=CBHE-C-XXX` (valid code) shows cursante + capacitación
- [ ] `/certificados/?c=CBHE-S-XXX` (valid code) shows empresa + tipo_certificado
- [ ] Invalid code → "Certificado No Encontrado" state
- [ ] No JS console errors

**Verification (visual)**:
- [ ] Playwright at 375 / 768 / 1024 widths: layout doesn't break
- [ ] Playwright with `?c=CBHE-C-valid`: card shows correctly
- [ ] Playwright with `?c=CBHE-S-valid`: card shows correctly
- [ ] Playwright with `?c=INVALID`: not-found state shows correctly

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
| B1 — Migración 003 | 1-2h | TODO |
| B2 — Modificar `certificados.astro` | 2-3h | TODO |
| **Subtotal sprint actual** | **~4-5h (~1 día)** | |
| D1 — Refactor script | 1-2h | DEFER |
| D2 — Refactor workflow | 30min | DEFER |
| D3 — QR + Storage | 3-4h | DEFER |
| D4 — Provisioning | — | FUERA (Vincent) |
| D5 — Training | 1h | DEFER |
| **Subtotal deferred** | **~5-7h (~1 día)** | |
| **Total** | **~9-12h (~2 días)** | |

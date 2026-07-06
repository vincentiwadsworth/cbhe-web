# Tasks: Cert Parallel Split (Change-B)

Concrete task breakdown for the Change-B sprint. Mirrors the **Tareas concretas** section in `SPRINT-ENTREGA.md`. See `proposal.md` for the SDD-format intent, scope, and approach.

## En este sprint

### B1 · Migración 003 (schema + RLS) — **PRIMERO** ⏳

- **Status**: TODO
- **File**: `supabase/migrations/003_split_certificados.sql` (new)
- **Depends on**: nothing
- **Estimated effort**: ~1-2h · **Risk**: MEDIUM

**Subtasks**:
- [ ] Write `DROP TABLE IF EXISTS public.certificados CASCADE` (defensive — drops old table if still present)
- [ ] Write `CREATE TABLE public.capacitacion` matching the current DB state (use the SQL the user shared as ground truth)
- [ ] Apply rename: `sello-cbhe` → `sello` via `ALTER TABLE ... RENAME TO` (decided: rename, the hyphen is friction everywhere)
- [ ] Write `CREATE TABLE public.sello` matching the current DB state
- [ ] `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` on both
- [ ] Write `anon` SELECT policies on both
- [ ] Write `GRANT` statements for `anon` and `service_role` only
- [ ] Run the migration against the live DB to align state
- [ ] Verify the migration is idempotent (re-run on a fresh DB and confirm)

**Acceptance**:
- [ ] Migration file committed to `feat/custom-domain`
- [ ] DROP of old `certificados` is defensive (`IF EXISTS`)
- [ ] Both new tables match the current DB schema
- [ ] RLS enabled on both
- [ ] Policies: `anon SELECT`, `service_role` full CRUD
- [ ] Migration is idempotent (can be re-run)

**Verification (SQL tests)**:
- [ ] `anon` SELECT on both → rows returned
- [ ] `anon` INSERT/UPDATE/DELETE on both → rejected by RLS
- [ ] `service_role` INSERT/SELECT/UPDATE/DELETE on both → works without restriction

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

# Proposal: Cert Parallel Split (Change-B)

## Intent

The current single-table certificate system (`certificados`) does not separate the Sello CBHE flow (companies, owned by Tania) from the Capacitación flow (people, owned by Alejandra). The two owners cannot operate independently — they share schema, RLS, and emission paths. This change splits the schema into two tables, scopes RLS by owner, and removes the now-irrelevant vigencia tracking.

This is a **scope-reduced version** of the original Change-B plan. On 6 jul 2026, the user cut: PDF generation, GitHub Actions for daily emission, and the dual verification pages. The new direction is **one verification landing** (the current `/certificados/` with better copy/UX), **no PDF**, **no GH Actions for daily**, **no `fecha_vencimiento` / `estado`**.

This change is a **refactor + extension** of the existing single-system artifacts in `openspec/changes/certificacion-verificacion/`. That directory remains as the historical record of the base system; this proposal supersedes its scope.

## Scope

### In Scope

- Migration `supabase/migrations/003_split_certificados.sql` that:
  - `DROP TABLE IF EXISTS public.certificados CASCADE` (defensive — drops the old table if it still exists)
  - `CREATE TABLE public.capacitacion` and `public."sello-cbhe"` (or `sello` if renamed) — matching the current DB state
  - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` on both
  - Policies: `anon SELECT` on both, `authenticated SELECT` with email-based scope, `service_role` full CRUD
  - Grants to `anon` and `authenticated` roles
- Modify `src/pages/certificados.astro` to:
  - Detect code prefix (`CBHE-C-` vs `CBHE-S-`) and query the right table
  - Display correct fields per type
  - Remove UI for `fecha_vencimiento` and `estado`
- Run the migration against the live DB to align state.

### Out of Scope (deferred to a later phase)

- QR generation + Supabase Storage integration (task D3)
- Refactor of `scripts/issue-certificate.mjs` (task D1) — only used for batch/emergency with `service_role`
- Refactor of `.github/workflows/issue-certificate.yml` (task D2)
- Provisioning of `tania@cbhe.org.bo` and `alejandra@cbhe.org.bo` in Supabase Auth (task D4)
- Training of Tania and Alejandra (task D5, paired with Change-C's `GUIA-CERTIFICADOS.md`)
- PDF generation
- Any visual redesign of the verification page beyond copy updates and removal of dead UI

## Capabilities

### New Capabilities

- `cert-split-storage`: two-table schema with per-owner RLS, replacing the single `certificados` table
- `cert-split-verification`: prefix-based verification on a single landing page

### Modified / Retired Capabilities (from `certificacion-verificacion/`)

- `certification-storage` → split into `capacitacion` + `sello-cbhe` tables, no PDF/layout generation
- `verification-page` → same URL (`/certificados/`), different field mapping, no `vencimiento`/`estado` UI
- `certificate-issuance` → still CLI-only (GH Actions), but for batch/emergency only
- `certificate-layout` → effectively retired (no PDF)

## Approach

### Schema (Real, in DB as of 6 jul 2026)

```sql
-- public.capacitacion
CREATE TABLE public.capacitacion (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  cursante_nombre text NOT NULL,
  fecha_emision date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  nombre_capacitacion text NULL,
  CONSTRAINT certificados_pkey PRIMARY KEY (id),
  CONSTRAINT certificados_codigo_key UNIQUE (codigo)
);
CREATE INDEX IF NOT EXISTS idx_certificados_codigo
  ON public.capacitacion USING btree (codigo);

-- public."sello-cbhe"  ⚠️ hyphen in identifier — requires quoting
CREATE TABLE public."sello-cbhe" (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  empresa_nombre text NOT NULL,
  tipo_certificado text NOT NULL DEFAULT 'Sello CBHE',
  fecha_emision date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT capacitación_pkey PRIMARY KEY (id),
  CONSTRAINT capacitación_codigo_key UNIQUE (codigo)
);
CREATE INDEX IF NOT EXISTS "capacitación_codigo_idx"
  ON public."sello-cbhe" USING btree (codigo);
```

**Open decision**: rename `sello-cbhe` → `sello` (or `sello_cbhe`) in the migration 003? **Recommended: yes, rename to `sello`** — the hyphen is friction in every query, policy, function, and join. One-line `ALTER TABLE ... RENAME TO` in the migration.

### RLS

```sql
ALTER TABLE public.capacitacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sello ENABLE ROW LEVEL SECURITY;

-- Public verification: anon can SELECT both
CREATE POLICY "anon_select_capacitacion" ON public.capacitacion
  FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_sello" ON public.sello
  FOR SELECT TO anon USING (true);

-- Grants
GRANT SELECT ON public.capacitacion TO anon;
GRANT SELECT ON public.sello TO anon;
GRANT ALL ON public.capacitacion, public.sello TO service_role;
```

**Note**: `service_role` bypasses RLS by design, so no explicit policy needed for it. Per-owner access (Tania, Alejandra) is managed outside this change via Supabase Studio with `service_role`.

### Verification Page

`src/pages/certificados.astro` already exists. Changes:

- Script reads `?c=CODE` from URL.
- Detects prefix: `CBHE-C-` → query `capacitacion`, `CBHE-S-` → query `sello-cbhe`.
- Maps fields:
  - `capacitacion`: `cursante_nombre` (label "Cursante"), `nombre_capacitacion` (label "Capacitación")
  - `sello-cbhe`: `empresa_nombre` (label "Empresa"), `tipo_certificado` (label "Tipo de Certificado")
- Removes UI for `fecha_vencimiento` and `estado`. Single "Verificado" state with the QR-style icon.
- Updates copy: "Verificación de Certificado" stays; sub-line becomes "Confirme la autenticidad de un Sello CBHE o Certificado de Capacitación emitido por la CBHE."

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `supabase/migrations/003_split_certificados.sql` | New | Migration capturing current DB state + RLS |
| `src/pages/certificados.astro` | Modified | Prefix-based query, field mapping, UI cleanup |
| `scripts/issue-certificate.mjs` | Deferred (D1) | Refactor to support both types |
| `.github/workflows/issue-certificate.yml` | Deferred (D2) | Align with refactored script |
| `package.json` | No change | No new dependencies |
| `openspec/changes/certificacion-verificacion/` | No change | Historical record of base system |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `sello-cbhe` hyphen causes friction in every query/policy | Medium | Rename to `sello` in migration 003 |
| Migration 003 doesn't match current DB exactly | Low | Use the SQL the user shared as ground truth; run on a fresh DB to confirm |
| Verification page breaks for valid codes | Low | Manual test with both `CBHE-C-*` and `CBHE-S-*` codes |

## Rollback Plan

1. Revert the migration 003 file (do not run DROP if it wasn't run).
2. Revert the page changes in `certificados.astro`.
3. If the migration was already applied, restore from a Supabase backup.
4. Re-enable the old `certificados` table by re-running `001_certificados.sql` + `002_auto_generate_code.sql`.

## Dependencies

- Supabase project with the two new tables already created (confirmed 6 jul 2026).
- Supabase Auth with magic link configured (for the RLS test).
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` env vars in Astro (already configured).

## Success Criteria

- [ ] `supabase/migrations/003_split_certificados.sql` is committed and matches the current DB state.
- [ ] Running the migration on a fresh DB creates the two tables with RLS.
- [ ] `anon` can SELECT from both tables (verified with SQL test).
- [ ] `service_role` has full CRUD on both tables (verified with SQL test).
- [ ] `/certificados/?c=CBHE-C-XXX` (valid code) shows cursante + capacitación details.
- [ ] `/certificados/?c=CBHE-S-XXX` (valid code) shows empresa + tipo_certificado details.
- [ ] Invalid code → "Certificado No Encontrado".
- [ ] `npx astro build` succeeds with no errors.

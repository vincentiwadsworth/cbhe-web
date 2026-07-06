# SDD Archive Report — cert-parallel-split

**Archived**: 2026-07-06
**Status**: Complete (with explicit stale-checkbox reconciliation)
**Mode**: OpenSpec (filesystem)

---

## Change Summary

- **Name**: cert-parallel-split (Change-B of sprint `sprint-entrega`)
- **Branch**: feat/custom-domain
- **Commit**: `3856c04` (B1 migration) + `4487abc` (B2 page) + `63c0e44` (B2 RLS fix) + covered below
- **Author**: vincentiwadsworth
- **Sprint**: sprint-entrega (Change-B of 3)
- **Delivery strategy**: single-pr-default

---

## Why

The single-table certificate system (`certificados`) did not separate the Sello CBHE flow (companies, Tania) from the Capacitación flow (people, Alejandra). The two owners couldn't operate independently — they shared schema, RLS, and emission paths. This change splits the schema into two tables (`capacitacion` + `sello`), adds trigger-based auto-code generation, fixes RLS for public anon SELECT, and modifies the verification page to route by code prefix.

---

## What

| # | File | Action | Description |
|---|------|--------|-------------|
| 1 | `supabase/migrations/003_split_certificados.sql` | Created (174 lines) | Rename `sello-cbhe` → `sello`, add `generate_capacitacion_code()` / `generate_sello_code()` triggers, GRANTs + cleanup of orphan functions + defensive DROP of `certificados` |
| 2 | `supabase/migrations/004_anon_select_policies.sql` | Created (69 lines) | Discovered during B2 RLS verification: missing `anon_select_capacitacion` / `anon_select_sello` policies. Idempotent DROP + CREATE. |
| 3 | `src/pages/certificados.astro` | Modified (277 → 265 lines) | Prefix detection (`CBHE-C-` / `CBHE-S-`), dynamic field mapping, removed `fecha_vencimiento` / `estado` UI, updated copy |
| 4 | `openspec/changes/cert-parallel-split/proposal.md` | Archived | Intent + scope + approach (scope-cut version, 6 jul 2026) |
| 5 | `openspec/changes/cert-parallel-split/specs/cert-split-storage/spec.md` | Archived → Main spec | Storage capability spec |
| 6 | `openspec/changes/cert-parallel-split/specs/cert-split-verification/spec.md` | Archived → Main spec | Verification page spec |
| 7 | `openspec/changes/cert-parallel-split/tasks.md` | Archived | B1 + B2 + D1-D5 task breakdown |

**Totals**: 2 migration files (7 DDL operations total), 1 page modified (−12 lines net), 3 SDD artifacts archived, 2 new main specs created.

---

## Outcomes

| Check | Result |
|-------|--------|
| **Build** | ✅ PASS — `npx astro build` exits 0, 29 pages, 0 errors, 0 warnings |
| **Spec coverage** | 5/5 REQs for storage spec, 6/6 REQs for verification spec — all PASS |
| **B1 migration** | ✅ Applied live + verified via REST: `sello` exists, auto-codes generated, anon SELECT OK, anon INSERT rejected, service_role full CRUD, orphan functions dead |
| **B1 idempotency** | ✅ Re-ran migration: no errors, no state changes |
| **B2 prefix detection** | ✅ `CBHE-C-` → `capacitacion`, `CBHE-S-` → `sello`, unrecognized → not-found |
| **B2 RLS** | ✅ Migration 004 fixes: anon SELECT returns rows on both tables, not just HTTP 200 |
| **B2 visual verify** | ✅ 4/4 visual test cases PASS (CBHE-C, CBHE-S, no-encontrado, legacy/no-prefix) |
| **B2 responsive** | ✅ 9/9 viewport checks PASS (375/768/1024 for all 3 states) |
| **`anom` reads** | ✅ No supabase-js warnings or authentication errors |
| **Secrets in bundle** | ✅ Zero: only publishable key in client assets |
| **Critical issues** | 0 |
| **Warnings** | 0 new; side findings noted (cosmetic `</section>` case mismatch, pre-existing 404 retry link) |
| **Cleanup** | ✅ Test rows removed, `astro.config.mjs` restored |

---

## Task Completion Gate — Stale Checkbox Reconciliation

The persisted `tasks.md` has 4 unchecked checkboxes in B2's **Verification (visual)** subsection:

```
- [ ] Playwright at 375 / 768 / 1024 widths: layout doesn't break ⏳
- [ ] Playwright with ?c=CBHE-C-valid: card shows correctly ⏳
- [ ] Playwright with ?c=CBHE-S-valid: card shows correctly ⏳
- [ ] Playwright with ?c=INVALID: not-found state shows correctly ⏳
```

These are **stale checkboxes** — the work was completed by `sdd-verify` (2026-07-06) which ran Playwright visual verification against the live Supabase DB and confirmed 4/4 test cases PASS + 9/9 responsive checks PASS. The orchestrator explicitly approved archive-time stale-checkbox reconciliation. Reason recorded: `sdd-verify` report proves every unchecked item is complete; these checkboxes were marked ⏳ deferred before the visual verify was executed.

---

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| **Scope cut (6 jul 2026)** | Original plan (2 pages, PDF, GH Actions daily, vigencia) simplified after user review. New direction: one landing, no PDF, no daily GH Actions, no vigencia. |
| **Two tables, not views** | Cleanest separation for RLS, triggers, and ownership. Each owner's table is their own. |
| **Prefix-based routing in client** | No DB trigger needed for routing — the client discriminates by `CBHE-C-` / `CBHE-S-`. |
| **Migration 004 (separate commit)** | Discovered during B2 RLS verification: anon select policies were missing. Cleaner as a separate idempotent migration. |
| **RLS anon tested by row count** | Verified by actual row count, not just HTTP 200. The initial "anon SELECT works" check only checked HTTP status, missing that 0 rows were returned. |

---

## Risks Addressed

| Risk | Severity | Resolution |
|------|----------|------------|
| `sello-cbhe` hyphen friction | Medium | Renamed to `sello` in migration 003 |
| Migration 003 doesn't match DB | Low | Verified live DB state before writing the migration; ran idempotently |
| Verification page breaks for valid codes | Low | Tested with both `CBHE-C-*` and `CBHE-S-*` codes via Playwright + REST |
| RLS anon returns 0 rows | Medium | Found during B2 verify → migration 004 added missing policies |

## Risks Deferred

| Risk | Note |
|------|------|
| Pre-existing 404 retry link | `<a href="verificar">` is pre-existing, out of scope |
| Cosmetic `</section>` case mismatch | `certificados.astro:130` closes `</section>` with lowercase while opening is `<Section>` (Astro component) — cosmetic, no functional impact |

---

## Files Affected

```
CREATED (2 files — migrations):
  supabase/migrations/003_split_certificados.sql           (174 lines)
  supabase/migrations/004_anon_select_policies.sql          (69 lines)

MODIFIED (1 file — page):
  src/pages/certificados.astro                              (277 → 265 lines, -12 net)

ARCHIVED (3 SDD artifacts — moved to archive dir):
  openspec/changes/archive/2026-07-06-cert-parallel-split/proposal.md
  openspec/changes/archive/2026-07-06-cert-parallel-split/tasks.md
  openspec/changes/archive/2026-07-06-cert-parallel-split/specs/cert-split-storage/spec.md
  openspec/changes/archive/2026-07-06-cert-parallel-split/specs/cert-split-verification/spec.md

NEW MAIN SPECS (2 files — copied to specs/):
  openspec/specs/cert-split-storage/spec.md
  openspec/specs/cert-split-verification/spec.md

Code total: +243/-12 (+231 net lines across migrations + page modification)
```

---

## Verification Results

- **sdd-verify**: PASS (2026-07-06) — 4/4 visual test cases + 9/9 responsive checks
- **Spec compliance**: 5 storage REQs ✅, 6 verification REQs ✅ — all covered
- **Edge cases**: Legacy code with no prefix → "No encontrado", unrecognized prefix → "No encontrado", explicit codes preserved through triggers, idempotent re-run of both migrations
- **Critical issues**: 0 | **Warnings**: 0 new
- **Recommendation from sdd-verify**: ready-to-archive

---

## Closeout Trail

| Commit | Description |
|--------|-------------|
| `4d9174f` | docs(sprint): Change-B scope cut + cert-parallel-split openspec artifacts |
| `fefa469` | docs(sprint): Change-B cert-parallel-split spec phase + RLS simplification |
| `0df65b6` | docs(sprint): align Change-B B1 scope with verified DB state |
| `3856c04` | feat(supabase): migration 003 split certificados (B1) |
| `85cf930` | docs(sprint): mark Change-B B1 as applied + verified (live DB, 6 jul 2026) |
| `4487abc` | feat(certificados): B2 dual-table verification page |
| `63c0e44` | feat(supabase): migration 004 explicit anon SELECT policies |
| `4eaeced` | docs(sprint): mark B2 applied + RLS verified (visual verify deferred) |

---

## Side Findings (deferred, not blocking)

- `certificados.astro:130` closes `</section>` lowercase while opening is `<Section>` (Astro component) — cosmetic
- `<a href="verificar">` retry link is a relative path that resolves to 404 — pre-existing, out of scope

---

## Out of Scope (deferred to later phase)

| # | Task | Effort |
|---|------|--------|
| D1 | Refactor `scripts/issue-certificate.mjs` (--tipo flag + field mapping) | 1-2h |
| D2 | Refactor `.github/workflows/issue-certificate.yml` | 30min |
| D3 | QR generation + Supabase Storage | 3-4h |
| D4 | Provisioning of `tania@cbhe.org.bo` and `alejandra@cbhe.org.bo` in Supabase Auth | 30min (managed by Vincent) |
| D5 | Training session + GUIA-CERTIFICADOS.md (paired with Change-C) | 1h |

---

## Effort / Risk

- **Effort**: ~4-5h (B1) + ~30min (B2 page) + ~30min (RLS fix / migration 004) + ~30min (visual verify) = ~6h total
- **Risk**: LOW (idempotent migrations, single file UI change, no breaking changes to existing flows)

---

## Lessons Learned

- **Verify RLS by row count, not HTTP status code.** The orchestrator initially confirmed "anon SELECT works" with HTTP 200 but didn't check that 0 rows were returned. Migration 004 fixes the missing `anon_select_*` policies.
- **Pre-verify the live DB state before writing migrations.** Saved scope from "DROP + CREATE + RLS" to "rename + triggers + grants + cleanup".
- **Local preview with custom domain in `site:`** requires temporary override to `http://127.0.0.1:4321` + rebuild, then restore. Don't try route interception in Playwright.
- **Migration 004 was a discovery.** Expected RLS policies to exist from migration 003's assumptions; they didn't. Verify RLS boundaries explicitly when anon is involved.

---

## Archival Storage

| Item | Location |
|------|----------|
| Archive directory | `openspec/changes/archive/2026-07-06-cert-parallel-split/` |
| Archive report | (this file) |
| Source of truth | `openspec/specs/cert-split-storage/spec.md` + `openspec/specs/cert-split-verification/spec.md` |
| Engram | topic_key `sdd/cert-parallel-split/archive-report` (via `mem_save`) |

---

## Status

- **ready-to-push**: 8 commits from `2fe7cb8` through `4eaeced`, plus archive commit(s)

## Next Steps

1. **Push** `feat/custom-domain` to remote (when ready)
2. **Open PR** for Change-B (or stack into the sprint PR)
3. **Start Change-C** (`editor-handoff-docs`) — depends on B being merged

# Tasks: Editor Handoff Documentation

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 600-700 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | 3 parallel PRs (one per document) or 1 PR with size:exception |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | GUIA-EDITORES.md (3 diagrams, 4 tables) | PR 1 | ~200 lines, self-contained |
| 2 | GUIA-CERTIFICADOS.md (5 diagrams, 3 tables) | PR 2 | ~300 lines, self-contained |
| 3 | README.md refactor (1 diagram, cross-links) | PR 3 | ~150 lines net, links to units 1+2 |

## Phase 1: Data Gathering

All tasks parallel — read live config/code for accurate diagram source data.

- [ ] 1.1 Read `public/admin/config.yml` → extract collection names, fields, media_folder, backend config
- [ ] 1.2 Read `.github/workflows/deploy.yml` → extract triggers, build steps, deploy target, skip_ci behavior
- [x] 1.3 Read `supabase/migrations/003_split_certificados.sql` → extract table columns, prefixes, trigger names
- [x] 1.4 Read `supabase/functions/generate-qr/index.ts` → extract QR pipeline: qrcode lib, Storage upload, UPDATE qr_url
- [ ] 1.5 Read `README.md` → identify sections to keep (stack, build, deploy, gotchas) vs remove (editor/cert instructions)

## Phase 2: GUIA-EDITORES.md

- [x] 2.1 Write document skeleton: Última revisión date, audience section, cross-links footer
- [x] 2.2 Write 3 diagrams: `sveltia-workflow` flowchart, `deploy-pipeline` sequence, `image-flow` flowchart — shared `classDef` palette
- [x] 2.3 Write 4 tables: collection fields (from config.yml), markdown cheat sheet, troubleshooting, glossary
- [x] 2.4 Wire sections, add prose bridges (≤3 lines each), verify diagrams+tables >70%

## Phase 3: GUIA-CERTIFICADOS.md

- [x] 3.1 Write document skeleton: Última revisión date, audience section, cross-links footer
- [x] 3.2 Write 2 structural diagrams: `schema-dual` erDiagram, `qr-pipeline` sequence
- [x] 3.3 Write 3 flowcharts: `emitir-capacitacion`, `emitir-sello`, `verificacion-publica`
- [x] 3.4 Write 3 tables: Sello-vs-Capacitación comparison, roles/permissions, error/cause/solution (incl. NULL qr_url retry)
- [x] 3.5 Write numbered steps for export/backup, certificate delivery, verification URL + async wait note

## Phase 4: README.md Refactor

- [x] 4.1 Remove editor operational instructions and certificate emission procedures
- [x] 4.2 Add cross-links to GUIA-EDITORES.md and GUIA-CERTIFICADOS.md near top
- [x] 4.3 Write `system-architecture` Mermaid graph: Astro SSG→Pages, Sveltia→GitHub, Supabase (DB+Storage+Edge+Webhooks), cert flow
- [x] 4.4 Add Quick Start (clone→install→dev, copy-pasteable) + folder structure table
- [x] 4.5 Retain stack/build/deploy/gotchas; add Última revisión date; trim prose

## Phase 5: Verification

All tasks run after all documents written.

- [ ] 5.1 Run `npx astro build` — must pass (guard against accidental breakage)
- [ ] 5.2 Push to branch, open each .md on GitHub — verify all 9 Mermaid diagrams render
- [ ] 5.3 Click every cross-document link — verify all resolve on GitHub
- [ ] 5.4 Audit content ratio: diagrams+tables >70%, prose <30% per guide

# Delta for editor-handoff-docs

> Pure documentation change — no code, no schema, no spec-level behavior changes. Three Markdown deliverables at repo root, GitHub-native Mermaid rendering. Governing principle: **diagrams over text** — a flowchart answers an operational question in ~10s; prose is secondary (<30% of content). Depends on Change-B (`cert-parallel-split`) being complete, since the dual-table + auto-QR system is what is being documented.

## ADDED Requirements

### Requirement: Editor Runbook (`GUIA-EDITORES.md`)

A new Spanish runbook SHALL enable a non-technical editor (Comunicación, Alejandra, Tania) to operate Sveltia CMS independently. Content distribution: diagrams + tables >70%, prose <30%.

| # | The document MUST / SHALL |
|---|---|
| 1 | SHALL document initial access — login URL, GitHub token, first-time setup — in ≤5 bullets |
| 2 | MUST include `sveltia-workflow` flowchart: login → write → **Save** (draft) vs **Save & Publish** (live) → deploy → visible |
| 3 | MUST include `deploy-pipeline` sequence: commit without `[skip ci]` → GitHub Actions → build → live site |
| 4 | MUST include `image-flow` flowchart: upload → format/size limits → reference in content |
| 5 | SHALL list fields per collection (Artículos, Cursos, Empresas) as a table, not prose |
| 6 | SHALL include a Markdown syntax cheat-sheet table |
| 7 | MUST include a problem/solution troubleshooting table |
| 8 | SHALL include a CBHE domain glossary (CBHE, RSE, Sello) and a technical-support contact |

#### Scenario: Non-technical editor publishes unaided
- GIVEN an editor with GitHub repo access and no technical background
- WHEN they follow `GUIA-EDITORES.md` without assistance
- THEN they log in, write, and publish content to the live site
- AND the `sveltia-workflow` flowchart alone distinguishes Save (draft) vs Save & Publish (live)

#### Scenario: Diagram-first ratio holds
- GIVEN the completed `GUIA-EDITORES.md`
- WHEN content distribution is measured
- THEN diagrams + tables exceed 70% and prose is under 30%

### Requirement: Certificate Runbook (`GUIA-CERTIFICADOS.md`)

A new Spanish operational runbook SHALL enable Tania (Sello) and Alejandra (Capacitación) to operate the dual-table certificate system independently.

| # | The document MUST / SHALL |
|---|---|
| 1 | MUST include `schema-dual` ER diagram: tables `capacitacion` & `sello`, fields, code prefixes `CBHE-C-` vs `CBHE-S-`, link to verification landing |
| 2 | MUST include `emitir-capacitacion` flowchart: Studio → `capacitacion_input` → INSERT 3 fields → trigger → QR auto-generated |
| 3 | MUST include `emitir-sello` flowchart: Studio → `sello_input` → INSERT 2 fields → trigger → QR auto-generated |
| 4 | MUST include `qr-pipeline` sequence: INSERT → pg_net webhook → Edge Function `generate-qr` → Storage bucket → UPDATE `qr_url` |
| 5 | MUST include `verificacion-publica` flowchart: scan QR → `/certificados/?c=CODIGO` → prefix detects table → query → display |
| 6 | SHALL include a Sello-vs-Capacitación comparison table, not prose |
| 7 | SHALL include a roles/permissions table (who / which table / what they can do) |
| 8 | MUST include an error/cause/solution procedure table (incl. NULL `qr_url` manual retry) |
| 9 | SHALL include data export/backup (≤3 numbered steps) and certificate-delivery steps |
| 10 | SHALL state the public verification URL and the asynchronous QR-wait note (1–2 min) |

#### Scenario: Operator emits a capacitación certificate unaided
- GIVEN Alejandra has Supabase Studio access and no technical background
- WHEN she follows `GUIA-CERTIFICADOS.md` without assistance
- THEN she inserts a row in `capacitacion_input` and the code + QR generate automatically
- AND she knows to wait 1–2 min for the asynchronous QR and where to retry if missing

#### Scenario: Wrong-table recovery
- GIVEN an operator inserted a row in the wrong table
- WHEN they consult the troubleshooting table
- THEN they find the recovery procedure (copy data, delete, re-insert in the correct table)

### Requirement: Developer Reference (`README.md` refactor)

The existing `README.md` SHALL be refactored into a Technical Reference for future developers, removing content now covered by the two guides.

| # | The document MUST / SHALL |
|---|---|
| 1 | MUST remove editor operational instructions and certificate emission procedures (now in the dedicated guides) |
| 2 | MUST retain technical sections: stack, build, deploy, project gotchas |
| 3 | MUST include one `architecture-overview` Mermaid graph: Astro SSG → GitHub Pages, Sveltia → GitHub, Supabase (DB + Storage + Edge Functions + Webhooks), certificates (issue → QR → verify) |
| 4 | SHALL add cross-links to both guides near the top of the file |
| 5 | MUST include a Quick Start enabling `git clone && npm install && npm run dev` without assistance, plus a folder-structure table |

#### Scenario: New developer onboards unaided
- GIVEN a new developer clones the repo
- WHEN they read `README.md` only
- THEN they run `npm install` and `npm run dev` successfully without external help
- AND the architecture graph shows how SSG, CMS, and Supabase fit together

#### Scenario: Audience separation
- GIVEN the refactored `README.md`
- WHEN an editor or certificate operator opens it
- THEN they find a cross-link to their dedicated guide rather than operational instructions

### Requirement: Cross-Document Consistency

All three documents SHALL share rendering, dating, and linking conventions.

| # | The documents MUST / SHALL |
|---|---|
| 1 | MUST render all Mermaid diagrams natively on GitHub (no external dependencies) |
| 2 | SHALL display an "Última revisión" date at the top of each document |
| 3 | SHALL cross-link between the three documents |
| 4 | SHALL use Spanish for user-facing guides (`GUIA-*`); `README.md` targets developers |

#### Scenario: GitHub rendering
- GIVEN any of the three documents pushed to the repo
- WHEN viewed on GitHub.com
- THEN all Mermaid diagrams render visibly and cross-links resolve

#### Scenario: Staleness signal
- GIVEN a reader opens any guide
- WHEN they look at the top of the document
- THEN they see an "Última revisión" date indicating when it was last verified

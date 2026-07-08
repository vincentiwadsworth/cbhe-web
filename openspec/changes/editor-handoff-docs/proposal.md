# Proposal: Editor Handoff Documentation

## Intent

Deliver three Markdown handoff documents for the CBHE team, using Mermaid.js diagrams as primary communication. Non-technical editors and certificate operators need self-service runbooks; future developers need a clean Technical Reference. The current `README.md` mixes audiences and lacks operational guides.

## Scope

### In Scope
- `GUIA-EDITORES.md` — CMS runbook for non-technical editors (Sveltia CMS, content lifecycle, images, deploy pipeline). 3 Mermaid flowcharts.
- `GUIA-CERTIFICADOS.md` — Certificate operations runbook (dual-table schema, QR auto-generation pipeline, public verification). 5 Mermaid diagrams (flowcharts, ER, sequence).
- `README.md` — Refactor: remove editor/cert content now covered by guides, add 1 Mermaid architecture overview diagram, add cross-links to both guides, keep stack/build/deploy sections.

### Out of Scope
- Video tutorials, PDF exports, FAQ integration, translations, Zendesk/Intercom
- `tour-del-proyecto.md` changes (internal architecture docs)

## Capabilities

### New Capabilities
None

### Modified Capabilities
None

> This is a pure documentation change — no code, no schema, no spec-level behavior changes.

## Approach

Three root-level Markdown files, GitHub-natively rendered (Mermaid diagrams render without external dependencies). Principle: **diagrams over text** — flowcharts answer operational questions in 10 seconds; prose takes minutes. Each document targets a single audience.

| Document | Audience | Primary Medium | Diagrams |
|----------|----------|---------------|----------|
| `GUIA-EDITORES.md` | Comunicación, Alejandra, Tania | Mermaid flowcharts | Content lifecycle, deploy pipeline, image flow |
| `GUIA-CERTIFICADOS.md` | Tania (Sello), Alejandra (Capacitación) | Mermaid flowcharts + ER + sequence | Dual schema ER, issue capacitación, issue sello, QR pipeline sequence, verification flow |
| `README.md` | Future developers | Markdown + 1 architecture graph | System architecture overview |

Each guide structure: access instructions (table), procedures (flowchart per task), troubleshooting (Q&A table), glossary. Prose is secondary — the diagram is the answer. All three include cross-links and "Última revisión" date.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `GUIA-EDITORES.md` (root) | New | CMS runbook — Sveltia, content, images, deploy |
| `GUIA-CERTIFICADOS.md` (root) | New | Certificate ops — dual schema, QR pipeline, verification |
| `README.md` (root) | Modified | Remove editor/cert sections, add architecture diagram + guide links |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Mermaid syntax errors prevent rendering on GitHub | Low | Verify each diagram in GitHub preview before finalizing |
| Guides become stale as system evolves | Med | "Última revisión" date on each doc; references to SPRINT-ENTREGA.md for scope boundaries |
| Spanish technical terms confuse non-technical readers | Low | Per-guide glossary of CBHE domain terms; avoid internal jargon |

## Rollback Plan

`git revert` the commit. Documentation is additive — no code dependencies to unwind.

## Dependencies

- Change-B (`cert-parallel-split`) completed — dual-table schema, verification landing, and auto-QR pipeline are the system being documented
- `SPRINT-ENTREGA.md` as authoritative scope reference

## Success Criteria

- [ ] All 3 documents render correctly on GitHub (Mermaid diagrams visible, cross-links working)
- [ ] Each guide includes "Última revisión" date at the top
- [ ] `README.md` enables a new developer to `git clone && npm install && npm run dev` without assistance
- [ ] Verbal sign-off from Tania (Sello CBHE), Alejandra (Capacitación), and Comunicación

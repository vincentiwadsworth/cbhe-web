# Design: Editor Handoff Documentation

## Technical Approach

Produce three root-level Markdown documents with GitHub-native Mermaid rendering. No code or schema changes. The proposal's **diagrams-over-text** principle governs: flowcharts answer operational questions in ~10 seconds; prose is support (< 30%). All diagrams use a single high-contrast color convention defined below.

Dependencies: Change-B (`cert-parallel-split`) complete — dual-table schema, auto-QR pipeline, and verification landing are the live system being documented.

---

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| Diagram engine | Mermaid.js (GitHub native) | Excalidraw, PlantUML, static PNG | Zero external dependencies; editors view diagrams directly on GitHub.com |
| Document count | 3 files (2 guides + 1 README) | Single mega-doc, PDF, wiki | Single-audience-per-file; GitHub renders .md natively; easy to version |
| Language split | `GUIA-*.md` in Spanish; `README.md` in English | All Spanish, all English | Guides serve CBHE staff (Spanish); README serves future developers (English convention) |
| Diagram-to-text ratio | > 70% diagrams + tables | Prose-heavy runbook | Per proposal; flowcharts reduce support burden |
| Styling | Unified `classDef` palette across all 9 diagrams | Ad-hoc colors per diagram | Consistency, accessibility, faster implementation |

---

## Document Architecture

```
                    ┌─────────────────────┐
                    │   Cross-Link Mesh   │
                    └─────────┬───────────┘
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ GUIA-EDITORES   │ │ GUIA-CERTIFICADOS│ │   README.md     │
│   .md           │ │     .md          │ │  (refactored)   │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ Audience:       │ │ Audience:       │ │ Audience:       │
│ Comunicación,   │ │ Tania, Alejandra│ │ Future devs     │
│ Alejandra, Tania│ │ (cert operators)│ │                 │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ Diagrams: 3     │ │ Diagrams: 5     │ │ Diagrams: 1     │
│ (flowchart,     │ │ (ER, flowchart, │ │ (architecture   │
│  sequence)      │ │  sequence)      │ │  graph)         │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Cross-Links
Every document includes a "Documentos relacionados" section with relative Markdown links:
- `GUIA-EDITORES.md` ↔ `GUIA-CERTIFICADOS.md` ↔ `README.md`

### Audience Matrix

| Document | Primary Audience | Secondary Audience | Never For |
|----------|-----------------|-------------------|-----------|
| `GUIA-EDITORES.md` | Comunicación (articles), Alejandra (courses), Tania (content) | — | Certificate operations |
| `GUIA-CERTIFICADOS.md` | Tania (Sello), Alejandra (Capacitación) | Comunicación (verifies codes) | Content editing |
| `README.md` | Future developers | — | Day-to-day CBHE operations |

---

## Data Flow (Documentation Production)

```
Inspect live code/schema ──→ Draft diagrams in .md ──→ GitHub preview validate
         │                                               │
         └──────── SPRINT-ENTREGA.md (authority) ───────┘
```

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `GUIA-EDITORES.md` | Create | CMS runbook — Sveltia workflow, deploy pipeline, image handling |
| `GUIA-CERTIFICADOS.md` | Create | Certificate ops — dual schema, QR pipeline, verification, troubleshooting |
| `README.md` | Modify | Refactor: remove editor/cert content, add architecture graph + cross-links + Quick Start |

---

## Mermaid Diagram Inventory

| ID | Type | Document | What It Shows | Complexity |
|----|------|----------|---------------|------------|
| `sveltia-workflow` | flowchart | `GUIA-EDITORES.md` | Content lifecycle: login → write → **Save** (draft) vs **Save & Publish** (live) → deploy → visible | Medium |
| `deploy-pipeline` | sequence | `GUIA-EDITORES.md` | Commit without `[skip ci]` → GitHub Actions → build → deploy → `cbhe.org.bo` live | Simple |
| `image-flow` | flowchart | `GUIA-EDITORES.md` | Upload image → format/size limits → reference in collection content | Simple |
| `schema-dual` | erDiagram | `GUIA-CERTIFICADOS.md` | `capacitacion` + `sello` tables, fields, code prefixes `CBHE-C-` vs `CBHE-S-`, link to verification landing | Medium |
| `emitir-capacitacion` | flowchart | `GUIA-CERTIFICADOS.md` | Step by step: Supabase Studio → `capacitacion_input` → INSERT 3 fields → trigger → QR auto-generated | Simple |
| `emitir-sello` | flowchart | `GUIA-CERTIFICADOS.md` | Same flow for `sello_input` → INSERT 2 fields → trigger → QR auto-generated | Simple |
| `qr-pipeline` | sequence | `GUIA-CERTIFICADOS.md` | INSERT → `pg_net` webhook → Edge Function `generate-qr` → Storage bucket → UPDATE `qr_url` | Medium |
| `verificacion-publica` | flowchart | `GUIA-CERTIFICADOS.md` | Scan QR → `/certificados/?c=CODIGO` → detect prefix → query correct table → display data | Medium |
| `system-architecture` | graph | `README.md` | Full system: Astro SSG → GitHub Pages, Sveltia CMS → GitHub, Supabase (DB + Storage + Edge Functions + Webhooks), certificates flow | Complex |

**Total: 9 diagrams**

---

## Document Structure per File

### `GUIA-EDITORES.md`

```
GUIA-EDITORES.md
├── Última revisión: YYYY-MM-DD
├── ¿Para quién es esta guía? (1 paragraph + audience badges)
├── Acceso inicial
│   └── Login URL, GitHub token, primera vez (≤ 5 bullets)
├── Ciclo de vida del contenido
│   └── [DIAGRAMA: sveltia-workflow]
├── Colecciones y campos
│   └── Tabla: Colección | Campos obligatorios | Campos opcionales | Notas
├── Imágenes
│   └── [DIAGRAMA: image-flow]
├── Sintaxis Markdown rápida
│   └── Tabla: Elemento | Sintaxis | Ejemplo
├── ¿Cómo se publica el sitio?
│   └── [DIAGRAMA: deploy-pipeline]
├── Problemas comunes
│   └── Tabla: Problema | Causa probable | Solución
├── Glosario
│   └── Tabla: Término | Significado
├── Soporte técnico
│   └── Contacto + enlaces
└── Documentos relacionados
    └── Links a GUIA-CERTIFICADOS.md y README.md
```

### `GUIA-CERTIFICADOS.md`

```
GUIA-CERTIFICADOS.md
├── Última revisión: YYYY-MM-DD
├── ¿Para quién es esta guía? (1 paragraph + audience badges)
├── Sello CBHE vs Capacitación
│   └── Tabla comparativa: Aspecto | Sello CBHE | Capacitación
├── Esquema de datos
│   └── [DIAGRAMA: schema-dual]
├── Roles y permisos
│   └── Tabla: Quién | Tabla | Puede hacer
├── Emitir un certificado de capacitación
│   └── [DIAGRAMA: emitir-capacitacion]
├── Emitir un Sello CBHE
│   └── [DIAGRAMA: emitir-sello]
├── Cómo funciona el QR (explicación técnica breve)
│   └── [DIAGRAMA: qr-pipeline]
├── Verificación pública
│   ├── [DIAGRAMA: verificacion-publica]
│   ├── URL pública de verificación
│   └── Nota: espera 1–2 min para QR async
├── Errores y soluciones
│   └── Tabla: Error | Causa | Solución (incl. NULL qr_url → retry manual)
├── Resguardo y backup
│   └── 3 pasos numerados
├── Entrega al destinatario
│   └── Pasos numerados
├── Soporte técnico
│   └── Contacto + enlaces
└── Documentos relacionados
    └── Links a GUIA-EDITORES.md y README.md
```

### `README.md` (refactored)

```
README.md
├── Quick Start
│   └── git clone → npm install → npm run dev (copy-pasteable blocks)
├── Stack técnico
│   └── Tabla: Capa | Herramienta | Versión | Nota
├── Arquitectura del sistema
│   └── [DIAGRAMA: system-architecture]
├── Estructura de carpetas
│   └── Tabla: Path | Contenido
├── Build y deploy
│   └── Comandos + gotchas (GitHub Pages, custom domain)
├── Documentación operativa
│   ├── [GUIA-EDITORES.md](./GUIA-EDITORES.md) — para editores de contenido
│   └── [GUIA-CERTIFICADOS.md](./GUIA-CERTIFICADOS.md) — para operadores de certificados
├── Proyectos relacionados
│   └── tour-del-proyecto.md, SPRINT-ENTREGA.md
└── Licencia / créditos
```

---

## Mermaid Styling Convention

All 9 diagrams share a single high-contrast, accessible palette. Every `classDef` MUST include a `color:` property.

```mermaid
%% Styling boilerplate (include in every diagram)
classDef primary fill:#90EE90,stroke:#333,stroke-width:2px,color:darkgreen
classDef secondary fill:#87CEEB,stroke:#333,stroke-width:2px,color:darkblue
classDef database fill:#E6E6FA,stroke:#333,stroke-width:2px,color:darkblue
classDef decision fill:#FFD700,stroke:#333,stroke-width:2px,color:black
classDef error fill:#FFB6C1,stroke:#DC143C,stroke-width:2px,color:black
classDef terminal fill:#F5F5F5,stroke:#333,stroke-width:2px,color:black
```

| Token | Usage | Hex | Text color |
|-------|-------|-----|------------|
| `primary` | Start nodes, success paths, main actors | `#90EE90` | `darkgreen` |
| `secondary` | Secondary steps, external systems, CMS | `#87CEEB` | `darkblue` |
| `database` | Database, Storage, tables | `#E6E6FA` | `darkblue` |
| `decision` | Decision diamonds (Save vs Publish, prefix check) | `#FFD700` | `black` |
| `error` | Error states, retry paths, DELETE | `#FFB6C1` | `black` |
| `terminal` | Endpoints, final states | `#F5F5F5` | `black` |

**Rules:**
- Light background → dark text (`color:darkgreen`, `color:darkblue`, `color:black`)
- Always specify `color:` in every `classDef`
- Use Unicode semantic symbols (👤 📝 ⚙️ 🗄️ 📡 ✅ ❌ 🔄) inside node labels for scannability
- One diagram = one concept; no mega-diagrams

---

## Data Sources

Before drafting diagrams, read these files to ensure accuracy:

| File | Why | What to extract |
|------|-----|---------------|
| `src/components/Navbar.astro` | Site sections reference | Page names, URLs, mobile/desktop behavior |
| `src/pages/certificados.astro` | Verification flow logic | Prefix detection (`CBHE-C-` vs `CBHE-S-`), query mapping, `qr_url` conditional render |
| `astro.config.mjs` | Site config | `site`, `base`, collections, icon list |
| `.github/workflows/deploy.yml` | Deploy pipeline steps | Trigger events, build command, deploy target |
| `src/content.config.ts` | Content collections | Collection names, `glob()` loader paths, Zod fields |
| `public/admin/config.yml` (or Sveltia config) | CMS collections | Collections, fields, media folder |
| `supabase/migrations/003_split_certificados.sql` | Schema details | `capacitacion` / `sello` columns, prefixes, triggers |
| `supabase/migrations/004_*.sql` | RLS policies | `anon SELECT`, `service_role` CRUD |
| `supabase/functions/generate-qr/index.ts` | Edge Function logic | `qrcode` generation, Storage upload, `UPDATE qr_url` |
| `SPRINT-ENTREGA.md` | Authority on decisions | Scope boundaries, deferred items, current system state |

---

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Render | All 9 Mermaid diagrams display on GitHub | Push to branch → open each .md on github.com → visual check |
| Links | Cross-document relative links resolve | Click each link in GitHub preview |
| Accuracy | Diagrams match live system | Compare `certificados.astro` script, migration SQL, Edge Function code against diagram labels |
| Audience | Diagrams answer without prose | Ask: "Can Tania know what to do from the flowchart alone?" |

---

## Migration / Rollout

No migration required. Documentation is additive. Rollback: `git revert` the commit.

Phased delivery:
1. Draft `GUIA-CERTIFICADOS.md` first (highest operational risk — certificate ops).
2. Draft `GUIA-EDITORES.md` second.
3. Refactor `README.md` last (depends on the two guides existing for cross-links).

---

## Open Questions

- [ ] **Sveltia config location**: Is it `public/admin/config.yml` or another file? Need to confirm collection/field names for the table in `GUIA-EDITORES.md`.
- [ ] **Deploy workflow name**: The SPRINT doc mentions `deploy.yml` but the actual file may differ — verify exact filename and steps.
- [ ] **Image size limits**: Does the project enforce any max image dimensions or formats? Needed for `image-flow` constraints.
- [ ] **QR async delay wording**: SPRINT says 1–2 min; should the guide say "hasta 2 minutos" or provide a manual retry link? (The spec requires both.)

---

## Interfaces / Contracts

No new code interfaces. The "contract" between documents is the cross-link convention:

```markdown
## Documentos relacionados
- [Guía para Editores del Sitio](./GUIA-EDITORES.md)
- [Guía de Certificados](./GUIA-CERTIFICADOS.md)
- [Referencia Técnica (README)](./README.md)
```

And the shared frontmatter signal:
```markdown
> **Última revisión**: 2026-07-08
```

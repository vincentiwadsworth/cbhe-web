# Sprint Status — Entrega CBHE

**Sprint**: `sprint-entrega`
**Branch base**: `feat/custom-domain`
**Última actualización**: 2026-07-06

## Resumen

Sprint para cerrar la entrega formal del proyecto CBHE con: (1) fix de imágenes y tarjetas 1:1 [DONE], (2) sistema de certificados dual (Sello + Capacitación) [DONE ✅], (3) documentación de handoff para el equipo no-técnico [PENDIENTE, depende de C].

## Cambios

### Change-A · `fix-image-paths-and-card-aspect` — DONE

| Aspecto | Estado |
|---|---|
| SDD cycle | proposal → spec → design → tasks → apply → verify → archive |
| Commit | `74b9059` (11 files, 474 insertions, 8 deletions) |
| Push | Pusheado a `feat/custom-domain` el 2026-07-03 |
| Verdict | ready-to-merge |
| Archive | `openspec/changes/archive/2026-07-03-fix-image-paths-and-card-aspect/` |
| 4 REQs | PASS / PASS / PASS / PASS |
| Findings | 0 CRITICAL, 0 WARNING |
| Risks tracked | 5 (4 addressed, 1 deferred CSS warning pre-existente) |

**Cambios concretos**:
- `src/components/CourseCard.astro`: import + aspect-square + 1 image wrap
- `src/pages/capacitacion/[slug].astro`: import + 1 image wrap
- `src/pages/index.astro`: 2 image wraps (import ya existía)
- `src/pages/novedades.astro`: import + 2 inline `url()` wraps
- `src/pages/novedades/[slug].astro`: import + 1 image wrap
- `src/utils/images.ts`: tracked (era untracked, agregado vía amend)

### Change-B · `cert-parallel-split` — DONE ✅

**Scope cut (6 jul 2026)**: el plan original se simplificó drásticamente.

| Antes | Ahora |
|---|---|
| Dos páginas: `/capacitacion/?c=CODE` y `/sello/?c=CODE` | **Una sola landing**: `/certificados/?c=CODE` |
| PDF generation (Puppeteer) | **Descartado** |
| GH Actions para emisión diaria | **Solo para batch/emergencias con `service_role`** |
| `fecha_vencimiento`, `estado` (vigente/vencido/revocado) | **Fuera del schema — sin vigencia** |
| Trigger de código con prefijo (DB) | **Prefijos se manejan en cliente (landing)** |
| `scripts/issue-certificate.mjs` para uso diario | **Solo para batch, refactor pendiente (D1)** |

**DB state (real, ya migrado por el usuario 6 jul 2026 — verificado vía REST API)**:
- `public.capacitacion` — `id (uuid PK)`, `codigo (text UNIQUE)`, `cursante_nombre (text)`, `fecha_emision (date)`, `created_at (timestamptz)`, `nombre_capacitacion (text NULL)` + btree idx `codigo`. 1 row de muestra: `CBHE-Xcl7ajCGIT` (formato viejo, generado antes de la decisión de prefijos).
- `public."sello-cbhe"` — `id (uuid PK)`, `codigo (text UNIQUE)`, `empresa_nombre (text)`, `tipo_certificado (text default 'Sello CBHE')`, `fecha_emision (date)`, `created_at (timestamptz)` + btree idx `codigo`. 0 rows.
- `public.certificados` — **NO EXISTE** (ya dropeada antes; el `DROP IF EXISTS` de la migración 003 es no-op pero se mantiene por idempotencia).
- RLS ya en target: `anon SELECT` funciona, `anon INSERT` rejected (401), `service_role` CRUD full.

**Decisiones del usuario (cerradas 6 jul 2026)**:
- Schema: dos tablas reales + DROP defensivo de `certificados` (idempotente)
- Ruta: una sola landing (`/certificados/`)
- Prefijos: `CBHE-C-` (capacitacion) / `CBHE-S-` (sello) — discriminador en el cliente
- RLS: `anon SELECT` ambas; `service_role` full CRUD (verificado live)
- Emisión UI normal: Supabase Studio nativo
- Emisión batch: GH Actions con `service_role`
- Provisioning: magic link a `tania@cbhe.org.bo` y `alejandra@cbhe.org.bo`
- Training: "Guía + sesión breve" (~1h total)
- QR generation/storage: fase posterior — Supabase Storage confirmado viable (D3)
- Onboarding: "Guía + sesión breve"
- **Rename `sello-cbhe` → `sello`** (decidido 6 jul tras verificar DB)
- **Triggers nuevos** para auto-generar `CBHE-C-` / `CBHE-S-` codes (los triggers de la 002 están dead porque `certificados` no existe)
- **GRANTs explícitos** + **cleanup de funciones huerfanas** (`generate_certificate_code`, `set_certificate_code`)

**Tareas concretas (en este sprint)**:

| # | Tarea | Estado | Esfuerzo | Riesgo |
|---|---|---|---|---|
| B1 | Migración 003 (`supabase/migrations/003_split_certificados.sql`: rename + triggers + grants + cleanup) | ✅ DONE (live applied + verified 6 jul 2026) | 30min-1h | LOW |
| B2 | Modificar `src/pages/certificados.astro` (prefijo + query + UI) + migration 004 (RLS fix) | ✅ DONE (applied + visual verified 6 jul 2026) | 2-3h | LOW |

**DEFER (fase posterior)**:

| # | Tarea | Esfuerzo | Estado |
|---|---|---|---|
| D3 | Auto-QR pipeline (Edge Function + Storage + Webhooks) | 3-4h | 🔄 En ejecución (`auto-qr-generation`) |
| D6 | Renderizar QR en `/certificados/` | 30min | 🔄 En ejecución (`auto-qr-generation`) |
| D1 | Refactor `scripts/issue-certificate.mjs` (--tipo + campos) | 1-2h | ⏸️ Pendiente |
| D2 | Refactor `.github/workflows/issue-certificate.yml` | 30min | ⏸️ Pendiente |
| D4 | Provisioning de users (Tania, Alejandra) | 30min | ⏸️ Pendiente |
| D5 | Training (sesión breve + GUIA-CERTIFICADOS.md) | 1h | ⏸️ Pendiente |

**Artifacts**: archivados en `openspec/changes/archive/2026-07-06-cert-parallel-split/` con `proposal.md`, `specs/cert-split-storage/spec.md`, `specs/cert-split-verification/spec.md`, `tasks.md`, `archive-report.md`.

**Nuevas specs fuente**: `openspec/specs/cert-split-storage/spec.md` + `openspec/specs/cert-split-verification/spec.md`.

**Próximo paso concreto**: ejecutar Change `auto-qr-generation` (D3+D6) — en curso. Después, Change-C (`editor-handoff-docs`) puede empezar.

**Esfuerzo total estimado**: ~1 día sprint actual (B1+B2) + ~1 día deferred (D1-D5) · **Riesgo**: LOW-MEDIUM.

### Change-C · `editor-handoff-docs` — PENDIENTE ✅ (B está archivado, puede empezar)

**Scope planeado**:
- `GUIA-EDITORES.md` (nuevo): manual de uso del sitio para Comunicación, Alejandra, Tania.
- `GUIA-CERTIFICADOS.md` (nuevo): manual operativo del sistema dual de certificados.
- `README.md` (refactor): mantener secciones para developers, linkear a las dos guías, remover secciones redundantes.

**Esfuerzo estimado**: 1-2 días (después de Change-B implementado) · **Riesgo**: LOW.

## Acumulado en `feat/custom-domain`

| Commit | Cambio |
|---|---|
| `74b9059` | Change-A: fix images + cards 1:1 |
| `35e4125` | fix(navbar): 238px overflow at 768px (side finding del visual verify) |
| `dc21d90` | chore(gitignore): ignore Playwright + skill-registry cache |
| `5cf40e3` | docs(sprint): mark Change-A as fully closed with 3-commit closeout trail |
| `2fe7cb8` | docs(agents): document local preview gotcha with custom domain |
| `4d9174f` | docs(sprint): Change-B scope cut + cert-parallel-split openspec artifacts |
| `fefa469` | docs(sprint): Change-B cert-parallel-split spec phase + RLS simplification |
| `0df65b6` | docs(sprint): align Change-B B1 scope with verified DB state |
| `3856c04` | feat(supabase): migration 003 split certificados (B1) |
| `85cf930` | docs(sprint): mark Change-B B1 as applied + verified (live DB, 6 jul 2026) |
| `4487abc` | feat(certificados): B2 dual-table verification page |
| `63c0e44` | feat(supabase): migration 004 explicit anon SELECT policies |
| `4eaeced` | docs(sprint): mark B2 applied + RLS verified (visual verify deferred) |
| (futuro) | Change-C: editor handoff docs |

**HEAD actual**: `4eaeced`.

## Decisiones cerradas del sprint (6 jul 2026)

- Estructura: 3 PRs independientes (no 1 monolítico, no 4 separados)
- Schema cert: dos tablas reales (`capacitacion`, `sello-cbhe`), DROP defensivo de `certificados`
- **Ruta pública: UNA sola landing** `/certificados/?c=CODE` (no dos rutas separadas)
- Prefijos: `CBHE-C-` (capacitacion), `CBHE-S-` (sello) — discriminador en cliente
- UI de emisión: Supabase Studio (cada owner ve solo su tabla por RLS)
- Auth: magic link a emails institucionales (no team members compartidos)
- GH Actions: mantener para batch/emergencias con `service_role`
- Sin PDF, sin vigencia (`fecha_vencimiento`/`estado` fuera del schema)
- QR generation/storage: fase posterior (Supabase Storage confirmado viable)
- Onboarding: guía + sesión breve (~1h total)

## Out of scope (sprint)

- **DNS `cbhe.org.bo`** — pendiente del usuario. Una vez configurado, el sprint se deploya naturalmente a producción.
- Rediseño UX global (issues #7-16) — sprint aparte.
- Rediseño PreciosGrid — sprint aparte.
- Migración de los 17 certs de muestra (data descartable).

## Pendiente al retomar

- [x] ~~**Change-B**: ejecutar Tarea B1 (migración 003 reducida: rename + triggers + grants + cleanup).~~ ✅ APPLIED + VERIFIED 6 jul 2026.
- [x] ~~**Change-B**: ejecutar Tarea B2 (modificar `certificados.astro` + migration 004).~~ ✅ APPLIED + VISUAL VERIFIED 6 jul 2026.
- [x] ~~**Change-B**: ciclo SDD completo (proposal → spec → tasks → apply → verify → archive).~~ ✅ ARCHIVED 6 jul 2026.
- [ ] **Change-B**: ejecutar DEFER (D1-D5) en fase posterior — no bloquea el sprint actual.
- [ ] **Change-C**: ciclo completo (B ya está archivado, puede empezar).
- [ ] **DNS `cbhe.org.bo`**: confirmar si se configuró (estaba programado para el 6 de julio).
- [ ] **Visual verification de Change-A en `cbhe.org.bo`** cuando DNS esté activo.
- [ ] **Decidir merge de `feat/custom-domain` → `main`** (un PR grande o 3 PRs stacked) cuando los 3 changes estén merged.

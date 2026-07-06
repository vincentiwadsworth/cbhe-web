# Sprint Status — Entrega CBHE

**Sprint**: `sprint-entrega`
**Branch base**: `feat/custom-domain`
**Última actualización**: 2026-07-03

## Resumen

Sprint para cerrar la entrega formal del proyecto CBHE con: (1) fix de imágenes y tarjetas 1:1, (2) sistema de certificados dual (Sello + Capacitación), (3) documentación de handoff para el equipo no-técnico.

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

### Change-B · `cert-parallel-split` — DECISIONES CERRADAS, SDD PENDIENTE

**Decisiones tomadas con el usuario** (3 jul 2026):

| Decisión | Elección |
|---|---|
| UI de emisión | Supabase Studio nativo (no NocoDB). Tania y Alejandra acceden al Table Editor con RLS aplicado. |
| Migración de data | DROP + CREATE fresh. Los 17 certs son sample, se descartan. |
| User provisioning | Auth users separados con magic link: `tania@cbhe.org.bo` (sello) y `alejandra@cbhe.org.bo` (capacitacion). NO team members compartidos. |
| GitHub Actions | Mantener para emergencias (batch con `service_role`). UI es la vía normal. |

**Próximo paso**: lanzar `sdd-propose` con las decisiones cerradas.

**Scope esperado**:
- Nueva migración `supabase/migrations/003_split_certificados.sql` con tablas `capacitacion` y `sello` + RLS + triggers con prefijos.
- DROP de tabla `certificados` (data descartable).
- Nuevas páginas de verificación: `src/pages/capacitacion.astro` y `src/pages/sello.astro`.
- Refactor de `scripts/issue-certificate.mjs` y `.github/workflows/issue-certificate.yml` (queda para batch).
- Crear las dos auth users en Supabase con magic link.
- Documentar el setup en una guía para Tania y Alejandra.

**Esfuerzo estimado**: 3-5 días · **Riesgo**: MEDIUM (schema + auth + RLS + training).

### Change-C · `editor-handoff-docs` — PENDIENTE, depende de B

**Scope planeado**:
- `GUIA-EDITORES.md` (nuevo): manual de uso del sitio para Comunicación, Alejandra, Tania.
- `GUIA-CERTIFICADOS.md` (nuevo): manual operativo del sistema dual de certificados.
- `README.md` (refactor): mantener secciones para developers, linkear a las dos guías, remover secciones redundantes.

**Esfuerzo estimado**: 1-2 días (después de Change-B implementado) · **Riesgo**: LOW.

## Acumulado en `feat/custom-domain`

| Commit | Cambio |
|---|---|
| `74b9059` | Change-A: fix images + cards 1:1 |
| (futuro) | Change-B: cert parallel split |
| (futuro) | Change-C: editor handoff docs |

## Decisiones cerradas del sprint

- Estructura: 3 PRs independientes (no 1 monolítico, no 4 separados)
- Schema cert: dos tablas separadas (`capacitacion`, `sello`), DROP de `certificados`
- Rutas públicas: `/capacitacion/?c=CODE` y `/sello/?c=CODE` (no hay QRs físicos en producción)
- Prefijos: `CBHE-C-` (capacitacion), `CBHE-S-` (sello)
- UI de emisión: Supabase Studio (cada owner ve solo su tabla por RLS)
- Auth: magic link a emails institucionales (no team members compartidos)
- GH Actions: mantener para batch/emergencias

## Out of scope (sprint)

- DNS `cbhe.org.bo`: pendiente usuario, lunes 6 de julio
- Rediseño UX global (issues #7-16)
- Rediseño PreciosGrid

## Pendiente al retomar

- [ ] Change-B: lanzar `sdd-propose` con las 4 decisiones cerradas
- [ ] Change-B: ciclo completo (proposal → spec → design → tasks → apply → verify → archive)
- [ ] Change-C: ciclo completo (depende de B)
- [ ] DNS `cbhe.org.bo`: usuario configura el 6 de julio
- [ ] Visual verification de Change-A en `cbhe.org.bo` cuando DNS esté activo
- [ ] Cuando los 3 changes estén merged: visual verification final en producción
- [ ] Decidir merge de `feat/custom-domain` → `main` (un PR grande o 3 PRs stacked)

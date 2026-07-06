# Sprint de Entrega — CBHE

**Objetivo**: dejar el sitio en `cbhe.org.bo` listo para entrega formal a la CBHE, con sistema de certificados dual operativo y documentación de handoff para el equipo no-técnico.

**Rama base**: `feat/custom-domain` (HEAD `2fe7cb8` — Change-A cerrado y pusheado a la branch + 2 commits de housekeeping)
**Estrategia**: 3 PRs independientes (single-pr, budget 400 líneas por PR)
**Artifact store**: OpenSpec (`openspec/changes/`)
**Estado**: Change-A DONE ✅ · Change-B (scope cut 6 jul, ejecución en curso — B1 migración + B2 page) · Change-C (pendiente, depende de B)

---

## Change-A · `fix-image-paths-and-card-aspect` — **DONE** ✅

> Commit: `74b9059` · Verificado: 4 REQs PASS / 0 findings / 0 CRITICAL · Archive: `openspec/changes/archive/2026-07-03-fix-image-paths-and-card-aspect/`

**Problema**
- Imágenes del content collection (`data.image` en 7 ubicaciones, 5 archivos) bypasean `resolveImageUrl()`. Funciona con `base: "/"` pero es frágil ante cualquier cambio de `base` en `astro.config.mjs`.
- `CourseCard.astro` usa `aspect-video` (16:9) en la variante default; el resto del sitio no comparte esa proporción. Inconsistencia visual en Capacitación.

**Cambios**
- `src/components/CourseCard.astro` línea 54: `aspect-video` → `aspect-square` (variante default).
- `src/components/CourseCard.astro` línea 98: envolver `data.image` con `resolveImageUrl()`.
- `src/pages/capacitacion/[slug].astro` línea 99: envolver `curso.data.image`.
- `src/pages/index.astro` líneas 537 y 573: envolver `data.image`.
- `src/pages/novedades.astro` líneas 46 y 84: envolver `data.image` en `url(...)`.
- `src/pages/novedades/[slug].astro` línea 67: envolver `articulo.data.image`.

**Cierre (3 commits, 6 jul 2026)**
- `d1a6caf`: archive de los 5 SDD artifacts a `openspec/changes/archive/2026-07-03-fix-image-paths-and-card-aspect/` + housekeeping (AGENTS.md sprint ref + deploy gotchas, skill-registry refresh, este doc, sprint tracker).
- `35e4125`: fix del side finding del visual verify — 238px overflow horizontal del navbar a 768px (`md:flex` → `lg:flex` en `src/components/Navbar.astro:47` y `md:hidden` → `lg:hidden` en `:66`). Verificado con Playwright en 375/768/1024.
- `dc21d90`: gitignore cleanup (`.playwright-mcp/`, `/*.png`, `/.atl/.skill-registry.cache.json`).

**Acceptance**
- `npx astro build` sin warnings ni errores.
- `dist/**/*.html` contiene `<img src="/images/..."` correctas para `cbhe.org.bo`.
- Inspección visual: tarjetas de Capacitación muestran imágenes 1:1 sin overflow en mobile, tablet, desktop.

**Out of scope**
- Variantes `compact` (4:3) y `featured` (21:9) no se tocan.
- No se rediseñan las tarjetas en sí, solo la proporción y el wrap de imágenes.

**Esfuerzo**: ~30 min · **Riesgo**: LOW.

---

## Change-B · `cert-parallel-split` — **EJECUCIÓN EN CURSO** 🔄

> **Cambio de scope (6 jul 2026)**: el plan original (dos páginas separadas, PDF, GH Actions para emisión diaria, `fecha_vencimiento`, `estado`) se simplificó drásticamente. Nueva dirección:
> - **Una sola landing de verificación** (la `/certificados/` actual con copy/UX minimalista mejorado).
> - **Sin PDF** (descartado).
> - **Sin GH Actions para emisión diaria** (queda para batch/emergencias con `service_role`).
> - **Sin `fecha_vencimiento` ni `estado`** (sin vigencia).
> - **QR generation/storage** se resuelve en una fase posterior.
>
> La DB ya tiene las dos tablas nuevas. La migración folder está desincronizada — la Tarea B1 cierra eso.

**Problema**
- Un solo sistema (`certificados`) para dos flujos distintos: Sello CBHE (empresas, Tania) y Capacitación (personas, Alejandra). Las dos personas no pueden operar independientemente: comparten tabla, sin scope separation.
- La emisión hoy es CLI-only (`workflow_dispatch` de GitHub Actions), no usable para no-técnicas. Tania y Alejandra no pueden emitir sin asistencia.
- Los datos de cada flujo deben ser propiedad de su owner y resguardados por ella.
- La página de verificación actual (`src/pages/certificados.astro`) y el script de emisión (`scripts/issue-certificate.mjs`) están atados al esquema viejo de `certificados` con campos que no aplican.

**Schema real en DB (ya migrado, 6 jul 2026)**
- `public.capacitacion` — `id (uuid PK)`, `codigo (text UNIQUE)`, `cursante_nombre (text)`, `fecha_emision (date)`, `created_at (timestamptz)`, `nombre_capacitacion (text NULL)` + btree index en `codigo`.
- `public."sello-cbhe"` — `id (uuid PK)`, `codigo (text UNIQUE)`, `empresa_nombre (text)`, `tipo_certificado (text default 'Sello CBHE')`, `fecha_emision (date)`, `created_at (timestamptz)` + btree index en `codigo`.
- ⚠️ **`sello-cbhe` tiene guión medio** — requiere quoting en cada query (`FROM "sello-cbhe"`). **Decisión abierta**: ¿renombramos a `sello_cbhe` o `sello` en la migración 003? Recomendación: renombrar a `sello` (limpio, sin guión).
- `public.certificados` (vieja) — sigue en la DB hasta que la Tarea B1 la dropee con `DROP TABLE IF EXISTS CASCADE`.

**Decisiones del usuario (cerradas 6 jul 2026)**
- **Schema**: dos tablas reales (ya creadas en DB). DROP defensivo de `certificados` en la migración 003 (data es de muestra, descartable).
- **Ruta de verificación pública**: **UNA SOLA landing** — la `/certificados/` actual, con copy/UX minimalista. No más `/capacitacion/?c=CODE` y `/sello/?c=CODE` separados.
- **Prefijos de código**: `CBHE-C-XXXXXXXXXX` (capacitacion) y `CBHE-S-XXXXXXXXXX` (sello). La landing detecta el prefijo y consulta la tabla correcta.
- **RLS**: `anon` SELECT en ambas tablas (verificación pública). `authenticated` con scope por email — `tania@cbhe.org.bo` solo `sello-cbhe`, `alejandra@cbhe.org.bo` solo `capacitacion`. `service_role` full CRUD en ambas (batch/emergencias).
- **Emisión — UI normal**: Supabase Studio nativo, cada owner accede a su tabla vía auth user.
- **Emisión — batch/emergencias**: GH Actions con `service_role`, refactor mínimo del script.
- **Sin PDF, sin vigencia**: la página de verificación muestra los datos básicos del cert sin estado ni vencimiento.
- **QR generation/storage**: fase posterior. Supabase Storage confirmado viable (S3-compatible, buckets + RLS + URL pública).
- **Provisioning de users**: magic link a `tania@cbhe.org.bo` y `alejandra@cbhe.org.bo`.
- **Training**: guía + sesión breve (~1h total).

**Tareas concretas (en este sprint)**

### Tarea B1 · Migración 003 (schema + RLS) — **PRIMERO** ⏳
- **Archivo nuevo**: `supabase/migrations/003_split_certificados.sql`
- **Contenido**:
  - `DROP TABLE IF EXISTS public.certificados CASCADE` (defensivo)
  - `CREATE TABLE public.capacitacion` + `public."sello-cbhe"` (o `sello` si se renombra) — matcheando el estado actual de la DB
  - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` en ambas
  - Policies: `anon SELECT`, `authenticated SELECT` con scope por email, `service_role` full CRUD
  - Grants al `anon` y `authenticated` role
- **Acción adicional**: ejecutar la migración contra la DB para alinear el estado.
- **Esfuerzo**: ~1-2h · **Riesgo**: MEDIUM (cambio de schema + RLS)
- **Done cuando**: la DB matchea la migración 003 y los policies pasan tests SQL directos (Tania no ve capacitacion y viceversa).

### Tarea B2 · Modificar `src/pages/certificados.astro` — **SEGUNDO** ⏳
- **Archivo**: `src/pages/certificados.astro` (modify, 277 → ~290 líneas estimadas)
- **Cambios**:
  - Detección de prefijo del código (`CBHE-C-` vs `CBHE-S-`) en el script inline
  - Query a la tabla correcta (`capacitacion` o `sello-cbhe`)
  - Mapeo de campos: `cursante_nombre` / `empresa_nombre`, `nombre_capacitacion` / `tipo_certificado`
  - Sacar UI de `fecha_vencimiento` y `estado` (vigente/vencido/revocado) — solo "Verificado"
  - Actualizar copy: "Certificado de Capacitación" / "Sello CBHE" según el tipo, tono minimalista
- **Esfuerzo**: ~2-3h · **Riesgo**: LOW (página ya funciona, cambios mecánicos)
- **Done cuando**: `npx astro build` sin errores + verificación visual con Playwright en `/certificados/?c=CBHE-C-XXX` y `/certificados/?c=CBHE-S-XXX` muestra los datos correctos.

**Tareas DEFER (fase posterior) ⏸️**
- **D1 · Refactor `scripts/issue-certificate.mjs`** — soportar `--tipo capacitacion|sello` y campos correctos. Solo para batch con `service_role`. ~1-2h.
- **D2 · Refactor `.github/workflows/issue-certificate.yml`** — alinear con el script refactoreado. ~30min.
- **D3 · QR generation + Supabase Storage** — generación del PNG (script local? Edge Function?), upload al bucket, link en el cert. ~3-4h.
- **D4 · Provisioning de users** — crear `tania@cbhe.org.bo` y `alejandra@cbhe.org.bo` en Supabase Auth con magic link. ~30min.
- **D5 · Training** — sesión breve de 30min con cada una + entrega de `GUIA-CERTIFICADOS.md`. ~1h.

**Acceptance**
- `npx astro build` sin warnings ni errores.
- `/certificados/?c=CBHE-C-XXX` muestra datos del cursante y la capacitación.
- `/certificados/?c=CBHE-S-XXX` muestra datos de la empresa y el tipo de certificado.
- RLS impide que Tania vea datos de Capacitación y viceversa (verificado con tests SQL directos).
- La DB matchea la migración 003 (commiteada en el repo, ejecutable desde cero).
- `SPRINT-ENTREGA.md` y `openspec/changes/cert-parallel-split/` reflejan el estado real.

**Out of scope (Change-B)**
- QR generation/storage (D3) — fase posterior.
- PDF generation — descartado por el usuario.
- Rediseño visual de la página de verificación (más allá del copy mínimo y la remoción de UI innecesaria).
- NocoDB o cualquier UI custom — se usa Supabase Studio nativo.
- Migración de los 17 certs de muestra (data descartable).

**Esfuerzo**: ~1 día (B1 + B2) + ~1 día deferred (D1-D5) · **Riesgo**: LOW-MEDIUM.

---

## Change-C · `editor-handoff-docs`

**Problema**
- El equipo CBHE (Comunicación, Alejandra, Tania) necesita operar el sitio y el sistema de certificados sin asistencia técnica.
- El `README.md` actual mezcla instrucciones para editores y para developers, no apto para no-técnicos.
- El sistema dual de certificados necesita su propio manual de operación, separado de la guía del sitio.
- Estas guías son **entregables puntuales, concisos y profesionales** — el tono debe ser de manual de operaciones, no tutorial técnico.

**Cambios**

### Documento 1: `GUIA-EDITORES.md` (nuevo)
Manual de uso del sitio, para no-técnicos.
- **Audiencia**: Comunicación (publica artículos, novedades, testimonios, empresas), Alejandra (gestiona cursos), Tania (opera Sello CBHE).
- **Contenido**:
  1. Acceso al CMS Sveltia (login con GitHub, token, primera vez).
  2. Save vs Save and Publish — diferencia clave, qué dispara deploy.
  3. Imágenes: cómo subirlas desde Sveltia, formato y tamaño recomendado.
  4. Borradores: qué son, cómo se manejan, cuándo aparecen en el sitio.
  5. Campos por colección: tabla con semántica de cada campo, no solo el nombre.
  6. Markdown cheat sheet (negrita, links, imágenes, listas).
  7. Problemas comunes y soluciones (tabla pregunta/respuesta).
  8. Glosario de términos del dominio (CBHE, RSE, Sello, etc.).
  9. Contacto para soporte técnico.

### Documento 2: `GUIA-CERTIFICADOS.md` (nuevo)
Manual operativo del sistema dual de certificados, separado de la guía del sitio.
- **Audiencia**: Tania (Sello), Alejandra (Capacitación), Comunicación (valida códigos cuando le preguntan).
- **Contenido**:
  1. Diferencia entre Sello CBHE y Certificado de Capacitación (tabla comparativa).
  2. Cómo emitir un Sello paso a paso (con capturas, flujo en la UI).
  3. Cómo emitir un Certificado de Capacitación paso a paso.
  4. Cómo verificar públicamente (URLs, qué ve el público visitante).
  5. Cómo resguardar datos: export a Excel periódico, dónde guardarlo, política de backup.
  6. Roles y permisos: qué puede hacer cada persona en su tabla.
  7. Procedimiento ante errores: revocar, reemitir, corregir.
  8. Procedimiento de entrega al destinatario: PDF, QR, link de verificación.

### Documento 3: `README.md` (refactor quirúrgico)
- Mantiene secciones técnicas para developers (Astro, Tailwind, build, deploy).
- Remueve las secciones ahora cubiertas por `GUIA-EDITORES.md` y `GUIA-CERTIFICADOS.md`.
- Agrega links cruzados a las dos guías al inicio del archivo.

**Acceptance**
- Las 3 personas involucradas aprueban sus guías (sign-off verbal, registrado en este doc).
- Las guías están en español, con capturas y tono profesional pero accesible.
- Links cruzados funcionan desde y hacia `README.md`.
- Las guías reflejan el sistema dual implementado en Change-B.
- Cada guía tiene fecha de última revisión visible al inicio.

**Out of scope**
- Traducciones a otros idiomas.
- Videos tutoriales.
- FAQ en línea, integración con Zendesk/Intercom.
- Documentación de arquitectura interna (eso queda en `tour-del-proyecto.md`).

**Esfuerzo**: 1-2 días (después de Change-B implementado, para que refleje el sistema final) · **Riesgo**: LOW.

---

## Orden de ejecución

1. **Change-A** (~30 min) — fix mecánico, primer PR, base para que Capacitación funcione bien.
2. **Change-B** (3-5 días) — incluye setup de UI, training breve de Tania y Alejandra, sign-off de RLS.
3. **Change-C** (1-2 días) — escribe sobre Change-B ya implementado, no antes.

## Out of scope (sprint)

- **DNS `cbhe.org.bo`** — pendiente del usuario. Una vez configurado, el sprint se deploya naturalmente a producción.
- Rediseño UX global (issues #7-16) — sprint aparte.
- Rediseño PreciosGrid — sprint aparte.
- Migración de los 17 certs de muestra — data descartable.

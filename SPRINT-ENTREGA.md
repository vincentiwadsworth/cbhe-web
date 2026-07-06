# Sprint de Entrega — CBHE

**Objetivo**: dejar el sitio en `cbhe.org.bo` listo para entrega formal a la CBHE, con sistema de certificados dual operativo y documentación de handoff para el equipo no-técnico.

**Rama base**: `feat/custom-domain` (HEAD `74b9059` — Change-A merged)
**Estrategia**: 3 PRs independientes (single-pr, budget 400 líneas por PR)
**Artifact store**: OpenSpec (`openspec/changes/`)
**Estado**: Change-A DONE ✅ · Change-B (decisiones cerradas, SDD pendiente) · Change-C (pendiente, depende de B)

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

**Acceptance**
- `npx astro build` sin warnings ni errores.
- `dist/**/*.html` contiene `<img src="/images/..."` correctas para `cbhe.org.bo`.
- Inspección visual: tarjetas de Capacitación muestran imágenes 1:1 sin overflow en mobile, tablet, desktop.

**Out of scope**
- Variantes `compact` (4:3) y `featured` (21:9) no se tocan.
- No se rediseñan las tarjetas en sí, solo la proporción y el wrap de imágenes.

**Esfuerzo**: ~30 min · **Riesgo**: LOW.

---

## Change-B · `cert-parallel-split`

**Problema**
- Un solo sistema (`certificados`) para dos flujos distintos: Sello CBHE (empresas, Tania) y Capacitación (personas, Alejandra). Las dos personas no pueden operar independientemente: comparten tabla, sin scope separation.
- La emisión hoy es CLI-only (`workflow_dispatch` de GitHub Actions), no usable para no-técnicas. Tania y Alejandra no pueden emitir sin asistencia.
- Los datos de cada flujo deben ser propiedad de su owner y resguardados por ella.

**Decisiones del usuario (cerradas)**
- **Schema**: dos tablas separadas — `capacitacion` (personas, Alejandra) y `sello` (empresas, Tania). DROP de `certificados` (data es de muestra, sin QRs físicos en producción, sin impacto en URLs existentes).
- **Rutas de verificación públicas**: `/capacitacion/?c=CODE` y `/sello/?c=CODE`.
- **Prefijos de código**: `CBHE-C-XXXXXXXXXX` (capacitacion) y `CBHE-S-XXXXXXXXXX` (sello) para disambiguar visualmente.
- **RLS**: cada tabla accesible solo por su owner vía Supabase Auth. `service_role` para emisión batch.
- **Emisión — UI**: spreadsheet-like (NocoDB o Supabase Studio). Tania y Alejandra son dueñas de los datos y deben resguardarlos (export Excel periódico).

**Decisiones abiertas (delegadas a sdd-propose)**
- ¿NocoDB self-hosted o Supabase Studio nativo como UI de emisión?
- ¿DROP + CREATE fresh de la tabla, o RENAME + CREATE (preservando las 17 filas de muestra)?
- Estrategia de provisioning de users (Tania, Alejandra) en Supabase: ¿invitación directa, o vía magic link?

**Cambios esperados**
- Nueva migración Supabase `003_split_certificados.sql` con tablas `capacitacion` y `sello` + RLS + trigger de código con prefijo.
- Refactor o reemplazo de `scripts/issue-certificate.mjs` por flujo vía UI.
- Refactor de `.github/workflows/issue-certificate.yml` (queda para emisión batch de service_role, no para uso diario).
- Nuevas páginas: `src/pages/capacitacion.astro` y `src/pages/sello.astro` (verificación pública).
- Página anterior `src/pages/certificados.astro` removida o redirigida.

**Acceptance**
- Tania emite un Sello sin asistencia técnica usando la UI provista.
- Alejandra emite un Certificado de Capacitación sin asistencia técnica.
- Verificación pública funciona: `/capacitacion/?c=CBHE-C-XXX` muestra datos correctos, `/sello/?c=CBHE-S-XXX` muestra datos correctos.
- RLS impide que Tania vea datos de Capacitación y viceversa (verificado con tests SQL directos).
- `npx astro build` sin errores.

**Out of scope**
- Rediseño visual de las páginas de verificación (queda el look&feel actual).
- Pasarela de pago, automatizaciones, integración con email marketing.
- Migración de los 17 certs de muestra (data descartable).
- QR codes dinámicos con watermark (mantener los actuales generados vía Puppeteer).

**Esfuerzo**: 3-5 días (incluye setup de UI, training breve de Tania y Alejandra, sign-off de seguridad de RLS) · **Riesgo**: MEDIUM (involucra schema, auth, training, datos de personas reales).

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

- **DNS `cbhe.org.bo`** — pendiente del usuario, **lunes 6 de julio**. Una vez configurado, el sprint se deploya naturalmente a producción.
- Rediseño UX global (issues #7-16) — sprint aparte.
- Rediseño PreciosGrid — sprint aparte.
- Migración de los 17 certs de muestra — data descartable.

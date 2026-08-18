# Plan de Modificaciones — Sitio Web CBHE

> Fuente: solicitud del cliente (documento "cbhe web - modificación final.md" + DirectorioCBHE-NV.csv).
> Fecha: 2026-08-18. Estado: T1, T2, T3, T4 y T6 completadas y pusheadas. T5 bloqueada (faltan PDFs del cliente). T7 pendiente de ejecución.

## Decisiones aprobadas por el cliente

| Tema | Decisión |
|---|---|
| Beneficios del afiliado | Sección nueva dentro de `afiliacion.astro` (no página propia) |
| Estatutos y Código de Ética | Página no listada accesible solo por link. **BLOQUEADA: falta que el cliente entregue los PDFs** |
| Directorio | Sección en `quienes-somos.astro`, título "Directorio" SIN período |
| Montos de afiliación | **NO publicar montos** ($us. 500 inicial / $us. 300 mes). Solo "contáctese con el equipo" |

---

## T1 — Afiliación: requisitos + beneficios (EJECUTAR AHORA)

### Archivos a modificar

1. `src/pages/afiliacion.astro` — reescritura de secciones
2. `src/layouts/Layout.astro` — actualizar `afiliacionContext` (líneas ~80-92), knowledge base del chatbot

### Reglas de copy (stop-slop — OBLIGATORIAS en todo texto que redactemos)

- Registro institucional español formal (usted), consistente con el resto del sitio.
- Sin relleno: cortar aperturas innecesarias, adverbios y muletillas ("cabe destacar", "es importante mencionar").
- Voz activa y concreto: nombrar el hecho específico, sin declarativas vagas.
- Sin em-dash (—) en prosa nueva. Sin contraste binario "no es X, es Y".
- El texto de los documentos del cliente (lista de requisitos, beneficios) se respeta fiel: solo se ajusta puntuación/mayúsculas para consistencia, no se reescribe.
- El copy de conexión (descripciones de SectionHeading, notas, cards de proceso) sí lo redactamos nosotros: aplicar las reglas arriba.

### Restricciones técnicas (OBLIGATORIAS)

- Sitio Astro 6 SSG, **cero JS de framework**: no agregar `<script>` ni islands. Todo estático.
- Design system MD3 con tokens Tailwind existentes (`bg-surface`, `text-on-surface`, `bg-primary-container`, `text-on-primary-container`, `bg-surface-container-low`, `border-outline-variant/50`, etc.). Reusar los patterns de cards/grid que ya están en la página.
- Íconos: SOLO usar nombres disponibles en `astro.config.mjs` (lista limitada de 33 material-symbols, guiones, no underscores). Verificar el archivo antes de elegir. Si un ícono no existe, elegir el más cercano de la lista o omitir el ícono.
- Links internos SIN `/` inicial (gotcha de subpath en GitHub Pages).
- Mantener el `<header>` hero oscuro actual tal cual (solo actualizar el subtítulo si conviene).
- Componentes ya importados en la página: `Icon`, `Section`, `SectionHeading`, `CtaBanner`, `PageLayout`. Reusarlos.
- No modificar `CtaBanner` final ni el formulario (link a `../#afiliacion`).

### Estructura objetivo de `afiliacion.astro`

1. **Hero** (existente, sin cambios estructurales)
2. **Sección: Documentación necesaria** (`Section bg="surface"`)
   - `SectionHeading` título "Documentación necesaria" — descripción: los documentos se entregan en fotocopia simple o de manera digital para su revisión y aprobación.
   - Sub-bloque A: "Empresas nacionales" — lista numerada de 8 documentos (cards o lista con estilo consistente):
     1. Carta de solicitud de afiliación dirigida al Sr. Enzo Michel, Director Ejecutivo de la CBHE.
     2. Testimonio de Minuta de Constitución de la Sociedad, con modificaciones y/o enmiendas si las hubiera.
     3. Testimonio de poder del representante legal, con modificaciones y/o enmiendas si las hubiera.
     4. Matrícula de SEPREC actualizada a la fecha.
     5. NIT (Número de Identificación Tributaria).
     6. Estados Financieros auditados, con sello de contador y registrados en la SNII.
     7. Padrón Municipal.
     8. Formulario original de la solicitud de ingreso a la CBHE.
   - Sub-bloque B: "Empresas extranjeras" — 7 documentos:
     1. **Certificado o Escritura de Constitución** — copia legalizada o certificada, apostillada o legalizada, con traducción oficial al español.
     2. **Estatutos Sociales vigentes o documento equivalente** — apostillados o legalizados, con traducción oficial al español.
     3. **Certificado de Vigencia o Existencia Legal** — emitido por la autoridad competente, apostillado o legalizado, traducido oficialmente, con antigüedad no mayor a 90 días.
     4. **Poder o nombramiento del representante legal en Bolivia** — con facultades expresas para actuar en territorio boliviano, apostillado o legalizado, traducido oficialmente.
     5. **Documento de identidad o pasaporte del representante legal** — copia vigente, con traducción oficial si está en otro idioma.
     6. **Carta de intención** — nota formal en papel membretado, dirigida al Sr. Enzo Michel, Director Ejecutivo de la CBHE.
     7. **Certificado de domicilio o registro tributario en el país de origen** — apostillado o legalizado, con traducción oficial.
   - Nota (card estilo `border-l-4 border-primary-container` como la existente) "Consideraciones para empresas extranjeras":
     - Toda documentación extranjera debe apostillarse o legalizarse y acompañarse de traducción oficial al español.
     - Una vez en Bolivia, los documentos deben protocolizarse ante Notaría de Fe Pública.
     - La documentación puede presentarse en formato físico.
     - La CBHE puede requerir documentación complementaria para verificar autenticidad o vigencia.
3. **Sección: Proceso de aprobación** (`Section bg="surface-container-low"`)
   - 3 pasos (cards): (1) Revisión del área legal → (2) Aprobación por el Directorio (voto favorable de al menos 2/3) → (3) Notificación del grupo asignado.
   - Listado de los 5 grupos: Exploración y Explotación de Hidrocarburos · Industria, Transporte y Distribución de hidrocarburos y energía · Servicios y Suministros Especializados en Pozo · Servicios y Suministros Especializados en Superficie · Servicios Auxiliares. Nota: la categoría depende de la información presentada, la especialidad y el patrimonio de la empresa.
   - Card de aportes SIN montos: "Los aportes de inscripción y mensuales varían según el grupo asignado y se informan directamente a cada empresa durante el proceso. Contáctese con nuestro equipo para más detalle." **PROHIBIDO publicar cifras ($us. 500 / $us. 300/mes).**
4. **Sección: Beneficios de la afiliación** (`Section bg="surface"`)
   - `SectionHeading` "Beneficios de la afiliación" — grid responsive (1/2/3 columnas como el resto del sitio) con 10 cards, título + 2-4 bullets cada una:
     1. **Representación sectorial**: gestiones ante entidades públicas y privadas; participación en comisiones sectoriales; reuniones de Grupo; charlas y reuniones interinstitucionales.
     2. **Apoyo legal**: asesoramiento en trámites con instituciones públicas; seguimiento de temas normativos; participación en la elaboración de normas y estándares.
     3. **Información exclusiva**: información y recursos exclusivos para asociados; certificado de afiliación para licitaciones; encuestas y estudios sectoriales.
     4. **Networking**: red especializada de contactos del sector; actividades de confraternización; reconocimientos y premiaciones; actividades deportivas.
     5. **Capacitación y eventos**: descuentos en cursos y eventos (+100 cursos); cursos in-company; apoyo en la organización del Congreso Bolivia Gas & Energía.
     6. **Publicaciones**: cobertura de prensa; artículos en publicaciones institucionales; cifras y estadísticas del sector.
     7. **Virtual y mailings**: boletines informativos por correo; servicio de correo masivo para comunicados al sector.
     8. **Alianzas y membresías**: novedades de entidades aliadas; eventos internacionales representando a Bolivia; descuentos en eventos internacionales.
     9. **Infraestructura**: descuentos en alquiler de equipos y salones; servicios de tele y videoconferencia; área social para actividades.
     10. **Fundación social y Centro de Arbitraje**: iniciativas gremiales de beneficio social; resolución especializada de conflictos; soporte para gestiones sociales.
5. **CtaBanner** existente (sin cambios).

### `Layout.astro` — nuevo `afiliacionContext`

Reemplazar el string actual (líneas ~80-92) por un resumen fiel del contenido nuevo: requisitos nacionales (8 docs resumidos en 1-2 líneas), extranjeros (7 docs + apostilla/traducción), proceso (legal → Directorio 2/3 → grupo), 5 grupos, 10 beneficios (títulos + 1 línea cada uno), y aportes "se informan directamente al equipo, sin montos públicos". Mantener el formato de template literal y la instrucción de no inventar que ya existe más abajo.

### Verificación (obligatoria antes de dar por terminada)

1. `npx astro build` sin errores.
2. `dist/afiliacion/index.html` existe y contiene: "Empresas extranjeras", "Beneficios de la afiliación", los 5 grupos.
3. `dist/afiliacion/index.html` NO contiene "500" ni "300/mes" ni "Quinientos" (verificar con grep).
4. `dist/index.html` (home) contiene el afiliacionContext actualizado dentro del prompt del chatbot.

---

## T2 — Directorio en Quiénes somos

- Archivo: `src/pages/quienes-somos.astro`. Nueva sección "Directorio" entre pilares ACTUAR y CtaBanner.
- Datos: `DirectorioCBHE-NV.csv` (23 filas). Agrupar por grupo con encabezados: Upstream · Servicios y Suministros Especializados en Pozo · Servicios y Suministros Especializados en Superficie · Industria, Transporte y Distribución (Downstream) · Servicios Auxiliares · Cámara (Director Ejecutivo).
- Cada fila: cargo (Presidente, Vicepresidente, Secretario, Tesorero, Director Titular, Director Alterno, Director Ejecutivo), empresa, nombre.
- Título "Directorio" SIN período. Layout: tabla/listado responsive, cards colapsables por grupo en mobile o lista simple — decidir con patterns existentes de la página.
- CSV fuente (GRUPO;DIRECTOR;EMPRESA;NOMBRE):
```
UPSTREAM;Presidente;REPSOL;Mariano Ferrari
UPSTREAM;Vicepresidente;TOTALENERGIES;Sergio Giorgi
POZO - Servicios y suministros especializado en pozo;Secretario;HALLIBURTON;Pablo Moreno
SUPERFICIE - Servicios y suministros especializado en superficie;Tesorero;CONFIPETROL;Diego Orlando Merchan Pico
UPSTREAM;Director Titular;PETROBRAS;Diogo Mattoso Abreu
UPSTREAM;Director Alterno;MATPETROL;Javier Paz Soldan
UPSTREAM;Director Titular;SHELL;Cristina Nuñez C.
UPSTREAM;Director Alterno;PAE;Juan Dauria
UPSTREAM;Director Titular;VINTAGE;Jorge Martignoni
DOWNSTREAM - Industria, transporte y distribucion de Hidrocarburos;Director Titular;PRODIMSA;Luis Fernando Guardia
POZO - Servicios y suministros especializado en pozo;Director Titular;SLB;René Arze
POZO - Servicios y suministros especializado en pozo;Director Alterno;RIGMASTER;Edson Vargas
POZO - Servicios y suministros especializado en pozo;Director Titular;PETROLOG;Orlando Vaca
POZO - Servicios y suministros especializado en pozo;Director Alterno;CONTINENTAL;Rodrigo Barrenechea
SUPERFICIE - Servicios y suministros especializado en superficie;Director Titular;BOLPEGAS;Ricardo Carrillo
SUPERFICIE - Servicios y suministros especializado en superficie;Director Alterno;HOERBIGER;Samanta Salinas
SUPERFICIE - Servicios y suministros especializado en superficie;Director Titular;INTERGAS;Melanie Zehl
SUPERFICIE - Servicios y suministros especializado en superficie;Director Alterno;ENERGY ADVANCES;Mauricio Montalvo Arancibia
AUXILIARES - Servicios Auxiliares;Director Titular;PPO INDACOCHEA;Pablo Ordoñez
AUXILIARES - Servicios Auxiliares;Director Alterno;WAYAR & VON BORRIES;Iver von Borries
AUXILIARES - Servicios Auxiliares;Director Titular;SUDAMERICANA;Daniel Saucedo
AUXILIARES - Servicios Auxiliares;Director Alterno;SOLARIA;Alejandro Lora
CÁMARA;Director Ejecutivo;CBHE;Iver von Borries
```
- Verificación: build OK, `dist/quienes-somos/index.html` contiene "Directorio" y los 23 nombres.

## T3 — Link donación Fundesoc (5 min)

- `src/pages/rse.astro:140`: reemplazar href por
  `https://www.fundesoc.org.bo/index.php?option=com_content&view=article&id=6&Itemid=161`
- Verificación: grep del nuevo href en `dist/rse/index.html`.

## T4 — Mover alianzas entre Novedades y Capacitación (15 min)

- `src/pages/index.astro`: mover el bloque completo de la sección "Alianzas estratégicas" (desde `<!-- Alianzas Estratégicas — Infinite Marquee Ribbon -->` ~línea 214 hasta el cierre de esa sección ~línea 388) y colocarlo ENTRE la sección "Últimas Novedades" (~línea 525) y "CBHE Capacitación" (~línea 561).
- Movimiento puro: no cambiar CSS, ni orden de logos, ni contenido.
- Verificación: build OK; en `dist/index.html` la posición del bloque alianzas queda después del bloque novedades y antes del bloque capacitación.

## T5 — Estatutos y Código de Ética (BLOQUEADA)

- Requisito: cliente entrega PDFs de Estatuto y Código de Ética.
- Implementación cuando se desbloquee: página no listada (ej. `src/pages/documentos-internos.astro`) con `isPaperpriendly`/noindex meta, entrada en `robots.txt` (`Disallow: /documentos-internos`), exclusión del sitemap. PDFs en `public/docs/`. Sin link desde nav/footer: acceso solo por URL compartible.
- NOTA: es privacidad por oscuridad (no seguridad real). Si el cliente exige acceso con credenciales, evaluar servicio externo o Cloudflare Access — fuera del stack actual.

## T6 — Guía de edición + backups (1 h)

- Crear `GUIA-EDICION.md` (how-to guide Diátaxis, español, orientado a no técnicos):
  1. Qué se edita sin dev vía Sveltia CMS (`/admin/`): novedades/artículos, cursos, empresas afiliadas, testimonios. Flujo: Save (borrador, sin deploy) vs Save and Publish (deploy automático).
  2. Qué requiere cambio de código: Portada (index.astro), Quiénes somos, textos estructurales de Afiliación/RSE/Contacto.
  3. Backups = Git: cada publicación es un commit versionado en GitHub; historial completo; revertir = restaurar commit anterior; GitHub es el backup remoto (estándar de la industria).
  4. Fase 2 opcional: exponer textos de Portada/Quiénes somos como colecciones Sveltia.

## T7 — Editor CMS para datos que rotan

Análisis de qué datos cambian en el tiempo y quién los cambia:
- **Directorio** (quienes-somos): cambia cada gestión (~2 años) → exponer en CMS.
- **Testimonios** (portada): colección ya existe en código pero es invisible en el CMS → exponer.
- **prices.json** (Datos del Sector en portada): automatizado por GitHub Action (`update-data.yml`, 3x/día) → nada que hacer.
- **Copy estructural** (hero, misión/visión, historia, pilares, descripciones de grupos, alianzas): no rota → fuera de alcance, se canaliza por soporte (documentado en GUIA-EDICION.md).

### T7a — Testimonios en Sveltia (30 min)

- Archivo: `public/admin/config.yml`. Agregar colección `testimonios` (folder `src/content/testimonios`, `create: true`) con campos EXACTOS del schema de `src/content.config.ts`: name (string), role (string), company (string), quote (text), highlight (string), image (image, opcional), draft (boolean, default false). Labels en español, mismo estilo que las colecciones existentes.
- Sin cambios de código: la colección y su render (`TestimonialCarousel` en index.astro) ya existen.

### T7b — Directorio en Sveltia (~2 h)

- `data/directorio.json` (nuevo): migrar el array hardcodeado en T2 (23 cargos, 6 grupos) SIN cambios de datos. Estructura como objeto raíz (Sveltia lo requiere para files collections): `{ "grupos": [{ "grupo": "...", "miembros": [{ "cargo", "empresa", "nombre" }] }] }`.
- `public/admin/config.yml`: colección "Directorio" tipo `files` → `data/directorio.json`, con widget `list` anidado (grupos → miembros). Labels en español.
- `src/pages/quienes-somos.astro`: `import directorioData from "../../data/directorio.json"` y eliminar el array hardcodeado. Cero cambios de layout.
- `GUIA-EDICION.md`: actualizar — testimonios y directorio pasan a la sección editable sin programar.
- Verificación: build OK; `dist/quienes-somos/index.html` debe conservar los 22 nombres únicos y 6 grupos (comparar contra build baseline ANTES del cambio); YAML válido; GUIA sin em-dashes.

## T8 — Remediación bugs latentes del CMS (post-auditoría)

Auditoría de la cadena Sveltia → GitHub → build → deploy. Funcional probado: JSON→build→deploy OK (evidencia: bot de precios), Sveltia→deploy OK (decenas de commits "Update Curso/Artículo"). Bugs latentes encontrados:

### T8a — `identifier_field` faltante (2 líneas)

- `testimonios` usa `name` (no `title`): sin `identifier_field: name`, la creación de entradas nuevas genera filenames UUID ilegibles y listado CMS sin títulos (doc oficial Sveltia/Decap, issue #499).
- `empresas` usa `nombre`: mismo bug latente, `identifier_field: nombre`.
- Fix: agregar la línea a ambas colecciones en `public/admin/config.yml`.

### T8b — Pinear versión de Sveltia

- `public/admin/index.html` carga `@sveltia/cms` latest de unpkg → un release upstream malo rompe el admin sin cambio en el repo.
- Fix: consultar versión vigente en el registry npm y pinearla (ej: `@sveltia/cms@0.XX.X/dist/sveltia-cms.js`).

### T8c — Test E2E local simulando writes de Sveltia (sin tocar GitHub)

1. Simular re-escritura de `data/directorio.json` con serialización estilo Sveltia (claves reordenadas + un dato de prueba modificado, ej. agregar "TEST" a un nombre) → `npx astro build` → verificar que `dist/quienes-somos/index.html` refleja el dato de prueba.
2. Simular testimonio nuevo: crear `src/content/testimonios/test-e2e-simulacion.md` con frontmatter estilo Sveltia (name/role/company/quote/highlight, draft: false) → build → verificar que aparece en `dist/index.html`.
3. Revertir ambas simulaciones (restaurar JSON original, borrar testimonio de prueba) → build final → verificar `dist` limpio (sin "TEST", sin "test-e2e").

### Verificación T8

- YAML válido, `identifier_field` presente en ambas colecciones, versión pineada resuelve (fetch HEAD del script), build final sin datos de prueba, HTML de quienes-somos byte-idéntico al estado pre-T8c.

## Verificación global (todas las tareas)

1. `npx astro build` sin errores.
2. Inspección del HTML generado en `dist/`.
3. Preview local con screenshot (workaround custom domain de AGENTS.md si hace falta).
4. Commit por unidad de trabajo (convencionales, sin atribución IA). Solo cuando el usuario lo pida.

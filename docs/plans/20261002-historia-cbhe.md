# Plan: sección "Nuestra historia" de Quiénes somos

Estado: Fase 1 completada · Fase 2 pendiente de ejecución · actualizado 2026-10-05

---

## Fase 1 — Reemplazo del contenido (completada · 2026-10-02)

### Contexto

Karina Vargas (CBHE) envió por correo el texto final para la sección "Nuestra historia" de `quienes-somos.astro` y 5 fotos numeradas para distribuir a lo largo del texto.
El pedido es reemplazar el timeline de 6 tarjetas que está hardcodeado hoy.
El trabajo es extra al mantenimiento mensual (carga de contenido extenso, ver `PROPUESTA-CBHE.md` §1.3) y no se factura.

### Design read

Página institucional editorial para audiencia B2B de un sector regulado.
Lenguaje trust-first: se usan los tokens MD3 existentes y el render `prose` que el sitio ya tiene.
Sin gradientes, glass, animaciones nuevas ni sistema nuevo.

### Decisión de formato

El texto de Karina es un relato continuo con 12 subtítulos cronológicos, no una lista de hitos.
Se renderiza como texto plano de lectura larga (`prose`), no dentro de tarjetas.
Meter el relato en la grilla de tarjetas lo fragmentaría y obligaría a inventar títulos y resúmenes que ella no escribió.

### Alcance de archivos

- `src/pages/quienes-somos.astro`: único archivo de código que se toca.
- `public/images/historia/`: se crea y recibe las 5 fotos.
- `global.css`, `package.json`, `public/admin/config.yml`: sin cambios.

### Qué se elimina

- El array `historia` (hitos `year/title/desc`), líneas 10-41 de `quienes-somos.astro`.
- El grid de tarjetas, líneas 74-82.
- No se toca el array `actuar`, la sección ACTUAR, Misión/Visión, Directorio ni el CTA.

### Estructura de datos nueva

```js
const historia = {
  lead,      // "CBHE: cuatro décadas acompañando la transformación del sector energético boliviano"
  intro,     // 4 párrafos de entrada
  secciones: [{ titulo, parrafos: string[], foto?: { src, alt } }],
}
```

Las 12 secciones: 1986 la unión de 15 empresas, Los primeros desafíos, Una nueva identidad nacional, 2001 una nueva estructura, Ética tecnología y calidad, Relacionamiento internacional, 2006 la nacionalización transforma el sector, Bolivia Gas & Energía, La capacitación como eje permanente, Los hidrocarburos dan paso a la energía, Seguridad salud y responsabilidad social, Del auge exportador a la preocupación por el abastecimiento.

### Única edición al texto de Karina

Se recortan las 6 líneas de ACTUAR de la sección 2006 porque la sección "Nuestra filosofía: ACTUAR" de abajo repite los mismos 6 pilares.
Se cambian los dos puntos finales de la frase introductoria por un punto para que no quede colgando.

### Fotos

Se mueven a `public/images/historia/` con slugs en minúscula (GitHub Pages es case-sensitive; `4 Grandes proyectos.JPG` rompería en prod).

| Archivo final | Después de |
|---|---|
| `segundo-directorio.jpg` | 1986: la unión de 15 empresas |
| `primera-sede.jpg` | Una nueva identidad nacional |
| `congresos.jpg` | Bolivia Gas & Energía |
| `equipo-25-anos.jpg` | Los hidrocarburos dan paso a la energía |
| `grandes-proyectos.jpg` | Del auge exportador |

### Elementos prefabricados reutilizados

- `prose prose-lg` y sus modifiers: copiados de `novedades/[slug].astro:83`.
- `<figure>` + `<img loading="lazy">`: patrón de `novedades/[slug].astro:72`.
- `resolveImageUrl()`: `src/utils/images.ts:14`.
- `<Section>` y `<SectionHeading>`: componentes existentes.
- Tokens MD3: `global.css`.

### Checklist

- [x] Escribir este plan.
- [x] Mover las 5 fotos.
- [x] Reescribir la sección Historia.
- [x] `npx astro build`.
- [x] Verificar que las 5 imágenes resuelvan con el prefijo `/cbhe-web/images/historia/`.
- [x] Revisión de diff y verificación visual.

### Verificación

- Build: 37 páginas, 0 errores.
- HTML generado: 12 `<h3>` de historia, 5 imágenes con `src="/cbhe-web/images/historia/*.jpg"`, 0 referencias al texto viejo.
- Render local (workaround de `AGENTS.md`: `site` temporal a localhost): `body` con `#f5f3f4` aplicado, columna 343/704/768px en 375/768/1440, sin desborde horizontal, 5 imágenes cargadas a 1200px nativas, gap de figura consistente.
- Capturas desktop y mobile revisadas: columna centrada, jerarquía h3 clara, fotos completas sin recorte.
- Revisor de diff: sin hallazgos bloqueantes. Se corrigió el doble margen de figura (`prose-img:my-0`).
- Fuera de scope detectado (pre-existente, no tocar): `.atl/skill-registry.md`, `package-lock.json`, `supabase/.temp/`.

### Lo que NO se hace

Colección del CMS, schema, markdown, índice lateral con anclas, lightbox, carousel ni recorte uniforme de fotos.

---

## Fase 2 — Rediseño: cronología navegable (pendiente · 2026-10-05)

### Contexto

Issue #25. La sección quedó como muro de texto: una columna `prose` con 12 subtítulos y sin navegación.
Medido en producción: la página mide 19.479 px de alto a 375px y la sección Historia 13.632 px; a 768px la página mide 12.838 px.
Es la continuación de la Fase 1 (hallazgos y optimización de fotos del PR #35).

### Regla de contenido (crítica)

En esta página va únicamente el texto de Karina Vargas (`Historia CBHE web final.pdf`) y sus 5 fotos.
El diseño solo reorganiza; no agrega ni una palabra.
Prohibido: callouts, tablas, resúmenes, epígrafes de foto, copys nuevos, reescrituras, negritas agregadas y reordenar párrafos.
Única edición de texto permitida: borrar del hero la frase "Casi un centenar de afiliadas trabajan para garantizar un futuro sostenible para Bolivia."
El `alt` de las fotos se mantiene (es accesibilidad, no copy visible).

### Design read

Página editorial/institucional, audiencia B2B de un sector regulado.
Redesign-preserve: se mantienen los tokens MD3 y el `prose` existente.
No se toca la escala tipográfica ni la paleta globales (issues #13, #10, #9, #11, #12).
Mobile primero; desktop es la mejora progresiva.

### Decisión de formato

El documento de Karina tiene título, subtítulo (lead), 4 párrafos de intro y 12 subtítulos planos, sin agrupación ni eras.
Por eso no se inventan eras: el colapso mobile usa los 12 subtítulos textuales, 1:1 (opción A).
Agrupar o nombrar eras sería interpretación, y no se hace.

### Estructura de datos

Se mantiene el objeto `historia` y se agrega a cada `secciones[]` un `id` (slug técnico para anclas, no visible).
`titulo`, `parrafos` y `foto` quedan verbatim. La `intro` se renderiza como entradilla usando el `lead` existente.
No se agregan campos de era/etapa.

Las 12 secciones (títulos exactos del documento):

1. 1986: la unión de 15 empresas
2. Los primeros desafíos
3. Una nueva identidad nacional
4. 2001: una nueva estructura
5. Ética, tecnología y calidad
6. Relacionamiento internacional
7. 2006: la nacionalización transforma el sector
8. Bolivia Gas & Energía
9. La capacitación como eje permanente
10. Los hidrocarburos dan paso a la energía
11. Seguridad, salud y responsabilidad social
12. Del auge exportador a la preocupación por el abastecimiento

### Layout

Desktop (≥lg):

```
[ HERO — solo se borra la frase pedida ]
┌──────────────┬──────────────────────────────────────┐
│ ÍNDICE sticky│ Nuestra historia                     │
│ 12 títulos   │ Lead (subtítulo de Karina)           │
│ (verbatim)   │ 1. 1986: la unión de 15 empresas     │
│ aria-current │    párrafos (verbatim)               │
│              │    [ FOTO fija, sin epígrafe ]       │
│              │ 2. Los primeros desafíos …           │
└──────────────┴──────────────────────────────────────┘
```

Mobile (<lg):

- 12 `<details>`, cada `<summary>` con el `<h3>` del título textual de Karina.
- `open` por defecto en el HTML.
- En desktop, `summary { pointer-events: none }` + marcador oculto → siempre expandido. En mobile, el lector abre/cierra.
- Fotos inline full-width (sin sticky en mobile).

Tipografía/espaciado (presentacional, con tokens existentes): medida de lectura (mobile ancho completo; desktop capa a ~65ch), `line-height` cómodo y más whitespace entre secciones.

### Implementación en Astro

- Componente nuevo `src/components/HistoriaCronologia.astro` (rail + 12 secciones + script). Sin dependencias nuevas.
- Estilos con `<style>` scopeado dentro del componente.
- Scroll-spy con `<script>` procesado (`querySelectorAll` + `IntersectionObserver`), mismo patrón que `CourseCTA.astro`; sin JS el rail queda estático y los links funcionan.
- Anclas: `id` por sección + `scroll-mt-24`. El sitio no usa View Transitions.
- Sticky: verificado que `Layout`, `PageLayout` y `Section` no tienen `overflow:hidden`.
- `<details>` nativo: patrón ya usado en `Navbar.astro`.

### Accesibilidad

- `<nav aria-label="Índice de la historia">` con `aria-current` en el activo.
- Heading dentro del `<summary>` (mantiene el mini-IA).
- Target táctil ≥44px (issue #2). Foco visible al saltar por ancla.
- Respeta `prefers-reduced-motion`.

### Archivos afectados

- `src/pages/quienes-somos.astro`: reestructurar la sección Historia y borrar la frase del hero.
- `src/components/HistoriaCronologia.astro`: nuevo.
- `global.css` y `package.json`: sin cambios.

### Verificación

- `npx astro build` verde (37 páginas) y `npx astro check` 0 errores / 0 warnings.
- Fidelidad de contenido: el texto renderizado coincide con el documento de Karina (excepto la frase del hero que se borra); 0 texto agregado.
- Mobile: `docHeight` a 375px baja respecto de 19.479 px (reportar antes/después).
- Sin overflow horizontal en 375/768/1440 (`scrollWidth === viewport`).
- Desktop: rail sticky + `aria-current` funcionando.
- `auditor-visual` (desktop y mobile) antes del PR.

### Checklist

- [ ] Agregar `id` a las 12 secciones del objeto `historia`.
- [ ] Crear `HistoriaCronologia.astro` (rail + 12 `<details>` + script de scroll-spy).
- [ ] Reestructurar la sección Historia en `quienes-somos.astro`.
- [ ] Borrar la frase del hero.
- [ ] `npx astro build` y `npx astro check`.
- [ ] Verificar fidelidad de contenido contra el PDF.
- [ ] Medir `docHeight` mobile antes/después y overflow en 3 anchos.
- [ ] `auditor-visual` desktop + mobile.
- [ ] Commit en rama, push y PR.

### Lo que NO se hace

- Callouts, tablas, resúmenes, epígrafes de foto, copys nuevos.
- Agrupar en eras ni nombrarlas.
- Colección del CMS, schema, markdown, lightbox, carousel.
- Tocar el hero más allá de la frase pedida (issue #8).
- Tocar escala tipográfica, paleta y spacing globales (issues #13, #10, #9, #11, #12).

### Riesgos

- 12 `<details>` es granular; NN/g advierte de sobre-fragmentar. Mitigado: desktop siempre expandido, mobile con colapso opcional. Es el precio de no inventar eras.
- En desktop, `summary { pointer-events: none }` deshabilita el toggle a propósito.

---

## Pendiente

Ejecutar la Fase 2 (checklist de arriba).

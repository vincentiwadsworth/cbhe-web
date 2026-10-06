# Plan: layout de la página Quiénes Somos

Estado: en ejecución · actualizado 2026-10-06

Ejecutor: `impeccable layout /quienes-somos`.
Consolida observaciones propias de código con los issues #25, #11, #13, #15 y #38.

---

## Alcance

Solo layout de esta página: espacio, jerarquía, estructura de grillas y ritmo.
Fuera de esta pasada, por ser decisiones site-wide y no de layout: #9 (paleta/acento), #10 (fuente display), #14 (texturas/patrones), #8 (rediseño de hero), #16 (reemplazo de imágenes).

## Observaciones → issue

| # | Observación | Mapea a |
|---|---|---|
| O1 | Ritmo vertical uniforme: las tres secciones usan el `py-12/16/24` idéntico de `Section`; en Historia no hay respiro entre las 12 eras. | #11 + #25 |
| O2 | Historia desaprovecha ~300px en desktop: el grid `lg:grid-cols-[16rem_minmax(0,41rem)]` (`HistoriaCronologia.astro:32`) queda anclado a la izquierda dentro de `max-w-7xl` y deja el vacío a la derecha. Peor: las figuras (`:67`) van dentro de la columna de lectura con `lg:sticky` en el último hijo de cada `<details>`, donde casi no se pega. | #25 (complementa) |
| O3 | Misión/Visión son dos tarjetas redondeadas idénticas (tile de icono 56px + título + texto), split 50/50 sin jerarquía. | #15 (no cubre estas cards) |
| O4 | Directorio: `lg:grid-cols-2` con alturas dispares deja `Cámara` (un miembro) como caja full-width casi vacía. | #38 (marca :218 y :207) |
| O5 | Intro de Historia sin standfirst: los 4 párrafos abren a tamaño cuerpo y el relato arranca como muro plano. | #13 |
| O6 | `reveal` uniforme: `Section.astro:37` aplica `class="reveal"` a toda sección por igual. | brand.md; opcional, fuera de esta pasada |

## Regla de contenido (crítica) — y su conflicto

`docs/plans/20261002-historia-cbhe.md` Fase 2 fija la regla: en la Historia va únicamente el texto de Karina Vargas y sus 5 fotos; el diseño solo reorganiza, sin copys nuevos, callouts, tablas, resúmenes ni epígrafes.
La misma regla prohíbe agrupar o nombrar eras.

El comentario de #25 (2026-10-06) recomienda la opción A (agrupar en 4 capítulos con H2 de rango de años) y B (pull-quotes), que violarían esa regla.

Resolución adoptada: el ritmo se resuelve **sin agregar ni una palabra**.
El riel de placas (O2) y el standfirst reorganizan la lectura usando los mismos párrafos y fotos.
No se agregan H2 de capítulo ni pull-quotes, porque son texto nuevo.
Si el dueño levanta la regla de contenido, los H2 de rango y los pull-quotes quedan como paso de seguimiento.

## Pasos

1. Historia (O2) — riel de placas: a `xl`, grid de 3 columnas `[16rem_minmax(0,41rem)_minmax(0,1fr)]`; las figuras salen de la columna de lectura y van a una tercera columna sticky por sección. Por debajo de `xl`, las figuras vuelven inline. Archivos `src/components/HistoriaCronologia.astro` y el objeto `historia` en `src/pages/quienes-somos.astro`.
2. Standfirst (O5) — primer párrafo de `intro` a mayor tamaño y medida.
3. Misión/Visión (O3) — quitar las tarjetas: banda con hairline divisoria y split asimétrico, icono inline.
4. Directorio (O4) — `Cámara` como franja compacta arriba + grupos en `repeat(auto-fit, minmax(280px, 1fr))`; acortar la descripción de la sección (#38).
5. Ritmo global (O1) — `py` por rol de sección.

Las bandas de fondo por capítulo (opción A) quedan subordinadas: primero resuelve el riel de placas, que ya aporta ritmo por contraste de escala.

## Verificación

`npx astro build` verde.
Contraste AA en claro y oscuro de los bloques nuevos.
Gate visual con `auditor-visual` (desktop y mobile).
`revisor-diff` sobre el diff completo.

## Checklist

- [x] Escribir este plan.
- [x] Historia: riel de placas + standfirst.
- [x] Misión/Visión: de-carding.
- [x] Directorio: franja Cámara + grupos auto-fit + descripción corta.
- [x] Ritmo global de `py`.
- [x] `npx astro build` (37 páginas, 0 errores) y `npx astro check` limpio.
- [x] `revisor-diff`: 0 bloqueantes; 3 hallazgos menores corregidos.
- [x] Capturas propias (1280 y 375): Misión/Visión, Historia con placas, Directorio, standfirst.
- [x] Comentar #25, #15 y #38.
- [x] Tema oscuro: verificado en las tres secciones (1280 y 375).

## Verificación (resultado)

Build verde, `astro check` 0 errores / 0 warnings.
Revisor de diff: 0 bloqueantes.
Corregidos del review: (1) `sm:grid-cols-12` por viewport dentro de tarjetas angostas desbordaba "Vicepresidente" → fila pasada a layout flexible; (2) `sizes` de las figuras subprovisionaba en tablet; (3) `auto-fit` con `minmax(320px,1fr)` podía desbordar a 320px → `minmax(min(320px,100%),1fr)`.
Capturas (1280 y 375): Misión/Visión sin restos de card, hairline visible; Historia con la placa en la tercera columna y standfirst 21px visiblemente mayor al cuerpo; Directorio con la franja Cámara compacta y sin desbordes; sin scroll horizontal a 375.
Tema oscuro: capturado con `--color-scheme dark` en `#mision-vision`, `#historia` y `#directorio` (1280 y 375): fondos oscuros, texto legible, hairline visible, sin defectos nuevos.
Nota: para poder capturar localmente hubo que apuntar `site` a `http://localhost:4321` temporalmente (el `<base href>` a producción bloqueaba el CSS) y se restauró al terminar.

## Herramienta (fuera del repo)

Se extendió `~/.config/opencode/scripts/audit_captures.py` con flags de Playwright que no estaban expuestos (`--color-scheme`, `--format`, `--quality`, `--dpr`, `--full-page`, `--selector` con `--nth`/`--all`, `--scroll`, `--wait-for`, `--js-off`, `--device`, `--mask`, `--reduced-motion`, etc.), y se ajustaron las reglas globales de verificación visual para que el agente primario capture y lea con criterio (auditor opcional) y pueda usar capturas eficientes. Playwright actualizado a 1.63.

## Lo que NO se hace

Tocar paleta, tipografía display, texturas, hero ni imágenes (issues #8, #9, #10, #14, #16).
Agregar o reescribir texto de Karina.
Agrupar en capítulos ni nombrar eras.

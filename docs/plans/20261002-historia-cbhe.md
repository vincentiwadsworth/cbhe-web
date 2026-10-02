# Plan: reemplazo de la historia de la CBHE

Estado: en ejecución · 2026-10-02

## Contexto

Karina Vargas (CBHE) envió por correo el texto final para la sección "Nuestra historia" de `quienes-somos.astro` y 5 fotos numeradas para distribuir a lo largo del texto.
El pedido es reemplazar el timeline de 6 tarjetas que está hardcodeado hoy.
El trabajo es extra al mantenimiento mensual (carga de contenido extenso, ver `PROPUESTA-CBHE.md` §1.3) y no se factura.

## Design read

Página institucional editorial para audiencia B2B de un sector regulado.
Lenguaje trust-first: se usan los tokens MD3 existentes y el render `prose` que el sitio ya tiene.
Sin gradientes, glass, animaciones nuevas ni sistema nuevo.

## Decisión de formato

El texto de Karina es un relato continuo con 12 subtítulos cronológicos, no una lista de hitos.
Se renderiza como texto plano de lectura larga (`prose`), no dentro de tarjetas.
Meter el relato en la grilla de tarjetas lo fragmentaría y obligaría a inventar títulos y resúmenes que ella no escribió.

## Alcance de archivos

- `src/pages/quienes-somos.astro`: único archivo de código que se toca.
- `public/images/historia/`: se crea y recibe las 5 fotos.
- `global.css`, `package.json`, `public/admin/config.yml`: sin cambios.

## Qué se elimina

- El array `historia` (hitos `year/title/desc`), líneas 10-41 de `quienes-somos.astro`.
- El grid de tarjetas, líneas 74-82.
- No se toca el array `actuar`, la sección ACTUAR, Misión/Visión, Directorio ni el CTA.

## Estructura de datos nueva

```js
const historia = {
  lead,      // "CBHE: cuatro décadas acompañando la transformación del sector energético boliviano"
  intro,     // 4 párrafos de entrada
  secciones: [{ titulo, parrafos: string[], foto?: { src, alt } }],
}
```

Las 12 secciones: 1986 la unión de 15 empresas, Los primeros desafíos, Una nueva identidad nacional, 2001 una nueva estructura, Ética tecnología y calidad, Relacionamiento internacional, 2006 la nacionalización transforma el sector, Bolivia Gas & Energía, La capacitación como eje permanente, Los hidrocarburos dan paso a la energía, Seguridad salud y responsabilidad social, Del auge exportador a la preocupación por el abastecimiento.

## Única edición al texto de Karina

Se recortan las 6 líneas de ACTUAR de la sección 2006 porque la sección "Nuestra filosofía: ACTUAR" de abajo repite los mismos 6 pilares.
Se cambian los dos puntos finales de la frase introductoria por un punto para que no quede colgando.

## Fotos

Se mueven a `public/images/historia/` con slugs en minúscula (GitHub Pages es case-sensitive; `4 Grandes proyectos.JPG` rompería en prod).

| Archivo final | Después de |
|---|---|
| `segundo-directorio.jpg` | 1986: la unión de 15 empresas |
| `primera-sede.jpg` | Una nueva identidad nacional |
| `congresos.jpg` | Bolivia Gas & Energía |
| `equipo-25-anos.jpg` | Los hidrocarburos dan paso a la energía |
| `grandes-proyectos.jpg` | Del auge exportador |

## Elementos prefabricados reutilizados

- `prose prose-lg` y sus modifiers: copiados de `novedades/[slug].astro:83`.
- `<figure>` + `<img loading="lazy">`: patrón de `novedades/[slug].astro:72`.
- `resolveImageUrl()`: `src/utils/images.ts:14`.
- `<Section>` y `<SectionHeading>`: componentes existentes.
- Tokens MD3: `global.css`.

## Checklist

- [x] Escribir este plan.
- [x] Mover las 5 fotos.
- [x] Reescribir la sección Historia.
- [x] `npx astro build`.
- [x] Verificar que las 5 imágenes resuelvan con el prefijo `/cbhe-web/images/historia/`.
- [x] Revisión de diff y verificación visual.

## Verificación

- Build: 37 páginas, 0 errores.
- HTML generado: 12 `<h3>` de historia, 5 imágenes con `src="/cbhe-web/images/historia/*.jpg"`, 0 referencias al texto viejo.
- Render local (workaround de `AGENTS.md`: `site` temporal a localhost): `body` con `#f5f3f4` aplicado, columna 343/704/768px en 375/768/1440, sin desborde horizontal, 5 imágenes cargadas a 1200px nativas, gap de figura consistente.
- Capturas desktop y mobile revisadas: columna centrada, jerarquía h3 clara, fotos completas sin recorte.
- Revisor de diff: sin hallazgos bloqueantes. Se corrigió el doble margen de figura (`prose-img:my-0`).
- Fuera de scope detectado (pre-existente, no tocar): `.atl/skill-registry.md`, `package-lock.json`, `supabase/.temp/`.

## Pendiente

- Nada de código. Dejar los cambios sin commitear.


## Lo que NO se hace

Colección del CMS, schema, markdown, índice lateral con anclas, lightbox, carousel ni recorte uniforme de fotos.

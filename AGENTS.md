# cbhe-web — Project Conventions

## Stack (mayo 2026)

| Capa | Herramienta | Nota |
|---|---|---|
| SSG | Astro 6.x | Static output, zero JS |
| CSS | Tailwind v4 | `@tailwindcss/vite` plugin, NO `@astrojs/tailwind` |
| Content | Zod + Content Collections | `src/content.config.ts`, `glob()` loader, `z` from `astro/zod` |
| CMS | Sveltia CMS | `public/admin/`, backend `github`, `skip_ci: true` |
| Deploy | GitHub Pages | Workflow-based (`deploy.yml`), repo público |
| Forms | Web3Forms | `WEB3FORMS_KEY` env var |
| Icons | astro-icon | `material-symbols` (33 selected), hyphens not underscores |
| Fonts | Inter self-hosted | `@fontsource/inter/latin-*.css`, Latin subset only |

## Critical Gotchas

### Links en subpath (GitHub Pages)
- Astro `base` NO modifica `<a href>`. Solo afecta assets (CSS, JS, imágenes).
- `<base href>` NO funciona con paths root-relative (`/algo`). Un path con `/` inicial REEMPLAZA el path del base URL, no lo extiende.
- **Solución**: todos los links internos SIN `/` inicial (`href="quienes-somos"`) + `<base href={URL_ABSOLUTA_CON_TRAILING_SLASH}>` en Layout.astro.

### Astro 6 Content Collections
- Config en `src/content.config.ts` (no `src/content/config.ts`).
- `import { z } from "astro/zod"` — NO usar `astro:content` para Zod.
- Loader obligatorio: `import { glob } from "astro/loaders"`.
- `getCollection("name", ({ data }) => !data.draft)` para filtrar borradores.

### Sveltia CMS
- `Save` = commit con `[skip ci]` → no dispara deploy.
- `Save and Publish` = commit sin `[skip ci]` → dispara deploy.
- Auth: GitHub personal access token (scope `repo`), sin OAuth proxy.

### Web3Forms redirect
- `BASE_URL` en Astro NO tiene trailing slash. Agregar manualmente.
- `new URL(\`${import.meta.env.BASE_URL}/gracias\`, Astro.site).href` para URL absoluta en prod.

### Tailwind v4
- Configuración en CSS con `@theme { --color-*: ... }`, sin `tailwind.config.mjs`.
- `@import "tailwindcss"` en vez de `@tailwind base/components/utilities`.
- `peer-checked:` solo funciona en HERMANOS directos del elemento `.peer`, no en nietos.

## Workflow Rules

- **NUNCA cerrar un issue sin build + verificación previa.** Orden: escribir → `npx astro build` → inspeccionar output → si funciona, commit + push → cerrar issue.
- **Sprint activo**: ver [`SPRINT-ENTREGA.md`](./SPRINT-ENTREGA.md) para el scope actual (entrega del proyecto). Trabajar con SDD.
- **Skills instalados deben usarse proactivamente.** `web-design-guidelines` y `ui-ux-pro-max` como checklist en cada cambio visual. `astro` skill dice "Always consult docs.astro.build".
- **gh CLI** disponible y autenticado como `vincentiwadsworth`. Issues, labels, secrets, PRs.
- **Repositorio público** requerido para GitHub Pages en plan gratuito.
- **Para reportar un side finding como "pre-existente"**, checkout el parent commit y re-verificar ahí — "también pasa en home" no alcanza. La barra: si vuelve a aparecer sin el cambio aplicado, era pre-existente; si no, fue introducido.

## Environment

- `.env` (gitignored): `WEB3FORMS_KEY=...`
- GitHub Secret `WEB3FORMS_KEY` configurado para Actions.
- Deploy en `https://vincentiwadsworth.github.io/cbhe-web/`

## Design System

- 50 tokens MD3 en `src/styles/global.css` (nombres como `primary-container`, `on-surface-variant`).
- Tailwind genera `bg-*`, `text-*`, `border-*` para todos los `--color-*`.
- Inter Latin 400-800 como única familia tipográfica.
- 33 íconos Material Symbols pre-cargados en `astro.config.mjs`.

## GitHub Pages Deploy Gotchas

- Si un push a `main` triggerea deploy pero el sitio en prod no actualiza, **chequear `gh run list`** antes de tocar nada.
- El job `deploy` puede quedarse en `Waiting for a hosted runner to come online` indefinidamente por saturación de GitHub. **Fix inmediato**: `gh workflow run deploy.yml --ref main` (manual se procesa aunque los auto-triggers estén trabados).
- Para investigar: `gh run view <id> --json jobs --jq '.jobs[] | {name, status, steps: [.steps[] | {name, status}]}'`.
- **Local preview con custom domain rompe los assets**: `Astro.site` (ej. `https://cbhe.org.bo`) hace que el dist tenga URLs absolutas, y `astro preview` en `127.0.0.1` las pide cross-origin → ORB las bloquea y la página se ve sin CSS. **Workaround**: cambiar `site` a la URL local temporalmente, rebuild, preview, verificar con Playwright, restaurar. **No intentes route interception en Playwright** — es frágil y los handlers se pierden entre `close`/`open` del browser.

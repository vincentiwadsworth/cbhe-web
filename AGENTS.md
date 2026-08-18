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
| Cert DB | Supabase Postgres | Tablas `capacitacion` y `sello`, RLS con `anon SELECT` + `service_role` CRUD |
| Cert storage | Supabase Storage | Bucket `certificados-qr` (público), filename `{codigo}.png` |
| Auto-QR | Supabase Edge Function + DB Webhook | `generate-qr` (Deno), trigger por INSERT en cada tabla |

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

### Supabase Edge Functions (Deno, no Node)
- Imports via `https://esm.sh/...` para libs de Node (ej. `qrcode` → `https://esm.sh/qrcode@1.5.3`).
- Deploy via MCP OAuth (`supabase_deploy_edge_function`). PAT tokens (`sbp_`) no tienen scope `edge_functions:write`.
- Secrets del proyecto (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) accesibles vía `Deno.env.get()` sin config extra.
- Logs: Supabase Dashboard → Edge Functions → Logs.
- Límite free tier: 500K invocaciones/mes, 2s CPU máx por invocación.

### Supabase Database Webhooks
- Disparan asíncrono en INSERT/UPDATE/DELETE — NO bloquean la fila aunque la Edge Function falle.
- Payload en `record` y nombre de tabla en `table`. La función decide qué hacer.
- Si la fila queda con la columna target NULL, retry manual desde Dashboard → Database → Webhooks → Logs → Retry.
- Alternativa programática: triggers `pg_net` con `net.http_post()`. El Dashboard webhook UI no es accesible vía Management API.

## Workflow Rules

- **NUNCA cerrar un issue sin build + verificación previa.** Orden: escribir → `npx astro build` → inspeccionar output → si funciona, commit + push → cerrar issue.
- **Sprint activo**: ver [`SPRINT-ENTREGA.md`](./SPRINT-ENTREGA.md) para el scope actual (entrega del proyecto). Trabajar con SDD.
- **Skills instalados deben usarse proactivamente.** `web-design-guidelines` y `ui-ux-pro-max` como checklist en cada cambio visual. `astro` skill dice "Always consult docs.astro.build".
- **gh CLI** disponible y autenticado como `vincentiwadsworth`. Issues, labels, secrets, PRs.
- **Repositorio público** requerido para GitHub Pages en plan gratuito.
- **Para reportar un side finding como "pre-existente"**, checkout el parent commit y re-verificar ahí — "también pasa en home" no alcanza. La barra: si vuelve a aparecer sin el cambio aplicado, era pre-existente; si no, fue introducido.
- **Diseño frontend anti-slop** → load `design-taste-frontend` (skill global, Leonxlnx/taste-skill). También: `minimalist-ui`, `industrial-brutalist-ui`, `redesign-existing-projects`, `image-to-code`.

## Environment

- `.env` (gitignored): `WEB3FORMS_KEY=...`
- GitHub Secret `WEB3FORMS_KEY` configurado para Actions.
- Deploy en `https://vincentiwadsworth.github.io/cbhe-web/`

## Certificates System

### Tables (post-Change-B)
- `public.capacitacion` — `id uuid PK`, `codigo text UNIQUE` (prefijo `CBHE-C-`), `cursante_nombre text`, `nombre_capacitacion text NULL`, `fecha_emision date`, `qr_url text NULL`, `created_at timestamptz`.
- `public.sello` — `id uuid PK`, `codigo text UNIQUE` (prefijo `CBHE-S-`), `empresa_nombre text`, `tipo_certificado text default 'Sello CBHE'`, `fecha_emision date`, `qr_url text NULL`, `created_at timestamptz`.
- RLS: `anon SELECT` en ambas (verificación pública), `service_role` full CRUD. Sin scope por owner.
- Prefijo del código determina tabla: `CBHE-C-*` → `capacitacion`, `CBHE-S-*` → `sello`.

### Auto-QR pipeline
- **Storage bucket**: `certificados-qr` (público), filename `{codigo}.png`.
- **Edge Function**: `supabase/functions/generate-qr/index.ts` (Deno). Genera PNG con `qrcode` (vía esm.sh), sube al bucket, `UPDATE {tabla} SET qr_url = publicUrl WHERE id = record.id`.
- **DB Webhooks**: triggers `pg_net` con `net.http_post()` en INSERT de `capacitacion` y `sello` → invocan `generate-qr` con `{ record, table }` en el body.
- **URL encoded in QR**: `PUBLIC_VERIFICATION_URL/certificados/?c={codigo}` (default `https://vincentiwadsworth.github.io/cbhe-web`).
- **Mostrar en landing**: `src/pages/certificados.astro` debe renderizar `<img src={qr_url} />` cuando la fila consultada tiene `qr_url` no-NULL.

### Input flow (UX para no-técnicos)
- Los operadores insertan **directamente en las tablas base** (`capacitacion` o `sello`) desde Supabase Studio → Table Editor → Insert row.
- Solo se completan los campos editables (`cursante_nombre`, `nombre_capacitacion`, `fecha_emision` para capacitación; `empresa_nombre`, `fecha_emision` para sello).
- Los cuatro campos del sistema se **dejan en blanco** y se completan automáticamente al guardar:
  - `id` → `gen_random_uuid()` (default de la tabla).
  - `codigo` → trigger `BEFORE INSERT` con prefijo `CBHE-C-` o `CBHE-S-`.
  - `created_at` → `now()` (default de la tabla).
  - `qr_url` → Edge Function `generate-qr` vía trigger `pg_net` AFTER INSERT, tarda ~5 s.
- **No usar views `*_input`**: Supabase Studio no ofrece acción de insert en views, solo en tablas. Las views creadas en la migration 003 fueron eliminadas en la migration 006.

### Verb convention (docs y código)
- **Emitir**: acción humana. El operador emite un certificado INSERTando una fila en `capacitacion` o `sello` desde Supabase Studio. La emisión es manual.
- **Generar**: acción automática del sistema. El QR se genera vía trigger `pg_net` → Edge Function `generate-qr` → Storage bucket → `UPDATE qr_url`. Cero intervención humana.
- **Verificar**: acción del público. Escanea QR → landing `/certificados/?c=CODIGO` consulta la DB vía `anon SELECT` y muestra los datos. Solo lectura.

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

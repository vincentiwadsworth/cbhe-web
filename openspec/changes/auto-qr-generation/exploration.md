# Exploration: Auto-QR Generation Pipeline

**Change**: `auto-qr-generation`
**Sprint Deferred Tasks**: D3 (pipeline) + D6 (render QR en landing)
**Branch**: `feat/custom-domain`
**Date**: 2026-07-06

---

## Current State

### 1. Migrations — Schema actual

**Migration 003** (`supabase/migrations/003_split_certificados.sql`) define el schema target actual:

**`public.capacitacion`**:
| Columna | Tipo | Constraint |
|---|---|---|
| `id` | `uuid` | PK, `DEFAULT gen_random_uuid()` |
| `codigo` | `text` | UNIQUE NOT NULL (prefijo `CBHE-C-`) |
| `cursante_nombre` | `text` | NOT NULL |
| `nombre_capacitacion` | `text` | NULLABLE |
| `fecha_emision` | `date` | NOT NULL |
| `created_at` | `timestamptz` | NOT NULL, `DEFAULT now()` |

Index: `btree` en `codigo`.

**`public.sello`**:
| Columna | Tipo | Constraint |
|---|---|---|
| `id` | `uuid` | PK, `DEFAULT gen_random_uuid()` |
| `codigo` | `text` | UNIQUE NOT NULL (prefijo `CBHE-S-`) |
| `empresa_nombre` | `text` | NOT NULL |
| `tipo_certificado` | `text` | NULLABLE, `DEFAULT 'Sello CBHE'` |
| `fecha_emision` | `date` | NOT NULL |
| `created_at` | `timestamptz` | NOT NULL, `DEFAULT now()` |

Index: `btree` en `codigo`.

**RLS**: Ambas tablas tienen RLS habilitado con `anon SELECT USING (true)` (migration 004).

**Triggers**: `trg_set_capacitacion_code` y `trg_set_sello_code` — BEFORE INSERT, auto-generan código cuando es NULL.

**✅ `qr_url text NULL` NO existe en ninguna tabla.** Es la columna que la migration 005 debe agregar.

---

### 2. Edge Function — Directorio

`supabase/functions/` **NO existe**. Tampoco existe `supabase/config.toml`.

El directorio `supabase/` solo contiene:
- `supabase/migrations/` (001-004)
- `supabase/seed-test.sql` (seed legacy para tabla `certificados`)

No hay código Deno, ni configuración de Edge Functions, ni referencias al CLI de Supabase en `package.json` scripts.

---

### 3. certificados.astro — Mapa completo

**Archivo**: `src/pages/certificados.astro` (265 líneas)

**Arquitectura**: Client-side verification pura. Frontmatter Astro provee `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` al inline script. El script carga `@supabase/supabase-js` vía CDN.

**Flujo actual**:
1. Lee `?c=` de query params
2. `getMapping(codigo)` detecta prefijo → elige tabla (`capacitacion` / `sello`) y campos
3. `supabase.from(mapping.table).select(mapping.select).eq("codigo", codigo).maybeSingle()`
4. Renderiza estado: loading → found / not-found / error

**select actual** (sin `qr_url`):
- `capacitacion`: `cursante_nombre, nombre_capacitacion, fecha_emision, codigo`
- `sello`: `empresa_nombre, tipo_certificado, fecha_emision, codigo`

**DOM — estado "found"** (lo que se ve hoy):
```
cert-header (icono verified + título + desc)
↓
cert-label-primary / cert-primary     ← "Cursante" / nombre
↓
cert-label-secondary / cert-secondary ← "Capacitación" / nombre_capacitacion
↓
cert-emision                          ← fecha
↓ (── border-t ──)
cert-codigo                           ← código de verificación (mono, select-all)
```

**Slot para QR**: No existe. El QR se insertaría como un bloque nuevo, idealmente entre el bloque de `fecha_emision` y el de `codigo`, o como sección separada después del código. Visualmente, un `<img src={qr_url}>` con una label "Código QR" sería lo esperable.

**Supabase client**: Inicializado vía `window.supabase.createClient(supabaseUrl, supabaseKey)` — usa la publishable key (`sb_publishable_*`), que es segura para cliente gracias a RLS.

---

### 4. Env vars / Config

**`.env` actual** (completo, todos presentes):

| Variable | Valor |
|---|---|
| `VITE_SUPABASE_URL` | `https://tczyzrlqrbjhskkocmia.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_m4xW_1aWxrCMLLOO-xwKRw_0Y9RIPs_` |
| `SUPABASE_SECRET_KEY` | `sb_secret_xxx_xxxxxxxxxxxx` |
| `PUBLIC_VERIFICATION_URL` | `https://cbhe.org.bo` |

**`.env.example`** documenta las 4 variables correctamente.

**`PUBLIC_VERIFICATION_URL`**: Actualmente `https://cbhe.org.bo`. Esta URL será la codificada en los QR. Es la misma que usa `scripts/issue-certificate.mjs` para construir `$VERIFICATION_URL/certificados/?c=$CODIGO`.

**Edge Function necesita**: `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` vía `Deno.env.get()` — son secrets del proyecto Supabase, no requieren config en `.env`. La `SUPABASE_SECRET_KEY` del `.env` es el equivalente moderno (`sb_secret_*`) pero para Edge Functions se usa `SUPABASE_SERVICE_ROLE_KEY` que Supabase inyecta automáticamente.

---

### 5. Storage

No existe bucket `certificados-qr` en el repo (no puede — es un artifact de Dashboard).
AGENTS.md ya documenta la convención: bucket público, filename `{codigo}.png`.

---

### 6. DB Webhooks

No existen en el repo. Son configuración manual en Supabase Dashboard.
AGENTS.md ya documenta el comportamiento esperado.

---

### 7. Supabase CLI

- `supabase` CLI **no está en `package.json` scripts**
- **No hay referencias** en `.github/workflows/*.yml`
- La deploy de la Edge Function requiere `supabase functions deploy generate-qr` → el usuario debe instalar/autenticar la CLI, o usar Supabase Dashboard → Edge Functions → Deploy via UI
- No hay `supabase/config.toml` que configure rutas de funciones ni secrets

---

### 8. AGENTS.md — Cross-check

La sección "Auto-QR pipeline" (líneas 81-86) ya documenta la arquitectura completa:
> - Storage bucket: `certificados-qr` (público), filename `{codigo}.png`
> - Edge Function: `supabase/functions/generate-qr/index.ts` (Deno). Genera PNG con `qrcode` (vía esm.sh), sube al bucket, `UPDATE {tabla} SET qr_url = publicUrl WHERE id = record.id`
> - DB Webhooks: INSERT en `capacitacion` e INSERT en `sello` → ambos invocan `generate-qr`
> - URL encoded: `PUBLIC_VERIFICATION_URL/certificados/?c={codigo}`
> - Mostrar en landing: `<img src={qr_url}>` cuando `qr_url` no-NULL

La sección "Supabase Edge Functions (Deno, no Node)" (líneas 46-51) documenta gotchas:
- Imports via `https://esm.sh/...`
- Deploy con `supabase functions deploy generate-qr`
- Secrets de proyecto accesibles vía `Deno.env.get()`
- Logs en Dashboard
- Free tier: 500K invocaciones/mes, 2s CPU máx

La sección "Supabase Database Webhooks" (líneas 53-56) documenta:
- Disparan asíncrono — no bloquean la fila
- Payload en `record` y nombre de tabla en `table`
- Retry manual desde Dashboard si la fila queda con columna target NULL

---

## Gap Analysis

### Pieza 1: Migration 005 — `qr_url` column

| Qué falta | Dónde va |
|---|---|
| Migration SQL `supabase/migrations/005_add_qr_url.sql` | Nuevo archivo |
| `ALTER TABLE public.capacitacion ADD COLUMN qr_url text NULL;` | En la migration |
| `ALTER TABLE public.sello ADD COLUMN qr_url text NULL;` | En la migration |

**Detalle**: La columna debe ser `text NULL` para que filas existentes (sin QR) tengan `NULL` y la landing pueda diferenciar.

### Pieza 2: Storage bucket `certificados-qr`

| Qué falta | Dónde se crea |
|---|---|
| Bucket público `certificados-qr` | Supabase Dashboard → Storage, o SQL `INSERT INTO storage.buckets` |

**🔧 Manual step** — no es artifact del repo.

### Pieza 3: Edge Function `generate-qr`

| Qué falta | Dónde va |
|---|---|
| `supabase/functions/generate-qr/index.ts` (nuevo) | Archivo nuevo en repo |
| Código Deno con: leer `{ record, table }` del payload, generar QR PNG con `qrcode` vía esm.sh, subir a bucket `certificados-qr` con filename `{codigo}.png`, `UPDATE {tabla} SET qr_url = publicUrl WHERE id = record.id` | En el mismo archivo |
| Deploy de la función | `supabase functions deploy generate-qr` (CLI) o Dashboard UI |

**🔧 Deploy es manual step** (requiere CLI autenticada o Dashboard).

**Consideraciones**:
- El payload del webhook trae `record` (la fila insertada) y `table` (nombre de la tabla: `capacitacion` o `sello`)
- La función necesita el `codigo` del `record` para construir el filename y la URL de verificación
- La función necesita el `id` del `record` para el `UPDATE SET qr_url = ...`
- La URL codificada en el QR: `${PUBLIC_VERIFICATION_URL}/certificados/?c=${codigo}`
- `PUBLIC_VERIFICATION_URL` debe estar disponible como secret de la Edge Function (o hardcodeada si siempre es la misma)

**Estructura del código Deno**:
```typescript
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// qrcode via esm.sh
import QRCode from "https://esm.sh/qrcode@1.5.3";

serve(async (req) => {
  const { record, table } = await req.json();
  const codigo = record.codigo;
  const verificationUrl = `${Deno.env.get("PUBLIC_VERIFICATION_URL")}/certificados/?c=${codigo}`;
  const qrBuffer = await QRCode.toBuffer(verificationUrl, { width: 600, margin: 2, errorCorrectionLevel: "M" });
  // Upload to storage bucket...
  // UPDATE table SET qr_url = ...
});
```

### Pieza 4: DB Webhooks (2)

| Qué falta | Dónde se crea |
|---|---|
| Webhook: INSERT en `capacitacion` → POST a Edge Function `generate-qr` | Supabase Dashboard → Database → Webhooks |
| Webhook: INSERT en `sello` → POST a Edge Function `generate-qr` | Supabase Dashboard → Database → Webhooks |

**🔧 Ambos son manual steps** — no son artifacts del repo.

**Config esperada**:
- Event: INSERT
- Table: `capacitacion` (o `sello`)
- Type: HTTP Request
- URL: `https://tczyzrlqrbjhskkocmia.supabase.co/functions/v1/generate-qr`
- Headers: `Authorization: Bearer <anon key>` (o `service_role` key — verificar qué necesita la Edge Function)
- HTTP Method: POST

### Pieza 5: Modificar `certificados.astro`

| Qué falta | Dónde |
|---|---|
| Agregar `qr_url` al `select` de ambas tablas en `getMapping()` | `src/pages/certificados.astro` — línea 199 y 207 |
| Renderizar `<img src={data.qr_url}>` cuando existe | Nuevo bloque HTML en el estado "found" |
| Condicional: solo mostrar si `qr_url` no es NULL | JS en `populateCard()` o template |

**Slot en el DOM**: El QR iría naturalmente entre el bloque de `fecha_emision` (línea 65-70) y el bloque de `codigo` (línea 72-75). O como un ítem más dentro del `space-y-4`. Visualmente tiene sentido:
```
...
<div> ← fecha_emision
<div> ← QR (nuevo, condicional)
<div class="pt-3 border-t..."> ← codigo
```

---

## Manual vs Repo Steps

| Pieza | Repo Artifact | Manual (Dashboard/CLI) |
|---|---|---|
| 1. Migration `qr_url` | ✅ `supabase/migrations/005_add_qr_url.sql` | Ejecutar SQL en Supabase Studio |
| 2. Bucket `certificados-qr` | ❌ (convención documentada en AGENTS.md) | ✅ Crear en Storage section |
| 3. Edge Function | ✅ `supabase/functions/generate-qr/index.ts` | ✅ `supabase functions deploy generate-qr` |
| 4. DB Webhooks (×2) | ❌ (configuración de infra) | ✅ Dashboard → Database → Webhooks |
| 5. certificados.astro | ✅ Modificar `src/pages/certificados.astro` | ❌ N/A |

---

## Risks & Constraints

1. **Deno runtime en Edge Functions**: No es Node.js. Los imports usan URLs (`https://esm.sh/...`). La sintaxis de Deno puede diferir. La función `generate-qr` debe usar `serve()` de Deno std, no Express.

2. **`qrcode` via esm.sh**: `qrcode` es una lib Node.js. `esm.sh` la transpila a ESM para Deno, pero puede tener limitaciones. Verificar que `QRCode.toBuffer()` funciona en Deno antes de deployar.

3. **Free tier limits**: 500K invocaciones/mes, 2s CPU máx por invocación. La generación de QR + subida a Storage + UPDATE debe completarse en <2s CPU. Con ~50-100 certificados al mes (estimación realista), esto no es problema.

4. **Webhooks asíncronos**: Si la Edge Function falla, la fila se inserta igual con `qr_url IS NULL`. Recovery es manual desde Dashboard → Database → Webhooks → Logs → Retry.

5. **`PUBLIC_VERIFICATION_URL` en Edge Function**: La variable debe estar disponible en el runtime de la Edge Function. Opciones: (a) setearla como secret de la función, (b) hardcodearla en la función, (c) derivarla del request host. La opción más mantenible es setearla como secret.

6. **RLS no bloquea**: La Edge Function usa `service_role` para hacer el `UPDATE`, por lo que RLS se bypassea. No hay riesgo porque la función solo actualiza `qr_url` donde `id = record.id` — el mismo registro que gatilló el webhook.

7. **Permisos de Storage**: El bucket debe ser público para que las imágenes sean accesibles sin autenticación. Si se crea público, cualquier persona con la URL puede ver el QR (que es exactamente el caso de uso: la landing necesita mostrarlo).

8. **supabase CLI no está instalada/configurada**: No hay scripts de npm ni references en CI. El deploy de la Edge Function requerirá setup manual o agregar un script en `package.json`.

---

## Open Questions

1. **`PUBLIC_VERIFICATION_URL` en Edge Function**: ¿Hardcodeamos `https://cbhe.org.bo` en la función, o la pasamos como secret de Edge Function? Recomendación: hardcodear y documentar que si cambia, hay que redeployar. Es más simple y este valor no cambia frecuentemente.

2. **Tamaño del QR PNG**: ¿600px (como usa `scripts/issue-certificate.mjs`) o un tamaño menor para reducir latency en la landing? Recomendación: 300px es suficiente para un QR impreso y para mostrar en pantalla. La latencia de descarga importa más en la landing.

3. **¿Empty state del bucket?**: Si se deploya sin crear el bucket primero, la Edge Function va a fallar en el upload. Orden claro: crear bucket → deployar function → configurar webhooks.

4. **Authorization header del webhook**: El webhook HTTP necesita autenticación para llamar a la Edge Function. ¿Usar anon key o service_role key en el header? Las Edge Functions de Supabase aceptan `Authorization: Bearer <anon>` o `Authorization: Bearer <service_role>` — la función debería validar el header. Recomendación: usar la anon key (es segura porque la función solo actualiza `qr_url` donde `id = record.id`, y el `record` viene del webhook, no del cliente).

5. **¿Y si el webhook ya se disparó para una fila y luego se agrega `qr_url`?**: Las filas existentes (insertadas antes de la migration 005 o antes de los webhooks) quedarán con `qr_url IS NULL`. Esto es correcto — la landing no muestra QR para esos certificados. Si se necesita generar QR retroactivamente, toca un script batch.

---

## Ready for Proposal

**Yes**. La arquitectura está clara y decidida. El mapeo contra el repo está completo. No hay ambigüedades que requieran decisión del usuario — solo opciones de implementación (tamaño QR, hardcode vs secret para PUBLIC_VERIFICATION_URL) que se resuelven en design.

Lo único que el proposer debe confirmar con el usuario: si se deploya la función vía CLI o vía Dashboard UI, y si el usuario tiene acceso al proyecto Supabase para crear bucket y webhooks.

---

## Summary for Proposal

| Aspect | State |
|---|---|
| Migration 005 (add `qr_url`) | ✅ Needs new file — column does NOT exist |
| Edge Function code | ✅ Needs new file + dir — `supabase/functions/` does NOT exist |
| Storage bucket | 🔧 Manual — must be created in Dashboard |
| DB Webhooks (×2) | 🔧 Manual — must be configured in Dashboard |
| certificados.astro QR render | ✅ Needs edit — slot identified, `select` needs `qr_url` |
| Env vars | ✅ All exist — `PUBLIC_VERIFICATION_URL=`, `VITE_SUPABASE_*`, `SUPABASE_SECRET_KEY` |
| Supabase CLI | ❌ Not referenced — deploy instruction needed |
| AGENTS.md docs | ✅ Already documents the architecture |

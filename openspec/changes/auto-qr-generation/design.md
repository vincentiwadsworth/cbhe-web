# Design: Auto-QR Generation Pipeline

## Technical Approach

Three repo artifacts plus manual Supabase configuration. Migration 005 adds nullable `qr_url`. Edge Function receives `{record, table}` from a database webhook, generates a 300px QR PNG via `qrcode` (esm.sh), uploads to public bucket `certificados-qr`, and UPDATEs the row with the public URL. The landing page selects `qr_url` and renders it conditionally between `fecha_emision` and `codigo`.

## Architecture Decisions

### Decision: Webhook auth header

| Option | Tradeoff | Decision |
|---|---|---|
| Anon key in webhook `Authorization` | Simpler config; lower blast radius if visible in Dashboard; function behavior is already constrained to `record.id` scope | **Chosen** |
| Service role key in webhook header | More privileged key exposed in Dashboard config; same functional outcome | Rejected |

The Edge Function does not gate execution on the header value because the endpoint is public by design. The function’s UPDATE is scoped to `id = record.id` and uses `service_role` internally regardless of caller identity.

### Decision: QR PNG dimensions

| Option | Tradeoff | Decision |
|---|---|---|
| 300px | Matches existing `issue-certificate.mjs` inline size; ~15 KB PNG; sufficient for screen and moderate print; faster landing load | **Chosen** |
| 600px | Better print quality; ~40 KB PNG; negligible at 50–100 certs/month but overkill for on-screen verification | Rejected |

Parameters: `width: 300`, `margin: 2`, `errorCorrectionLevel: "M"`.

### Decision: Recovery mechanism for NULL `qr_url`

| Option | Tradeoff | Decision |
|---|---|---|
| Internal retry with exponential backoff (3 attempts, 1s / 2s delays) | Catches transient failures without extra infrastructure; satisfies “no human intervention” for the vast majority of failures | **Chosen** |
| Supabase Cron + batch re-process | Adds a second function and cron config; overkill for 50–100 certs/month | Rejected |
| Manual Dashboard retry only | No automatism for transient failures; violates the low-volume reliability requirement | Rejected |

If the function exhausts retries and the row stays NULL, the documented fallback is Dashboard → Database → Webhooks → Logs → Retry.

### Decision: `PUBLIC_VERIFICATION_URL`

| Option | Tradeoff | Decision |
|---|---|---|
| Edge Function secret via `supabase secrets set` | Configurable without redeploy; aligns with spec requirement | **Chosen** |
| Hardcode `https://cbhe.org.bo` | Simpler; requires redeploy on URL change; acceptable per spec only when secrets are unavailable | Rejected |

The function reads `Deno.env.get("PUBLIC_VERIFICATION_URL")`. Initial value: `https://cbhe.org.bo`.

### Decision: Deploy order

| Step | Artifact / Action |
|---|---|
| 1 | Apply migration `005_add_qr_url.sql` |
| 2 | Create `certificados-qr` bucket (public) in Dashboard |
| 3 | Deploy Edge Function `generate-qr` |
| 4 | Set secret `PUBLIC_VERIFICATION_URL` |
| 5 | Configure webhooks (×2) in Dashboard |

### Decision: Edge Function structure

| Aspect | Choice |
|---|---|
| Server API | `Deno.serve()` (native Deno API, no std import required) |
| Error handling | `try/catch` around body; `console.error` → Dashboard logs; return 200 on success, 400 on invalid payload, 500 after retries exhausted |
| Logging | `console.log` per major step (receive, generate, upload, update) |
| Response | JSON `{ success: true, url }` or `{ success: false, error }` |

## Data Flow

```
INSERT INTO capacitacion / sello
         │
         ▼
   DB Webhook ──POST──▶ Edge Function generate-qr
                              │
                              ├──▶ Generate QR PNG (qrcode via esm.sh)
                              │
                              ├──▶ Upload to Storage bucket (service_role)
                              │
                              └──▶ UPDATE table SET qr_url = publicUrl
                                          │
                                          ▼
                              Landing: SELECT qr_url, render <img>
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/005_add_qr_url.sql` | Create | `ALTER TABLE` both tables, add `qr_url text NULL`; idempotent guards |
| `supabase/functions/generate-qr/index.ts` | Create | Deno handler: parse payload, generate QR, upload, UPDATE with retry loop |
| `src/pages/certificados.astro` | Modify | Add `qr_url` to both `select` strings; insert conditional `<img>` block in `populateCard()` between `fecha_emision` and `codigo` |

## Interfaces / Contracts

**Edge Function input** (webhook payload):
```json
{ "record": { "id": "uuid", "codigo": "CBHE-C-xxx" }, "table": "capacitacion" }
```

**Edge Function behavior**:
- `record.id` and `record.codigo` are required.
- `table` must be `capacitacion` or `sello`; reject others with 400.
- Upload filename: `{codigo}.png`.
- UPDATE scoped to `id = record.id` only.
- Internal retry: if storage upload or DB update throws, retry up to 2 more times with delays of 1000 ms and 2000 ms.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Edge Function logic | Manual invoke via `curl` after deploy; verify response JSON |
| Integration | End-to-end pipeline | Insert test row in Supabase Studio → verify `qr_url` populated within 10 s → visit `/certificados/?c=CODE` → confirm image renders |
| Build | Landing page | `npx astro build` passes with no errors or regressions |

## Migration / Rollback

1. Delete webhooks in Dashboard.
2. `supabase functions delete generate-qr`
3. Empty and delete `certificados-qr` bucket.
4. Apply rollback migration: `ALTER TABLE ... DROP COLUMN qr_url` on both tables.
5. Revert `certificados.astro` changes.
6. `npx astro build`.

## Open Questions

- [ ] None — all 6 deferred decisions resolved.

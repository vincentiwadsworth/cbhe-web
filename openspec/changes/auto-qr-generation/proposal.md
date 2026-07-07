# Proposal: Auto-QR Generation Pipeline

## Intent

Automatically generate QR codes for every new certificate inserted into Supabase, and display them on the public verification landing. Today a verifier scans a QR to reach the page but sees no QR on the page itself — this closes that gap for all new certificates.

## Scope

### In Scope
- Migration 005: add `qr_url text NULL` to `capacitacion` and `sello`
- Edge Function `generate-qr` (Deno) that receives `{record, table}` from webhooks, generates a QR PNG via `qrcode`, uploads to Storage, and UPDATEs the row with the public URL
- Two Database Webhooks: INSERT on `capacitacion` and `sello` → POST to `generate-qr`
- Storage bucket `certificados-qr` (public), filename `{codigo}.png`
- Modify `certificados.astro`: include `qr_url` in SELECT, render `<img src={qr_url}>` when non-NULL

### Out of Scope
- Retroactive QR generation for existing certificates (no backfill)
- Batch script or admin UI for manual QR generation
- Supabase CLI setup, bucket creation, Edge Function deploy, webhook configuration (manual steps by Nicolás)

## Capabilities

### New Capabilities
- `auto-qr-pipeline`: Supabase Edge Function + Storage + Webhooks that auto-generates a QR PNG on every INSERT into `capacitacion` or `sello` and stores the public URL in the row

### Modified Capabilities
- `cert-split-storage`: both tables gain `qr_url text NULL` column
- `cert-split-verification`: landing page renders QR image when `qr_url` is non-NULL

## Approach

Five pieces delivered in repo artifacts + manual Supabase config:

1. **Migration** (`supabase/migrations/005_add_qr_url.sql`): `ALTER TABLE` both tables, column nullable so existing rows remain `NULL`.
2. **Edge Function** (`supabase/functions/generate-qr/index.ts`): Deno handler reads `{record, table}`, generates QR with `qrcode@1.5.3` via esm.sh, uploads to `certificados-qr` bucket using `SUPABASE_SERVICE_ROLE_KEY`, UPDATEs `qr_url` on the matching row.
3. **Webhooks**: configured manually in Supabase Dashboard — INSERT trigger on each table, POST to the deployed function URL with `Authorization: Bearer <anon>`.
4. **Storage**: bucket `certificados-qr` created manually, public access, filename convention `{codigo}.png`.
5. **Landing** (`src/pages/certificados.astro`): add `qr_url` to SELECT fields in `getMapping()`, insert conditional `<img>` block between `fecha_emision` and the `codigo` section.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `supabase/migrations/005_add_qr_url.sql` | New | Add `qr_url text NULL` to both tables |
| `supabase/functions/generate-qr/index.ts` | New | Edge Function — QR generation pipeline |
| `src/pages/certificados.astro` | Modified | SELECT `qr_url`, render conditional `<img>` |
| `openspec/specs/cert-split-storage/spec.md` | Modified | Schema delta: new column |
| `openspec/specs/cert-split-verification/spec.md` | Modified | New display field: QR image |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `qrcode` via esm.sh fails in Deno runtime | Low | `qrcode@1.5.3` is known to work; test locally with Deno before deploy |
| Webhook fires but Edge Function crashes → row has NULL `qr_url` | Med | Asynchronous failure is expected; retry from Dashboard → Webhooks → Logs |
| Bucket not yet created when function runs | Low | Deploy order enforced: bucket → function → webhooks |
| Free tier limits (500K invocations, 2s CPU) | Low | ~50-100 certs/month — well within limits |

## Rollback Plan

1. Delete both webhooks in Supabase Dashboard
2. `supabase functions delete generate-qr` (or delete via Dashboard)
3. Empty and delete `certificados-qr` bucket
4. Revert migration: `ALTER TABLE ... DROP COLUMN qr_url` (or apply a rollback migration)
5. Revert `certificados.astro` to previous SELECT fields and remove QR block
6. `npx astro build` to verify clean state

## Dependencies

- Supabase project `tczyzrlqrbjhskkocmia` accessible to Nicolás (bucket, webhooks, function deploy)
- `PUBLIC_VERIFICATION_URL` set as Edge Function secret (or hardcoded as `https://cbhe.org.bo`)
- Migration 005 must be applied before webhooks are configured

## Success Criteria

- [ ] `npx astro build` passes with no regressions
- [ ] Insert a test row in `capacitacion` via Supabase Studio → `qr_url` is populated within seconds
- [ ] Navigate to `/certificados/?c={codigo}` → QR image renders below `fecha_emision`
- [ ] Insert a test row in `sello` → same behavior with correct table routing

# Tasks: Auto-QR Generation Pipeline

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~150 (30 migration, 110 function, 30 landing page, 0 manual/docs) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-always |
| Chain strategy | Not applicable — single PR under budget |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

---

## Phase 1: Schema Foundation

- [x] 1.1 Create `supabase/migrations/005_add_qr_url.sql` — idempotent migration adding `qr_url text DEFAULT NULL` to `public.capacitacion` and `public.sello` via `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`. No data migration. Reference: design §Migration/Rollback, spec §cert-split-storage Scenario "Migration is idempotent", existing idempotent patterns in `003_split_certificados.sql` and `004_anon_select_policies.sql`.

## Phase 2: Edge Function

- [x] 2.1 Create `supabase/functions/generate-qr/index.ts` — Deno handler using `Deno.serve()`. Imports: `qrcode` from `https://esm.sh/qrcode@1.5.3`, Supabase client from `https://esm.sh/@supabase/supabase-js@2`. Required logic:
  - Parse `{record: {id, codigo}, table}` from POST body; reject invalid/missing with 400.
  - Read `PUBLIC_VERIFICATION_URL` from `Deno.env.get()`; fall back to `https://cbhe.org.bo`.
  - Generate QR PNG via `qrcode.toBuffer(verificationUrl, {width:300, margin:2, errorCorrectionLevel:"M"})`.
  - Upload to bucket `certificados-qr` as `{codigo}.png` (public, upsert) using `service_role` client.
  - UPDATE `{table}` SET `qr_url = publicUrl WHERE id = record.id` using `service_role`.
  - Internal retry: 3 attempts, 1000 ms / 2000 ms backoff. Return `{success:true, url}` on success, `{success:false, error}` after exhaustion.
  - Console.log per major step (receive, generate, upload, update); console.error on failures.
  - Try/catch around entire body; return 200/400/500 per design §Interfaces/Contracts.
  - No Node APIs, no npm: imports, no Deno permission flags needed beyond `--allow-net --allow-env`.

## Phase 3: Landing Page Integration

- [x] 3.1 Add `qr_url` to both SELECT field lists in `src/pages/certificados.astro` `getMapping()` — line 199 (`capacitacion`) and line 207 (`sello`). Per spec §cert-split-verification.
- [x] 3.2 Insert conditional QR `<img>` block in `populateCard()` between `fecha_emision` (line 191) and `codigo` (line 192). Pattern: read `cert.qr_url`, if truthy insert `<div><img src={qr_url} alt="QR de verificación" class="..." /></div>`. When NULL, omit entirely (no broken-image fallback). Reference: spec §cert-split-verification Scenario "Row with qr_url renders" / "Row without qr_url omits".

## Phase 4: Manual Supabase Configuration (checklist reference)

> These steps are performed in Supabase Dashboard — no repo code. Track completion manually.

- [ ] 4.1 Apply migration `005_add_qr_url.sql` to live DB (SQL Editor or `supabase db push`).
- [ ] 4.2 Create Storage bucket `certificados-qr` (public access).
- [ ] 4.3 Deploy Edge Function: `supabase functions deploy generate-qr` (or CLI equivalent from project root).
- [ ] 4.4 Set secret: `supabase secrets set PUBLIC_VERIFICATION_URL=https://cbhe.org.bo`.
- [ ] 4.5 Configure Database Webhook ×2 in Dashboard (INSERT on `capacitacion`, INSERT on `sello`) → POST to deployed function URL with `Authorization: Bearer <anon-key>` header.
- [ ] 4.6 Apply migration to live DB: `supabase db push` or run `005_add_qr_url.sql` via SQL Editor.

## Phase 5: Verification

- [ ] 5.1 Run `npx astro build` — must pass with zero errors or regressions. Primary quality gate.
- [ ] 5.2 Run `npx astro check` — must pass type checking.
- [ ] 5.3 End-to-end: insert test row in Supabase Studio → verify `qr_url` populated within 10 s → visit `/certificados/?c={code}` → confirm QR `<img>` renders between fecha and codigo. Repeat for both `capacitacion` and `sello`.
- [ ] 5.4 Verify not-found state: visit with nonexistent code → no QR block rendered, normal not-found UI intact.

## Dependencies

| Task | Depends On |
|------|-----------|
| 2.1 | 1.1 (column must exist before function UPDATEs it) |
| 3.1, 3.2 | None (SELECT tolerates NULL; deploy order is separate) |
| 4.x | 1.1, 2.1 |
| 5.3, 5.4 | 4.x (pipeline must be live for E2E) |

## Rollback

1. Delete webhooks in Dashboard.
2. `supabase functions delete generate-qr`.
3. Empty and delete `certificados-qr` bucket.
4. Rollback SQL: `ALTER TABLE capacitacion DROP COLUMN IF EXISTS qr_url; ALTER TABLE sello DROP COLUMN IF EXISTS qr_url;`.
5. Revert `certificados.astro` changes.
6. `npx astro build` to verify clean state.

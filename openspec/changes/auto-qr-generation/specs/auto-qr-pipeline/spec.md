# Delta for auto-qr-pipeline

## ADDED Requirements

### Requirement: QR generation triggered on every certificate INSERT

The system MUST generate a QR PNG for each new row inserted into `capacitacion` or `sello` and store its public URL in the row. Generation MUST be asynchronous and non-blocking: the INSERT MUST succeed and return to the caller regardless of whether QR generation succeeds or fails.

#### Scenario: New capacitacion row triggers QR generation

- GIVEN webhooks are configured for INSERT on `capacitacion`
- WHEN a row is inserted into `capacitacion` with a valid `codigo`
- THEN an HTTP webhook fires with `{ record, table: "capacitacion" }`
- AND the Edge Function generates a QR PNG and updates the row's `qr_url`

#### Scenario: New sello row triggers QR generation

- GIVEN webhooks are configured for INSERT on `sello`
- WHEN a row is inserted into `sello` with a valid `codigo`
- THEN an HTTP webhook fires with `{ record, table: "sello" }`
- AND the Edge Function generates a QR PNG and updates the row's `qr_url`

#### Scenario: INSERT completes even if the webhook fails

- GIVEN webhooks are configured and the Edge Function is unavailable
- WHEN a row is inserted into either table
- THEN the INSERT MUST succeed and the row MUST persist
- AND `qr_url` remains NULL until a manual retry populates it

### Requirement: QR encodes the public verification URL

The QR PNG MUST encode `${PUBLIC_VERIFICATION_URL}/certificados/?c=${codigo}` for the code of the triggering row. The verification URL MUST be configurable as an Edge Function secret; hardcoding is acceptable only when a project secret is not available.

#### Scenario: QR encodes the verification URL for the inserted code

- GIVEN `PUBLIC_VERIFICATION_URL=https://cbhe.org.bo`
- WHEN a row with `codigo = 'CBHE-C-0000000001'` triggers the function
- THEN the QR encodes `https://cbhe.org.bo/certificados/?c=CBHE-C-0000000001`

### Requirement: QR PNG uploaded to public storage bucket

The system MUST upload the generated PNG to the `certificados-qr` storage bucket using filename `{codigo}.png`. The bucket MUST be public so the returned URL is reachable from the anonymous landing page.

#### Scenario: PNG uploaded and URL returned

- GIVEN a generated QR PNG for `CBHE-S-0000000002`
- WHEN the function uploads to `certificados-qr`
- THEN a public URL is returned that resolves to the PNG without authentication

#### Scenario: Upload replaces an existing QR for the same code

- GIVEN a PNG already exists at `certificados-qr/CBHE-S-0000000002.png`
- WHEN the function uploads a new PNG for the same `codigo`
- THEN the newer PNG overwrites the prior one and `qr_url` reflects the current public URL

### Requirement: Edge Function uses service_role for the update

The Edge Function MUST use `SUPABASE_SERVICE_ROLE_KEY` to UPDATE `qr_url` on the row identified by `record.id`. The update MUST be scoped to the single row that triggered the webhook; it MUST NOT modify other rows.

#### Scenario: Update scopes to the triggering row

- GIVEN a row with `id = A` triggered the webhook
- WHEN the function issues the update
- THEN only the row with `id = A` receives the new `qr_url`
- AND all other rows' `qr_url` are unchanged

### Requirement: Edge Function runs on Deno runtime

The Edge Function MUST be Deno-compatible: dependencies loaded via URL imports (`https://esm.sh/qrcode@1.5.3`), `serve()` from Deno std, and secrets read via `Deno.env.get()`. Node-only APIs and `npm:` imports MUST NOT be used.

#### Scenario: Dependency loaded via esm.sh URL import

- GIVEN the Edge Function source
- WHEN it imports `qrcode`
- THEN the import is a `https://esm.sh/qrcode@1.5.3` URL, not an `npm:` spec

#### Scenario: Project secrets available without local config

- GIVEN the function is deployed to the Supabase project
- WHEN it reads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- THEN both resolve without any local `.env` or `config.toml` entry

### Requirement: Rotation handles NULL qr_url without backfill

The system MUST NOT retroactively generate QR codes for rows existing before deployment. Those rows keep `qr_url IS NULL` and the pipeline only acts on future INSERTs. Retroactive generation requires a separate batch process outside this capability.

#### Scenario: Pre-existing rows remain NULL

- GIVEN rows inserted before webhooks were configured
- WHEN the pipeline is deployed
- THEN those rows' `qr_url` stay NULL and no generation runs
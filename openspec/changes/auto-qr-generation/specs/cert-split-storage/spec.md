# Delta for cert-split-storage

## ADDED Requirements

### Requirement: qr_url column exists on both tables

The system MUST add a nullable `qr_url text` column to `public.capacitacion` and `public.sello` (migration 005). Existing rows MUST default to NULL. The column holds the public Storage URL of the auto-generated QR PNG when one has been produced, and NULL otherwise.

#### Scenario: Migration adds the column nullable

- GIVEN migration `005_add_qr_url.sql` is applied to a database with existing rows
- WHEN the migration completes
- THEN both `capacitacion` and `sello` have a `qr_url text NULL` column
- AND every pre-existing row has `qr_url IS NULL`

#### Scenario: Migration is idempotent

- GIVEN migration 005 has already been applied
- WHEN it is applied again to the same database
- THEN no errors are raised and the column remains present

#### Scenario: New inserts without QR leave qr_url NULL

- GIVEN the column is present and webhooks are NOT configured
- WHEN a new row is inserted into either table
- THEN the row persists with `qr_url IS NULL`
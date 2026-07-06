# Cert Split Storage Specification

## Purpose

Replace the single `certificados` table with two tables — `capacitacion` (used
by Alejandra for Capacitación) and `sello` (used by Tania for Sello CBHE) —
with RLS configured for public verification reads and unrestricted
`service_role` access. Per-owner access is managed outside this change via
Supabase Studio. Migration `003_split_certificados.sql` is authoritative.

---

## Requirements

### Requirement: Two independent certificate tables exist

The system MUST persist certificates in two separate tables: `capacitacion` and
`sello`. The legacy `certificados` table MUST NOT be used; the migration MUST
defensively drop it if present.

#### Scenario: Migration applied to a fresh database

- GIVEN an empty Supabase database and migration `003_split_certificados.sql`
- WHEN the migration is applied
- THEN `public.capacitacion` and `public.sello` exist
- AND `public.certificados` does NOT exist

#### Scenario: Migration is idempotent

- GIVEN the migration already applied once
- WHEN applied again to the same database
- THEN no errors are raised and state is unchanged

### Requirement: Certificate code is unique per table

Each table MUST enforce uniqueness of its `codigo` independently. The same code
MAY coexist in both tables; the guarantee MUST NOT depend on the prefix
convention.

#### Scenario: Duplicate code in same table is rejected

- GIVEN `capacitacion` holds `codigo = 'CBHE-C-0000000001'`
- WHEN a second row with that code is inserted into `capacitacion`
- THEN the insert MUST fail with a uniqueness violation

#### Scenario: Same code across tables is allowed

- GIVEN `capacitacion` holds `codigo = 'CBHE-C-0000000001'`
- WHEN that code is inserted into `sello`
- THEN the insert MUST succeed

### Requirement: Anonymous role can read both tables

The `anon` role MUST `SELECT` any row from both tables for public verification.
Anonymous writes MUST be denied.

#### Scenario: Anonymous read/write boundary

- GIVEN `capacitacion` and `sello` each contain rows and a client using `anon`
- WHEN it issues `SELECT` and `INSERT` on each
- THEN `SELECT` returns every row and `INSERT` is rejected

### Requirement: service_role bypasses RLS

`service_role` MUST perform any CRUD on both tables regardless of policies,
supporting batch and emergency emission via GH Actions and admin tooling.

#### Scenario: service_role writes across both tables

- GIVEN a client using `service_role`
- WHEN it inserts rows into `capacitacion` and `sello` in one transaction
- THEN both inserts succeed and a later `SELECT` returns all rows

### Requirement: Migration matches the live schema

Migration `003_split_certificados.sql` MUST exist and, applied to a fresh
database, produce tables whose columns, constraints, and policies match the live
database.

#### Scenario: Fresh-database schema matches live

- GIVEN a fresh database with the migration applied
- WHEN its `capacitacion` and `sello` schemas are compared to the live database
- THEN columns, primary keys, uniqueness, and RLS policies match

---

## Out of Scope

- QR generation and Supabase Storage (later phase)
- PDF generation (removed entirely)
- `fecha_vencimiento` and `estado` columns (removed)
- `issue-certificate.mjs` and its GH Actions workflow refactor
- Provisioning of owner accounts in Supabase Auth (managed outside this change)
- The `sello-cbhe` → `sello` rename is design-level, not behavioral.
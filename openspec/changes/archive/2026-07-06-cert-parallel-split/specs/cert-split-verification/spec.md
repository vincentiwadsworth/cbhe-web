# Cert Split Verification Specification

## Purpose

A single public landing at `/certificados/` verifies a code, detects its type by
prefix, queries the correct owner-scoped table, and renders minimal verified
data. No authentication, no expiry, no status — only basic identifying fields
plus a single "Verificado" state.

---

## Requirements

### Requirement: Landing reads the code from the URL

The page MUST read the certificate code from the `c` query parameter. Absence
or empty value MUST show a ready-to-search state, not an error.

#### Scenario: Code present in URL

- GIVEN `/certificados/?c=CBHE-C-0000000001`
- WHEN the page loads
- THEN verification begins automatically with that code

#### Scenario: No code in URL

- GIVEN `/certificados/` or `/certificados/?c=`
- WHEN the page loads
- THEN an empty input form is shown, ready to enter a code

### Requirement: Prefix selects the target table

The page MUST route the query to one table only based on the code prefix. The
`CBHE-` segment is case-sensitive.

| Prefix | Table | Labels |
|--------|-------|--------|
| `CBHE-C-` | `capacitacion` | `cursante_nombre` → "Cursante", `nombre_capacitacion` → "Capacitación" |
| `CBHE-S-` | `sello` | `empresa_nombre` → "Empresa", `tipo_certificado` → "Tipo de Certificado" |

#### Scenario: Capacitación prefix queries capacitacion

- GIVEN a valid `CBHE-C-…` code exists in `capacitacion`
- WHEN the page verifies it
- THEN the query targets `capacitacion`
- AND the labels read "Cursante" and "Capacitación"

#### Scenario: Sello prefix queries sello

- GIVEN a valid `CBHE-S-…` code exists in `sello`
- WHEN the page verifies it
- THEN the query targets `sello`
- AND the labels read "Empresa" and "Tipo de Certificado"

#### Scenario: Unrecognized prefix is treated as not found

- GIVEN a code with no known prefix (e.g. `XYZ-C-…`)
- WHEN the page verifies it
- THEN the page MUST NOT query either table
- AND the "Certificado No Encontrado" state is shown

### Requirement: Page shows only basic verified data

The page MUST render the mapped identifying fields plus a single "Verificado"
state. It MUST NOT display `fecha_vencimiento` or any `estado` — both removed.
`fecha_emision` MAY appear.

#### Scenario: Capacitación row renders minimal fields

- GIVEN a valid `capacitacion` code
- WHEN the page renders the result
- THEN it shows `cursante_nombre`, `nombre_capacitacion`, and "Verificado"
- AND no expiry date or state label appears

#### Scenario: Sello row renders minimal fields

- GIVEN a valid `sello` code
- WHEN the page renders the result
- THEN it shows `empresa_nombre`, `tipo_certificado`, and "Verificado"
- AND no expiry date or state label appears

### Requirement: Missing or invalid code shows the not-found state

Any condition yielding no row MUST produce a single "Certificado No Encontrado"
state. The page MUST NOT disclose which table was queried or whether the prefix
was recognized.

#### Scenario: Invalid or malformed code returns not found

- GIVEN `/certificados/?c=CBHE-C-DOES-NOT-EXIST` or `/certificados/?c=bogus`
- WHEN the page finds no row (no recognized prefix, or query returns empty)
- THEN the "Certificado No Encontrado" state is shown
- AND no identifying data is rendered and no table name is disclosed

### Requirement: Page works without auth and ships static

The flow MUST complete for any visitor using only the `anon` key — no login
required. The page MUST pass `npx astro build`; queries run client-side with the
publishable/anon key and no secret keys may reach the browser.

#### Scenario: Anonymous visitor verifies a code

- GIVEN a visitor with no Supabase session
- WHEN they open `/certificados/?c=<valid-code>`
- THEN the page renders the verified data with no auth prompt

#### Scenario: Build succeeds and bundle has no secrets

- GIVEN the modified `certificados.astro` is checked in
- WHEN `npx astro build` runs
- THEN the build exits 0, `dist/certificados/index.html` is produced
- AND only the publishable/anon key appears in client assets

---

## Out of Scope

- QR rendering on the card (later phase)
- PDF generation (removed entirely)
- `fecha_vencimiento` / `estado` display (removed)
- Visual redesign beyond copy and removed dead UI
- Owner auth UI (Supabase Studio, not this page)
- Bulk verification or batch import flows
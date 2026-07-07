# Delta for cert-split-verification

## ADDED Requirements

### Requirement: Landing selects qr_url from the verified row

The landing MUST include `qr_url` in the `SELECT` field list for both `capacitacion` and `sello`. The query MUST NOT assume `qr_url` is populated; it MUST tolerate NULL.

#### Scenario: SELECT includes qr_url for capacitacion

- GIVEN the landing builds the query for a `CBHE-C-…` code
- WHEN it issues the SELECT
- THEN the field list contains `cursante_nombre, nombre_capacitacion, fecha_emision, codigo, qr_url`

#### Scenario: SELECT includes qr_url for sello

- GIVEN the landing builds the query for a `CBHE-S-…` code
- WHEN it issues the SELECT
- THEN the field list contains `empresa_nombre, tipo_certificado, fecha_emision, codigo, qr_url`

### Requirement: Landing renders the QR image when qr_url is non-NULL

The landing MUST render `<img src={qr_url}>` for a verified row only when `qr_url` is non-NULL. The image block MUST appear between the `fecha_emision` block and the `codigo` block. When `qr_url IS NULL`, the image block MUST be omitted entirely (no broken-image placeholder).

#### Scenario: Row with qr_url renders the image between fecha and codigo

- GIVEN a verified `capacitacion` row with `qr_url = 'https://.../CBHE-C-0000000001.png'`
- WHEN the landing renders the found state
- THEN an `<img>` referencing that URL appears
- AND the image sits after the `fecha_emision` block and before the `codigo` block

#### Scenario: Row without qr_url omits the image block

- GIVEN a verified `sello` row with `qr_url IS NULL`
- WHEN the landing renders the found state
- THEN no `<img>` or placeholder appears between `fecha_emision` and `codigo`
- AND the rest of the layout is unchanged

#### Scenario: Not-found state never renders a QR block

- GIVEN a code that resolves to no row
- WHEN the landing renders the not-found state
- THEN no `<img>` block is rendered regardless of `qr_url`
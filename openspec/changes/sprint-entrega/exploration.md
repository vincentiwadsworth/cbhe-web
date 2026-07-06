# Exploration: Sprint de Entrega CBHE

## Repo State

| Aspect | Value |
|--------|-------|
| **Current branch** | `feat/custom-domain` |
| **Base branch** | `main` (no open PR) |
| **HEAD** | `1523fe4` fix(seo): update robots.txt sitemap URL to cbhe.org.bo |
| **Uncommitted** | `.atl/skill-registry.md` (modified — registry date bump + new skills indexed), `AGENTS.md` (modified — sprint line added), `.atl/.skill-registry.cache.json` (untracked, generated cache), `SPRINT-ENTREGA.md` (untracked — the sprint doc itself), `src/utils/images.ts` (untracked — new helper from commit 6c9529b that was never staged on this branch) |

**Note on `src/utils/images.ts`**: This file was introduced by commit `6c9529b` on `feat/custom-domain`, but it appears untracked because it was committed after the diff snapshot or the working tree shows git tracking it as a different state. The file content matches the commit's intent exactly.

---

## 1. Verificar carga de imágenes en Cursos

### Current State

**`src/utils/images.ts`** (untracked, 30 lines):
- Exists on the `feat/custom-domain` branch as committed in `6c9529b`.
- Full URL passthrough, root-relative path prepend with `BASE_URL`, double-prefix guard.
- With `base: "/"` (current config), the function is effectively an identity for root-relative paths — `resolveImageUrl("/images/foo.jpg")` → `/images/foo.jpg`.

**Hardcoded images in `src/pages/capacitacion.astro`** — ✅ **ALL USE `resolveImageUrl()`**:
- Line 9: `import { resolveImageUrl } from "../utils/images"`
- Lines 63-64: Hero slide images
- Lines 119-121: Carousel images
- Lines 216-226: Certification logo marquee
- Line 319: QR code image

**Content collection images (`data.image`)** — ❌ **NO `resolveImageUrl()` wrapping**:

| File | Line | Code | Status |
|------|------|------|--------|
| `src/components/CourseCard.astro` | 98 | `src={data.image}` | Raw path, no wrapper |
| `src/pages/capacitacion/[slug].astro` | 99 | `src={curso.data.image}` | Raw path, no wrapper |
| `src/pages/index.astro` | 573 | `src={curso.data.image}` | Raw path, no wrapper |
| `src/pages/index.astro` | 537 | `src={articulo.data.image}` | Raw path, no wrapper |
| `src/pages/novedades.astro` | 46 | `background-image: url('${featured.data.image}')` | Raw path, no wrapper |
| `src/pages/novedades.astro` | 84 | `background-image: url('${articulo.data.image}')` | Raw path, no wrapper |
| `src/pages/novedades/[slug].astro` | 67 | `src={articulo.data.image}` | Raw path, no wrapper |

**Content collection image format**: Course markdown frontmatter stores root-relative paths, e.g. `image: /images/cursos/inspector-soldadura.webp` (from `src/content/cursos/inspector-soldadura-cawi-cwi-aws.md` line 5).

### Why It Works Today (and why it's fragile)

With `astro.config.mjs` `base: "/"`, root-relative paths like `/images/cursos/inspector-soldadura.webp` resolve correctly to `https://cbhe.org.bo/images/cursos/inspector-soldadura.webp` on the apex domain. The `<base href>` tag in Layout.astro handles relative paths that start without `/`.

**The gap**: content collection images bypass `resolveImageUrl()`. If `base` ever changes from `/` (e.g., GitHub Pages subpath staging), course/article images would break silently — the raw `/images/...` paths would not include the subpath prefix.

### What Needs to Change

- Wrap `data.image` through `resolveImageUrl()` in `CourseCard.astro`, `[slug].astro`, `index.astro`, `novedades.astro`, and `novedades/[slug].astro`.
- Low-risk, mechanical change. ~7 locations across 5 files.
- Verification: `npx astro build` + inspect `dist/` for `<img src>` values.

### Open Questions / Decisions Deferred

- None — this is a straightforward fix.

### Risks

- **LOW**: Content collection images work today with `base: "/"`. Not fixing this is not a blocker for `cbhe.org.bo`. Fixing it is defensive.

---

## 2. Capacitación Cards 1:1 (cursos y certificaciones)

### Current State

**`src/components/CourseCard.astro`** — lines 53-57:
```typescript
const imageClasses = {
  default: "aspect-video",   // ← 16:9, needs to change to 1:1
  compact: "aspect-4/3",
  featured: "aspect-21/9",
};
```

The `capacitacion.astro` page (line 267) uses `CourseCard variant="default"`. The grid is:
```astro
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
```

**Current image layout with `default` variant** (CourseCard.astro lines 94-109):
- Image wrapped in `<div class="relative overflow-hidden">` → `<div class="relative overflow-hidden h-full ${imageClasses[variant]}">` → `<img class="w-full h-full object-cover ...">`
- On image load, images get `aspect-video` (16:9) via the wrapper div.

### What Needs to Change

Change `imageClasses.default` from `"aspect-video"` to `"aspect-square"` (Tailwind v4 class for 1:1) in `CourseCard.astro` line 54.

**Responsive analysis**: The grid is `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, images fill the wrapper via `w-full h-full object-cover`. Changing aspect-ratio is a self-contained visual change:
- **Mobile** (1 col): Card is full-width. Square image will be smaller than current 16:9. No overflow risk.
- **Tablet** (2 cols): Images get ~half the viewport width. Square format is comfortable.
- **Desktop** (3 cols): Images in ~320px wide cards. Square format gives ~320x320 image area.

### Edge Cases

- **No image fallback** (CourseCard.astro lines 110-120): The fallback uses the same `imageClasses[variant]` div with an icon. Changing to `aspect-square` will also affect the fallback — visually it will be a square colored background. This is fine and consistent.
- **Compact variant** (used in `RelatedCourses.astro`): `aspect-4/3` stays unchanged — not in scope.
- **Featured variant** (not currently used): `aspect-21/9` stays unchanged.

### Open Questions / Decisions Deferred

- None. The change is isolated and mechanical.

### Risks

- **LOW**: Pure CSS change. Visual regression risk is low because it's a single Tailwind class swap. Verify with `npx astro build` and screenshot inspection.

---

## 3. Sistema paralelo de certificados

### Current State

**Database — `supabase/migrations/001_certificados.sql`**:
```sql
CREATE TABLE public.certificados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  empresa_nombre text NOT NULL,
  tipo_certificacion text NOT NULL,
  fecha_emision date NOT NULL,
  fecha_vencimiento date,
  estado text NOT NULL DEFAULT 'vigente' CHECK (estado IN ('vigente', 'vencido', 'revocado')),
  created_at timestamptz NOT NULL DEFAULT now()
);
```

Key observations:
- Only one "company" field (`empresa_nombre`), no `persona_nombre`.
- No discriminator column (no `tipo` or `categoria` field to distinguish Sello vs Capacitación).
- All fields are certification-oriented, not Sello-oriented.
- Hardcoded to a single flow: certificates for companies.

**Code generation — `supabase/migrations/002_auto_generate_code.sql`**:
- `generate_certificate_code()` function generates `CBHE-XXXXXXXXXX` codes.
- `set_certificate_code()` trigger runs BEFORE INSERT.
- Explicit `codigo` values are preserved (backward compatible).

**RLS policies**:
- `anon` → SELECT only `vigente` rows.
- `authenticated` → SELECT only `vigente` rows.
- `service_role` → full CRUD.
- Anon/authenticated have GRANT SELECT on the table.
- **No row-level scope separation** — there's no mechanism to say "Tania sees sellos, Alejandra sees certificates."

**Verification page — `src/pages/certificados.astro`**:
- Client-side verification via Supabase JS SDK (loaded via `<script is:inline src="...CDN...">`).
- Reads `?c=CODE` from URL query parameter.
- Queries `certificados` table by `codigo` with `.maybeSingle()`.
- Displays `empresa_nombre`, `tipo_certificacion`, `fecha_emision`, `fecha_vencimiento`, `estado`, `codigo`.
- **No route for sellos** — single page at `/certificados/`.
- Single route currently accessed at (not yet migrated to apex): the page URL is `VERIFICATION_URL/certificados/?c=CODE`.

**Issue script — `scripts/issue-certificate.mjs`**:
- CLI tool, parameters: `--empresa`, `--tipo`, `--fecha-emision`, `--fecha-vencimiento`, `--codigo`, `--output`.
- Takes `empresa_nombre` as the certificate holder. No concept of "persona."
- Generates: Supabase INSERT → QR code → Puppeteer PDF.

**GitHub workflow — `.github/workflows/issue-certificate.yml`**:
- `workflow_dispatch` with inputs: `empresa_nombre`, `tipo_certificacion`, `fecha_emision`, `fecha_vencimiento`.
- **No persona/sello split** — single workflow, single owner concept.

**Existing documentation — `README.md`**:
- Section "Emitir certificados digitales" (lines 121-156) documents the current flow.
- Describes steps for the company certificate flow on GitHub Actions.

**No existing "Sello CBHE" code anywhere** — zero references to `sello` in `src/`. The concept only exists in `SPRINT-ENTREGA.md`.

### Open Decisions (delegated to sdd-propose with the user)

1. **Table strategy**: New table `sellos_cbhe` vs discriminator column `tipo` in `certificados`?
   - New table: cleaner schema separation, independent migrations, no risk of breaking existing certs. But adds schema surface area and the verification page needs to query two tables (or union).
   - Discriminator column: simpler schema, single table for both flows, same verification query. But adds conditionals everywhere, and existing rows need backfill.
   
2. **RLS scope split**: How to ensure Tania only sees sellos and Alejandra only sees certificates?
   - With discriminator: `CREATE POLICY "tania_sellos" ... USING (tipo = 'sello' AND auth.email() = 'tania@...')` — but this assumes email-based auth.
   - With separate table: RLS on each table can be independently scoped.
   - Question: do Tania and Alejandra have Supabase accounts or are they using GitHub auth through Sveltia CMS?
   - Currently: the emission flow goes through GitHub Actions (`workflow_dispatch`), not user-specific Supabase auth. The emission script uses `service_role` key (admin bypass). There is **no dashboard UI** for Tania or Alejandra to issue certificates directly — it's all GitHub Actions.

3. **UI route split**: One verification URL with a type discriminator (`/certificados/?c=CODE&t=sello`) vs separate routes (`/verificar-sello/?c=CODE` vs `/certificados/?c=CODE`)?
   - Current: single route at `/certificados/`.
   - QR codes are already printed on issued PDFs — changing the URL path means existing certificates' QR codes would break unless redirected.
   - The URL is baked into the QR code at issuance time (in `generateQRDataURL()` → `issue-certificate.mjs` line 257).

4. **Code prefix strategy**: Both systems would use `CBHE-XXXXXXXXXX` codes. Does Sello need a different prefix (e.g., `CBHE-S-XXXXXXXXXX`) for disambiguation?
   - The trigger function `generate_certificate_code()` is hardcoded to `CBHE-` prefix.
   - If using discriminator, the code needs to be unique across both types. A prefix change would help distinguish visually and prevent collisions.
   - If using separate table, each table could have its own trigger with different prefix.

5. **Issue workflow split**: Separate GitHub Actions workflow for Sello (with different inputs: empresa vs persona) vs single workflow with type parameter?

### Risks

- **CRITICAL**: QR codes on already-issued certificates contain the verification URL. If the URL structure changes (new path, new parameter requirements), existing physical certificates will point to a broken verification page. A redirect strategy is essential.
- **MEDIUM**: Tania and Alejandra likely need non-technical interfaces. Currently the only issuance path is GitHub Actions CLI — neither can use it. The parallel system needs a UI or at minimum a cleaned-up workflow_dispatch with clear field labels.
- **MEDIUM**: The `certificados` table has no migration for the new structure yet. Any schema change must be backward compatible with existing data (17? certs already in the table).
- **LOW**: Current RLS is wide — anon can SELECT all vigente certificates. If sellos need different visibility (e.g., only show vigente sellos to the owning company, not the public), RLS needs more granular policies.

---

## 4. Documentación de entrega

### Current State

**`README.md`** is the de facto editor guide (199 lines):
- Title: "CBHE Web — Guía para Editores"
- Sections: Inicio rápido, Guardar vs Publicar, Imágenes y borradores, Campos por colección, Markdown, Emitir certificados digitales, Problemas comunes, Glosario, Para desarrolladores.
- Covers: Sveltia CMS access, save/publish difference, per-collection field tables, Markdown cheat sheet, certificate issuance (GitHub Actions), troubleshooting table, glossary.

**What's missing for delivery**:
- **No Sello CBHE section**: The current doc only covers the "empresa certificate" flow. The new parallel system (Sello → Tania, Capacitación → Alejandra) is not documented.
- **No role-based separation**: The doc addresses "the editor" as one persona. It doesn't distinguish Tania (sellos), Alejandra (capacitación), or Comunicación (articles).
- **No Supabase admin instructions**: If Tania or Alejandra ever need to manage records directly (revoke, reissue), there's no guide for the Supabase dashboard or psql.
- **No credentials handoff**: Where to find GitHub tokens, Supabase keys, Web3Forms key. Currently in `.env` + GitHub Secrets.
- **No deployment pipeline diagram**: The current `tour-del-proyecto.md` has this, but it's a developer-facing doc, not for end-users.

**GUIA-EDITORES.md**: Does NOT exist as a separate file. The `README.md` serves this purpose, but it's mixed with developer instructions. Consider either:
- Keeping `README.md` as the single editor guide and splitting off developer docs to a separate file.
- Or creating a leaner `GUIA-EDITORES.md` for non-technical staff and renaming/trimming `README.md` for developers.

**`tour-del-proyecto.md`**: 204-line tour document for screen-sharing demos. Good for handoff context but not for day-to-day operations.

### What Needs to Change

- Expand `README.md` with a new "Sistema de Certificados" section covering both flows.
- Add a role matrix (Comunicación | Capacitación | Sello) mapping each persona to their tools and permissions.
- Create or consolidate a credentials section (non-sensitive references only: "ask tech for the .env file").
- Optionally split developer instructions into a separate doc if the README becomes too long for editors.

### Risks

- **LOW**: Documentation is additive. No risk of breaking anything. Risk is writing inaccurate instructions for a system (parallel certs) that hasn't been designed yet — so this item is best done in two passes: baseline docs now + finalize after cert system is implemented.

---

## Summary of File Changes Required

| File | Change | Sprint Item |
|------|--------|-------------|
| `src/components/CourseCard.astro:54` | `"aspect-video"` → `"aspect-square"` | Item 2 |
| `src/components/CourseCard.astro:98` | Wrap `data.image` with `resolveImageUrl()` | Item 1 |
| `src/pages/capacitacion/[slug].astro:99` | Wrap `curso.data.image` with `resolveImageUrl()` | Item 1 |
| `src/pages/index.astro:537,573` | Wrap `data.image` with `resolveImageUrl()` | Item 1 |
| `src/pages/novedades.astro:46,84` | Wrap `data.image` with `resolveImageUrl()` | Item 1 |
| `src/pages/novedades/[slug].astro:67` | Wrap `articulo.data.image` with `resolveImageUrl()` | Item 1 |
| New Supabase migration | Schema for sellos (table or column) | Item 3 |
| `src/pages/` (new or modified) | Verification route(s) for sellos | Item 3 |
| `scripts/issue-certificate.mjs` | Support persona/sello flow | Item 3 |
| `.github/workflows/issue-certificate.yml` | Add sello workflow or type param | Item 3 |
| `README.md` | Expand cert section, role matrix | Item 4 |

## Ready for Proposal

**Yes** — exploration is complete. All 4 items have been analyzed. Items 1 and 2 are straightforward and can be spec'd immediately. Item 3 needs user decisions (delegated to sdd-propose). Item 4 can start in parallel.

The orchestrator should inform the user that:
1. Items 1 & 2 are ready to spec — low-risk, mechanical.
2. Item 3 has 5 open decisions that need user input (table strategy, RLS scope, route split, code prefix, workflow split).
3. Item 4 documentation can start in parallel to item 3.

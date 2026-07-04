# Tasks: Fix Image Paths and Card Aspect Ratio

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~35 (12 edits, 5 files) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR (cohesive mechanical change) |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Summary

12 edits across 5 files: add 4 missing `resolveImageUrl()` imports, wrap 7 `data.image` references through the helper, swap `CourseCard` default variant to `aspect-square`.

## Execution Order

1. Add imports (prerequisite — build breaks without them)
2. Apply `resolveImageUrl()` wraps (core fix)
3. Swap aspect ratio (CSS-only, lowest risk)
4. `npx astro build` + output scan
5. Commit + push

## Tasks

### TASK-01: Add missing `resolveImageUrl` imports

**Files**: `src/components/CourseCard.astro`, `src/pages/capacitacion/[slug].astro`, `src/pages/novedades.astro`, `src/pages/novedades/[slug].astro`

**Edits**:
- CourseCard.astro: add `import { resolveImageUrl } from "../utils/images";` after existing `Icon` import (line 2)
- capacitacion/[slug].astro: add `import { resolveImageUrl } from "../../utils/images";` after last existing import (line 10)
- novedades.astro: add `import { resolveImageUrl } from "../utils/images";` after date import (line 7)
- novedades/[slug].astro: add `import { resolveImageUrl } from "../../utils/images";` after date import (line 5)

**Verification**: `Select-String -Path src/components/CourseCard.astro,src/pages/capacitacion/`[slug`].astro,src/pages/novedades.astro,"src/pages/novedades/[slug].astro" -Pattern "^import.*resolveImageUrl"` shows 4 matches.

**Rollback**: `git checkout -- <file>` per file or git revert on final commit.

### TASK-02: Wrap `data.image` references with `resolveImageUrl()`

**Files**: All 5 in-scope files.

**Edits**:
- CourseCard.astro: `src={data.image}` → `src={resolveImageUrl(data.image)}` (the `<img>` in the `hasImage` branch, ~line 98)
- capacitacion/[slug].astro: `src={curso.data.image}` → `src={resolveImageUrl(curso.data.image)}` (hero `<img>` inside `<figure>`, ~line 99)
- index.astro: `src={articulo.data.image}` → `src={resolveImageUrl(articulo.data.image)}` (articles grid, ~line 537)
- index.astro: `src={curso.data.image}` → `src={resolveImageUrl(curso.data.image)}` (cursos destacados, ~line 573)
- novedades.astro line 46: `` `url('${featured.data.image}')` `` → `` `url('${resolveImageUrl(featured.data.image)}')` `` (featured inline style — wrap ONLY the expression, not `url()`)
- novedades.astro line 84: `` `url('${articulo.data.image}')` `` → `` `url('${resolveImageUrl(articulo.data.image)}')` `` (grid tile)
- novedades/[slug].astro: `src={articulo.data.image}` → `src={resolveImageUrl(articulo.data.image)}` (hero `<img>`, ~line 67)

**Verification**: `Select-String -Path src/components/CourseCard.astro,src/pages/capacitacion/`[slug`].astro,src/pages/index.astro,src/pages/novedades.astro,"src/pages/novedades/[slug].astro" -Pattern 'resolveImageUrl\(.*\.data\.image'` shows 7 matches. Zero un-wrapped `src={.*data.image[^)]` remains.

**Rollback**: Same as TASK-01.

### TASK-03: Swap CourseCard default variant to 1:1

**Files**: `src/components/CourseCard.astro`

**Edits**: Change `default: "aspect-video"` → `default: "aspect-square"` inside the `imageClasses` object (~line 54). `compact` (4:3) and `featured` (21:9) untouched.

**Verification**: `Select-String -Path src/components/CourseCard.astro -Pattern "aspect-square"` shows 1 match on `default`. `Select-String -Path src/components/CourseCard.astro -Pattern "aspect-video"` returns 0 matches.

**Rollback**: Single-line revert — restore `"aspect-video"`.

### TASK-04: Build + output verification

**Files**: None — commands only.

**Edits**:
1. `npx astro build` — must exit 0 with no new warnings.
2. `Get-ChildItem -Path dist -Recurse -Filter *.html | Select-String -Pattern 'src="/images/.*\.(webp|jpg|png)' | Select-Object -First 20` — images under valid root-relative paths.
3. `Get-ChildItem -Path dist -Recurse -Filter *.html | Select-String -Pattern "url\('/images/" | Select-Object -First 10` — single-wrapped `url()` values.
4. `Get-ChildItem -Path dist -Recurse -Filter *.html | Select-String -Pattern 'src="undefined|url\(\x27undefined'` — zero matches.

**Verification**: All 4 commands pass as described above.

**Rollback**: N/A — read-only inspection.

### TASK-05: Commit + push

**Files**: The 5 modified source files.

**Edits**:
```bash
git add src/components/CourseCard.astro src/pages/capacitacion/\[slug\].astro src/pages/index.astro src/pages/novedades.astro "src/pages/novedades/[slug].astro"
git commit -m "fix(images+cards): wrap content collection images and set CourseCard to 1:1"
git push origin feat/custom-domain
```

**Verification**: `git log --oneline -1` shows HEAD with correct commit message. Push output confirms remote updated.

**Rollback**: `git revert HEAD` — creates a revert commit. No schema or data migration needed.

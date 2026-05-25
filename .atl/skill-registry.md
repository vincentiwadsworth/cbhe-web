# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol.

## User Skills (system-level)

| Trigger | Skill | Path |
|---------|-------|------|
| PR creation, opening PR, prepare PR for review | branch-pr | ~/.config/opencode/skills/branch-pr/SKILL.md |
| PRs >400 lines, stacked PRs, review slices | chained-pr | ~/.config/opencode/skills/chained-pr/SKILL.md |
| n8n chatbot Julia, debug, ejecuciones, nodos | chat-debug | ~/.config/opencode/skills/chat-debug/SKILL.md |
| limpieza, data cleaning, calidad de datos, anuncios_v2 | citrino-data-cleaning | ~/.config/opencode/skills/citrino-data-cleaning/SKILL.md |
| scraping, coordenadas, latitud, longitud, propiedades | citrino-scraping | ~/.config/opencode/skills/citrino-scraping/SKILL.md |
| VPS, hostinger, docker, n8n server, administrar VPS | citrino-vps | ~/.config/opencode/skills/citrino-vps/SKILL.md |
| doc design, cognitive load, READMEs, RFCs, onboarding | cognitive-doc-design | ~/.config/opencode/skills/cognitive-doc-design/SKILL.md |
| PR feedback, issue replies, reviews, Slack, comments | comment-writer | ~/.config/opencode/skills/comment-writer/SKILL.md |
| resumir documento, documento de referencia | doc-summarizer | ~/.config/opencode/skills/doc-summarizer/SKILL.md |
| ER, diagrama entidad-relación, schema, base de datos | er-diagram | ~/.config/opencode/skills/er-diagram/SKILL.md |
| Go tests, go test coverage, Bubbletea teatest | go-testing | ~/.config/opencode/skills/go-testing/SKILL.md |
| crear issue, GitHub issue, bug report, feature request | issue-creation | ~/.config/opencode/skills/issue-creation/SKILL.md |
| judgment day, dual review, adversarial review, juzgar | judgment-day | ~/.config/opencode/skills/judgment-day/SKILL.md |
| delegate() model error, rate limit, fallback | model-fallback-handler | ~/.config/opencode/skills/model-fallback-handler/SKILL.md |
| n8n, flujos, workflows, chatbot Julia, debugging | n8n-flow | ~/.config/opencode/skills/n8n-flow/SKILL.md |
| PlantUML, diagrama de actividad, swimlanes, activity diagram | plantuml-diagram | ~/.config/opencode/skills/plantuml-diagram/SKILL.md |
| slides, presentation, pitch deck, action titles, storyline | presentation-skills | ~/.config/opencode/skills/presentation-skills/SKILL.md |
| Quarto, qmd, quarto render, quarto website, revealjs | quarto | ~/.config/opencode/skills/quarto/SKILL.md |
| convertir imagen a SVG, raster to vector, PNG to SVG | raster-to-svg | ~/.config/opencode/skills/raster-to-svg/SKILL.md |
| create new skill, agent instructions, documenting AI patterns | skill-creator | ~/.config/opencode/skills/skill-creator/SKILL.md |
| improve skills, audit skills, refactor skills, skill quality | skill-improver | ~/.config/opencode/skills/skill-improver/SKILL.md |
| update skills, skill registry, after skill changes | skill-registry | ~/.config/opencode/skills/skill-registry/SKILL.md |
| plan commits, work units, commit splitting, reviewable commits | work-unit-commits | ~/.config/opencode/skills/work-unit-commits/SKILL.md |

## User Skills (agent-level)

| Trigger | Skill | Path |
|---------|-------|------|
| manage citations, BibTeX, APA, MLA, Chicago | academic-citation-manager | ~/.agents/skills/academic-citation-manager/SKILL.md |
| academic writing, research methodology, peer review | academic-writing | ~/.agents/skills/academic-writing/SKILL.md |
| WCAG 2.2, a11y audit, screen reader, keyboard nav | accessibility | ~/.agents/skills/accessibility/SKILL.md |
| dashboards, analytics, KPI cards, data visualization | creating-dashboards | ~/.agents/skills/creating-dashboards/SKILL.md |
| reproducible research, data versioning, environments | data-reproducibility | ~/.agents/skills/data-reproducibility/SKILL.md |
| how do I do X, find skill for X, discover capabilities | find-skills | ~/.agents/skills/find-skills/SKILL.md |
| gh CLI, GitHub issues, PRs, releases, Actions | gh-cli | ~/.agents/skills/gh-cli/SKILL.md |
| commit, git commit, conventional commit, /commit | git-commit | ~/.agents/skills/git-commit/SKILL.md |
| InsForge SDK, database CRUD, auth, storage, functions | insforge | ~/.agents/skills/insforge/SKILL.md |
| InsForge backend health, security audit, performance | insforge-backend-advisor | ~/.agents/skills/insforge-backend-advisor/SKILL.md |
| InsForge CLI, infrastructure, SQL, migrations, deploy | insforge-cli | ~/.agents/skills/insforge-cli/SKILL.md |
| InsForge debug, 4xx/5xx, auth errors, RLS denial | insforge-debug | ~/.agents/skills/insforge-debug/SKILL.md |
| InsForge OAuth, Clerk, Auth0, JWT RLS, Stripe | insforge-integrations | ~/.agents/skills/insforge-integrations/SKILL.md |
| literature review, research survey, expert personas | literature-review | ~/.agents/skills/literature-review/SKILL.md |
| n8n node configuration, parameters, displayOptions | n8n-node-configuration | ~/.agents/skills/n8n-node-configuration/SKILL.md |
| n8n validation errors, warnings, auto-fix | n8n-validation-expert | ~/.agents/skills/n8n-validation-expert/SKILL.md |
| n8n workflow patterns, webhook, API, AI, batch | n8n-workflow-patterns | ~/.agents/skills/n8n-workflow-patterns/SKILL.md |
| PostGIS, geospatial, Postgres spatial data | postgis-skill | ~/.agents/skills/postgis-skill/SKILL.md |
| select statistical tests, effect sizes, power analysis | quantitative-analysis | ~/.agents/skills/quantitative-analysis/SKILL.md |
| Recharts, React charts, line/bar/pie/scatter charts | recharts | ~/.agents/skills/recharts/SKILL.md |
| IEEE/ACM research paper, academic paper, conference | research-paper-writer | ~/.agents/skills/research-paper-writer/SKILL.md |
| Supabase, database, auth, edge functions, realtime | supabase | ~/.agents/skills/supabase/SKILL.md |
| Postgres performance, query optimization, indexes | supabase-postgres-best-practices | ~/.agents/skills/supabase-postgres-best-practices/SKILL.md |
| Tremor, dashboards, KPI cards, charts, data tables | tremor-design-system | ~/.agents/skills/tremor-design-system/SKILL.md |
| review UI, accessibility, audit design, UX review | web-design-guidelines | ~/.agents/skills/web-design-guidelines/SKILL.md |
| hypothesis testing, Bayesian, regression, statistics | statistical-analysis | ~/.agents/skills/statistical-analysis/SKILL.md |

## Project Skills

| Trigger | Skill | Path |
|---------|-------|------|
| Astro, .astro files, SSG, content collections, deploy | astro | .agents/skills/astro/SKILL.md |
| write copy, improve copy, marketing copy, CTA, headline | copywriting | .agents/skills/copywriting/SKILL.md |
| extract design system, design tokens, CSS variables | extract-design-system | .agents/skills/extract-design-system/SKILL.md |
| publish to GitHub Pages, deploy presentation, PPTX | publish-to-pages | .agents/skills/publish-to-pages/SKILL.md |
| responsive layouts, container queries, CSS Grid, fluid | responsive-design | .agents/skills/responsive-design/SKILL.md |
| UI/UX design, color palette, typography, accessibility | ui-ux-pro-max | .agents/skills/ui-ux-pro-max/SKILL.md |

## SDD Phase Skills (reserved)

SDD orchestration skills exist at `~/.config/opencode/skills/sdd-*` but are not indexed here — they are invoked by the orchestrator, not by sub-agents.

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### astro
- `.astro` files: frontmatter in `---` fences, HTML below, zero JS by default
- Content Collections: config at `src/content.config.ts` (Astro 6+), use `defineCollection` + `z` from `astro/zod` + `glob` loader from `astro/loaders`
- NEVER use `astro:content` for `z` — import from `astro/zod` in v6
- `getCollection("name")` in frontmatter, filter with `({ data }) => !data.draft`
- `base` config only prefixes assets, NOT `<a href>` — use `<base href={import.meta.env.BASE_URL}>` in Layout
- `import.meta.env.WEB3FORMS_KEY` for build-time env vars (no `PUBLIC_` prefix needed in frontmatter)
- `npx astro dev` → `localhost:4321`, `npx astro build` → `dist/`

### ui-ux-pro-max
- Priority 1 (CRITICAL): color contrast ≥4.5:1, focus-visible rings, alt text, aria-labels, keyboard nav
- Priority 2 (CRITICAL): touch targets ≥44×44px/48×48dp, 8px+ spacing between touch targets
- Priority 3 (HIGH): WebP/AVIF, lazy loading, explicit width/height on images (CLS), font-display: swap
- No emojis as icons — use SVG icon sets (Heroicons, Lucide, Material Symbols)
- `text-wrap: balance` on headings; `text-pretty` on body
- Reduced motion: `@media (prefers-reduced-motion: reduce)` must disable all animations
- `…` not `...`; curly quotes `"` `"` not straight `"`
- Forms: visible labels (never placeholder-only), errors near fields, required indicators

### web-design-guidelines
- Icon-only buttons need `aria-label`; decorative icons need `aria-hidden="true"`
- `<button>` for actions, `<a>` for navigation — never `<div onClick>`
- Images need `alt` (or `alt=""` if decorative) + explicit `width`/`height`
- `:focus-visible` over `:focus`; never `outline-none` without replacement
- Forms: inputs need `autocomplete` and `name`; correct `type` (`email`, `tel`, `url`)
- `touch-action: manipulation` (prevents 300ms tap delay)
- `scroll-margin-top` on anchor targets (offset for sticky nav)
- Animate only `transform`/`opacity`; never `transition: all`
- `font-variant-numeric: tabular-nums` for number columns
- Loading states end with `…`: `"Loading…"`, `"Saving…"`

### accessibility
- WCAG 2.2 POUR: Perceivable, Operable, Understandable, Robust. Target AA minimum.
- Images: descriptive `alt` for content, `alt="" role="presentation"` for decorative
- Icon buttons: always `aria-label`; complex images: `aria-describedby` + `<figcaption>`
- Keyboard: visible `:focus-visible` ring 2-4px; logical tab order; skip-to-content link
- Forms: labels with `for` (never placeholder-only); errors with `aria-live`; required fields with `aria-required`
- Color: contrast ≥4.5:1 text, ≥3:1 large text; never rely on color alone; test with grayscale
- Screen readers: semantic HTML first (`<nav>`, `<main>`, `<button>`); ARIA only when HTML insufficient
- Reduced motion: `@media (prefers-reduced-motion)`; animations ≤150-300ms
- Landmarks: `<header>`, `<main>`, `<nav>`, `<footer>`, `<aside>` on every page
- Test: axe DevTools, Lighthouse a11y score ≥90, manual keyboard tab through all interactive elements

### git-commit
- Conventional Commits: `type[scope]: description` (feat, fix, chore, docs, style, refactor, perf, test, build, ci)
- Present tense, imperative mood: "add" not "added", "fix" not "fixes"
- NEVER commit secrets (.env, credentials.json, private keys)
- NEVER amend pushed commits or force push to main
- If commit fails due to hooks: fix and create NEW commit, never amend
- One logical change per commit; keep description <72 chars

### gh-cli
- `gh auth status` → check login; `gh issue create/list/view/close`; `gh pr create/list/merge`
- `gh label create/label/clone`; `gh repo create/view/edit`
- `gh run list/view/rerun` → check workflow runs; `gh secret set` → set GitHub Actions secrets
- `gh api repos/{owner}/{repo}/...` → direct API calls (omit leading slash in Windows)
- `gh repo edit --visibility public --accept-visibility-change-consequences` → make repo public
- GitHub Pages enable: `gh api repos/{owner}/{repo}/pages --method POST -F "build_type=workflow"`

### copywriting
- Active voice, second person: "Install the CLI" not "The CLI will be installed"
- Specific CTA labels: "Save API Key" not "Continue"
- Title Case for headings/buttons (Chicago style); numerals for counts: "8 deployments"
- Error messages include fix/next step, not just problem
- `&` over "and" where space-constrained

### supabase
- Use `@supabase/ssr` for Next.js/Astro/SvelteKit; server-side auth with cookies
- Row Level Security (RLS) mandatory on all tables with public access
- `supabase-js`: `supabase.from("table").select().eq()` — chainable query builder
- Edge Functions in `supabase/functions/`; deploy with `supabase functions deploy`
- Migrations: `supabase db diff` → `supabase db push`; never edit tables in dashboard for tracked schemas
- Realtime: `supabase.channel("name").on("...", callback).subscribe()`

### supabase-postgres-best-practices
- Always add `explain analyze` before deploying queries; check for sequential scans on large tables
- Index foreign keys; use partial indexes for filtered queries; consider BRIN for append-only tables
- `text` over `varchar(n)`; `timestamptz` over `timestamp`; `bigint`/`uuid` for primary keys
- Connection pooling: use Supavisor (PGbouncer) in production; set `pooler.max_client_conn = 100`
- Never use `select *` in production queries; never run unfiltered `update`/`delete`

### n8n-flow
- Workflows saved as JSON in `.n8n/` or exported from n8n UI
- Use environment variables for API keys: `$env.SUPABASE_URL` in node configs
- Error handling: add Error Trigger nodes after critical HTTP/webhook nodes
- DeepSeek integration via HTTP Request node to OpenRouter API

### citrino-data-cleaning
- Target table: `anuncios_v2` with `fecha_snapshot` partitioning
- Remove duplicates by `id_anuncio` keeping latest `fecha_snapshot`
- Null handling: fill `precio` with 0 where missing, drop rows with null `ubicacion`
- Validate `moneda` enum (USD, BOB, UFV); convert all to USD for analysis

### citrino-vps
- SSH: `ssh root@<hostinger-ip>`; Docker management via `docker compose`
- n8n at port 5678; restart: `docker compose restart n8n`
- Check logs: `docker compose logs -f n8n --tail 50`
- Backup: `docker compose exec postgres pg_dump` → Supabase

### presentation-skills
- Action titles: every slide title is a complete sentence stating the insight (not "Q4 Results" → "Revenue grew 23% driven by APAC expansion")
- MECE: mutually exclusive, collectively exhaustive — no overlap, no gaps between slides
- SCS framework: Situation → Complication → Solution → per slide vertical
- One idea per slide; 30pt+ font minimum; data labels on charts, not in footnotes

### plantuml-diagram
- Swimlanes: `|Swimlane1|\n|Swimlane2|` syntax; `:Step;` for activities
- Use `@startuml` / `@enduml`; `skinparam` for styling
- Generate PNG: `plantuml -tpng diagram.puml`

### er-diagram
- Mermaid syntax: `erDiagram` block; `ENTITY { type field PK/FK "description" }`
- Relationships: `||--o{` (one-to-many), `}|--||` (one-to-one)
- Generate via Supabase: `supabase db diff --linked --schema public`

### go-testing
- Use `testing.T` for unit tests; `testify/assert` for assertions
- Bubbletea TUI testing: `teatest.NewTeaModel(t, model)` for integration; `model.Update(msg)` for unit
- Table-driven tests: `tests := []struct{name, input, expected}` loop
- `go test -race -cover ./...` for race detection + coverage

### judgment-day
- Launch 2 blind judge sub-agents simultaneously via `delegate`
- Synthesize both findings; apply fixes; re-judge up to 2 iterations
- Escalate if both don't pass after 2 iterations

### skill-creator
- Skills are markdown files with YAML frontmatter (`name`, `description`)
- `description` field doubles as trigger — use "When user says X" patterns
- `SKILL.md` in a named directory under the skills folder
- Use `skill` tool to register; `skills-lock.json` tracks installed skills

### find-skills
- Query: `how do I do X` → search available skills by trigger keywords
- Check `skills-lock.json` for installed skills; `find-skills` for discovery

### doc-summarizer
- Resume documentos a una sección `## resumen de documentos` en la nota raíz
- Contextualizar al tema de la nota, no resumir genéricamente

### extract-design-system
- Extract colors, typography, spacing, border-radius, shadows from existing site
- Generate CSS custom properties or Tailwind `@theme` tokens
- Output: starter token files for the project

### publish-to-pages
- Handles PPTX, PDF, HTML → GitHub Pages URL
- Creates repo, converts files, enables Pages, returns live URL

### raster-to-svg
- Only two packages needed on Windows: `pip install vtracer resvg_python` — NO cairosvg, NO img2vector, NO svglib (all require Cairo C lib absent on Windows)
- Crop with PIL `Image.crop()`, trace with `vtracer.convert_image_to_svg_py(input_path, output_path, colormode='binary', filter_speckle=8)`
- Render SVG→PNG with `resvg_python.svg_to_png()` — returns `list[int]`, wrap with `bytes()`. Import is `resvg_python` not `resvg`
- For favicons: binary mode mandatory (color mode = 30KB+). Transparent source → flatten to white background first
- Reusable script at `assets/raster_to_svg.py`: `python raster_to_svg.py logo.png --crop 0,0,200,166 --icons`

### branch-pr / issue-creation
- Agent Teams Lite workflow: issue-first → branch → PR
- Issue templates: title + body with reproduction steps/scope
- PR links to issue with `Closes #N`

### responsive-design
- Use container queries (`@container`) for component-level responsiveness
- Fluid typography with `clamp()`: prefer `text-fluid-*` utilities or custom `clamp()`
- Mobile-first: base styles for mobile, `@media (width >= 768px)` for tablet, `@media (width >= 1024px)` for desktop
- CSS Grid for page layout; flexbox for component-level layout
- Touch targets ≥44px; `touch-action: manipulation` on interactive elements

### tremor-design-system
- KPI cards: `Card > Text + Metric` for primary + secondary stats
- Line/Bar charts: `Chart` component with `categories` and `index` props
- Data tables: `Table`, `TableHead`, `TableRow`, `TableCell` for structured data
- Responsive charts: `className="max-sm:... sm:... lg:..."` for breakpoint-aware sizes

### recharts
- Import pattern: `import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'`
- Wrap ALL charts in `<ResponsiveContainer width="100%" height={300}>`
- Accessibility: `aria-label`, role="img", `<Title>` + `<Desc>` on all charts
- Performance: memoize data, use `PureComponent` for custom shapes

### chained-pr
- Split PRs >400 lines into ≤400-line chains
- Each PR in chain: builds on previous, has clear dependency graph
- Label: `stacked`, `chain-N-of-M` on each PR
- Merge order: bottom-up (base PR first)

### work-unit-commits
- One commit = one reviewable unit: a complete change that makes sense alone
- Keep tests and docs with code in the same commit (don't split test/doc into separate commits)
- Chained PRs: each commit within a PR is a sub-unit of that PR's scope
- Commit message explains WHY not just WHAT

### cognitive-doc-design
- Bottom line first (BLUF): lead with the conclusion, then support
- One idea per section; use frequent headings to create scan paths
- Tables > prose for comparisons; diagrams > paragraphs for flows
- Keep line length ≤80 chars in docs; use `---` separators sparingly

### model-fallback-handler
- When delegate() returns model error: log error, select fallback model from config
- Fallback chain: primary → secondary → tertiary
- Report fallback usage to orchestrator

### quarto
- Notebooks: `.qmd` files with code cells in `{python}` / `{r}` fences
- Render: `quarto render` → HTML/PDF/DOCX; preview: `quarto preview`
- Websites: `_quarto.yml` for project config; `website:` block for nav/sidebar
- Presentations: `format: revealjs` with `slide-level: 2`

## Skill Discovery Notes

- To discover new skills: use `find-skills` skill or check `skills-lock.json`
- 26 user-level skills (system), 26 user-level skills (agent), 6 project-level skills
- SDD skills (12 phases) omitted from compact rules; invoked by orchestrator only

## Project Conventions

- `AGENTS.md` — Full project conventions: stack, critical gotchas (subpath links, Astro 6 API, Sveltia CMS, Tailwind v4), workflow rules
- `.atl/skill-registry.md` — Este archivo. 58 skills catalogados con compact rules
- `src/styles/global.css` — 50 MD3 design tokens as CSS custom properties
- `src/content.config.ts` — 4 content collections (cursos, articulos, empresas, testimonios) with Zod schemas
- `data/prices.json` — Financial data auto-updated via scheduled GitHub Actions workflow

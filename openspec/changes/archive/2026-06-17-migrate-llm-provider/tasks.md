# Tasks: Migrate LLM Provider from Groq to DeepSeek

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~10 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | auto-forecast |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: stacked-to-main
400-line budget risk: Low

### Suggested Work Units

Not needed — single PR under 20 lines.

## Phase 1: Core Implementation

- [x] 1.1 `src/layouts/Layout.astro` — rename `groqKey` to `deepseekKey` at import (L38) and `define:vars` (L222)
- [x] 1.2 `src/layouts/Layout.astro` — swap `provider: "groq"` → `"deepseek"` (L226) and `model: "llama-3.3-70b-versatile"` → `"deepseek-v4-flash"` (L239), update `apiKey: groqKey` → `apiKey: deepseekKey` (L227)
- [x] 1.3 `.env.example` — add `DEEPSEEK_API_KEY=your-deepseek-key` entry after Groq section

## Phase 2: Verification

- [x] 2.1 Run `npx astro build` — verify 28+ pages compile without errors

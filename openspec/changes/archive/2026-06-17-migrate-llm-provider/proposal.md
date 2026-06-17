# Proposal: Migrate LLM Provider from Groq to DeepSeek

## Intent

Groq's free tier rate limits (30 RPM, 14.4K req/day) are no longer sufficient for the chatbot's usage. Migrate to DeepSeek V4 Flash — 4× cheaper input ($0.14 vs $0.59/1M), 2.8× cheaper output ($0.28 vs $0.79/1M), natively supported by `multi-ai-sdk` v2.0.0, and strong Spanish performance for Bolivian institutional content.

## Scope

### In Scope
- Change provider from `"groq"` to `"deepseek"` in `src/layouts/Layout.astro`
- Update model from `"llama-3.3-70b-versatile"` to `"deepseek-v4-flash"`
- Swap `GROQ_KEY` env var for `DEEPSEEK_API_KEY` (new import + define:vars + apiKey param)
- Update `.env.example`
- Verify `npx astro build` succeeds

### Out of Scope
- OpenCode Zen integration (requires SDK changes)
- Multi-provider fallback or load-balancing
- Chat widget UI/UX changes
- Any spec-level behavior changes (pure config swap)

## Capabilities

### New Capabilities
None — pure provider swap, no new capability introduced.

### Modified Capabilities
None — `chatbot-message-rendering` spec governs DOM rendering behavior, which is unaffected by which LLM generates the response text.

## Approach

Drop-in provider swap in `src/layouts/Layout.astro`. Three atomic changes:

1. Add `const deepseekKey = import.meta.env.DEEPSEEK_API_KEY ?? "";` (replaces `groqKey`)
2. Change `provider: "groq"` → `provider: "deepseek"` and `model: "llama-3.3-70b-versatile"` → `model: "deepseek-v4-flash"`
3. Change `apiKey: groqKey` → `apiKey: deepseekKey` and update `define:vars`

Then update `.env.example` (add `DEEPSEEK_API_KEY`, retain `GROQ_KEY` as fallback reference). No SDK upgrade needed — `deepseek` is a native `ProviderName` in multi-ai-sdk v2.0.0.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/layouts/Layout.astro` | Modified | Provider, model, and API key env var |
| `.env.example` | Modified | Add `DEEPSEEK_API_KEY` entry |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `deepseek-chat` legacy alias deprecated 2026-07-24 | Medium | Use `deepseek-v4-flash` (current gen, not legacy) |
| DeepSeek service outage | Low | Rollback plan documented; Groq config retained in git history |
| Spanish quality regression for Bolivian terms | Low | Review first chatbot responses post-deploy |

## Rollback Plan

Revert the three changed lines in `src/layouts/Layout.astro` (provider → `"groq"`, model → `"llama-3.3-70b-versatile"`, apiKey → `groqKey`) and restore `GROQ_KEY` env var. Simple string revert, no architectural impact.

## Dependencies

- DeepSeek API key provisioned in `.env` (user action)
- `multi-ai-sdk` v2.0.0 via esm.sh CDN (already present)

## Success Criteria

- [ ] `npx astro build` succeeds (28+ pages)
- [ ] Chatbot responds using DeepSeek V4 Flash (confirm via response style/quality)
- [ ] No rendering regressions per `chatbot-message-rendering` spec

# Design: Migrate LLM Provider from Groq to DeepSeek

## Technical Approach

Drop-in provider swap in `src/layouts/Layout.astro`. Three atomic edits — replace the `groqKey` env var import, provider name, and model name — plus update `.env.example`. The proposal's approach maps exactly: no behavioral changes per the zero-delta spec confirmation. The chatbot DOM rendering pipeline, prompt template, and all 10 `chatbot-message-rendering` requirements are untouched.

## Architecture Decisions

| Option | Tradeoffs | Decision |
|--------|-----------|----------|
| `deepseek-v4-flash` vs `deepseek-chat` | `deepseek-chat` is a deprecated legacy alias (removed 2026-07-24). `deepseek-v4-flash` is the current gen, safe past deprecation horizon. | `deepseek-v4-flash` |
| New `DEEPSEEK_API_KEY` vs reusing `GROQ_KEY` | Reusing `GROQ_KEY` creates coupling — changing the env var name breaks the config contract. A separate key is clean, auditable, and lets us keep Groq as a documented rollback path. | New `DEEPSEEK_API_KEY` env var |
| SDK upgrade needed? | `multi-ai-sdk` v2.0.0 lists `deepseek` as a native `ProviderName`. No upgrade required. | No SDK change |

## Data Flow

```
User message → multi-ai-sdk embedChat → POST api.deepseek.com/v1/chat/completions
                                                  │
                                                  ▼
                                        DeepSeek V4 Flash model
                                                  │
                                                  ▼
                                        Response stream → MutationObserver
                                                  │
                                                  ▼
                                        postProcessBubble (normalize → escape → bold → URLs)
                                                  │
                                                  ▼
                                        DOM render in #sgq-messages
```

Same flow as before — only the API endpoint changes from `api.groq.com` to `api.deepseek.com`. The MutationObserver, normalization pipeline, and rendering are fully provider-agnostic.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/layouts/Layout.astro` | Modify | 3 edits: env var (L38), define:vars (L222), provider+model+apiKey (L225-227, L239) |
| `.env.example` | Modify | Add `DEEPSEEK_API_KEY=your-deepseek-key` entry |

### Concrete Diffs for Layout.astro

**Edit 1** — line 38: replace `groqKey` with `deepseekKey`
```diff
- const groqKey = import.meta.env.GROQ_KEY ?? "";
+ const deepseekKey = import.meta.env.DEEPSEEK_API_KEY ?? "";
```

**Edit 2** — line 222: update define:vars
```diff
- <script is:inline define:vars={{ groqKey, chatbotContext }}>
+ <script is:inline define:vars={{ deepseekKey, chatbotContext }}>
```

**Edit 3** — lines 225-227 + 239: swap provider, model, and apiKey
```diff
  mod.embedChat({
-   provider: "groq",
-   apiKey: groqKey,
+   provider: "deepseek",
+   apiKey: deepseekKey,
    ...
-   model: "llama-3.3-70b-versatile",
+   model: "deepseek-v4-flash",
  });
```

### Concrete Diff for .env.example

```diff
+ # DeepSeek (AI chatbot)
+ DEEPSEEK_API_KEY=your-deepseek-key
+
```

Keep `GROQ_KEY` as-is in `.env.example` for rollback reference.

## Interfaces / Contracts

No new interfaces. The `multi-ai-sdk` embedChat contract is unchanged — same options shape, only the `provider` and `model` string values differ.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Build | Full site compilation | `npx astro build` — must pass with 28+ pages |
| Smoke | Chatbot functional after deploy | Open site, send a test query, verify DeepSeek response (distinct style from Groq's Llama) |
| Regression | DOM rendering | Verify bold `**` emphasis, bullet lists, URL formatting still work per spec |

No test runner exists per `openspec/config.yaml`. Build verification is the primary quality gate.

## Migration / Rollout

1. User provisions `DEEPSEEK_API_KEY` in `.env` (blocking prereq)
2. Apply the code changes
3. `npx astro build` — must succeed
4. Commit and push to deploy
5. Smoke-test the chatbot on the live site
6. Optionally remove `GROQ_KEY` from `.env` and `.env.example` after rollback window closes

**Rollback**: revert the 3 Layout.astro diffs and restore `GROQ_KEY`. Simple string revert, no architectural impact.

## Open Questions

None. The proposal and zero-delta spec cover all concerns.

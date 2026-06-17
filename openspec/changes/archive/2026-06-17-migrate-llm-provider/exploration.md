# Exploration: LLM Provider Migration — Groq Free Tier Ending

## Current Integration

### How the chatbot connects

**File**: `src/layouts/Layout.astro`

```js
// Line 38: env var
const groqKey = import.meta.env.GROQ_KEY ?? "";

// Lines 222-227: initialization
import("https://esm.sh/multi-ai-sdk").then(function (mod) {
  mod.embedChat({
    provider: "groq",
    apiKey: groqKey,
    model: "llama-3.3-70b-versatile",
    // ...
```

**Env var**: `GROQ_KEY` in `.env` (line 5 of `.env.example`)
**SDK**: `multi-ai-sdk` v2.0.0 via esm.sh CDN
**Model**: `llama-3.3-70b-versatile` (Llama 3.3 70B on Groq)
**Provider name**: `"groq"` (one of 17 supported by multi-ai-sdk's `ProviderName` type)

### Current Groq pricing (as of June 2026)

| Model | Input $/1M | Output $/1M | Notes |
|-------|-----------|------------|-------|
| llama-3.3-70b-versatile | $0.59 | $0.79 | Currently used |
| llama-3.1-8b-instant | $0.05 | $0.08 | Cheaper alternative |

- Free tier: all models, 30 RPM / 6K TPM / 14.4K req/day, no credit card
- Developer tier: free upgrade (add CC) → 10x limits + 25% discount on tokens
- **Contrary to the user's concern, Groq still has a free tier as of June 2026.** The user may be referring to their specific account's rate limits becoming insufficient, or a notice about their account's free tier changing.
- If the free tier is indeed ending, the Developer tier (free to upgrade, just add a card) provides 10x limits and 25% discount at $0.59/$0.79 per 1M tokens for Llama 3.3 70B. For a low-traffic institutional chatbot, this would cost <$5/month.

## Candidate Providers

### 1. DeepSeek (natively supported by multi-ai-sdk)

| Aspect | Details |
|--------|---------|
| **Provider name** | `"deepseek"` (native in multi-ai-sdk) |
| **Adapter** | `DeepSeekAdapter` extends `OpenAICompatAdapter` |
| **Base URL** | `https://api.deepseek.com/v1` |
| **Default model** | `deepseek-chat` (maps to DeepSeek-V4-Flash non-thinking mode) |
| **Context limit** | 65,536 tokens (1M for V4 models) |
| **Auth** | API key in `DEEPSEEK_API_KEY` env var or passed directly |
| **Supported models** | `deepseek-chat` (legacy), `deepseek-reasoner` (legacy), `deepseek-v4-flash`, `deepseek-v4-pro` |
| **Spanish support** | Excellent — DeepSeek models are strong in Spanish |
| **Structured output** | Supports JSON output, tool calls |

**Pricing (DeepSeek-V4-Flash)**:

| Token type | Price per 1M tokens |
|------------|-------------------|
| Input (cache hit) | $0.0028 |
| Input (cache miss) | $0.14 |
| Output | $0.28 |

**Pricing (DeepSeek-V4-Pro)**:

| Token type | Price per 1M tokens |
|------------|-------------------|
| Input (cache hit) | $0.0036 |
| Input (cache miss) | $0.435 |
| Output | $0.87 |

**Cost comparison vs current Groq (llama-3.3-70b)**:
- DeepSeek V4 Flash is **~4x cheaper** on input ($0.14 vs $0.59) and **~2.8x cheaper** on output ($0.28 vs $0.79)
- DeepSeek V4 Pro is comparable on input ($0.435 vs $0.59) but slightly more on output ($0.87 vs $0.79)

**Free tier**: DeepSeek offers free credits on signup (typically $5-10 promotional balance). No permanent free tier.

**Code change needed**:
- Change `provider: "groq"` to `provider: "deepseek"` (line 226)
- Change `model: "llama-3.3-70b-versatile"` to `model: "deepseek-v4-flash"` (line 239)
- Add `DEEPSEEK_API_KEY` env var (and remove `GROQ_KEY` or keep both for fallback)
- Update `.env.example`

**Caveat**: The `deepseek-chat` and `deepseek-reasoner` legacy model names will be **deprecated on 2026-07-24**. Must use `deepseek-v4-flash` after that date.

---

### 2. OpenCode Zen (NOT natively supported by multi-ai-sdk embedChat)

**Important limitation**: OpenCode Zen is NOT a built-in provider in multi-ai-sdk. The `ProviderName` type (union of 17 providers) does not include `"opencode"` or `"zen"`. However, OpenCode Zen exposes **OpenAI-compatible endpoints**, so it could theoretically be used via `provider: "openai"` — but the `embedChat()` function does NOT accept a custom `baseUrl` parameter, so the base URL would default to `https://api.openai.com/v1`, which is incorrect for Zen.

**To use OpenCode Zen, we would need to**: either fork/modify multi-ai-sdk to support custom base URLs in embedChat, or switch to direct API integration instead of using embedChat.

| Aspect | Details |
|--------|---------|
| **Endpoint** | `https://opencode.ai/zen/v1/chat/completions` (OpenAI-compatible) |
| **Auth** | Bearer token in `Authorization` header |
| **API key** | Get from opencode.ai/zen |
| **Pricing model** | Pay-as-you-go credits (add $20 minimum + $1.23 fee) |
| **Auto-reload** | When balance < $5, auto-add $20 |
| **Free models** | `deepseek-v4-flash-free`, `big-pickle`, `mimo-v2.5-free`, `nemotron-3-ultra-free` (all $0) |
| **Card fee** | 4.4% + $0.30 per transaction passed at cost |
| **Workspace** | Currently free during beta (team pricing TBA) |

**Available models through Zen**:

| Model | Input $/1M | Output $/1M | Notes |
|-------|-----------|------------|-------|
| DeepSeek V4 Flash Free | $0 | $0 | Free tier, rate-limited |
| Big Pickle | $0 | $0 | Free tier |
| DeepSeek V4 Flash | $0.14 | $0.28 | Same as direct |
| GPT 5.4 Nano | $0.20 | $1.25 | Cheapest GPT |
| GPT 5.4 Mini | $0.75 | $4.50 | Good quality |
| Claude Sonnet 4.6 | $3.00 | $15.00 | Via Zen (no markup) |
| Gemini 3.5 Flash | $1.50 | $9.00 | Via Zen |

**Spanish support**: The free models (DeepSeek V4 Flash Free, Big Pickle) should support Spanish. DeepSeek models are strong in Spanish.

**Current limitation for this project**: Since `multi-ai-sdk`'s `embedChat()` does not accept a custom `baseUrl`, OpenCode Zen cannot be directly used as a drop-in replacement. Options to work around this:
1. Wait for/patch multi-ai-sdk to add `baseUrl` support to `embedChat()`
2. Use the `openai` provider if multi-ai-sdk adds baseUrl support
3. Build a custom chat widget instead of using embedChat
4. Use the `deepseek` provider directly (cheaper, natively supported)

**Recommendation**: Do NOT use OpenCode Zen as the primary until the SDK supports it. It's a viable fallback/alternative but requires SDK changes.

---

### 3. Keep Groq (Developer tier)

| Aspect | Details |
|--------|---------|
| **Provider name** | `"groq"` (native, currently working) |
| **Base URL** | `https://api.groq.com/openai/v1` |
| **Current model** | `llama-3.3-70b-versatile` |
| **Pricing** | $0.59/$0.79 per 1M tokens (Developer tier: 25% off = $0.44/$0.59) |
| **Free tier** | Still available as of June 2026 (30 RPM, 14.4K req/day) |
| **Developer tier** | Free upgrade (add CC) → 10x limits + 25% discount |
| **Spanish** | Excellent (Llama 3.3 70B) |
| **Code change** | None — just add a credit card to existing account |

---

## Comparison Matrix

| Criteria | DeepSeek V4 Flash | OpenCode Zen | Groq (keep) |
|----------|------------------|-------------|-------------|
| **multi-ai-sdk support** | ✅ Native (`deepseek`) | ❌ Not supported | ✅ Native (`groq`) |
| **Input cost / 1M** | $0.14 | Free (DeepSeek V4 Flash Free) | $0.59 ($0.44 dev tier) |
| **Output cost / 1M** | $0.28 | Free | $0.79 ($0.59 dev tier) |
| **Free tier** | Promotional credits | Yes (rate-limited) | Yes (rate-limited) |
| **Spanish quality** | ✅ Strong | ✅ DeepSeek models strong | ✅ Excellent |
| **Context length** | 1M tokens | Depends on model | 128K |
| **Setup effort** | Low (change 3 lines) | High (SDK doesn't support) | None (just add card) |
| **Rate limits** | 2500 RPM | Unknown | 30 RPM free / 300 RPM dev |
| **Deprecation risk** | Low (V4 is current gen) | Low | Low |

## Recommendation

### Primary: Keep Groq, upgrade to Developer tier

**Rationale**: The path of least resistance. The current integration works. Groq's Developer tier is free to upgrade (just add a credit card), provides 10x rate limits, and a 25% discount. For this low-traffic institutional chatbot, the monthly cost would be negligible (<$5/month).

**Cost estimate**: At ~100 conversations/day × ~500 tokens each = 50K tokens/day ≈ 1.5M tokens/month. At $0.59/$0.79 per 1M with 25% dev discount → ~$1.50/month.

### Fallback: DeepSeek V4 Flash

**Rationale**: Natively supported by multi-ai-sdk, requires only changing `provider` and `model` strings plus swapping env vars. Cheaper than Groq even after the dev tier discount. DeepSeek has strong Spanish performance.

**Caveat**: Must use `deepseek-v4-flash` model name (the `deepseek-chat` legacy alias is deprecated on 2026-07-24).

### When to use OpenCode Zen

**Only after** multi-ai-sdk adds support for custom base URLs in `embedChat()`, or if we move away from the embedChat widget entirely. The free models are attractive but the integration effort is currently too high.

## Code Changes Needed (for DeepSeek path)

If the user chooses DeepSeek as primary:

1. **`src/layouts/Layout.astro`** (line 38): Add `const deepseekKey = import.meta.env.DEEPSEEK_API_KEY ?? "";`
2. **`src/layouts/Layout.astro`** (line 223): Change `define:vars={{ groqKey, chatbotContext }}` to include both keys
3. **`src/layouts/Layout.astro`** (line 226): Change `provider: "groq"` to `provider: "deepseek"`
4. **`src/layouts/Layout.astro`** (line 239): Change `model: "llama-3.3-70b-versatile"` to `model: "deepseek-v4-flash"`
5. **`src/layouts/Layout.astro`** (line 227): Change `apiKey: groqKey` to `apiKey: deepseekKey`
6. **`.env.example`**: Add `DEEPSEEK_API_KEY=your-deepseek-key` (keep `GROQ_KEY` as fallback or remove)
7. **`.env`**: Add `DEEPSEEK_API_KEY` (user action)

No changes needed for the Grok keep+upgrade path.

## Risks

- **DeepSeek**: Legacy model names deprecate on 2026-07-24 — must update to `deepseek-v4-flash`
- **OpenCode Zen**: Currently NOT usable via embedChat without SDK changes
- **Groq**: If the user's free tier truly is ending (not just rate-limited), the Developer tier covers it
- **Spanish quality**: DeepSeek is good but may not match Llama 3.3 70B's Spanish fluency for Bolivian-specific content (regional terms, local company names)

## Ready for Proposal

**Yes.** Two clear paths:
1. **Keep Groq + Developer tier** (zero code changes, just add CC)
2. **Switch to DeepSeek** (3-line code change + env var)

OpenCode Zen is NOT recommended as the primary until the SDK supports it. Can be documented as a future option.

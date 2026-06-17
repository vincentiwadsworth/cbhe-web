# Delta for chatbot-message-rendering

## Zero-Delta Confirmation

This change is a pure provider swap (Groq → DeepSeek V4 Flash) in `src/layouts/Layout.astro`. It does not introduce, modify, remove, or rename any behavioral requirement in the `chatbot-message-rendering` specification.

| Requirement | Affected? | Rationale |
|---|---|---|
| Bold Markdown Rendering | No | Provider-agnostic — operates on response text post-generation |
| Streaming Content Processing | No | MutationObserver logic independent of LLM source |
| Idempotent Re-processing | No | DOM update logic unchanged |
| XSS Safety | No | HTML escaping is provider-agnostic |
| Residual Markdown Stripping | No | Post-processing unaffected by provider |
| Bullet Lists in Multi-Item Responses | No | Prompt-level formatting, unchanged |
| No Fabricated Content for Out-of-Scope Topics | No | Prompt-level guard, unchanged |
| No Repregunta on Out-of-Scope Topics | No | Prompt-level rule, unchanged |
| Spanish-Only Output | No | Prompt-level language rule, unchanged |
| Anti-Invention Guard | No | Prompt-level guard, unchanged |

**Conclusion**: All 10 existing requirements remain unchanged. The `chatbot-message-rendering` spec is stable — this change is a pure infrastructure/config swap with zero behavioral impact.

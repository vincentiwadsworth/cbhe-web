# Design: Fix Chatbot Bullets Regression

## File Under Change

`src/layouts/Layout.astro` — single file, no new modules, no new dependencies.

---

## Change 1: LISTAS Directive (Line 250)

**Remove** (line 250):
```
"Sin *, sin #, sin backticks, sin - para listas. Usá '1.' '2.' o el carácter • para listas.",
```

**Replace with**:
```
"LISTAS: Cuando listes 2+ items, usá • al inicio de cada línea. Ejemplo:\n• Item uno\n• Item dos\nNo uses - ni * ni # para listas. Numeración (1. 2.) solo para pasos o secuencias ordenadas.",
```

**Rationale**: The old rule was passive (what NOT to do) with an ambiguous "or" for alternatives. The new rule is active, states what TO do (`•` for lists), includes an inline example, and relegates numbered lists to sequential steps only. This directly addresses the root cause: the model avoids `-` (following the anti-hallucination strictness) but had no clear directive to use `•` instead.

---

## Decision: EJEMPLO Update (Lines 265–269)

**Choice: Option A — leave EJEMPLO unchanged.**

| Option | Tradeoff | Decision |
|--------|----------|----------|
| A: Keep numbered list in EJEMPLO | Consistent with spec ("numbered acceptable for ordered context"); single-line prompt change only | ✅ **Selected** |
| B: Replace with `•` example | More reinforcement of `•` pattern, but rewrites 5+ lines and adds tokens; the numbered example is not wrong | Rejected |

The spec (line 18–23) explicitly allows numbered lists as an acceptable alternative for ordered contexts. The EJEMPLO shows a simple list-of-entities, not a sequence of steps — numbered is semantically fine there. Keeping it unchanged also limits the scope to a single targeted line change.

---

## Post-Processor Verification

Line 332 regex:
```js
.replace(/^[\s]*[-\*]\s+/gm, "• ")
```

**Character class `[-\*]` matches only ASCII hyphen (`-`, U+002D) and ASCII asterisk (`*`, U+002A).**

It does **NOT** match:
- `•` (U+2022, BULLET) — passes through unchanged ✅
- `1.` (ASCII digit + period) — passes through unchanged ✅

**Verification confirmed**: If the model outputs `• Item` directly, it is not touched by the post-processor. The regression is purely a model behavior issue (it stopped producing list markers), not a post-processor defect.

---

## Token Budget Impact

| | Lines | Est. Tokens |
|---|-------|-------------|
| Current prompt (L244–L273) | 30 lines | ~720 |
| Old LISTAS rule (L250) | 1 line | ~17 |
| New LISTAS rule (L250) | 1 line | ~58 |
| **Net increase** | — | **~+41 tokens** |

**Estimated new total: ~761 tokens** — well under `maxTokens: 1024`. No risk.

---

## Rollback Plan

Single-line revert in `src/layouts/Layout.astro`:
```bash
git checkout -- src/layouts/Layout.astro
```
No data migrations. No schema changes. Zero-risk rollback.

---

## Verification Plan

| Step | Action | Expected Result |
|------|--------|-----------------|
| Build | `npx astro build` | 27 pages, no errors |
| Manual | Ask "¿Qué empresas son afiliadas?" | Summary + offer to deepen (unchanged) |
| Manual | Ask "Dame la lista de Servicios en Superficie" | `•` bullets, one per empresa |
| Manual | Ask "Dame la lista de cursos" | `•` bullets, one per curso |
| Manual | Ask "¿Qué hace Repsol?" | Prose response (no bullets needed, unchanged) |

---

## Out of Scope (Confirmed)

The following are **NOT** modified by this change:
- `normalizeAssistantText` regex (L332) — unchanged; already handles `•` correctly
- `formatBold` (L340–L345) — unchanged
- `formatUrls` (L348+) — unchanged
- `escapeHtmlPreservingNewlines` — unchanged
- Welcome message and `suggestedQuestions` — unchanged
- Model parameters (`temperature: 0.7`, `maxTokens: 1024`) — unchanged
- Provider (`groq`) and model (`llama-3.3-70b-versatile`) — unchanged
- Any other prompt rule in `REGLAS`, `CÓMO RESPONDER`, or `Fuente de verdad` — unchanged

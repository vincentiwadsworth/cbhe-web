# Exploration: Chatbot Bullets Regression

## Symptom

After the hallucination-fix commit (`315aef4`, archived at `795c122`), the chatbot stopped using bullet markers (`•`) in its responses. When listing items (empresas, categories, etc.), the model now outputs plain prose without any list structure.

## Relevant Files

| File | Lines | Role |
|------|-------|------|
| `src/layouts/Layout.astro` | 243–274 | System prompt (REGLAS, FORMATO, CÓMO RESPONDER) |
| `src/layouts/Layout.astro` | 321–336 | `normalizeAssistantText()` — post-processor regex |
| `src/layouts/Layout.astro` | 362–408 | `postProcessBubble()` — DOM observer integration |
| `openspec/specs/chatbot-message-rendering/spec.md` | 1–128 | Current spec (9 requirements) |
| `openspec/changes/archive/2026-06-08-fix-chatbot-hallucination/design.md` | 1–95 | Previous change — what was modified |
| `openspec/changes/archive/2026-06-08-fix-chatbot-hallucination/spec.md` | 1–67 | Delta spec for the hallucination fix |

## Root Cause Analysis

### What the post-processor does

The bullet conversion regex at line 332:
```js
.replace(/^[\s]*[-\*]\s+/gm, "• ")
```

This matches **only `-` and `*`** at line start, converting them to `• `. It does **NOT** match:
- `• ` (already a bullet — passes through unchanged)
- `1. ` (numbered lists — pass through unchanged)
- Plain prose (no list markers at all)

### What the system prompt says (lines 248–250)

```
"FORMATO: usá texto plano con saltos de línea. NO uses Markdown excepto **palabra** para enfatizar..."
"Sin *, sin #, sin backticks, sin - para listas. Usá '1.' '2.' o el carácter • para listas."
```

**This rule was NOT changed by the hallucination fix.** It existed identically before commit `315aef4`.

### Diagnosis

**Hypothesis 1 (most likely): The LLM became more rule-compliant after the hallucination fix and now strictly avoids `-` for lists.**

The hallucination fix added rules like "NUNCA inventes información" and stricter follow-up restrictions. The collateral effect: the model now follows ALL formatting rules more strictly. Since the prompt explicitly says "sin - para listas", the model stopped using `-` markers — which was the ONLY pattern the post-processor's regex could convert to `•`.

The model has two alternatives per the prompt:
1. Use `•` directly — this works, passes through the regex unchanged, renders fine
2. Use `1.` `2.` — works, renders as numbered list
3. Use plain prose — no list markers, no bullets

The model appears to be defaulting to option 3 (prose), likely because the "FORMATO: usá texto plano" instruction + "no Markdown" + "sin -" creates ambiguity about whether `•` is "Markdown" or not.

**Hypothesis 2: The `•` instruction is confusing to the LLM.**

The character `•` (U+2022) is not standard in most LLM training data as a list marker (most models use `-` or `*`). Asking it to produce a Unicode bullet character that the model rarely sees in training may result in it avoiding list formatting altogether.

**Hypothesis 3: The model uses `•` directly but the post-processor does something unexpected.**

If the model outputs `• ` directly, the regex doesn't match (it only matches `-` and `*`), so `•` passes through fine. This wouldn't cause bullets to disappear. So this hypothesis is unlikely unless the model is no longer using `•` either.

### Verdict

**Root cause is Hypothesis 1**: the LLM follows the prompt rules more strictly after the hallucination changes and avoids `-` for lists, but doesn't reliably use `• ` or `1.` instead. The result is plain prose without any list structure.

The post-processor is not broken — the model just isn't producing patterns that the regex can convert.

## Approaches

### Approach A: Add explicit "use `•` for lists" instruction to the system prompt

**Change**: Modify the format rule to explicitly instruct the model to use `•` for multi-item lists, with examples.

```js
"FORMATO: usá texto plano con saltos de línea. NO uses Markdown excepto **palabra** para enfatizar 1-3 palabras clave por respuesta.",
"LISTAS: Cuando listes múltiples items, usá el carácter • al inicio de cada línea. Ejemplo:\n• Item uno\n• Item dos\n• Item tres\nNo uses - ni * ni números para listas simples.",
```

- **Pros**: Fixes the root cause (model behavior), keeps post-processor as safety net
- **Cons**: Increases token budget (~40 extra tokens), may still not work if model avoids `•`
- **Effort**: Low — 2 lines changed in Layout.astro
- **Risk**: Low — prompt-only change, no code logic affected

### Approach B: Broaden the post-processor regex to also match `•` and numbered lists

**Change**: Update `normalizeAssistantText` to normalize both directions:
- Optionally convert `1. ` numbered lists to `• ` (if the goal is always bullets)
- Or better: keep numbered lists as-is, just ensure `• ` is preserved

No, the regex already passes `•` through. The issue is the model isn't producing ANY list markers.

**Better**: Add a regex that detects line-start patterns that look like list items (prose item followed by newline + similar-pattern item) and wraps them.

- **Pros**: Doesn't depend on model compliance
- **Cons**: Over-engineered, could match false positives (poetry, addresses)
- **Effort**: Medium
- **Risk**: Medium — heuristic regex could produce incorrect output

### Approach C: Both prompt + post-processor

**Change**: 
1. Fix the prompt to explicitly request `•` for lists (Approach A)
2. Add a regex that catches the model's fallback behavior: if the model uses no list markers but there are 3+ consecutive lines that look like list items (short, starting with a proper noun or category), add `•` prefixes

- **Pros**: Defense in depth
- **Cons**: More code, potential for false positives
- **Effort**: Medium
- **Risk**: Medium

## Recommendation

**Approach A (prompt-only)** is the best first step. It's low-risk, minimal code change, and addresses the root cause. If it doesn't resolve the issue, we can fall back to Approach C.

Specific prompt changes needed:
1. In the system prompt (line 249), modify the FORMATO and bullet rules
2. Add an explicit directive: when the model has 2+ items to list, it MUST use `•` at line start for each item
3. Consider adding an example of `•`-style list formatting to the EJEMPLO section

## Scope

- **Lines changed**: 2–4 lines in `src/layouts/Layout.astro`
- **Files touched**: 1 (`src/layouts/Layout.astro`)
- **Spec update needed**: Update spec requirement about list rendering (currently covered by markdown stripping, not list formatting)
- **Verification**: `npx astro build` + manual test asking "list all empresas in Servicios en Superficie"

## Risks

- The model may still not produce `•` reliably (it's a rare character in training data)
- The prompt token budget increases by ~40 tokens (current ~720, still well under 1024)
- If the model ignores the new rule, Approach C becomes necessary

## Ready for Proposal

**Yes.** The root cause is clear, the fix is low-risk, and the prompt-only approach can be proposed immediately. If it fails, the fallback is a combined prompt + regex approach.

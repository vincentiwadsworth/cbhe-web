# Proposal: Fix Chatbot Bullets Regression

## Intent

After the hallucination-fix commit (`315aef4`), the chatbot stopped using bullet markers (`•`) in list responses, defaulting to plain prose. The root cause: the model now follows the "sin - para listas" rule more strictly but doesn't reliably substitute `•` or `1.` instead. This change restores list formatting by explicitly instructing the model to use `•` for multi-item lists.

## Scope

### In Scope
- Add explicit `•` list instruction to the system prompt FORMATO section
- Optionally add a `•`-style list example to the EJEMPLO section
- Update spec with a new requirement for list formatting behavior

### Out of Scope
- Changes to the post-processor regex (`normalizeAssistantText`) — it already handles `•` correctly
- Model parameters (temperature, maxTokens, model selection)
- Provider or SDK configuration
- Welcome message or suggested questions
- Any changes to the hallucination guard rules added in the previous commit

## Capabilities

### Modified Capabilities
- `chatbot-message-rendering`: System prompt formatting rules — adding a new requirement about list marker usage (`•` for multi-item lists)

### New Capabilities
None — this change modifies existing prompt behavior within the same capability.

## Approach

**Approach A (prompt-only)** is selected. Approaches B (regex-only) and C (prompt + regex) are rejected because:
- B is unnecessary — the post-processor already passes `•` through correctly; the model simply isn't producing list markers
- C adds complexity without clear benefit; if A fails, C becomes a natural follow-up

Specific changes to `src/layouts/Layout.astro`:

1. **Line 249 (FORMATO)**: Keep as-is, no change needed to the bold/markdown rule.

2. **Line 250 (list instruction)**: Replace the current passive instruction:
   ```
   "Sin *, sin #, sin backticks, sin - para listas. Usá '1.' '2.' o el carácter • para listas."
   ```
   With an active directive that includes an example:
   ```
   "LISTAS: Cuando listes 2+ items, usá • al inicio de cada línea. Ejemplo:\n• Item uno\n• Item dos\nNo uses - ni * ni # para listas. Numeración (1. 2.) solo para pasos/secuencias."
   ```

3. **Lines 264-270 (EJEMPLO list)**: Optionally update the "Dame la lista de Servicios en Superficie" example to use `•` instead of `1.` `2.` to reinforce the pattern:
   ```
   Asistente: **Servicios en Superficie** (12 empresas):
   • BOLPEGAS S.R.L.
   • CARLOS CABALLERO S.A.
   • CONFIPETROL S.A. SUCURSAL BOLIVIA
   (sigue con el resto)
   ```

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/layouts/Layout.astro` (L250) | Modified | Replace passive list instruction with active `•` directive + example |
| `src/layouts/Layout.astro` (L265-269) | Modified (optional) | Update EJEMPLO list from numbered to `•` bullets |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Model still doesn't produce `•` (rare Unicode char in training) | Medium | If A fails after manual testing, escalate to Approach C (prompt + post-processor fallback) |
| Token budget increase (~40 tokens) | Low | Current ~720 tokens, well under 1024 maxTokens limit |
| `•` example in EJEMPLO conflicts with numbered list use case | Low | Clarify in prompt: `•` for simple lists, `1.` `2.` for sequences/steps |

## Rollback Plan

Revert the changes to `src/layouts/Layout.astro` systemPrompt (lines 250 and optionally 265-269). This is a 1-3 line change in a single file — full revert via `git checkout -- src/layouts/Layout.astro`.

## Dependencies

None — standalone change to a single file.

## Success Criteria

- [ ] `npx astro build` passes without errors
- [ ] When asked "list all empresas in Servicios en Superficie", the bot responds with `•` bullets (one per line)
- [ ] When asked for a numbered sequence (e.g., steps), the bot uses `1.` `2.` format
- [ ] Post-processor correctly renders `•` bullets in the DOM (no raw `•` artifacts)
- [ ] No regression in existing hallucination guard behavior

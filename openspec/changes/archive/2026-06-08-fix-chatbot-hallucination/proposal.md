# Proposal: Fix Chatbot Hallucination

## Intent

The CBHE chatbot invents lists, benefits, and process steps when users ask about topics outside its data scope (e.g., affiliation process, institutional benefits). The root cause: the system prompt's "always close with a question" rule forces the model to extend conversations beyond its knowledge, and the anti-invention guard only protects empresa names — not other factual claims. This change eliminates hallucination by fixing the prompt's guardrails. No new RAG data is added (follow-up concern).

## Scope

### In Scope
- Broaden anti-invention rule to cover ALL factual claims, not just empresa names
- Remove the "close with a question / repregunta" pattern from REGLAS
- Add Spanish-only output consistency rule
- Add "sí" guard clause for affirmative-only responses
- Update `welcomeMessage` and `suggestedQuestions` to not promise affiliation answers

### Out of Scope
- Adding affiliation requisitos/benefits to chatbot context (separate follow-up)
- Creating new Astro content collections (afiliacion)
- Adding articles/testimonios/institutional data to chatbot context
- Sveltia CMS configuration changes
- Message rendering changes (already spec'd separately)

## Capabilities

### Modified Capabilities
- `chatbot-message-rendering`: System prompt guardrails for hallucination prevention — rules for anti-invention scope, repregunta behavior, language consistency, and affirmative-only response handling are changing

### New Capabilities
None — this change modifies existing prompt rules only.

## Approach

Modify the `systemPrompt` array in `src/layouts/Layout.astro` (lines 244-273). Make 4 targeted changes to the REGLAS section:

1. **Anti-invention**: Replace `"No inventes nombres de empresas que no estén en la lista."` with a broader rule covering ALL data not in context
2. **Repregunta**: Remove the `"Una sola pregunta de cierre…"` rule entirely; replace with a prohibition on follow-up questions for out-of-scope topics
3. **Spanish-only**: Add rule enforcing consistent Spanish output (no English words mid-sentence)
4. **"Sí" guard**: Add rule preventing assumption that "sí" means "tell me more"

Also update `welcomeMessage` (line 233) to remove promises about affiliation data the bot can't deliver.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/layouts/Layout.astro` (L244-273) | Modified | System prompt REGLAS section — 4 rule changes |
| `src/layouts/Layout.astro` (L233) | Modified | `welcomeMessage` — remove affiliation promise |
| `src/layouts/Layout.astro` (L234-238) | Modified | `suggestedQuestions` — remove "¿Cómo me afilio?" |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Overly aggressive "no inventes" makes bot too passive | Low | Rule permits synthesis from context data; only prohibits inventing facts |
| "No repreguntas" makes bot feel abrupt | Low | Bot still answers naturally; it just won't force follow-ups on unknown topics |
| System prompt changes break existing good responses | Low | Verify with current examples + typical queries via `npx astro build` |

## Rollback Plan

Revert the changes to `src/layouts/Layout.astro` systemPrompt and welcomeMessage. This is a ~15-line change in a single file — full revert via `git checkout -- src/layouts/Layout.astro`.

## Dependencies

None — standalone change to a single file.

## Success Criteria

- [ ] `npx astro build` passes without errors
- [ ] Bot refuses to invent affiliation benefits/process steps when asked "¿Cómo me afilio?"
- [ ] Bot does not ask follow-up questions about topics outside its data scope
- [ ] Bot output stays entirely in Spanish
- [ ] Bot does not interpret "sí" as a request for more information

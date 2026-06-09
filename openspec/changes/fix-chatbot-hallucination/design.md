# Design: Fix Chatbot Hallucination

## File

`src/layouts/Layout.astro` — single file, no new modules.

## Changes Overview

Modify the `systemPrompt` array (lines 244-273) and `welcomeMessage` (line 233). Four rule changes in REGLAS, one UX text change.

---

## Change 1: Broaden Anti-Invention Rule

**Remove** (line 249):
```
"No inventes nombres de empresas que no estén en la lista.",
```

**Replace with**:
```
"NUNCA inventes información. Si no tenés datos sobre un tema específico en la 'Fuente de verdad', no inventes listas, beneficios, procesos ni ningún hecho. Informá que no tenés esa información y sugerí contactar a cbhe@cbhe.org.bo.",
```

## Change 2: Remove Repregunta Pattern

**Remove** (line 252):
```
"Una sola pregunta de cierre, corta y específica. No repitas la pregunta ya implícita en la oferta de profundizar.",
```

**Replace with**:
```
"No hagas preguntas de seguimiento ('¿te gustaría saber más?', '¿te interesa alguna categoría?') cuando el tema está fuera de tu alcance. Respondé solo la pregunta del usuario y terminá. Si el usuario quiere más información, él/ella va a preguntar.",
```

## Change 3: Add Spanish-Only Rule

**Add after the format rule** (insert after line 251):
```
"Respondé SIEMPRE en español neutro. No mezcles palabras en inglés con español. Las únicas excepciones son siglas técnicas estándar (URL, API, PDF).",
```

## Change 4: Add "Sí" Guard Clause

**Add after the new Spanish-only rule**:
```
"Si el usuario responde 'sí' a una pregunta tuya, no asumas que quiere más información. Tomalo como confirmación de que leyó tu respuesta y terminá ahí.",
```

---

## Change 5: Fix Welcome Message

**Before** (line 233):
```js
welcomeMessage: "¡Hola! Preguntame sobre las empresas afiliadas, capacitaciones o cómo afiliarte a la CBHE.",
```

**After**:
```js
welcomeMessage: "¡Hola! Preguntame sobre las empresas afiliadas o las capacitaciones de la CBHE.",
```

Also remove `"¿Cómo me afilio?"` from `suggestedQuestions` (lines 235-238):
```js
suggestedQuestions: [
  "¿Qué empresas son afiliadas?",
  "¿Qué capacitaciones ofrecen?",
],
```

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Prompt-only, no data expansion | Keeps scope tight; affiliation data can ship separately without blocking this fix |
| Remove repregunta entirely (not just narrow) | The pattern of "offer to deep-dive" is what enables hallucination on unknown topics — removing it completely is safer than conditional logic |
| Spanish-only as explicit rule | Observed production behavior shows English words leaking mid-sentence; explicit prohibition fixes this |
| "Sí" guard as separate rule | The observed hallucination chain is: bot asks "¿te interesa X?" → user says "sí" → bot invents content. Breaking the chain at the "sí" interpretation point is critical |
| Welcome message change | Without affiliation data, promising "cómo afiliarte" creates false expectations |
| Keep temperature at 0.7 | Hallucination is a prompt problem, not a temperature problem — no need to reduce response quality |

## Token Budget

Current prompt (lines 244-273): ~650 tokens estimated. After changes: ~720 tokens. Still well under the 1024 `maxTokens` limit. Negligible cost increase.

## Verification

- `npx astro build` — primary quality gate
- Manual: deploy preview, ask "¿Cómo me afilio?" — verify refusal + email redirect
- Manual: ask "¿Qué empresas hay?" — verify existing good response preserved
- Manual: reply "sí" to a follow-up — verify bot doesn't continue inventing

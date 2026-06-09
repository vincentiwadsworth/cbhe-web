# Tasks: Fix Chatbot Hallucination

> Estimated total changes: ~15 lines in `src/layouts/Layout.astro` (single file).
> Review budget: Low (single file, ~15 lines, single PR).
> Decision needed before apply: No
> Chained PRs recommended: No
> 400-line budget risk: Low

## Task 1: Remove Repregunta Rule from REGLAS [x]

**File**: `src/layouts/Layout.astro`, line 252

**Change**: Replace the existing "close with a question" rule with a prohibition on follow-up questions for out-of-scope topics.

**Before**:
```
"Una sola pregunta de cierre, corta y específica. No repitas la pregunta ya implícita en la oferta de profundizar.",
```

**After**:
```
"No hagas preguntas de seguimiento ('¿te gustaría saber más?', '¿te interesa alguna categoría?') cuando el tema está fuera de tu alcance. Respondé solo la pregunta del usuario y terminá. Si el usuario quiere más información, él/ella va a preguntar.",
```

**Lines changed**: 1 (replaced)
**Reviewable**: Yes — single rule replacement, clear intent
**Test**: Ask "¿Cómo me afilio?" → bot should refuse without follow-up

---

## Task 2: Broaden Anti-Invention Guard [x]

**File**: `src/layouts/Layout.astro`, line 249

**Change**: Replace narrow empresa-name-only guard with a comprehensive anti-invention rule covering all factual claims.

**Before**:
```
"No inventes nombres de empresas que no estén en la lista.",
```

**After**:
```
"NUNCA inventes información. Si no tenés datos sobre un tema específico en la 'Fuente de verdad', no inventes listas, beneficios, procesos ni ningún hecho. Informá que no tenés esa información y sugerí contactar a cbhe@cbhe.org.bo.",
```

**Lines changed**: 1 (replaced)
**Reviewable**: Yes — single rule replacement, scope clearly expanded
**Test**: Ask "¿Cuáles son los beneficios de afiliarse?" → bot refuses with email redirect

---

## Task 3: Add Spanish-Only and "Sí" Guard Rules [x]

**File**: `src/layouts/Layout.astro`, between lines 251 and 252 (after format rule, before response strategy)

**Change**: Insert two new rules into the REGLAS section:
1. Spanish-only output (no English mid-sentence)
2. "Sí" guard clause (don't assume "sí" means "tell me more")

**Add**:
```
"Respondé SIEMPRE en español neutro. No mezcles palabras en inglés con español. Las únicas excepciones son siglas técnicas estándar (URL, API, PDF).",
"Si el usuario responde 'sí' a una pregunta tuya, no asumas que quiere más información. Tomalo como confirmación de que leyó tu respuesta y terminá ahí.",
```

**Lines changed**: 2 (added)
**Reviewable**: Yes — two new rules, self-contained
**Test**: 
- Ask in Spanish → verify response has no English words
- Reply "sí" to a question → verify bot ends conversation

---

## Task 4: Fix Welcome Message and Suggested Questions [x]

**File**: `src/layouts/Layout.astro`, lines 233-238

**Change**: Remove "cómo afiliarte" from `welcomeMessage` and remove "¿Cómo me afilio?" from `suggestedQuestions`.

**Before**:
```js
welcomeMessage: "¡Hola! Preguntame sobre las empresas afiliadas, capacitaciones o cómo afiliarte a la CBHE.",
suggestedQuestions: [
  "¿Qué empresas son afiliadas?",
  "¿Cómo me afilio?",
  "¿Qué capacitaciones ofrecen?",
],
```

**After**:
```js
welcomeMessage: "¡Hola! Preguntame sobre las empresas afiliadas o las capacitaciones de la CBHE.",
suggestedQuestions: [
  "¿Qué empresas son afiliadas?",
  "¿Qué capacitaciones ofrecen?",
],
```

**Lines changed**: 4 (modified)
**Reviewable**: Yes — UX text change, aligns welcome with actual capabilities
**Test**: Bot loads → welcome message doesn't mention affiliation

---

## Task 5: Build Verification [x]

**Command**: `npx astro build`

**Checklist**:
- [x] Build passes with no errors
- [x] No TypeScript errors (`npx astro check`)
- [x] `dist/` output inspected for Layout.astro changes reflected in HTML
- [ ] Manual: deploy preview and test scenarios from spec (post-commit)

**Lines changed**: 0 (verification only)
**Reviewable**: Yes — build pass is binary pass/fail

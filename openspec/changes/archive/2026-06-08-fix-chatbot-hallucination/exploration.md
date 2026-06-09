## Exploration: fix-chatbot-hallucination

### Current State

The CBHE chatbot (Groq-powered, `llama-3.3-70b-versatile`, embedded via multi-ai-sdk in `src/layouts/Layout.astro`) builds its knowledge base from two Astro content collections:

1. **`empresas` collection** → `empresasContext` — 51 companies across 6 groups, each with name, website, description
2. **`cursos` collection** → `cursosContext` — courses with title, category, modality, dates, price, description

These are concatenated into `chatbotContext` and injected into the system prompt as `"Fuente de verdad:\n"`.

The system prompt (lines 244-273) contains:
- Identity: "Sos el asistente virtual de la CBHE"
- Anti-invention rule: "No inventes nombres de empresas que no estén en la lista."
- Format rules: plain text, no Markdown except `**bold**`
- Close rule: "Una sola pregunta de cierre, corta y específica. No repitas la pregunta ya implícita en la oferta de profundizar."
- Response strategy: broad questions → summary + offer to deep-dive; specific questions → full detail
- Three static examples (companies, categories)
- Fallback: "Si no sabés algo, sugerí contactar a cbhe@cbhe.org.bo."

The welcome message PROMISES three capabilities: "Preguntame sobre las empresas afiliadas, capacitaciones o **cómo afiliarte a la CBHE**." — and "¿Cómo me afilio?" is one of three suggested questions.

---

### Affected Areas

| File | Role |
|------|------|
| `src/layouts/Layout.astro` (lines 38-77) | Chatbot context construction — only pulls `empresas` + `cursos` collections |
| `src/layouts/Layout.astro` (lines 244-273) | System prompt — rules and guardrails |
| `src/layouts/Layout.astro` (line 233) | `welcomeMessage` — promises "cómo afiliarte" capability |
| `src/layouts/Layout.astro` (lines 234-238) | `suggestedQuestions` — includes "¿Cómo me afilio?" |
| `src/pages/afiliacion.astro` | Static page with 5 affiliation requisitos — **NOT** in chatbot context |
| `src/pages/index.astro` (lines 346-379) | Homepage affiliation section with 2 benefits — **NOT** in chatbot context |
| `src/content.config.ts` | Content collections — no `afiliacion` collection exists |
| `openspec/specs/chatbot-message-rendering/spec.md` | Existing spec for message rendering (bold/XSS/streaming) — not directly related to hallucination but shares the `Layout.astro` file |

---

### Key Findings

#### 1. What IS in `chatbotContext` vs what's missing?

**IN `chatbotContext`:**
- ✅ 51 empresas with names, websites, descriptions, grouped by 6 categories
- ✅ All cursos with title, category, modality, dates, price, description snippets

**NOT in `chatbotContext`:**
- ❌ Affiliation process data — none of the 5 requisitos (a-e) from `/afiliacion`
- ❌ Affiliation benefits — none of the 2 benefits from the homepage section
- ❌ Institutional CBHE data — mission, values, history from `/quienes-somos`
- ❌ Articles/news from `articulos` content collection
- ❌ Testimonios content
- ❌ Contact info (beyond the fallback email in the system prompt)

The chatbot literally has ZERO data about affiliation — when asked "¿Cómo me afilio?" it has nothing in its "Fuente de verdad" to ground a response.

#### 2. Is there affiliation data in the repo that could be ADDED to `chatbotContext`?

**Yes, but it's hardcoded in Astro pages, NOT in a content collection:**

| Source | Data Type | Content |
|--------|-----------|---------|
| `src/pages/afiliacion.astro` (lines 9-45) | 5 structured requisitos (a-e) | Solicitud formal de ingreso, Adhesión al marco normativo, Cumplimiento legal y operativo, Aprobación del directorio, Compromiso financiero — each with full description |
| `src/pages/afiliacion.astro` (lines 97-111) | Proceso de revisión note | "Directorio evalúa, voto favorable de 2/3, equipo acompaña" |
| `src/pages/index.astro` (lines 354-369) | 2 benefits | Representación sectorial + Actualización técnica with descriptions |

There is NO `src/content/afiliacion/` content collection. The data only exists as frontmatter constants in `.astro` pages.

#### 3. Should we add the missing data (extend the RAG) or change the system prompt to refuse out-of-scope questions?

**Both are needed — they address different aspects of the hallucination.**

**Option A: Add data only**
- Pros: The welcome message already promises "cómo afiliarte" — so the chatbot SHOULD answer this. Adding data fixes the root gap.
- Cons: Won't prevent future hallucinations about OTHER topics not yet in context. Doesn't fix the repregunta pattern.

**Option B: Change system prompt only**
- Pros: Prevents ALL out-of-context hallucinations. Faster to deploy.
- Cons: The welcome message and suggested questions still PROMISE affiliation answers — the chatbot would need to say "no sé" to things it advertised.

**Option C: Add data + fix system prompt (RECOMMENDED)**
- Pros: Fixes the specific gap (affiliation has real content to pipe in) AND adds general hallucination guards for everything else. Eliminates endless repreguntas.
- Cons: Slightly more work, but each part is small.

#### 4. What is the minimum system prompt change to eliminate the hallucination pattern?

**Four specific changes needed:**

1. **Anti-invention rule is too narrow** — change from:
   > "No inventes nombres de empresas que no estén en la lista."
   
   To something like:
   > "NUNCA inventes información. Si no tenés datos sobre un tema específico en el contexto provisto, no lo inventes. Informá que no tenés esa información y sugerí contactar a cbhe@cbhe.org.bo."

2. **Repregunta rule backfires** — change from:
   > "Una sola pregunta de cierre, corta y específica. No repitas la pregunta ya implícita en la oferta de profundizar."
   
   To something like:
   > "NO hagas preguntas de seguimiento. Respondé solo la pregunta del usuario y termina. Si el usuario quiere más información, él/ella va a preguntar."

3. **Add language consistency rule**:
   > "Respondé SIEMPRE en español neutro. No mezcles palabras en inglés con español."

4. **Add "sí" guard clause** (the specific pattern observed):
   > "Si el usuario responde 'sí' a una pregunta tuya, no asumas que quiere más información. Tomalo como confirmación de que leyó tu respuesta y termina ahí."

These four changes together are ~5 lines of system prompt edits — minimal risk, maximal impact.

#### 5. Are there related pages whose content could be piped into the context?

| Page | URL | Extractable Data | Format |
|------|-----|-----------------|--------|
| `/afiliacion` | `src/pages/afiliacion.astro` | 5 requisitos (a-e) with full descriptions + proceso de revisión | Array of objects in frontmatter |
| Homepage `#afiliacion` section | `src/pages/index.astro` | 2 benefits with descriptions | Inline JSX |

Both are hardcoded in `.astro` files, not content collections. The simplest path is to extract the data directly in `Layout.astro` either by:
- (a) Defining the requisitos/beneficios as constants in `Layout.astro` similar to `grupoLabels`
- (b) Creating an `afiliacion` content collection that both the page and the chatbot can consume (more architecture, cleaner)

---

### Approaches

1. **Prompt-only fix** — Modify system prompt rules (4 specific changes)
   - Pros: Fastest (5 lines changed), zero data maintenance, prevents ALL hallucinations not just affiliation
   - Cons: The welcomeMessage still promises affiliation answers it can't deliver; user asks "¿Cómo me afilio?" → bot says "no sé"
   - Effort: Low

2. **Data-only fix** — Extract hardcoded affiliation data into `chatbotContext`
   - Pros: Fills the specific knowledge gap; the bot can actually answer "¿Cómo me afilio?"
   - Cons: Doesn't fix repreguntas or English mixing; doesn't protect against future missing topics
   - Effort: Medium

3. **Data + Prompt fix (RECOMMENDED)** — Add affiliation context AND fix system prompt rules
   - Pros: Fixes the immediate gap, prevents future hallucinations, eliminates repreguntas
   - Cons: Slightly more work than each alone
   - Effort: Low-Medium

4. **Full content collection refactor** — Create `afiliacion` content collection, refactor page + chatbot
   - Pros: Cleanest architecture, DRY, Sveltia CMS editable
   - Cons: Over-engineered for 5 requisitos + 2 benefits; new content collection means schema + CMS config changes
   - Effort: Medium-High

---

### Recommendation

**Approach 3: Data + Prompt fix** — for these reasons:

1. The welcomeMessage literally promises "cómo afiliarte" — removing that promise (approach 1 alone) degrades UX
2. The affiliation data EXISTS and is structured — it's just not piped into the chatbot context
3. The system prompt has EXPLICIT flaws that cause the hallucination patterns — they're fixable independently
4. Both changes are small, low-risk, independently testable

The work splits naturally:
1. Extract `requisitos` array + `beneficios` from hardcoded page data, add to `chatbotContext` builder
2. Fix system prompt: anti-invention scope, repregunta rule, Spanish-only rule, "sí" guard
3. Remove or keep `welcomeMessage` / `suggestedQuestions` as-is (they become truthful once data is added)
4. Verify with `npx astro build`

---

### Risks

- **Risk**: Adding affiliation context increases token usage per request. Mitigation: affiliation data is small (~500 chars), negligible impact.
- **Risk**: Overly aggressive "NO inventes" rule might make the chatbot too passive (refuses to synthesize from what it DOES have). Mitigation: the current examples show good synthesis for companies/courses — the rule should only prohibit inventing FACTS not in context.
- **Risk**: The "no repreguntas" rule might make the bot feel abrupt for users who DO want follow-up. Mitigation: the examples already show "¿Te interesa alguna categoría en particular?" — the fix should end the endless loop without removing all helpful follow-ups. The key is: only ask a follow-up if the user's question was broad and there's a natural next step WITH data.
- **Risk**: Changing system prompt could affect existing good responses. Mitigation: test with the 3 examples already in the system prompt + typical queries.

### Ready for Proposal

Yes. The exploration is complete and clear. Recommended next phase: **sdd-propose** to formalize scope, approach, and specific changes.

**Proposed scope summary for the proposal:**
- In scope: (a) Pipe affiliation data from hardcoded page sources into `chatbotContext`, (b) Fix system prompt guardrails (4 specific rules), (c) Remove or verify `welcomeMessage` / `suggestedQuestions` accuracy
- Out of scope: New content collections, Sveltia CMS config changes, adding articles/testimonios to chatbot context, message rendering changes (already spec'd separately)

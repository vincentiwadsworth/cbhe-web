# Chatbot Message Rendering Specification

## Purpose

Defines how assistant messages from the LLM-powered chatbot are processed and rendered in the DOM — specifically how markdown emphasis (`**word**`) is converted to styled HTML (`<strong>word</strong>`) while remaining XSS-safe.

## Requirements

### Requirement: Bold Markdown Rendering

Assistant messages containing `**word**` syntax MUST render `word` as bold (`<strong>`) in the DOM. The `**` markers MUST NOT appear in the final rendered output.

#### Scenario: Bold renders correctly in streamed message
- GIVEN an assistant bubble with no prior `<span.sgq-msg-normalized>` element
- WHEN the SDK streams a response containing `**empresas afiliadas**`
- THEN the rendered output shows "empresas afiliadas" as bold
- AND no literal `**` characters are visible

#### Scenario: Multiple bold phrases in one message
- GIVEN an assistant message with text `Primero **esto** y luego **aquello**`
- WHEN the message is rendered
- THEN both "esto" and "aquello" are wrapped in `<strong>` independently

### Requirement: Streaming Content Processing

The post-processor MUST handle the SDK's streaming DOM pattern where text nodes are removed and re-created (not mutated in-place) per chunk. The observer MUST detect these replacements and re-process the bubble.

#### Scenario: Observer fires on text node replacement
- GIVEN an assistant bubble with existing `<span.sgq-msg-normalized>` content
- WHEN the SDK removes the previous text node and inserts a new one with updated content
- THEN the MutationObserver fires a `childList` mutation
- AND `postProcessBubble` re-processes the bubble within 300ms

#### Scenario: Stream progression shows formatted content
- GIVEN a streaming assistant response with bold markers
- WHEN each chunk arrives and the SDK updates the text node
- THEN the displayed content stays formatted (bold renders progressively)
- AND no raw markdown flashes are visible at any point

### Requirement: Idempotent Re-processing

Calling `postProcessBubble` on a bubble that already has a `<span.sgq-msg-normalized>` element MUST update the existing span rather than creating duplicate formatted spans.

#### Scenario: Duplicate spans prevented
- GIVEN a bubble with an existing `<span.sgq-msg-normalized>`
- WHEN `postProcessBubble` runs again
- THEN only one `<span.sgq-msg-normalized>` exists in the bubble
- AND stray raw text nodes (added by SDK post-formatting) are removed

### Requirement: XSS Safety

The post-processor MUST escape HTML entities (`<`, `>`, `&`) in user content before applying markdown formatting. The only HTML tags allowed in output are `<strong>`, `<br>`, and `<a>` (for URLs).

#### Scenario: HTML in message escaped
- GIVEN an assistant message containing `<script>alert("xss")</script>`
- WHEN the message is rendered
- THEN the output shows the literal text without executing the script

### Requirement: Residual Markdown Stripping

Any residual markdown syntax that survives bold conversion MUST be stripped from the final output. Specifically, unmatched `**` markers (odd number) MUST be removed.

#### Scenario: Unmatched bold markers stripped
- GIVEN an assistant message with unmatched `**text`
- WHEN the message is rendered
- THEN "text" is shown without the leading `**`

### Requirement: Bullet Lists in Multi-Item Responses

The chatbot MUST format multi-item responses (2+ items) using the bullet character `•` (U+2022) at the start of each list item line, with one item per line. This applies to ANY response that lists 2 or more items (empresas, cursos, categorías, etc.). Single-item responses and prose-only responses do not need bullets.

#### Scenario: Multi-item list uses • markers
- GIVEN the chatbot context contains 12 empresas in "Servicios en Superficie"
- WHEN a user asks "Dame la lista de Servicios en Superficie"
- THEN the assistant's response contains `•` at the start of each empresa name on its own line
- AND no `-` or `*` markers are used for the list

#### Scenario: Numbered list alternative acceptable for ordered context
- GIVEN the chatbot decides to use a numbered list (1., 2., 3.) for an ordered sequence
- WHEN the response is rendered
- THEN numbered markers pass through to the DOM as text
- AND no `-` or `*` markers appear in the output (post-processor strips these)

#### Scenario: Prose-only response unchanged
- GIVEN the user asks "¿Qué hace Repsol?" (single empresa, detail question)
- WHEN the assistant responds with prose (not a list)
- THEN no bullet markers are required
- AND the response renders without any list structure

---

### Requirement: No Fabricated Content for Out-of-Scope Topics

The chatbot MUST NOT invent lists, benefits, process steps, or any factual claims about topics not present in its `chatbotContext` (the "Fuente de verdad"). When asked about a topic for which no data exists in context, it MUST state "No tengo esa información" and redirect the user to email `cbhe@cbhe.org.bo`.

#### Scenario: Affiliation question without data triggers refusal
- GIVEN the chatbot has no affiliation data in its `chatbotContext`
- WHEN a user asks "¿Cómo me afilio a la CBHE?"
- THEN the assistant responds with something equivalent to "No tengo información sobre ese tema. Contactá a cbhe@cbhe.org.bo para más detalles."
- AND the assistant does NOT list fabricated steps, requisitos, or benefits

#### Scenario: General out-of-scope question
- GIVEN the chatbot context contains only empresas and cursos data
- WHEN a user asks about "beneficios de afiliación" or "misión de la CBHE"
- THEN the assistant DOES NOT invent data
- AND the response includes the refusal pattern and email redirect

### Requirement: No Repregunta on Out-of-Scope Topics

The chatbot MUST NOT ask follow-up questions ("repreguntas") when the user's query is about a topic outside the chatbot's data scope. The "always close with a question" pattern is REMOVED. If the user asks about in-scope data (empresas, cursos) and the response is a summary, the bot MAY offer one specific follow-up that it has data for — never for out-of-scope topics.

#### Scenario: No follow-up after out-of-scope refusal
- GIVEN the assistant has refused to answer an out-of-scope question
- WHEN the assistant finishes its refusal response
- THEN the response ends without any follow-up or "¿Te gustaría saber más?" type question

#### Scenario: Follow-up allowed for in-scope broad question
- GIVEN the chatbot context includes course data
- WHEN a user asks "¿Qué capacitaciones ofrecen?"
- THEN the assistant MAY offer a specific follow-up like "¿Te interesa alguna categoría en particular?"
- AND that follow-up MUST be based on actual data in context

### Requirement: Spanish-Only Output

The chatbot MUST respond entirely in neutral Spanish. Mixing English words or phrases mid-sentence (e.g., "Estos son los main benefits...") is PROHIBITED. Standard technical abbreviations (URL, API, PDF) are allowed.

#### Scenario: English words not mixed in response
- GIVEN a user asks a question in Spanish
- WHEN the assistant generates a response
- THEN all words in the response are Spanish (except standard abbreviations)
- AND no English-to-Spanish code-switching occurs mid-sentence

### Requirement: Anti-Invention Guard

Replaces the existing code-level rule `"No inventes nombres de empresas que no estén en la lista."`. The new rule MUST:
- Cover ALL factual claims, not just empresa names
- Explicitly forbid inventing lists, benefits, processes, steps, or any data not present in the "Fuente de verdad"
- Include the mandatory refusal + email redirect pattern

#### Scenario: Empresa name protection still works
- GIVEN a user asks about a non-existent empresa "PetroBol"
- WHEN the system checks against its empresa list
- THEN the assistant refuses to confirm or describe "PetroBol"
- AND responds with "No tengo información sobre esa empresa"

#### Scenario: Benefit/process invention prevented
- GIVEN the chatbot has no affiliation benefits in context
- WHEN a user asks "¿Cuáles son los beneficios de afiliarse?"
- THEN the assistant does NOT list made-up benefits
- AND responds with the refusal pattern

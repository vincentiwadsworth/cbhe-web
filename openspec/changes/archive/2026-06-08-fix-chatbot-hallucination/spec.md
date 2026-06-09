# Chatbot Message Rendering — Delta Spec

> Delta spec for the `chatbot-message-rendering` capability. These requirements ADD to and MODIFY the existing spec at `openspec/specs/chatbot-message-rendering/spec.md`.

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Anti-Invention Guard (Replaces existing "No inventes nombres de empresas")

The existing anti-invention rule (`"No inventes nombres de empresas que no estén en la lista."`) is REPLACED. The new rule MUST:
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

# Chatbot Message Rendering — Delta Spec

> Delta spec for the `chatbot-message-rendering` capability. These requirements ADD to the existing spec at `openspec/specs/chatbot-message-rendering/spec.md`.

## ADDED Requirements

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

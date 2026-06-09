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

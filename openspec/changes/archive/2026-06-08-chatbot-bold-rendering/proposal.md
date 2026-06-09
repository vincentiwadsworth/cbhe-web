# Proposal: Chatbot Bold Rendering

## Intent

Fix the chatbot's bold markdown rendering: user sees literal `**` asterisks in assistant messages instead of bold text. The LLM uses `**word**` for emphasis (1–3 keywords per response), but the post-processor that converts them to `<strong>` never fires on streamed content.

## Scope

### In Scope
- Fix MutationObserver to detect text node additions from streaming SDK
- Make `postProcessBubble` idempotent (handle re-processing without duplicates)
- Strip residual markdown artifacts from final output

### Out of Scope
- Custom chat widget using `AIClient` directly (deferred medium-term investment)
- SDK fork or vendor of `multi-ai-sdk`
- Any formatting beyond bold (links, lists, code blocks)

## Capabilities

### New Capabilities
- `chatbot-message-rendering`: Requirements for how assistant messages are processed and rendered, including bold markdown support

### Modified Capabilities
- None

## Approach

Two surgical changes to the existing post-processor in `src/layouts/Layout.astro`:

1. **Fix `childList` handler**: Process text nodes (`nodeType === 3`) too — walk up to find the parent `.sgq-msg.assistant` bubble
2. **Make `postProcessBubble` idempotent**: If `<span.sgq-msg-normalized>` exists, update its `innerHTML` and remove stray raw text nodes the SDK added post-formatting

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/layouts/Layout.astro` (lines 414–448) | Modified | MutationObserver `childList` handler |
| `src/layouts/Layout.astro` (lines 358–395) | Modified | `postProcessBubble` function |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Observer race: SDK adds raw text after formatting | Med | Aggressive debounce (300ms+) + remove stray text nodes |
| Performance: regex on every stream chunk | Low | Debounce + idempotent span (no re-creation) |

## Rollback Plan

Undo the two code changes in Layout.astro. The original behavior (`\*\*` shown literally) is already the current state, so rollback is safe and immediate.

## Dependencies

- None (purely client-side JS in `is:inline` script)

## Success Criteria

- [ ] Assistant messages render `**word**` as bold without showing literal `**`
- [ ] Normal text (no markdown) passes through unchanged
- [ ] Streaming updates show progressively formatted content (not flashes of raw markdown)
- [ ] `npx astro build` passes

# Tasks: Chatbot Bold Rendering

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~25–40 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

## Phase 1: Fix MutationObserver Blind Spot

- [x] 1.1 In `src/layouts/Layout.astro`, add a `nodeType === 3` branch to the `childList` handler (after the existing `nodeType === 1` block), walking up `node.parentElement?.closest(".sgq-msg.assistant")` and scheduling a debounced `postProcessBubble` call

## Phase 2: Make postProcessBubble Idempotent

- [x] 2.1 In `src/layouts/Layout.astro`, guard `postProcessBubble` to check for existing `<span.sgq-msg-normalized>` — if found, update `innerHTML` and remove stray raw text nodes instead of rebuilding from scratch
- [x] 2.2 Add `lastRaw` data attribute tracking to prevent redundant processing of unchanged content

## Phase 3: Verification

- [x] 3.1 Run `npx astro build` and confirm no syntax or type errors
- [ ] 3.2 Manual QA: open chatbot, send message with `**bold**` markers, inspect DOM for correct `<strong>` rendering and absence of duplicate spans

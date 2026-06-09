# Design: Chatbot Bold Rendering

## Technical Approach

Two surgical changes to `src/layouts/Layout.astro`. No new files, no new dependencies, no architecture change. The existing post-processor and observer structure stays — we fix the observer's blind spot and make the processor resilient to SDK interference.

## Architecture Decisions

### Decision: Keep existing observer structure

**Choice**: Fix the existing MutationObserver handler rather than rewriting as a polling-based or custom widget approach
**Alternatives considered**: Polling `textContent` on interval (wasteful), custom widget using `AIClient` (high effort)
**Rationale**: The observer is already there and working for initial bubble detection. Only the streaming path is broken. Two targeted fixes avoid touching the SDK, the markup, or the widget initialization.

### Decision: Idempotent span, not re-create

**Choice**: If `<span.sgq-msg-normalized>` already exists, update `innerHTML` and remove stray text nodes instead of destroying and rebuilding
**Rationale**: The SDK adds a new raw text node after each chunk. If we destroy the span and re-create it, we lose the reference and the observer fires again unnecessarily. Updating in-place is cheaper and avoids a reflow cascade.

## Data Flow

```
SDK chunk arrives
    │
    ▼
embed.ts: remove old textNode, create new textNode(fullContent)
    │
    ▼
childList mutation fires (added textNode, removed textNode)
    │
    ▼
[FIX 1] Observer handler now checks nodeType === 3 too
    walks up: .parentElement?.closest(".sgq-msg.assistant")
    │
    ▼
postProcessBubble(bubble) with 200ms debounce
    │
    ├─ <span.sgq-msg-normalized> exists?
    │   ├─ YES → [FIX 2] update .innerHTML, remove stray raw textNodes
    │   └─ NO  → create span, insert before copyBtn, set innerHTML
    │
    ▼
User sees: "La CBHE tiene **51 empresas afiliadas** a nivel nacional"
    → renders as: "La CBHE tiene <strong>51 empresas afiliadas</strong> a nivel nacional"
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/layouts/Layout.astro` | Modify | Two changes to the inline `<script>` block |

No other files touched.

## Change 1: Fix childList handler (line ~417)

```js
// BEFORE: only processes element nodes
m.addedNodes.forEach((node) => {
  if (node.nodeType === 1) { ... }
});

// AFTER: also processes text nodes — walk up to find the parent bubble
m.addedNodes.forEach((node) => {
  if (node.nodeType === 1) {
    const bubbles = node.classList?.contains("sgq-msg")
      ? [node]
      : node.querySelectorAll?.(".sgq-msg") || [];
    bubbles.forEach((b) => {
      if (b.classList.contains("assistant")) {
        setTimeout(() => postProcessBubble(b), 50);
      }
    });
  } else if (node.nodeType === 3) {
    const bubble = node.parentElement?.closest(".sgq-msg");
    if (bubble?.classList.contains("assistant")) {
      clearTimeout(bubble._normTimer);
      bubble._normTimer = setTimeout(() => postProcessBubble(bubble), 200);
    }
  }
});
```

## Change 2: Make postProcessBubble idempotent (line ~358)

```js
// BEFORE: assumes no existing span, rebuilds from scratch each time
let raw = "";
for (const child of bubble.childNodes) {
  if (child.nodeType === 3) raw += child.nodeValue;
}
if (!raw) return;

// AFTER: check for existing normalized span, update in-place
let raw = "";
const existingSpan = bubble.querySelector(".sgq-msg-normalized");
for (const child of bubble.childNodes) {
  if (child.nodeType === 3) raw += child.nodeValue;
}
if (!raw && !existingSpan) return;
if (existingSpan && raw === existingSpan.dataset.lastRaw) return;

if (existingSpan) {
  // Update existing span, remove stray raw text nodes
  existingSpan.dataset.lastRaw = raw;
  existingSpan.innerHTML = formatBold(formatUrls(escapeHtmlPreservingNewlines(normalizeAssistantText(raw))));
  for (const child of bubble.childNodes) {
    if (child.nodeType === 3) bubble.removeChild(child);
  }
  return;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Build | `npx astro build` | Must pass (no syntax errors in inline script) |
| Manual | Open chatbot in browser | Send a message, check `\*\*text\*\*` renders as bold |
| Manual | Inspect DOM | Verify single `<span.sgq-msg-normalized>` per bubble, no stray text nodes |

## Migration / Rollout

No migration required. The fix is purely client-side — deploy as a normal commit. No feature flag needed.

## Open Questions

- None confirmed. The approach matches the root cause identified in exploration verbatim.

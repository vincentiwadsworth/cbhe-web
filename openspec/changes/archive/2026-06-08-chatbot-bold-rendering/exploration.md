## Exploration: Chatbot Bold Rendering — Literal `**` in Output

### Current State
A Groq-powered chatbot embedded via `multi-ai-sdk` in `src/layouts/Layout.astro`. The SDK renders assistant messages via `textContent` (safe but HTML-agnostic). A MutationObserver-based post-processor was added to convert markdown `**word**` to `<strong>word</strong>` and strip residual markdown artifacts.

The LLM is instructed (via system prompt) to use `**word**` for emphasis on 1–3 keywords per response. The user reports seeing literal `**` asterisks in the rendered output instead of bold text.

### Affected Areas
- `src/layouts/Layout.astro` — Lines 316–448: `postProcessBubble`, `formatBold`, `normalizeAssistantText`, `escapeHtmlPreservingNewlines`, `formatUrls`, `attachObserver`, and the MutationObserver
- `multi-ai-sdk` (`embed.ts` via esm.sh) — The `addMsgRow` function (uses `textContent`) and the streaming DOM manipulation (replaces text nodes per chunk)
- `multi-ai-sdk` (`client.ts`) — `AIClient` class with `stream()` method is also exported and available for building a custom widget

---

### Key Findings

#### 1. WHY is `**` shown literally instead of bold? Is `formatBold` even being called?

**`formatBold` is NEVER called on streamed assistant messages.** The function exists and the regex is correct (`\*\*([^*\n][^*]*?)\*\*` → `<strong>$1</strong>`), but it never executes on the actual content because the post-processor exits before any text arrives.

The data flow is:

1. `addMsgRow("assistant", "")` creates a `<div class="sgq-msg assistant">` with `textContent = ""` (empty — no child nodes).
2. The MutationObserver fires a `childList` mutation because the row was added to `#sgq-messages`. It finds the assistant bubble and schedules `postProcessBubble(bubble, 50)`.
3. After 50ms, `postProcessBubble` runs. It collects raw text from child text nodes — there are none (bubble is empty). `raw` is `""`. The function hits `if (!raw) return;` and exits immediately.
4. The streaming loop begins, adding/replacing text nodes — **but the observer never fires again** for these changes (see finding #3).
5. Streaming completes. The bubble has a single text node with the full content containing `**` markers. The post-processor never ran on it.

**Verdict: `formatBold` is never invoked on any streamed content.**

#### 2. Is the post-processor running at all? Or is it not detecting the assistant bubbles?

The post-processor **runs once — on the empty bubble** — and then **never again**. It correctly detects the assistant bubble on initial creation (the `childList` handler finds it via `querySelectorAll(".sgq-msg")`), but the text is empty so it returns immediately.

After that, the MutationObserver does NOT fire for streaming updates because of how the SDK manipulates the DOM.

#### 3. Are there streaming artifacts where raw markdown leaks through before the post-processor catches up?

**The entire output is a streaming artifact.** The post-processor never catches up because it never re-triggers. Every chunk from the LLM is rendered as raw text via the SDK's streaming code, and the post-processor never converts it.

The SDK's streaming code in `embed.ts`:

```js
// For EACH chunk:
const copyBtn = bubble.querySelector(".sgq-copy-btn");
Array.from(bubble.childNodes).forEach((n) => {
  if (n.nodeType === 3) n.remove();      // ← removes old text node
});
bubble.insertBefore(
  document.createTextNode(fullContent),   // ← creates NEW text node
  copyBtn ?? null
);
```

This does NOT mutate a text node in-place — it **removes the old one and creates a new one**. This is critical because:

- **`characterData` mutations** fire when a text node's content changes in-place (via `.nodeValue = ...`). The SDK does NOT do this.
- **`childList` mutations** fire for the remove + add of text nodes. But the observer's `childList` handler checks `if (node.nodeType === 1)` — text nodes are `nodeType === 3`, so they are **silently skipped**.

Result: zero post-processing on streamed content from start to finish.

#### 4. What's the ACTUAL data flow? Where does it break?

```
LLM output (stream of chunks with **word** markers)
  │
  ▼
embed.ts stream handler: for await (const chunk of activeStream)
  │  fullContent += chunk.content
  │  remove old textNode from bubble   → childList mutation (removed textNode — ignored by handler)
  │  create new textNode(fullContent)  → childList mutation (added textNode — ignored by handler)
  │
  ▼
  ┌── MutationObserver ──────────────────────────────┐
  │  characterData: NEVER fires (textNode replaced)  │
  │  childList:     fires but skips nodeType !== 1   │
  │                                                  │
  │  RESULT: postProcessBubble NEVER called again     │
  └──────────────────────────────────────────────────┘
  │
  ▼
DOM shows raw text: "La CBHE tiene **51 empresas afiliadas**..."
```

**The break is at the MutationObserver callback**, specifically in the `childList` handler which only processes element nodes. The `characterData` handler is dead code — it never fires because the SDK replaces text nodes rather than mutating them.

#### 5. What are the realistic options to fix it?

| Option | Pros | Cons | Effort |
|--------|------|------|--------|
| **A. Build custom widget using `AIClient`** | Full control over rendering; can use `innerHTML` with sanitization; no SDK fighting against us; `AIClient` is already exported by the SDK module | More code to write; need to reimplement UI (chat panel, bubbles, streaming renderer, typing indicator, copy, settings, scroll management) | High |
| **B. Fix observer + handle SDK race condition** | Minimal code changes; keep existing embedChat UI | Fragile — SDK keeps adding raw text nodes after formatting; need to fight streaming loop; debounce timing issues | Medium |
| **C. Fork `multi-ai-sdk` and patch embed.ts** | Fix at the source | Can't fork esm.sh imports easily; would need to vendor the SDK locally; maintenance burden | Medium-High |
| **D. Accept plain text only, remove `**` from prompt** | Simplest change; no code complexity | Loses bold emphasis entirely; LLM might still emit markdown despite instructions | Low |
| **E. SDK replacement (`@copilotkit/runtime` or similar)** | Might handle markdown natively | Unknown compatibility; new dependency; migration effort; larger bundle | High |
| **F. Post-process only at stream end** | Clean separation; observer catches the final mutation | How to detect stream end? Could check `.sgq-typing` element presence, poll `bubble.textContent`, or observe the send button's `disabled` state | Medium |

### Recommendation

**Option B** (fix observer + handle race condition) is the pragmatic choice for now, with **Option A** (custom widget) as the medium-term investment.

**Why B first**: It's a minimal change — fix the `childList` handler to also fire for text node additions, and update `postProcessBubble` to handle the case where a `<span class="sgq-msg-normalized">` already exists (update its innerHTML instead of re-creating, and remove stray raw text nodes the SDK adds).

**Why A later**: The SDK's widget has no markdown support at the rendering level. If we want proper formatting (bold, links, possibly lists), a custom widget using `AIClient.stream()` directly is the only clean solution. But it's a larger implementation effort.

### Risks
- **Observer race condition (Option B)**: If post-processing and SDK streaming interleave, the formatted span and raw text node can coexist, showing both. Mitigation: debounce aggressively (300ms+) and remove any raw text nodes that appear after the formatted span.
- **SSR/CSR mismatch**: Since the chatbot script is `is:inline` and only runs on the client, no SSR concerns.
- **esm.sh import changes**: If the SDK version changes (pinned via esm.sh version in the import URL), the streaming behavior could change and break the observer fix.
- **Performance**: The post-processor runs regex on every mutation during streaming. For long messages with many chunks, this could cause layout thrashing. Mitigation: debounce and only process once every 200ms+.

### Ready for Proposal
Yes. The root cause is fully understood, the observer's blind spot is identified, and a pragmatic fix path exists. The orchestrator should tell the user:

> "The bug has two layers. First, the MutationObserver never fires on streamed content because the SDK replaces text nodes (not mutates them), and the observer only checks for element nodes. Second, even if we fix the observer, the SDK will keep adding raw text alongside our formatted HTML. I recommend a surgical fix to both the observer and the post-processor to handle this conflict, with a medium-term plan to build a custom chat widget using the SDK's `AIClient` directly for full rendering control."

### Processing Chain for Option B (Surgical Fix)

```
SDK streaming chunk arrives
  │
  ▼
childList mutation (textNode added to assistant bubble)
  │
  ▼
Fixed observer: detects nodeType === 3, walks up to .sgq-msg.assistant
  │
  ▼
Debounced postProcessBubble (300ms)
  │  ├─ If no <span.sgq-msg-normalized> exists: create it, replace content
  │  └─ If <span> exists: update innerHTML, remove stray raw textNodes
  │
  ▼
SDK next chunk arrives → removes textNode (there are none) → adds new textNode
  │
  ▼
Observer fires again → postProcessBubble removes the new raw textNode,
  updates <span> innerHTML with the latest fullContent
  │
  ▼
User sees progressively updated bold-formatted content
```

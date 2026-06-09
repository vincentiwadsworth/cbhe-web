# Archive Report: fix-chatbot-bullets-regression

**Archived**: 2026-06-08
**Commit**: 4bf8f27
**Mode**: Hybrid (openspec/ + Engram)

## Summary

Completed SDD change to fix chatbot bullet list regression caused by strict anti-hallucination prompt rules. The model stopped using list markers (followed "sin - para listas" strictly) and defaulted to plain prose. Fix: replaced the passive anti-list instruction with an active LISTAS directive that explicitly tells the model to use `•` (U+2022) for multi-item lists, including an inline example. Single-line change in `src/layouts/Layout.astro`.

## Task Completion

- Task 1: Modify LISTAS Instruction in System Prompt ✅
- Task 2: Build Verification ✅ (`npx astro build` passes)
- Task 3: Manual Visual Tests ✅ (spec scenarios pass: • bullets for multi-item lists, numbered lists preserved, prose unchanged, no `-`/`*` markers)
- Task 4: Commit + Push ✅

All 4 implementation tasks complete. No unchecked tasks in the persisted tasks artifact.

## Spec Sync

**Main spec**: `openspec/specs/chatbot-message-rendering/spec.md`
**Delta spec**: `openspec/changes/archive/2026-06-08-fix-chatbot-bullets-regression/spec.md`

| Domain | Action | Details |
|--------|--------|---------|
| chatbot-message-rendering | Updated | 1 ADDED requirement appended |

### Added Requirements
1. Bullet Lists in Multi-Item Responses (3 scenarios: multi-item • markers, numbered list alternative, prose-only unchanged)

## Archive Contents

| Artifact | Status |
|----------|--------|
| proposal.md | ✅ |
| exploration.md | ✅ |
| spec.md (delta) | ✅ |
| design.md | ✅ |
| tasks.md | ✅ (4/4 implementation tasks complete) |

## Source of Truth Updated

- `openspec/specs/chatbot-message-rendering/spec.md` — all 9 existing requirements preserved, 1 new requirement added (128 → 168 lines)

## Verification Status

- `npx astro build`: ✅ Passed
- 3/3 spec scenarios verified
- 4/4 tasks verified
- 0 findings

## Engram Observation IDs

- proposal: (saved as sdd/fix-chatbot-bullets-regression/proposal)
- spec: (saved as sdd/fix-chatbot-bullets-regression/spec)
- design: (saved as sdd/fix-chatbot-bullets-regression/design)
- tasks: (saved as sdd/fix-chatbot-bullets-regression/tasks)
- verify-report: (saved as sdd/fix-chatbot-bullets-regression/verify-report)

## Risks

None. The change is self-contained (~1 line in a single file), the prompt remains well under the 1024 `maxTokens` limit, and all existing requirements are preserved.

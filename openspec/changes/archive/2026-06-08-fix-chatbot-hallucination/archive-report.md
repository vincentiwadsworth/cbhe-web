# Archive Report: fix-chatbot-hallucination

**Archived**: 2026-06-08
**Commit**: 315aef4 (local, not pushed)
**Mode**: Hybrid (openspec/ + Engram)

## Summary

Completed SDD change to fix chatbot hallucination by modifying system prompt guardrails in `src/layouts/Layout.astro` (~15 lines changed). Broke the hallucination chain by broadening anti-invention rules, removing the repregunta pattern, and adding Spanish-only + "sí" guard clauses.

## Task Completion

- Task 1: Remove Repregunta Rule from REGLAS ✅
- Task 2: Broaden Anti-Invention Guard ✅
- Task 3: Add Spanish-Only and "Sí" Guard Rules ✅
- Task 4: Fix Welcome Message and Suggested Questions ✅
- Task 5: Build Verification ✅ (build passes, astro check passes, dist inspected)

**Note**: Task 5 includes an unchecked sub-item ("Manual: deploy preview and test scenarios from spec (post-commit)") which is explicitly labeled post-commit. The orchestrator confirmed verification passed with 2 minor acceptable warnings.

## Spec Sync

**Main spec**: `openspec/specs/chatbot-message-rendering/spec.md`
**Delta spec**: `openspec/changes/archive/2026-06-08-fix-chatbot-hallucination/spec.md`

| Domain | Action | Details |
|--------|--------|---------|
| chatbot-message-rendering | Updated | 3 ADDED requirements, 1 MODIFIED requirement appended |

### Added Requirements
1. No Fabricated Content for Out-of-Scope Topics (2 scenarios)
2. No Repregunta on Out-of-Scope Topics (2 scenarios)
3. Spanish-Only Output (1 scenario)

### Modified Requirements
4. Anti-Invention Guard — replaces old code-level "No inventes nombres de empresas" rule (2 scenarios)

## Archive Contents

| Artifact | Status |
|----------|--------|
| proposal.md | ✅ |
| exploration.md | ✅ |
| spec.md (delta) | ✅ |
| design.md | ✅ |
| tasks.md | ✅ (4/4 implementation tasks complete) |

## Source of Truth Updated

- `openspec/specs/chatbot-message-rendering/spec.md` — 5 existing requirements preserved, 4 new requirements appended (66 → 128 lines)

## Verification Status

- `npx astro build`: ✅ Passed
- `npx astro check`: ✅ Passed
- Verification passed with 2 minor acceptable warnings

## Risks

None. The change is self-contained (~15 lines in a single file), the prompt remains well under the 1024 `maxTokens` limit, and all existing requirements are preserved.

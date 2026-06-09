# Tasks: Fix Chatbot Bullets Regression

> Estimated total changes: ~1 line in `src/layouts/Layout.astro` (single file, single line replaced).
> Review budget: Low (1 line, single file, single PR, zero risk).

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1-4 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

## Task 1: Modify LISTAS Instruction in System Prompt

**File**: `src/layouts/Layout.astro`, line 250

**Change**: Replace the passive list instruction with an active LISTAS directive + inline `•` example.

**Before**:
```
"Sin *, sin #, sin backticks, sin - para listas. Usá '1.' '2.' o el carácter • para listas.",
```

**After**:
```
"LISTAS: Cuando listes 2+ items, usá • al inicio de cada línea. Ejemplo:\n• Item uno\n• Item dos\nNo uses - ni * ni # para listas. Numeración (1. 2.) solo para pasos o secuencias ordenadas.",
```

**Lines changed**: 1 (replaced string literal)
**Reviewable**: Yes — single rule replacement, clear diff
**Verification**: Prompt loaded with new LISTAS rule on bot init

---

## Task 2: Build Verification

**Command**: `npx astro build` (from project root)

**Checklist**:
- [ ] Build passes with no errors
- [ ] 27 pages output (same as before)
- [ ] `dist/` inspected for updated system prompt in chat widget script
- [ ] No warnings introduced

**Lines changed**: 0 (verification only)

---

## Task 3: Manual Visual Tests

**Environment**: Dev preview or deploy preview

**Test scenarios from spec**:
- [ ] Ask "Dame la lista de Servicios en Superficie" → `•` bullets, one per empresa
- [ ] Ask "Dame la lista de cursos" → `•` bullets, one per curso
- [ ] Ask "¿Qué hace Repsol?" → prose response, no bullets (unchanged)
- [ ] Ask a numbered sequence question → `1.` `2.` format preserved (no regression)
- [ ] No `-` or `*` markers appear in any response (post-processor now irrelevant since model outputs `•` directly)

**Lines changed**: 0 (documentation/verification only)

---

## Task 4: Commit + Push

**Commands**:
```bash
git add src/layouts/Layout.astro
git commit -m "fix(chatbot): add active LISTAS directive with • markers for multi-item lists"
git push
```

**Acceptance**: Single commit on main with only Layout.astro changed. Diff shows 1 line replaced.

---

## Definition of Done

All checks from [spec R1](spec.md#requirement-bullet-lists-in-multi-item-responses) must pass:
- [ ] Chatbot uses `•` (U+2022) at start of each line for 2+ item lists
- [ ] No `-` or `*` markers used for lists
- [ ] Numbered lists (`1.` `2.`) still pass through unchanged for ordered sequences
- [ ] Single-item or prose responses unchanged
- [ ] `npx astro build` passes clean
- [ ] Previous hallucination guard behavior preserved (no regression)

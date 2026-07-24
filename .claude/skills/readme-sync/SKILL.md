---
name: readme-sync
description: Checklist for keeping readme/ docs in sync with code after any change. Enforced automatically by the doc-sync Stop hook.
---

# Skill: readme-sync

Use after any code change to ensure READMEs are in sync.

> **Enforced.** A `Stop` hook (`.claude/hooks/check-readme-sync.sh`) blocks turn-end when source code was edited in a session but no `readme/` doc was touched. The `PostToolUse` hook `.claude/hooks/log-edit.sh` records edits; the log is cleared at `SessionStart`. See `.claude/RULES.md §1` and `§10`. This checklist is what you run when that hook fires.

## Checklist

- [ ] Read the relevant doc in the matching `readme/` subfolder for every flow/method/UI change made:
  - Logic or data flow changed → `readme/flows/<feature>.md`
  - Shared utility/helper changed → `readme/methods/<domain>.md`
  - UI pattern or component changed → `readme/ui/<component>.md`
  - Theme tokens or colours changed → `readme/theming/<topic>.md`
- [ ] For each doc touched, verify:
  - Does the **Flow** section reflect current data pathways?
  - Does the **Methods / Exports** section reflect current shared helpers?
  - Are new **Dependencies** documented?
  - Are stale steps or logic removed?
- [ ] If new feature or flow added → create `readme/flows/<feature>.md`. Do NOT append to another feature's file.
- [ ] If new utility domain added → create `readme/methods/<domain>.md`.
- [ ] If theme tokens or UI patterns changed → update or create file in `readme/theming/` or `readme/ui/`.
- [ ] Update the *Last updated* line in every document touched.

## File naming rules

- `readme/flows/` — one file per feature: `auth.md`, `payment.md`, `notifications.md`
- `readme/methods/` — one file per utility domain: `validation.md`, `date.md`, `formatting.md`
- `readme/ui/` — one file per component or pattern: `modal.md`, `forms.md`, `table.md`
- `readme/theming/` — one file per topic: `tokens.md`, `dark-mode.md`, `typography.md`

Never put two unrelated features in the same file. Split instead of merge to avoid conflicts when multiple developers work in parallel.

## Flow README template (for `readme/flows/` directory)

```markdown
# <Feature name>

## Purpose
<!-- What this flow/process is responsible for -->

## Steps
<!-- Sequence of operations and logic -->

## Data Pathways
<!-- How data enters and exits this flow -->

## Dependencies
<!-- Major packages or modules this flow relies on -->

## Notes
<!-- Edge cases, known limitations, gotchas -->

---
*Last updated: YYYY-MM-DD*
```

## Method README template (for `readme/methods/` directory)

```markdown
# <Domain name> Methods

## Purpose
<!-- What utilities this domain covers -->

## Methods

### `methodName(params)`
<!-- Description, params, return value -->

## Notes
<!-- Edge cases, known limitations -->

---
*Last updated: YYYY-MM-DD*
```

### Rule: No per-directory or per-module READMEs
Never create `README.md` files in inner folders or for individual modules. All documentation must stay in the `readme/` subfolders and focus on flows and patterns.

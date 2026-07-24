# .claude/RULES.md — Standing Instructions

Read this file at the start of every session.
These rules apply to every task in this repository without exception.
No need to re-state them in a prompt — they are always active.

---

## 1. Documentation sync (mandatory)

- All documentation lives in the `readme/` directory at the project root.
- Before touching a file in any directory, read the corresponding flow-specific README in `readme/` (e.g., `readme/FLOWS.md` for logic).
- After any code change, update the corresponding flow-specific README in `readme/`.
- After any flow change, update `readme/FLOWS.md`.
- After any theme/token change, update `readme/THEMING.md`.
- After adding a new feature or flow, update `readme/FLOWS.md` or create a new flow-specific document in `readme/` and register it in `CLAUDE.md`.
- `CLAUDE.md` itself must be updated whenever a new flow README is added.
- **No per-directory or per-module READMEs**: do not create `README.md` files in inner folders or for individual modules (routes, controllers, etc.). All documentation must focus on flows and patterns in `readme/`.
- **Enforced by hook (not optional).** A `Stop` hook (`.claude/hooks/check-readme-sync.sh`) blocks turn-end when source code was edited in a session but no `readme/` doc was updated. A `PostToolUse` hook (`.claude/hooks/log-edit.sh`) records every edit to `.claude/.session-edits.log`; `SessionStart` clears it. When the hook fires, run the `readme-sync` skill checklist and update the matching doc, or state why none applies. Wiring lives in §10.

---

## 2. Package hygiene

- Never add two packages that solve the same problem.
  - Date/time: use **dayjs** only (not moment, date-fns, luxon).
  - HTTP client: use **axios** only (not got, node-fetch, ky).
  - Validation: use **zod** only (not joi, yup).
  - ORM: use the project's established ORM — do not introduce a second one.
- Do not modify `package.json` without explicit instruction.
- After adding a package, document it in `readme/METHODS.md` under a "Dependencies" section or similar flow-specific documentation.

---

## 3. Git workflow

### Default branches
Every repository starts with exactly two long-lived branches:
- `main` — production-ready, protected
- `dev` — integration branch; all features merge here first

### Starting a new feature
1. Check out from `dev`: `git checkout dev && git pull origin dev`
2. Create a feature branch: `git checkout -b feature/<name>`
3. If `feature/<name>` already exists locally or remotely, use `feature/<name>-2` (increment until unique).
4. Work on the feature branch only.

### Committing
- **Never commit on behalf of the user.** After completing code changes, stop and let the user review the diff before committing. Do not run `git commit` or `git push` unless the user explicitly says "commit" or "push".
- Write conventional commit messages: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`
- Include a short body describing *why*, not just *what*.

### Pull requests
- Target branch is always `dev` (never `main` directly).
- PR title format: `[TYPE] Short description` — e.g. `[feat] Add user authentication flow`
- PR description must include:
  - **Summary** — what changed and why
  - **Changes** — bullet list of files/modules affected
  - **Testing** — how to verify the change
  - **Related ticket** — link if applicable
- **Never self-merge.** Leave the PR open for human review.
- Do not delete the branch after PR creation.

---

## 4. PR review instructions

When asked to review a PR:
1. Summarise all changes in plain language (what feature/fix was introduced, what files changed).
2. Identify **risky code snippets** — flag each with a risk percentage and a short reason:
   - Risk is based on: deviation from existing patterns, missing error handling, untested edge cases, performance implications, security surface area.
   - Format: `⚠ Risk 70% — reason here`
3. Call out anything that does not match the project's existing implementation style.
4. Note any missing README updates.
5. **Do not approve or request changes on behalf of the reviewer** — summarise only.

---

## 5. GitHub tickets

When asked to create a ticket (GitHub issue):
- Title: concise, action-oriented (`Add pagination to /users endpoint`)
- Body must include: **Context**, **Acceptance criteria**, **Notes** (optional)
- Apply labels if the project's label set is known (bug, enhancement, chore, etc.)
- When creating a PR for work that has a ticket, link the issue in the PR description using `Closes #<issue-number>` or `Relates to #<issue-number>`.

---

## 6. Code style

- Follow the existing pattern in the file you are editing.
- Do not introduce a new pattern or library without noting it in the relevant README.
- Prefer explicit over clever.
- No commented-out code left in commits.
- TypeScript: strict mode; no `any` unless unavoidable and documented.

---

## 7. Environment and config

- Never hard-code secrets, API keys, or environment-specific values.
- All config goes through the project's config layer (see `readme/ARCHITECTURE.md`).
- New environment variables must be documented in `readme/ARCHITECTURE.md` and added to `.env.example`.

---

## 8. Testing

- New features require at least a unit test for the service/util layer.
- Bug fixes require a regression test.
- Do not remove existing tests.

> Project-specific override (this repo): automated tests are being skipped for the initial MVP build by explicit user instruction — the user is testing manually. Do not add test files during the MVP build phase unless asked.

---

## 9. Initial Project Alignment (Migration)

When these configuration files (`CLAUDE.md`, `RULES.md`, `AGENTS.md`, and `PROJECT_STRUCTURE.md`) are first copied into an existing project:
- **Immediate Audit:** Read the actual project directory and update the `PROJECT_STRUCTURE.md` to reflect the *real* file tree and naming conventions of that specific project.
- **Version Alignment:** Run `node -v`, `npm -v`, `next -v`, etc., and update the "Framework Versions" section in the structure files to match the environment.
- **Registry Update:** Update the `README registry` in `CLAUDE.md` to point to the correct paths where these files are now located.
- **Agent Adaptation:** Review the instructions in `AGENTS.md` and modify any triggers or paths that differ from this template (e.g., if the main branch is named `master` instead of `main`).

---

## 10. Session bootstrap + doc-sync enforcement (mandatory)

RULES.md must be auto-injected at the start of every session via a `SessionStart` hook, and the doc-sync policy (§1) must be enforced via `PostToolUse` + `Stop` hooks. Without these, Claude will not read the rules unless prompted and may leave docs stale.

The hook scripts live in `.claude/hooks/` (`log-edit.sh`, `check-readme-sync.sh`) — copy them in alongside this file. Required hook config for every project:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo '=== PROJECT RULES ===' && cat .claude/RULES.md; rm -f \"$CLAUDE_PROJECT_DIR/.claude/.session-edits.log\""
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR/.claude/hooks/log-edit.sh\""
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR/.claude/hooks/check-readme-sync.sh\""
          }
        ]
      }
    ]
  }
}
```

Place this config wherever the project keeps committed Claude settings — `.claude/settings.json` in this repo (committed, shared — this repo's `.gitignore` does not exclude it). `$CLAUDE_PROJECT_DIR` resolves on any machine, any clone location. `.claude/.session-edits.log` is gitignored. No further edits needed after copying.

---

*Last updated by: Claude Code — 2026-07-25*

#!/usr/bin/env bash
# Stop hook: enforces the documentation-sync policy in .claude/RULES.md §1.
# Blocks turn-end (exit 2) when source code was edited this session but no
# readme/ doc was updated. Fires at most once per stop-cluster to avoid loops.
#
# Pairs with log-edit.sh (PostToolUse), which records edited paths into
# .claude/.session-edits.log. SessionStart clears that log.

input=$(cat)
dir="${CLAUDE_PROJECT_DIR:-.}"
log="$dir/.claude/.session-edits.log"
[ -f "$log" ] || exit 0

# Already nudged once this stop-cluster → allow the stop and reset the log.
if printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  : > "$log"
  exit 0
fi

# Source-code edits this session (exclude docs, .claude/, deps).
code=$(grep -Ev '(/readme/|/\.claude/|/node_modules/)' "$log" \
  | grep -Ei '\.(js|jsx|mjs|cjs|ts|tsx|dart|prisma|vue|svelte|py)$' \
  | sort -u)
# readme/ docs touched this session.
docs=$(grep -E '/readme/.+\.md$' "$log")

if [ -n "$code" ] && [ -z "$docs" ]; then
  {
    echo "Doc-sync check (.claude/RULES.md §1): code was edited this session but no readme/ doc was updated."
    echo "Update the matching readme/ doc (flows / methods / ui / theming) for these files — or state why none applies — then stop again:"
    printf '%s\n' "$code" | sed 's/^/  - /'
  } >&2
  exit 2
fi

: > "$log"
exit 0

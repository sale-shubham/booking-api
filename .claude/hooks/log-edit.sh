#!/usr/bin/env bash
# PostToolUse hook (matcher: Edit|Write|MultiEdit).
# Records every edited file path into a per-session log so the Stop hook
# (check-readme-sync.sh) can enforce the documentation-sync policy
# in .claude/RULES.md §1 — code change MUST land with its readme/ doc update.

input=$(cat)
fp=$(printf '%s' "$input" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)
[ -z "$fp" ] && exit 0

dir="${CLAUDE_PROJECT_DIR:-.}"
mkdir -p "$dir/.claude"
printf '%s\n' "$fp" >> "$dir/.claude/.session-edits.log"
exit 0

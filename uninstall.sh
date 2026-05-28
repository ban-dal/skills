#!/usr/bin/env bash
set -euo pipefail

CLAUDE_MD="$HOME/.claude/CLAUDE.md"
SKILLS_DIR="$HOME/.claude/agents/skills"
MARKER_START="<!-- smart-agent:start -->"
MARKER_END="<!-- smart-agent:end -->"

# Remove CLAUDE.md block
if grep -q "$MARKER_START" "$CLAUDE_MD" 2>/dev/null; then
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' "/$MARKER_START/,/$MARKER_END/d" "$CLAUDE_MD"
  else
    sed -i "/$MARKER_START/,/$MARKER_END/d" "$CLAUDE_MD"
  fi
  echo "Removed rules from $CLAUDE_MD"
else
  echo "No rules found in $CLAUDE_MD (nothing to remove)"
fi

# Remove grill skill
if [[ -d "$SKILLS_DIR/grill" ]]; then
  rm -rf "$SKILLS_DIR/grill"
  echo "Removed /grill skill"
fi

echo "Uninstalled."

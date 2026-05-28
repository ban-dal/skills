#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
CLAUDE_MD="$CLAUDE_DIR/CLAUDE.md"
SKILLS_DIR="$CLAUDE_DIR/agents/skills"
MARKER_START="<!-- smart-agent:start -->"
MARKER_END="<!-- smart-agent:end -->"

echo "Installing claude-smart-agent..."

mkdir -p "$CLAUDE_DIR" "$SKILLS_DIR/grill"

# CLAUDE.md rules
if grep -q "$MARKER_START" "$CLAUDE_MD" 2>/dev/null; then
  echo "Already present in $CLAUDE_MD. Run ./uninstall.sh to reinstall."
else
  {
    printf "\n%s\n" "$MARKER_START"
    cat "$SCRIPT_DIR/src/claude-md-snippet.md"
    printf "\n%s\n" "$MARKER_END"
  } >> "$CLAUDE_MD"
  echo "Rules appended to $CLAUDE_MD"
fi

# Grill skill
cp "$SCRIPT_DIR/src/skills/grill/SKILL.md" "$SKILLS_DIR/grill/SKILL.md"
echo "/grill skill installed to $SKILLS_DIR/grill/"

echo ""
echo "Done. Restart Claude Code to apply changes."

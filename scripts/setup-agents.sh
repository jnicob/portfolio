#!/usr/bin/env bash
# Manages tool-specific entry points for the agent-agnostic config.
# Sources of truth: AGENTS.md, skills/, agents/ (repo root). Everything else is a
# symlink or generated file. Usage: setup-agents.sh [--all|--validate|--copilot]
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

# link target: relative path from link's directory to the real source
LINKS=(
  "CLAUDE.md:AGENTS.md"
  "GEMINI.md:AGENTS.md"
  ".claude/skills:../skills"
  ".claude/agents:../agents"
  ".cursor/skills:../skills"
  ".codex/skills:../skills"
  ".github/skills:../skills"
)
COPILOT_FILE=".github/copilot-instructions.md"

create_links() {
  for entry in "${LINKS[@]}"; do
    local link="${entry%%:*}" target="${entry##*:}"
    mkdir -p "$(dirname "$link")"
    if [ -e "$link" ] && [ ! -L "$link" ]; then
      echo "ERROR: $link exists and is not a symlink. Move it away first." >&2
      exit 1
    fi
    ln -sfn "$target" "$link"
    echo "link: $link -> $target"
  done
}

generate_copilot() {
  {
    echo "<!-- Auto-generated from AGENTS.md and skills/ by scripts/setup-agents.sh. Do not edit. -->"
    cat AGENTS.md
    echo
    echo "## Skills index (full content in skills/<name>/SKILL.md)"
    echo
    for skill in skills/*/SKILL.md; do
      name="$(basename "$(dirname "$skill")")"
      # description: from frontmatter
      desc="$(awk -F': ' '/^description:/ {sub(/^description: /, ""); print; exit}' "$skill")"
      echo "- **${name}**: ${desc}"
    done
  } > "$COPILOT_FILE"
  echo "generated: $COPILOT_FILE"
}

validate() {
  local ok=0
  for entry in "${LINKS[@]}"; do
    local link="${entry%%:*}" target="${entry##*:}"
    if [ "$(readlink "$link" 2>/dev/null)" != "$target" ]; then
      echo "FAIL: $link should be a symlink to $target" >&2
      ok=1
    fi
  done
  if [ ! -f "$COPILOT_FILE" ]; then
    echo "FAIL: $COPILOT_FILE missing (run --copilot)" >&2
    ok=1
  elif ! head -1 "$COPILOT_FILE" | grep -q "Auto-generated"; then
    echo "FAIL: $COPILOT_FILE lost its auto-generated header" >&2
    ok=1
  fi
  [ "$ok" -eq 0 ] && echo "agent config OK"
  return "$ok"
}

case "${1:---all}" in
  --all) create_links; generate_copilot ;;
  --copilot) generate_copilot ;;
  --validate) validate ;;
  *) echo "usage: $0 [--all|--validate|--copilot]" >&2; exit 2 ;;
esac

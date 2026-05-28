# claude-smart-agent

A lightweight Claude Code plugin. Makes the main model proportionate, interview-first, and smart about sub-agent delegation.

## Behaviors

| Behavior | Trigger | Description |
|----------|---------|-------------|
| **Proportionality** | Every request | Matches effort to scope — tiny fix → fix directly, large change → plan first |
| **Auto-interview** | Ambiguous request | Asks 2–4 clarifying questions before writing any code |
| **Grill mode** | "grill me" / `/grill` | Deep 6–10 question requirements elicitation |
| **Smart delegation** | Complex tasks | Spawns planning or review sub-agents with the right model |

## Install

```bash
git clone https://github.com/YOUR_USERNAME/claude-smart-agent.git ~/Documents/skills/claude-smart-agent
cd ~/Documents/skills/claude-smart-agent
chmod +x install.sh uninstall.sh
./install.sh
```

Restart Claude Code to apply.

## Uninstall

```bash
./uninstall.sh
```

## How it works

- Appends behavioral rules to `~/.claude/CLAUDE.md` (global — applies to all projects)
- Installs the `/grill` skill to `~/.claude/agents/skills/grill/`
- No dependencies, no Node.js required

## Proportionality table

| Intent       | ≤ 2 files      | 3–5 files             | 6+ files              |
|--------------|----------------|-----------------------|-----------------------|
| bug fix      | fix directly   | fix directly          | spawn planner (sonnet)|
| feature      | brief plan     | spawn planner (sonnet)| spawn planner (opus)  |
| refactor     | brief plan     | spawn planner (sonnet)| spawn planner (opus)  |
| architecture | spawn planner  | spawn planner (opus)  | spawn planner (opus)  |

## Sub-agent model guide

| Model  | Use for |
|--------|---------|
| haiku  | lookups, grep, formatting checks |
| sonnet | standard planning, code review |
| opus   | architecture, ambiguous requirements, deep debugging |

## Background

Built as a lighter alternative to superpowers. Avoids: running TDD on simple changes, over-engineering small fixes, refactoring outside the requested scope.

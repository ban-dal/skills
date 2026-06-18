---
name: agentic-work-log
description: Record AI coding work as Korean Markdown. Triggers — user asks to log/summarize/preserve task context ("작업 로그 남겨줘", "기록해줘", "정리해줘") or update a prior log; OR proactively, once, when a multi-step task hits a PR/branch-finish checkpoint (before `gh pr create`). Skip trivial single-file edits, mid-task steps, and read-only/Q&A turns; update the existing log instead of duplicating.
---
# Agentic Work Log

## Overview

Create a compact, review-friendly work log for an AI coding task. The instructions in this skill are English for routing and consistency, but the generated log Markdown must be written in Korean.

Prefer structured summaries, decision evidence, and generated templates over long free-form transcripts.

This skill combines four patterns:

- Superpowers-style finish summaries: changed files, validation, risks, and follow-ups.
- ADR-style decisions: context, options, decision, consequences.
- Changelog-style curation: notable changes instead of raw diffs.
- PR/Jira-ready summaries: purpose, code explanation, verification, and desired reviewer feedback.

## Trigger Policy

Auto-logging must fire exactly once at the right checkpoint, not indiscriminately. Producing a full log costs significant tokens (~20k), so over-triggering is the main failure mode to avoid.

- Proactive checkpoint: invoke once when a multi-step coding task is about to create a PR or finish a branch (right before `gh pr create`, opening a PR, or merging/finishing a development branch).
- Suppress when: the change is a trivial single-file edit, the turn is read-only/Q&A/planning, the task is still mid-flight, or a fresh log for the current task already exists. In those cases do not invoke.
- One log per task: if a related log already exists, update it instead of creating a new file (see step 5). Never re-run the full log generation when an up-to-date log is already present.
- A `PreToolUse` hook on `gh pr create` reminds the model to log first; treat that reminder as the trigger, create/update the log once, then proceed with the PR.

## Workflow

1. Collect task context before writing the log:
   - User prompts. Preserve the original text when it is short.
   - Main-model questions and user answers when a clarifying/brainstorming skill was used.
   - Skills, MCP/app tools, shell commands, scripts, and major external tools used.
   - Changed files, important code paths inspected, and tests or checks run.
2. Summarize for fast future review:
   - Problem and target outcome.
   - Key implementation decisions, rejected alternatives, and accepted consequences.
   - Behavior changes, preserved constraints, and review entry points.
   - Verification results, including commands, pass/fail status, and checks not run.
   - Remaining risks, follow-ups, and assumptions.
   - Reviewer-request notes, PR comment draft, or Jira comment draft.
3. Write the final record as a Markdown file (`.md`). Use `scripts/create_work_log.js` and temporary JSON input only to avoid manually repeating Markdown sections.
4. Follow the Storage Policy.
5. For follow-up review or fix requests on the same task, update the existing log instead of creating a new file. Create a new file only when a different task starts, the user explicitly asks for a new record, or no related log can be found.

## Storage Policy

Default location is `.agentic-work-log/` under the target project root.

- Default filename: `.agentic-work-log/YYYY-MM-DD-short-task.md`
- Before creating a log file, check whether `.agentic-work-log/` is listed in the project's `.gitignore`.
- If `.gitignore` exists and the entry is missing, add `.agentic-work-log/`.
- If `.gitignore` does not exist, ask the user before creating it.
- Do not make work logs tracked files unless they are official decision records intended for team sharing.

At the end of the task, record highly reusable content through `/llm-wiki` when appropriate:

- Troubleshooting likely to recur.
- Project or personal development conventions.
- Architecture or implementation decisions that should be referenced later.
- Reusable prompts or workflows.
- Production incidents, temporary mitigations, unresolved causes, or future triggers.

## Commands

Print a temporary JSON input template:

```bash
node path/to/agentic-work-log/scripts/create_work_log.js --print-template
```

Create a log file:

```bash
node path/to/agentic-work-log/scripts/create_work_log.js --input worklog.json --out .agentic-work-log/2026-06-17-task.md
```

If `--out` is omitted, the script prints Markdown to stdout.

## Writing Rules

- The generated work log Markdown must be written in Korean.
- Keep the record factual and easy to skim.
- Store the record as readable Markdown. Use JSON only as temporary generation input.
- Store logs in `.agentic-work-log/` by default and verify that the folder is gitignored.
- Section headings and generated fallback phrases must be Korean.
- Preserve the original language of user prompts. Summarize long prompt chains in Korean.
- Keep repeated or long text from hiding the useful information. Put summaries in the body and reference source paths or raw files only when needed.
- When the same content repeats, keep the first occurrence and final decision; summarize middle repetitions by count or scope.
- Preserve short prompts verbatim. Compress long prompt chains to core requirements, constraints, and changed decisions.
- Do not paste long command output. Record the command name and result.
- Mark unknown or unverified items as `기록되지 않음` or `실행하지 않음`.
- Separate what changed from why the choice was made.
- Keep the `변경 사항` and `파일` sections distinct to avoid duplication. `변경 사항` is a behavior-level changelog (what behavior was added/changed/fixed/removed and why it is visible); `파일` lists only review entry points (paths a reviewer should open first, with where-to-look guidance). Do not re-list every changed path in `파일`, and do not repeat the same per-file description in both sections. When a change is purely a new file with no separate behavior story, keep it in `변경 사항` and reference it in `파일` only if it is a primary review entry point.
- Write decisions in a `맥락 -> 결정 -> 대안 -> 결과` flow rather than long exposition.
- Group changes as `추가`, `변경`, `수정`, and `제거` when useful; omit empty categories.
- When updating an existing log, preserve previous entries. Unless correcting factual errors, append new review requests, additional decisions, changed files, verification, risks, and follow-ups instead of rewriting history.
- Keep PR/Jira comments short enough to paste and edit directly.

## Minimum Done Criteria

- The log is a Markdown file written in Korean.
- The log includes prompt context, interview Q&A when applicable, tool/skill usage, decisions, changes, verification, and risks.
- The log file is under `.agentic-work-log/` and the project gitignores that folder.
- Important decisions include enough alternatives and consequences to support later development.
- Repetitive or long text is summarized so decisions, changes, verification, risks, and review points are easy to find.
- A future developer can understand why the code changed without reading the full conversation.
- PR/Jira summaries are editable drafts, not oversized reports.

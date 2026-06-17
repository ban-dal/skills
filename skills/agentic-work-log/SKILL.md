---
name: agentic-work-log
description: Record AI coding work as Korean Markdown when the user asks to log, summarize, preserve task context, or update a prior work log. Use for Korean prompts such as "작업 로그 남겨줘", "기록해줘", "작업 내용 정리해줘", or "후속 변경도 같은 로그에 반영해줘"; update the same log for follow-up changes.
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

## Workflow

1. Collect task context before writing the log:
   - User prompts. Preserve the original text when it is short.
   - Main-model questions and user answers when `interview-me` was used.
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

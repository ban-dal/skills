---
name: agentic-work-log
description: |
  AI coding 작업 수행 시 작업 완료 Markdown 기록을 남긴다.
  같은 작업의 후속 수정 요청은 새 파일을 만들지 않고 기존 기록을 갱신한다.
---
# Agentic Work Log

## Overview

Create a compact, review-friendly work log for an AI coding task. The instructions in this skill are English for routing and consistency, but the generated log Markdown must be written in Korean.

Prefer structured summaries, decision evidence, and generated templates over long free-form transcripts.

The output must combine:

- Finish summary: changed files, validation, risks, and follow-ups.
- Decision notes: context, options, decision, and consequences.
- Curated changelog: notable changes instead of raw diffs.
- Reviewer draft: purpose, code explanation, verification, and desired feedback.

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
3. Write the final record as a Markdown file (`.md`). Use `scripts/create_work_log.js` and temporary JSON input only to avoid manually repeating Markdown sections. Put temporary JSON under the workspace temp area or delete it after the Markdown is written.
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
- Preserve short prompts verbatim; compress repeated or long prompt chains to core requirements, constraints, changed decisions, and final outcomes.
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

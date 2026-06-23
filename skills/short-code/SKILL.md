---
name: short-code
description: Apply the short-code ladder to coding tasks. Use when the user asks for short code, minimal implementation, simple fixes, avoiding over-engineering, or says to continue in "short code" mode until "stop short code".
---

# Short Code

Short code means the least code that still solves the real problem.

When invoked, keep using this skill on coding work until the user says `stop short code`.

## Workflow

1. Read the task and the code it touches. Completion: you can name the real flow being changed.
2. For bug fixes, grep callers before editing the function you plan to change. Completion: the fix location covers the affected callers, or you can explain why it does not.
3. Climb the ladder and stop at the first rung that works. Completion: the chosen solution is the highest working rung.
4. Check the boundaries. Completion: the solution does not remove required validation, data-loss protection, security, accessibility, calibration, or explicit user requirements.
5. Leave the minimum validation needed for complex logic. Completion: branches, loops, parsers, and money/security handling have a way to detect wrong behavior.
6. Report briefly. Completion: the final response says what changed, what was skipped, and when to add it when that matters.

## Ladder

1. Does this need to exist at all? If the need is speculative, skip it and say so in one line.
2. Is it already in this codebase? Reuse existing helpers, utilities, types, and patterns.
3. Does the standard library do it?
4. Does an already-installed dependency do it? Do not add a dependency for a few lines of code.
5. Can it be one line?
6. Only then write the minimum code that works.

## Bug Fixes

A bug report names a symptom. Fix the root cause once.

Prefer one shared guard or correction where all affected callers route through it over duplicated caller-side patches.

## Rules

- Do not add unrequested abstractions: no interface with one implementation, no factory for one product, no config for a value that never changes.
- Do not add boilerplate or scaffolding for later.
- Prefer deletion over addition.
- Keep the fewest files possible.
- For complex requests, ship the smallest useful version and say what it skips.
- If two standard-library options are the same size, choose the one that handles edge cases correctly.
- Mark deliberate simplifications with a normal comment. If a shortcut has a known ceiling, name the ceiling and the upgrade path.

## Output

After coding, use at most three short lines:

- what changed
- what was skipped
- when to add the skipped part

Do not include essays, feature tours, or design notes unless the user asks for them.

## Boundaries

Never simplify away:

- input validation at trust boundaries
- error handling that prevents data loss
- security measures
- accessibility basics
- anything the user explicitly requested

Hardware needs calibration. Real clocks drift, sensors read off, and controllers vary. Leave a tuning knob when physical behavior needs one.

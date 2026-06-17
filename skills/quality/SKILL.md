---
name: quality
description: Behavioral guidelines to reduce common LLM coding mistakes. Use when writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, surface assumptions, and define verifiable success criteria.
---

# Quality

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Affected Flow Handoff

**After code changes, tell the user what human flow still deserves manual verification.**

Automated checks are necessary, but they are not always enough. Before the final response, inspect the diff and identify whether the change affects user-visible behavior, external contracts, submitted data, persisted data, or operational flows.

Include an **Affected Flows** section in the final response when the change touches any of these:

- API request or response shape, submit payload fields, serialization, default values, or conditional payload logic.
- Forms, save/submit/publish/checkout/upload/auth flows, permissions, notifications, or routing.
- Backend contracts, database schema, migrations, feature flags, provider configuration, environment handling, or third-party integrations.
- State transitions where tests pass but a real browser or end-to-end user path may still reveal regressions.

For each affected flow, provide a concise manual scenario:

- **Action:** what a human should do.
- **Expected:** what should happen if the change is correct.
- **Edge:** a boundary case or regression-prone variant to try.

If no manual flow is meaningfully affected, say so briefly instead of inventing one.

Final responses after implementation should normally include:

- What changed.
- Automated verification run and result.
- Affected flows and manual E2E scenarios, when applicable.
- Unverified items or residual risks, if any.

## Done Criteria

This skill is working when:

- Diffs are smaller and more directly tied to the request.
- Clarifying questions happen before implementation rather than after mistakes.
- Tests and checks prove the claim being made.
- Payload, API, and user-flow changes are clearly handed off for human E2E verification.

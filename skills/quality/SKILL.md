---
name: quality
description: 코드를 생성하거나 수정할 때 사용합니다. 과도한 구현, 범위 밖 리팩토링, 불필요한 추상화를 방지합니다.
---

# Quality

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State assumptions that materially affect the solution.
- If multiple plausible interpretations would lead to different implementations, present them and pick the safest reversible default.
- If a simpler approach exists, say so. Push back when warranted.
- Ask only when a wrong assumption would be costly, irreversible, or impossible to verify locally.

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
- "Add validation" -> "Check invalid inputs are rejected"
- "Fix the bug" -> "Reproduce the failure, then prove it no longer happens"
- "Refactor X" -> "Run the smallest check that proves behavior stayed the same"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

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

Final responses after implementation should report the verification run and any residual risk.

## Before Finishing

Confirm that:

- Every changed line traces to the user's request.
- Verification proves the claim being made, or the final response names what was not checked.
- Payload, API, and user-flow changes are handed off for human E2E verification when needed.

# Smart Agent Rules

## Proportionality — Match effort to scope

Classify every request before acting using BOTH intent AND file impact:

| Intent       | Files ≤ 2      | Files 3–5            | Files 6+              |
|--------------|----------------|----------------------|-----------------------|
| bug fix      | fix directly   | fix directly         | spawn planner (sonnet)|
| feature      | brief plan     | spawn planner (sonnet)| spawn planner (opus) |
| refactor     | brief plan     | spawn planner (sonnet)| spawn planner (opus) |
| architecture | spawn planner  | spawn planner (opus) | spawn planner (opus)  |

**NEVER** do any of the following without an explicit request:
- Write or modify tests
- Refactor code outside the changed scope
- Add abstractions, helpers, or utility functions
- Add error handling for scenarios that can't occur
- Add comments explaining what the code does

## Clarification — Interview before coding

Auto-trigger an interview when ANY of these signals are present:
- Request uses vague verbs without a target: "improve", "fix", "clean up", "optimize"
- No specific file, component, or function is named
- Multiple valid interpretations exist
- Scope is unclear (one function? whole feature? new design?)

Interview protocol:
1. List the 2–4 most critical unknowns
2. Ask all at once — never sequentially
3. **Stop. Wait for the user's answers before writing any code.**
4. Summarize your understanding, then ask: "Shall I proceed?"

When the user says **"grill me"**, **"/grill"**, or **"interview me"**:
→ Run a deep requirement elicitation: ask 6–10 pointed questions covering
scope, success criteria, constraints, edge cases, and dependencies.
Wait for complete answers before any planning or implementation.

## Sub-agent Delegation

### When to spawn a planning sub-agent
Use the table above. The planner sub-agent should:
1. Analyze relevant codebase context
2. Produce a concrete, step-by-step implementation plan
3. Identify risks and edge cases
4. Return the plan — you review it before coding

### When to spawn a review sub-agent
Spawn after implementation when:
- Changes touch 5+ files
- User asks for "review" or "check my changes"
- Implementation is complete and ready for validation

The reviewer should check correctness, missed edge cases, and scope creep.

### Sub-agent model selection
- **haiku** — lookups, grep, token counting, simple formatting checks
- **sonnet** — standard planning, code review, medium complexity analysis
- **opus** — complex architecture, ambiguous requirements, deep debugging

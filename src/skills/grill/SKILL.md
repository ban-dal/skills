# /grill — Deep requirement elicitation

Run a structured requirements interview BEFORE any planning or implementation.

## Steps
1. Identify what the user wants (feature / fix / refactor / architecture)
2. Ask 6–10 pointed questions in a single batch covering:
   - **Scope**: What's explicitly in? What's explicitly out?
   - **Success criteria**: How do we know it's done correctly?
   - **Constraints**: Performance, bundle size, compatibility, deadline?
   - **Edge cases**: What can fail? What's empty or unexpected?
   - **Dependencies**: Which other components or systems are affected?
   - **Priority**: If only 80% is feasible, which 80%?
3. Wait for complete answers — do not proceed until they are given
4. Summarize your understanding in bullet points
5. State your implementation approach in 3–5 steps
6. Ask: "Does this match what you had in mind?"

## Rules
- Never start coding before the interview is complete
- Never ask questions one at a time — batch them all
- Never proceed without the user's explicit confirmation

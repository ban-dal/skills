---
name: codex-implementer
description: Codex에 구현을 위임할 때(/codex:rescue --background) 브리프에 그대로 포함할 구현 규약.
---

# 구현 규약 — 브리프에 아래 전문을 그대로 포함한다

```text
You are implementing a pre-approved plan. The design decisions are already made — execute them faithfully.

- Follow the existing structure of the codebase. Do NOT split files or extract functions
  beyond what the plan specifies — unnecessary file/function decomposition is the most
  common quality defect we see. Prefer editing existing files over creating new ones.
- Match surrounding conventions exactly: naming, formatting, error handling, comment density.
- If the plan is ambiguous on a design decision, stop and report the question instead of guessing.
- Verify with the commands given in the brief (or the cheapest sufficient check) and report
  the results plainly — if something failed or was skipped, say so.
```

# 브리프에 추가로 채울 것

규약 전문 뒤에, 대화를 못 본 사람도 실행할 수 있도록 다음을 채운다:

1. **목표와 수용 기준** — "X 하면 Y" 형태로 체크 가능하게
2. **변경 파일 목록**과 참고할 기존 구현 경로 (컨벤션의 원본)
3. **하지 않을 것** — 스코프 밖 명시
4. **검증 명령** — typecheck, 테스트, 수동 확인 절차

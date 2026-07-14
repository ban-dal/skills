---
name: subagent-implementer
description: 메인 세션이 구현 서브 에이전트를 직접 생성할 때 브리프에 포함할 구현·회수 규약.
---

# 구현 규약 — 브리프에 아래 전문을 그대로 포함한다

```text
You are implementing a pre-approved plan. Execute it faithfully.

- Preserve concurrent changes and work only within your assigned ownership.
- Keep existing file and function boundaries unless the plan changes them.
- Make intent visible through names and structure, types and state models, tests, then essential
  nearby comments. Create documentation only for decisions or alternatives code cannot express
  (ADRs), domain language (glossaries), and code navigation (short link chains).
- Use comments only for a decision's reason, an invariant, or a non-obvious risk, next to the
  relevant code.
- Write Korean comments as plain active sentences. Avoid translation-like phrasing such as
  `~에 대해`, `~를 통해`, `~에 의해`, double passives, needless `~할 수 있다`, and lists of
  abstract nouns.
- When adding or renaming a test, write its title in Korean and include both the input or
  situation and the expected result.
- If the plan requires an unmade design decision, report the question and stop.
- Run the brief's verification commands and report failures or skipped checks.
- Put exactly one status alone on the first line: "STATUS: DONE" (implemented and verified),
  "STATUS: BLOCKED" (stopped for a question), or "STATUS: FAILED" (verification failed).
```

# 브리프 필수 항목

1. **목표와 수용 기준** — "X 하면 Y" 형태로 체크 가능하게
2. **소유 범위** — 담당 파일·모듈·책임과 병렬 작업자의 범위
3. **참고할 기존 구현 경로** — 컨벤션의 원본
4. **범위 경계** — 포함할 것과 제외할 것
5. **검증 명령** — typecheck, 테스트, 수동 확인 절차

# 회수 후 — STATUS 라인부터 분류한다

실행 완료와 작업 성공을 구분한다. 최종 응답 첫 줄의 STATUS로 판정한다.

- **STATUS: DONE** — diff를 메인 세션이 리뷰·검증한다. 고칠 곳이 3곳 이하면 직접
  고치고, 그 이상이면 같은 서브 에이전트에 구체적인 피드백을 담아 후속 작업을 보낸다.
- **STATUS: BLOCKED** — 브리프·코드베이스로 판단 가능하면 메인 세션이 결정해 같은
  에이전트에 답하고, 사용자 결정이 필요하면 사용자에게 묻는다.
- **STATUS: FAILED** — 구현상 실패면 같은 에이전트에 피드백을 보내고, 인프라 사유
  (타임아웃·중단·환경 오류)면 같은 `model`과 `reasoning_effort`를 명시해 새 에이전트를
  생성한다.
- **STATUS 라인이 없음** — 결과 전문에서 질문이나 미완료 항목을 확인한 뒤 판정한다.

---
name: subagent-implementer
description: 메인 세션이 구현 서브 에이전트를 직접 생성할 때 브리프에 포함할 구현·회수 규약.
---

# 스폰 — 모델과 reasoning effort를 반드시 명시한다

Agent tool로 구현 서브 에이전트를 직접 생성한다. 외부 vendor 플러그인이나 별도 세션
중계 명령을 사용하지 않는다.

모든 스폰에는 다음 값을 빠짐없이 전달한다:

- `model`: 작업에 필요한 코딩·추론 성능에 맞는 모델
- `reasoning_effort` 또는 도구가 요구하는 동등한 `effort`: 작업의 판단 난이도에 맞는 값

둘 중 하나라도 생략해 메인 세션 설정을 상속하게 두지 않는다. 선택 기준은
`../SKILL.md`의 "스폰 불변식"을 따른다. 역할명이나 고정 기본값만으로 선택하지 않는다.

# 구현 규약 — 브리프에 아래 전문을 그대로 포함한다

```text
You are implementing a pre-approved plan. The design decisions are already made — execute them faithfully.

- You are not alone in the codebase. Do not revert or overwrite changes made by others;
  accommodate concurrent changes and stay within the files or responsibility assigned to you.
- Follow the existing structure of the codebase. Do NOT split files or extract functions
  beyond what the plan specifies — unnecessary file/function decomposition is the most
  common quality defect we see. Prefer editing existing files over creating new ones.
- Match surrounding conventions exactly: naming, formatting, error handling, comment density.
- If the plan is ambiguous on a design decision, stop and report the question instead of guessing.
- Verify with the commands given in the brief (or the cheapest sufficient check) and report
  the results plainly — if something failed or was skipped, say so.
- Begin your final message with exactly one status line, alone on the first line:
  "STATUS: DONE" (plan implemented and verified), "STATUS: BLOCKED" (you stopped on a
  question — list the question(s) immediately below), or "STATUS: FAILED" (attempted but
  verification did not pass). Never omit this line.
```

# 브리프에 추가로 채울 것

규약 전문 뒤에, 대화를 못 본 에이전트도 실행할 수 있도록 다음을 채운다:

1. **목표와 수용 기준** — "X 하면 Y" 형태로 체크 가능하게
2. **소유 범위** — 담당 파일·모듈·책임과 병렬 작업자의 범위
3. **참고할 기존 구현 경로** — 컨벤션의 원본
4. **하지 않을 것** — 스코프 밖 명시
5. **검증 명령** — typecheck, 테스트, 수동 확인 절차

# 실행 중 감독

독립적인 하위 작업만 병렬로 생성한다. 서브 에이전트가 도는 동안 메인 세션은 다음 브리프
작성과 완료된 diff 리뷰를 계속한다. 중간 보고가 브리프의 전제와 어긋나거나 담당 범위를
침범하면 완료를 기다리지 말고 메시지나 중단 기능으로 개입한다.

# 회수 후 — STATUS 라인부터 분류한다

**완료된 에이전트가 곧 성공한 에이전트는 아니다.** 최종 응답 첫 줄의 STATUS 라인으로
분류하기 전에는 완료 처리하지 않는다.

- **STATUS: DONE** — diff를 메인 세션이 리뷰·검증한다. 고칠 곳이 3곳 이하면 직접
  고치고, 그 이상이면 같은 서브 에이전트에 구체적인 피드백을 담아 후속 작업을 보낸다.
- **STATUS: BLOCKED** — 결과물이 아니라 질문이다. 브리프·코드베이스로 판단 가능하면
  메인 세션이 결정해 같은 에이전트에 답하고, 진짜 사용자 몫인 사안이면 사용자에게 묻는다.
- **STATUS: FAILED** — 구현상 실패면 같은 에이전트에 피드백을 보내고, 인프라 사유
  (타임아웃·중단·환경 오류)면 같은 `model`과 `reasoning_effort`를 명시해 새 에이전트를
  생성한다.
- **STATUS 라인이 없음** — 규약 위반이자 의심 신호다. diff 리뷰 전에 결과 전문을 읽고
  질문·미완료 보고가 묻혀 있지 않은지 확인한다.

---
name: workflow-architect
description: |
  복잡하거나 작업 유형이 모호한 개발 요청을 받으면, 바로 구현하지 않고 작업을 분류해
  실행 가능한 Workflow(작업 계획)를 설계한다. 코드를 짜지 않는 "설계자"다.

  다음과 같은 요청에서 사용한다:
  "이 큰 작업 어떤 순서로 진행하지", "계획부터 세워줘", "이건 기능인지 리팩터인지 애매한데",
  "리팩터링 + 성능 작업을 같이 해야 해", "Task로 쪼개고 병렬 실행 계획 세워줘".

  단일 작업 유형이 명확하면(순수 기능 구현, 순수 버그 수정 등) 전용 하위 Skill에 양보한다.
  Prompt Engineering이 아니라 Workflow Engineering. 모델 비종속(Claude Code / Codex / Cursor).
---

# Workflow Architect

복잡한 개발 작업의 **Workflow(실행 계획)**를 설계하는 1단계 메타 Skill이다. 코드를 작성하지 않고,
작업을 어떤 순서·규칙으로 진행할지를 정한다. 새 Skill 파일을 만들지 않는다 — 산출물은 항상 이 작업의 Workflow다.

공통 원칙은 한 곳에만 있다. 설계 전에 읽는다:

- [`references/principles.md`](references/principles.md) — 철학, 순서 규칙, Task 분해 기준, 리뷰·검증 메뉴
- [`references/agent-strategy.md`](references/agent-strategy.md) — 의존성 분류, 병렬 판단, Agent Task Card
- [`references/output-contract.md`](references/output-contract.md) — Workflow 출력 형식

## 역할

이 Skill은 "구현자"가 아니라 "설계자"다. 하는 일은 넷뿐이다.

1. **분류** — 요청을 작업 유형으로 라벨링한다.
2. **위임** — 전용 하위 Skill이 있으면 그 `SKILL.md`를 읽고 따른다("이 파일을 읽고 따르라").
3. **Generic 설계** — 전용 Skill이 없으면 `references/`의 공통 원칙으로 Workflow를 직접 출력한다.
4. **다중 타입 조율** — 여러 유형에 걸치면 실행 순서·머지 지점·통합 검증 게이트를 정한다.

단일 유형이 명확하면 메타는 빠지고 하위 Skill에 길을 비켜준다. *모호·다중·미분류*일 때만 전면에 선다.

## 분류 → 위임 표

| 작업 유형 | 위임 대상 | 상태 |
|---|---|---|
| 기능 구현 | `implement-feature` | 전용 |
| 버그 수정 | `bugfix` | 전용 |
| 리팩터링 | `refactor` | 전용 |
| 코드 리뷰 | `review` | 전용 |
| 테스트 작성 | `test-generator` | 전용 |
| 성능 개선 | `performance` | 전용 |
| 마이그레이션 | `migration` | 전용 |
| 미분류 | — | generic |

"미작성 → generic"은 전용 Skill이 아직 없으니, 공통 원칙으로 Workflow를 직접 설계하라는 뜻이다.

## Workflow

1. **분류** — 요청을 위 표의 한 유형(또는 여러 유형, 또는 미분류)으로 라벨링한다.
   - *완료*: 유형 1개 이상 + 단일/다중/미분류 판정이 적혀 있다.
2. **경로 선택** — 전용 위임 / generic 설계 / 다중 조율 중 하나를 고른다.
   - *완료*: 선택한 경로와 근거가 적혀 있다.
3. **설계 실행** — 위임이면 하위 `SKILL.md`를 읽고 그 절차를 따른다. generic이면 `references/principles.md`의 순서대로 Workflow를 만든다.
   - *완료*: `output-contract.md` 형식의 Workflow가 만들어졌다.
4. **(다중일 때) 조율** — 하위 Workflow들의 실행 순서, 공유 지점 머지, 통합 검증 게이트를 더한다.
   - *완료*: 유형 간 순서표와 통합 "검증 완료" 기준이 있다.

## Decision Point

- **단일 유형이 명확한가?** → 메타가 개입하지 말고 해당 하위 Skill을 직접 쓴다.
- **유형이 모호한가?** → 분류 근거를 적고 가장 가까운 유형으로 위임하거나 generic으로 설계한다.
- **여러 유형에 걸치는가?** → 각 유형을 하위에 위임하되, 순서·머지·통합 검증은 메타가 소유한다.
- **공유 인터페이스를 건드리는가?** → 그 작업을 "머지 후" Task로 격리한다(agent-strategy.md).

## Anti-pattern

- ❌ **새 Skill 파일을 생성하려 한다** — 메타는 workflow를 만들지 skill을 만들지 않는다.
- ❌ 공통 원칙을 이 본문에 다시 적는다 — 원칙은 `references/`가 단일 출처다.
- ❌ 단일 유형이 명확한데도 메타가 끼어들어 context를 낭비한다.
- ❌ 분류를 건너뛰고 바로 Task부터 쪼갠다.

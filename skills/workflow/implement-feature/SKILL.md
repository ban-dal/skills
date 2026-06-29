---
name: implement-feature
description: |
  새 기능 구현 요청을 받으면 바로 코드를 짜지 않고, 요구 분석부터 검증까지의
  Workflow(작업 계획)를 먼저 설계한다.

  다음과 같은 요청에서 사용한다:
  "결제 기능 추가해줘", "이 화면/엔드포인트 만들어줘", "사용자가 X 할 수 있게 해줘",
  "새 기능인데 계획부터 세워줘".

  기존 동작을 고치는 작업이면 bugfix에, 구조만 바꾸는 작업이면 refactor에 양보한다.
  Workflow Engineering. 모델 비종속(Claude Code / Codex / Cursor).
---

# Implement Feature Workflow

새 기능 구현 작업의 **Workflow(실행 계획)**를 설계한다. 코드를 짜는 것이 아니라, 어떤 순서로 구현할지를 정한다.

공통 원칙·형식은 단일 출처를 따른다(설계 전에 읽는다):

- [`../workflow-architect/references/clarification-gate.md`](../workflow-architect/references/clarification-gate.md) — 0단계 명확화 게이트(domain-modeling → grilling)
- [`../workflow-architect/references/principles.md`](../workflow-architect/references/principles.md) — 순서 규칙, Task 분해 기준, 검증 메뉴
- [`../workflow-architect/references/agent-strategy.md`](../workflow-architect/references/agent-strategy.md) — 병렬 판단, Orchestration Gate, Agent Task Card
- [`../workflow-architect/references/output-contract.md`](../workflow-architect/references/output-contract.md) — 출력 형식

## 이 유형의 고유 절차

공통 순서(문제·목표 → Task → 의존성 → 병렬 → Agent → 리뷰 → 검증) 위에서, 기능 구현은 아래를 추가로 한다.

0. **명확화 게이트** — 설계 시작 전 [`clarification-gate.md`](../workflow-architect/references/clarification-gate.md)를 통과한다. llm-wiki로 도메인을 끌어온 뒤(domain-modeling), 수용 기준·범위 경계·엣지 케이스가 비면 그 빈칸만 캐묻는다(grilling).
   - *완료*: 게이트 통과 조건 충족, 또는 사용자가 위임.

1. **기능 요구사항 분석** — 사용자가 무엇을 못 하고 있고 이 기능이 무엇을 가능케 하는가. 수용 기준(acceptance criteria)을 체크 가능한 문장으로.
   - *완료*: 수용 기준이 "X 하면 Y" 형태로 적혀 있다.
2. **설계가 필요한 부분 식별** — 데이터 모델 · API 계약 · UI 상태 중 *먼저 결정해야* 진행 가능한 지점을 찾는다.
   - *완료*: 선결 설계 결정 목록이 있다(없으면 "없음").
3. **계층별 Task 분리** — 기능을 보통 데이터/API · UI · 상태 · 검증 계층으로 쪼갠다. 각 Task에 완료 기준과 예상 변경 파일 범위.
   - *완료*: 모든 Task가 분해 기준(principles.md)을 만족한다.
4. **계약 우선 병렬화 판단** — API/타입 계약을 먼저 고정하면 서버·UI를 병렬로 분리할 수 있는지 본다.
   - *완료*: 병렬/순차/머지-후 분류 + Orchestration Mode 여부 + 위임 또는 병렬 작업의 Agent Task Card.
5. **완료·검증 기준** — 수용 기준 기반 통합 테스트를 검증으로. 권한·입력 변경이면 보안 확인 추가.
   - *완료*: "검증 완료" 기준이 수용 기준과 연결돼 있다.

## Decision Point

- **기존 테스트가 없는가?** → 테스트 골격 Task를 선행 의존성으로 둔다.
- **외부 API/다른 팀에 의존하는가?** → 계약(mock)을 먼저 합의해 양쪽을 병렬화한다.
- **공유 라우팅·설정을 건드리는가?** → 그 배선 작업을 "머지 후" Task로 격리한다.
- **새 플로우가 라우팅·상태·API·테스트 중 2개 이상을 함께 바꾸는가?** → `agent-strategy.md`의 Orchestration Gate를 적용한다.

## 출력

[`output-contract.md`](../workflow-architect/references/output-contract.md) 8항목 형식으로 이 기능의 Workflow를 출력한다. 새 Skill 파일을 만들지 않는다.

## Anti-pattern

- ❌ 계약 합의 없이 서버·UI를 동시에 시작 → 통합 시 충돌.
- ❌ 수용 기준 없이 Task부터 쪼갠다(완료를 판정할 수 없음).
- ❌ "완료"를 구현 끝으로 정의(통합 검증 누락).

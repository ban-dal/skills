---
name: performance
description: |
  성능 개선·최적화 요청을 받으면 추측으로 코드를 깎지 않고, 측정 기준부터
  Before/After 검증까지의 Workflow(작업 계획)를 먼저 설계한다.

  다음과 같은 요청에서 사용한다:
  "이거 느려요", "응답 시간 줄여줘", "메모리 너무 먹어", "이 쿼리/루프 최적화해줘",
  "처리량 올리고 싶어".

  구조만 정리하면 refactor에, 동작이 틀린 거면 bugfix에 양보한다.
  Workflow Engineering. 모델 비종속(Claude Code / Codex / Cursor).
---

# Performance Workflow

성능 개선 작업의 **Workflow(실행 계획)**를 설계한다. 코드를 깎는 게 아니라, **무엇을 측정하고 어디를 고칠지**를 먼저 정한다. 성능 작업이 가장 자주 실패하는 지점은 하나 — 측정 없이 추측으로 엉뚱한 곳을 깎는 것. 그래서 규칙은 **측정 먼저, 최적화 나중**이다.

공통 원칙·형식은 단일 출처를 따른다(설계 전에 읽는다):

- [`../workflow-architect/references/principles.md`](../workflow-architect/references/principles.md) — 순서 규칙, Task 분해 기준, 검증 메뉴
- [`../workflow-architect/references/agent-strategy.md`](../workflow-architect/references/agent-strategy.md) — 병렬 판단, Agent Task Card
- [`../workflow-architect/references/output-contract.md`](../workflow-architect/references/output-contract.md) — 출력 형식

## 이 유형의 고유 절차

공통 순서 위에서, 성능 개선은 아래를 추가로 한다.

1. **목표와 측정 기준 정의** — "더 빠르게"를 측정 가능한 목표로 바꾼다. 어떤 지표(지연 p50/p99·처리량·메모리·비용)인지, 현재 baseline이 얼마인지, 목표 수치가 얼마인지. baseline 없이는 개선을 입증할 수 없다.
   - *완료*: 측정 지표 + 현재 baseline + 목표 수치가 있다.
2. **측정으로 병목 식별 (추측 금지)** — 프로파일링·계측으로 *실제* 병목을 지목한다. 어디가 느린지 직감으로 정하지 않는다 — 대개 직감은 틀린다.
   - *완료*: 측정 데이터가 병목을 지목한다(추측이 아니라).
3. **가설 기반 개선 Task 분해** — 각 최적화는 가설이다: "이걸 바꾸면 이 지표가 이만큼 개선된다". 한 Task에 한 가설만, 각자 독립적으로 측정 가능하게. 한 번에 여러 변경을 섞으면 무엇이 효과였는지 분리할 수 없다.
   - *완료*: 각 Task가 "변경 → 예상 개선" 가설 + 측정 방법을 갖는다.
4. **Before/After 검증** — 각 변경을 baseline 대비 측정해, 지표를 실제로 움직인 것만 남긴다. 동시에 정확성과 *다른* 지표(한쪽을 빠르게 하려다 메모리가 터지는 것)의 회귀를 확인한다.
   - *완료*: 각 개선이 baseline 대비 측정으로 입증됐고, 동작·다른 지표 회귀가 없다.

## Decision Point

- **측정 환경이 대표성이 있는가?** → 프로덕션과 다른 데이터·부하로 잰 벤치는 거짓 신호다. 대표 부하·데이터로 측정한다.
- **병목의 종류가 무엇인가?** → 처방이 갈린다: 알고리즘(자료구조·복잡도) · I/O(배치·캐시·N+1) · 경합(락·동시성) · 할당(메모리·GC). 분류부터 하고 맞는 처방을 고른다.
- **정확성·가독성을 희생하는 최적화인가?** → 기본은 금지. 꼭 필요하면 트레이드오프를 명시하고 승인받은 뒤, 그 지점에 주석·테스트로 못 박는다.
- **독립적인 병목이 여럿인가?** → 병렬 Agent를 검토하되, 공유 측정 환경·벤치 하네스에서 충돌하지 않도록 격리한다(agent-strategy.md).

## 출력

[`output-contract.md`](../workflow-architect/references/output-contract.md) 형식으로 이 성능 작업의 Workflow를 출력한다. 검증 항목은 "목표 지표가 baseline 대비 개선됨 + 정확성·타 지표 무손상"으로 채운다.

## Anti-pattern

- ❌ 측정 없이 추측으로 최적화한다 — 엉뚱한 곳을 깎고 병목은 그대로다.
- ❌ baseline 없이 시작한다 — 개선을 입증할 수 없다.
- ❌ 한 번에 여러 변경 — 무엇이 효과였는지 분리 불가.
- ❌ 미세 최적화에 매달려 정확성·가독성을 깎는다(목표 지표와 무관하게).

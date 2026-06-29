---
name: migration
description: |
  마이그레이션·버전 전환·대규모 이행 요청을 받으면 한 번에 갈아엎지 않고,
  단계적 전환과 롤백까지의 Workflow(작업 계획)를 먼저 설계한다.

  다음과 같은 요청에서 사용한다:
  "라이브러리 A에서 B로 옮겨줘", "DB 스키마 바꿔야 해", "API v1 → v2 이행",
  "프레임워크 업그레이드", "이 데이터 구조 전환해줘".

  구조만 바꾸고 동작은 그대로면 refactor에 양보한다.
  Workflow Engineering. 모델 비종속(Claude Code / Codex / Cursor).
---

# Migration Workflow

마이그레이션 작업의 **Workflow(실행 계획)**를 설계한다. 한 번에 갈아엎는 게 아니라, **무엇이 깨지면 안 되는지**를 정하고 **되돌릴 수 있는 단계**로 전환을 쪼갠다. 마이그레이션이 가장 자주 실패하는 지점은 둘 — 빅뱅 컷오버로 롤백 경로를 잃는 것, 그리고 rollout 중 버전 혼재의 호환성을 무시하는 것. 그래서 규칙은 **단계적 전환, 각 단계는 가역**이다.

공통 원칙·형식은 단일 출처를 따른다(설계 전에 읽는다):

- [`../workflow-architect/references/principles.md`](../workflow-architect/references/principles.md) — 순서 규칙, Task 분해 기준, 검증 메뉴
- [`../workflow-architect/references/agent-strategy.md`](../workflow-architect/references/agent-strategy.md) — 병렬 판단, Agent Task Card
- [`../workflow-architect/references/output-contract.md`](../workflow-architect/references/output-contract.md) — 출력 형식

## 이 유형의 고유 절차

공통 순서 위에서, 마이그레이션은 아래를 추가로 한다.

1. **전환 범위와 불변식 정의** — 무엇에서(from) 무엇으로(to) 가는가, 그리고 *전환 내내 깨지면 안 되는 동작*(불변식)이 무엇인가. 누가 이 대상에 의존하는가.
   - *완료*: from/to 상태 + "전환 내내 보존할 동작" 목록 + 의존 소비자 목록이 있다.
2. **호환성 위험 식별** — 깨질 수 있는 계약(API·데이터 형태·시그니처), rollout 중 신·구 버전이 동시에 도는 구간(version skew), 비가역 지점(삭제·되돌릴 수 없는 변환)을 짚는다.
   - *완료*: 호환성 위험 + 영향 소비자 + 비가역 지점이 표시돼 있다.
3. **단계적 전환 계획** — 각 단계가 독립 배포·롤백 가능하도록 쪼갠다. 빅뱅 컷오버 대신 expand-contract(추가 → 병행 → 전환 → 제거)·parallel run·strangler 같은 점진 패턴을 쓴다.
   - *완료*: 어떤 단계도 빅뱅이 아니고, 각 단계가 독립 배포·되돌리기 가능하다.
4. **롤백 전략과 검증 게이트** — 단계마다 "어떻게 되돌리는가"와 "다음으로 넘어가기 전 무엇으로 검증하는가"를 붙인다. 비가역 단계(삭제)는 검증을 통과한 뒤 *맨 마지막*에 둔다.
   - *완료*: 각 단계에 롤백 절차 + 진행 전 검증 게이트가 있고, 비가역 단계가 끝에 격리돼 있다.

## Decision Point

- **데이터 마이그레이션인가?** → expand-contract로: 새 칼럼/구조 추가 → 이중 쓰기 → 백필 → 읽기 전환 → 구 구조 제거. 비가역 삭제는 검증 후 마지막에.
- **무중단이 필요한가?** → feature flag·parallel run으로 점진 전환하고, 즉시 되돌릴 롤백 경로를 항상 확보한다.
- **소비자가 외부·다른 팀인가?** → 호환 계층과 deprecation 기간을 두고 신·구를 병행해, 양쪽을 끊지 않고 옮긴다.
- **빅뱅이 불가피한가?** → 리허설·백업·롤백 윈도우를 명시하고 검증 게이트를 최대화한다. 그래도 가능한 한 쪼갤 길을 먼저 찾는다.
- **단계들이 독립적인가?** → 병렬 Agent를 검토하되, 공유 스키마·설정·배포 파이프라인 변경은 "머지 후" Task로 격리한다(agent-strategy.md).

## 출력

[`output-contract.md`](../workflow-architect/references/output-contract.md) 형식으로 이 마이그레이션의 Workflow를 출력한다. 검증 항목은 "각 단계에서 불변식 보존 + 롤백 가능 + 진행 전 게이트 통과"로 채운다.

## Anti-pattern

- ❌ 빅뱅 컷오버 — 롤백 경로를 잃고, 장애 시 전체가 멈춘다.
- ❌ 롤백 계획 없이 전환을 시작한다.
- ❌ 비가역 단계(삭제·파괴적 변환)를 검증 전에 실행한다.
- ❌ rollout 중 신·구 버전 혼재의 호환성을 무시한다.

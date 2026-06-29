---
name: refactor
description: |
  리팩터링·구조 개선 요청을 받으면 바로 코드를 옮기지 않고, 동작 보존을 보장하는
  Workflow(작업 계획)를 먼저 설계한다.

  다음과 같은 요청에서 사용한다:
  "이 코드 정리해줘", "중복 합쳐줘", "이 모듈 쪼개줘", "구조 바꾸고 싶은데",
  "네이밍/추상화 개선해줘".

  새 동작을 추가하면 implement-feature에, 버그를 고치면 bugfix에 양보한다.
  Workflow Engineering. 모델 비종속(Claude Code / Codex / Cursor).
---

# Refactor Workflow

리팩터링 작업의 **Workflow(실행 계획)**를 설계한다. 코드를 옮기는 것이 아니라, **동작을 보존하면서** 어떤 순서로 바꿀지를 정한다. 리팩터링의 정의가 곧 제약이다 — 겉보기 동작은 그대로 두고 내부 구조만 바꾼다. 동작이 바뀌면 그건 리팩터링이 아니라 기능 변경이거나 버그다.

공통 원칙·형식은 단일 출처를 따른다(설계 전에 읽는다):

- [`../workflow-architect/references/clarification-gate.md`](../workflow-architect/references/clarification-gate.md) — 0단계 명확화 게이트(domain-modeling → grilling)
- [`../workflow-architect/references/principles.md`](../workflow-architect/references/principles.md) — 순서 규칙, Task 분해 기준, 검증 메뉴
- [`../workflow-architect/references/agent-strategy.md`](../workflow-architect/references/agent-strategy.md) — 병렬 판단, Orchestration Gate, Agent Task Card
- [`../workflow-architect/references/output-contract.md`](../workflow-architect/references/output-contract.md) — 출력 형식

## 이 유형의 고유 절차

공통 순서 위에서, 리팩터링은 아래를 추가로 한다.

0. **명확화 게이트 (영향 반경에 비례)** — 먼저 이 리팩터의 *영향 반경(blast radius)*을 가늠한다: 단일 심볼·파일 안에서 컴파일러·타입체커·IDE로 검증되는 기계적 변환(rename·extract·move)인가, 아니면 모듈·공개 경계를 넘는 구조 변경인가. (이건 빠른 분류다 — 3단계의 상세 영향 분석과 다르다. 이후 단계가 이 반경을 재사용한다.)
   - **저반경(기계적·국소)**: 게이트를 가볍게 통과한다 — 목적 한 줄만 확인하고 llm-wiki 조회·grilling은 건너뛴다.
   - **고반경(구조·경계 횡단)**: [`clarification-gate.md`](../workflow-architect/references/clarification-gate.md)를 정식으로 통과한다(domain-modeling → 목적·범위 경계가 비면 grilling).
   - *완료*: 영향 반경이 판정됐고, 그에 맞는 게이트 통과 조건이 충족됐다(또는 사용자가 위임).

1. **목적과 동작 보존 기준 정의** — 왜 바꾸는가(목적)와, "이 동작은 절대 안 바뀐다"는 관찰 가능한 기준을 분리해 적는다. 목적 없는 리팩터링은 위험만 늘린다.
   - *완료*: 리팩터링 목적 1줄 + "보존할 외부 동작" 목록이 있다.
2. **안전망 확보 (반경에 비례)** — 동작 보존의 그물을 확보한다. 그물은 테스트만이 아니다 — 저반경 기계적 변환은 컴파일러·타입체커·IDE 검증이 곧 그물이다. 고반경·동작이 풍부한 코드인데 그 동작을 잠그는 테스트가 없으면, *리팩터 전에* 특성화 테스트 Task를 선행 의존성으로 둔다.
   - *완료*: 반경에 맞는 안전망이 있다 — 도구 검증으로 충분하거나, 보존 대상 동작이 테스트로 잠겼거나, 그 테스트를 만드는 선행 Task가 있다.
3. **영향 범위와 회귀 위험 분석** — 누가 이 코드를 호출하는가(공개 API·호출부·암묵 의존). 닿는 경계가 넓을수록 위험이 크다.
   - *완료*: 영향받는 파일·호출부 목록 + 회귀 위험 지점이 표시돼 있다.
4. **리뷰 가능한 의도 단위로 분해** — 각 Task는 *하나의 리뷰 가능한 의도*를 갖는다(principles.md의 리뷰 단위 기준). "extract payment service"처럼 여러 기계적 변환이 한 의도면 한 Task다 — 변환 개수로 쪼개지 않는다. 단, 각 Task 경계에서 보존 테스트가 그린이고 되돌릴 수 있어야 한다(가역성).
   - *완료*: 각 Task가 하나의 리뷰 가능한 의도 + "경계에서 보존 테스트 그린·가역" 조건을 만족한다.
5. **회귀 중심 검증** — 단계마다 + 전체 끝에 기존 테스트·특성화 테스트가 그대로 통과해야 한다. 외부 동작 차이가 0임이 검증의 목표다.
   - *완료*: "전 단계에서 동작 보존 테스트 무손상"이 검증 완료 기준이다.

## Decision Point

- **안전망이 없는가?** → 고반경이면 특성화 테스트 Task를 선행 의존성으로 못 박는다. 저반경 기계적 변환이면 도구 검증(컴파일러·타입체커·IDE)으로 갈음한다. 그물 없이 구조를 흔들지 않는다.
- **리팩터 중 버그를 발견했는가?** → 그 자리에서 고치지 않는다(동작 보존이 깨지고 회귀 추적이 오염된다). ① 특성화 테스트로 *현재의(버그 포함) 동작*을 잠가 리팩터가 그 동작을 보존하게 한다, ② 버그는 별도 bugfix Task 후보로 등록한다, ③ 리팩터 완료·검증 후 bugfix로 넘긴다.
- **공개 API를 바꾸는가?** → 그건 순수 리팩터링이 아니다. 호환 계층/마이그레이션을 별도 Task로 분리하고 implement-feature·migration 성격을 함께 고려한다.
- **여러 모듈에 걸치고 충돌이 적은가?** → 모듈별 파일 범위로 병렬 Agent를 검토한다(agent-strategy.md). 단, 공유 인터페이스 변경은 "머지 후" Task로 격리한다.

## 출력

[`output-contract.md`](../workflow-architect/references/output-contract.md) 8항목 형식으로 이 리팩터링의 Workflow를 출력한다.

## Anti-pattern

- ❌ 안전망 없이 구조부터 바꾼다 → 동작 보존을 증명할 수 없다.
- ❌ 리팩터링에 기능 변경·버그 수정을 슬쩍 섞는다 → 회귀 원인 추적 불가, 리뷰 폭발.
- ❌ 큰 교체를 단일 Task로 → 중간 상태가 깨져 되돌릴 수 없다.

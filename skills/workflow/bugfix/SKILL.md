---
name: bugfix
description: |
  버그·장애 리포트를 받으면 추측 패치로 바로 고치지 않고, 재현부터 재발 방지까지의
  Workflow(작업 계획)를 먼저 설계한다.

  다음과 같은 요청에서 사용한다:
  "에러 고쳐줘", "이거 왜 안 돼", "프로덕션에서 X 터졌어", "가끔 결과가 틀려요",
  "회귀가 생긴 것 같아".

  새 동작을 추가하는 작업이면 implement-feature에 양보한다.
  Workflow Engineering. 모델 비종속(Claude Code / Codex / Cursor).
---

# Bugfix Workflow

버그 수정 작업의 **Workflow(실행 계획)**를 설계한다. 바로 고치는 것이 아니라, 재현→원인→수정→재발 방지 순서를 정한다.

공통 원칙·형식은 단일 출처를 따른다(설계 전에 읽는다):

- [`../workflow-architect/references/clarification-gate.md`](../workflow-architect/references/clarification-gate.md) — 0단계 명확화 게이트(domain-modeling → grilling)
- [`../workflow-architect/references/principles.md`](../workflow-architect/references/principles.md) — 순서 규칙, Task 분해 기준, 검증 메뉴
- [`../workflow-architect/references/agent-strategy.md`](../workflow-architect/references/agent-strategy.md) — 병렬 판단, Agent Task Card
- [`../workflow-architect/references/output-contract.md`](../workflow-architect/references/output-contract.md) — 출력 형식

## 이 유형의 고유 절차

공통 순서 위에서, 버그 수정은 아래를 추가로 한다.

0. **명확화 게이트** — 조사 전 [`clarification-gate.md`](../workflow-architect/references/clarification-gate.md)를 통과한다. llm-wiki로 도메인·과거 장애 이력을 끌어온 뒤(domain-modeling), 증상·재현 조건·기대 동작이 비면 그 빈칸만 캐묻는다(grilling).
   - *완료*: 게이트 통과 조건 충족, 또는 사용자가 위임.

1. **증상과 원인 가설 분리** — 관찰된 증상(기대 vs 실제)과 추정 원인을 명확히 구분한다. 원인은 아직 가설이다.
   - *완료*: 증상 1줄 + 원인 가설 목록이 분리돼 있다.
2. **재현 절차 정의** — 버그를 재현하는 최소 단계. 이것이 곧 실패하는 검증 케이스가 된다.
   - *완료*: 실패를 보이는 재현 케이스(테스트 또는 단계)가 있다.
3. **조사 Task와 수정 Task 분리** — 원인을 좁히는 조사와 실제 수정을 별도 Task로 둔다(순차 필수). 조사 Task의 내부 절차는 아래 [조사 방법(진단)](#조사-방법-진단)을 따른다.
   - *완료*: 조사 → 수정 의존성이 명시돼 있고, 조사 Task에 수렴 확정 기준이 붙어 있다.
4. **최소 수정 범위 정의** — 가설이 맞을 때 건드릴 최소 파일 범위. 무관한 리팩터링을 섞지 않는다.
   - *완료*: 변경 파일 범위가 최소로 좁혀져 있다.
5. **재발 방지 검증** — 재현 케이스 통과 + 전체 회귀. 프로덕션 장애면 배포 후 모니터링까지.
   - *완료*: "재현 케이스 통과 + 회귀 무손상"이 검증 완료 기준이다.

## 조사 방법 (진단)

3단계의 조사 Task가 따르는 절차. 버그 작업이 가장 자주 실패하는 지점이 여기다 — 엉뚱한 원인에 고착해
증상만 가린 패치를 내보내는 것. 이건 "더 잘 생각하기"가 아니라 **조사의 순서와 규칙**이다.

- **감별 진단** — 후보 원인을 *여러 개* 나열하고 가능성 순으로 정렬한다. 첫 가설에 조기 고착하지 않는다.
- **가장 싸게 가르는 실험 먼저** — 어떤 관측 하나가 후보 가설을 가장 빨리 둘로 쪼개는가. 그 실험부터 한다.
- **관측 먼저, 수정 나중** — 코드를 바꾸기 전에 로깅·계측으로 사실을 확정한다. 추측으로 코드부터 고치지 않는다.
- **이분 탐색** — 원인 위치가 넓으면 git 커밋·입력·설정을 반씩 갈라 범위를 좁힌다.
- **수렴 확정 기준** — 확정된 원인이 *관찰된 모든 증상*을 설명하고, 재현 케이스를 켜고 끌 수 있어야(원인 제거 시 재현 케이스가 통과) 수정 단계로 넘어간다.

*완료*: 확정 원인이 모든 증상을 설명하고 재현 케이스로 검증됐다 — 그 전엔 수정 Task를 시작하지 않는다.

## Decision Point

- **긴급 장애인가?** → 임시 완화(mitigation) Task를 선행으로 분리하고, 근본 수정은 후속으로.
- **재현이 안 되는가?** → 로깅·관측 추가 Task를 먼저 둔다(재현 없이는 수정 검증 불가).
- **원인이 여러 모듈에 걸치는가?** → 모듈별 파일 범위로 분리해 조사 Task를 병렬화한다.

## 출력

[`output-contract.md`](../workflow-architect/references/output-contract.md) 8항목 형식으로 이 버그의 Workflow를 출력한다. 대부분 단일 순차이므로 병렬·Agent 항목은 "해당 없음"이 될 수 있다.

## Anti-pattern

- ❌ 재현 없이 바로 패치 → 같은 버그 재발, 수정 검증 불가.
- ❌ 수정과 무관한 리팩터링을 함께 섞어 변경 범위를 키운다.
- ❌ 증상만 가리고 원인 가설을 검증하지 않는다.

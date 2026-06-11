---
name: llm-wiki
description: |
  로컬 LLM Wiki를 지식베이스로 초기화, 조회, 수집, 정리, 품질 점검한다.
  사용자가 "위키에서 찾아봐", "예전에 정리한 것 기준으로", "add to wiki", "LLM wiki", "기록해줘"라고 말하거나 작업이 과거 맥락, 의사결정, 트러블슈팅, 운영 장애, 재사용 가능한 프롬프트/워크플로우에 의존할 때 사용한다.
  개발 중 재사용 가치가 있는 맥락을 발견하면 Ingest -> Lint 루프로 기존 지식을 탐색·수정하고 log.md에 기록한다.
---

# /llm-wiki

로컬 LLM Wiki를 Agent가 읽고, 갱신하고, 검증하는 절차다. Wiki는 Agent가 다음 작업에서 다시 찾고 합성할 수 있는 지속 지식베이스다.

## Mode

먼저 작업 모드를 고른다.

- Query: 기존 지식을 읽고 답한다. 항상 read-only다.
- Ingest: 새 source나 작업 결과를 지식베이스에 반영한다. 사용자가 저장을 요청했거나, 사용자가 사전에 Wiki maintenance를 허용했을 때만 쓴다.
- Archive: Query 답변이나 대화 결과를 point-in-time 문서로 저장한다. 기존 article에 병합하지 않는다.
- Lint: Ingest 또는 Archive 뒤에 수행한다. 기본 범위는 이번 작업에서 건드린 topic과 `wiki/index.md`, `wiki/log.md`다. 전역 색인 불일치는 발견한 범위 안에서만 자동 수정하고, 전체 스캔이 필요하면 보고한다.

## Root

기본 위치는 `~/Documents/wiki`다. 없으면 사용자에게 위치를 묻는다. 첫 write 전에는 root가 맞는지 확인하고, 현재 환경에서 허용되지 않는 경로라면 승인을 받는다.

```text
raw/          # 원본 자료. 보존용, 재작성 금지
wiki/         # 가공된 지식 문서. Agent가 갱신
wiki/index.md # 전역 색인
wiki/log.md   # append-only 작업 로그
```

## Initialization

첫 Ingest 전에 `raw/`, `wiki/`, `wiki/index.md`, `wiki/log.md`를 생성한다. 이미 있는 파일은 덮어쓰지 않는다.

- `wiki/index.md`: `# Knowledge Base Index`
- `wiki/log.md`: `# Wiki Log`
- Query 또는 Lint 중 구조가 없으면 자동 생성하지 말고 "먼저 Ingest로 Wiki를 초기화해야 한다"고 알린다.

## Query

질문에 답하거나 과거 맥락이 필요한 작업을 시작할 때 수행한다.

1. `wiki/index.md`를 먼저 읽는다.
2. 관련 문서와 같은 topic의 인접 문서를 읽는다.
3. 필요하면 `raw/` 원본을 확인하되, 답변에는 필요한 핵심만 합성한다.
4. Wiki와 현재 repo 코드가 충돌하면 충돌을 밝히고 현재 코드와 실행 결과를 우선한다.
5. 대화 답변에는 참고한 wiki 문서를 project-root-relative markdown link로 짧게 남긴다.

Plain Query는 파일을 쓰지 않는다.

## Ingest

새 지식, 작업 결과, 사용자 요청으로 저장할 가치가 있는 맥락이 생기면 수행한다. Ingest는 항상 `raw` 저장과 `wiki` 반영을 함께 한다.

### Plan target

쓰기 전에 기존 지식을 먼저 탐색한다.

1. `wiki/index.md`를 읽는다.
2. 관련 topic, claim, slug를 `wiki/`에서 검색한다.
3. 결과를 `merge existing article`, `create new article`, `archive answer` 중 하나로 분류한다.
4. 쓸 raw 경로와 wiki 경로를 정한다. 기존 `raw/` 파일은 덮어쓰거나 삭제하지 않는다.

### Capture raw

1. source가 URL, 파일, 대화, 실행 로그 중 무엇인지 식별한다.
2. 가장 가까운 `raw/<topic>/`을 재사용하고, 뚜렷이 다를 때만 새 topic을 만든다.
3. `raw/<topic>/YYYY-MM-DD-descriptive-slug.md`로 저장한다. 날짜를 모르면 slug만 쓴다.
4. 원문, 출처, 수집일, 발행일(모르면 `Unknown`)을 보존한다. 의견이나 실패 기록을 미화하지 않는다.

### Compile wiki

1. 같은 핵심 주장이나 절차가 이미 있으면 기존 `wiki/<topic>/<article>.md`에 병합한다.
2. 새 개념이면 개념명을 파일명으로 새 문서를 만든다.
3. 여러 topic에 걸치면 가장 중심 topic에 두고 `See Also`로 연결한다.
4. 기존 지식과 충돌하면 삭제하지 말고 출처별 차이를 문서에 표시한다.
5. 관련 문서가 영향을 받으면 cascade update한다. archive 성격의 문서는 point-in-time 기록으로 두고 갱신하지 않는다.

## Article Format

문서는 짧고 검색 가능해야 한다.

```md
# Title

Updated: YYYY-MM-DD
Sources: author/org/date or conversation/task
Raw: ../../raw/topic/source.md

## Summary

## Details

## Status

- Confirmed:
- Suspected:
- Unknown:
- Next:

## Impact

## See Also
```

## Index And Log

Ingest 또는 Archive 후에는 색인과 로그를 갱신한다. Lint 후에는 수행한 수정 수와 남은 이슈를 `wiki/log.md`에 한 번 append한다.

- `wiki/index.md`: topic별 article link, 한 줄 summary, Updated 날짜를 유지한다.
- `wiki/log.md`: append-only로 남긴다.

```md
## YYYY-MM-DD | ingest | short-title

- Raw:
- Updated:
- Notes:
```

## Archive

사용자가 답변을 Wiki에 저장하라고 명시하면 Query 결과를 새 wiki 문서로 저장한다.

- 항상 새 문서로 저장하고 기존 지식 문서에 병합하지 않는다.
- `Sources`에는 답변에 사용한 wiki 문서를 연결한다.
- `Raw`는 쓰지 않는다.
- `wiki/index.md` summary 앞에 `[Archived]`를 붙인다.
- `wiki/log.md`에 `query | archived`를 남긴다.

## Lint

Ingest 또는 Archive 후에는 Lint를 수행한다.

자동 수정:

- index에 없는 wiki 문서 추가
- 존재하지 않는 index 항목에 `[MISSING]` 표시
- 단일 후보가 분명한 깨진 내부 링크 수정
- 존재하지 않는 Raw link가 단일 후보로 복구 가능하면 수정
- 같은 topic 안의 명백한 `See Also` 누락 보완

보고만 할 것:

- 출처 간 사실 충돌
- 최신 source에 의해 낡은 주장
- 고립 문서
- 자주 언급되지만 독립 문서가 없는 개념
- archive 이후 원문 지식이 크게 바뀐 문서

Lint 후 `wiki/log.md`에 수정 수와 남은 이슈를 기록한다.

## Record Candidates

개발, 디버깅, 리뷰, 배포 대응을 마치기 전에 아래에 해당하면 Ingest 후보로 본다.

- 운영 에러, 장애, 재현 어려운 버그, 고객 영향
- 임시 제거, 우회, 롤백, feature flag, degrade 처리
- 원인, 재현 조건, 장기 해결책, 공식 API 채택 여부가 미해결
- 특정 구현을 제거, 유지, 보류하기로 한 결정
- 안정성을 위해 기능 범위, UX, 성능, 관측 가능성 중 하나를 바꾼 tradeoff
- 특정 릴리스, 의존성 업데이트, 재발 시점에 다시 봐야 하는 trigger
- 재사용 가능한 프롬프트, 체크리스트, 조사 절차

사용자가 명시적으로 기록을 요청하면 Ingest한다. Agent가 후보를 발견했을 뿐이면 답변 말미에 제안하고, 사용자가 허용하거나 사전에 Wiki maintenance를 허용한 경우에만 쓴다. 확정하기 어려운 의사결정이나 개인/팀 컨벤션은 초안을 제안하고 확인을 받는다.

## Rules

- Wiki를 맹신하지 않는다. 오래된 문서보다 현재 코드, 실행 결과, 최신 source를 우선한다.
- 없는 히스토리와 출처를 만들지 않는다.
- Query는 절대 파일을 쓰지 않는다.
- `raw/`는 보존하고, 해석과 정리는 `wiki/`에 둔다.
- 기존 `raw/` 파일은 삭제하거나 덮어쓰지 않는다.
- 링크는 wiki 파일 내부에서는 현재 파일 기준 상대 경로, 대화에서는 project-root-relative 경로를 쓴다.
- `wiki/` topic은 한 단계만 둔다.
- 문서는 짧게 유지하고, 긴 원문은 raw에 둔다.

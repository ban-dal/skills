---
name: llm-wiki
description: |
  Obsidian 기반 프로젝트 메모리 저장소(~/Documents/wiki)를 읽고 갱신한다.

  과거 맥락이나 개인화된 컨텍스트가 있으면 더 나은 답변이 나오는 모든 요청에서
  응답 전에 Query 모드로 wiki를 먼저 조회한다.
  예: "이거 어떻게 해", "에러 고쳐줘", "우리 컨벤션은", "예전에 어떻게 했지",
      "추천해줘", "평소처럼 해줘", "이 프로젝트에서는"

  매 응답 종료 후 저장 가치가 있는 내용을 Ingest 모드로 wiki에 저장한다.
  Claude Code 환경에서는 Stop 훅으로 자동 실행, 그 외에는 <wiki-save> 태그로 제시한다.
---

# llm-wiki

`~/Documents/wiki`를 LLM 메모리로 사용하기 위한 읽기/쓰기 프로토콜.

---

## 디렉토리 구조

```
~/Documents/wiki/
├── index.md          # 전체 문서 목록 + 1줄 요약 (항상 먼저 읽는다)
├── raw/              # 대화에서 추출한 원문 메모 (날짜_주제.md)
└── topics/           # 정제된 주제별 문서 (구조는 자유롭게 확장)
```

---

## Query 모드

과거 맥락이나 개인화된 컨텍스트가 필요한 요청에서 응답 생성 전에 실행한다.

### 절차

```
1. ~/Documents/wiki/index.md 읽기
2. 요청과 관련된 문서 식별 — index의 when-to-use 필드를 기준으로 판단
3. 해당 문서 읽기 (없으면 스킵)
4. 취득한 컨텍스트를 응답에 자연스럽게 반영
```

### 규칙

- index.md가 없으면 wiki가 초기화되지 않은 것으로 판단하고 Query를 스킵한다
- 관련 문서가 없어도 "wiki에서 못 찾았습니다"를 출력하지 않는다 — 조용히 일반 응답으로 전환한다
- wiki 조회 사실을 사용자에게 설명하지 않는다 — 결과만 자연스럽게 반영한다

### 예시

**관련 문서가 있는 경우** — 컨텍스트를 응답에 반영한다

> 사용자: "Button 컴포넌트 만들어줘"

```
→ index.md 읽기
→ design-system.md의 when-to-use: "컴포넌트 생성·수정 요청 시"와 매칭
→ 컨벤션(Radix UI, variant, asChild 패턴) 반영한 코드 생성
```

**관련 문서가 없는 경우** — 조용히 일반 응답으로 전환한다

> 사용자: "Button 컴포넌트 만들어줘"

```
→ index.md 읽기 → 관련 문서 없음
→ 일반적인 방식으로 컴포넌트 코드 생성 (wiki 조회 사실 언급 안 함)
```

---

## Ingest 모드

대화에서 장기 보존 가치가 있는 정보를 탐지하여 **다음에 바로 꺼내 쓸 수 있는 형태**로 저장한다.

### 저장 가치 판단 기준

아래 중 하나에 해당하면 저장 대상이다:

| 카테고리 | 예시 |
|---|---|
| 명시적 결정 | "앞으로 이렇게 하자", "우리 컨벤션은 X" |
| 해결한 문제 | 에러 해결법, 삽질 끝에 찾은 방법 |
| 프로젝트 컨텍스트 | 구조, 의존성, 환경 설정, 중요 경로 |
| 개인 선호·습관 | 작업 스타일, 루틴, 반복되는 요청 패턴 |
| 인물·팀 정보 | 역할, 담당 도메인, 관계 |

저장하지 않는 것: 일회성 질문, 단순 사실 조회, 이미 wiki에 있는 내용의 단순 반복

### 패턴 승격 규칙

같은 주제가 반복 등장할 때 단순 누적이 아니라 패턴으로 승격한다:

```
1회: raw/ 에 원문 저장
2회: topics/ 신규 문서 생성 — 두 사례를 머지하여 일반화
3회+: 기존 topics/ 문서에 머지 — 예외·변형이 있으면 패턴에 흡수
```

예시:
```
1회: "sslmode=disable로 해결" → raw/20240115_pgvector.md
2회: "Docker에서도 같은 에러" → topics/errors/pgvector.md 생성
     (두 사례 머지 → "로컬/Docker 환경에서 공통 발생하는 SSL 패턴"으로 일반화)
```

### 저장 절차

```
1. 대화에서 저장 후보 추출
2. raw/ 에 원문 저장: raw/YYYYMMDD_<주제>.md
3. 패턴 승격 규칙에 따라 topics/ 문서 생성 또는 업데이트
4. index.md 갱신 (신규 문서인 경우)
```

### raw 파일 형식

```markdown
---
date: YYYY-MM-DD
source: conversation
tags: [태그1, 태그2]
---

[원문 또는 요약]
```

### topics 파일 형식

`when-to-use` 필드가 핵심이다 — Query 모드가 이 필드를 보고 관련성을 판단한다.

```markdown
---
updated: YYYY-MM-DD
tags: [태그1, 태그2]
when-to-use: "[이 문서를 꺼낼 상황을 1줄로 — Query 모드가 이 줄로 관련성 판단]"
---

# 주제명

## 상황
[언제 이 문제/패턴이 발생하는가]

## 해결 / 적용 방법
[바로 실행 가능한 형태로 기술]

## 주의사항
[예외, 금지 사항, 부작용]

## 히스토리
- YYYY-MM-DD: [변경 내용 또는 새 사례 추가]
```

### topics 파일 예시

```markdown
---
updated: 2024-03-01
tags: [pgvector, db, error]
when-to-use: "pgvector 또는 DB 연결 에러가 발생했을 때"
---

# pgvector 연결 에러

## 상황
로컬 및 Docker 환경에서 pgvector 연결 시 SSL 핸드셰이크 실패

## 해결 / 적용 방법
연결 문자열에 ?sslmode=disable 추가

## 주의사항
프로덕션에서는 SSL 비활성화 금지 — 스테이징 이하 환경에서만 사용

## 히스토리
- 2024-01-15: 로컬 환경에서 최초 발견
- 2024-03-01: Docker 환경에서 동일 패턴 재확인, 문서 일반화
```

### index.md 형식

`when-to-use`를 index에도 1줄로 노출한다 — 문서 전체를 열지 않고 관련성을 판단할 수 있도록.

```markdown
# Wiki Index

_last updated: YYYY-MM-DD_

## projects
- [design-system](topics/projects/design-system.md) — [when-to-use 1줄]
- ...

## errors
- [pgvector](topics/errors/pgvector.md) — [when-to-use 1줄]
- ...
```

---

## 환경별 Ingest 실행 방법

### Claude Code — Stop 훅 설정

`.claude/settings.json`에 추가:

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "claude -p 'llm-wiki Ingest 모드: 방금 종료된 대화 세션의 transcript를 읽고 저장 가치가 있는 내용을 ~/Documents/wiki에 조용히 저장하라. 저장 기준, 패턴 승격 규칙, 파일 형식은 llm-wiki SKILL.md를 따른다.'"
          }
        ]
      }
    ]
  }
}
```

Stop 훅은 매 응답 종료 시 자동 실행되므로 별도 트리거 없이 항상 작동한다.

### 웹/API 환경 — <wiki-save> 폴백

Stop 훅을 사용할 수 없는 환경에서는 응답 마지막에 저장 후보가 있을 경우에만 아래 형식으로 제시한다:

```
<wiki-save>
파일: topics/errors/pgvector.md
when-to-use: "pgvector 또는 DB 연결 에러가 발생했을 때"
내용: SSL 모드 문제 → ?sslmode=disable 추가로 해결, 프로덕션 금지
이유: 재현 가능한 트러블슈팅 패턴
</wiki-save>
```

저장 후보가 없으면 태그를 출력하지 않는다.

---

## 초기화

wiki가 없는 경우 (`index.md` 미존재) 사용자에게 초기화 여부를 묻는다:

```bash
mkdir -p ~/Documents/wiki/raw
mkdir -p ~/Documents/wiki/topics

cat > ~/Documents/wiki/index.md << 'EOF'
# Wiki Index

_last updated: YYYY-MM-DD_

EOF
```
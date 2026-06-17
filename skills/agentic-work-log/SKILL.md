---
name: agentic-work-log
description: |
  AI coding 작업 수행 시 한국어 Markdown 기록을 남긴다.
  같은 작업의 후속 수정 요청은 새 파일을 만들지 않고 기존 기록을 갱신한다.
---

# Agentic Work Log

## Overview

Create a compact, review-friendly Korean work log for an AI coding task. Prefer structured summaries, decision evidence, and generated templates over long free-form transcripts.

This skill combines four useful patterns:

- Superpowers-style finish summaries: changed files, validation, risks, and follow-ups.
- ADR-style decisions: context, options, decision, consequences.
- Changelog-style curation: record notable changes, not raw diffs.
- PR/Jira-ready summaries: purpose, code explanation, verification, and desired reviewer feedback.

## Workflow

1. 기록 작성 전에 작업 맥락을 수집한다:
   - 사용자 프롬프트. 짧으면 원문을 보존한다.
   - `interview-me` 사용 시 메인 모델의 질문과 사용자의 답변.
   - 사용한 skills, MCP/app tools, shell commands, scripts, 주요 외부 도구.
   - 변경 파일, 살펴본 주요 코드 경로, 실행한 테스트나 검사.
2. 이후 읽는 사람이 빠르게 이해할 수 있게 요약한다:
   - 문제와 목표 결과.
   - 주요 구현 결정, 배제한 대안, 받아들인 결과.
   - 동작 변경, 유지한 제약, 리뷰 진입점.
   - 검증 결과. 명령, 통과/실패, 실행하지 않은 검사를 포함한다.
   - 남은 리스크, 후속 작업, 가정.
   - 리뷰 요청 포인트, PR 코멘트 초안, Jira 코멘트 초안.
3. 최종 기록은 반드시 Markdown 파일(`.md`)로 남긴다. 반복되는 Markdown 섹션을 직접 쓰지 않기 위해서만 `scripts/create_work_log.js`와 임시 JSON 입력을 사용한다.
4. 저장 위치는 아래 Storage Policy를 따른다.
5. 같은 작업의 후속 리뷰/수정 요청은 새 파일을 만들지 말고 기존 로그 파일을 갱신한다. 서로 다른 작업이 시작됐거나, 사용자가 새 기록을 명시했거나, 관련 로그를 찾을 수 없을 때만 새 파일을 만든다.

## Storage Policy

기본 저장 위치는 작업 대상 프로젝트 루트의 `.agentic-work-log/`다.

- 기본 파일명: `.agentic-work-log/YYYY-MM-DD-short-task.md`
- 기록 파일을 만들기 전에 프로젝트의 `.gitignore`에 `.agentic-work-log/`가 있는지 확인한다.
- `.gitignore`가 있고 항목이 없으면 `.agentic-work-log/`를 추가한다.
- `.gitignore`가 없으면 새로 만들기 전에 사용자에게 확인한다.
- 팀에 공유해야 하는 공식 결정 기록이 아니라면 작업 로그를 tracked file로 만들지 않는다.

재사용 가치가 큰 내용은 작업 종료 시 `/llm-wiki` 로 기록한다.

- 반복될 가능성이 높은 트러블슈팅
- 프로젝트/개인 개발 컨벤션
- 이후에도 참고할 아키텍처/구현 결정
- 재사용 가능한 프롬프트나 워크플로우
- 운영 장애, 임시 완화, 미해결 원인, future trigger가 있는 내용

## Commands

임시 JSON 입력 템플릿 생성:

```bash
node path/to/agentic-work-log/scripts/create_work_log.js --print-template
```

로그 파일 생성:

```bash
node path/to/agentic-work-log/scripts/create_work_log.js --input worklog.json --out .agentic-work-log/2026-06-17-task.md
```

`--out`을 생략하면 스크립트는 Markdown을 stdout으로 출력한다.

## Writing Rules

- 기록은 사실 기반으로, 훑어보기 쉽게 쓴다.
- 기록 파일은 읽기 쉬운 Markdown으로 남긴다. JSON은 생성용 임시 입력으로만 사용한다.
- 기본적으로 `.agentic-work-log/`에 저장하고, 해당 폴더가 gitignore되어 있는지 확인한다.
- 섹션 제목과 자동 생성되는 fallback 문구는 한국어로 쓴다.
- 사용자 프롬프트 원문은 입력된 언어 그대로 보존하고, 긴 프롬프트 체인은 한국어로 요약한다.
- 반복되거나 긴 텍스트가 핵심 정보를 가리지 않게 한다. 본문에는 요약을 두고, 꼭 필요한 원문은 출처나 별도 raw 파일 경로로 참조한다.
- 같은 내용이 여러 번 반복되면 첫 발생과 최종 결정만 남기고, 중간 반복은 횟수나 범위로 요약한다.
- 짧은 프롬프트는 원문을 남기고, 긴 프롬프트 체인은 핵심 요구사항, 제약, 변경된 결정만 압축한다.
- 긴 명령 출력은 붙여 넣지 않는다. 명령 이름과 결과만 기록한다.
- 알 수 없거나 검증하지 못한 항목은 `기록되지 않음` 또는 `실행하지 않음`으로 표시한다.
- "무엇이 바뀌었는지"와 "왜 그 선택을 했는지"를 분리한다.
- 결정은 긴 설명보다 `맥락 -> 결정 -> 대안 -> 결과` 흐름으로 쓴다.
- 변경 사항은 필요할 때 `추가`, `변경`, `수정`, `제거`로 묶고, 빈 범주는 생략한다.
- 기존 로그를 갱신할 때는 이전 항목을 보존한다. 사실 오류를 고치는 경우가 아니라면 기록을 다시 쓰지 말고, 새 리뷰 요청, 추가 결정, 변경 파일, 검증, 리스크, 후속 작업을 덧붙인다.
- PR/Jira 코멘트는 바로 붙여 넣을 수 있을 만큼 짧게 쓴다.

## Minimum Done Criteria

- 로그는 Markdown 파일이며, 프롬프트 맥락, interview Q&A, tool/skill 사용, 결정, 변경 사항, 검증, 리스크를 포함한다.
- 로그 파일은 `.agentic-work-log/` 아래에 있고, 프로젝트에서 gitignore되어 있다.
- 중요한 결정은 이후 개발에서 재사용할 수 있도록 충분한 대안과 결과를 포함한다.
- 반복되거나 긴 텍스트가 요약되어 결정, 변경 사항, 검증, 리스크, 리뷰 포인트를 쉽게 찾을 수 있다.
- 이후 개발자가 전체 대화를 읽지 않아도 코드가 왜 이렇게 되었는지 이해할 수 있다.
- PR/Jira 요약은 과한 보고서가 아니라 바로 편집 가능한 초안이다.

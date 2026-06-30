---
name: work-logger
description: 작업 사항을 logging 한다. PR 생성, branch 변경 요약, AI 작업 기록 요청 시 사용한다.
---
# Work Logger

현재 Branch의 작업 사항을 기록한다.
채팅 기록과 diff에서 work log의 재료를 모은다.
변경 파일을 그대로 나열하지 말고, 리뷰어와 다음 Agent가 이해할 수 있는 작업 단위로 묶는다.

## Write

1. **제목**: 작업 사항을 요약하는 짧은 제목 (2-5 단어)
2. **작업 사항**
  - 변경 파일을 그대로 나열 금지.
  - 작업 단위로 묶어 bullet point로 간결하게 작성
  - 작업 중 사용자가 전달했거나 AI가 핵심 참고한 외부 링크가 있다면 반드시 명시
3. (optional)AI가 나에게 되묻기하고 내가 선택한 사항
  - trade-off 가 있었다면 반드시 명시
4. (required)사람이 반드시 리뷰해야할 변경 사항
  - 비즈니스 로직, 공통 컴포넌트/함수, 프로젝트에 새로 추가된 신규 규칙
5. (required)수동 검증 필요 항목
  - 재현 방법과 함께 markdown checkbox로 작성
6. (optional)AI가 생성한 코드에서 사용자가 리팩터링 요청한 사항
  - 목표: 반복 요청될 경우 repo/CONVENTION.md 로 승격 

## Account

- 스킬 종료 전 모든 diff가 `## Write`에 포함됐는지 검증한다. 포함되지 않은 파일은 별도로 기록한다.
- 저장 경로: {PROJECT_ROOT}/logs/{YYYY-MM-DD 제목}.md

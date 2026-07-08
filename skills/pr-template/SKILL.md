---
name: pr-template
description: PR을 생성하거나 머지 요청을 올릴 때. 모든 PR은 아래 동일한 구조와 규칙으로 작성한다.
---

# PR Template

## 해결 / 적용 방법

### PR 본문 스켈레톤

```markdown
## 개요
<!-- 이 PR이 무엇을 왜 하는지 1~2줄. 제목 + 여기만 봐도 맥락이 잡히게 -->

## 변경 사항
<!-- 커밋 단위로 묶고, 세부 항목은 하위 bullet로 나눕니다. 긴 문장 대신 짧은 bullet -->
- **<type>: <커밋 요약>** (`<커밋해시>`)
  - 세부 항목 1
  - 세부 항목 2

## 맥락
- 브랜치: `feature/...` → `feature/...-epic`
- 관련 계획/이슈:

## 검증
- [ ] type-check (`npm run type-check`)
- [ ] lint (`npm run lint`)
- [ ] 단위 테스트 (`npm run test`)
- [ ] 수동 확인:

## 리뷰 포인트
<!-- 번호 + 하위 bullet. 리뷰어가 집중할 부분 · 의도한 트레이드오프 · 범위 경계 -->
1. **<포인트 제목>**
   - 배경/의도
   - 확인 부탁드리는 지점

## 후속 작업
<!-- 이번 범위 밖 / 다음 step. 없으면 "없음" -->
-

## 참조 링크
<!-- 전달했던 Jira 링크 혹은 외부 문서 경로가 있다면 작성 -->
-
```

### 작성 규칙 (LLM이 매번 지킨다)

- **제목**: `<type>: <요약>` — `feat` / `fix` / `chore` / `refactor` / `docs`.
- **base 브랜치**: `gh pr create --base <상위-epic-브랜치>`. 기본값(develop/main)이 아니라
  epic 브랜치를 명시한다. epic 모델: `feature/...` → `feature/...-epic` → develop(완성 시 1회).
- **co-author·생성 표식 금지**: PR 본문/커밋에 `Co-Authored-By: Claude`, `Generated with Claude`
  등 어떤 AI 생성 흔적도 남기지 않는다.
- **빈 섹션 유지**: 해당 없는 섹션도 삭제하지 말고 "없음"으로 채운다 (구조 고정).
- **존칭체**: 본문은 존칭(합니다/부탁드립니다)으로 쓴다. 평서·반말체 금지.
- **bullet 우선**: 긴 문장으로 풀어 쓰지 말고 짧은 bullet로 쪼갠다. 가독성이 최우선.
  세부 내용은 하위 bullet로 한 단계 들여쓴다 (한 항목당 한 줄).
- **변경 사항**: 커밋 단위로 그룹핑한다. 각 커밋은 `**<type>: 요약** (해시)`를 헤더로 두고,
  그 아래 하위 bullet로 세부 항목을 나열한다. 커밋이 축(예: 인프라/검사/라우팅)으로
  나뉘면 그 축이 그대로 상위 bullet이 된다.
- **리뷰 포인트**: 번호 목록으로 두고, 각 포인트는 하위 bullet로 배경·확인 요청을 나눈다.
- **검증 체크박스**: 이 저장소의 실제 스크립트와 1:1. 실제로 통과한 항목만 체크한다.
- **스크린샷**: 고정 섹션을 두지 않는다. UI 변경이 있을 때만 "변경 사항" 안에 인라인으로 첨부.

### gh 명령 예시

```bash
gh pr create \
  --base feature/delivery-rent-form-epic \
  --head feature/delivery-rent-scaffold \
  --title "feat: 배달렌트 step-by-step 폼 스캐폴드" \
  --body "$(cat <<'EOF'
## 개요
...
EOF
)"
```

## 주의사항

- `.github/pull_request_template.md`는 두지 않기로 결정함 (위키 템플릿만 사용 — LLM 작성 전용).
- co-author 금지는 이 사용자의 강한 요구사항이다. 전역 기본 설정이 co-author를 붙이려 해도
  이 규칙이 우선한다.

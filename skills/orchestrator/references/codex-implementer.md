---
name: codex-implementer
description: Codex에 구현을 위임할 때(/codex:rescue --background) 브리프에 그대로 포함할 구현 규약.
---

# 구현 규약 — 브리프에 아래 전문을 그대로 포함한다

```text
You are implementing a pre-approved plan. The design decisions are already made — execute them faithfully.

- Follow the existing structure of the codebase. Do NOT split files or extract functions
  beyond what the plan specifies — unnecessary file/function decomposition is the most
  common quality defect we see. Prefer editing existing files over creating new ones.
- Match surrounding conventions exactly: naming, formatting, error handling, comment density.
- If the plan is ambiguous on a design decision, stop and report the question instead of guessing.
- Verify with the commands given in the brief (or the cheapest sufficient check) and report
  the results plainly — if something failed or was skipped, say so.
```

# 브리프에 추가로 채울 것

규약 전문 뒤에, 대화를 못 본 사람도 실행할 수 있도록 다음을 채운다:

1. **목표와 수용 기준** — "X 하면 Y" 형태로 체크 가능하게
2. **변경 파일 목록**과 참고할 기존 구현 경로 (컨벤션의 원본)
3. **하지 않을 것** — 스코프 밖 명시
4. **검증 명령** — typecheck, 테스트, 수동 확인 절차

# 완료 조회 — `--background`는 폴링으로 회수한다

- **상태 조회** — `/codex:status` (전체) 또는 `/codex:status <task-id>` (특정 잡).
  running / recent 잡과 진행 상태를 보여준다.
- **결과 회수** — 완료된 뒤 `/codex:result` (최근 잡) 또는 `/codex:result <task-id>`.
  출력에 Codex 세션 ID가 포함되므로, 필요하면 그 런을 Codex에서 다시 열 수 있다.
- **취소** — `/codex:cancel` 또는 `/codex:cancel <task-id>`.

task-id는 `--background` 스폰 시점의 반환값에서 확보한다. 여러 잡을 병렬로 돌릴 때는
반드시 id로 지정해 조회한다.

## 대기 동안 메인 세션이 할 일

폴링 간격을 블로킹으로 소모하지 않는다 — 대기는 판단 비용이 아니다. `/codex:status`로
한 번 확인한 뒤, 완료 전까지 다음 브리프 작성·이전 diff 리뷰·독립 하위 작업 스폰을
계속한다. 상태 확인 중 보고가 브리프의 전제와 어긋나면 완료를 기다리지 말고
`/codex:cancel <task-id>` 후 개입한다.

## 회수 후

`/codex:result`로 받은 diff를 메인 세션이 리뷰·검증한다. 고칠 곳이 3곳 이하면 직접
고치고, 그 이상이면 `/codex:rescue --resume`으로 같은 스레드에 돌려보낸다. 인프라
사유(타임아웃·중단)로 실패한 잡은 `--resume`하지 말고 같은 브리프로 새 잡을 띄운다.

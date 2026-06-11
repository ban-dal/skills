# ban-dal/skills

Claude Code, Codex 등 AI 코딩 에이전트용 스킬 컬렉션입니다.

## 설치

```bash
npx skills@latest add ban-dal/skills
```

## 스킬 목록

| 스킬            | 설명                                                                          |
| --------------- | ----------------------------------------------------------------------------- |
| `/quality`      | Karpathy 스타일 코드 품질 원칙 — 단순함, 읽기 우선, 범위 고정                 |
| `/interview-me` | 구현 전 요구사항 명확화 — 필요한 질문을 하나씩 묻고 실행 가능한 Spec으로 정리 |
| `/llm-wiki`     | LLM 개념 즉시 참조 — 모델 선택, 프롬프팅 기법, RAG                            |
| `/orchestrate`  | 서브 에이전트 자율 위임 — plan, brainstorm, review                            |

## Upstream

일부 내용은 [obra/superpowers](https://github.com/obra/superpowers)에서 선별적으로 가져왔습니다.

- `orchestrate/` `subagent-driven-development/`, `requesting-code-review/`
  - 워크플로우·프롬프트 가공. `code-reviewer.md`만 verbatim
  - 리뷰 루프, 워크트리 동의 규칙 포함

---
name: llm-wiki
description: |
  로컬 LLM Wiki(~/Documents/wiki)를 지식베이스로 조회·수집·정리한다.
  작업이 과거 맥락·의사결정·트러블슈팅·운영 장애에 의존하거나 "위키에서 찾아봐", "LLM wiki"라고 하면 기존 지식을 탐색한다(Query).
  재사용 가치가 있는 맥락을 발견하거나 "add to wiki", "기록해줘"라고 하면 수집한다(Ingest).
---

# /llm-wiki

Use this workflow to read, update, and verify the local LLM Wiki. The Wiki is a persistent knowledge base that future agents can search and synthesize.

## Mode

Choose one mode first.

- Query: Read existing knowledge and answer. Always read-only.
- Ingest: Add new sources or task outcomes to the knowledge base. Use only when the user asks to save knowledge, or when prior Wiki maintenance permission exists.
- Archive: Save a Query answer or conversation result as a point-in-time document. Do not merge it into an existing article.
- Lint: Run after Ingest or Archive. Default scope is the touched topic plus `wiki/index.md` and `wiki/log.md`. Fix global index inconsistencies only within the discovered scope; report when a full scan is needed.

## Root

Default root is `~/Documents/wiki`. If it does not exist, ask the user for the location. Before the first write, confirm the root is correct; request approval if the current environment cannot write there.

```text
raw/           # Preserved source material; do not rewrite
wiki/          # Processed knowledge documents updated by agents
wiki/index.md  # Global index
wiki/log.md    # Append-only work log
```

## Initialization

Before the first Ingest, create `raw/`, `wiki/`, `wiki/index.md`, and `wiki/log.md`. Do not overwrite existing files.

- `wiki/index.md`: `# Knowledge Base Index`
- `wiki/log.md`: `# Wiki Log`
- During Query or Lint, if the structure is missing, do not create it automatically. Say that the Wiki must be initialized with Ingest first.

## Query

Use Query when answering from past knowledge or when a task needs historical context.

1. Read `wiki/index.md` first.
2. Read relevant documents and nearby documents in the same topic.
3. Check original material in `raw/` when needed, but synthesize only the essential points in the answer.
4. If Wiki knowledge conflicts with the current repo code, state the conflict and prefer current code plus execution results.
5. In the final response, briefly cite referenced wiki documents with project-root-relative Markdown links.

Plain Query never writes files.

## Ingest

Use Ingest when new knowledge, task results, or user-requested durable context should be saved. Ingest always stores raw material and updates processed wiki knowledge together.

### Plan target

Search existing knowledge before writing.

1. Read `wiki/index.md`.
2. Search `wiki/` for related topics, claims, and slugs.
3. Classify the write as `merge existing article`, `create new article`, or `archive answer`.
4. Choose the raw path and wiki path. Never overwrite or delete existing `raw/` files.

### Capture raw

1. Identify whether the source is a URL, file, conversation, or execution log.
2. Reuse the nearest `raw/<topic>/`; create a new topic only when the source clearly belongs elsewhere.
3. Save as `raw/<topic>/YYYY-MM-DD-descriptive-slug.md`. If the date is unknown, use the slug only.
4. Preserve original content, source, capture date, and published date. Use `Unknown` when the published date is unknown. Do not sanitize opinions or failed attempts.

### Compile wiki

1. Merge into an existing `wiki/<topic>/<article>.md` when the same core claim or procedure already exists.
2. Create a new document named after the concept for new concepts.
3. For cross-topic material, place it under the primary topic and link related material in `See Also`.
4. When sources conflict, do not delete either claim; mark the source-specific differences.
5. Cascade updates to affected related documents. Leave archive-style documents as point-in-time records.

## Article Format

Keep documents short and searchable.

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

After Ingest or Archive, update the index and log. After Lint, append one log entry with the number of fixes and remaining issues.

- `wiki/index.md`: Keep topic-level article links, one-line summaries, and Updated dates.
- `wiki/log.md`: Append only.

```md
## YYYY-MM-DD | ingest | short-title

- Raw:
- Updated:
- Notes:
```

## Archive

When the user explicitly asks to save an answer to the Wiki, save the Query result as a new wiki document.

- Always create a new document; do not merge it into existing knowledge articles.
- Link the wiki documents used by the answer in `Sources`.
- Do not write a `Raw` field.
- Prefix the `wiki/index.md` summary with `[Archived]`.
- Add `query | archived` to `wiki/log.md`.

## Lint

Run Lint after Ingest or Archive.

Auto-fix:

- Add wiki documents missing from the index.
- Mark index entries whose target does not exist with `[MISSING]`.
- Fix broken internal links when there is one clear candidate.
- Fix missing Raw links when there is one clear recovery candidate.
- Add obvious missing `See Also` links within the same topic.

Report only:

- Fact conflicts between sources.
- Claims outdated by newer sources.
- Isolated documents.
- Frequently referenced concepts without standalone documents.
- Archived documents whose underlying source knowledge changed substantially.

After Lint, append the fix count and remaining issues to `wiki/log.md`.

## Record Candidates

Before finishing development, debugging, review, or deployment-response work, treat these as Ingest candidates:

- Production errors, incidents, hard-to-reproduce bugs, or customer impact.
- Temporary removals, workarounds, rollbacks, feature flags, or degraded behavior.
- Unresolved causes, reproduction conditions, long-term fixes, or official API adoption.
- Decisions to remove, keep, or defer a specific implementation.
- Tradeoffs that changed feature scope, UX, performance, or observability for stability.
- Triggers that require revisiting at a release, dependency update, or recurrence point.
- Reusable prompts, checklists, or investigation procedures.

If the user explicitly asks to record something, Ingest it. If the agent only notices a candidate, suggest it at the end of the response and write only if the user approves or prior Wiki maintenance permission exists. For uncertain decisions or personal/team conventions, propose a draft and ask for confirmation.

## Rules

- Do not trust Wiki knowledge blindly. Prefer current code, execution results, and newer sources over old documents.
- Do not invent history or sources.
- Query never writes files.
- Preserve `raw/`; put interpretation and organization in `wiki/`.
- Never delete or overwrite existing `raw/` files.
- Use links relative to the current file inside wiki files; use project-root-relative links in conversation.
- Keep `wiki/` topics one level deep.
- Keep documents concise; put long source material in `raw/`.

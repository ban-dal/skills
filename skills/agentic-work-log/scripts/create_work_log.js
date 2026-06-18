#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const TEMPLATE = {
  title: "짧은 작업 제목",
  task: "사용자가 원한 것과 목표한 결과.",
  userPrompts: ["원문 프롬프트 또는 간결한 요약."],
  interview: [{ question: "메인 모델의 질문", answer: "사용자의 답변" }],
  tools: {
    skills: ["skill-name: 사용 이유"],
    mcp: ["tool/server: 수행한 일"],
    shell: ["명령 또는 명령 묶음: 중요했던 이유"],
    other: ["그 외 주요 도구"]
  },
  sources: ["기록 구조나 판단에 참고한 외부/로컬 자료."],
  context: ["작업 중 발견한 중요한 코드베이스 사실."],
  decisions: [
    {
      context: "결정이 필요했던 압력이나 제약.",
      decision: "선택한 접근.",
      alternatives: ["배제한 선택지와 이유."],
      consequences: ["받아들인 트레이드오프나 생긴 후속 작업."]
    }
  ],
  changes: {
    added: ["새로 추가한 동작(필요 시 파일 경로 포함). 동작 중심으로 기술."],
    changed: ["변경한 동작."],
    fixed: ["수정한 문제."],
    removed: ["제거한 동작."]
  },
  files: ["path/to/file: 리뷰 시 먼저 볼 진입점과 확인 포인트. changes의 파일을 그대로 반복하지 말고, 리뷰가 필요한 핵심 파일만."],
  verification: ["검증 항목: 결과."],
  risks: ["알려진 한계, 가정, 미검증 영역."],
  followUps: ["선택적 후속 작업."],
  desiredFeedback: ["리뷰어가 특히 봐주면 좋은 영역."],
  prComment: "PR에 붙여 넣기 좋은 짧은 코멘트 초안.",
  jiraComment: "Jira에 붙여 넣기 좋은 짧은 코멘트 초안."
};

const LABELS = {
  defaultTitle: "Agentic AI 코딩 작업 기록",
  date: "날짜",
  task: "작업",
  userPrompts: "사용자 프롬프트",
  interview: "인터뷰 Q&A",
  question: "질문",
  answer: "답변",
  tools: "도구와 스킬",
  skills: "스킬",
  mcp: "MCP / 앱",
  shell: "셸 / 스크립트",
  other: "기타",
  sources: "참고 자료",
  context: "발견한 맥락",
  decisions: "결정",
  decisionContext: "맥락",
  decision: "결정",
  alternatives: "대안",
  consequences: "결과",
  changes: "변경 사항",
  added: "추가",
  changed: "변경",
  fixed: "수정",
  removed: "제거",
  files: "파일",
  verification: "검증",
  risks: "리스크와 가정",
  followUps: "후속 작업",
  desiredFeedback: "리뷰 요청 포인트",
  prComment: "PR 코멘트 초안",
  jiraComment: "Jira 코멘트 초안",
  notRecorded: "기록되지 않음",
  notUsed: "사용하지 않았거나 기록되지 않음",
  notRun: "실행하지 않음",
  none: "기록된 항목 없음",
  wrote: "파일 생성 완료"
};

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--print-template") {
      args.printTemplate = true;
    } else if (arg === "--input" || arg === "--out") {
      args[arg.slice(2)] = argv[i + 1];
      i += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function bulletList(items, emptyText) {
  const values = asArray(items);
  if (values.length === 0) return `- ${emptyText}`;
  return values.map((item) => `- ${String(item).replace(/\n/g, "\n  ")}`).join("\n");
}

function qaList(items, labels) {
  const values = asArray(items);
  if (values.length === 0) return `- ${labels.notUsed}`;
  return values
    .map((item) => {
      if (typeof item === "string") return `- ${item}`;
      return `- ${labels.question}: ${item.question || labels.notRecorded}\n  ${labels.answer}: ${item.answer || labels.notRecorded}`;
    })
    .join("\n");
}

function decisionList(items, labels) {
  const values = asArray(items);
  if (values.length === 0) return `- ${labels.notRecorded}`;
  return values
    .map((item) => {
      if (typeof item === "string") return `- ${item}`;
      const lines = [
        `- ${labels.decisionContext}: ${item.context || labels.notRecorded}`,
        `  ${labels.decision}: ${item.decision || labels.notRecorded}`
      ];
      const alternatives = bulletList(item.alternatives, labels.notRecorded).replace(/^- /gm, "    - ");
      const consequences = bulletList(item.consequences, labels.notRecorded).replace(/^- /gm, "    - ");
      lines.push(`  ${labels.alternatives}:`);
      lines.push(alternatives);
      lines.push(`  ${labels.consequences}:`);
      lines.push(consequences);
      return lines.join("\n");
    })
    .join("\n");
}

function changeList(changes, labels) {
  if (!changes) return `- ${labels.notRecorded}`;
  if (Array.isArray(changes) || typeof changes === "string") {
    return bulletList(changes, labels.notRecorded);
  }

  const groups = [
    [labels.added, changes.added],
    [labels.changed, changes.changed],
    [labels.fixed, changes.fixed],
    [labels.removed, changes.removed]
  ].filter(([, items]) => asArray(items).length > 0);

  if (groups.length === 0) return `- ${labels.notRecorded}`;
  return groups
    .map(([label, items]) => `### ${label}\n${bulletList(items, labels.notRecorded)}`)
    .join("\n\n");
}

function section(title, body) {
  return `## ${title}\n\n${body}\n`;
}

function renderMarkdown(data) {
  const labels = LABELS;
  const tools = data.tools || {};
  const title = data.title || labels.defaultTitle;
  const date = data.date || new Date().toISOString().slice(0, 10);
  const parts = [`# ${title}`, "", `${labels.date}: ${date}`, ""];

  parts.push(section(labels.task, data.task || labels.notRecorded));
  parts.push(section(labels.userPrompts, bulletList(data.userPrompts, labels.notRecorded)));
  parts.push(section(labels.interview, qaList(data.interview, labels)));
  parts.push(
    section(
      labels.tools,
      [
        `### ${labels.skills}`,
        bulletList(tools.skills, labels.notRecorded),
        "",
        `### ${labels.mcp}`,
        bulletList(tools.mcp, labels.notRecorded),
        "",
        `### ${labels.shell}`,
        bulletList(tools.shell, labels.notRecorded),
        "",
        `### ${labels.other}`,
        bulletList(tools.other, labels.notRecorded)
      ].join("\n")
    )
  );
  parts.push(section(labels.sources, bulletList(data.sources, labels.notRecorded)));
  parts.push(section(labels.context, bulletList(data.context, labels.notRecorded)));
  parts.push(section(labels.decisions, decisionList(data.decisions, labels)));
  parts.push(section(labels.changes, changeList(data.changes, labels)));
  parts.push(section(labels.files, bulletList(data.files, labels.notRecorded)));
  parts.push(section(labels.verification, bulletList(data.verification, labels.notRun)));
  parts.push(section(labels.risks, bulletList(data.risks, labels.notRecorded)));
  parts.push(section(labels.followUps, bulletList(data.followUps, labels.none)));
  parts.push(section(labels.desiredFeedback, bulletList(data.desiredFeedback, labels.none)));
  parts.push(section(labels.prComment, data.prComment || labels.notRecorded));
  parts.push(section(labels.jiraComment, data.jiraComment || labels.notRecorded));

  return `${parts.join("\n").trim()}\n`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.printTemplate) {
    process.stdout.write(`${JSON.stringify(TEMPLATE, null, 2)}\n`);
    return;
  }

  const data = args.input
    ? JSON.parse(fs.readFileSync(args.input, "utf8"))
    : TEMPLATE;
  const markdown = renderMarkdown(data);

  if (!args.out) {
    process.stdout.write(markdown);
    return;
  }

  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, markdown, "utf8");
  process.stdout.write(`${LABELS.wrote} ${args.out}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
}

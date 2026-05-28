#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");

const MARKER_START = "<!-- smart-agent:start -->";
const MARKER_END = "<!-- smart-agent:end -->";

const CLAUDE_DIR = path.join(os.homedir(), ".claude");
const CLAUDE_MD = path.join(CLAUDE_DIR, "CLAUDE.md");
const SKILLS_DIR = path.join(CLAUDE_DIR, "agents", "skills");

const SRC_DIR = path.join(__dirname, "..", "src");

function install() {
  fs.mkdirSync(path.join(SKILLS_DIR, "grill"), { recursive: true });

  // Append to CLAUDE.md
  const existing = fs.existsSync(CLAUDE_MD) ? fs.readFileSync(CLAUDE_MD, "utf8") : "";
  if (existing.includes(MARKER_START)) {
    console.log(`Already installed in ${CLAUDE_MD}. Run with "uninstall" to reinstall.`);
  } else {
    const snippet = fs.readFileSync(path.join(SRC_DIR, "claude-md-snippet.md"), "utf8");
    fs.appendFileSync(CLAUDE_MD, `\n${MARKER_START}\n${snippet}\n${MARKER_END}\n`);
    console.log(`Rules appended to ${CLAUDE_MD}`);
  }

  // Copy grill skill
  const grillSrc = path.join(SRC_DIR, "skills", "grill", "SKILL.md");
  const grillDest = path.join(SKILLS_DIR, "grill", "SKILL.md");
  fs.copyFileSync(grillSrc, grillDest);
  console.log(`/grill skill installed to ${path.join(SKILLS_DIR, "grill")}`);

  console.log("\nDone. Restart Claude Code to apply changes.");
}

function uninstall() {
  // Remove block from CLAUDE.md
  if (fs.existsSync(CLAUDE_MD)) {
    const content = fs.readFileSync(CLAUDE_MD, "utf8");
    if (content.includes(MARKER_START)) {
      const pattern = new RegExp(
        `\\n?${escapeRegex(MARKER_START)}[\\s\\S]*?${escapeRegex(MARKER_END)}\\n?`,
        "g"
      );
      fs.writeFileSync(CLAUDE_MD, content.replace(pattern, ""));
      console.log(`Removed rules from ${CLAUDE_MD}`);
    } else {
      console.log(`No rules found in ${CLAUDE_MD} (nothing to remove)`);
    }
  }

  // Remove grill skill
  const grillDir = path.join(SKILLS_DIR, "grill");
  if (fs.existsSync(grillDir)) {
    fs.rmSync(grillDir, { recursive: true, force: true });
    console.log("Removed /grill skill");
  }

  console.log("Uninstalled.");
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const command = process.argv[2];
if (command === "uninstall") {
  uninstall();
} else {
  install();
}

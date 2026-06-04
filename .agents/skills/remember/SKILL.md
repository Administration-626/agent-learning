---
name: remember
description: Save durable technical learnings, bug fixes, architectural decisions, and workflow insights into /home/tan/agent-learning/learnings. Use when the user says remember, learn, save this, /remember, or asks to persist a reusable insight for future agents.
---

# Remember

## Goal

Persist one reusable learning into `/home/tan/agent-learning/learnings/` so Codex,
Claude Code, Gemini CLI, Cursor, and future agents can read it as plain Markdown.

## When To Use

Use this skill when:

- The user says "remember", "learn", "save this", or `/remember`.
- A bug root cause, debugging method, architecture decision, command, or workflow
  should be reused later.
- A completed task produced a durable lesson that is broader than one code diff.

Do not use this skill for secrets, credentials, private keys, or full raw
conversation dumps.

## Workflow

1. Extract one focused learning from the conversation.
2. Choose a concise title and slug-worthy topic.
3. Identify the current agent for the note and git trailer.
4. Write a Markdown note with these sections:
   - Context
   - Problem
   - Solution
   - Pitfalls
5. Save and commit through the helper script.
6. Report the saved file path and commit hash.

## Agent Identity

Pass the actual current agent identity to `--agent`. Defaults:

- Codex: `Codex <codex@openai.com>`
- Claude Code: `Claude Code <claude-code@anthropic.com>`
- Gemini CLI: `Gemini CLI <gemini-cli@google.com>`
- Cursor Agent: `Cursor Agent <cursor-agent@cursor.com>`

If the current agent is different, use its visible product/model identity and a
reasonable no-reply style email.

## Save Command

Provide the note body on stdin:

```bash
node /home/tan/agent-learning/.agents/skills/remember/scripts/save-learning.mjs \
  --title "Short learning title" \
  --agent "Codex <codex@openai.com>" \
  --commit
```

The script creates `learnings/{YYYY-MM-DD}-{topic-slug}.md`, formats the note,
and commits only that note. Use `--dry-run` first if the title, path, or commit
message needs checking.

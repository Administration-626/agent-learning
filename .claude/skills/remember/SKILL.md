---
name: remember
description: Save durable technical learnings into /home/tan/agent-learning/learnings. Use when the user says remember, learn, save this, /remember, or asks to persist a reusable insight.
argument-hint: "[topic: learning]"
---

# Remember

Save the requested learning to the shared agent-learning repository.

Use the canonical workflow in:

`/home/tan/agent-learning/.agents/skills/remember/SKILL.md`

For Claude Code, pass this agent identity to the helper script unless the user
requests a different trailer:

`Claude Code <claude-code@anthropic.com>`

Always save under `/home/tan/agent-learning/learnings/`, commit with
`Co-authored-by: Claude Code <claude-code@anthropic.com>`, and report the saved
path plus commit hash.

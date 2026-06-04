---
name: remember
description: Save a Chinese learning note to /home/tan/agent-learning/learnings. Use when the user says remember, learn, save this, /remember, 记住, 学习, or 保存经验.
argument-hint: "[topic: description of the learning]"
---

# Remember

Save the current learning to the git-backed memory repo:

`/home/tan/agent-learning`

The learning comes from the user's request and the current conversation.

Instructions:

1. Parse the topic from the input. If the input has `topic: content`, use the text before `:` as the topic. Otherwise generate a concise topic from the content.
2. IMPORTANT: Always save to the existing `learnings/` folder. Do not create new folders like `patterns/`, `notes/`, `skills/`, etc.
3. Create a new file at `/home/tan/agent-learning/learnings/{YYYY-MM-DD}-{topic-slug}.md`.
4. Write the learning note in Chinese. Format it with:
   - Title as H1
   - Date
   - Agent
   - Project context if relevant
   - Background / Problem / Solution / Pitfalls sections
5. Commit locally with the current agent identity in `Co-authored-by:`. Do not push unless the user explicitly asks.
6. Confirm what was saved and show the saved file path plus commit hash.

Use the helper script to avoid filename, formatting, and commit-message mistakes:

```bash
node /home/tan/agent-learning/.agents/skills/remember/scripts/save-learning.mjs \
  --title "{topic}" \
  --agent "{Current Agent <email>}" \
  --commit
```

Known agent identities:

- Codex: `Codex <codex@openai.com>`
- Claude Code: `Claude Code <claude-code@anthropic.com>`
- Gemini CLI: `Gemini CLI <gemini-cli@google.com>`
- Cursor Agent: `Cursor Agent <cursor-agent@cursor.com>`

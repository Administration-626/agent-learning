---
description: Save a Chinese learning to the agent-learning git repo
argument-hint: "[topic: description of the learning]"
---

Save the following learning to the git-backed memory repo:

$ARGUMENTS

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
5. Commit locally with:
   ```bash
   node /home/tan/agent-learning/.agents/skills/remember/scripts/save-learning.mjs \
     --title "{topic}" \
     --agent "Claude Code <claude-code@anthropic.com>" \
     --commit
   ```
6. Do not push unless the user explicitly asks.
7. Confirm what was saved and show the saved file path plus commit hash.

---
name: remember
description: Save a Chinese learning note to the learnings folder. Use when the user says remember, learn, save this, /remember, 记住, 学习, or 保存经验.
argument-hint: "[topic: description of the learning]"
---

# Remember

Save the current learning to the git-backed memory repo:

`/home/tan/agent-learning`

The learning comes from the user's request and the current conversation.

Instructions:

1. Parse the topic from the input. If the input has `topic: content`, use the text before `:` as the topic. Otherwise generate a concise topic from the content.
2. IMPORTANT: Always save to the existing `learnings/` folder. Do not create new folders like `patterns/`, `notes/`, `skills/`, etc.
3. Do NOT manually create or write the file. You must strictly use the helper script via a bash Here-Document to pipe the markdown content (Background / Problem / Solution / Pitfalls) into the script. The script will automatically generate the file, filename, Date, and Agent headers.
4. Execute the following bash command, replacing the placeholders with actual content. Ensure the title is plain text without unescaped quotes:

```bash
cat << 'EOF' | node ~/.agents/skills/remember/scripts/save-learning.mjs --title "{topic}" --agent "{Current Agent <email>}" --commit
## 背景 (Background)
...

## 问题 (Problem)
...

## 解决方案 (Solution)
...

## 避坑指南 (Pitfalls)
...
EOF
```

5. Confirm what was saved using the script's stdout output (it will print the file path and commit hash). Do not push unless the user explicitly asks.

Known agent identities (use the exact format `Name <email>`):

- Antigravity: `Antigravity <antigravity@google.com>`
- Codex: `Codex <codex@openai.com>`
- Claude Code: `Claude Code <claude-code@anthropic.com>`
- Gemini CLI: `Gemini CLI <gemini-cli@google.com>`
- Cursor Agent: `Cursor Agent <cursor-agent@cursor.com>`

If your agent name is not in this list, use your system prompt identity to format it as `Your Name <your-name@local.agent>`.

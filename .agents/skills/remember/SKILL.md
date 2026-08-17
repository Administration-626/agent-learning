---
name: remember
description: Save a Chinese learning note to the learnings folder. Use when the user says remember, learn, save this, /remember, 记住, 学习, or 保存经验.
argument-hint: "[topic: description of the learning]"
---

# Remember

Save the current learning to the git-backed memory repository.

Instructions:

1. **Parse Topic**: Parse the topic from the input. If the input format is `topic: content`, use the text before `:` as the topic; otherwise generate a concise topic from context.
2. **Storage Location**: Save exclusively to `learnings/` (handled automatically by the script). Do not create other folders.
3. **Execute via Stdin Pipe**: Pipe the Markdown content into the helper script using a bash Here-Document. The script handles slugification, date stamps, and isolated git commits automatically.

```bash
cat << 'EOF' | node ~/.agents/skills/remember/scripts/save-learning.mjs --title "{topic}" --agent "{Current Agent <email>}" --commit
## 背景 (Background)
...

## 问题分析 / 核心结论
...

## 解决方案 / 验证方法
...
EOF
```

4. **Confirm**: Verify the saved file path and commit hash from the script's output. Do not push unless explicitly asked.

Known agent identities (`Name <email>`):
- Antigravity: `Antigravity <antigravity@google.com>`
- Codex: `Codex <codex@openai.com>`
- Claude Code: `Claude Code <claude-code@anthropic.com>`
- Gemini CLI: `Gemini CLI <gemini-cli@google.com>`
- Cursor Agent: `Cursor Agent <cursor-agent@cursor.com>`

---

## 质量与实证审计准则 (Logic & Empirical Standards)

在总结经验时，严格遵守以下实证准则：

1. **区分事实与推测**：明确区分实验/数据支持的【事实】、逻辑推导的【推论】与缺乏直接证据的【主观推测】。推测内容必须显式加注说明。
2. **禁止强行因果**：严禁将“时间先后”或“伴随发生”直接等同于因果关系（相关性 ≠ 因果性）。
3. **挑明隐含前提**：在提供解决方案时，先明确其生效的前提条件与适用边界。
4. **概念定义一致**：在同一篇笔记中，核心概念与边界必须前后一致，禁止概念滑移。

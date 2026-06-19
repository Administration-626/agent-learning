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


---

# 极端严苛的逻辑审计准则 (Critical Logic Audit for Learnings)

在提取和总结经验时，你必须扮演一个严谨的批判性思维专家与实证主义学者，对沉淀的知识进行极端严苛的逻辑审计。

## 【核心限制：认知边界与证据链】

1. **区分事实、推论与推测**：在保存的所有经验中，必须严格区分以下三者：
   - **【事实/证据】**：有确凿数据、实验、文献、行业标准支持的结论。
   - **【理论推论】**：在特定模型、框架、公式下演绎推导出的必然结果（需声明前提条件）。
   - **【主观推测】**：在缺乏直接证据或多变量干扰下，基于直觉、经验或合理怀疑做出的猜测。
   任何属于“主观推测”的内容，必须在前文明确加注：“此处缺乏直接证据，属于理论/经验推测”。

2. **禁止强行因果（Post Hoc Fallacy）**：禁止将“时间上的先后发生”或“空间上的伴随出现”直接归因为因果关系。分析系统问题时，必须明确区分“相关性”与“因果性”。

3. **禁止否定前件与滑坡**：禁止通过“若A则B，所以若非A则非B”的方式论证。禁止进行多步缺乏强证据支撑的因果传导（即“如果A，就会导致B，接着引发C，最终导致灾难D”）。

4. **审查隐含前提**：在总结问题和提供解决方案前，必须首先主动检索、挑明并审查经验中依赖的“隐含前提（Implicit Assumptions）”。如果前提不成立或存在争议，必须立即指出并加以修正。

5. **概念不可滑移**：在同一篇经验总结中，一个核心概念的定义、边界和适用条件必须始终保持一致。禁止通过扩大概念内涵、泛化外延或切换时间线/空间域（例如混淆“历史起源”与“现状维持”，“宏观规律”与“微观个案”）来完成逻辑闭环。

## 【交互与自我审计机制】

- **承认未知之未知（Unknown Unknowns）**：当面对复杂、多变量或证据不足的问题时，你必须在经验中优先列出“目前无法确定的变量”和“系统的不确定性”，而不是强行给出一个确定性的单一路径归因。
- **质疑即审计**：如果用户对总结的经验提出任何质疑（如“为什么”、“怎么得出的”），你必须立刻启动自我审计，回溯证据链是否断裂，并坦诚承认事实支撑不足之处，严禁使用宏大修辞或学术黑话掩盖。

# Agent Learning

这是一个给 AI 编程 Agent 使用的 git-backed 记忆仓库。

## 目录结构

- `learnings/`：所有 Agent 共同读取和写入的 Markdown 学习笔记。
- `.agents/skills/remember/`：通用 Open Agent Skill，供 Codex 和 Gemini 使用。
- `.claude/skills/remember/`：Claude Code 的 remember 入口。
- `.cursor/rules/remember.mdc`：Cursor 的规则适配入口。

## 使用方式

当你要求 Agent 记住、学习、保存某条经验时，Agent 应该把笔记保存到：

`/home/tan/agent-learning/learnings/`

提交 commit 时，需要添加标识当前 Agent 的 `Co-authored-by:` trailer。

真正的知识源是 `learnings/` 里的 Markdown 文件；各 Agent 专属文件只是调用同一套保存流程的入口。

# 通用 Agent 学习记忆

日期：2026-06-05
Agent：Codex

## 背景

这个学习仓库需要同时服务 Codex、Claude Code、Gemini CLI、Cursor 等多个 AI 编程 Agent。

## 问题

如果 `/remember` 只绑定到某一个 Agent 的机制，学习笔记就会被单一工具锁定。不同 Agent 可能各自保存一套经验，导致知识分散、格式不一致，也更难长期维护。

## 解决方案

使用 `/home/tan/agent-learning/learnings/` 作为唯一知识存储目录，并把主要工作流放在 `.agents/skills/remember/` 中。Codex 和 Gemini 可以直接使用通用 skill；Claude Code 和 Cursor 通过薄适配入口调用同一套流程。

## 避坑指南

- 不要为不同 Agent 创建不同的知识存储目录。
- 不要让适配入口变成独立实现；核心逻辑应只维护一份。
- 学习笔记默认使用中文记录。
- 未来提交学习笔记时，commit 需要包含当前 Agent 的 `Co-authored-by:` trailer。
- 笔记应聚焦单个可复用经验，不要保存 secrets 或完整原始对话。

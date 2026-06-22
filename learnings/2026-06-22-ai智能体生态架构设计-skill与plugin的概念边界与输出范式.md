# AI智能体生态架构设计：Skill与Plugin的概念边界与输出范式

Date: 2026-06-22
Agent: Antigravity

## 背景 (Background)
在重构 `deep-code-reader`（一个用于深度阅读源码并生成 AI 知识库的工具）时，我们决定将工具本身的安装路径定为 `~/.agents/skills/`，而将工具运行后生成的项目知识库（包含多个子模块认知文档）输出到 `~/.agents/plugins/` 目录。用户对此产生了疑问：为什么工具不放在 plugin 目录，而输出却放在 plugin 目录？

## 问题 (Problem)
在跨平台 AI 智能体生态（如 Antigravity, Claude Code, Gemini CLI, Codex 等基于 `~/.agents/` 规范的系统）中，开发者往往混淆了“Skill（技能）”与“Plugin（插件包）”的核心概念边界，导致文件存放位置错误、系统无法正确加载能力，或者造成架构设计的过度臃肿。

## 解决方案 (Solution)
基于系统底层架构规范，必须严格区分单体能力单元与复合生态包：

1. **Skill (单体技能) —— “制造机器”**
   - **定义**：单一的、可执行的动作能力或特定知识指南（例如：“教 AI 如何阅读代码”）。
   - **结构特征**：纯文本、单层级，通常仅包含一个主控 `SKILL.md`（带 YAML 前言）及辅助 prompt 模板，不涉及复杂的子代理（Subagents）配置。
   - **存放路径**：`~/.agents/skills/`。

2. **Plugin (复合插件包) —— “生产出的生态产品”**
   - **定义**：解决复杂业务场景的组合型知识矩阵或能力集群。
   - **结构特征**：拥有复杂的多层级架构，包含全局配置（`plugin.json`）、路由索引（如 `skills/index/SKILL.md`）、多个互相配合的子技能模块，甚至预设了特定脾气的子 Agent。
   - **存放路径**：`~/.agents/plugins/`。

**架构设计范式**：
在 `deep-code-reader` 中，我们采用的是 **“Skill 动态生成 Plugin”** 的范式。工具本身作为执行动作的单体机器存在于 `skills/`；而它经过闭卷考试验证后，为特定项目吐出的成百上千篇多模块关联文档，本质上是一个完整的领域知识库体系，因此必须打包为 Plugin 放置于 `plugins/` 中。

## 避坑指南 (Pitfalls)
1. **警惕过度依赖（伪依赖）**：不要在独立的 Skill 中为了通用的排版格式去强行依赖外部的巨型插件（如 `superpowers`）。Agent 完全能够通过提示词内联的 YAML 模板（Zero-Dependency）完成符合规范的文档输出。
2. **警惕错误归类**：如果把只有 `SKILL.md` 的纯工具强行放到 `plugins/` 目录下，由于缺乏 `plugin.json` 声明，底层加载机制将无法将其识别为合法的插件，导致工具失效。

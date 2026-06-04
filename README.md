# Agent Learning

## 简介

Agent Learning 是一个给 AI 编程 Agent 使用的 git-backed 记忆仓库。

它的目标是让 Codex、Claude Code、Gemini CLI、Cursor 等 Agent 都把可复用经验保存到同一个目录里，避免每个 Agent 各存一份、越用越分散。

## 功能

- 使用 `learnings/` 作为唯一知识存储目录。
- 使用 Markdown 保存每条学习笔记，方便人类和 Agent 直接阅读。
- 提供通用 Open Agent Skill，供 Codex 和 Gemini 使用。
- 提供 Claude Code 和 Cursor 的适配入口。
- 使用辅助脚本生成文件名、写入笔记、创建 git commit。
- commit message 自动带上当前 Agent 的 `Co-authored-by:` trailer。

## 目录结构

```text
.
├── AGENTS.md
├── README.md
├── learnings
│   └── 2026-06-05-universal-agent-learning-memory.md
├── .agents
│   └── skills
│       └── remember
│           ├── SKILL.md
│           └── scripts
│               └── save-learning.mjs
├── .claude
│   └── skills
│       └── remember
│           └── SKILL.md
└── .cursor
    └── rules
        └── remember.mdc
```

## 目录说明

- `AGENTS.md`：给 AI 编程 Agent 读取的项目级规则入口。它告诉 Agent：遇到 remember / learn / save 需求时，应该使用本仓库的 remember 流程。
- `README.md`：说明这个仓库的用途、目录结构、安装方式和使用方式。
- `learnings/`：唯一的知识存储目录。所有 Agent 保存的学习笔记都应该放在这里。
- `learnings/*.md`：单条学习笔记。每个文件记录一个可复用经验，例如 bug 根因、架构决策、命令用法、避坑记录。
- `.agents/skills/remember/SKILL.md`：通用 remember skill，是 Codex 和 Gemini 可以直接发现的核心入口。
- `.agents/skills/remember/scripts/save-learning.mjs`：保存学习笔记的辅助脚本，负责生成文件名、写入 Markdown、创建 git commit，并添加当前 Agent 的 `Co-authored-by:`。
- `.claude/skills/remember/SKILL.md`：Claude Code 的适配入口。它不另起一套逻辑，而是指向 `.agents/skills/remember/` 的通用流程。
- `.cursor/rules/remember.mdc`：Cursor 的规则适配入口。Cursor 没有完全相同的 skill 机制，所以通过 rule 告诉它使用同一个 remember 流程。

## 安装

当前推荐使用符号链接安装，让所有 Agent 读取同一份本地源文件。

当前机器已经创建了这些链接：

```text
~/.agents/skills/remember -> /home/tan/agent-learning/.agents/skills/remember
~/.claude/skills/remember -> /home/tan/agent-learning/.claude/skills/remember
~/.gemini/skills/remember -> /home/tan/agent-learning/.agents/skills/remember
```

如果在新机器上重新安装，可以先克隆仓库：

```bash
git clone <repo-url> /home/tan/agent-learning
```

然后创建用户级 skill 入口：

```bash
mkdir -p ~/.agents/skills ~/.claude/skills ~/.gemini/skills

ln -s /home/tan/agent-learning/.agents/skills/remember ~/.agents/skills/remember
ln -s /home/tan/agent-learning/.claude/skills/remember ~/.claude/skills/remember
ln -s /home/tan/agent-learning/.agents/skills/remember ~/.gemini/skills/remember
```

如果目标路径已经存在，先检查已有内容，不要直接覆盖。

## 使用方式

### Codex

新开 Codex 会话后，可以直接说：

```text
remember 这次的经验：...
```

也可以显式调用：

```text
$remember
```

如果想确认 Codex 是否发现了这个 skill，可以在 Codex CLI 里使用：

```text
/skills
```

### Gemini CLI

新开 Gemini CLI 会话后，可以先查看 skill：

```text
/skills list
```

如果没有看到 `remember`，刷新一次：

```text
/skills reload
```

然后直接说：

```text
remember 这次的经验：...
```

Gemini 会根据 skill 的 description 自动触发，或按你的显式要求使用 remember skill。

### Claude Code

新开 Claude Code 会话后，可以使用：

```text
/remember 这次的经验：...
```

也可以直接说：

```text
remember this ...
```

Claude Code 会通过 `~/.claude/skills/remember` 入口进入本仓库的 remember 流程。

### Cursor

在这个仓库里使用 Cursor 时，Cursor 会通过 `.cursor/rules/remember.mdc` 读取 remember 规则。

可以直接说：

```text
remember 这次的经验：...
```

如果想让 Cursor 在其他项目里也使用同一套规则，需要把类似规则放到 Cursor User Rules，或者在对应项目里添加 `.cursor/rules/remember.mdc`。

## 符号链接和安装的区别

符号链接适合本地自用：

- 只有一份源文件，不容易出现多份配置不一致。
- 修改本仓库后，所有链接到它的 Agent 都能读到更新。
- 如果移动或删除 `/home/tan/agent-learning`，链接会失效。
- 不一定能被各 Agent 的 uninstall / update 命令管理。

正式安装适合分发和团队使用：

- 可以通过 Agent 自带命令管理，例如 list、enable、disable、uninstall。
- 适合从 Git 仓库或插件市场分发。
- 安装后可能变成独立副本，后续不一定自动跟随本仓库修改。

当前更适合使用符号链接，因为这个仓库的目标就是作为个人统一记忆源。

## 维护约定

- 所有学习笔记只保存到 `learnings/`。
- 每条学习笔记只记录一个可复用经验。
- 不保存 secrets、credentials、private keys 或完整原始对话。
- commit message 使用 `Add learning: <topic>`。
- commit 需要添加当前 Agent 的 `Co-authored-by:` trailer。

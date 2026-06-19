# Agent Learning

## 简介

Agent Learning 是一个给 AI 编程 Agent 使用的 git-backed 记忆仓库。

它的目标是让 Codex、Claude Code、Gemini CLI、Cursor 等 Agent 都把可复用经验保存到同一个目录里，避免每个 Agent 各存一份、越用越分散。

## 适用系统

当前只按 Linux 环境设计和验证。

- 使用 Linux home 目录下的 `~/.agents`、`~/.claude`、`~/.gemini`。
- 安装方式依赖 Linux 符号链接。
- macOS 和 Windows 还没有适配和验证。

## 快速理解

- `learnings/` 是记忆内容。所有 Agent 保存的经验，最终都应该变成这里的一篇 Markdown 文件。
- `SKILL.md` 是 remember 工作流。它告诉 Agent 如何提取学习内容、生成文件名、写入笔记并提交 commit。
- `AGENTS.md` 是当前目录规则。它告诉在这个仓库里工作的 Agent：遇到 remember / learn / save 时应该怎么处理。
- symlink 是让不同 Agent 找到同一份 skill。它避免 Codex、Claude Code、Gemini CLI 各复制一套配置。

## 怎么使用

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

在使用 Cursor 时，Cursor 会通过 `.cursor/rules/remember.mdc` 代理规则读取 remember 配置。

可以直接说：

```text
remember 这次的经验：...
```

如果想让 Cursor 在其他项目里也使用同一套规则，只需将这里的代理规则文件复制/链接到其他项目中，或者放到全局 Cursor User Rules 中。无论在哪个目录下触发，代理规则都会通过软链接精准指向 `~/.agents/...` 中的全局通用流程。

## 安装

如果在新机器上重新安装，可以创建用户级 skill 入口：

```bash
AGENT_LEARNING_DIR=/path/to/agent-learning

mkdir -p ~/.agents/skills ~/.claude/skills ~/.gemini/skills

ln -s "$AGENT_LEARNING_DIR/.agents/skills/remember" ~/.agents/skills/remember
ln -s "$AGENT_LEARNING_DIR/.claude/skills/remember" ~/.claude/skills/remember
ln -s "$AGENT_LEARNING_DIR/.agents/skills/remember" ~/.gemini/skills/remember
```

如果目标路径已经存在，先检查已有内容，不要直接覆盖。

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
- `.agents/skills/remember/SKILL.md`：通用 remember skill，是 Antigravity、Codex 和 Gemini 可以直接发现的核心入口。包含了通过 Here-Document 管道调用脚本的全局规范。
- `.agents/skills/remember/scripts/save-learning.mjs`：保存学习笔记的辅助脚本。无论你在哪执行，它都会自动计算真实仓库根目录，接收 stdin 传入的正文，创建无污染的隔离 git commit。
- `.claude/skills/remember/SKILL.md`：Claude Code 的适配入口。这是一个纯粹的代理（Proxy），强制指引 Claude 跨目录读取 `~/.agents/skills/remember/SKILL.md` 的通用流程。
- `.cursor/rules/remember.mdc`：Cursor 的规则适配入口。也是代理规则，告诉 Cursor 跨目录读取 `~/.agents/...` 的通用流程文件，彻底消除逻辑冗余。

## 符号链接和安装的区别

符号链接适合本地自用：

- 只有一份源文件，不容易出现多份配置不一致。
- 修改本仓库后，所有链接到它的 Agent 都能读到更新。
- 如果移动或删除 `$AGENT_LEARNING_DIR`，链接会失效。
- 不一定能被各 Agent 的 uninstall / update 命令管理。

正式安装适合分发和团队使用：

- 可以通过 Agent 自带命令管理，例如 list、enable、disable、uninstall。
- 适合从 Git 仓库或插件市场分发。
- 安装后可能变成独立副本，后续不一定自动跟随本仓库修改。

当前更适合使用符号链接，因为这个仓库的目标就是作为个人统一记忆源。

## 维护约定

- 所有学习笔记只保存到 `learnings/`。
- 每条学习笔记只记录一个可复用经验。
- 学习笔记使用中文记录。
- 不保存 secrets、credentials、private keys 或完整原始对话。
- commit message 使用 `Add learning: <topic>`。
- commit 需要添加当前 Agent 的 `Co-authored-by:` trailer。

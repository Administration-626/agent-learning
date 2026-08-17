# Agent Learning

## 简介

Agent Learning 是一个给 AI 编程 Agent 使用的 git-backed 记忆仓库。

它的目标是让 Codex、Claude Code、Gemini CLI、Cursor、Antigravity 等 Agent 都把可复用经验保存到同一个目录里，避免每个 Agent 各存一份、越用越分散。

## 快速理解

- `learnings/` 是记忆内容。所有 Agent 保存的经验，最终都变成这里的一篇 Markdown 文件。
- `learnings/INDEX.md` 是全库知识索引清单，便于人类和 Agent 极速总览全部沉淀经验。
- `.agents/skills/remember/` 是唯一的真理源（Canonical Skill）。它定义了规范与底层存储逻辑。
- `scripts/query-learning.mjs` 是知识检索与索引构建工具。
- `scripts/setup-adapters.mjs` 是自动化适配工具，让所有 Agent 客户端（Claude Code、Codex、Gemini、Antigravity）直接直连到标准 Skill。

## 怎么使用

### 1. 记录经验 (Remember)

在任意支持的 Agent 客户端中直接说：

```text
remember 这次的经验：...
```

或显式调用：

```text
/remember 这次的经验：...
```

### 2. 检索经验 (Query & Recall)

通过内置命令行工具按关键词极速搜索库中的经验，或重建索引清单：

```bash
# 关键词模糊搜索
node scripts/query-learning.mjs docker

# 输出结构化 JSON（供 Agent 消费）
node scripts/query-learning.mjs ebpf --json

# 更新/重建 learnings/INDEX.md 索引清单
node scripts/query-learning.mjs --index
```

## 安装与适配器设置 (Adapters Setup)

仓库内置了自动化适配脚本，一键检测并创建各 Agent 客户端所需的符号链接：

```bash
# 检查当前各 Agent 的连接状态
node scripts/setup-adapters.mjs --status

# 一键自动配置并链接到 ~/.agents, ~/.claude, ~/.gemini
node scripts/setup-adapters.mjs
```

## 目录结构

```text
.
├── AGENTS.md
├── CONTEXT.md
├── README.md
├── learnings/
│   ├── INDEX.md
│   └── *.md
├── scripts/
│   ├── query-learning.mjs
│   ├── query-learning.test.mjs
│   ├── setup-adapters.mjs
│   └── setup-adapters.test.mjs
├── .agents/
│   └── skills/
│       └── remember/
│           ├── SKILL.md
│           └── scripts/
│               ├── save-learning.mjs
│               └── save-learning.test.mjs
└── .cursor/
    └── rules/
        └── remember.mdc
```

## 维护与测试

运行全套内置原生自动化测试：

```bash
node --test .agents/skills/remember/scripts/save-learning.test.mjs scripts/setup-adapters.test.mjs scripts/query-learning.test.mjs
```

## 约定

- 所有学习笔记只保存到 `learnings/`。
- 每条学习笔记只记录一个可复用经验。
- 学习笔记使用中文记录。
- 不保存 secrets、credentials、private keys 或完整原始对话。
- commit message 使用 `Add learning: <topic>`。
- commit 需要添加当前 Agent 的 `Co-authored-by:` trailer。

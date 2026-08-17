# Agent Learning Instructions

## 1. 保存经验 (Remember)
当用户要求 remember、learn、save a note、记住、学习或保存经验时：

- 使用 `~/.agents/skills/remember/SKILL.md` 作为 canonical workflow。
- 学习笔记将统一保存到 Agent Learning 中央记忆仓库的 `learnings/` 文件夹中（无需关心绝对路径，由底层脚本自动定位）。
- 学习笔记使用中文记录。
- 在笔记和 git commit trailer 中标识当前 Agent。
- 不要保存 secrets、credentials、private keys 或无关的原始对话。
- 每条笔记只记录一个可复用经验。

## 2. 检索经验 (Recall)
当需要查询或参考已沉淀的经验时：
- 可直接查看 `learnings/INDEX.md` 获取知识总览清单。
- 或执行 `node scripts/query-learning.mjs <query> --json` 快速检索匹配的经验笔记与文件路径。

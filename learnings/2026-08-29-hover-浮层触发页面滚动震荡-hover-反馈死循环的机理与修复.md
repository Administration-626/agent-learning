# hover 浮层触发页面滚动震荡：hover 反馈死循环的机理与修复

Date: 2026-08-29
Agent: Claude Code

## 背景 (Background)

2026-08-29，用户报告：在 Windows Chrome 上把光标移到某个图标时弹出二维码浮层，浮层超出视口底部，页面随即出现"向下滑 → 回到原位"的高频反复震荡。

**目标页面/项目未确认。** 在 `~` 下扫过二维码相关前端代码，唯一命中的 `deepseek-reasonix/desktop/frontend` 里二维码是面板内嵌的 block 元素（`.bot-connect-panel__qr-code`、`.bot-mobile-remote__qr-code`），不是 hover 浮层，已排除。因此下文是**基于现象描述的通用机理分析，未经该页面代码审查或复现实验验证**。

## 问题分析 / 核心结论

现象名称：**hover 反馈死循环**（hover-triggered layout/scroll feedback loop），前端俗称 tooltip flicker / hover jitter。

### 【事实】浏览器行为，可独立验证

- Windows 与 Linux 的 Chrome 默认使用**占位式（classic）滚动条**，出现时从布局视口宽度中扣掉约 15px；macOS 默认是 overlay 滚动条，不占位。→ 同一份代码在 Windows 上更易触发，在 mac 上可能完全看不到。
- `Element.scrollIntoView()` 与默认参数的 `HTMLElement.focus()` 都会改变滚动位置。

### 【推论】由现象逻辑推导，未在目标页面验证

自激振荡成立的**必要条件**是存在闭环，而闭环的关键环节是「浮层的显示改变了触发元素在视口中的命中区域」。两条候选路径：

- **路径 A（宽度方向）**：浮层撑高文档 → 竖直滚动条出现 → 布局视口宽度 −15px → 整页重排、图标横向位移 → 指针脱离图标 → 浮层收起 → 滚动条消失 → 布局复原 → 指针重新命中 → 循环。
- **路径 B（滚动方向）**：页面主动调用 `scrollIntoView()`，或浮层内元素获得焦点触发浏览器自动滚动 → 页面下滑 → 图标上移离开指针 → 收起 → 滚回原位 → 循环。

用户"向下滑…又回到当前"的措辞更贴近路径 B，但**两条路径可并存，未复现前无法判定实际是哪条**。不可因为"用户先描述了滚动"就断定滚动是起因——滚动同样可能只是滚动条出现的伴随结果。

### 共同根因（推论）

浮层的显示改变了文档几何量（尺寸或滚动位置）。**正确的 hover 浮层在显示/隐藏时不应改变文档的任何几何量。**

## 解决方案 / 验证方法

### 生效前提与适用边界

- 仅适用于「hover 触发、浮层内容不需要接收指针事件」的场景（纯展示的二维码符合）。若浮层内需要点击或选中文本，则 `pointer-events: none` 不适用，改为在触发元素与浮层间补一块不可见"安全区"来桥接 hover。
- `scrollbar-gutter: stable` **只解决路径 A，对路径 B 无效**。

### 修复清单（按性价比排序）

1. `html { scrollbar-gutter: stable; }` —— 一行封死路径 A，Windows Chrome 的直接解药
2. 浮层 `position: fixed`（不用 `absolute`，避免受祖先 transform/overflow 影响）+ portal 到 `document.body` + `pointer-events: none`，使其完全不参与文档流与 hit-test
3. 定位时做 flip + clamp：下方空间不足则向上翻，左右也夹进视口内，而非硬撑出边界
4. 删除所有 `scrollIntoView()`；`focus()` 改为 `focus({ preventScroll: true })` —— 封死路径 B
5. 兜底加迟滞（hysteresis）：show delay ≈120ms / hide delay ≈250ms。**这只把振荡频率压到人眼可接受，不消除根因**，不能替代 1–4
6. 若用 Floating UI / Popper：`strategy: 'fixed'` + `flip()` + `shift({ padding: 8 })` 已覆盖第 2、3 条

### 判定路径 A 还是 B 的验证方法（尚未执行）

DevTools 里给 `html` 加 `overflow-y: scroll`（等效常驻滚动条）：
- 震荡消失 → 路径 A
- 仍震荡 → 路径 B，再对 `Element.prototype.scrollIntoView` 打 monkey patch 打印调用栈定位来源

复现前提：Windows 或 Linux 的 Chrome + 窗口高度足够小，使浮层溢出视口。

### 第三方站点的临时规避

`Ctrl` `-` 缩小页面缩放，或拉高窗口，让浮层有空间弹出即可断环。

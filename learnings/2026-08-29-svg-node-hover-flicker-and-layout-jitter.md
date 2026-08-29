# svg-node-hover-flicker-and-layout-jitter

Date: 2026-08-29
Agent: Antigravity

## 背景 (Background)
在开发《希腊神话全谱图鉴与关系星网》的 SVG 拓扑图与浮层交互时，遇到了两种典型的前端高频震荡/抖动现象：
1. 鼠标移入顶部节点时，整个星空画布发生剧烈上下震荡。
2. 鼠标悬停在圆形节点的边缘描边临界线时，节点发生高频开关闪烁。

## 问题分析 / 核心结论

### 1. 文档流高度挤压导致的「布局震荡死循环」
- **根因**：悬停提示栏（Spotlight Tooltip / HUD）位于 SVG 画布上方的普通文档流中，且高度未固定。当悬停节点关系条目较多时，文案折行将提示框高度撑大（如从 40px 涨至 100px），导致下方 SVG 画布被整体向下推挤。
- **循环机制**：画布下移 $\to$ 鼠标相对于画布移出节点区域 $\to$ 触发 `mouseleave` $\to$ 提示框折叠变回原高 $\to$ 画布回弹 $\to$ 鼠标重新进入节点 $\to$ 触发 `mouseenter` $\to$ 形成高频上下震荡死循环。

### 2. SVG 描边动态重绘与滞后效应导致的「边缘闪烁 (Boundary Flicker & Hysteresis)」
- **根因**：节点未设置独立碰撞箱，鼠标命中区域直接由 `<circle class="bg">`、`<image>` 和 `<text>` 等子元素计算。当鼠标位于半径 25px 的临界线上时：
  - 悬停触发 CSS `stroke-width: 3.5px` 及 `filter: drop-shadow(...)` 动态过渡；
  - 描边加粗和滤镜重绘改变了浏览器的像素级命中测试判断，导致光标在极窄边界内反复进出元素。

## 解决方案 / 验证方法

### 1. 浮层绝对定位化 (HUD Overlay)
- 将悬停提示栏从标准文档流中剥离，设为画布容器内部的绝对定位浮层（`position: absolute; pointer-events: none;`）。
- **效果**：无论文案多长、如何折行，均 100% 不改变下方 SVG 画布的物理 DOM 布局坐标。

### 2. 专属碰撞箱与事件穿透隔离 (Hitbox Buffer & Pointer-Events)
- 在每个 SVG 节点内增加一个透明的专属命中靶区（Hitbox）：
  ```html
  <g class="g-node">
    <!-- 透明稳定碰撞箱，半径比视觉圆大 5~7px 形成缓冲带 -->
    <circle class="g-hitbox" r="32" fill="transparent" pointer-events="all" />
    <circle class="bg" r="25" pointer-events="none" />
    <image pointer-events="none" />
    <text pointer-events="none">神名</text>
  </g>
  ```
- 将带动画效果的子元素统一声明 `pointer-events: none;`，所有鼠标事件由外层透明圆独占捕获。
- **效果**：子元素的描边缩放、滤镜发光与位移动画完全不干扰鼠标命中测试，临界线抖动彻底消除。

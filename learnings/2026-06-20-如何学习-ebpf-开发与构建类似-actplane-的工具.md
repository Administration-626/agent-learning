# 如何学习 eBPF 开发与构建类似 ActPlane 的工具

Date: 2026-06-20
Agent: Gemini CLI

## Background
为了构建类似 ActPlane 这种能够深入操作系统底层进行安全管控和状态监控的工具，开发者需要掌握跨越用户态（User Space）与内核态（Kernel Space）的技术栈。

## Context / Problem
过去，编写和分发 eBPF 程序门槛极高。它需要开发者在本地配置复杂的 Clang/LLVM 编译工具链，强依赖目标宿主机的 Linux 内核头文件版本，并且需要应对极其严苛的内核代码验证器（Verifier）。这使得很多开发者望而却步。

## Solution / Learnings
在现代的云原生环境下，推荐使用 **C语言 (内核态) + Rust (用户态) + CO-RE (一次编译到处运行)** 的现代技术栈来降低门槛。一条平滑的学习路径如下：

### 1. 打牢语言基础
- **受限的 C 语言**：无需精通大型 C 工程，但必须熟悉结构体、指针、宏定义和基础的位运算。eBPF 内核代码不能动态分配内存，也不能调用标准库。
- **Rust 语言**：负责构建安全的用户态控制面，处理系统状态通信与业务逻辑下发。

### 2. 通过 Aya 框架入门
Aya 是目前生态极佳的纯 Rust eBPF 框架。
- 放弃传统的 BCC (Python) 教程，直接从 **[Aya Book](https://aya-rs.dev/book/)** 入手。
- 目标：跑通第一个基于 Aya 的 Hello World，例如利用 Tracepoint 探针拦截并打印系统的 `execve` 调用日志。

### 3. 攻克 eBPF 三大核心机制
掌握基础后，深入理解 ActPlane 级别的核心架构：
- **BPF Maps (数据通道)**：熟练使用 RingBuffer 和 Hash Maps。这是 eBPF 内核态与 Rust 用户态之间高频传递消息、共享状态的唯一桥梁。
- **BPF-LSM (主动防御)**：普通的 Tracepoint 只能做到“旁路观察”，而通过挂载 `SEC("lsm/...")` 钩子，不仅能监控，还能通过向系统调用返回 `-EPERM` 等错误码，实现真正的物理阻断（类似沙箱行为拦截）。
- **对抗内核验证器 (Verifier)**：内核严格限制了 eBPF 的指令数与循环操作以防死机。学习如何巧妙使用 `bpf_loop` 辅助函数来处理复杂的逻辑（如字符串匹配），避免编译时被 Verifier 拒绝。

### 4. 拆解优秀开源社区代码
- **教程学习**：研读 eunomia-bpf 社区的 [《eBPF 开发实践教程》](https://eunomia.bpf.io/zh/bpf-developer-tutorial/)。
- **源码分析**：模仿 ActPlane 的设计，观察它是如何把高阶的安全规则编译降级为二进制位掩码，并直接注入到 eBPF Map 中实现动态重载的。

## Pitfalls
- **依赖过时教程**：错误地从老旧的非 CO-RE 时代教程（如老版 BCC）学起，导致代码难以在多版本 Linux 间移植分发。
- **轻视验证器限制**：在内核态 C 代码里随意使用 `for` 循环或过大的栈内存，导致代码在加载阶段就被 eBPF Verifier 拦截。必须学会“用限制内的语法”写代码。

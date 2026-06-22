# diagnose-tools 的高阶内核编程技巧与架构分析

Date: 2026-06-22
Agent: Antigravity

## 背景 (Background)
`diagnose-tools` 是由阿里内核团队开发的一个系统级诊断与性能分析工具集。在本次任务中，我们利用 `deep-code-read` 技能（并且通过严苛的 ABC Agent 闭卷考试循环验证），深度提炼了该代码库的核心架构和认知模型。该项目并未采用当下流行的 eBPF 技术，而是通过极度硬核的原生内核模块（Kernel Module）编程，实现了极低的性能开销与跨版本兼容。

## 问题 (Problem)
在面对极高的并发要求（如每秒数百万次的 IRQ 或调度追踪）、极其老旧且分裂的生产环境内核版本（如传统的 CentOS 6/7 以及 2.6/3.10 内核）时，传统的 eBPF 会因为内核版本不支持（缺乏 CO-RE 或 BTF）而无法工作。同时，标准的内核探测手段（如 `kprobe` 异常处理和 `sys_call_table` 修改）往往因为安全保护机制或性能开销过大而无法满足工业级要求。

## 解决方案 (Solution)
该项目采用了一系列非常规但极具智慧的底层设计模式：

1. **伪系统调用 (Fake Syscall via Tracepoint)**：不修改脆弱的系统调用表，而是劫持通用的 `sys_enter` Tracepoint。一旦检测到专属的伪系统调用号（`DIAG_BASE_SYSCALL`），立即在钩子函数中执行逻辑并返回，强行绕过真实的系统调用流程。
2. **每 CPU 无锁上下文 (Per-CPU Lockless Context)**：在初始化阶段为每个 CPU 独立分配一块巨大的一体化状态缓冲（`diag_percpu_context`）。所有的中断和探测回调函数只向自身 CPU 专属的缓冲中追加数据，全程零锁（Zero-Lock）竞争。
3. **机器码热补丁劫持 (Hot-Patching)**：放弃使用带来异常开销的 `kprobe`，利用 `RELATIVEJUMP`、`JUMP_INSTALL` 等宏直接修补目标内核函数的开头指令（Text 段），插入汇编跳转，以极低的成本夺取控制权。
4. **红黑树堆栈去重 (RB-Tree Stack Deduplication)**：对于巨量的函数调用栈（如 perf 抓取时），并不盲目存储，而是在内核里维护一棵红黑树。相同的堆栈路径只增加原子的 `hit_count`，避免内核内存泄漏。
5. **弱符号桩适配兼容 (Weak Symbol Stubbing)**：在 `stub.c` 中使用 `__attribute__((weak))` 给出各种内核 API 的兜底空壳，配合 `kallsyms_lookup_name` 动态解析非导出函数，让同一套模块能兼容十几年的不同内核版本。
6. **TLV 变长数据安全解包**：通过在变长数据流块开头打上 `DIAG_VARIANT_BUFFER_HEAD_MAGIC_SEALED` 魔法封印，在用户态使用统一的宏 `extract_variant_buffer` 进行安全步进读取，彻底解决变长数据解析带来的越界段错误风险。

## 避坑指南 (Pitfalls)
1. **经验定势陷阱**：在分析或修改此类项目时，切忌陷入“这肯定是用 eBPF 写的”或者“这一定是用标准 kprobe 实现的”这种思维惯性。必须严格基于源码事实（通过 `deep-code-read` 等闭卷手段），因为在极致性能场景下，工程师往往会越过标准框架进行定制。
2. **走钢丝式开发**：这种绕过 Verifier（安全验证器），直接修补机器码以及裸操作共享内存的方法，没有任何安全网。稍加修改若破坏了内存边界或触发了不正确的中断保护，会直接导致 Kernel Panic，开发难度和风险极高。

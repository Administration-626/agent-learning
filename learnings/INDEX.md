# Knowledge Index

> Total Learnings: **18** | Agents: **4** | Last updated: **2026-08-18**

| Date | Title | Agent | Summary |
| :--- | :--- | :--- | :--- |
| `2026-07-09` | [中国大陆网络环境下 Docker 镜像拉取的代理与中转最佳实践](./2026-07-09-中国大陆网络环境下-docker-镜像拉取的代理与中转最佳实践.md) | `Antigravity` | 在中国大陆网络环境下，拉取 Docker Hub (docker.io) 或 GitHub Container Registry (ghcr.io) 的容器镜像时，常遇到网络连接重置或超时的问题（如 i/o timeout）。 |
| `2026-07-06` | [Codex 客户端配置自定义中转代理 API 报错 401/502 解决方案](./2026-07-06-codex-客户端配置自定义中转代理-api-报错-401-502-解决方案.md) | `Antigravity` | 用户尝试将 Codex CLI (v0.142.5) 与第三方 OpenAI API 兼容代理服务（如 tokenx24.com）对接，用于日常编码辅助。最初在 ~/.codex/config.toml 中将 modelprovider 配置为自定义提供商 customcpa，配合自定义模型 gpt-5.5。... |
| `2026-07-06` | [Codex 客户端配置自定义中转代理 API 报错 401 解决方案](./2026-07-06-codex-客户端配置自定义中转代理-api-报错-401-解决方案.md) | `Antigravity` | 在 Codex 客户端配置自定义模型服务商 (modelprovider = "customprovider") 时，通常会在 ~/.codex/config.toml 中配置 baseurl、wireapi 并在 httpheaders 中以 Authorization = "Bearer sk-..." 形式手动注... |
| `2026-06-23` | [公共Git仓库本地私有文件保留最佳实践](./2026-06-23-公共git仓库本地私有文件保留最佳实践.md) | `Antigravity` | 在多人协作的公共 Git 仓库中，开发者常常需要保留一些“本地特供”的未提交文件（例如本地测试脚本、临时日志或特殊修改的配置等）。同时，公共仓库的 .gitignore 属于项目级别的共识约束，不应当为了满足个人特定环境的需求而随意修改。 |
| `2026-06-22` | [AI智能体生态架构设计：Skill与Plugin的概念边界与输出范式](./2026-06-22-ai智能体生态架构设计-skill与plugin的概念边界与输出范式.md) | `Antigravity` | 在重构 deep-code-reader（一个用于深度阅读源码并生成 AI 知识库的工具）时，我们决定将工具本身的安装路径定为 ~/.agents/skills/，而将工具运行后生成的项目知识库（包含多个子模块认知文档）输出到 ~/.agents/plugins/ 目录。用户对此产生了疑问：为什么工具不放在 plugi... |
| `2026-06-22` | [diagnose-tools 的高阶内核编程技巧与架构分析](./2026-06-22-diagnose-tools-的高阶内核编程技巧与架构分析.md) | `Antigravity` | diagnose-tools 是由阿里内核团队开发的一个系统级诊断与性能分析工具集。在本次任务中，我们利用 deep-code-read 技能（并且通过严苛的 ABC Agent 闭卷考试循环验证），深度提炼了该代码库的核心架构和认知模型。该项目并未采用当下流行的 eBPF 技术，而是通过极度硬核的原生内核模块（Ker... |
| `2026-06-22` | [eBPF 与内核模块 (KO) 在企业级生产环境的技术选型与优劣权衡](./2026-06-22-ebpf-与内核模块-ko-在企业级生产环境的技术选型与优劣权衡.md) | `Antigravity` | 通过分析业界一线内核专家分享的生产实战案例，结合 diagnose-tools 源码底层的架构设计，我们深层剖析了在真实的万核级企业集群场景下，前沿的 eBPF 技术与传统的 Linux 内核模块（KO）之间的真实优劣势与选型逻辑。 |
| `2026-06-21` | [eBPF与Native底层探针在x86及ARM64架构下的极微观底噪测试与陷阱剖析](./2026-06-21-ebpf与native底层探针在x86及arm64架构下的极微观底噪测试与陷阱剖析.md) | `Antigravity` | 我们在进行千万级 PPS 网络数据路径与极度敏感调度器的开销观测方案设计时，需要论证“在极端高频链路上必须抛弃 eBPF Kprobe，改用原生静态 Tracepoint + 无锁队列”的合理性。为此，我们在 x86 环境与 ARM64（RK3588，Kernel 5.10）环境上，设计了一套极高精度的内核态纯切入开销... |
| `2026-06-21` | [eBPF框架概念澄清：JIT, CO-RE, libbpf与BCC的性能边界](./2026-06-21-ebpf框架概念澄清-jit-co-re-libbpf与bcc的性能边界.md) | `Antigravity` | 在评估性能插桩开销时，开发者往往混淆了 eBPF 生态中的技术栈定位，试图探究“使用 libbpf (CO-RE)”和“JIT”或“BCC”相比，究竟谁的内核运行时性能更好。 |
| `2026-06-21` | [动态插桩的性能评测与变量隔离踩坑](./2026-06-21-动态插桩的性能评测与变量隔离踩坑.md) | `Antigravity` | 在开发用于论证“获取性能测试开销的方法”（三段式开销：BaseCost / FirstCost / SecondCost）的微基准评估平台时，我们对同架构平台上的 eBPF、Native Kprobe、Ftrace 以及 Perf 四种动态追踪技术进行了横向评测，通过超高频触发 dosysopenat2 并计算时间差来... |
| `2026-06-20` | [ActPlane 的配置与使用工作流](./2026-06-20-actplane-的配置与使用工作流.md) | `Gemini CLI` | 了解了 ActPlane 的强大机制后，开发者需要掌握如何在实际开发中引入这套基于 eBPF 的内核级约束工具，以及它的配置作用域是如何管理的。 |
| `2026-06-20` | [AI Agent 权限控制：沙箱局限性与内核级约束](./2026-06-20-ai-agent-权限控制-沙箱局限性与内核级约束.md) | `Gemini CLI` | 在为 AI Agent 设置权限约束时，开发者和用户通常依赖 Prompt 提示词、工具层 Hook 拦截或者 Docker 沙箱。然而，在面对复杂的开发工作流约束时，这些常规手段往往会失效或表现糟糕。 |
| `2026-06-20` | [cargo install 与 crates.io 发布机制](./2026-06-20-cargo-install-与-crates-io-发布机制.md) | `Gemini CLI` | 用户询问为何像 ActPlane 这种涉及底层系统调用拦截的 eBPF 工具，可以直接通过 cargo install 下载，以及这种第三方包是否允许放置在 Cargo 的仓库中。这反映了用户对包管理器的分发机制、预编译内核工具的分发方式以及运行权限隔离的好奇。 |
| `2026-06-20` | [eBPF 用户态控制面语言选型实证分析：Python vs C vs Rust vs Go](./2026-06-20-ebpf-用户态控制面语言选型实证分析-python-vs-c-vs-rust-vs-go.md) | `Gemini CLI` | 在开发生产级的 eBPF 用户态控制面（例如 ActPlane 这样的高频监控系统）时，工程团队面临语言选型难题。主流选项包括 Python、C/C++、Rust 与 Go。不同的选型将直接决定系统的分发成本、运行延迟边界以及内存安全水位。 |
| `2026-06-20` | [tmux 下终端界面程序（TUI）导致的鼠标冲突与文本选中](./2026-06-20-tmux-下终端界面程序-tui-导致的鼠标冲突与文本选中.md) | `Gemini CLI` | 在开启了鼠标支持（set -g mouse on）的 tmux 环境中运行交互式的命令行程序（TUI，如部分 AI Agent 客户端）时，用户经常会遇到无法使用鼠标拖拽来高亮和复制输出文本的问题。 |
| `2026-06-20` | [VS Code Remote-SSH 代理覆盖与优先级冲突](./2026-06-20-vs-code-remote-ssh-代理覆盖与优先级冲突.md) | `Gemini` | 在局域网同网段环境下，使用 VS Code Remote-SSH 扩展连接远端 Linux 服务器（如 Ubuntu）进行开发。本地电脑运行有代理客户端（监听端口如 8205），远端服务器系统层已配置了通过局域网主机名解析的系统级环境变量（如 httpproxy=http://tanhais-computer:8205... |
| `2026-06-20` | [如何学习 eBPF 开发与构建类似 ActPlane 的工具](./2026-06-20-如何学习-ebpf-开发与构建类似-actplane-的工具.md) | `Gemini CLI` | 为了构建类似 ActPlane 这种能够深入操作系统底层进行安全管控和状态监控的工具，开发者需要掌握跨越用户态（User Space）与内核态（Kernel Space）的技术栈。 |
| `2026-06-05` | [通用 Agent 学习记忆](./2026-06-05-universal-agent-learning-memory.md) | `Codex` | 这个学习仓库需要同时服务 Codex、Claude Code、Gemini CLI、Cursor 等多个 AI 编程 Agent。 |

# VS Code Remote-SSH 代理覆盖与优先级冲突

Date: 2026-06-20
Agent: Gemini

## 背景 (Background)
在局域网同网段环境下，使用 VS Code Remote-SSH 扩展连接远端 Linux 服务器（如 Ubuntu）进行开发。本地电脑运行有代理客户端（监听端口如 `8205`），远端服务器系统层已配置了通过局域网主机名解析的系统级环境变量（如 `http_proxy=http://tanhais-computer:8205`），且终端通过该代理联网正常。

## 问题 (Problem)
在远端尝试安装工作区扩展（Workspace Extensions）时，VS Code 持续报错 `Failed to fetch`。

### 逻辑审计与断裂点分析：
1. **隐藏前提错误**：曾误以为是远端 mDNS 域名解析失败或 Node.js 运行时不兼容主机名。
2. **实际因果机制**：本地 VS Code 的用户设置（User Scope）中残留了 `"http.proxy": "http://127.0.0.1:8205"`（原本用于解决本地 AI Agent 前端连接）。
3. **配置穿透与冲突**：VS Code 的配置机制具有穿透性。本地 User 配置的优先级高于远端系统的环境变量。因此，本地的 `127.0.0.1:8205` 被强行灌入远端的 `vscode-server` 运行时。
4. **流量死循环**：远端进程误以为代理在远端本地，试图连接 Ubuntu 自身的 `127.0.0.1:8205`。因远端并未运行代理服务，导致连接被拒，引发 `Failed to fetch`。

## 解决方案 (Solution)
彻底清理 VS Code 各层级配置文件中具有污染性的代理设置，让其退回到正确的物理环境变量层。

1. **清理本地全局污染**：删除本地 `C:/Users/administer/.../settings.json`（User 作用域）中的 `"http.proxy"` 和 `"https.proxy"` 设置。
2. **清理远端残留配置**：删除远端服务器 `/home/tan/.vscode-server/data/Machine/settings.json`（Machine 作用域）中的所有代理设置。
3. **优先级回退与生效**：当高优先级的 User 和 Machine 配置全部归零后，VS Code 运行时自动退位读取最低优先级的远端系统环境变量（`tanhais-computer:8205`）。
4. **重启验证**：执行 `Kill VS Code Server on Host` 重启远端常驻进程，使其重新加载环境，由于系统级代理通路原本就是通的，插件顺利安装。

## 避坑指南 (Pitfalls)
* **权责不对等污染**：本地 User 级别的 `settings.json` 并非“仅本地生效”。在远程连接中，它会作为全局基底强行覆盖远端。
* **物理地址与回环混淆**：在 User 配置中写 `127.0.0.1` 极易在 SSH 架构下引发“远端以为是远端的 127.0.0.1”的本地化闭环死锁。
* **优先级审查盲区**：排查网络问题时，应遵循 **Machine settings -> User settings -> System Env** 的优先级反向回溯。两端配置文件未清空前，终端（Shell）测试通过的环境变量对后台常驻进程（Daemon）不具备必然决定性。

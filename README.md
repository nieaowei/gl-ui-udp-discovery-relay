# GL.iNet UDP Discovery Relay UI

GL.iNet SDK4 原生管理插件，版本 **0.0.1**，GPL-3.0-only。通过已认证的管理接口控制独立的 [UDP Discovery Relay Core](https://github.com/nieaowei/udp-discovery-relay)，可单独卸载 UI 而不影响中继服务。

## 功能与平台

- 中英文、主题适配和响应式布局。
- LocalSend/自定义 UDP 规则，动态读取 OpenWrt 逻辑网络，支持双向或独立输入/输出的单向配置。
- 服务启停、重启、开机设置、保存/应用及恢复默认。
- Core 的真实状态、计数、内存与最近错误；缺失统计显示未知值。
- 最多 200 条、64 KiB 日志，支持刷新、暂停、过滤、清空显示及导出。

页面通过 menu.d 注册，使用 SDK4 的 CommonJS Vue/GL 组件、认证 `/rpc` 分派与 `oui.ubus`。配置写入经过 Core 校验、revision 并发检查及原子替换。软件包不自动修改防火墙或路由。

UI 要求兼容的 GL.iNet SDK4 运行环境；它不绑定路由器型号，但不能直接用于不具备 SDK4 的普通 OpenWrt 或 Linux 管理页面。Core 可在这些系统上独立运行。

## 构建与安装

将本仓库放入匹配 SDK 的 `package/gl-ui-udp-discovery-relay/`，确保 Core 配方和 SDK4 依赖可用，执行：

```sh
make package/gl-ui-udp-discovery-relay/compile V=s
```

依赖为 `udp-discovery-relay`、`gl-sdk4-ui-core`、`gl-oui-rpc` 和 `luci-lib-nixio`。页面直接使用运行环境的 Vue 和 GL 组件，无前端构建或外部 CDN 依赖。安装后在应用程序菜单打开 UDP Discovery Relay。

部署前验证目标环境的菜单加载、已认证调用、无效 sid 拒绝及实际服务操作。配置使用逻辑网络名称，由 Core 动态解析到 Linux 接口。

## 开发与验证

```sh
npm test
```

本仓库独立维护 UI 的源码、版本检查、RPC 测试、APK 构建与发布。Core 仓库不再存放 UI 快照，也不构建 UI 包。

直接使用 SDK 的 APK v3 打包工具时：

```sh
sudo scripts/build-apk.sh /path/to/sdk
scripts/test-apk.sh /path/to/sdk
```

输出为 `noarch` UI APK、校验和、许可证与构建来源记录。CI 验证 root 文件所有权，并在临时根目录检查 UI 安装、删除和依赖文件保留；测试不会执行固件 nginx/procd 钩子。分支提交上传 `gl-ui-noarch-apk` 构建产物，匹配版本的 tag 才触发独立 UI Release。

RPC 契约测试使用已固定提交的 Core 配置模块；CI 将它检出到 `.core/`，只作为测试依赖，不放入 UI 安装包。也可指定已有 Core 源码：

```sh
lua5.1 scripts/test-rpc.lua . /path/to/udp-discovery-relay/openwrt/udp-discovery-relay/files/usr/lib/lua/udp-discovery-relay/config.lua
node scripts/check-version.cjs
```

Core 仓库提供通用 [安装与验收](https://github.com/nieaowei/udp-discovery-relay/blob/main/docs/acceptance.md)、[防火墙与免 NAT](https://github.com/nieaowei/udp-discovery-relay/blob/main/docs/firewall.md) 和 [测试指南](https://github.com/nieaowei/udp-discovery-relay/blob/main/docs/testing.md)。

布局预览只用于开发：将 `UDR_PREVIEW_VUE` 指向本地 Vue 2 的 `vue/dist/vue.js` 后运行 `node scripts/preview.cjs`。预览绑定 `127.0.0.1:5088`，明确使用 fixture 数据及近似组件，不进入安装包，也不替代 SDK4 环境验收。

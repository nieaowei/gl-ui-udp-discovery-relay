# GL.iNet UDP Discovery Relay UI

独立的 GL.iNet SDK4 原生管理插件，版本 0.0.1，GPL-3.0-only。依赖 `udp-discovery-relay` Core，可单独卸载 UI 而不影响中继服务。

沿用提供的 `gl-ui-avahi-daemon` 扩展机制：menu.d 注册、CommonJS Vue 页面、已有认证 `/rpc` 分派和 `oui.ubus`。使用原生 GL/Element 组件和主题变量，完整简体中文与英文。页面显示 Core 的真实 JSON 统计；无统计时显示 `—`。没有 iframe、外部 CDN、任意命令执行或自动防火墙改动。

功能包括规则增删改与单/双向、逻辑网络动态选择、LocalSend/自定义 UDP、启停/重启/开机管理、保存/应用/恢复默认、200条/64KiB 日志的刷新/暂停/过滤/清空显示/导出。配置写入通过 Core 校验，提供并发 revision、锁与原子替换。

`Makefile` 是标准 OpenWrt 软件包配方。将本仓库放在厂商或匹配 OpenWrt SDK 的 `package/gl-ui-udp-discovery-relay/`，确保 Core 配方和固件 SDK4 依赖已就绪，执行：

```sh
make package/gl-ui-udp-discovery-relay/compile V=s
```

无需前端编译或 npm 运行依赖：安装的 CommonJS 页面使用路由器现有 Vue 与 GL 组件。开发测试：

```sh
npm test
```

隔离测试、完整 SDK 构建/打包脚本、RPC 测试、Core UCI 适配器、APK 生命周期与安装验收文档位于相邻 `udp-discovery-relay` 仓库。该仓库内 `openwrt/gl-ui-udp-discovery-relay` 是本 UI 的可构建快照，运行 Core 仓库 `scripts/sync-ui.sh` 更新。

完整的真实固件 UI 会话认证、菜单加载、procd 和客户端验收尚待在 MT3600BE 4.11.0 上执行。配置必须选择当前逻辑网络，不能把 Linux 设备名当成逻辑网络填入。安装包默认不修改防火墙或其他插件。正式部署前必须确认未认证 `/rpc` 无法调用本模块。

开发布局预览（fixture，近似 GL 组件，**不用于产品统计或功能验收**）：安装本地 Vue 2 开发包，将 `UDR_PREVIEW_VUE` 指向 `vue/dist/vue.js` 后运行 `node scripts/preview.cjs`。预览仅绑定 127.0.0.1:5088，预览脚本不随 APK 安装。

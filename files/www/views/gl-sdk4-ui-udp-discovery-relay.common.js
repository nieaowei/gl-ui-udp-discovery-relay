/* SDK4 view using built-in Vue/GL components and the authenticated RPC client. */
module.exports = (function () {
    'use strict';
    var uiVersion = '0.0.1';
    var words = {
        description: ['在已互通的 IPv4 子网之间中继 UDP 发现报文，保留设备源地址。文件传输由设备直接完成。', 'Relay UDP discovery between routed IPv4 subnets while preserving device addresses. Devices transfer files directly.'],
        dashboard: ['概览', 'Overview'], rules: ['中继规则', 'Relay rules'], logs: ['日志', 'Logs'],
        running: ['运行中', 'Running'], stopped: ['已停止', 'Stopped'], unknown: ['状态未知', 'Unknown status'],
        boot: ['开机启动', 'Start at boot'], enabled: ['启用中继', 'Enable relay'],
        start: ['启动', 'Start'], stop: ['停止', 'Stop'], restart: ['重启', 'Restart'],
        save: ['保存', 'Save'], apply: ['保存并应用', 'Save and apply'], reset: ['恢复默认配置', 'Restore defaults'],
        refresh: ['刷新', 'Refresh'], loading: ['正在加载…', 'Loading…'], empty: ['暂无记录', 'No entries'],
        addLocal: ['添加 LocalSend', 'Add LocalSend'], addCustom: ['添加自定义 UDP', 'Add custom UDP'],
        name: ['名称', 'Name'], protocol: ['协议', 'Protocol'], port: ['UDP 端口', 'UDP port'],
        multicast: ['组播或广播地址', 'Multicast or broadcast address'], direction: ['转发方向', 'Direction'],
        bidirectional: ['双向', 'Bidirectional'], oneway: ['单向', 'One way'], network: ['参与网络', 'Participating networks'],
        input: ['输入网络', 'Input networks'], output: ['输出网络', 'Output networks'],
        log_level: ['日志级别', 'Log level'], error: ['错误', 'Error'], warn: ['警告', 'Warning'], info: ['信息', 'Info'], debug: ['调试', 'Debug'], off: ['关闭', 'Off'],
        remove: ['删除', 'Delete'], ruleEnabled: ['启用规则', 'Enable rule'],
        max_packet_size: ['最大 UDP 载荷（字节）', 'Maximum UDP payload (bytes)'], loop_protection: ['循环过滤', 'Loop filtering'],
        version: ['版本', 'Version'], uptime_seconds: ['运行时间', 'Uptime'], active_rules: ['活跃规则', 'Active rules'],
        received: ['接收报文', 'Received packets'], forwarded: ['转发报文', 'Forwarded packets'], dropped: ['丢弃报文', 'Dropped packets'], loop_filtered: ['循环过滤报文', 'Loop filtered packets'],
        rss_bytes: ['内存占用', 'Memory'], recent_errors: ['最近错误', 'Recent errors'], interfaces: ['活跃接口', 'Active interfaces'],
        statsPending: ['等待守护进程统计…', 'Waiting for daemon statistics…'],
        auto: ['自动刷新', 'Auto refresh'], errorsOnly: ['仅错误', 'Errors only'], clear: ['清空显示并暂停', 'Clear display and pause'], export: ['导出日志', 'Export logs'],
        logHint: ['读取 logd 最近 200 条记录，最多显示 64 KiB。清空只影响当前显示。', 'Reads the latest 200 logd entries, limited to 64 KiB. Clearing affects this display only.'],
        hint: ['接口来自 OpenWrt 逻辑网络。双向规则至少选择两个不同子网；单向规则分别选择输入和输出网络。广播请使用 255.255.255.255。', 'Interfaces come from OpenWrt logical networks. Select at least two distinct subnets for bidirectional rules, or separate input/output networks for one-way rules. Use 255.255.255.255 for broadcast.'],
        firewall: ['请先允许所选网络到路由器的发现 UDP，以及设备间的 TCP 53317。此插件不会自动修改防火墙。', 'Allow discovery UDP to the router from the selected networks and TCP 53317 between devices. This plugin does not change firewall rules.'],
        saved: ['配置已保存。', 'Configuration saved.'], applied: ['配置已保存并请求重新加载，请查看状态与最近错误。', 'Configuration saved and reload requested. Check status and recent errors.'],
        requested: ['操作已完成，请查看服务状态。', 'Action completed. Check service status.'],
        unsaved: ['有未保存的修改', 'Unsaved changes'], synced: ['配置已同步', 'Configuration synchronized'],
        confirm: ['确定', 'Confirm'], cancel: ['取消', 'Cancel'], confirmTitle: ['确认操作', 'Confirm action'],
        discard: ['丢弃未保存的修改？', 'Discard unsaved changes?'], resetConfirm: ['恢复 LocalSend 默认配置并替换当前规则？保存后点击应用使其生效。', 'Replace current rules with the LocalSend defaults? Apply afterward to activate them.'],
        removeConfirm: ['删除这条规则？保存并应用后生效。', 'Delete this rule? Save and apply to activate the change.'],
        restartConfirm: ['当前存在未保存的修改。使用已保存的配置启动或重启？', 'Start or restart using saved settings while there are unsaved changes?']
    };
    Object.assign(words, {
        reloadConfig: ['重新读取配置', 'Reload configuration'], edit: ['编辑', 'Edit'], done: ['完成编辑', 'Done editing'], newRule: ['新建规则', 'New rule'], editRule: ['编辑规则', 'Edit rule'],
        editorHint: ['完成编辑后，点击页面底部的“保存并应用”使配置生效。', 'Finish editing, then use Save and apply at the bottom of the page to activate changes.'],
        finishFirst: ['请先完成或取消规则编辑', 'Finish or cancel rule editing first'], discardEdits: ['撤销修改', 'Discard changes'],
        settingsTitle: ['中继设置', 'Relay settings'], advanced: ['高级设置', 'Advanced settings'],
        enabledRule: ['已启用', 'Enabled'], disabledRule: ['已停用', 'Disabled'], noRules: ['还没有中继规则', 'No relay rules yet'],
        noRulesHint: ['添加 LocalSend 预设，或自定义 UDP 发现规则。', 'Add the LocalSend preset or a custom UDP discovery rule.'],
        noNetworks: ['未选择网络', 'No networks selected'], noInterfaces: ['未读取到逻辑网络，请先检查 OpenWrt 网络配置。', 'No logical networks found. Check the OpenWrt network configuration.'],
        nameError: ['请输入 1–80 个字符的名称。', 'Enter a name of 1–80 characters.'], portError: ['请输入 1–65535 的整数端口。', 'Enter an integer port from 1 to 65535.'],
        protectedPort: ['此端口保留给 DNS、DHCP、SSDP 或 mDNS。', 'This port is reserved for DNS, DHCP, SSDP or mDNS.'],
        addressError: ['请输入 IPv4 组播地址或 255.255.255.255；不支持 mDNS 组播地址。', 'Enter an IPv4 multicast address or 255.255.255.255; the mDNS group is not supported.'],
        networkError: ['请选择 2–16 个不同的逻辑网络。', 'Select 2–16 distinct logical networks.'],
        inputError: ['请选择输入网络。', 'Select input networks.'], outputError: ['请选择输出网络，且不能与输入网络重复。', 'Select output networks that do not overlap with the inputs.'],
        duplicateError: ['已有启用的规则使用此地址和端口。', 'An enabled rule already uses this address and port.'],
        rulesLimit: ['最多支持 32 条规则。', 'Up to 32 rules are supported.'],
        connectionHint: ['发现报文由中继转发；实际数据传输还需要设备间路由和防火墙允许通信。此插件不会修改防火墙。', 'The relay forwards discovery packets. Data transfers also require routing and firewall access between devices. This plugin does not change firewall rules.'],
        noErrors: ['暂无最近错误', 'No recent errors'], logEmpty: ['暂无日志', 'No logs yet'], filterEmpty: ['没有匹配的错误日志', 'No matching error logs'],
        saving: ['正在处理…', 'Working…'], service: ['中继服务', 'Relay service'], rulesCount: ['条规则', 'rules'],
        globalHint: ['配置开关决定下次加载是否启用中继；上方按钮控制当前服务进程。', 'This setting controls whether relaying is enabled when configuration is loaded. The buttons above control the current service process.'],
        dismiss: ['关闭提示', 'Dismiss'], duplicate: ['复制', 'Duplicate'], copySuffix: ['（副本）', ' (copy)'],
        ruleSearch: ['搜索规则名称、端口或网络', 'Filter rules by name, port, or network'],
        ruleFilterEmpty: ['没有匹配的中继规则', 'No matching relay rules'],
        logSearch: ['搜索日志关键词', 'Filter log lines'], scrollBottom: ['滚动到底部', 'Scroll to bottom'],
        linesUnit: ['行', 'lines']
    });
    var css = `
.udr-native{min-width:0;line-height:1.5}.udr-native *{box-sizing:border-box}.udr-muted{color:var(--text-subtitle);line-height:1.65}.udr-description{margin:0 0 16px}.udr-native h3{font-size:16px;margin:0}.udr-native h4{font-size:14px;margin:0 0 16px}.udr-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.udr-between{justify-content:space-between}.udr-service{display:flex;align-items:center;justify-content:space-between;gap:12px 20px;flex-wrap:wrap;margin-bottom:18px;padding:16px 18px;border:1px solid var(--border);border-radius:8px;background:var(--background-subtitle,var(--bg-body,#f7f8fa))}.udr-status{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:600}.udr-versions{font-size:12px;color:var(--text-subtitle);margin-top:6px;line-height:1.5}.udr-dot{width:8px;height:8px;border-radius:50%;background:var(--text-disabled,#9ca3af);flex-shrink:0}.udr-dot.running{background:var(--success,#20a87b);box-shadow:0 0 0 3px rgba(32,168,123,.2)}.udr-dot.warn{background:var(--warning,#d97706);box-shadow:0 0 0 3px rgba(217,119,6,.2)}.udr-boot{display:flex;align-items:center;gap:10px;white-space:nowrap;margin:0 4px 0 0}.udr-native .gl-btn{margin:0;height:36px;min-height:36px;padding:0 18px;white-space:nowrap;flex-shrink:0}.udr-tabs{display:flex;gap:24px;border-bottom:1px solid var(--border);margin:0 0 20px;overflow-x:auto}.udr-tab{display:inline-flex;align-items:center;gap:6px;background:transparent;border:0;border-bottom:2px solid transparent;padding:12px 2px;color:var(--text-subtitle);font:inherit;white-space:nowrap;cursor:pointer;transition:color .15s,border-color .15s}.udr-tab:hover{color:var(--primary)}.udr-tab.active{color:var(--primary);border-color:var(--primary);font-weight:600}.udr-tab-dot{width:6px;height:6px;border-radius:50%;background:var(--primary);flex-shrink:0}.udr-tab:focus-visible,.udr-native summary:focus-visible,.udr-alert-close:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}.udr-count{font-size:12px;padding:1px 7px;border-radius:10px;border:1px solid var(--border);background:var(--background-subtitle,var(--bg-body,#f7f8fa));font-weight:400}.udr-tab.active .udr-count{border-color:var(--primary);color:var(--primary)}.udr-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:20px}.udr-metric{background:var(--background-subtitle,var(--bg-body,#f7f8fa));padding:18px;border:1px solid var(--border);border-radius:8px;min-width:0}.udr-metric strong{display:block;font-size:25px;line-height:1.3;font-weight:600;margin-top:12px;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}.udr-metric.secondary strong{font-size:19px}.udr-metric.is-warn strong{color:var(--warning,#c28b2e)}.udr-panel{border:1px solid var(--border);border-radius:8px;padding:20px;margin:20px 0}.udr-panel:last-child{margin-bottom:0}.udr-panel-head{margin-bottom:18px}.udr-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 24px}.udr-field{min-width:0}.udr-field>label{display:block;margin-bottom:8px}.udr-field .el-select,.udr-field .el-input{width:100%}.udr-field.is-invalid .el-input__inner,.udr-field.is-invalid input,.udr-field.is-invalid select{border-color:var(--error,#d95050)}.udr-wide{grid-column:1/-1}.udr-inline{display:inline-flex;align-items:center;gap:10px}.udr-help{font-size:12px;margin:8px 0 0}.udr-advanced{border-top:1px solid var(--border);margin-top:20px;padding-top:16px}.udr-native summary{list-style:none;position:relative;cursor:pointer;color:var(--text-subtitle);padding:4px 0 4px 20px;font-weight:500}.udr-native summary::-webkit-details-marker{display:none}.udr-native summary::before{content:"";position:absolute;left:4px;top:50%;width:6px;height:6px;border-right:2px solid var(--text-subtitle);border-bottom:2px solid var(--text-subtitle);transform:translateY(-50%) rotate(-45deg);transition:transform .15s}.udr-advanced[open]>summary{margin-bottom:18px;color:var(--text-regular)}.udr-advanced[open]>summary::before{transform:translateY(-65%) rotate(45deg)}.udr-rule{border:1px solid var(--border);border-radius:8px;padding:18px 20px;margin-top:12px;transition:border-color .15s}.udr-rule:not(.udr-editor):hover{border-color:var(--primary)}.udr-rule.is-disabled{opacity:.78}.udr-rule-heading{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.udr-badge{font-size:12px;color:var(--text-subtitle);border:1px solid var(--border);border-radius:4px;padding:2px 8px;background:var(--background-subtitle,var(--bg-body,#f7f8fa))}.udr-badge.is-enabled{border-color:rgba(32,168,123,.4);color:var(--success,#20a87b);background:rgba(32,168,123,.1)}.udr-badge.is-disabled{color:var(--text-subtitle)}.udr-rule-meta{margin:7px 0 12px;font-size:13px;overflow-wrap:anywhere}.udr-path{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:13px}.udr-network{background:var(--background-subtitle,var(--bg-body,#f7f8fa));border:1px solid var(--border);border-radius:4px;padding:3px 9px}.udr-rule-tools{margin-top:16px;padding-top:14px;border-top:1px solid var(--border)}.udr-rule-search{margin:12px 0;max-width:360px}.udr-editor{border-color:var(--primary);background:var(--background-subtitle,var(--bg-body,#f7f8fa))}.udr-empty{text-align:center;border:1px dashed var(--border);border-radius:8px;padding:36px 16px;margin-top:20px}.udr-error{color:var(--error,#d95050);white-space:pre-wrap;overflow-wrap:anywhere}.udr-field-error{font-size:12px;margin:6px 0 0}.udr-notice{color:var(--success,#20a87b)}.udr-feedback{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:10px 14px;border:1px solid var(--border);border-radius:6px;margin:0 0 18px;line-height:1.6}.udr-feedback.is-error{border-color:rgba(217,80,80,.35);background:rgba(217,80,80,.08)}.udr-feedback.is-notice{border-color:rgba(32,168,123,.35);background:rgba(32,168,123,.08)}.udr-feedback-text{flex:1;min-width:0;white-space:pre-wrap;overflow-wrap:anywhere}.udr-alert-close{border:0;background:transparent;color:inherit;font:inherit;font-size:18px;line-height:1;padding:2px 4px;cursor:pointer;opacity:.75;border-radius:4px}.udr-alert-close:hover{opacity:1}.udr-log{background:var(--background-subtitle,var(--bg-body,#f7f8fa));border:1px solid var(--border);border-radius:6px;padding:14px;max-height:440px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.7 ui-monospace,SFMono-Regular,Consolas,monospace;margin:8px 0 0}.udr-log-search{flex:1;min-width:200px;max-width:340px}.udr-log-meta{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:10px 0 0}.udr-footer{position:sticky;bottom:0;background:var(--background-card,var(--bg-content,var(--bg-body,#fff)));border:1px solid var(--border);border-radius:8px;padding:14px 18px;margin-top:24px;z-index:5;box-shadow:0 -4px 16px rgba(0,0,0,.07)}.udr-footer-status{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--text-subtitle)}.udr-dirty{color:var(--primary);font-weight:500}.udr-dirty-dot{width:7px;height:7px;border-radius:50%;background:var(--primary);flex-shrink:0}.udr-confirm{width:440px!important;max-width:calc(100vw - 32px)}.udr-dialog-footer{justify-content:flex-end}.udr-connect{margin:20px 0 0;font-size:12px}.udr-list{margin:12px 0 0;padding:0;list-style:none}.udr-list li{padding:7px 0;border-bottom:1px solid var(--border);overflow-wrap:anywhere}.udr-list li:last-child{border:0}
@media(max-width:760px){.udr-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.udr-service{align-items:flex-start;padding:14px}.udr-service>.udr-actions{width:100%}.udr-grid{grid-template-columns:1fr}.udr-wide{grid-column:auto}.udr-panel,.udr-rule{padding:16px}.udr-tabs{gap:18px}.udr-rule-search,.udr-log-search{max-width:none;width:100%}.udr-footer{padding:12px 14px}.udr-footer>.udr-actions{width:100%;justify-content:flex-end}.udr-metric{padding:14px}.udr-metric strong{font-size:22px}}@media(prefers-reduced-motion:reduce){.udr-native *{scroll-behavior:auto;transition:none!important}}
`;
    return {
        name: 'udp-discovery-relay',
        data: function () { return {settings: {}, revision: '', original: '', interfaces: [], loaded: false, status: {}, statusLoaded: false, statusPending: false, busy: false, error: '', notice: '', active: 'dashboard', logText: '', logAuto: true, logPending: false, errorsOnly: false, ruleSearch: '', logSearch: '', timer: null, disposed: false, confirmVisible: false, confirmMessage: '', confirmResolve: null, unloadHandler: null, draft: null, editIndex: -1, draftOriginal: '', draftSubmitted: false, logGeneration: 0}; },
        computed: {
            dirty: function () { return this.loaded && JSON.stringify(this.settings) !== this.original; },
            editorDirty: function () { return !!this.draft && JSON.stringify(this.draft) !== this.draftOriginal; },
            hasChanges: function () { return this.dirty || this.editorDirty; },
            draftErrors: function () { return this.draft && this.draftSubmitted ? this.validateRule(this.draft) : {}; },
            visibleRules: function () {
                var rules = Array.isArray(this.settings.rules) ? this.settings.rules : [];
                var query = this.ruleSearch.trim().toLowerCase(), self = this;
                return rules.map(function (rule, index) { return {rule: rule, index: index}; }).filter(function (item) {
                    if (self.draft && self.editIndex === item.index) return true;
                    if (!query) return true;
                    var r = item.rule;
                    var hay = [r.name, r.port, r.multicast].concat(r.network || [], r.input || [], r.output || []).join(' ').toLowerCase();
                    return hay.indexOf(query) !== -1;
                });
            },
            visibleLogs: function () {
                var text = this.logText || '';
                if (!text) return '';
                var query = this.logSearch.trim().toLowerCase();
                if (!this.errorsOnly && !query) return text;
                return text.split('\n').filter(function (l) {
                    if (this.errorsOnly && !/error|failed|rejected/i.test(l)) return false;
                    if (query && l.toLowerCase().indexOf(query) === -1) return false;
                    return true;
                }, this).join('\n');
            }
        },
        created: function () { this.fetchConfig(); this.refreshStatus(); },
        mounted: function () {
            var self = this;
            this.unloadHandler = function (e) { if (self.hasChanges) { e.preventDefault(); e.returnValue = ''; } };
            window.addEventListener('beforeunload', this.unloadHandler);
            this.timer = setInterval(function () { if (document.hidden || self.busy) return; self.refreshStatus(); if (self.active === 'logs' && self.logAuto) self.loadLogs(); }, 5000);
        },
        beforeDestroy: function () { this.disposed = true; clearInterval(this.timer); window.removeEventListener('beforeunload', this.unloadHandler); this.confirmAnswer(false); },
        beforeRouteLeave: function (to, from, next) { if (!this.hasChanges) next(true); else this.ask(this.t('discard')).then(next); },
        methods: {
            t: function (key) { var lang = (this.$store && this.$store.getters.lang) || (this.$i18n && this.$i18n.locale) || 'en'; return words[key] ? words[key][/^zh/.test(lang) ? 0 : 1] : key; },
            rpc: async function (method, args) { var r = await window.$rpcRequest('call', ['sid', 'udp-discovery-relay', method, args || {}], {timeout: 30000, isCancel: false}); if (!r || r.err_code) throw new Error(r && r.err_msg || this.t('error')); return r; },
            run: async function (fn) { if (this.busy || this.disposed) return; this.busy = true; this.error = ''; this.notice = ''; try { await fn(); } catch (e) { if (!this.disposed) this.error = e.message || String(e); } finally { this.busy = false; } },
            loadConfig: async function () { var d = await this.rpc('get_config'); if (this.disposed) return; if (!Array.isArray(d.settings.rules)) d.settings.rules = []; d.settings.rules.forEach(function (r) { ['network','input','output'].forEach(function (k) { if (!Array.isArray(r[k])) r[k] = []; }); }); this.settings = d.settings; this.revision = d.revision; this.interfaces = Array.isArray(d.interfaces) ? d.interfaces : []; this.original = JSON.stringify(this.settings); this.loaded = true; this.closeEditor(); },
            fetchConfig: function () { var self = this; return this.run(function () { return self.loadConfig(); }); },
            refreshStatus: async function () { if (this.statusPending || this.disposed) return; this.statusPending = true; try { var d = await this.rpc('get_status'); if (!this.disposed) { this.status = d; this.statusLoaded = true; } } catch (e) { this.statusLoaded = false; this.status = {}; this.error = e.message || String(e); } finally { this.statusPending = false; } },
            refresh: async function () { if (this.hasChanges && !await this.ask(this.t('discard'))) return; await this.fetchConfig(); await this.refreshStatus(); },
            save: function (apply) { if (this.draft) return; var self = this; return this.run(async function () { var r = await self.rpc('set_config', {settings: self.settings, revision: self.revision, apply: apply}); self.revision = r.revision; self.original = JSON.stringify(self.settings); self.notice = self.t(apply && r.applied ? 'applied' : 'saved'); if (r.warning) self.error = r.warning; await self.refreshStatus(); }); },
            reset: async function () { if (!await this.ask(this.t('resetConfirm'))) return; var self = this; return this.run(async function () { await self.rpc('reset', {revision: self.revision}); await self.loadConfig(); self.notice = self.t('saved'); }); },
            action: async function (action) { if (this.busy) return; if ((action === 'start' || action === 'restart') && this.hasChanges && !await this.ask(this.t('restartConfirm'))) return; var self = this; return this.run(async function () { await self.rpc('service', {action: action}); self.notice = self.t('requested'); await self.refreshStatus(); }); },
            selectTab: function (key) { this.active = key; if (key === 'logs') this.loadLogs(); },
            tabKey: function (event, index) { var keys = ['dashboard','rules','logs'], next; if (event.key === 'ArrowRight') next = (index + 1) % 3; else if (event.key === 'ArrowLeft') next = (index + 2) % 3; else if (event.key === 'Home') next = 0; else if (event.key === 'End') next = 2; else return; event.preventDefault(); this.selectTab(keys[next]); event.currentTarget.parentNode.querySelectorAll('[role="tab"]')[next].focus(); },
            tabDirty: function (key) {
                if (key === 'rules' && this.draft) return true;
                if (!this.loaded || !this.dirty) return false;
                try {
                    var orig = JSON.parse(this.original);
                    if (key === 'rules') return JSON.stringify(this.settings.rules || []) !== JSON.stringify(orig.rules || []);
                    if (key === 'dashboard') return ['enabled','log_level','max_packet_size','loop_protection'].some(function (k) { return this.settings[k] !== orig[k]; }, this);
                    return false;
                } catch (e) { return false; }
            },
            closeEditor: function () { this.draft = null; this.editIndex = -1; this.draftOriginal = ''; this.draftSubmitted = false; },
            cancelEdit: async function () { if (this.busy || this.editorDirty && !await this.ask(this.t('discard'))) return false; this.closeEditor(); return true; },
            edit: async function (index) { if (this.busy || this.draft && !await this.cancelEdit()) return; this.editIndex = index; this.draft = JSON.parse(JSON.stringify(this.settings.rules[index])); this.draftOriginal = JSON.stringify(this.draft); this.draftSubmitted = false; this.focusEditor(); },
            duplicate: async function (index) {
                var rules = this.settings.rules || [];
                if (this.busy || rules.length >= 32 || (this.draft && !await this.cancelEdit())) return;
                var copy = JSON.parse(JSON.stringify(rules[index]));
                copy.id = 'r' + Date.now().toString(36) + rules.length;
                var suffix = this.t('copySuffix');
                var base = String(copy.name || '').slice(0, Math.max(0, 80 - suffix.length));
                copy.name = (base + suffix).slice(0, 80);
                this.editIndex = -1; this.draft = copy; this.draftOriginal = ''; this.draftSubmitted = false; this.active = 'rules'; this.focusEditor();
            },
            focusEditor: function () { var self = this; if (this.$nextTick) this.$nextTick(function () { var editor = self.$refs && self.$refs.editor; if (editor) { if (editor.scrollIntoView) editor.scrollIntoView({block:'nearest'}); if (editor.focus) editor.focus(); } }); },
            add: async function (local) { if (this.busy || this.settings.rules.length >= 32 || this.draft && !await this.cancelEdit()) return; this.editIndex = -1; this.draft = {id: 'r' + Date.now().toString(36) + this.settings.rules.length, name: local ? 'LocalSend' : 'UDP', enabled: true, protocol: 'udp', port: local ? 53317 : 12345, multicast: local ? '224.0.0.167' : '255.255.255.255', direction: 'bidirectional', log_level: 'info', network: [], input: [], output: []}; this.draftOriginal = ''; this.draftSubmitted = false; this.active = 'rules'; this.focusEditor(); },
            validateRule: function (r) {
                var errors = {}, self = this, parts = String(r.multicast).split('.'), validIP = parts.length === 4 && parts.every(function (n) { return /^(0|[1-9][0-9]{0,2})$/.test(n) && Number(n) <= 255; });
                if (!r.name || !r.name.trim() || r.name.length > 80 || /[\x00-\x1f\x7f]/.test(r.name)) errors.name = this.t('nameError');
                if (!Number.isInteger(r.port) || r.port < 1 || r.port > 65535) errors.port = this.t('portError');
                else if ([53,67,68,1900,5353].indexOf(r.port) !== -1) errors.port = this.t('protectedPort');
                if (!validIP || !(Number(parts[0]) >= 224 && Number(parts[0]) <= 239 || r.multicast === '255.255.255.255') || r.multicast === '224.0.0.251') errors.multicast = this.t('addressError');
                if (r.direction === 'bidirectional') { if (r.network.length < 2 || r.network.length > 16) errors.network = this.t('networkError'); }
                else { if (!r.input.length) errors.input = this.t('inputError'); if (!r.output.length || r.output.some(function (n) { return r.input.indexOf(n) !== -1; })) errors.output = this.t('outputError'); }
                if (r.enabled && this.settings.rules.some(function (other, i) { return i !== self.editIndex && other.enabled && other.port === r.port && other.multicast === r.multicast; })) errors.multicast = this.t('duplicateError');
                return errors;
            },
            finishEdit: function () { if (this.busy || !this.draft) return; this.draftSubmitted = true; var keys = Object.keys(this.validateRule(this.draft)); if (keys.length) { var self = this; if (this.$nextTick) this.$nextTick(function () { var control = self.$refs && self.$refs['field-' + keys[0]]; if (control) { if (control.$el && control.$el.scrollIntoView) control.$el.scrollIntoView({block:'center'}); if (control.focus) control.focus(); } }); return; } var rule = JSON.parse(JSON.stringify(this.draft)); if (rule.direction === 'oneway') rule.network = []; else { rule.input = []; rule.output = []; } if (this.editIndex < 0) this.settings.rules.push(rule); else this.settings.rules.splice(this.editIndex, 1, rule); this.closeEditor(); this.notice = ''; },
            discardChanges: async function () { if (this.busy || !await this.ask(this.t('discard'))) return; this.settings = JSON.parse(this.original); this.closeEditor(); this.error = ''; this.notice = ''; },
            remove: async function (index) { if (this.busy || this.draft) return; if (await this.ask(this.t('removeConfirm'))) this.settings.rules.splice(index, 1); },
            clearLogs: function () { this.logGeneration++; this.logAuto = false; this.logText = ''; },
            scrollLogs: function () { var el = this.$refs && this.$refs.logOutput; if (el) el.scrollTop = el.scrollHeight; },
            loadLogs: async function () { if (this.logPending || this.disposed) return; this.logPending = true; var generation = this.logGeneration; try { var r = await this.rpc('get_logs'); if (!this.disposed && generation === this.logGeneration) this.logText = r.text; } catch (e) { if (!this.disposed) this.error = e.message || String(e); } finally { this.logPending = false; } },
            metric: function (key, value) { if (value === undefined || value === null) return '—'; if (key === 'rss_bytes') return value < 1024 ? value + ' B' : value < 1048576 ? (value / 1024).toFixed(1) + ' KiB' : (value / 1048576).toFixed(1) + ' MiB'; if (key === 'uptime_seconds') { var n = Math.floor(value); return n >= 86400 ? Math.floor(n / 86400) + 'd ' + Math.floor(n % 86400 / 3600) + 'h' : n >= 3600 ? Math.floor(n / 3600) + 'h ' + Math.floor(n % 3600 / 60) + 'm' : n >= 60 ? Math.floor(n / 60) + 'm ' + n % 60 + 's' : n + 's'; } return String(value); },
            exportLogs: function () { var url = URL.createObjectURL(new Blob([this.visibleLogs], {type:'text/plain;charset=utf-8'})); var a = document.createElement('a'); a.href = url; a.download = 'udp-discovery-relay.log'; a.click(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000); },
            ask: function (message) { if (this.confirmResolve) this.confirmResolve(false); this.confirmMessage = message; this.confirmVisible = true; var self = this; return new Promise(function (resolve) { self.confirmResolve = resolve; }); },
            confirmAnswer: function (answer) { var resolve = this.confirmResolve; this.confirmResolve = null; this.confirmVisible = false; if (resolve) resolve(answer); }
        },
        render: function (h) {
            var self = this;
            function t(k) { return self.t(k); }
            function button(k, action, primary, disabled) { return h('gl-button', {attrs:{type:primary ? 'primary' : 'default',disabled:self.busy || !!disabled},on:{click:action}}, [t(k)]); }
            function toggle(value, label, change, disabled) { return h('gl-switch',{attrs:{value:!!value,disabled:self.busy || !!disabled,'aria-label':label},on:{input:change}}); }
            function alertBanner(kind, text, dismiss) {
                return h('div',{class:['udr-feedback',kind === 'error' ? 'udr-error is-error' : 'udr-notice is-notice'],attrs:{role:kind === 'error' ? 'alert' : 'status'}},[
                    h('span',{class:'udr-feedback-text'},[text]),
                    h('button',{class:'udr-alert-close',attrs:{type:'button','aria-label':t('dismiss')},on:{click:dismiss}},['×'])
                ]);
            }
            function field(obj, k, kind, options, errors) {
                var error = errors && errors[k], id = 'udr-field-' + k;
                var attrs = {id:id,value:obj[k],disabled:self.busy,'aria-label':t(k),'aria-invalid':error ? 'true' : 'false','aria-describedby':error ? id + '-error' : undefined}, control;
                function change(v) { self.$set(obj,k,kind === 'number' ? (v === '' ? null : Number(v)) : v); self.notice = ''; }
                if (kind === 'bool') control = h('gl-switch',{attrs:attrs,on:{input:change}});
                else if (kind === 'select' || kind === 'networks') {
                    attrs.multiple = kind === 'networks'; attrs['popper-class'] = 'main-select';
                    // Keep configured networks visible even when they are temporarily unavailable.
                    if (kind === 'networks') options = options.concat(obj[k].filter(function (n) { return options.indexOf(n) === -1; }));
                    control = h('el-select',{ref:'field-'+k,attrs:attrs,on:{input:change}},options.map(function (v) { return h('el-option',{key:v,attrs:{value:v,label:kind === 'networks' ? v : t(v)}}); }));
                } else {
                    attrs.type = kind === 'number' ? 'number' : 'text'; attrs.maxlength = k === 'name' ? 80 : 32;
                    if (kind === 'number') { attrs.min = k === 'port' ? 1 : 64; attrs.max = k === 'port' ? 65535 : 65507; attrs.step = 1; }
                    control = h('el-input',{ref:'field-'+k,attrs:attrs,on:{input:change}});
                }
                return h('div',{class:['udr-field',error ? 'is-invalid' : '']},[h('label',{attrs:{for:id}},[t(k)]),control,error ? h('p',{class:'udr-error udr-field-error',attrs:{id:id+'-error',role:'alert'}},[error]) : null]);
            }
            function panel(title, content) { return h('section',{class:'udr-panel'},[h('h3',{class:'udr-panel-head'},[t(title)])].concat(content)); }
            function networkPath(rule) {
                function chips(list) { return list.length ? list.map(function (n) { return h('span',{class:'udr-network'},[n]); }) : [h('span',{class:'udr-muted'},[t('noNetworks')])]; }
                return h('div',{class:'udr-path'},rule.direction === 'oneway' ? chips(rule.input).concat([h('span',{attrs:{'aria-label':t('oneway')}},['→'])],chips(rule.output)) : [h('span',{class:'udr-muted'},[t('bidirectional')])].concat(chips(rule.network)));
            }
            function ruleEditor() {
                var r = self.draft, errors = self.draftErrors;
                return h('section',{class:'udr-panel udr-editor',ref:'editor',attrs:{tabindex:-1,'aria-label':t(self.editIndex < 0 ? 'newRule' : 'editRule')},on:{keydown:function (e) { if (e.key === 'Escape') self.cancelEdit(); }}},[
                    h('h3',[t(self.editIndex < 0 ? 'newRule' : 'editRule')]),h('p',{class:'udr-muted udr-help'},[t('editorHint')]),
                    h('div',{class:'udr-grid',style:{marginTop:'20px'}},[
                        field(r,'name','text',null,errors),h('div',{class:'udr-field'},[h('label',[t('ruleEnabled')]),toggle(r.enabled,t('ruleEnabled'),function (v) { r.enabled = v; })]),
                        field(r,'port','number',null,errors),field(r,'multicast','text',null,errors),
                        field(r,'direction','select',['bidirectional','oneway']),
                        r.direction === 'bidirectional' ? field(r,'network','networks',self.interfaces,errors) : null,
                        r.direction === 'oneway' ? field(r,'input','networks',self.interfaces,errors) : null,
                        r.direction === 'oneway' ? field(r,'output','networks',self.interfaces,errors) : null
                    ]),
                    !self.interfaces.length ? h('p',{class:'udr-muted'},[t('noInterfaces')]) : null,
                    h('p',{class:'udr-muted udr-help'},[t('hint')]),
                    h('details',{class:'udr-advanced'},[h('summary',[t('advanced')]),h('div',{class:'udr-grid'},[field(r,'log_level','select',['off','error','warn','info','debug'])])]),
                    h('div',{class:'udr-actions udr-rule-tools udr-between'},[h('span',{class:'udr-badge'},['UDP']),h('div',{class:'udr-actions'},[button('cancel',self.cancelEdit),button('done',self.finishEdit,true)])])
                ]);
            }
            var body = [];
            if (!this.loaded) body.push(h('p',[t('loading')]),button('refresh',this.refresh));
            else if (this.active === 'dashboard') {
                var m = this.statusLoaded && this.status.metrics_available && this.status.metrics;
                body.push(h('div',{class:'udr-metrics'},['received','forwarded','active_rules','uptime_seconds','dropped','loop_filtered','rss_bytes','version'].map(function (k,i) {
                    var value = m && m[k] !== undefined ? m[k] : k === 'version' && self.statusLoaded && self.status.version ? self.status.version : undefined;
                    var isWarn = k === 'dropped' && Number(value) > 0;
                    return h('div',{class:['udr-metric',i >= 4 ? 'secondary' : '',isWarn ? 'is-warn' : ''],key:k},[h('span',{class:'udr-muted'},[t(k)]),h('strong',[self.metric(k,value)])]);
                })));
                if (!m && this.status.running) body.push(h('p',{class:'udr-muted'},[t('statsPending')]));
                body.push(h('div',{class:'udr-grid'},[
                    panel('interfaces',[m && Array.isArray(m.interfaces) && m.interfaces.length ? h('ul',{class:'udr-list'},m.interfaces.map(function (line) { return h('li',[line]); })) : h('p',{class:'udr-muted'},[t('empty')])]),
                    panel('recent_errors',[m && Array.isArray(m.recent_errors) && m.recent_errors.length ? h('ul',{class:'udr-list udr-error'},m.recent_errors.map(function (line) { return h('li',[line]); })) : h('p',{class:'udr-muted'},[t('noErrors')])])
                ]));
                body.push(panel('settingsTitle',[
                    h('div',{class:'udr-inline'},[toggle(this.settings.enabled,t('enabled'),function (v) { self.settings.enabled = v; }),h('span',[t('enabled')])]),
                    h('p',{class:'udr-muted udr-help'},[t('globalHint')]),
                    h('details',{class:'udr-advanced'},[h('summary',[t('advanced')]),h('div',{class:'udr-grid'},[field(this.settings,'log_level','select',['off','error','warn','info','debug']),field(this.settings,'max_packet_size','number'),field(this.settings,'loop_protection','bool')]),h('div',{class:'udr-actions',style:{marginTop:'20px'}},[button('reloadConfig',this.refresh),button('reset',this.reset,false,!!this.draft)])])
                ]));
            } else if (this.active === 'rules') {
                body.push(h('div',{class:'udr-actions udr-between'},[h('span',{class:'udr-muted'},[this.settings.rules.length + ' / 32 ' + t('rulesCount')]),h('div',{class:'udr-actions'},[button('addLocal',function () { self.add(true); },true,this.settings.rules.length >= 32),button('addCustom',function () { self.add(false); },false,this.settings.rules.length >= 32)])]));
                if (this.settings.rules.length >= 4) body.push(h('div',{class:'udr-rule-search'},[h('el-input',{attrs:{value:this.ruleSearch,disabled:this.busy,clearable:true,placeholder:t('ruleSearch'),'aria-label':t('ruleSearch')},on:{input:function (v) { self.ruleSearch = v; }}})]));
                if (this.settings.rules.length >= 32) body.push(h('p',{class:'udr-muted'},[t('rulesLimit')]));
                if (this.draft && this.editIndex < 0) body.push(ruleEditor());
                if (!this.settings.rules.length && !this.draft) body.push(h('div',{class:'udr-empty'},[h('h3',[t('noRules')]),h('p',{class:'udr-muted'},[t('noRulesHint')])]));
                else if (this.settings.rules.length && !this.visibleRules.length && !this.draft) body.push(h('div',{class:'udr-empty'},[h('p',{class:'udr-muted'},[t('ruleFilterEmpty')])]));
                this.visibleRules.forEach(function (item) {
                    var r = item.rule, i = item.index;
                    if (self.draft && self.editIndex === i) { body.push(ruleEditor()); return; }
                    body.push(h('section',{class:['udr-rule',!r.enabled ? 'is-disabled' : ''],key:r.id},[
                        h('div',{class:'udr-rule-heading'},[h('h3',[r.name || r.id]),h('span',{class:['udr-badge',r.enabled ? 'is-enabled' : 'is-disabled']},[t(r.enabled ? 'enabledRule' : 'disabledRule')])]),
                        h('p',{class:'udr-rule-meta udr-muted'},['UDP ' + r.port + ' · ' + r.multicast]),networkPath(r),
                        h('div',{class:'udr-actions udr-rule-tools udr-between'},[h('div',{class:'udr-inline'},[toggle(r.enabled,r.name + ' · ' + t('ruleEnabled'),function (v) { r.enabled = v; },!!self.draft),h('span',{class:'udr-muted'},[t('ruleEnabled')])]),h('div',{class:'udr-actions'},[button('duplicate',function () { self.duplicate(i); },false,self.settings.rules.length >= 32 || !!self.draft),button('edit',function () { self.edit(i); }),button('remove',function () { self.remove(i); },false,!!self.draft)])])
                    ]));
                });
                body.push(h('p',{class:'udr-muted udr-connect'},[t('connectionHint')]));
            } else {
                var logLines = this.visibleLogs ? this.visibleLogs.split('\n').length : 0;
                body.push(h('div',{class:'udr-actions udr-between'},[
                    h('div',{class:'udr-actions',style:{flex:'1',minWidth:'0'}},[
                        h('div',{class:'udr-log-search'},[h('el-input',{attrs:{value:this.logSearch,disabled:this.busy,clearable:true,placeholder:t('logSearch'),'aria-label':t('logSearch')},on:{input:function (v) { self.logSearch = v; }}})]),
                        h('label',{class:'udr-inline'},[toggle(this.logAuto,t('auto'),function (v) { self.logAuto = v; if (v) self.loadLogs(); }),t('auto')]),
                        h('label',{class:'udr-inline'},[toggle(this.errorsOnly,t('errorsOnly'),function (v) { self.errorsOnly = v; }),t('errorsOnly')])
                    ]),
                    h('div',{class:'udr-actions'},[button('refresh',this.loadLogs,false,this.logPending),button('scrollBottom',this.scrollLogs,false,!this.visibleLogs),button('export',this.exportLogs,false,!this.visibleLogs),button('clear',this.clearLogs,false,!this.logText && !this.logPending)])
                ]),h('div',{class:'udr-log-meta'},[h('p',{class:'udr-muted udr-help',style:{margin:0}},[t('logHint')]),h('span',{class:'udr-badge'},[logLines + ' ' + t('linesUnit')])]),h('pre',{ref:'logOutput',class:'udr-log',attrs:{role:'log','aria-label':t('logs'),'aria-busy':String(this.logPending)}},[this.visibleLogs || t(this.logPending ? 'loading' : (this.errorsOnly || this.logSearch.trim()) && this.logText ? 'filterEmpty' : 'logEmpty')]));
            }
            var running = this.statusLoaded && this.status.running;
            var stoppedWarn = this.loaded && this.settings.enabled && this.statusLoaded && !running;
            return h('div',{class:'udr-native'},[
                h('style',[css]),h('gl-title',{attrs:{title:'UDP Discovery Relay'}}),
                h('el-dialog',{attrs:{visible:this.confirmVisible,title:t('confirmTitle'),'custom-class':'udr-confirm','append-to-body':true,'close-on-click-modal':false},on:{close:function () { self.confirmAnswer(false); }}},[h('p',[this.confirmMessage]),h('div',{slot:'footer',class:'udr-actions udr-dialog-footer'},[button('cancel',function () { self.confirmAnswer(false); }),button('confirm',function () { self.confirmAnswer(true); },true)])]),
                h('gl-card',[
                    h('p',{class:'udr-muted udr-description'},[t('description')]),
                    h('div',{class:'udr-service'},[
                        h('div',[
                            h('strong',{class:'udr-status',attrs:{role:'status','aria-live':'polite'}},[h('span',{class:['udr-dot',running ? 'running' : stoppedWarn ? 'warn' : ''],attrs:{'aria-hidden':'true'}}),t(!this.statusLoaded ? 'unknown' : running ? 'running' : 'stopped')]),
                            h('div',{class:'udr-versions'},['Core ' + (this.statusLoaded && (this.status.version || this.status.metrics_available && this.status.metrics && this.status.metrics.version) || '—') + ' · UI ' + uiVersion])
                        ]),h('div',{class:'udr-actions'},[
                            h('label',{class:'udr-boot'},[t('boot'),h('gl-switch',{attrs:{value:!!this.status.enabled,size:'small',disabled:this.busy || !this.statusLoaded || this.statusPending,'aria-label':t('boot')},on:{input:function (v) { self.action(v ? 'enable' : 'disable'); }}})]),
                            button('start',function () { self.action('start'); },false,!this.statusLoaded || running),
                            button('stop',function () { self.action('stop'); },false,!this.statusLoaded || !running),
                            button('restart',function () { self.action('restart'); },false,!this.statusLoaded || !running),
                            button('refresh',this.refreshStatus,false,this.statusPending)
                        ])
                    ]),
                    h('div',{class:'udr-tabs',attrs:{role:'tablist','aria-label':'UDP Discovery Relay'}},['dashboard','rules','logs'].map(function (k,i) { return h('button',{class:['udr-tab',self.active === k ? 'active' : ''],attrs:{id:'udr-tab-'+k,type:'button',role:'tab','aria-selected':String(self.active === k),'aria-controls':'udr-panel',tabindex:self.active === k ? 0 : -1},on:{click:function () { self.selectTab(k); },keydown:function (e) { self.tabKey(e,i); }}},[t(k),k === 'rules' && self.loaded ? h('span',{class:'udr-count'},[String(self.settings.rules.length)]) : null,self.tabDirty(k) ? h('span',{class:'udr-tab-dot',attrs:{'aria-hidden':'true'}}) : null]); })),
                    this.error ? alertBanner('error',this.error,function () { self.error = ''; }) : null,
                    this.notice ? alertBanner('notice',this.notice,function () { self.notice = ''; }) : null,
                    h('div',{attrs:{id:'udr-panel',role:'tabpanel','aria-labelledby':'udr-tab-'+this.active,'aria-busy':String(this.busy)}},body)
                ]),
                this.loaded ? h('div',{class:'udr-footer udr-actions udr-between'},[
                    h('span',{class:['udr-footer-status',this.hasChanges ? 'udr-dirty' : ''],attrs:{role:'status'}},[this.hasChanges ? h('span',{class:'udr-dirty-dot',attrs:{'aria-hidden':'true'}}) : null,t(this.busy ? 'saving' : this.draft ? 'finishFirst' : this.dirty ? 'unsaved' : 'synced')]),
                    h('div',{class:'udr-actions'},[button('discardEdits',this.discardChanges,false,!this.hasChanges),button('save',function () { self.save(false); },false,!this.dirty || !!this.draft),button('apply',function () { self.save(true); },true,!!this.draft)])
                ]) : null
            ]);
        }
    };
})();

const {test} = require('node:test');
const assert = require('node:assert/strict');
const view = require('../files/www/views/gl-sdk4-ui-udp-discovery-relay.common.js');
function instance() {
  const v = view.data();
  Object.entries(view.methods).forEach(([k, fn]) => v[k] = fn.bind(v));
  v.$store = {getters:{lang:'en'}}; v.$set = (obj,k,val) => { obj[k]=val; };
  Object.entries(view.computed).forEach(([k,get]) => Object.defineProperty(v,k,{get:()=>get.call(v)}));
  return v;
}
function h(tag, data, children) { if(Array.isArray(data)) {children=data;data={};} return {tag,data:data||{},children:children||[]}; }
function flatten(node) { return [node].concat(node && node.children ? node.children.flatMap(flatten) : []); }
test('loads real settings, edits rules, saves revision and applies via fixed RPC',async()=>{
  const v=instance(), calls=[];
  v.rpc=async(method,args)=>{calls.push({method,args}); if(method==='get_config') return {settings:{enabled:true,log_level:'info',loop_protection:true,max_packet_size:1400,rules:[]},interfaces:['wan','lan'],revision:'a'.repeat(32)}; if(method==='set_config') return {revision:'b'.repeat(32),applied:true}; return {running:true,enabled:true};};
  await v.loadConfig();assert.equal(v.dirty,false);await v.add(true);assert.equal(v.draft.port,53317);assert.deepEqual(v.draft.network,[]);assert.equal(v.settings.rules.length,0);
  v.draft.network=['wan','lan'];v.finishEdit();assert.equal(v.dirty,true);await v.save(true);assert.equal(v.dirty,false);assert.equal(v.revision,'b'.repeat(32));assert(calls.some(c=>c.method==='set_config'&&c.args.apply));
  const nodes=flatten(view.render.call(v,h));assert(nodes.some(n=>n&&n.tag==='gl-card'));assert(!nodes.some(n=>n&&n.tag==='iframe'));
});
test('RPC rejection preserves unsaved edits and exposes actual error',async()=>{
 const v=instance();v.loaded=true;v.settings={rules:[]};v.original='{}';v.rpc=async()=>{throw new Error('Invalid multicast')};await v.save(false);assert.equal(v.error,'Invalid multicast');assert(v.dirty);
});
test('metrics are absent until reported by daemon, status failures remove stale data',async()=>{
 const v=instance();v.loaded=true;v.settings={rules:[]};const tree=flatten(view.render.call(v,h));assert(tree.filter(n=>n==='—').length>=8);v.status={running:true,metrics:{received:123}};v.rpc=async()=>{throw new Error('procd unavailable')};await v.refreshStatus();assert.equal(v.statusLoaded,false);assert.deepEqual(v.status,{});
});
test('logs filter actual records, failed operations release busy flag, languages render',async()=>{
 const v=instance();v.logText='ready\nerror: broken\nreload rejected\n';v.errorsOnly=true;assert.equal(v.visibleLogs,'error: broken\nreload rejected');
 v.$store.getters.lang='zh-cn';assert.equal(v.t('save'),'保存');v.$store.getters.lang='en';assert.equal(v.t('save'),'Save');v.rpc=async()=>{throw new Error('permission denied')};await v.action('start');assert.equal(v.busy,false);assert.equal(v.error,'permission denied');
});
test('route leave and delete require confirmation, cancellation keeps rules',async()=>{
 const v=instance();v.settings={rules:[{id:'one'}]};v.ask=async()=>false;await v.remove(0);assert.equal(v.settings.rules.length,1);v.ask=async()=>true;await v.remove(0);assert.equal(v.settings.rules.length,0);
});
test('authenticated SDK4 call uses sid and fixed module',async()=>{
 const v=instance();let call;global.window={$rpcRequest:async(...args)=>{call=args;return {success:true}}};await v.rpc('service',{action:'stop'});assert.deepEqual(call[1],['sid','udp-discovery-relay','service',{action:'stop'}]);delete global.window;
});

function configured() {
 const v=instance();v.loaded=true;v.interfaces=['wan','lan','guest'];v.settings={enabled:true,log_level:'info',loop_protection:true,max_packet_size:1400,rules:[{id:'local',name:'LocalSend',enabled:true,protocol:'udp',port:53317,multicast:'224.0.0.167',direction:'bidirectional',network:['wan','lan'],input:[],output:[],log_level:'info'}]};v.original=JSON.stringify(v.settings);return v;
}
test('editing uses an isolated draft, cancellation keeps configuration and direction switches retain selections',async()=>{
 const v=configured();await v.edit(0);v.draft.name='Changed';v.draft.network.push('guest');assert.equal(v.settings.rules[0].name,'LocalSend');assert.equal(v.dirty,false);assert.equal(v.hasChanges,true);
 v.ask=async()=>false;assert.equal(await v.cancelEdit(),false);assert(v.draft);v.ask=async()=>true;assert.equal(await v.cancelEdit(),true);assert.equal(v.hasChanges,false);assert.deepEqual(v.settings.rules[0].network,['wan','lan']);
 await v.edit(0);v.draft.direction='oneway';v.draft.input=['wan'];v.draft.output=['guest'];v.draft.direction='bidirectional';assert.deepEqual(v.draft.network,['wan','lan']);v.finishEdit();assert.deepEqual(v.settings.rules[0].input,[]);
});
test('invalid edits remain visible, valid one-way edits replace only their rule, save waits for editor completion',async()=>{
 const v=configured();let calls=0;v.rpc=async()=>{calls++;return {}};await v.edit(0);v.draft.port=5353;v.draft.direction='oneway';v.draft.input=['wan'];v.draft.output=['wan'];v.finishEdit();assert(v.draftErrors.port);assert(v.draftErrors.output);assert.equal(v.settings.rules[0].port,53317);await v.save(true);assert.equal(calls,0);
 v.draft.port=53318;v.draft.output=['lan'];v.finishEdit();assert.equal(v.draft,null);assert.equal(v.settings.rules.length,1);assert.equal(v.settings.rules[0].port,53318);assert.deepEqual(v.settings.rules[0].network,[]);assert(v.dirty);
});
test('new duplicate rule is rejected and discarding restores both global settings and rule drafts',async()=>{
 const v=configured();await v.add(true);v.draft.network=['wan','lan'];v.finishEdit();assert(v.draftErrors.multicast);assert.equal(v.settings.rules.length,1);
 v.settings.enabled=false;v.ask=async()=>true;await v.discardChanges();assert.equal(v.settings.enabled,true);assert.equal(v.draft,null);assert.equal(v.hasChanges,false);
});
test('route leave includes unsaved new rules and respects cancellation',async()=>{
 const v=configured();await v.add(false);let next;v.ask=async()=>false;await view.beforeRouteLeave.call(v,{}, {},value=>next=value);await Promise.resolve();assert.equal(next,false);
});
test('clearing logs pauses auto refresh and ignores a request already in flight',async()=>{
 const v=instance();let resolve;v.rpc=()=>new Promise(r=>resolve=r);const pending=v.loadLogs();assert(v.logPending);v.clearLogs();resolve({text:'late log'});await pending;assert.equal(v.logText,'');assert.equal(v.logAuto,false);assert.equal(v.logPending,false);
});
test('metrics use readable units without converting missing data or zero to fake values',()=>{
 const v=instance();assert.equal(v.metric('rss_bytes',1048576),'1.0 MiB');assert.equal(v.metric('uptime_seconds',3661),'1h 1m');assert.equal(v.metric('received',0),'0');assert.equal(v.metric('received',undefined),'—');
});
test('tabs support arrow keys and configured unavailable networks remain selectable',async()=>{
 const v=configured();const tabs=[0,1,2].map(()=>({focus(){this.focused=true}}));v.tabKey({key:'ArrowRight',preventDefault(){},currentTarget:{parentNode:{querySelectorAll(){return tabs}}}},0);assert.equal(v.active,'rules');assert(tabs[1].focused);
 v.interfaces=['wan'];await v.edit(0);const nodes=flatten(view.render.call(v,h));assert(nodes.some(n=>n&&n.tag==='el-option'&&n.data.attrs.value==='lan'));assert(nodes.some(n=>n&&n.data&&n.data.attrs&&n.data.attrs['aria-invalid']==='false'));
});
test('duplicate clones rule into isolated draft with distinct id',async()=>{
 const v=configured();await v.duplicate(0);assert.equal(v.editIndex,-1);assert(v.draft);assert.notEqual(v.draft.id,v.settings.rules[0].id);assert.equal(v.draft.port,53317);assert.match(v.draft.name,/LocalSend/);assert.equal(v.settings.rules.length,1);
});
test('ruleSearch preserves original rule indices and logSearch combines with errorsOnly',()=>{
 const v=configured();
 v.settings.rules.push({id:'custom',name:'Sonos',enabled:false,protocol:'udp',port:1901,multicast:'239.255.255.250',direction:'bidirectional',network:['lan','guest'],input:[],output:[],log_level:'info'});
 v.ruleSearch='sonos';assert.equal(v.visibleRules.length,1);assert.equal(v.visibleRules[0].index,1);
 v.logText='info: ready\nerror: socket failed\nerror: timeout\n';v.logSearch='timeout';assert.equal(v.visibleLogs,'error: timeout');
 v.errorsOnly=true;v.logSearch='socket';assert.equal(v.visibleLogs,'error: socket failed');
});

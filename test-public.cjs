const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/public/index.html','utf8');
const d=JSON.parse(html.match(/<script id="dataset" type="application\/json">([\s\S]*?)<\/script>/)[1]);
assert.equal(d.start,'2026-06-01');assert.equal(d.until,'2026-09-13');
assert.equal(d.nodes.length,new Set(d.nodes.map(n=>n.id)).size);
const ids=new Set(d.nodes.map(n=>n.id));
assert(d.links.every(l=>ids.has(l.source)&&ids.has(l.target)));
assert(d.days.every(day=>day>=d.start&&day<=d.until));
assert(d.nodes.every(n=>n.dates.every(day=>day>=d.start&&day<=d.until)));
assert(d.links.every(l=>l.dates.every(day=>day>=d.start&&day<=d.until)));
assert.equal(d.days.length+d.missing_dates.length,105);
assert.equal(d.stats.claude_content_pending,0,'本次要求的 Claude 文件內容仍有未讀');
assert.equal(d.stats.claude_content_read,1122);
assert.equal(d.stats.claude_history_invalid,0);
assert.equal(d.stats.notes_imported,d.stats.claude_notes+d.stats.codex_notes);
assert(!html.includes('__DATA__'));
for(const forbidden of ['/Users/','private-source','private-work','claude.ai/chat','docs.google.com/','@gmail.com','sk-ant-','ghp_','gho_','-----BEGIN'])assert(!html.includes(forbidden),'公開檔案含敏感字樣：'+forbidden);
assert.deepEqual(fs.readdirSync(__dirname+'/public').sort(),['index.html']);
assert(d.nodes.flatMap(n=>n.sources).every(s=>!s.file.includes('://')&&!s.file.includes('.md')));
assert.equal(d.model,'life-work-v3');
assert.equal(d.themes.length,7);assert.equal(d.stats.keywords,24);
assert.equal(d.sourceNodes.length,98);assert.equal(d.sourceLinks.length,173);
assert(d.sourceNodes.some(n=>n.id==='claude'));
assert(!d.nodes.some(n=>n.kind==='工具'||n.id==='claude'));
assert(d.links.every(l=>l.source!=='claude'&&l.target!=='claude'));
assert.equal(d.nodes.filter(n=>n.id.startsWith('project-')).length,53,'原有具名專案不可遺失');
const visibleSource=html.slice(html.indexOf('function visible(){'),html.indexOf('function transform(){'));
const inputs={'#month':{value:'all'},'#search':{value:''},'#depth':{value:'3'}};
const enabledThemes=new Set(d.themes.map(t=>t.theme));
const getView=(focus=null,key=null)=>new Function('D','$','focus','key','enabledThemes',visibleSource+';return visible()')(d,s=>inputs[s],focus,key,enabledThemes);
assert.equal(getView().ns.length,116,'總覽完整呈現三層');
assert.deepEqual([...new Set(d.nodes.map(n=>n.level))].sort(),[1,2,3]);
assert.equal(d.links.filter(l=>l.type==='分類').length,109);
const reached=new Set([d.nodes[0].id]);let changed=true;
while(changed){changed=false;for(const l of d.links)if(reached.has(l.source)||reached.has(l.target)){const before=reached.size;reached.add(l.source);reached.add(l.target);if(reached.size>before)changed=true}}
assert.equal(reached.size,116,'完整主圖必須連通，不可仍是七座孤島');
const bridgePairs=new Set();for(const l of d.links.filter(l=>l.type==='待確認')){
 assert(l.evidence.length);const pair=[l.source,l.target].sort().join('|');assert(!bridgePairs.has(pair));bridgePairs.add(pair);
 for(const e of l.evidence){assert(d.sourceLinks.some(s=>JSON.stringify(s)===JSON.stringify(e)),'不得捏造共現依據');assert.deepEqual([d.nodes.find(n=>n.id===e.source).keyword,d.nodes.find(n=>n.id===e.target).keyword].sort(),[l.source,l.target].sort())}
}
assert(getView('life','key-finance').ns.some(n=>n.id==='key-design'),'聚焦理財仍保留教育工具設計的共現連線');
assert(getView('learning','key-feedback').ns.some(n=>n.id==='grading'));
assert(getView('lead','key-habits').ns.some(n=>n.label==='自我領導力環島棋'));
for(const month of ['2026-06','2026-07','2026-08','2026-09-09']){inputs['#month'].value=month;assert(getView().ns.length>0)}
inputs['#month'].value='all';inputs['#search'].value='文豪';assert(getView().ns.some(n=>n.label==='文豪笑傳'));
inputs['#search'].value='Claude';assert.equal(getView().ns.length,0,'工具不可重新變成圖上節點');
inputs['#search'].value='';
inputs['#depth'].value='1';assert.equal(getView().ns.length,7);
inputs['#depth'].value='2';assert.equal(getView().ns.length,31);
inputs['#depth'].value='3';enabledThemes.delete('language');assert(getView().ns.every(n=>n.theme!=='language'));
enabledThemes.clear();assert.equal(getView().ns.length,0);
console.log(`通過：116 節點三層全貌、單一連通網路、${bridgePairs.size} 條有原始依據且不重複的共現線索、53 舊專案保留、搜尋期間及隱私。`);

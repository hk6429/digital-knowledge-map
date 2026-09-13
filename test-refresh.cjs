const fs=require('node:fs'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const parse=html=>JSON.parse(html.match(/<script id="dataset" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const d=parse(fs.readFileSync(__dirname+'/public/index.html','utf8'));
const before=parse(execFileSync('git',['show','649d6fe:public/index.html'],{cwd:__dirname,encoding:'utf8',maxBuffer:5e6}));
const oldSources=data=>data.sourceNodes.filter(n=>n.dates.some(day=>day<='2026-09-11')).map(n=>({...n,dates:n.dates.filter(day=>day<='2026-09-11'),sources:n.sources.filter(s=>s.date<='2026-09-11')}));
assert.deepEqual(oldSources(d),oldSources(before),'9/11 以前的來源不得改動');
assert.deepEqual(d.sourceLinks.filter(l=>l.dates.every(day=>day<='2026-09-11')),before.sourceLinks.filter(l=>l.dates.every(day=>day<='2026-09-11')));
assert.equal(d.dailyImports.length,new Set(d.dailyImports.map(b=>b.date)).size);
assert.equal(d.stats.notes_imported-before.stats.notes_imported,12);
assert.equal(d.stats.browser_visits-before.stats.browser_visits,88);
assert.equal(d.stats.claude_history_entries-before.stats.claude_history_entries,4);
for(const day of ['2026-09-12','2026-09-13']){
 const b=d.dailyImports.find(x=>x.date===day),old=before.dailyImports.find(x=>x.date===day);
 assert.equal(b.activity_refreshed,false);
 assert.equal(b.activity_cutoff,old.cutoff);
 assert.equal(b.computer_events,old.computer_events);
 assert.equal(b.activity_last,old.activity_last);
 assert(b.method.includes('沿用前次快照'));
}
for(const n of d.sourceNodes)assert.equal(n.sources.length,new Set(n.sources.map(s=>s.date+'|'+s.kind)).size);
assert.deepEqual(d.nodes.find(n=>n.id==='memory-learning').dates,['2026-09-12']);
assert.equal(d.nodes.find(n=>n.id==='memory-learning').keyword,'key-selflearn');
assert(d.nodes.find(n=>n.originalLabel==='字字珠璣').dates.includes('2026-09-13'));
assert(!d.sourceNodes.find(n=>n.id==='leisure-video').sources.some(s=>s.date==='2026-09-13'&&/工作文件/.test(s.kind)),'訂閱同步文件不應計為休閒影音');
console.log('通過：舊日期完整保留、增量對帳、批次與來源去重、前景事件未更新揭露、新節點與同步分類。');

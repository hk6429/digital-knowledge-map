const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/public/index.html','utf8');
const d=JSON.parse(html.match(/<script id="dataset" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const expect={'2026-09-11':{visits:961,events:1555,notes:[10,9],sessions:[4,12],today:[33,16],must:['campus-linebot','online-course','talk','voice-practice'],first:'19:22:39'},
'2026-09-12':{visits:554,events:2083,notes:[36,35],sessions:[4,11],today:[43,22],must:['subscription-sync','app-publish','bills','humor-comics','knowledge-vault','project-8fe8cebf04d2c47a'],first:'08:10:33'},
'2026-09-13':{visits:239,events:1072,notes:[34,34],sessions:[3,10],today:[21,11],must:['subscription-sync','knowledge-vault','handoff','review'],first:'00:09:51'}};
for(const[day,e]of Object.entries(expect)){const b=d.dailyImports.find(x=>x.date===day);assert(b,day);
 assert.equal(b.browser_visits,e.visits);assert.equal(b.computer_events,e.events);assert.equal(b.notes_read,e.notes[0]);assert.equal(b.notes_imported,e.notes[1]);
 assert.equal(b.claude_sessions,e.sessions[0]);assert.equal(b.claude_entries,e.sessions[1]);assert.equal(b.activity_first,e.first);
 const today=d.nodes.filter(n=>n.dates.includes(day));assert.equal(today.length,e.today[0],day);assert.equal(today.filter(n=>n.level===3).length,e.today[1],day);
 for(const id of e.must)assert(today.some(n=>n.id===id),day+' 缺 '+id);
 for(const id of ['grading','rubric','device-admin'])assert(!today.some(n=>n.id===id),day+' 不應有 '+id);}
assert(d.dailyImports.find(x=>x.date==='2026-09-11').method.includes('19:22'),'9/11 電腦事件缺口要註明');
assert(d.dailyImports.find(x=>x.date==='2026-09-13').method.includes('部分日'),'9/13 是部分日資料');
assert.equal(d.until,'2026-09-13');assert.equal(d.days.length,97);
for(const n of d.sourceNodes)assert.equal(n.sources.length,new Set(n.sources.map(s=>s.date+'|'+s.kind)).size);
for(const word of ['涵戎','hk6429','today-20260911-private','today-20260912-private','today-20260913-private','水牛城','Apps Script 專案 ID','/Users/','sk-ant-'])assert(!html.includes(word),word);
console.log('通過：9/11–9/13 三批次數量、單日節點數、新主題節點、9/11 錄製缺口與 9/13 部分日註記、隱私排除。');

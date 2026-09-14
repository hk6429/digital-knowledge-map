const fs=require('fs'),assert=require('node:assert/strict');const html=fs.readFileSync('public/index.html','utf8');const d=JSON.parse(html.match(/<script id="dataset" type="application\/json">([\s\S]*?)<\/script>/)[1]);const s=d.septemberImport;
assert.equal(s.record_count,2862);assert.equal(Object.values(s.counts).reduce((a,b)=>a+b,0),2862);assert.equal(Object.keys(s.days).length,14);assert.equal(Object.values(s.days).flatMap(Object.values).reduce((a,b)=>a+b,0),2862);
const added=d.sourceNodes.filter(n=>n.id.startsWith('sept-snapshot-'));assert.equal(added.length,17);assert.equal(added.flatMap(n=>n.sources).reduce((a,b)=>a+b.count,0),2862);assert.equal(new Set(d.nodes.map(n=>n.id)).size,d.nodes.length);assert.equal(d.unmapped.filter(n=>n.id.startsWith('sept-snapshot-')).length,0);
assert.equal(s.legacy_computer_events.length,5);assert(s.legacy_computer_events.every(e=>e.refreshed===false));assert(s.limits.some(x=>x.includes('無可用')));
for(const n of added)for(const source of n.sources){assert(source.count>0);assert(!/https?:|@|\/Users\//.test(source.file))}
for(const word of ['/Users/','sk-ant-','hk6429@gmail.com'])assert(!html.includes(word),word);
console.log('PASS September: all 2862 items accounted for; 14 dates; no raw URLs/content; separate legacy snapshots and missing operation logs.');

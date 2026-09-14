const fs=require('fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('public/index.html','utf8'),script=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
const data=JSON.parse(html.match(/<script id="dataset" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const expansion=script.slice(script.indexOf('// Expand only'),script.indexOf('const byId='));
new Function('D',expansion)(data);
const counts={};for(const n of data.nodes)counts[n.level]=(counts[n.level]||0)+1;
assert.equal(counts[1],7);assert(counts[2]>=24&&counts[3]>=85&&counts[4]>=273&&counts[5]>=408);
assert.equal(new Set(data.nodes.map(n=>n.id)).size,data.nodes.length);
const byId=new Map(data.nodes.map(n=>[n.id,n]));
for(const n of data.nodes.filter(n=>n.level>3)){
 assert.equal(byId.get(n.parent).level,n.level-1);
 assert(n.sources.length>0);assert(n.sources.every(s=>byId.get(n.project).sources.includes(s)));
 assert(data.links.some(l=>l.source===n.parent&&l.target===n.id));
}
let depth=5,month='all',search='';const $=s=>({value:s==='#depth'?depth:s==='#month'?month:search});
const visible=new Function('D','$','byId','enabledThemes','focus','key',script.slice(script.indexOf('function visible()'),script.indexOf('function transform()'))+';return visible;')(data,$,byId,new Set(data.themes.map(t=>t.theme)),null,null);
for(depth=1;depth<=5;depth++){const v=visible();assert(v.ns.every(n=>n.level<=depth));assert(v.ns.some(n=>n.level===depth))}
depth=5;month='2026-09-13';assert(visible().ns.every(n=>n.dates.includes(month)));assert(visible().ns.some(n=>n.level===5));
month='all';search='2026-09 紀錄';const v=visible(),ids=new Set(v.ns.map(n=>n.id));for(const n of v.ns.filter(n=>n.level>3))assert(ids.has(n.parent));
assert(html.includes('id="depth" type="range" min="1" max="5" value="5"'));
assert(html.includes("$('#depth').value='5'"));
const physics=new Function(script.split('/* PHYSICS_START */')[1].split('/* PHYSICS_END */')[0]+';return physicsStep')();
const ps=new Map(data.nodes.map((n,i)=>[n.id,{x:500+Math.cos(i)*250,y:350+Math.sin(i)*200}]));
const start=performance.now();for(let i=0;i<60;i++)physics(data.nodes,data.links,ps,null,Math.pow(.985,i));
assert([...ps.values()].every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
console.log('PASS: five layers, real public sources, hierarchy, depth/date/search filters, reset; nodes',counts,'physics ms/step',((performance.now()-start)/60).toFixed(1));

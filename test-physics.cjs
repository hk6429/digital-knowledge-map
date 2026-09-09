const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/public/index.html','utf8');
const script=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
new Function(script);
const source=script.split('/* PHYSICS_START */')[1].split('/* PHYSICS_END */')[0];
const step=new Function(source+';return physicsStep')();
const ns=[{id:'a'},{id:'b'}],links=[{source:'a',target:'b',type:'已整理'}];
const initial=()=>new Map([['a',{x:180,y:350}],['b',{x:600,y:350}]]);
const linked=initial(),unlinked=initial();
for(let i=0;i<20;i++){step(ns,links,linked,'a');step(ns,[],unlinked,'a')}
assert.equal(linked.get('a').x,180,'拖曳中的節點應保持固定');
assert(linked.get('b').x<unlinked.get('b').x-30,'彈簧必須明顯牽引相鄰節點');
let speed;
for(let i=0;i<1800;i++)speed=step(ns,links,linked,null);
assert(speed<.035,'放開後應逐漸穩定');
const d=JSON.parse(html.match(/<script id="dataset" type="application\/json">([\s\S]*?)<\/script>/)[1]);
for(const showCandidates of [false,true]){
 const ps=new Map(d.nodes.map((n,i)=>[n.id,{x:500+Math.cos(i)*250,y:350+Math.sin(i)*200}]));
 const ls=d.links.filter(l=>showCandidates||l.type==='分類');
 for(let i=0;i<2400;i++){
  if(i===100){ps.get('grading').x=140;ps.get('grading').y=120}
  speed=step(d.nodes,ls,ps,i>=100&&i<150?'grading':null,Math.pow(.985,Math.max(0,i-150)));
 }
 assert([...ps.values()].every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&Math.abs(p.x)<5000&&Math.abs(p.y)<5000),'自由網路不可發散');
 assert(speed<.035,'完整圖譜應能冷卻停止');
}
const fixed=initial();fixed.get('a').pinned=true;
for(let i=0;i<120;i++)step(ns,links,fixed,null);
assert.equal(fixed.get('a').x,180,'放開滑鼠後仍固定');
fixed.get('a').pinned=false;
for(let i=0;i<30;i++)step(ns,links,fixed,null);
assert.notEqual(fixed.get('a').x,180,'解除固定後恢復運動');
console.log(`通過：語法、拖曳固定、相鄰牽引、放開回穩、${d.nodes.length} 節點含候選與不含候選穩定性。`);

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
 assert([...ps.values()].every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=90&&p.x<=910&&p.y>=85&&p.y<=635),'長時間執行後不可發散或超出邊界');
 assert(speed<.035,'完整圖譜應能冷卻停止');
}
// Exercise the actual three-column anchors and large scrollable canvas too.
const anchored=d.nodes.map((n,i)=>({...n,anchor:{x:[70,340,650][n.level-1],y:70+i*42},boundsY:4300}));
const ps=new Map(anchored.map(n=>[n.id,{...n.anchor,vx:0,vy:0}]));
for(let i=0;i<2400;i++)speed=step(anchored,d.links,ps,null,Math.pow(.985,i));
assert([...ps.values()].every(p=>Number.isFinite(p.x)&&p.y>=35&&p.y<=4300));
assert(anchored.every(n=>Math.abs(ps.get(n.id).x-n.anchor.x)<45),'三欄不可被彈簧拉成一團');
assert(speed<.035);
console.log(`通過：語法、拖曳固定、相鄰牽引、放開回穩、${d.nodes.length} 節點含候選與不含候選穩定性。`);

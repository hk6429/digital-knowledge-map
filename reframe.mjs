// Editorial knowledge organization; never treats the recording tool as a topic hub.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const THEMES=[
 ['language','國文教學','#357b68','讓學生讀得懂、想得深，也能說與寫。'],
 ['learning','學生學習與評量','#427cac','看見學習歷程，設計可練習、可回饋的支持。'],
 ['lead','自我領導與班級經營','#b78437','把七個習慣、選擇與責任帶進學生的日常。'],
 ['school','資訊組與校務','#7671a8','讓設備、行政與資訊素養支持校園現場。'],
 ['sharing','教師成長與分享','#b16755','整理自己的實踐，轉成同事能使用的經驗。'],
 ['creation','閱讀寫作與創作','#9a698a','把閱讀、思考、文字與影像累積為作品。'],
 ['life','生活與理財','#69875a','保留工作以外的生活紀錄；現有資料主要是理財。'],
];
// Keys reference existing source labels; assignment expresses an editable interpretation, not causality.
export const GROUPS=[
 ['read','閱讀理解','language',['xunzhang-zhaiju','文言解憂站','句讀學院','weijing-library']],
 ['words','字音字形','language',['字字珠璣','xingyin-doushi','ziyuan-tanzong']],
 ['literature','文學與文化','language',['文豪笑傳','翰墨江山','wenren-duel']],
 ['selflearn','自主學習','learning',['自主學習護照','學習航站','self-learning-orbit','wanyao-wenshu']],
 ['feedback','評量與回饋','learning',['AI 輔助批改平台設計','教師評分規準','student-showcase-ink']],
 ['exam','題庫與練習','learning',['題庫內容維護','題庫競技場','五科會考入口','會考國文','會考英語','會考數學','會考社會','會考自然','學測題庫星系','gsat-ziran','gsat-shehui','gsat-guowen','gsat-english-bqe','gsat-math','tvet-exam-galaxy','question_database']],
 ['game','遊戲化學習','learning',['字鬥','步學吾數','科學英雄','geometry-city','beiying-escape-room']],
 ['habits','七個習慣','lead',['自我領導與習慣','煉心訣','七訣鬥法','habit-quest-biw','habit-tycoon','zizhu-monopoly']],
 ['class','班級經營','lead',['class-points-299','新手導師','teacher-tycoon']],
 ['equipment','設備與服務','school',['平板借用']],
 ['admin','校務支持','school',['校務與資訊行政','翰墨文書']],
 ['safety','資訊與媒體素養','school',['資安與媒體素養教材','media-literacy-quest','zgjh-it-quest']],
 ['growth','教師專業成長','sharing',['tqa-guoxiao','classroom-ops-slides-hub']],
 ['share','教學經驗分享','sharing',['科技輔導團分享','大乃個人網站','大乃作品集']],
 ['design','教育工具設計','sharing',['AI 工作流程','程式開發與部署','課程與教學設計']],
 ['write','寫作與表達','creation',['寫作與社群內容','PDF / 投影片','習慣書稿','wenxin-diaolong']],
 ['visual','故事與影像','creation',['影片成品','fuxiao-miling']],
 ['reflect','整理與反思','creation',['成果檢視與覆核','下一步與交接']],
 ['finance','理財紀錄','life',['ETF 與投資紀錄']],
];
const FRIENDLY={'xunzhang-zhaiju':'尋章摘句','xingyin-doushi':'形音鬥士','ziyuan-tanzong':'字源探蹤','weijing-library':'圖書館熄燈後','wenren-duel':'文人對決','self-learning-orbit':'自主學習軌道','wanyao-wenshu':'萬妖文書','student-showcase-ink':'學生作品展示','gsat-ziran':'學測自然','gsat-shehui':'學測社會','gsat-guowen':'學測國文','gsat-english-bqe':'學測英語','gsat-math':'學測數學','tvet-exam-galaxy':'統測題庫星系','question_database':'題庫參考資料','geometry-city':'幾何學習城市','beiying-escape-room':'背影密室逃脫','habit-quest-biw':'七習慣闖關','habit-tycoon':'習慣養成工廠','zizhu-monopoly':'自我領導力環島棋','class-points-299':'班級積分紀錄','teacher-tycoon':'教師養成遊戲','media-literacy-quest':'媒體素養闖關','zgjh-it-quest':'校園資訊任務','tqa-guoxiao':'國小教檢題庫','classroom-ops-slides-hub':'教學與班級經營簡報','wenxin-diaolong':'文心雕龍','fuxiao-miling':'拂曉密令'};
const DETAIL={'feedback':'重點是教師設定評分規準、設計平台與覆核回饋；不是把教師判斷交給 AI。','finance':'現有生活紀錄以 ETF 與投資相關筆記為主，不能據此推論家庭或健康狀態。','design':'以教學需求決定工具與流程；AI 是方法，不是工作的目的。','reflect':'回看成果、查證、交接與下一步，屬於工作反思的建議分類。'};
export function reframe(source){
 const used=new Set(),nodes=[],links=[];
 const themes=THEMES.map(([id,label,color,description])=>({id:'theme-'+id,label,color,description,theme:id,kind:'重心',sources:[],dates:[]}));
 const uniqueDates=ns=>[...new Set(ns.flatMap(n=>n.dates))].sort();
 for(const[id,label,theme,labels]of GROUPS){
  const members=source.nodes.filter(n=>labels.includes(n.label));if(!members.length)continue;
  const key={id:'key-'+id,label,theme,kind:'關鍵字',description:DETAIL[id]||'依既有專案用途整理的知識關鍵字；這是可調整的分類，不代表來源已證實因果。',sources:[],dates:uniqueDates(members)};
  nodes.push(key);links.push({source:'theme-'+theme,target:key.id,type:'分類',label:'工作重心 → 知識關鍵字',reason:'依教師角色與現有專案用途整理的建議分類。'});
  for(const n of members){used.add(n.id);const child={...n,label:FRIENDLY[n.label]||n.label,originalLabel:n.label,kind:n.kind==='專案'?'專案':'實踐',theme,keyword:key.id};nodes.push(child);links.push({source:key.id,target:n.id,type:'分類',label:label+' → '+child.label,reason:'依名稱與專案用途歸類；原始來源日期保留於明細。'});}
 }
 for(const t of themes)t.dates=uniqueDates(nodes.filter(n=>n.theme===t.theme));
 nodes.unshift(...themes.filter(t=>t.dates.length));
 for(const l of links){const n=nodes.find(n=>n.id===l.target);l.dates=n.dates;l.date=n.dates.at(-1);}
 return {...source,nodes,links,sourceNodes:source.nodes,sourceLinks:source.links,tools:source.nodes.filter(n=>n.kind==='工具'),unmapped:source.nodes.filter(n=>!used.has(n.id)&&n.kind!=='工具'),themes:themes.filter(t=>t.dates.length),model:'life-work-v2',classificationNote:'分類以國文教師、資訊組長、自我領導課程與創作生活為出發點；不是根據工具使用次數決定重心。',stats:{...source.stats,original_nodes:source.nodes.length,source_links:source.links.length,focus_themes:themes.filter(t=>t.dates.length).length,keywords:nodes.filter(n=>n.kind==='關鍵字').length}};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const dir=path.dirname(fileURLToPath(import.meta.url));
 const source=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));const data=reframe(source);
 const template=fs.readFileSync(path.join(dir,'template.html'),'utf8');
 fs.writeFileSync(path.join(dir,'public/index.html'),template.replace('__DATA__',JSON.stringify(data).replaceAll('<','\\u003c')));
 console.log(JSON.stringify({themes:data.stats.focus_themes,keywords:data.stats.keywords,workNodes:data.nodes.filter(n=>['專案','實踐'].includes(n.kind)).length,toolsOutsideGraph:data.tools.length,preservedSourceNodes:data.sourceNodes.length,unmapped:data.unmapped.map(n=>n.label)}));
}

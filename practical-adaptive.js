/* HERO FINDER v9.10.8 adaptive PRACTICAL beta.
 * 30 answered prompts chosen from a broader pool. The original v9.10.6
 * scoring engine remains intact for regression / reference (practical.js).
 * A hero's role is NEVER used as an elimination condition. Unplayed != weak.
 * Assessed HA/HS matching only from the v9.10.6 individually reviewed tags.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.COMPASS_PRACTICAL_ADAPTIVE=api;})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const B=()=>typeof window!=='undefined'?window.COMPASS_PRACTICAL:globalThis.COMPASS_PRACTICAL;
 const D=()=>typeof window!=='undefined'?window.COMPASS_DATA:globalThis.COMPASS_DATA;
 const AUDIT=()=>typeof window!=='undefined'?window.COMPASS_HA_HS_SKILL_TAGS:globalThis.COMPASS_HA_HS_SKILL_TAGS;
 const LENGTH=30,VERSION=70; // Stage37 trial; old sessions kept separate
 const EXPERIENCE={yes:'よく遊ぶ',sometimes:'ときどき遊ぶ',no:'最近あまり遊んでいない',unknown:'ほとんど遊んだことがない'};
 const BREADTH={yes:'いろいろなキャラを使う',sometimes:'数人を使う',no:'ほぼ1人だけ使う',unknown:'まだ決まっていない'};
 const PREF={yes:'とても興味がある',sometimes:'少し興味がある',no:'あまり興味がない',unknown:'まだ分からない'};
 const TYPE={skill:'skill',style:'style',usage:'usage',preference:'preference',meta:'meta',cardSkill:'cardSkill',haSkill:'haSkill',hsSkill:'hsSkill'};
 const m=(id,question,labels)=>({id,group:'プレイ経験',question,mode:'meta',labels,bucket:'meta',signals:{},weight:0});
 const x=(id,bucket,question,signals,weight=1.1,mode='skill',extras={})=>({id,bucket,group:({roleStyle:'ロールの好み',objective:'ポータル・状況判断',mechanic:'操作・間合い',card:'カード操作',usage:'デッキの使用経験',team:'連携・支援',haHs:'HA・HSの使い方',down:'転倒・追撃',preference:'やってみたい戦い方'})[bucket],question,signals,weight,mode,responseMode:mode==='style'?'style':mode==='usage'?'usage':undefined,...extras});
 const NEW=[
  m('EX00','最近の#コンパスのプレイ頻度はどのくらい？',EXPERIENCE),
  m('EX01','普段は何人くらいのヒーローを使う？',BREADTH),
  x('AR01','roleStyle','スプリンターのように、ポータルを素早く取りに行く役割をよく選ぶ？',{'role:スプリンター':.65,'trait:objective':.35},1.05,'style'),
  x('AR02','roleStyle','ロールに関係なく、自分で敵を倒す役割を担うことが多い？',{'trait:burst':.5,'trait:aggressive':.5},1.05,'style'),
  x('AR03','roleStyle','ガンナーのように、射程を活かして味方を援護する役割をよく選ぶ？',{'role:ガンナー':.6,'trait:range':.4},1.05,'style'),
  x('AR04','roleStyle','タンクのように、ポータルを守り味方を支える役割をよく選ぶ？',{'role:タンク':.6,'trait:hold':.4},1.05,'style'),
  x('AR05','roleStyle','試合や味方の編成によって、違うロールを使い分けることが多い？',{'trait:flex':.7,'trait:team':.3},.9,'style'),
  x('AR06','roleStyle','前線でキルを取るより、相手の行動を妨害する役割が好き？',{'trait:disrupt':.5,'trait:control':.35,'trait:support':.15},1,'style'),
  x('AR07','roleStyle','支援も攻撃も、試合展開に合わせて役割を切り替えることが多い？',{'trait:flex':.7,'trait:team':.3},1,'style'),
  x('AP01','objective','ポータルの数と残り時間から、いったん退く判断ができる？',{'trait:objective':.5,'trait:safe':.25,'trait:flex':.25},1.25),
  x('AP02','objective','敵が複数で守るポータルを、別の拠点へ向かって動かす判断をすることが多い？',{'trait:reposition':.4,'trait:objective':.4,'trait:flex':.2},1,'style'),
  x('AP03','objective','拠点を守る場面で、敵を追いすぎず味方を待つことが多い？',{'trait:hold':.55,'trait:team':.25,'trait:defense':.2},1.05,'style'),
  x('AP04','objective','敵の人数差ができた瞬間に、味方と一緒にポータルを攻められる？',{'trait:objective':.65,'trait:team':.35},1.3),
  x('AP05','objective','味方が倒れたとき、無理な交戦より時間稼ぎを優先できる？',{'trait:hold':.35,'trait:safe':.35,'trait:flex':.3},1.05),
  x('AP06','objective','有利な試合で、自分が前に出るか守るかを切り替えられる？',{'trait:flex':.55,'trait:objective':.45},1.2),
  x('AP07','objective','倒した敵の復帰を見て、次に守るポータルを先に決めることが多い？',{'trait:objective':.6,'trait:hold':.4},1.15,'style'),
  x('AF01','mechanic','敵の攻撃を避けながら、自分の攻撃が届く間合いを維持できる？',{'trait:safe':.6,'trait:skill':.4},1.3),
  x('AF02','mechanic','敵に近づかれたとき、攻撃を止めて安全な距離を作り直せる？',{'trait:safe':.6,'trait:mobility':.4},1.3),
  x('AF03','mechanic','敵のカード使用後の隙を見てから攻撃を始められる？',{'trait:counter':.4,'trait:skill':.4,'trait:melee':.2},1.2),
  x('AF04','mechanic','敵を追っている途中で、危険を感じたら無理なく離脱できる？',{'trait:mobility':.4,'trait:safe':.35,'trait:flex':.25},1.2),
  x('AF05','mechanic','接近して短時間で攻撃し、相手の反撃前に距離を取れる？',{'trait:melee':.55,'trait:burst':.25,'trait:mobility':.2},1.15),
  x('AF06','mechanic','通常攻撃を続けながら、敵の位置を見て標的を切り替えられる？',{'trait:range':.4,'trait:skill':.3,'trait:team':.3},1.1),
  x('AF07','mechanic','攻めるタイミングと守るタイミングを、操作を止めずに切り替えられる？',{'trait:flex':.5,'trait:skill':.25,'trait:objective':.25},1.15),
  x('AF08','mechanic','敵から集中攻撃されても、回避ルートを考えて生き残れる？',{'trait:safe':.45,'trait:mobility':.3,'trait:defense':.25},1.3),
  x('AF09','mechanic','敵を追い詰める位置取りで、短時間にキルまでつなげられる？',{'trait:burst':.4,'trait:aggressive':.3,'trait:reposition':.3},1.1),
  x('AF10','mechanic','攻撃を受け止める位置と、無理せず引く位置を判断できる？',{'trait:defense':.45,'trait:hold':.25,'trait:safe':.3},1.15),
  x('AT01','team','味方がキルを狙うとき、敵の退路をふさぐ位置に移動することが多い？',{'trait:team':.35,'trait:control':.4,'trait:reposition':.25},1,'style'),
  x('AT02','team','味方が危険なとき、自分のキルより味方を守るための回復や援護を優先することが多い？（自分用の回復は除く）',{'trait:team':.35,'trait:heal':.35,'trait:support':.3},1.1,'style'),
  x('AT03','team','敵を妨害した直後、味方が攻撃できるかを見て行動を変えられる？',{'trait:disrupt':.35,'trait:team':.35,'trait:control':.3},1.15),
  x('AT04','team','味方と別方向から敵を挟み、行動できる範囲を狭めることが多い？',{'trait:team':.4,'trait:control':.3,'trait:reposition':.3},1,'style'),
  x('AT05','team','味方のHPが減ったとき、自分も敵を引きつけて時間を稼げる？',{'trait:team':.3,'trait:hold':.3,'trait:defense':.4},1.15),
  x('AT06','team','スタンなどで敵の動きを止めた後、味方と追撃のタイミングを合わせられる？',{'trait:team':.45,'trait:control':.35,'trait:skill':.2},1.15),
  x('AT07','team','キルを取れない場面でも、味方のために進路や攻撃の邪魔をすることが多い？',{'trait:control':.4,'trait:disrupt':.3,'trait:support':.3},1,'style'),
  x('AK01','card','近距離カードを相手のガードや硬直に合わせて発動できる？',{'card:deck_near':1},1.1,'cardSkill'),
  x('AK02','card','遠距離カードを使う場面で、攻撃後の隙をカバーできる？',{'card:deck_ranged':1},1.1,'cardSkill'),
  x('AK03','card','連続攻撃カードを、途中で逃げられない位置から使える？',{'card:deck_combo':1},1.2,'cardSkill'),
  x('AK04','card','周囲カードを敵に近づかれた際の自衛にも使える？',{'card:deck_area':1},1.05,'cardSkill'),
  x('AK05','card','ガードブレイクを使う前に相手のガードを確認できる？',{'card:deck_guardbreak':1},1.2,'cardSkill'),
  x('AK06','card','スタンカードを当てたあと、味方の追撃につなげる判断ができる？',{'trait:control':.5,'trait:team':.5},1.1,'skill'),
  x('AK07','card','罠を設置したあと、敵を罠がある方向へ誘導できる？',{'card:deck_trap':1},1.05,'cardSkill'),
  x('AK08','card','ドアで移動した直後、安全な位置を確保できる？',{'card:deck_door':1},1.05,'cardSkill'),
  x('AU01','usage','普段のデッキに、ガードブレイクカードを入れることが多い？',{'card:deck_guardbreak':1},.75,'usage'),
  x('AU02','usage','普段のデッキに、回復カードを入れることが多い？',{'card:deck_heal':1},.7,'usage'),
  x('AU03','usage','普段のデッキに、カウンターカードを入れることが多い？',{'card:deck_counter':1},.7,'usage'),
  x('AU04','usage','普段のデッキに、移動速度強化カードを入れることが多い？',{'card:deck_speed_buff':1},.7,'usage'),
  x('AU05','usage','普段のデッキに、ダメージカットなどの防御カードを入れることが多い？',{'card:deck_damagecut':1},.7,'usage'),
  x('AU06','usage','スタンカードと攻撃カードを組み合わせた構成を使うことが多い？',{'card:deck_stun':.65,'trait:control':.35},.7,'usage'),
  x('AD01','down','敵を転倒させたあと、味方に追撃を任せてポータルを狙うことが多い？',{'trait:objective':.5,'trait:team':.3,'trait:control':.2},.9,'style'),
  x('AD02','down','敵が転倒したとき、自分で追撃してキルを狙える？',{'down:followup':.6,'trait:burst':.4},1.1),
  x('AD03','down','敵を転倒させる固有技を使う際、安全な距離やタイミングを判断できる？',{'down:opener':.65,'trait:safe':.35},.95),
  x('AD04','down','敵が転倒したとき、味方の位置を見て追撃か防衛か選べる？',{'trait:flex':.4,'trait:objective':.35,'trait:team':.25},.95),
  x('AH01','haHs','タメ・段階調整があるHAを、敵の動きに合わせて当てられる？',{'skill:ha-charge':1},1,'haSkill',{skillTag:'ha-charge'}),
  x('AH02','haHs','ロックオン型HAで、攻撃対象を適切に選んで使える？',{'skill:ha-lockon':1},.9,'haSkill',{skillTag:'ha-lockon'}),
  x('AH03','haHs','設置位置が重要なHAで、敵の進路を予測して置ける？',{'skill:ha-placement':1},.9,'haSkill',{skillTag:'ha-placement'}),
  x('AS01','haHs','敵をスタンさせたり行動を制限したりするHSを、味方が攻められるタイミングに合わせて使える？',{'skill:hs-control':1},1,'hsSkill',{skillTag:'hs-control'}),
  x('AS02','haHs','HSを使うタイミングを、ポータルの状況と残り時間から考えられる？',{'trait:ultimate':.35,'trait:objective':.4,'trait:flex':.25},1,'skill'),
  x('AS03','haHs','HSを使ったあと、攻めるか守るかを味方と合わせて決められる？',{'trait:ultimate':.3,'trait:team':.35,'trait:flex':.35},1,'skill'),
  x('AS04','haHs','HSを温存しすぎず、必要な場面で使う判断ができる？',{'trait:ultimate':.4,'trait:flex':.3,'trait:objective':.3},1.05,'skill'),
  x('AS05','haHs','自分のHSゲージを意識して、序盤の行動を調整できる？',{'trait:ultimate':.4,'trait:objective':.4,'trait:skill':.2},1.05,'skill'),
  x('AS06','haHs','HSの演出や効果が終わったあと、危険を避けて立ち回れる？',{'trait:ultimate':.35,'trait:safe':.35,'trait:flex':.3},1,'skill'),
  x('AO01','preference','遊ぶなら、ポータルを素早く取る役割を楽しみたい？',{'role:スプリンター':.55,'trait:objective':.45},.7,'preference'),
  x('AO02','preference','遊ぶなら、敵を倒す攻撃中心の役割を楽しみたい？',{'role:アタッカー':.6,'trait:aggressive':.4},.7,'preference'),
  x('AO03','preference','遊ぶなら、遠くから攻撃して支える役割を楽しみたい？',{'role:ガンナー':.6,'trait:range':.4},.7,'preference'),
  x('AO04','preference','遊ぶなら、ポータルを守って味方を支える役割を楽しみたい？',{'role:タンク':.55,'trait:hold':.45},.7,'preference'),
  x('AO05','preference','自分でキルを取るより、妨害や支援をしてみたい？',{'trait:support':.4,'trait:control':.35,'trait:team':.25},.7,'preference'),
  x('AO06','preference','移動しながら戦う、機動力を活かす戦い方を試してみたい？',{'trait:mobility':.65,'trait:reposition':.35},.7,'preference'),
  x('AO07','preference','いろんなロールのヒーローを試してみたい？',{'trait:flex':.7,'trait:team':.3},.6,'preference'),
  x('AO08','preference','敵に近づくより、離れて安全に戦うスタイルを試してみたい？',{'trait:range':.6,'trait:safe':.4},.65,'preference'),
  x('AO09','preference','大事なポータルを守り抜く役割を楽しみたい？',{'trait:hold':.55,'trait:defense':.45},.65,'preference'),
  x('AO10','preference','味方と一緒に動き、攻撃のチャンスを作る戦い方を試したい？',{'trait:team':.55,'trait:control':.45},.65,'preference'),
  x('AO11','preference','相手の攻撃を見てから反撃する戦い方に興味がある？',{'trait:counter':.65,'trait:safe':.35},.65,'preference'),
  x('AO12','preference','ここぞという場面で短時間に攻め込む戦い方をしてみたい？',{'trait:burst':.6,'trait:aggressive':.4},.65,'preference'),
  x('AO13','preference','敵が近づきにくい場所を作って戦うスタイルに興味がある？',{'trait:zone':.55,'trait:control':.45},.65,'preference'),
  x('AO14','preference','味方を回復して長く戦えるようにする役割に興味がある？',{'trait:heal':.55,'trait:support':.45},.65,'preference'),
  x('AO15','preference','敵を足止めし、その間にポータルを確保する戦い方を試したい？',{'trait:control':.45,'trait:objective':.55},.65,'preference'),
  x('AO16','preference','敵を倒すよりも生き残って守り続ける戦い方を試したい？',{'trait:safe':.45,'trait:defense':.55},.65,'preference')
 ];
 const ORIG=B().questions.map(q=>({...q,bucket:({ 'ロール経験':'roleExperience','ポータル・勝ち筋':'objective','戦闘操作・間合い':'mechanic','カード実技・所持':q.responseMode==='usage'?'usage':'card','転倒（ダウン）・固有技':'down','転倒（ダウン）・カード':'down','転倒（ダウン）・連携':'down','連携・立ち回り':'team'})[q.group]||'mechanic',mode:q.responseMode==='style'?'style':q.responseMode==='usage'?'usage':q.id.startsWith('K')||q.id==='D03'?'cardSkill':'skill',source:'v9106'}));
 // Adaptive-only overrides; fixed baseline is intentionally untouched.
 const overrides={
 F02:{question:'通常攻撃などで遠くから攻撃を続け、敵に接近されないように距離を保てる？',signals:{'trait:range':1},labels:{yes:'安定してできる',sometimes:'ある程度できる',no:'この戦い方をするが苦手',unknown:'普段しない・未経験・判断できない'},weight:1.0},
 D03:{question:'攻撃カードで敵を転倒させた後、通常攻撃・DA・HA・別のカードなどで追撃するか、別の行動を取るか判断できる？',signals:{'trait:flex':.5,'trait:skill':.5},mode:'skill',weight:.8},
 T01:{question:'自分の生存用の回復（置き回など）とは別に、味方のために回復や援護を優先することが多い？',signals:{'trait:team':.6,'trait:support':.4},weight:1.1}
 };
 const pilot=globalThis.COMPASS_STAGE70_STYLE||{questions:[],evidence:{},active:[]};
 const active=new Set(pilot.active), extraActive=new Set(pilot.stage75?.addedAxes||[]), NS=pilot.questions.map(q=>Number(q.id.slice(2))<=2?m(q.id,q.question,{'yes':'よくある','sometimes':'ときどきある','no':'あまりない','unknown':'判断できない'}):{...x(q.id,'newStyle',q.question,{['new:'+q.id]:1},1.3,'style'),group:'戦闘スタイル（試作）',newAxis:true,observational:!active.has(q.id)});
 const POOL=[...NEW,...ORIG.map(q=>({...q,...overrides[q.id]})),...NS]; const byIdMap=Object.fromEntries(POOL.map(q=>[q.id,q]));
 if(POOL.length!==new Set(POOL.map(q=>q.id)).size)throw Error('duplicate adaptive question ID');
 const canonical=['EX00','EX01','R01','R02','R03','R04','P01','F03'];
 const need={newStyle:5,roleStyle:3,objective:3,mechanic:4,card:2,team:3,haHs:2,usage:1,down:1};
 const limits={newStyle:7,roleStyle:6,objective:7,mechanic:8,card:6,team:6,haHs:5,usage:5,down:3,preference:16};
 const answerLabels=B().answerLabels;
 function labelsFor(q){return q.labels|| (q.mode==='preference'?PREF:B().labelsFor(q));}
 function auditSignal(hero,tag){const r=AUDIT()?.heroes?.[hero.id-1];if(!r||r.id!==hero.id)return 0;
  if(tag==='ha-charge')return r.ha?.status==='match'?1:0;
  if(tag==='hs-control')return r.hs?.status==='match'?1:0;
  // These two narrow HA classifications are individually documented exclusions
  // from the earlier CHARGE question, not a generalised HA bonus.
  if(tag==='ha-lockon')return r.ha?.tag==='lockOn'?1:0;
  if(tag==='ha-placement')return r.ha?.tag==='placementTiming'?1:0;
  return 0;
 }
 // Stage36 approved 30% mix; only range components of four questions, 26 heroes.
 const RANGE_MEASURED=Object.freeze({"3":8.5,"37":8.5,"45":8.5,"73":8.5,"82":8.5,"95":8.5,"27":7.5,"28":7.5,"55":7.5,"77":7.5,"98":7.5,"10":7.0,"12":7.0,"52":7.0,"54":7.0,"61":7.0,"64":7.0,"75":7.0,"100":7.0,"24":6.5,"30":6.5,"42":6.5,"60":6.5,"72":6.5,"8":6.2,"87":6.0});
 const RANGE_QUESTIONS=new Set(['F02','AR03','AO03','AO08']);
 function relevance(hero,q){if(!q||q.mode==='meta')return 0;if(q.newAxis)return pilot.evidence[q.id]?.[hero.id]?.v??0;const original=q.skillTag?auditSignal(hero,q.skillTag):B().relevance(hero,q);
  if(!RANGE_QUESTIONS.has(q.id)||!Object.hasOwn(RANGE_MEASURED,hero.id))return original;
  const old=B().relevance(hero,{signals:{'trait:range':1}}), r=RANGE_MEASURED[hero.id];
  const measured=Math.max(0,Math.min(1,.35+.65*(r-6)/2.5));
  return original+q.signals['trait:range']*.3*(measured-old);}
 function factor(q,ans,rel){if(ans==='unknown')return 0;
  if(q.mode==='preference')return ({yes:.4,sometimes:.14,no:-.08})[ans]||0;
  if(q.mode==='haSkill'||q.mode==='hsSkill')return ({yes:.38,sometimes:.11,no:-.55})[ans]||0;
  if(q.id==='D03')return ({yes:.65,sometimes:.18,no:-.9})[ans]||0;
  if(q.mode==='cardSkill')return ans==='no'&&rel>=.76?-.36:0;
  return B().answerFactor(q,ans,rel);
 }
 function skillWeight(q){return q.mode==='meta'?0:q.weight;}
 const DUP_GROUPS=[['AK01','K01'],['AK02','K03'],['AK03','K02'],['AK04','K04'],['AK05','K05']];
 const dupMap=new Map(DUP_GROUPS.flatMap(g=>g.map(id=>[id,g[0]])));
 const sortRows=(a,b)=>b.score-a.score||b.coverage-a.coverage||a.hero.id-b.hero.id;
 const clip=v=>Math.max(0,Math.min(99,v)); const rounded=v=>Math.round(clip(v)*10)/10;
 const applicable=(a)=>a.answer!=='unknown'&&byIdMap[a.id]&&byIdMap[a.id].mode!=='meta'&&!byIdMap[a.id].newAxis;
 function makeRows(history,cap=.20){const heroes=D()?.heroes||[];
  const old=history.filter(applicable), fresh=history.filter(a=>a.answer!=='unknown'&&active.has(a.id));
  // NS03/04 share a normal-attack evidence budget. Other pilot prompts measure different use preferences, not card execution skills.
  const normalCount=fresh.filter(a=>['NS03','NS04'].includes(a.id)).length;
  const buffCount=fresh.filter(a=>['NS06','NS07'].includes(a.id)).length;
  const overlap={NS06:['K11'],NS07:['K12'],NS14:['AU03','AU05']};
  const overlapCount=a=>(overlap[a.id]||[]).filter(id=>old.some(x=>x.id===id)).length;
  const nw=a=>byIdMap[a.id].weight/(1+0.5*overlapCount(a))/(['NS03','NS04'].includes(a.id)?Math.max(1,normalCount):['NS06','NS07'].includes(a.id)?Math.max(1,buffCount):1);
  const oldWeights=new Map();for(const a of old){const q=byIdMap[a.id];if(q.mode==='cardSkill'&&a.answer!=='no')continue;const k=dupMap.get(q.id)||q.id;oldWeights.set(k,Math.max(oldWeights.get(k)||0,q.weight));}
  const WB=[...oldWeights.values()].reduce((a,b)=>a+b,0),WN=fresh.reduce((s,a)=>s+nw(a),0),WL=fresh.filter(a=>!extraActive.has(a.id)).reduce((s,a)=>s+nw(a),0),WE=WN-WL,p0=WL?Math.min(cap,WL/(WB+WL)):0;
  return heroes.map(hero=>{let raw=0,total=0,covered=0,verified=0,strengths=[],weaknesses=[];const slots=new Map();
   for(const a of old){const q=byIdMap[a.id],rel=relevance(hero,q);if(rel<.1)continue;const opp=q.weight*rel,coeff=factor(q,a.answer,rel);if(q.mode==='cardSkill'&&coeff>=0)continue;
    const key=dupMap.get(a.id)||a.id;(slots.get(key)||slots.set(key,[]).get(key)).push({q,a,rel,opp,coeff});}
   for(const items of slots.values()){const sum=items.reduce((s,x)=>s+x.opp,0),max=Math.max(...items.map(x=>x.opp)),scale=max/sum;total+=max;if(items.some(x=>x.coeff)){covered+=items.reduce((s,x)=>s+(x.coeff?x.opp:0),0)*scale;verified++;}
    for(const x of items){const delta=x.opp*x.coeff*scale,point={q:x.q,ans:x.a.answer,delta,rel:x.rel};raw+=delta;
     if(delta<0&&x.a.answer==='no'&&!['style','usage','preference'].includes(x.q.mode)&&x.rel>.28)weaknesses.push(point);else if(delta>0&&x.rel>.28)strengths.push(point);}}
   const base=clip(50+45*raw/(total+5));let nraw=0,ntotal=0,confirmed=0,extraConfirmed=0,extraDelta=0;const newReasons=[];
   for(const a of fresh){const e=pilot.evidence[a.id]?.[hero.id];if(e?.v==null)continue;const w=nw(a),q=byIdMap[a.id],f=factor(q,a.answer,1);
    if(extraActive.has(a.id)){ // Directional, bounded incremental evidence; no shift for missing or nonmatching data.
     if(!e.v)continue;extraConfirmed+=w*e.v;extraDelta+=w*e.v*45*f;
     if(f>0)newReasons.push({q,ans:a.answer,delta:w*e.v*f,rel:e.v,reason:e.reason});continue;
    }
    confirmed+=w;if(!e.v)continue;nraw+=w*f;ntotal+=w;if(f>0)newReasons.push({q,ans:a.answer,delta:w*f,rel:1,reason:e.reason});}
   const sn=clip(50+45*nraw/(ntotal+5)),legacyAlpha=WL?p0*confirmed/WL:0;
   const extraBudget=WE?Math.min(Math.max(0,cap-legacyAlpha),WE/(WB+WL+WE)):0,alpha=legacyAlpha+(WE?extraBudget*extraConfirmed/WE:0);
   const score=rounded(base+legacyAlpha*(sn-base)+(WE?extraBudget*extraDelta/WE:0));
   strengths.sort((a,b)=>b.delta-a.delta);weaknesses.sort((a,b)=>a.delta-b.delta);
   return {hero,score,baseScore:rounded(base),raw,coverage:total?covered/total:0,matchedQuestions:verified,totalEvidence:total,strengths,weaknesses,newReasons,newCoverage:WN?(confirmed+extraConfirmed)/WN:0,newShare:alpha,newScore:sn};
  }).sort(sortRows);
 }
 // Experimental independent proximity contexts. No role is a ranking quota or exclusion.
 const NEAR_IDS=new Set(['R02','F01','AF05']);
 const FAR_IDS=new Set(['R03','F02','AR03','AO03','AO08']);
 const positive=v=>v==='yes'||v==='sometimes';
 function bothRoleChecks(history){const by=Object.fromEntries(history.map(a=>[a.id,a.answer]));return by.EX00!=='unknown'&&by.EX01!=='no'&&positive(by.R02)&&positive(by.R03);}
 function styleProfiles(history,ranked=makeRows(history)){
  const by=Object.fromEntries(history.map(a=>[a.id,a.answer]));
  const has=id=>positive(by[id]);const profiles=[];
  const add=(id,label,ids,predicate)=>{const evidence=ids.filter(has);if(evidence.length<2)return;const matches=ranked.filter(predicate);if(matches.length)profiles.push({id,label,ranked:matches,questionIds:evidence});};
  const match=(h,id)=>pilot.evidence[id]?.[h.id]?.v===1;
  const research=(h,id)=>['根拠あり','特化（★）'].includes(pilot.evidence[id]?.[h.id]?.state);
  if((has('AO06')||has('AF05')||has('R01'))&&(has('F08')||has('AR02')||has('NS05')))add('mobilityKill','機動力を活かしたキル型',['AO06','AF05','R01','F08','AR02','NS05'],r=>relevance(r.hero,byIdMap.AO06)>=.55&&relevance(r.hero,byIdMap.AR02)>=.55);
  if(has('NS03'))add('shortNormal','短射程通常火力型',['NS03','NS04','F01','NS05'],r=>match(r.hero,'NS03')||r.hero.id===41);
  if(has('NS12')&&(has('NS06')||has('NS07')))add('rearBuff','後方自強化・デバフ火力型',['NS12','NS06','NS07'],r=>research(r.hero,'NS12')&&((has('NS06')&&research(r.hero,'NS06'))||(has('NS07')&&research(r.hero,'NS07'))));
  if(has('NS11'))add('card','攻撃カード火力型',['NS11','NS05','F08','AR02'],r=>match(r.hero,'NS11'));
  if(has('NS13')||has('NS14'))add('instantDefense','カード即時発動・自衛型',['NS13','NS14','NS06','AU03','AU05'],r=>(has('NS13')&&relevance(r.hero,byIdMap.NS13)>0)||(has('NS14')&&relevance(r.hero,byIdMap.NS14)>0));
  if(has('NS15'))add('haMove','HA位置調整型',['NS15','AO06','AF04','AF05','NS16'],r=>relevance(r.hero,byIdMap.NS15)>0);
  if(has('NS10'))add('growth','試合中の成長型',['NS10','NS04','NS09','NS05'],r=>match(r.hero,'NS10'));
  // Legacy near/far kept only as reference when confirmed; never max-merge scores.
  if(bothRoleChecks(history)&&has('F01')&&has('F02')){add('near','近距離戦',['F01','R02'],r=>relevance(r.hero,byIdMap.F01)>=.55);add('far','遠距離戦',['F02','R03'],r=>relevance(r.hero,byIdMap.F02)>=.55);}
  return profiles.length?profiles:null;
 }
 function trialRows(history){const ranked=makeRows(history);return {ranked,profiles:styleProfiles(history,ranked),baseline:makeRows(history,0)};}
 function roleTop(ranked,ready,history){if(!ready)return [];const by=Object.fromEntries(history.map(a=>[a.id,a.answer]));return ['スプリンター','アタッカー','ガンナー','タンク'].map((role,i)=>({role,items:ranked.filter(r=>r.hero.role===role).slice(0,3).map(r=>({...r,reference:r.coverage<.45||r.matchedQuestions<3||r.totalEvidence<2||(!positive(by['R0'+(i+1)])&&!positive(by['AO0'+(i+1)]))}))}));}
 function contextOf(history){const by=Object.fromEntries(history.map(a=>[a.id,a.answer]));const novice=by.EX00==='unknown';const casual=by.EX00==='no'||novice;const narrow=by.EX01==='no';const multi=['R01','R02','R03','R04'].filter(id=>['yes','sometimes'].includes(by[id])).length>=2;
  const counts={};for(const a of history){const q=byIdMap[a.id];if(q)counts[q.bucket]=(counts[q.bucket]||0)+1;}return {by,novice,casual,narrow,multi,counts};}
 function hash(s){let n=2166136261;for(let i=0;i<s.length;i++)n=Math.imul(n^s.charCodeAt(i),16777619);return n>>>0;}
 function spread(q,candidates){const values=candidates.map(h=>relevance(h,q)),mean=values.reduce((a,b)=>a+b,0)/values.length;
  const v=values.reduce((a,b)=>a+(b-mean)**2,0)/values.length;return Math.sqrt(v);}
 function selectCandidates(history){if(!history.some(a=>a.answer!=='unknown'&&byIdMap[a.id]?.mode!=='meta'))return D().heroes;
  const trial=trialRows(history),rows=trial.ranked;const selected=rows.slice(0,12).map(x=>x.hero);const group=Object.groupBy?Object.groupBy(rows,x=>x.hero.role):{};
  if(!Object.groupBy){for(const r of rows)(group[r.hero.role]??=[]).push(r);}
  for(const role of ['スプリンター','アタッカー','ガンナー','タンク'])for(const r of (group[role]||[]).slice(0,4))if(!selected.some(h=>h.id===r.hero.id))selected.push(r.hero);
  for(const p of trial.profiles||[])for(const r of p.ranked.slice(0,6))if(!selected.some(h=>h.id===r.hero.id))selected.push(r.hero);
  return selected;
 }
 function similar(q,asked){const a=new Set(Object.keys(q.signals||{}));if(!a.size)return 0;let maximum=0;
  for(const prev of asked){if(prev.bucket!==q.bucket)continue;const b=new Set(Object.keys(prev.signals||{}));if(!b.size)continue;let common=0;for(const k of a)if(b.has(k))common++;
   maximum=Math.max(maximum,common/(a.size+b.size-common));}return maximum;}
 function nextQuestionId(history,seed){if(history.length>=LENGTH)return null;
  // Two non-scored context questions, four role checks (all four; never exclude a
  // role), and two shared gameplay anchors. Role-check order rotates by seed.
  const fixed=canonical.slice(0,2);
  if(history[0]?.answer==='unknown')fixed.push('AO01','AO02','AO03','AO04','AO05','AO06');
  else fixed.push('R01','R02','R03','R04','P01','F03');
  if(history.length<fixed.length)return fixed[history.length];
  // Both actual role checks positive: confirm the two styles independently within 30 prompts.
  const early=contextOf(history);
  if(!early.novice&&!early.narrow&&history.length<12&&positive(early.by.EX01)){
   if(early.multi&&!early.by.NS01)return 'NS01';
   if((early.multi||early.by.EX01==='yes')&&!early.by.NS02)return 'NS02';
  }
  // A multi-style user with a positive ranged skill check gets a play-style confirmation, not an inferred preference.
  if(!early.novice&&history.length<15&&(positive(early.by.NS01)||positive(early.by.NS02))&&positive(early.by.R03)){
   if(!early.by.NS12)return 'NS12';
   if(positive(early.by.NS12)&&!early.by.NS06)return 'NS06';
   if(positive(early.by.NS12)&&!positive(early.by.NS06)&&!early.by.NS07)return 'NS07';
  }
  if(bothRoleChecks(history)&&history.length<15)for(const id of ['F01','F02'])if(!history.some(a=>a.id===id))return id;
  const used=new Set(history.map(a=>a.id)),ctx=contextOf(history),cand=selectCandidates(history),asked=history.map(a=>byIdMap[a.id]);
  const needNow={...need};if(ctx.novice){needNow.newStyle=0;needNow.roleStyle=0;needNow.preference=10;needNow.usage=0;needNow.card=0;needNow.down=0;needNow.haHs=0;needNow.objective=3;needNow.mechanic=3;needNow.team=2;}
  else if(ctx.narrow){needNow.roleStyle=4;needNow.preference=2;needNow.card=2;needNow.usage=1;}
  else if(ctx.multi){needNow.roleStyle=4;}
  if(!ctx.novice&&(positive(ctx.by.NS01)||positive(ctx.by.NS02))&&positive(ctx.by.NS12))needNow.newStyle=5;
  let available=POOL.filter(q=>!used.has(q.id)&&!['meta','roleExperience'].includes(q.bucket)&&((ctx.counts[q.bucket]||0)<(limits[q.bucket]||8)));
  if(ctx.novice)available=available.filter(q=>!['usage','card','roleStyle','down','haHs','roleExperience','newStyle'].includes(q.bucket));
  const distinct=available.filter(q=>!dupMap.has(q.id)||!asked.some(p=>p.id!==q.id&&dupMap.get(p.id)===dupMap.get(q.id)));if(distinct.length)available=distinct;
  const deficitCats=Object.entries(needNow).filter(([b,n])=>(ctx.counts[b]||0)<n).map(([b])=>b);
  // Protected category diversity before doing narrow hero comparisons.
  const slots=LENGTH-history.length;
  const deficitCount=deficitCats.reduce((n,b)=>n+needNow[b]-(ctx.counts[b]||0),0);
  if(deficitCount>=slots){const filtered=available.filter(q=>deficitCats.includes(q.bucket));if(filtered.length)available=filtered;}
  if(!available.length)throw Error('Question pool exhausted');
  // Candidate-specific mechanics deserve a slot, not a fixed hero bonus.
  // Reserve at most two follow-ups, only when relevant to current candidates
  // and the category quota still permits them.
  const mechanicsIds=['NS13','NS14','NS15','NS16'];
  const askedMechanics=history.filter(a=>mechanicsIds.includes(a.id)).length;
  if(!ctx.novice&&((history.length===17&&askedMechanics===0)||(history.length===22&&askedMechanics<2))){
   const top=cand.slice(0,12);
   const followups=available.filter(q=>mechanicsIds.includes(q.id)&&top.some(h=>relevance(h,q)>0));
   if(followups.length)available=followups;
  }
  const ranked=available.map(q=>{
   const d=(needNow[q.bucket]||0)-(ctx.counts[q.bucket]||0),quota=d>0?1.8:0;
   const info=spread(q,cand),all=spread(q,D().heroes),unique=1-Math.min(1,similar(q,asked));
   const contextBias=ctx.novice?(q.mode==='preference'?1.2:q.mode==='skill'?.1:0):ctx.narrow?(q.bucket==='roleStyle'?.45:0):ctx.multi?(q.bucket==='roleStyle'?.35:0):0;
   const variety=.35/(1+(ctx.counts[q.bucket]||0));
   // Fingerprint rotates among equally useful questions; NEVER override the
   // category balancing/actual candidate relevance with randomness alone.
   const tie=(hash(q.id)%997)/9970;
   const match=q.skillTag?cand.reduce((acc,h)=>acc+(relevance(h,q)>0?1:0),0):0;
   const narrowPenalty=q.skillTag&&match===0?-2:0;
   let observationBias=q.newAxis&&q.observational?-.25:0;
   // Observation questions are informative only for selection; no relevance enters score.
   if(q.newAxis){
    const rear=positive(ctx.by.R03)||positive(ctx.by.F02)||positive(ctx.by.NS12);
    const multi=positive(ctx.by.NS01)||positive(ctx.by.NS02);
    if(rear&&q.id==='NS12'&&(positive(ctx.by.NS01)||positive(ctx.by.NS02)||positive(ctx.by.F02)))observationBias+=1.25;
    if(rear&&['NS06','NS07'].includes(q.id))observationBias+=.55;
    if(q.id==='NS12'&&(positive(ctx.by.NS06)||positive(ctx.by.NS07)))observationBias+=1.1;
    if(['NS06','NS07'].includes(q.id)&&positive(ctx.by.NS12))observationBias+=1.1;
    if(q.id==='NS10'&&multi)observationBias+=.55;
    if(q.id==='NS05'&&(positive(ctx.by.AR02)||positive(ctx.by.F08)))observationBias+=.45;
    if(q.id==='NS08'&&(positive(ctx.by.K06)||positive(ctx.by.AU06)))observationBias+=.6;
    if(q.id==='NS09'&&positive(ctx.by.NS06))observationBias+=.6;
    if(extraActive.has(q.id)){
     const top=cand.slice(0,12),matched=top.filter(h=>relevance(h,q)>0).length;
     if(matched>0)observationBias+=.6+Math.min(.65,matched*.16);
     const related={NS06:['K11','NS04'],NS07:['K12','NS04'],NS13:['NS11','AU05','AU03'],NS14:['AU03','AU05'],NS15:['AO06','AF04','AF05'],NS16:['AS02','AS04','AS05']}[q.id]||[];
     if(related.some(id=>positive(ctx.by[id])))observationBias+=.4;
    }
   }
   const score=quota+info*2+all*.3+unique*.45+contextBias+variety+tie+narrowPenalty+observationBias;
   return {q,score};
  });ranked.sort((a,b)=>b.score-a.score||a.q.id.localeCompare(b.q.id));return ranked[0].q.id;
 }
 function session(){const now=new Date();const seed=0;return {version:VERSION,createdAt:now.toISOString(),seed,history:[],questionId:'EX00'};}
 function safeSession(s){if(!s||s.version!==VERSION||!Number.isInteger(s.seed)||!Array.isArray(s.history)||s.history.length>LENGTH)return false;
  const ids=new Set();for(const a of s.history){if(!a||!Object.hasOwn(byIdMap,a.id)||!Object.hasOwn(B().RESP,a.answer)||ids.has(a.id))return false;ids.add(a.id);}
  if(s.questionId!==null&&!Object.hasOwn(byIdMap,s.questionId))return false;
  if(s.questionId&&ids.has(s.questionId))return false;
  return s.history.length===LENGTH?s.questionId===null:!!s.questionId;
 }
 function answer(s,v){if(!safeSession(s)||!Object.hasOwn(B().RESP,v)||!s.questionId)throw Error('不正な適応実戦診断セッション');
  const history=[...s.history,{id:s.questionId,answer:v}];const questionId=nextQuestionId(history,s.seed);return {...s,history,questionId};}
 function back(s){if(!safeSession(s)||!s.history.length)return s;const history=s.history.slice(0,-1);return {...s,history,questionId:s.history.at(-1).id};}
 function compute(s){if(!safeSession(s))throw Error('不正な適応実戦診断セッション');const trial=trialRows(s.history),ranked=trial.ranked,nonmeta=s.history.filter(a=>byIdMap[a.id]?.mode!=='meta'&&!byIdMap[a.id]?.newAxis);const known=nonmeta.filter(a=>a.answer!=='unknown').length;const positives=nonmeta.filter(a=>['yes','sometimes'].includes(a.answer)).length;
  const ctx=contextOf(s.history),hasEvidence=known>=8&&positives>=3;
  const groups=new Set(nonmeta.filter(a=>a.answer!=='unknown').map(a=>byIdMap[a.id].bucket));const quality=known>=19&&groups.size>=5?'比較的多い':known>=12&&groups.size>=4?'中程度':'少なめ';
  return {ranked,known,positives,lowDistinction:new Set(nonmeta.filter(a=>a.answer!=='unknown').map(a=>a.answer)).size<2,unknown:nonmeta.length-known,total:LENGTH,ready:hasEvidence,confidence:quality,novice:ctx.novice,casual:ctx.casual,singleHero:ctx.narrow,multiRole:ctx.multi,usedQuestions:s.history.map(a=>a.id),styleProfiles:trial.profiles,combinedReference:trial.baseline,roleTop:roleTop(ranked,hasEvidence,s.history),comparisons:hasEvidence?[0,.1,.2,.3].map(cap=>({cap,ranked:makeRows(s.history,cap)})):[],model:'Stage75 暫定20%上限・10軸試験採点（4既存＋6追加）。残り4軸は観察のみ。勝率の推定ではありません。'};
 }
 return {questions:B().questions,questionPool:POOL,byId:id=>byIdMap[id]||null,labelsFor,answerLabels,answerFactor:factor,session,safeSession,answer,back,compute,relevance,RESP:B().RESP,DOWN_PROFILES:B().DOWN_PROFILES,FOLLOWUP_ONLY_PROFILES:B().FOLLOWUP_ONLY_PROFILES,USER_DOWN_NOTES:B().USER_DOWN_NOTES,DOWN_SOURCES:B().DOWN_SOURCES,DOWN_GUIDE:B().DOWN_GUIDE,CARD_DOWN_PROFILES:B().CARD_DOWN_PROFILES,PIERCE_CARD_DOWN_PROFILES:B().PIERCE_CARD_DOWN_PROFILES,ASSUMED_CARD_DOWN_MIN_COMPAT:B().ASSUMED_CARD_DOWN_MIN_COMPAT,inferredCardDown:B().inferredCardDown,cardDownProfile:B().cardDownProfile,CARD_DOWN_GENERAL_SOURCES:B().CARD_DOWN_GENERAL_SOURCES, nextQuestionId, contextOf, makeRows, roleTop, VERSION,LENGTH};
});

/* #コンパス非公式ファンメイド診断 v8.9
 * Performance, visual, and personality are intentionally separate signals.
 * Hero profiles and weights are provisional user research, not official winrate measurements.
 */
(function(root,factory){const engine=factory();if(typeof module==='object'&&module.exports)module.exports=engine;root.COMPASS_ENGINE=engine})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const D=()=>typeof window!=='undefined'?window.COMPASS_DATA:globalThis.COMPASS_DATA;
 const A=['yes','no','neutral','unknown'];
 function hash(seed,n){let a=((seed>>>0)^(n*2654435761))>>>0;a^=a>>>16;a=Math.imul(a,0x7feb352d);a^=a>>>15;a=Math.imul(a,0x846ca68b);a^=a>>>16;return (a>>>0)/4294967296}
 function h2(n){return String(n).padStart(3,'0')}
 function byId(id){const d=D();return id.startsWith('P')?d.personalityQuestions.find(q=>q.id===id):id.startsWith('Q')?d.generalQuestions.find(q=>q.id===id):id.startsWith('S')?d.heroes[Number(id.slice(1))-1]:null}
 function session(seed){const s={seed:Math.floor(seed||Date.now())>>>0,history:[],questionId:null,createdAt:new Date().toISOString()};s.questionId=choose(s);return s}
 function safeSession(s){return s&&Number.isInteger(s.seed)&&Array.isArray(s.history)&&s.history.length<=30&&s.history.every(x=>typeof x.id==='string'&&A.includes(x.answer))&&(typeof s.questionId==='string'||(s.questionId===null&&s.history.length===30));}
 function personMatch(hero,q){const t=(hero.personality||{})[q.axis_id]||0;return q.yes_pole==='A'?t:-t}
 function generalMatch(hero,q){
  const w=q.signals||{};let total=0,found=0;
  for(const [f,weight] of Object.entries(w)){
    if(!Number.isFinite(weight)||weight<=0)continue;
    total+=weight;
    // Missing card research = unknown, NOT evidence that a hero cannot use that card.
    // A confirmed non-adoption can explicitly be 0.0, distinct from missing.
    const v=f.startsWith('tradeoff_')?
      (Object.prototype.hasOwnProperty.call(hero.combatTradeoffs||{},'damageOverDurability')?hero.combatTradeoffs.damageOverDurability:1.3):
      f.startsWith('deck_')?
      (Object.prototype.hasOwnProperty.call(hero.cardTraits||{},f)?hero.cardTraits[f]:1.3):
      f.startsWith('ability_')?
      (Object.prototype.hasOwnProperty.call(hero.abilityTraits||{},f)?hero.abilityTraits[f]:1.3):
      (hero.traits[f]||0);
    found+=weight*Math.min(1.25,v/3.5);
  }
  return total?Math.min(1.25,found/total):.15;
 }
 function visualMatch(hero,q){const w=q.signals||{},t=hero.visualTraits||{};let total=0,found=0;for(const [k,v] of Object.entries(w)){total+=v;found+=v*Math.min(1,(t[k]||0)/3.5)}return total?found/total:0}
 function specialInfo(s){const d=D(),excluded=new Set(),answers={};for(const a of s.history){const q=byId(a.id);if(q?.special){answers[q.special]=a.answer;if(a.answer==='no')for(const n of d.specialRules[q.special].excludeOnNo)excluded.add(n)}}return {excluded,answers}}
 function compute(s){
  const d=D(),{excluded,answers}=specialInfo(s);const perf=[],visual=[];
  for(const hero of d.heroes){let performance=0,appearance=0,personality=0,confirmation=0,perfAnswered=0,visualAnswered=0;
   for(const a of s.history){if(a.answer==='unknown'||a.answer==='neutral')continue;const yes=a.answer==='yes';
    if(a.id.startsWith('P')){
     // Do NOT map character personality or user's self-description into appearance or gameplay.
     personality+=personMatch(hero,byId(a.id))*.34*(yes?1:-.58);
    }else if(a.id.startsWith('Q')){
     const q=byId(a.id);if(!q)continue;
     if(q.category==='V'){
      const m=visualMatch(hero,q);
      appearance+=(yes?1.28:-1.05)*m;
      visualAnswered++;
     }else if(q.category==='J'){
      // Narrative / personality-related question: no automatic appearance/gameplay link.
      continue;
     }else if(q.special){
      const targets=d.specialRules[q.special].boostOnYes;
      if(targets.includes(hero.id))performance+=yes?(q.special==='buff'?.35:1.25):(q.special==='buff'?-.25:0);
      perfAnswered++;
     }else{
      const m=generalMatch(hero,q);
      performance+=(q.cardFocus?1.14:1)*(yes?1.5*(m-.29):1.65*(.22-m));
      perfAnswered++;
     }
    }else if(a.id.startsWith('S')){
     const sid=Number(a.id.slice(1));
     // Only a genuinely gameplay-only confirmation question may affect performance.
     // Most S questions mix design, character and combat, so they cannot be used to silently alter either ranking.
     const axis=hero.specificAxis;
     if(sid===hero.id && axis==='戦闘') {const v=yes?.55:-.45;performance+=v;confirmation+=v;}
    }
   }
   const row={hero,score:Math.round(performance*1000)/1000,appearance:Math.round(appearance*1000)/1000,personality,confirmation,perfAnswered,visualAnswered,excluded:excluded.has(hero.id)};
   if(!excluded.has(hero.id))perf.push(row);
   // Explicit card aversions exclude gameplay recommendations, not visual preferences.
   visual.push({...row,score:row.appearance,visualEvidenceReady:Object.keys(hero.visualTraits||{}).length>0});
  }
  perf.sort((a,b)=>b.score-a.score||a.hero.id-b.hero.id);
  visual.sort((a,b)=>Number(b.visualEvidenceReady)-Number(a.visualEvidenceReady)||b.score-a.score||Object.keys(b.hero.visualTraits||{}).length-Object.keys(a.hero.visualTraits||{}).length||a.hero.id-b.hero.id);
  return {ranked:perf,rankedPerformance:perf,rankedAppearance:visual,visualUnverified:visual.filter(x=>!x.visualEvidenceReady).map(x=>x.hero.id),excluded:[...excluded],specialAnswers:answers};
 }
 function personalityOrder(seed){const d=D();return d.axes.map((ax,i)=>{const list=d.personalityQuestions.filter(q=>q.axis_id===ax.id);return list[Math.floor(hash(seed,i+123)*list.length)].id})}
 function dissimilarity(q1,q2){if(!q1?.signals||!q2?.signals)return 0;return Object.entries(q1.signals).reduce((s,[k,v])=>s+(q2.signals[k]?Math.min(v,q2.signals[k]):0),0)}
 // Questions with no matching, verified hero traits cannot separate visual candidates.
 // Keep their approved text in the pool, but do not show them until the research is filled in.
 function supportedVisualQuestion(q){return q.category==='V' && D().heroes.some(h=>
  Object.keys(h.visualTraits||{}).length && Object.keys(q.signals||{}).some(k=>(h.visualTraits[k]||0)>0));}
 const visualSlots=new Set([12,15,18,21,24,27]); // questions 13, 16, 19, 22, 25, 28
 function choose(s){
  const d=D(),count=s.history.length;if(count>=30)return null;
  if(count<10)return personalityOrder(s.seed)[count];
  const used=new Set(s.history.map(x=>x.id)), out=compute(s);
  if(count===29){
   // Final question is based only on provisional gameplay ranking.
   // Avoid a dominant hero's self-affirming question in a near-tie.
   const rank=out.rankedPerformance;
   const target=(rank[1] && rank[0].score-rank[1].score<1.65)?rank[1]:rank[0];
   return `S${h2(target?.hero.id||1)}`;
  }
  const visualStage=visualSlots.has(count);
  // Q18 is a common, high-value offensive-vs-survival choice (not a hero-specific confirmation).
  // It replaces an arbitrary defensive question slot; the 30Q / 13 gameplay / 6 visual layout is unchanged.
  if(count===17&&!used.has('Q452'))return 'Q452';
  // Quality gate: when candidate gameplay profiles disagree sharply about
  // stun -> portal capture, ask the concrete objective question instead of
  // relying on a vague "last-second comeback" item. No hero is singled out.
  // Ask what the HS actually does only when the ability-specific evidence can
  // distinguish top candidates. Unverified ability data is treated as unknown.
  if(!visualStage && count===23 && !used.has('Q250')){
   const key=d.generalQuestions.find(q=>q.id==='Q250'&&!q.inactive);
   const top=out.rankedPerformance.slice(0,7);
   if(key&&top.length>=5){
    const vals=top.map(x=>generalMatch(x.hero,key));
    if(Math.max(...vals)>=.95 && Math.min(...vals)<=.52 && top[0].score-top[4].score<3.2)return key.id;
   }
  }
  if(!visualStage && count===20 && !used.has('Q451')){
   const key=d.generalQuestions.find(q=>q.id==='Q451'&&!q.inactive);
   const top=out.rankedPerformance.slice(0,7);
   if(key && top.length>=5){
    const vals=top.map(x=>generalMatch(x.hero,key));
    if(Math.max(...vals)>=.95 && Math.min(...vals)<=.55 && top[0].score-top[4].score<3.2)return key.id;
   }
  }
  if(!visualStage && (count===22 || count===26)){
   const candidates=d.generalQuestions.filter(q=>q.cardFocus&&!q.inactive&&!used.has(q.id));
   const top=out.rankedPerformance.slice(0,13),prevCard=s.history.map(x=>byId(x.id)).filter(q=>q?.cardFocus);
   let best=null,bestV=-Infinity,bestVariance=0;
   for(const q of candidates){
    const vals=top.map(x=>generalMatch(x.hero,q));
    const mu=vals.reduce((a,b)=>a+b,0)/(vals.length||1);
    const variance=vals.reduce((a,b)=>a+(b-mu)**2,0)/(vals.length||1);
    const redundancy=prevCard.reduce((v,p)=>Math.max(v,dissimilarity(p,q)),0);
    const value=variance*4-redundancy*.5+hash(s.seed,count*1511+Number(q.id.slice(1)))*.05;
    if(value>bestV){best=q;bestV=value;bestVariance=variance}
   }
   if(best && bestVariance>.018)return best.id;
  }
  if(!visualStage&&count>=18&&count<=28){
   const top=out.rankedPerformance.slice(0,9).map(x=>x.hero.id);
   for(const type of ['trap','door','buff']){
    const rule=d.specialRules[type],q=d.generalQuestions.find(x=>x.special===type);
    const relevant=type==='buff'?rule.boostOnYes:rule.excludeOnNo;
    if(q&&!used.has(q.id)&&top.some(id=>relevant.includes(id))){
     const closest=Math.min(...out.rankedPerformance.filter(x=>relevant.includes(x.hero.id)).map(x=>out.rankedPerformance.indexOf(x)));
     if(type==='buff'?(closest<=2&&count>=21):(closest<=4||count>=24))return q.id;
    }
   }
  }
  const prev=s.history.filter(a=>a.id.startsWith('Q')).map(a=>byId(a.id)).filter(Boolean);
  const seenCategory=visualStage?'V':null;
  const perfQuestions=prev.filter(q=>q.category!=='V'&&q.category!=='J'&&!q.special);
  const categorySequence=['P','A','R','M','T','D','C','X','K','H'];
  const cat=visualStage?'V':perfQuestions.length<categorySequence.length?categorySequence[perfQuestions.length]:null;
  let pool=d.generalQuestions.filter(q=>!q.inactive&&!q.special&&!used.has(q.id)&&q.category!=='J'&&(visualStage?supportedVisualQuestion(q):q.category!=='V')&&(!cat||q.category===cat));
  if(!pool.length)pool=d.generalQuestions.filter(q=>!q.inactive&&!q.special&&!used.has(q.id)&&(visualStage?supportedVisualQuestion(q):q.category!=='V'&&q.category!=='J'));
  const considered=(visualStage?out.rankedAppearance:out.rankedPerformance).slice(0,visualStage?18:count<20?26:Math.max(9,22-(count-20)*2));
  const topScore=considered[0]?.score||0;
  const temp=visualStage?2.4:Math.max(1.35,2.8-(count-10)*.067);
  const weights=considered.map(x=>Math.exp(Math.max(-20,(x.score-topScore)/temp)));
  const ws=weights.reduce((a,b)=>a+b,0)||1;
  const previous=prev.filter(q=>q.category===(visualStage?'V':q.category)&&!q.special);
  let best=null,value=-Infinity;
  for(const q of pool){
   const vals=considered.map(x=>visualStage?visualMatch(x.hero,q):generalMatch(x.hero,q));
   const mu=vals.reduce((a,v,i)=>a+v*weights[i],0)/ws;
   const variance=vals.reduce((a,v,i)=>a+weights[i]*(v-mu)**2,0)/ws;
   const related=prev.filter(x=>visualStage?x.category==='V':x.category!=='V'&&x.category!=='J').reduce((v,x)=>Math.max(v,dissimilarity(x,q)),0);
   const categoryRepeats=prev.filter(x=>x.category===q.category).length;
   const random=hash(s.seed,count*1009+Number(q.id.slice(1)))*.14;
   const high=vals.filter(v=>v>.67).length,low=vals.filter(v=>v<.2).length;
   const v=variance*3.5+(high&&low?.18:0)+mu*.11-related*.34-categoryRepeats*.05+random;
   if(v>value){best=q;value=v}
  }
  return best?.id||null;
 }
 function answer(s,value){if(!A.includes(value))throw Error('不正な回答');if(!s.questionId)throw Error('質問がありません');const next={...s,history:[...s.history,{id:s.questionId,answer:value}]};next.questionId=choose(next);return next}
 function back(s){if(!s.history.length)return s;const next={...s,history:s.history.slice(0,-1)};next.questionId=s.history[s.history.length-1].id;return next}
 function retest(s){return session((s.seed+0x9e3779b9)>>>0)}
 function explain(s,hero,mode='performance'){
  const items=s.history.filter(a=>a.answer==='yes'&&a.id.startsWith('Q')).map(a=>{
   const q=byId(a.id);if(!q||q.special)return null;
   if(mode==='appearance'&&q.category!=='V'||mode!=='appearance'&&(q.category==='V'||q.category==='J'))return null;
   return {q,match:mode==='appearance'?visualMatch(hero,q):generalMatch(hero,q)};
  }).filter(x=>x&&x.match>.57).sort((a,b)=>b.match-a.match);
  const chosen=[],cats=new Set();for(const x of items){const key=mode==='appearance'?Object.keys(x.q.signals||{})[0]:x.q.category;if(cats.has(key))continue;chosen.push(x.q.question);cats.add(key);if(chosen.length>=3)break}return chosen;
 }
 // Number of usable answers per independent track; neutral and unknown are never evidence.
 function answerCoverage(s){
  let performance=0,appearance=0,personality=0;
  for(const a of s.history){
   if(a.answer!=='yes'&&a.answer!=='no')continue;
   if(a.id.startsWith('P')){personality++;continue}
   if(!a.id.startsWith('Q'))continue;
   const q=byId(a.id);if(!q)continue;
   if(q.category==='V')appearance++;
   else if(q.category!=='J')performance++;
  }
  return {performance,appearance,personality};
 }
 // Give reasons using both yes and no answers. Compare each candidate's per-question
 // contribution with OTHER eligible candidates, rather than simply quoting every yes.
 // This does not affect ranking, weights, question order or hero data.
 function explainEvidence(s,hero,mode='performance',limit=3){
  const appearance=mode==='appearance',d=D();
  const {excluded}=specialInfo(s);
  const peers=d.heroes.filter(h=>h.id!==hero.id && (appearance?
   Object.keys(h.visualTraits||{}).length>0:!excluded.has(h.id)));
  const items=[];
  for(const a of s.history){
   if(a.answer!=='yes'&&a.answer!=='no')continue;
   if(a.id.startsWith('S')&& !appearance && Number(a.id.slice(1))===hero.id && hero.specificAxis==='戦闘'){
    if(a.answer==='yes')items.push({text:'最後の専用質問に「はい」：戦闘面の最終確認が少し加点されました。',strength:.3,key:'S'});
    continue;
   }
   if(!a.id.startsWith('Q'))continue;
   const q=byId(a.id);if(!q || q.inactive || (q.category==='V')!==appearance || q.category==='J')continue;
   if(q.special){
    if(!appearance && a.answer==='yes' && d.specialRules[q.special]?.boostOnYes.includes(hero.id)){
     items.push({text:`「${q.question}」に「はい」：このカードの採用候補として加点されています。`,strength:.55,key:q.special});
    }
    continue;
   }
   const match=appearance?visualMatch(hero,q):generalMatch(hero,q);
   const avg=peers.length?peers.reduce((sum,h)=>sum+(appearance?visualMatch(h,q):generalMatch(h,q)),0)/peers.length:0;
   const advantage=(a.answer==='yes'?match-avg:avg-match);
   // A positive difference is a reason for the hero's relative rank.
   if(advantage<=.07)continue;
   const track=appearance?'外見の登録特徴':'登録された戦闘・カード適性';
   const desc=a.answer==='yes'?
    `「${q.question}」に「はい」：${track}との一致が他候補より強めです。`:
    `「${q.question}」に「いいえ」：${track}では、避けたい要素が他候補より少なめです。`;
   const key=Object.keys(q.signals||{}).sort().join(',')||q.category;
   items.push({text:desc,strength:advantage*(q.cardFocus?1.14:1),key});
  }
  items.sort((a,b)=>b.strength-a.strength);
  const seen=new Set(),selected=[];
  for(const x of items){if(seen.has(x.key))continue;selected.push(x.text);seen.add(x.key);if(selected.length===limit)break;}
  return selected;
 }
 function personalitySummary(s){const d=D();return s.history.filter(a=>a.id.startsWith('P')&&a.answer!=='neutral'&&a.answer!=='unknown').map(a=>{
  const q=byId(a.id),axis=d.axes.find(x=>x.id===q?.axis_id);if(!q||!axis)return null;
  const selectedA=(a.answer==='yes')===(q.yes_pole==='A');
  return {axis:axis.label,tendency:selectedA?axis.pole_A:axis.pole_B,question:q.question};
 }).filter(Boolean).slice(0,4)}
 return {A,session,safeSession,compute,choose,answer,back,retest,byId,generalMatch,visualMatch,personMatch,explain,personalityOrder,personalitySummary,answerCoverage,explainEvidence,supportedVisualQuestion};
});

/* v9.10.6 HA/HS research lab (isolated). Does NOT mutate COMPASS_PRACTICAL scoring or the main 30-question result. */
(function(root,factory){const api=factory(); if(typeof module==='object'&&module.exports)module.exports=api; root.COMPASS_HA_HS_LAB=api;})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const RES=()=>typeof window!=='undefined'?window.COMPASS_HA_HS_RESEARCH:globalThis.COMPASS_HA_HS_RESEARCH;
 const AUDIT=()=>typeof window!=='undefined'?window.COMPASS_HA_HS_SKILL_TAGS:globalThis.COMPASS_HA_HS_SKILL_TAGS;
 const QUESTIONS=[
  {id:'EXP_HA01',title:'タメ・段階調整があるHAで、相手の動きに合わせて当てる操作を安定してできる？',tag:'ha-charge',note:'HAのタメ攻撃を狙って当てる技術を確認。ロックオン型や設置位置を重視するHAにはこの点数を付けない。'},
  {id:'EXP_HS01',title:'敵にスタン・凍結・サイレント・吹き飛ばし・弱体化などを与えるHSを、味方と連携できるタイミングで使える？',tag:'hs-control',note:'自己強化HSと、発動後の攻撃に状態異常を付けるHSは対象外。単純なスタンカード使用とは別。'}
 ];
 const ANSWERS={yes:'安定してできる',sometimes:'ある程度できる',no:'苦手・できない',unknown:'未経験・判断できない'};
 // No bonus just for owning a powerful HA/HS. Only provisional category plus matching experimental answer.
 // Scores are deliberately bounded so the lab cannot become an apparent true win-rate predictor.
 const FACTOR={yes:0.55,sometimes:0.15,no:-0.75,unknown:0};
 function tagFor(heroId){const r=RES()?.heroes?.[heroId-1];return r&&r.id===heroId?r:null;}
 function skillAudit(heroId,questionId){const a=AUDIT()?.heroes?.[heroId-1]; if(!a||a.id!==heroId)return null;return questionId==='EXP_HA01'?a.ha:questionId==='EXP_HS01'?a.hs:null;}
 function eligible(r,q){if(!r)return false;return skillAudit(r.id,q.id)?.status==='match';}
 function compute(base,answers={}){
  if(!base||!Array.isArray(base.ranked)||base.ranked.length!==104)throw Error('30問の既存結果が必要');
  const ranked=base.ranked.map(row=>{
   const r=tagFor(row.hero.id);let delta=0;const evidence=[];
   for(const q of QUESTIONS){const choice=answers[q.id]??'unknown';if(!Object.hasOwn(ANSWERS,choice))throw Error('不正な研究回答');if(!eligible(r,q)||choice==='unknown')continue;
    const value=FACTOR[choice];delta+=value;if(value)evidence.push({id:q.id,delta:value});
   }
   delta=Math.round(delta*100)/100;
   const score=Math.round(Math.max(0,Math.min(99,row.score+delta))*10)/10;
   return {...row,score,betaDelta:delta,baseScore:row.score,betaEvidence:evidence};
  }).sort((a,b)=>b.score-a.score||b.coverage-a.coverage||a.hero.id-b.hero.id);
  return {ranked,oldTop5:base.ranked.slice(0,5).map(x=>x.hero.id),newTop5:ranked.slice(0,5).map(x=>x.hero.id),answers};
 }
 return {questions:QUESTIONS,answers:ANSWERS,compute,tagFor,skillAudit,eligible,FACTOR};
});

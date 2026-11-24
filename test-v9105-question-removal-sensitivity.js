'use strict';
global.window=global; require('./data.js');const P=require('./practical.js');const fs=require('node:fs');
const ids=['P04','D02'],rows=P.questions.filter(q=>ids.includes(q.id));const weights=rows.map(q=>q.weight);
function out(s){return P.compute(s).ranked.map(r=>r.hero.id);}
function change(s){const old=out(s);rows.forEach(q=>q.weight=0);const newer=out(s);rows.forEach((q,i)=>q.weight=weights[i]);return {old,newer};}
function impact(s){const {old,newer}=change(s);return {top1changed:old[0]!==newer[0],top5sameOrder:old.slice(0,5).every((x,i)=>x===newer[i]),top5intersection:old.slice(0,5).filter(x=>newer.slice(0,5).includes(x)).length,old:old.slice(0,5),new:newer.slice(0,5)};}
const fixture=require('./FRIEND_30_ANSWERS_REFERENCE.json');let f=P.session();for(const a of fixture.answers)f=P.answer(f,a);
const friend=impact(f);
let n=1000,top1changed=0,top5sameOrder=0,intersection=0;
for(let i=0;i<n;i++){
 let s=P.session(),seed=(i+1)*132217+23;
 for(let j=0;j<P.questions.length;j++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;s=P.answer(s,['yes','sometimes','no','unknown'][(seed>>>10)%4]);}
 const x=impact(s);top1changed+=Number(x.top1changed);top5sameOrder+=Number(x.top5sameOrder);intersection+=x.top5intersection;
}
let data={caution:'Synthetic, uniformly sampled answer patterns. Sensitivity of current scoring only; NOT user accuracy or redundancy evidence.',removedIds:ids,friend,randomSessions:n,top1ChangedCount:top1changed,top5SameOrderCount:top5sameOrder,meanTop5Intersection:Math.round(intersection/n*100)/100};
fs.writeFileSync('/mnt/data/compass_ha_hs_stage5_20261124/removal_sensitivity_v9105.json',JSON.stringify(data,null,2));
console.log(JSON.stringify(data,null,2));

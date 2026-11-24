'use strict';
const assert=require('node:assert/strict');global.window=global;
require('./data.js');const P=require('./practical.js');require('./ha-hs-research.js');require('./ha-hs-reviewed-tags.js');const LAB=require('./ha-hs-lab.js');
const fx=require('./FRIEND_30_ANSWERS_REFERENCE.json');
const audited=global.COMPASS_HA_HS_SKILL_TAGS.heroes;
assert.equal(audited.length,104);assert.equal(P.questions.length,30);assert.equal(LAB.questions.length,2);
const HA=LAB.questions[0],HS=LAB.questions[1];
const count=(q)=>audited.filter(h=>LAB.eligible(LAB.tagFor(h.id),q)).length;
assert.equal(count(HA),15);assert.equal(count(HS),14);
for(const [id,q,tag] of [[30,HA,'lockOn'],[85,HA,'placementTiming'],[11,HS,'buffWindowHS'],[89,HS,'statusOnAttackHS'],[43,HS,'summonControlHS'],[70,HS,'damageOverTimeHS'],[76,HS,'debuffVisionHS']]){
 assert.equal(LAB.eligible(LAB.tagFor(id),q),false,'excluded '+id);
 assert.equal(LAB.skillAudit(id,q.id).tag,tag);
}
let s=P.session();for(const a of fx.answers)s=P.answer(s,a);const base=P.compute(s);
assert.deepEqual(base.ranked.slice(0,5).map(r=>r.hero.id),fx.expectedBaselineTop5);
const unchanged=LAB.compute(base,{EXP_HA01:'unknown',EXP_HS01:'unknown'});
assert.deepEqual(unchanged.newTop5,base.ranked.slice(0,5).map(r=>r.hero.id));
const applied=LAB.compute(base,{EXP_HA01:'yes',EXP_HS01:'yes'});
for(const row of applied.ranked){const orig=base.ranked.find(x=>x.hero.id===row.hero.id); assert(orig);assert(row.score>=0&&row.score<=99);if(row.betaDelta!==0){const eligibleAny=LAB.eligible(LAB.tagFor(row.hero.id),HA)||LAB.eligible(LAB.tagFor(row.hero.id),HS);assert(eligibleAny);}}
for(const id of [30,85,11,43,70,76,89]){const row=applied.ranked.find(r=>r.hero.id===id);assert.equal(row.betaDelta,0,'No bonus allowed for '+id);}
let seed=123;for(let k=0;k<600;k++){
 let s=P.session();for(let i=0;i<30;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;s=P.answer(s,['yes','sometimes','no','unknown'][(seed>>>14)&3]);}
 const original=P.compute(s);const answers={EXP_HA01:['yes','no','sometimes','unknown'][k%4],EXP_HS01:['no','yes','unknown','sometimes'][(k>>2)%4]};
 const experiment=LAB.compute(original,answers);assert.equal(experiment.ranked.length,104);
 assert.deepEqual(P.compute(s).ranked.slice(0,5).map(x=>x.hero.id),original.ranked.slice(0,5).map(x=>x.hero.id));
}
console.log('PASS v9.10.6: 104 heroes, HA matched 15, HS matched 14, 7 excluded/partial, 600 regression sessions; base 30Q unchanged');

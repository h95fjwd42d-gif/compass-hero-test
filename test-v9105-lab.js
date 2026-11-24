 'use strict';
const assert=require('node:assert/strict');
global.window=global; require('./data.js');
const P=require('./practical.js'),X=require('./ha-hs-lab.js');require('./ha-hs-research.js');require('./ha-hs-reviewed-tags.js');
const fx=require('./FRIEND_30_ANSWERS_REFERENCE.json');
assert.equal(P.questions.length,30);assert.equal(X.questions.length,2);
assert.equal(global.COMPASS_HA_HS_RESEARCH.heroes.length,104);
assert.equal(new Set(global.COMPASS_HA_HS_RESEARCH.heroes.map(x=>x.id)).size,104);
let s=P.session();for(const ans of fx.answers){s=P.answer(s,ans);}const base=P.compute(s);
assert.equal(base.ranked.length,104);assert.deepEqual(base.ranked.slice(0,5).map(x=>x.hero.id),fx.expectedBaselineTop5);
const unknown=X.compute(base,{EXP_HA01:'unknown',EXP_HS01:'unknown'});
assert.deepEqual(unknown.newTop5,base.ranked.slice(0,5).map(x=>x.hero.id));
for(const item of unknown.ranked)assert.equal(item.score,base.ranked.find(x=>x.hero.id===item.hero.id).score);
const mixed=X.compute(base,{EXP_HA01:'yes',EXP_HS01:'no'});
for(const r of mixed.ranked){assert(Number.isFinite(r.score));assert(Math.abs(r.betaDelta)<=1.31);assert(r.score>=0&&r.score<=99);}
let countHa=0,countHs=0;
for(const h of global.COMPASS_DATA.heroes){const tag=X.tagFor(h.id);if(X.eligible(tag,X.questions[0]))countHa++;if(X.eligible(tag,X.questions[1]))countHs++;}
assert(countHa>0&&countHa<104);assert(countHs>0&&countHs<104);
// 800 randomized runs; compare old rankings unchanged and isolate beta scoring only.
for(let k=0;k<800;k++){
 let seed=k*91+7,session=P.session();
 for(let i=0;i<30;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;session=P.answer(session,['yes','sometimes','no','unknown'][(seed>>>13)%4]);}
 const before=P.compute(session);const after=X.compute(before,{EXP_HA01:k%3?'yes':'unknown',EXP_HS01:k%5?'no':'sometimes'});
 assert.equal(after.ranked.length,104);assert.deepEqual(P.compute(session).ranked.slice(0,5).map(x=>x.hero.id),before.ranked.slice(0,5).map(x=>x.hero.id));
}
console.log('PASS v9.10.5: original 30 questions + 104 heroes, friend baseline TOP5 identical, neutral beta unchanged; HA eligible',countHa,'HS eligible',countHs,'random 800 A/B sessions');

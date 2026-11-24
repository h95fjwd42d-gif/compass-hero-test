'use strict';
const assert=require('node:assert/strict');global.window=global;require('./data.js');const BASE=require('./practical.js');require('./ha-hs-reviewed-tags.js');const P=require('./practical-adaptive.js');
assert.equal(global.COMPASS_DATA.heroes.length,104);
assert.equal(BASE.questions.length,30);
assert.equal(P.questions.length,30);
assert(P.questionPool.length>=75,`not enough pool: ${P.questionPool.length}`);
assert.equal(new Set(P.questionPool.map(q=>q.id)).size,P.questionPool.length);
function simulate(label,fn,seed=1234){let s={...P.session(),seed};let seen=[];while(s.questionId){assert(P.safeSession(s),label+' session validity');const q=P.byId(s.questionId);assert(q,'unknown question '+s.questionId);let ans=fn(q,seen,s);assert(['yes','sometimes','no','unknown'].includes(ans),label+' bad answer');seen.push([q.id,ans]);const t=P.answer(s,ans);assert.equal(t.history.length,s.history.length+1);s=t;if(seen.length>30)throw Error('infinite loop '+label);}
 assert.equal(seen.length,30,label+' length');assert.equal(new Set(seen.map(x=>x[0])).size,30,label+' uniqueness');assert(P.safeSession(s));const result=P.compute(s);assert.equal(result.ranked.length,104);for(const r of result.ranked)assert(r.score>=0&&r.score<=99);return {s,seen,result};}
const allUnknown=simulate('all unknown',()=> 'unknown',11);assert.equal(allUnknown.result.ready,false);
const casual=simulate('casual',q=>q.id==='EX00'?'unknown':q.id==='EX01'?'unknown':q.mode==='preference'?'yes':'unknown',202);assert(casual.seen.filter(([id])=>id.startsWith('AO')).length>=4,JSON.stringify(casual.seen.map(x=>x[0])));assert(casual.result.casual);
const single=simulate('single user',q=>q.id==='EX00'?'sometimes':q.id==='EX01'?'no':q.id==='R03'?'yes':q.id.startsWith('R')?'unknown':['yes','sometimes','unknown'][q.id.length%3],211);assert(single.result.singleHero);
const multi=simulate('multi role',q=>q.id==='EX00'?'yes':q.id==='EX01'?'yes':q.id.startsWith('R')?'yes':q.mode==='usage'?'sometimes':'yes',311);assert(multi.result.multiRole);
const one=simulate('sniper',q=>q.id==='EX00'?'yes':q.id==='EX01'?'sometimes':q.id==='R03'?'yes':q.id.startsWith('R')?'unknown':q.bucket==='mechanic'?'yes':'sometimes',123);
const two=simulate('objective',q=>q.id==='EX00'?'yes':q.id==='EX01'?'sometimes':q.id==='R01'?'yes':q.id.startsWith('R')?'unknown':q.bucket==='objective'||q.bucket==='team'?'yes':'sometimes',123);
assert.notDeepEqual(one.seen.map(x=>x[0]),two.seen.map(x=>x[0]),'adaptive routes must differ after different answers');
assert.equal(P.relevance(global.COMPASS_DATA.heroes[29],P.byId('AH01')),0,'lock-on HA not charge');
assert.equal(P.relevance(global.COMPASS_DATA.heroes[10],P.byId('AS01')),0,'Sol buff HS not control');
assert.equal(P.relevance(global.COMPASS_DATA.heroes[88],P.byId('AS01')),0,'Killua HS not direct control');
assert(P.relevance(global.COMPASS_DATA.heroes[29],P.byId('AH02'))>0);
let before=multi.s;let back=P.back(before);assert.equal(back.history.length,29);let restored=P.answer(back,before.history[29].answer);assert.deepEqual(restored.history,before.history);
let changes=0,examples=[];let state=0xdecafbad;const rand=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/2**32;};
for(let i=0;i<250;i++){
 let pattern=i%5;const a=simulate('simulation '+i,q=>q.id==='EX00'?(pattern===0?'unknown':pattern===1?'no':pattern===2?'sometimes':'yes'):q.id==='EX01'?(pattern===3?'no':pattern===4?'yes':'sometimes'):['yes','sometimes','no','unknown'][Math.floor(rand()*4)],i+201);
 let set=a.seen.map(v=>v[0]);if(!examples.length||!examples.some(x=>x.join('|')===set.join('|')))examples.push(set);
 if(a.result.ready)changes++;
}
console.log(JSON.stringify({pass:true,pool:P.questionPool.length,legacyQ:BASE.questions.length,adaptiveQuestions:P.LENGTH,readyInSim:changes,casualPreferenceQuestions:casual.seen.filter(v=>v[0].startsWith('AO')).length,exampleRoutes:examples.slice(0,3).map(x=>x.join(',')),sniperTop5:one.result.ranked.slice(0,5).map(x=>x.hero.name),objectiveTop5:two.result.ranked.slice(0,5).map(x=>x.hero.name)},null,2));

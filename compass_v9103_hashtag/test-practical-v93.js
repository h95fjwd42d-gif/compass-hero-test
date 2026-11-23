'use strict';
const assert=require('node:assert/strict'),fs=require('fs');
global.window=global;require('./data.js');
const D=global.COMPASS_DATA,P=require('./practical.js'),E=require('./core.js');
assert.equal(D.heroes.length,104);
assert.equal(P.questions.length,30);
assert.equal(new Set(P.questions.map(q=>q.id)).size,30);
assert.equal(P.questions[26].id,'D03');
assert.match(P.questions[26].question,/近距離・周囲/);
const d03=P.questions[26];
const categories={near:0,area:0,both:0,pierce:0,none:0};
const profiles=D.heroes.map(h=>({h,p:P.cardDownProfile(h)}));
for(const {h,p} of profiles){
 assert.deepEqual(P.cardDownProfile(h), P.CARD_DOWN_PROFILES[h.id]||null);
 if(!p){categories.none++;assert.equal(P.relevance(h,d03),0);continue;}
 assert(p.score>0&&p.score<=1);
 if(p.near&&p.area)categories.both++;
 else if(p.near)categories.near++;
 else if(p.area)categories.area++;
 else categories.pierce++;
 assert.equal(P.relevance(h,d03),p.score);
 assert.equal(p.score,Math.max(p.researchScore,p.assumedScore),'should not double count two types');
 if(p.assumption) assert(/仮定|実験仮説/.test(p.basis));
}
assert.deepEqual(categories,{near:32,area:16,both:15,pierce:4,none:37});
assert.equal(Object.keys(P.PIERCE_CARD_DOWN_PROFILES).length,15);
assert.equal(Object.keys(P.CARD_DOWN_PROFILES).length,67);
for(const id of [5,9,21,31,90,102]){const p=P.cardDownProfile(D.heroes[id-1]);assert(p.near&&!p.area,`near-only ${id}`);}
for(const id of [13,25,29,62,100,103]){const p=P.cardDownProfile(D.heroes[id-1]);assert(p.area&&!p.near,`area-only ${id}`);}
for(const id of [1,17,26,44,49,83]){const p=P.cardDownProfile(D.heroes[id-1]);assert(p.area&&p.near,`both ${id}`);}
for(const id of [38,60,86,99]){const p=P.cardDownProfile(D.heroes[id-1]);assert(p.researchPierce&&!p.assumption,`previous piercing should remain ${id}`);}
for(const id of [2,3,4,23,40,42,78]){const h=D.heroes[id-1];assert.equal(P.relevance(h,d03),0,`unsupported ${id}`);}
assert.equal(P.relevance(D.heroes[99],d03)>.8,true,'Reze: area cards enable assumed down even though piercing was not the main route');
assert(P.cardDownProfile(D.heroes[40]).assumedScore<.8,'Hinata rare near case is weaker than main near adopters');
assert.equal(D.heroes[84].specificQuestion,'惑星破壊レベルの高火力でワンパンしたい？');
assert.deepEqual(D.specialRules.trap.excludeOnNo,[14,61]);
assert.deepEqual(D.specialRules.door.excludeOnNo,[2,16,29,36,48,103]);
assert.equal(D.generalQuestions.length,452);
const qids=['D01','D02'];for(const id of qids)assert(P.questions.some(q=>q.id===id));
function session(fn){let s=P.session();while(s.questionId)s=P.answer(s,fn(P.questions[s.history.length]));return s;}
const answers=['yes','no','sometimes','unknown'];
const score=(s,id)=>P.compute(s).ranked.find(x=>x.hero.id===id).score;
for(const id of [5,13,1,38,100,102]){
 const yes=session(q=>q.id==='D03'?'yes':'unknown');
 const no=session(q=>q.id==='D03'?'no':'unknown');
 assert(score(yes,id)>score(no,id)+3,`D03 should make a difference for hero ${id}`);
}
const yes=session(q=>q.id==='D03'?'yes':'unknown');
const no=session(q=>q.id==='D03'?'no':'unknown');
for(const id of [2,23,40,42])assert.equal(score(yes,id),score(no,id));
assert.equal(P.compute(session(()=>'unknown')).ready,false);
assert.equal(P.compute(session(()=>'yes')).ready,true);
let rng=21;
for(let i=0;i<900;i++){
 let s=session(()=>{rng=(rng*1664525+1013904223)>>>0;return answers[rng%4]});
 assert(P.safeSession(s));assert.equal(s.history.length,30);assert.equal(s.questionId,null);
 const outcome=P.compute(s);assert.equal(outcome.ranked.length,104);
 assert(outcome.ranked.every(x=>x.score>=0&&x.score<=99&&Number.isFinite(x.score)));
 assert.equal(P.back(s).history.length,29);
}
const classic=E.session(23);let s=classic;for(let i=0;i<30;i++)s=E.answer(s,'yes');assert(E.compute(s).rankedPerformance.length===104);
for(const file of ['CARD_PROFILES_104_REVIEW.txt','V92_CHANGES_WITH_REASONS.txt','images/hero-009.webp'])assert(fs.existsSync(file));
console.log('PASS v9.3: 67 card-down profiles (32 near-only,16 area-only,15 both,4 pierce-only), 37 unresearched, MAX avoids double count, 900 sessions, classic preserved');

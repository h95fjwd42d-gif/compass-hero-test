'use strict';
const assert=require('node:assert/strict');
global.window=global;require('./data.js');
const D=global.COMPASS_DATA,P=require('./practical.js'),E=require('./core.js');
assert.equal(D.heroes.length,104);
assert.equal(P.questions.length,30);
assert.equal(new Set(P.questions.map(q=>q.id)).size,30);
const counts=Object.fromEntries([...new Set(P.questions.map(q=>q.group))].map(k=>[k,P.questions.filter(q=>q.group===k).length]));
assert.equal(counts['ロール経験'],4);assert.equal(counts['ポータル・勝ち筋'],5);assert.equal(counts['戦闘操作・間合い'],7);assert.equal(counts['カード実技・所持'],10);assert.equal(counts['連携・立ち回り'],2);
assert.equal(P.questions.filter(q=>q.id.startsWith('D')).length,2);
for(const q of P.questions)assert(q.question.endsWith('？')&&Object.keys(q.signals).length);
const get=id=>P.questions.find(q=>q.id===id);
assert.match(get('D01').question,/転倒/);assert.match(get('D02').question,/ポータル確保/);
assert.match(P.DOWN_GUIDE,/スタン|ノックバック/);
for(const id of ['K01','K02','K03','K04','K05','K06','K07','K08','K11','K12','R01','R02','R03','R04'])assert(get(id),id);
for(const id of ['P03','P07','P08','F04','F06','K09','K10','K13','T03','T04','T05','T06'])assert(!get(id));
assert.deepEqual(D.specialRules.trap.excludeOnNo,[14,61]);assert.deepEqual(D.specialRules.door.excludeOnNo,[2,16,29,36,48,103]);
assert.equal(D.heroes[84].specificQuestion,'惑星破壊レベルの高火力でワンパンしたい？');
assert.equal(D.generalQuestions.length,452);assert.equal(D.personalityQuestions.length,100);assert.equal(D.heroes.length,104);
function make(fn){let s=P.session();while(s.questionId)s=P.answer(s,fn(P.questions[s.history.length],s.history.length));return s;}
let st=P.session();assert.equal(st.version,2);assert(P.safeSession(st));assert.equal(P.safeSession({...st,version:1}),false);
let next=P.answer(st,'yes');assert.equal(next.history.length,1);assert.equal(st.history.length,0);assert.deepEqual(P.back(next),st);
assert.throws(()=>P.answer(st,'bad'));
let allU=P.compute(make(()=> 'unknown'));assert.equal(allU.ready,false);assert.equal(allU.ranked.length,104);
let allN=P.compute(make(()=> 'no'));assert.equal(allN.ready,false);
assert.equal(P.compute(make(()=> 'yes')).ready,true);
assert(P.relevance(D.heroes[8],get('P04'))>P.relevance(D.heroes[7],get('P04')));
assert(P.relevance(D.heroes[13],get('K07'))>.85);assert(P.relevance(D.heroes[60],get('K07'))>.85);
assert(P.relevance(D.heroes[102],get('K08'))>.7);assert(P.relevance(D.heroes[10],get('K02'))>.7);
const downIds=Object.keys(P.DOWN_PROFILES).map(Number);
assert.equal(downIds.length,13);
for(const id of downIds){assert(P.relevance(D.heroes[id-1],get('D01'))>=.09,`${id}: D01 not viable`);assert(/^https:/.test(P.DOWN_SOURCES[id]),`${id}: no source`);}
for(const id of [23,49,59]){const h=D.heroes[id-1];assert(P.relevance(h,get('D01'))>.65,`${id} D01`);assert(P.relevance(h,get('D02'))>.65,`${id} D02`);}
// 'Not confirmed' must not turn into 'doesn't have this ability', and must not be automatically rewarded.
assert.equal(P.relevance(D.heroes[7],get('D01')),0);
assert.equal(P.relevance(D.heroes[7],get('D02')),0);
function getHeroScore(s,id){return P.compute(s).ranked.find(x=>x.hero.id===id).score;}
for(const id of [23,49,59]){
 const pos=make(q=>q.id==='D01'||q.id==='D02'?'yes':'unknown');
 const neg=make(q=>q.id==='D01'||q.id==='D02'?'no':'unknown');
 assert(getHeroScore(pos,id)>getHeroScore(neg,id)+7,`${id}: down makes no difference`);
 assert.equal(getHeroScore(pos,8),getHeroScore(neg,8),'no unsupported down signal');
}
const trapHigh=make(q=>q.id==='K07'?'yes':q.id==='K08'?'no':'unknown');
const trapLow=make(q=>q.id==='K07'?'no':q.id==='K08'?'no':'unknown');
assert(getHeroScore(trapHigh,14)>getHeroScore(trapLow,14)+7);
let rng=13;const rand=()=>{rng=(rng*1664525+1013904223)>>>0;return rng/4294967296;};
for(let i=0;i<600;i++){
 const s=make(()=>['yes','sometimes','no','unknown'][Math.floor(rand()*4)]);
 assert(P.safeSession(s));assert.equal(s.history.length,30);assert.equal(s.questionId,null);
 assert.equal(P.back(s).history.length,29);
 const out=P.compute(s);assert.equal(out.ranked.length,104);
 assert(out.ranked.every(x=>Number.isFinite(x.score)&&x.score>=0&&x.score<=99));
}
// Classic separate scoring and 30 questions remain unmodified.
let c=E.session(7);for(let i=0;i<30;i++)c=E.answer(c,'yes');
assert.equal(c.history.length,30);assert(E.compute(c).rankedPerformance.length>0);
console.log('PASS v9.1: 30Q, 104 heroes, 600 sessions, 13 down profiles/source metadata, knockdown contrast, unknown neutrality, session, original 30Q preserved');

'use strict';
const assert=require('node:assert/strict'); const fs=require('fs'); const crypto=require('crypto');
global.window=global;require('./data.js'); const D=global.COMPASS_DATA, P=require('./practical.js'),E=require('./core.js'),I=require('./question-intents.js');
assert.equal(D.heroes.length,104); assert.equal(P.questions.length,30);assert.equal(new Set(P.questions.map(x=>x.id)).size,30);
assert.equal(P.session().version,4);assert(!P.safeSession({...P.session(),version:3}));
for(const q of P.questions){const info=I.practical(q);assert.equal(info.id,q.id);assert(info.impact.includes(String(q.weight)));assert.deepEqual(Object.keys(q.signals).length,info.signals.length);}
for(const id of ['P04','P05','F07','F08'])assert.equal(P.questions.find(x=>x.id===id).responseMode,'style');
for(const id of ['K06','D01'])assert.equal(P.questions.find(x=>x.id===id).responseMode,'usage');
assert(!Object.keys(P.questions.find(q=>q.id==='P04').signals).some(x=>x.startsWith('card:')));
assert(!Object.keys(P.questions.find(q=>q.id==='F05').signals).some(x=>x.startsWith('card:')));
assert.deepEqual(Object.keys(P.questions.find(q=>q.id==='F08').signals).sort(), ['trait:aggressive','trait:burst','trait:melee']);
assert.equal(P.labelsFor(P.questions.find(q=>q.id==='P04')).yes,'よくある');
assert.equal(P.labelsFor(P.questions.find(q=>q.id==='K06')).unknown,'使ったことがない');
assert.equal(P.labelsFor(P.questions.find(q=>q.id==='K01')).yes,'安定してできる');
const sha=x=>crypto.createHash('sha256').update(fs.readFileSync(x)).digest('hex');
for(const file of ['data.json','data.js','core.js'])assert.equal(sha(file),sha('../compass_v97_intent_beta/'+file),file+' unchanged');
function filled(f){let ss=P.session();while(ss.questionId)ss=P.answer(ss,f(P.questions[ss.history.length]));assert(P.safeSession(ss));return ss;}
const score=(s,id)=>P.compute(s).ranked.find(x=>x.hero.id===id).score;
const unknown=filled(q=>'unknown');
assert.equal(P.compute(unknown).ready,false);
const k01=P.questions.find(q=>q.id==='K01');
const relHero=D.heroes.find(h=>P.relevance(h,k01)>.8);
assert(relHero);
// A demonstrated skill is not an endorsement of a near/area/stun-card hero.
for(const id of ['K01','K02','K03','K04','K05','K07','K08','K11','K12','D03']){
  const q=P.questions.find(x=>x.id===id);
  const s=filled(x=>x.id===id?'yes':'unknown');
  const p=P.compute(s);
  for(const h of D.heroes){assert.equal(score(s,h.id),score(unknown,h.id),id+' YES must not recommend '+h.name); const a=P.compute(s).ranked.find(x=>x.hero.id===h.id);const b=P.compute(unknown).ranked.find(x=>x.hero.id===h.id);assert.equal(a.coverage,b.coverage,id+' YES must not produce coverage tie-break '+h.name)}
}
for(const id of ['K01','K04','K05']){
 const q=P.questions.find(x=>x.id===id), hero=D.heroes.find(x=>P.relevance(x,q)>.76);
 const s=filled(x=>x.id===id?'no':'unknown');
 assert(score(s,hero.id)<score(unknown,hero.id),'NO may signal a modest barrier');
}
// Use-frequency question can give ONLY a small nudge, not a hard exclusion.
const k06Yes=filled(x=>x.id==='K06'?'yes':'unknown');
const k06No=filled(x=>x.id==='K06'?'no':'unknown');
assert(D.heroes.some(h=>score(k06Yes,h.id)>score(unknown,h.id)));
for(const h of D.heroes)assert(Math.abs(score(k06Yes,h.id)-score(unknown,h.id))<2,'stun use alone too influential '+h.name);
// Style NO is not incorrectly listed as a skill weakness.
const styleNo=filled(x=>x.responseMode==='style'?'no':'unknown');
assert(P.compute(styleNo).ranked.every(x=>x.weaknesses.every(w=>w.q.responseMode!=='style')));
const oldF08=['リュウ','ジョーカー','アダム＝ユーリエフ'];
for(const name of oldF08)assert((fs.readFileSync('V98_QUESTION_AND_SCORING_CHANGES.txt','utf8')).includes(name));
for(let i=0;i<700;i++){
 let seed=(i+1)*1013904223>>>0;
 const s=filled(()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return ['yes','sometimes','no','unknown'][seed%4];});
 const out=P.compute(s);assert.equal(out.ranked.length,104);assert(out.ranked.every(x=>Number.isFinite(x.score)&&x.score>=0&&x.score<=99));assert.equal(P.back(s).history.length,29);
}
let classic=E.session(219);while(classic.questionId)classic=E.answer(classic,'yes');assert.equal(classic.history.length,30);
assert.equal(E.compute(classic).rankedPerformance.length,104);
const html=fs.readFileSync('index.html','utf8'),app=fs.readFileSync('app.js','utf8');
assert(html.includes('question-intents.js'));assert(html.includes('practical-answer-guide'));assert(app.includes('P.labelsFor(q)'));assert(app.includes('compass_hero_finder_v98_practical'));assert(html.includes('v9.8'));
assert.equal(D.heroes[84].specificQuestion,'惑星破壊レベルの高火力でワンパンしたい？');
assert.deepEqual(D.specialRules.trap.excludeOnNo,[14,61]);
assert.deepEqual(D.specialRules.door.excludeOnNo,[2,16,29,36,48,103]);
console.log('PASS v9.8: 700 practical sessions, 30 questions, 104 unchanged, old card skill YES is NOT a character recommendation; style/usage and intent audited');

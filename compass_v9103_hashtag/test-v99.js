'use strict';
const assert=require('node:assert/strict');const fs=require('fs');const crypto=require('crypto');
global.window=global; require('./data.js');
const D=global.COMPASS_DATA,P=require('./practical.js'),E=require('./core.js'),I=require('./question-intents.js');
assert.equal(D.heroes.length,104);assert.equal(P.questions.length,30);assert.equal(new Set(P.questions.map(q=>q.id)).size,30);
assert.equal(P.session().version,6);assert(!P.safeSession({...P.session(),version:5}));
const find=id=>P.questions.find(q=>q.id===id);
const usage=['K06','K07','K08','K11','K12','D01'];
const style=['P02','P04','P05','F05','F07','F08','D02','T01','T02'];
const skill=['R01','R02','R03','R04','P01','P06','F01','F02','F03','K01','K02','K03','K04','K05','D03'];
for(const id of usage){assert.equal(find(id).responseMode,'usage',id);assert.equal(P.labelsFor(find(id)).yes,'よく使う');assert.equal(P.labelsFor(find(id)).unknown,'使ったことがない');}
for(const id of style){assert.equal(find(id).responseMode,'style',id);assert.equal(P.labelsFor(find(id)).yes,'よくある');}
for(const id of skill){assert.equal(find(id).responseMode,undefined,id);assert.equal(P.labelsFor(find(id)).yes,'安定してできる');}
assert.equal(usage.length+style.length+skill.length,30);
assert(find('K12').question.includes('普段のデッキに敵の防御力を下げるカード'));
assert.equal(find('D01').signals['down:opener'],1);
assert.equal(Object.keys(find('D01').signals).length,1);
assert(!find('K12').question.includes('つなげられる'));
assert(!Object.keys(find('D02').signals).some(k=>k.startsWith('down:')));
for(const q of P.questions){const info=I.practical(q);assert.equal(info.id,q.id);assert.deepEqual(Object.keys(q.signals).length,info.signals.length);assert(info.impact.includes(String(q.weight)));assert(info.purpose.length>10);}
const fill=f=>{let s=P.session();while(s.questionId){s=P.answer(s,f(P.questions[s.history.length]));}assert.equal(s.history.length,30);return s;};
const blank=fill(()=>'unknown');const blankScore=new Map(P.compute(blank).ranked.map(x=>[x.hero.id,x.score]));
function getResult(session,id){return P.compute(session).ranked.find(x=>x.hero.id===id);}
// Knowledge of the mechanic or imagining using the card does not recommend the associated hero.
for(const id of ['K01','K02','K03','K04','K05','D03']){
 const s=fill(q=>q.id===id?'yes':'unknown');
 for(const h of D.heroes){const row=getResult(s,h.id);assert.equal(row.score,blankScore.get(h.id),id+' must not provide YES recommendation '+h.name);assert.equal(row.coverage,getResult(blank,h.id).coverage);}
}
// For a true usage question, negative means low use not lack of ability, and positive is weak.
for(const id of usage){
 const sYes=fill(q=>q.id===id?'yes':'unknown'),sNo=fill(q=>q.id===id?'no':'unknown');
 assert(D.heroes.some(h=>getResult(sYes,h.id).score>blankScore.get(h.id)),id+' should nudge some profiles');
 for(const h of D.heroes){const yes=getResult(sYes,h.id),no=getResult(sNo,h.id);
  assert(Math.abs(yes.score-blankScore.get(h.id))<3,id+' usage only is too strong');
  assert(no.weaknesses.length===0,id+' NO must not be treated as unable to operate');
 }
}
// Preference questions do not create statements about personal mechanical weakness.
const styleNo=fill(q=>q.responseMode==='style'?'no':'unknown');
assert(P.compute(styleNo).ranked.every(r=>r.weaknesses.length===0));
let session=P.session();session=P.answer(session,'yes');assert(P.safeSession(session));assert.equal(P.back(session).history.length,0);
for(let i=0;i<700;i++){
 let seed=(i+1)*315733>>>0;
 const s=fill(()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return ['yes','sometimes','no','unknown'][(seed>>>9)%4]});
 const out=P.compute(s);assert.equal(out.ranked.length,104);assert(out.ranked.every(r=>Number.isFinite(r.score)&&r.score>=0&&r.score<=99));
 assert.equal(P.back(s).history.length,29);
}
let classic=E.session(219);while(classic.questionId)classic=E.answer(classic,'yes');assert.equal(classic.history.length,30);assert.equal(E.compute(classic).rankedPerformance.length,104);
const sha=x=>crypto.createHash('sha256').update(fs.readFileSync(x)).digest('hex');
for(const f of ['data.json','data.js','core.js']) assert.equal(sha(f),sha('../compass_v981_legacy_f08_salter/'+f),f+' unchanged');
assert.equal(D.heroes[84].specificQuestion,'惑星破壊レベルの高火力でワンパンしたい？');
assert.deepEqual(D.specialRules.trap.excludeOnNo,[14,61]);assert.deepEqual(D.specialRules.door.excludeOnNo,[2,16,29,36,48,103]);
const html=fs.readFileSync('index.html','utf8'),app=fs.readFileSync('app.js','utf8');
assert(html.includes('v9.10'));assert(html.includes('question-intents.js'));assert(app.includes('compass_hero_finder_v910_practical'));
assert(app.includes('P.labelsFor(q)'));assert(app.includes('使えるだけなら「よく使う」ではありません'));
assert(fs.readFileSync('V981_LEGACY_F08_SALTER_CHANGES.txt','utf8').includes('セイバーオルタ'));
console.log('PASS v9.9 30 questions, 104 heroes, 16 edits, 700 practical sessions, classic 30, low-use != weakness, new session & preserved core data');

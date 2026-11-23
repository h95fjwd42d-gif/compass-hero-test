 'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),crypto=require('crypto');
global.window=global;require('./data.js');
const D=global.COMPASS_DATA,P=require('./practical.js'),I=require('./question-intents.js'),C=require('./core.js');
assert.equal(D.heroes.length,104);assert.equal(P.questions.length,30);assert.equal(P.session().version,6);
const q=P.questions.find(x=>x.id==='D01');
assert(q.question.includes('HA・DA・ダッシュ中の接触'));assert.deepEqual(q.signals,{'down:opener':1});assert.equal(q.responseMode,'usage');
assert.match(I.practical(q).note,/転倒を発生させる/);
const included=[11,21,23,25,26,37,38,44,47,49,50,54,55,56,58,59,62,65,78,84,90];
assert.deepEqual(Object.keys(P.DOWN_PROFILES).map(Number).sort((a,b)=>a-b),included);
for(const id of included){assert(P.DOWN_PROFILES[id].opener>0,`missing opener ${id}`);assert(P.relevance(D.heroes[id-1],q)>0,`${id} D01 relevance`)}
for(const id of [20,34,39,46,51]){assert(!P.DOWN_PROFILES[id]);assert.equal(P.relevance(D.heroes[id-1],q),0,`${id} must not score D01`)}
for(const id of [47,50,90])assert(P.DOWN_PROFILES[id].opener<.4,`${id} must remain candidate`);
assert(P.DOWN_PROFILES[90].opener<P.DOWN_PROFILES[84].opener);
assert(P.DOWN_PROFILES[44].opener< P.DOWN_PROFILES[21].opener);
assert.deepEqual(Object.keys(P.USER_DOWN_NOTES).map(Number).sort((a,b)=>a-b),[21,25,37,44,47,50,55,56,62,65,78,84,90]);
assert(P.FOLLOWUP_ONLY_PROFILES[34]);assert(P.FOLLOWUP_ONLY_PROFILES[51]);
assert(P.questions.find(x=>x.id==='D03').signals['down:card']===1);
assert.equal(Object.keys(P.CARD_DOWN_PROFILES).length,67);
// D01 should not force a hero to rank first, only a small usage nudge.
const fill=fn=>{let s=P.session();while(s.questionId)s=P.answer(s,fn(P.questions[s.history.length]));return s};
const yes=fill(q=>q.id==='D01'?'yes':'unknown'),no=fill(q=>q.id==='D01'?'no':'unknown');
for(const id of included){const y=P.compute(yes).ranked.find(r=>r.hero.id===id),n=P.compute(no).ranked.find(r=>r.hero.id===id);assert(y.score>=n.score);assert(y.score-n.score<3,`${id} weight oversized`)}
for(const id of [20,34,39,46,51])assert.equal(P.compute(yes).ranked.find(r=>r.hero.id===id).score,P.compute(no).ranked.find(r=>r.hero.id===id).score);
const oldSession={...P.session(),version:5};assert(!P.safeSession(oldSession));
for(let i=0;i<350;i++){let seed=(i+1)*14399621>>>0;const s=fill(()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return ['yes','sometimes','no','unknown'][(seed>>>8)%4]});assert.equal(s.history.length,30);assert.equal(P.compute(s).ranked.length,104);}
let c=C.session(244);while(c.questionId)c=C.answer(c,'yes');assert.equal(c.history.length,30);
const digest=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
for(const f of ['data.json','data.js','core.js'])assert.equal(digest(f),digest('../compass_v99_usage_audit_beta/'+f));
assert(D.heroes[84].specificQuestion==='惑星破壊レベルの高火力でワンパンしたい？');
assert.deepEqual(D.specialRules.trap.excludeOnNo,[14,61]);assert.deepEqual(D.specialRules.door.excludeOnNo,[2,16,29,36,48,103]);
assert(fs.readFileSync('index.html','utf8').includes('v9.10'));
assert(fs.readFileSync('app.js','utf8').includes('compass_hero_finder_v910_practical'));
console.log('PASS v9.10: D01 21 opener candidates, 13 additions, 5 removed including followup-only, 30Q x350, classic preserved, core data identical');

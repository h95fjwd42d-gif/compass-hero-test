const fs=require('fs'),assert=require('assert'),vm=require('vm'),crypto=require('crypto');
const path=require('path'),D=JSON.parse(fs.readFileSync(path.join(__dirname,'data.json'),'utf8'));
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x),'utf8').digest('hex');
const baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'V93_BASELINE_CHECKSUMS.json'),'utf8'));
assert.equal(D.heroes.length,104);assert.equal(D.personalityQuestions.length,100);assert.equal(D.generalQuestions.length,452);
const ids=[3,6,15,24,28,33,40,57];
for(let n=1;n<=104;n++){
 const h=D.heroes[n-1],p=h.practicalCompetency;
 assert.equal(h.id,n);const {practicalCompetency,...unchanged}=h;
 assert.equal(hash(unchanged),baseline.heroSha256[n-1],`hero base must remain unchanged ${n}`);
 assert.equal(p.criticalWeaknesses.length,2);
 assert.equal(p.mainActions.length,ids.includes(n)?3:2);
 assert.equal(p.requiredSkills.length,ids.includes(n)?3:2);
 assert.equal(Boolean(p.supportCardUsage),ids.includes(n));
 if(ids.includes(n)){
  assert(p.mainActions[2].includes('カード'));assert(p.requiredSkills[2].includes('カード'));
  assert.equal(p.supportCardUsage.provisional,true);assert.equal(p.supportCardUsage.scoringApplied,false);
 }
}
assert.equal(hash(D.specialRules),baseline.specialRulesSha256);
assert.equal(hash([D.personalityQuestions,D.generalQuestions]),baseline.questionsSha256);
const code=fs.readFileSync(path.join(__dirname,'data.js'),'utf8'),context={window:{},globalThis:{}};
vm.runInNewContext(code,context);
assert.deepEqual(JSON.parse(JSON.stringify(context.window.COMPASS_DATA)),D);
const P=require('./practical.js');globalThis.COMPASS_DATA=D;
assert.equal(P.questions.length,30);
const app=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');
assert(app.includes('練習で伸ばせる可能性があるポイント'));assert(app.includes('使ってはいけない'));
const tipText=app.match(/const practicalPracticeTips=(\{[^;]+\});/);
assert(tipText,'tips map found');const hints=JSON.parse(tipText[1]);assert.equal(Object.keys(hints).length,30);
for(const q of P.questions)assert(hints[q.id]&&hints[q.id].length>18,`${q.id} hint exists`);
for(let n=0;n<500;n++){
 let s=P.session();const answers=['yes','sometimes','no','unknown'];
 for(let i=0;i<P.questions.length;i++)s=P.answer(s,answers[(n*13+i*7+n%11)%4]);
 assert(P.safeSession(s));let result=P.compute(s);
 assert.equal(result.ranked.length,104);assert.equal(result.total,30);
 assert(result.ranked.every(x=>Number.isFinite(x.score)));
}
const basePractical=JSON.parse(fs.readFileSync(path.join(__dirname,'V95_PRACTICAL_BASELINE_FIXTURES.json'),'utf8'));
for(const entry of basePractical){let s=P.session();for(const a of entry.answers)s=P.answer(s,a);const out=P.compute(s);
 assert.equal(out.ranked[0].hero.id,entry.top,'practical top unchanged');assert.equal(out.ranked[0].score,entry.score,'practical score unchanged');}
console.log('PASS v9.5: 104 original profiles unchanged, 8 support-card additions only, 30 practice hints, 500 complete sessions, data.js parity, scoring fixtures unchanged');

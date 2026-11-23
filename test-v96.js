const fs=require('fs'),assert=require('node:assert/strict'),vm=require('vm'),crypto=require('crypto');
const D=JSON.parse(fs.readFileSync('data.json','utf8'));
const baselineHashes=JSON.parse(fs.readFileSync('V95_PROFILE_BASELINE_CHECKSUMS.json','utf8'));
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x),'utf8').digest('hex');
assert.equal(D.heroes.length,104);
assert.equal(D.generalQuestions.length,452);assert.equal(D.personalityQuestions.length,100);
assert.equal(hash([D.personalityQuestions,D.generalQuestions]),baselineHashes.questionsSha256);
assert.equal(hash(D.specialRules),baselineHashes.specialRulesSha256);
for(let i=0;i<104;i++){
 const b=D.heroes[i];
 if(i!==91){assert.equal(hash(b),baselineHashes.heroSha256[i],`other hero ${i+1} untouched`);continue;}
 assert.equal(hash(Object.fromEntries(Object.entries(b).filter(([key])=>!['cardKnowledge','practicalCompetency'].includes(key)))),baselineHashes.perlinierCoreSha256);
 assert.equal(b.practicalCompetency.mainActions.length,3);
 assert.equal(b.practicalCompetency.requiredSkills.length,3);
 assert(b.practicalCompetency.mainActions[2].includes('支援型'));
 assert(b.practicalCompetency.supportCardUsage);
 assert.equal(b.practicalCompetency.supportCardUsage.scoringApplied,false);
 assert(b.cardKnowledge.optional.includes('味方全体加速'));
}
const src=fs.readFileSync('data.js','utf8');const ctx={window:{}};vm.runInNewContext(src,ctx);
assert.deepEqual(JSON.parse(JSON.stringify(ctx.window.COMPASS_DATA)),D);
global.window=global;global.COMPASS_DATA=D;const P=require('./practical.js');const E=require('./core.js');
assert.equal(P.questions.length,30);
const choices=['yes','sometimes','no','unknown'];
for(let i=0;i<500;i++){
 let s=P.session();for(let j=0;j<30;j++)s=P.answer(s,choices[(i*7+j*13)%4]);
 assert(P.safeSession(s));assert.equal(s.history.length,30);
 let r=P.compute(s);assert.equal(r.ranked.length,104);
 assert(r.ranked.every(x=>Number.isFinite(x.score)));
}
const baseline=JSON.parse(fs.readFileSync('V95_PRACTICAL_BASELINE_FIXTURES.json','utf8'));
for(const t of baseline){let s=P.session();for(const a of t.answers)s=P.answer(s,a);const r=P.compute(s);
 assert.equal(r.ranked[0].hero.id,t.top);assert.equal(r.ranked[0].score,t.score);}
let s=E.session(23);for(let i=0;i<30;i++)s=E.answer(s,'yes');
assert.equal(E.compute(s).rankedPerformance.length,104);
assert(fs.readFileSync('app.js','utf8').includes('104人の個別プロフィールv9.6'));
console.log('PASS v9.6: 104 profiles preserved, Perlinier dual style added, 500 practical sessions, classic unchanged, ranking fixtures unchanged');


'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
global.window=global;require('./data.js');require('./ability-research.js');
const A=global.COMPASS_ABILITY_RESEARCH,D=global.COMPASS_DATA,P=require('./practical.js');
assert.equal(A.scoreEnabled,false);assert.equal(A.heroes.length,104);assert.equal(D.heroes.length,104);
assert.deepEqual(A.heroes.map(x=>x.id),D.heroes.map(x=>x.id));
assert(A.heroes.every(x=>x.scoringEnabled===false));
const app=fs.readFileSync('app.js','utf8');
assert(app.includes('abilityResearchPanel(h)'));assert(app.includes('順位への影響なし'));
assert(fs.readFileSync('index.html','utf8').includes('ability-research.js'));
const digest=x=>crypto.createHash('sha256').update(fs.readFileSync(x)).digest('hex');
const old=process.argv[2];
if(old){for(const file of ['practical.js','core.js','data.js','data.json','question-intents.js'])assert.equal(digest(file),digest(`${old}/${file}`),file+' must be byte-identical');}
function fill(f){let s=P.session();while(s.questionId)s=P.answer(s,f(P.questions[s.history.length]));return s;}
for(let i=0;i<260;i++){let seed=(i+1)*47509>>>0;const s=fill(()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return ['yes','sometimes','no','unknown'][(seed>>>10)%4]});const a=P.compute(s),b=P.compute(s);assert.deepEqual(a.ranked.map(x=>[x.hero.id,x.score]),b.ranked.map(x=>[x.hero.id,x.score]));}
console.log('PASS v9.10.4 ability overlay 104 heroes, scoring disabled, base algorithm unchanged');

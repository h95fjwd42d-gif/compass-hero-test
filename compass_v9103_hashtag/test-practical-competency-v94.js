const fs = require('fs');
const assert = require('assert');
const vm = require('vm');
const path = require('path');
const base = __dirname;
const current = JSON.parse(fs.readFileSync(path.join(base,'data.json'),'utf8'));
const crypto = require('crypto');
const baseline = JSON.parse(fs.readFileSync(path.join(base,'V93_BASELINE_CHECKSUMS.json'),'utf8'));
const digest = x=>crypto.createHash('sha256').update(JSON.stringify(x),'utf8').digest('hex');
assert.strictEqual(current.heroes.length,104);
assert.strictEqual(current.personalityQuestions.length,100);
assert.strictEqual(current.generalQuestions.length,452);
for(let i=0;i<104;i++){
  let now=current.heroes[i];
  const {practicalCompetency,...unchanged}=now;
  assert.strictEqual(digest(unchanged),baseline.heroSha256[i],`old hero data changed ${i+1}`);
  assert.strictEqual(practicalCompetency.mainActions.length,2);
  assert.strictEqual(practicalCompetency.requiredSkills.length,2);
  assert.strictEqual(practicalCompetency.criticalWeaknesses.length,2);
  assert.ok(practicalCompetency.reviewStatus.includes('暫定'));
  assert.ok(practicalCompetency.sourcePrimaryCards);
  const all=[...practicalCompetency.mainActions,...practicalCompetency.requiredSkills,...practicalCompetency.criticalWeaknesses];
  assert.ok(all.every(x=>typeof x==='string'&&x.length>2));
}
assert.strictEqual(digest(current.specialRules),baseline.specialRulesSha256);
assert.strictEqual(digest([current.personalityQuestions,current.generalQuestions]),baseline.questionsSha256);
const context={window:{},globalThis:{}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(base,'data.js'),'utf8'),context);
assert.deepStrictEqual(JSON.parse(JSON.stringify(context.window.COMPASS_DATA)),current);
// practical.js should be identical in scoring to v9.3; ensure we haven't introduced score changes.
assert.strictEqual(crypto.createHash('sha256').update(fs.readFileSync(path.join(base,'practical.js'))).digest('hex'),baseline.practicalJsSha256);
assert.ok(fs.readFileSync(path.join(base,'app.js'),'utf8').includes('practicalCompetencyPanel(h)'));
console.log('PASS v9.4: 104 individual profiles × 6, original heroes + questions unchanged, data.js/data.json parity, practical score logic unchanged');

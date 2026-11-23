const assert = require('node:assert/strict');
global.window=global;
require('./data.js');
const E=require('./core.js');
const D=global.COMPASS_DATA;
const q=id=>D.generalQuestions.find(x=>x.id===id);
const hero=id=>D.heroes[id-1];
assert.equal(D.heroes.length,104);
assert.equal(D.personalityQuestions.length,100);
assert.equal(D.generalQuestions.length,452);
assert.equal(D.metadata.questionTotal,656);
assert.equal(D.generalQuestions.filter(x=>!x.inactive).length,450);
assert.equal(D.metadata.activeQuestionTotal,654);
assert.equal(D.heroes.filter(h=>Object.hasOwn(h,'combatTradeoffs')).length,14);
assert.equal(q('Q452').category,'D');
assert.deepEqual(q('Q452').signals,{tradeoff_damage:1.0});
assert.equal(hero(85).specificQuestion,'惑星破壊レベルの高火力でワンパンしたい？');
assert.equal(hero(76).specificQuestion,'オマエ、マックロ？');
assert.deepEqual(D.specialRules.trap.excludeOnNo,[14,61]);
assert.deepEqual(D.specialRules.door.excludeOnNo,[2,16,29,36,48,103]);
assert.deepEqual(D.specialRules.buff.excludeOnNo,[]);
assert.equal(q('Q115').inactive,true);
assert.equal(q('Q269').inactive,true);
assert.ok(E.generalMatch(hero(41),q('Q452'))>E.generalMatch(hero(36),q('Q452')));
assert.ok(E.generalMatch(hero(49),q('Q452'))>E.generalMatch(hero(12),q('Q452')));
assert.ok(E.generalMatch(hero(17),q('Q452'))>E.generalMatch(hero(104),q('Q452')));
assert.equal(hero(12).combatTradeoffs,undefined,'Dizzy low HP but not damage-over-support oriented');
assert.equal(hero(104).combatTradeoffs,undefined,'Takoko sustainable via innate heal; do not assume fragile');
assert.equal(hero(25).combatTradeoffs,undefined,'Rem low HP during fights is not low BASE HP');
assert.equal(hero(9).combatTradeoffs,undefined,'Voidoll control/objective instead of high damage');
const base=E.session(1);
let yes={...base,history:[{id:'Q452',answer:'yes'}]};
let no={...base,history:[{id:'Q452',answer:'no'}]};
assert.equal(E.compute(yes).rankedAppearance[0].hero.id,E.compute(no).rankedAppearance[0].hero.id);
assert.ok(E.compute(yes).rankedPerformance.find(x=>x.hero.id===41).score>E.compute(no).rankedPerformance.find(x=>x.hero.id===41).score);
assert.deepEqual(E.compute(no).excluded,[]);
assert.deepEqual(E.compute(yes).excluded,[]);
const personality={...base,history:[{id:'Q452',answer:'yes'},{id:'P001',answer:'yes'}]};
assert.deepEqual(E.compute(personality).rankedPerformance.map(x=>x.hero.id),E.compute({...personality,history:[{id:'Q452',answer:'yes'},{id:'P001',answer:'no'}]}).rankedPerformance.map(x=>x.hero.id));
const visual={...base,history:[{id:'Q452',answer:'yes'},{id:'Q369',answer:'yes'}]};
assert.deepEqual(E.compute(visual).rankedPerformance.map(x=>x.hero.id),E.compute({...visual,history:[{id:'Q452',answer:'yes'},{id:'Q369',answer:'no'}]}).rankedPerformance.map(x=>x.hero.id));
for(let trial=0;trial<300;trial++){
 let s=E.session(88112+trial*1171),seen=new Set(),visual=0,performance=0,personalityCount=0;
 for(let i=0;i<30;i++){
  assert.ok(s.questionId,`missing Q${i+1}`);
  const id=s.questionId;
  assert.ok(!seen.has(id),`duplicate ${id}`);seen.add(id);
  assert.equal(id[0],i<10?'P':i<29?'Q':'S');
  if(i===17) assert.equal(id,'Q452',`Q18 must be tradeoff question`);
  if(i<10)personalityCount++;
  if(id.startsWith('Q')){
   assert.ok(!q(id).inactive);
   if(q(id).category==='V'){visual++;assert.ok(E.supportedVisualQuestion(q(id)));} else performance++;
  }
  s=E.answer(s,['yes','no','neutral','unknown'][(i+trial)%4]);
 }
 assert.equal(s.history.length,30);assert.equal(s.questionId,null);
 assert.equal(personalityCount,10);assert.equal(performance,13);assert.equal(visual,6);
 assert.ok(E.safeSession(s));
 assert.equal(E.back(s).history.length,29);
 const computed=E.compute(s);
 assert.equal(computed.rankedAppearance.length,104);
 assert.equal(computed.visualUnverified.length,11);
}
console.log('PASS v8.9: 104 heroes, 656 stored/654 selectable questions, 14 provisional tradeoff mappings, 300 full runs, 10+13+6+1, isolated scoring, no new hard exclusions');

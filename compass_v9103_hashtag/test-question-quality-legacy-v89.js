const assert=require('node:assert/strict');
global.window=global;
require('./data.js');
const E=require('./core.js'), D=global.COMPASS_DATA;
const question=id=>D.generalQuestions.find(q=>q.id===id);
const hero=id=>D.heroes[id-1];
assert.equal(D.heroes.length,104);
assert.equal(D.generalQuestions.length,452);
assert.equal(D.personalityQuestions.length,100);
assert.equal(D.metadata.questionTotal,656);
assert.equal(D.generalQuestions.filter(q=>!q.inactive).length,450);
assert.equal(D.heroes.filter(x=>Object.keys(x.visualTraits||{}).length>0).length,93);
assert.equal(D.heroes[84].specificQuestion,'惑星破壊レベルの高火力でワンパンしたい？');
assert.equal(D.heroes[75].specificQuestion,'オマエ、マックロ？');
assert.deepEqual(D.specialRules.trap.excludeOnNo,[14,61]);
assert.deepEqual(D.specialRules.door.excludeOnNo,[2,16,29,36,48,103]);
assert.deepEqual(D.specialRules.buff.excludeOnNo,[]);
assert.equal(question('Q115').inactive,true);
assert.equal(question('Q269').inactive,true);
assert.match(question('Q207').question,/罠カードを複数設置/);
assert.match(question('Q250').question,/HS/);
assert.match(question('Q451').question,/スタン.+ポータル/);
assert.equal(hero(11).cardTraits.deck_combo,4.0);
assert.equal(hero(11).cardTraits.deck_ranged,2.05);
assert.ok(E.generalMatch(hero(11),question('Q443'))>E.generalMatch(hero(11),question('Q436')));
assert.ok(E.generalMatch(hero(9),question('Q451'))>E.generalMatch(hero(8),question('Q451')));
assert.ok(E.generalMatch(hero(14),question('Q207'))>E.generalMatch(hero(8),question('Q207')));
assert.ok(E.generalMatch(hero(12),question('Q250'))>E.generalMatch(hero(8),question('Q250')));
assert.ok(E.generalMatch(hero(12),question('Q250'))>E.generalMatch(hero(9),question('Q250')));
assert.equal(hero(12).abilityTraits.ability_hs_mass_stun,4.2);
assert.equal(hero(9).abilityTraits,undefined);
assert.deepEqual(D.heroes.map(h=>h.id),Array.from({length:104},(_,i)=>i+1));
function ranks(s,mode='rankedPerformance'){return E.compute(s)[mode].map(x=>x.hero.id)}
for(let trial=0;trial<280;trial++){
 let s=E.session(89991+trial*1997),seen=new Set(),visual=0,perf=0;
 for(let i=0;i<30;i++){
  let id=s.questionId;assert.ok(id,`missing ${i}`);assert.ok(!seen.has(id),`repeat ${id}`);seen.add(id);
  assert.equal(id[0],i<10?'P':i<29?'Q':'S');
  if(id[0]==='Q'){
   let q=question(id);assert.ok(!q.inactive,`question retired: ${id}`);
   if(q.category==='V'){visual++;assert.ok(E.supportedVisualQuestion(q));}else perf++;
  }
  s=E.answer(s,['yes','no','neutral','unknown'][(i+trial)%4]);
 }
 assert.equal(s.history.length,30);assert.equal(s.questionId,null);
 assert.equal(visual,6);assert.equal(perf,13);
 const r=E.compute(s);assert.equal(r.rankedAppearance.length,104);assert.equal(r.visualUnverified.length,11);
 assert.equal(E.back(s).history.length,29);
}
// Independent scoring for performance and visual, including the newly added question.
const b=E.session(42);
const a={...b,history:[{id:'Q451',answer:'yes'},{id:'Q369',answer:'yes'},{id:'P001',answer:'yes'}]};
const v={...b,history:[{id:'Q451',answer:'no'},{id:'Q369',answer:'yes'},{id:'P001',answer:'yes'}]};
assert.deepEqual(ranks(a,'rankedAppearance'),ranks(v,'rankedAppearance'));
const vchange={...b,history:[{id:'Q451',answer:'yes'},{id:'Q369',answer:'no'},{id:'P001',answer:'yes'}]};
assert.deepEqual(ranks(a),ranks(vchange));
assert.deepEqual(ranks(a),ranks({...b,history:[{id:'Q451',answer:'yes'},{id:'Q369',answer:'yes'},{id:'P001',answer:'no'}]}));
for(const id of ['Q207','Q250','Q451','Q436','Q443']){
 const s={...b,history:[{id,answer:'no'}]};assert.deepEqual(E.compute(s).excluded,[]);
}
const x={...b,history:[{id:'Q394',answer:'no'}]};
assert.deepEqual(E.compute(x).excluded,[14,61]);
console.log('PASS v8.9 legacy-quality checks: 104 heroes / 656 stored, 654 eligible questions, 280 complete adaptive 30Q runs, 6 visual + 13 performance, separate scores, specialty exclusions, quality revisions');

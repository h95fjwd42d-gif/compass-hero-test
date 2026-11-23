const assert=require('node:assert/strict');global.window=global;require('./data.js');const E=require('./core.js'),D=global.COMPASS_DATA;
const h=id=>D.heroes[id-1],q=id=>D.generalQuestions.find(x=>x.id===id);
assert.equal(D.heroes.length,104);assert.equal(D.generalQuestions.length,452);
assert.equal(D.metadata.questionTotal,656);
assert.equal(D.heroes.filter(x=>x.cardKnowledge?.primary).length,104);
assert.equal(D.heroes[75].specificQuestion,'オマエ、マックロ？');
assert.match(D.heroes[20].specificQuestion,/豹変/);
assert.match(D.heroes[23].specificQuestion,/精霊使い/);
assert.match(D.heroes[84].specificQuestion,/惑星破壊/);
assert.equal(h(65).cardTraits.deck_silence,0,'ステリアの通常攻撃サイレント≠デッキカード');
assert.equal(h(52).cardTraits.deck_ranged,0,'ニーズヘッグの遠距離HA≠遠距離カード');
assert.equal(h(72).cardTraits.deck_guardbreak,undefined,'アクセラレータHAのGB≠カードGB');
assert.equal(h(46).cardTraits.deck_ranged,0);assert.equal(h(46).cardTraits.deck_area,0);
assert.equal(h(50).cardTraits.deck_ranged,0);assert.ok(h(50).cardTraits.deck_speed_buff>0);
assert.equal(h(78).cardTraits.deck_near,0);assert.ok(h(78).cardTraits.deck_counter>3);
assert.equal(h(100).cardTraits.deck_area_pierce,0);assert.ok(h(100).cardTraits.deck_area>3);
assert.ok(h(10).cardTraits.deck_self_buff>h(10).cardTraits.deck_near);
assert.ok(h(41).cardTraits.deck_self_buff>h(41).cardTraits.deck_near);
assert.ok(h(42).cardTraits.deck_def_down>h(42).cardTraits.deck_near);
assert.ok(h(59).cardTraits.deck_stun_wave<1);assert.ok(h(103).cardTraits.deck_stun_wave<1);
assert.ok(h(21).cardTraits.deck_stun_wave>3);assert.ok(h(90).cardTraits.deck_stun_wave>3);
assert.ok(h(82).cardTraits.deck_ranged>4);
assert.ok(E.generalMatch(h(82),q('Q436'))>E.generalMatch(h(52),q('Q436')));
assert.ok(E.generalMatch(h(21),q('Q437'))>E.generalMatch(h(59),q('Q437')));
assert.ok(E.generalMatch(h(100),q('Q438'))>E.generalMatch(h(46),q('Q438')));
assert.ok(E.generalMatch(h(102),q('Q439'))>E.generalMatch(h(72),q('Q439')));
assert.deepEqual(D.specialRules.trap.excludeOnNo,[14,61]);
assert.deepEqual(D.specialRules.door.excludeOnNo,[2,16,29,36,48,103]);
assert.deepEqual(D.specialRules.buff.excludeOnNo,[]);
for(const id of ['Q396','Q437','Q438']){
 let s=E.session(500);s.history=[{id,answer:'no'}];
 assert.equal(E.compute(s).excluded.length,0,'一般カード質問で除外しない '+id);
}
function ranks(ids){let s=E.session(888);s.history=ids.map(id=>({id,answer:'yes'}));return E.compute(s).rankedPerformance;}
assert.equal(ranks(['Q005','Q012','Q040','Q041','Q050','Q071','Q084','Q087','Q103','Q110','Q111','Q124','Q215','Q219','Q241','Q242','Q260'])[0].hero.id,102,'一姫ケース');
assert.equal(ranks(['Q040','Q045','Q111','Q119','Q128','Q134','Q139','Q141','Q207','Q219','Q237','Q239','Q247','Q302'])[0].hero.id,90,'チーちゃんケース');
console.log('PASS card model: 104 hero profiles, source corrections, ability/card distinction, stun-wave priority, no extra hard exclusions, Ichihime/Chi-chan regression');

'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
global.window = global;
require('./data.js');
const data = global.COMPASS_DATA;
const P = require('./practical.js');
const E = require('./core.js');
const I = require('./question-intents.js');
assert.equal(data.heroes.length,104);
assert.equal(P.questions.length,30);
assert.equal(Object.keys(I.PRACTICAL).length,30);
for(const q of P.questions){
 assert.ok(I.PRACTICAL[q.id],`missing purpose ${q.id}`);
 const info=I.practical(q);
 assert.equal(info.id,q.id);
 assert.ok(info.purpose.length>15);
 assert.equal(info.signals.length,Object.keys(q.signals||{}).length);
 assert.ok(info.impact.includes(String(q.weight)));
}
for(const q of data.personalityQuestions){
 const info=I.classic(q,'personality',null,data);
 assert.ok(info.impact.includes('一切加点'),q.id);
}
for(const q of data.generalQuestions){
 const info=I.classic(q,'common',null,data);
 assert.equal(info.id,q.id);
 assert.ok(info.purpose && info.impact && info.signals);
}
for(const h of data.heroes){
 const info=I.classic({id:`S${String(h.id).padStart(3,'0')}`},'specific',h,data);
 assert.equal(info.id,`S${String(h.id).padStart(3,'0')}`);
}
const html=fs.readFileSync('index.html','utf8'),app=fs.readFileSync('app.js','utf8');
assert.ok(html.includes('question-intents.js'));
assert.ok(html.includes('intent-visible'));
assert.ok(app.includes('renderIntent(\'practical\''));
assert.ok(app.includes("renderIntent('classic'"));
let s=P.session();
for(let i=0;i<P.questions.length;i++)s=P.answer(s,i%4===0?'unknown':'yes');
assert.equal(P.compute(s).ranked.length,104);
let c=E.session(98765);
for(let i=0;i<30;i++)c=E.answer(c,i%3===0?'no':'yes');
assert.equal(c.history.length,30);
assert.equal(E.compute(c).rankedPerformance.length>0,true);
console.log('PASS v9.7 question intentions: 30 practical + all classic pools + 104 final question profiles; session engines unchanged');

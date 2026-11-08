import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

// U-KNOU, 2026-11-08: 13강 헌법재판소의 지위와 조직, Q1–Q10.
// All answers and original explanations were revealed in each question UI.
// Q10 includes the separate visible passage. Only whitespace was normalized.
const file='data/통치의기본구조.json';
const data=JSON.parse(fs.readFileSync(file,'utf8'));
const baseline=JSON.parse(execFileSync('git',['show',`22aaefa:${file}`],{encoding:'utf8'}));
assert.equal(baseline.length,454);
assert.deepEqual(data.slice(0,454),baseline);
assert.equal(data.length,464);
assert.equal(new Set(data.map(q=>q.id)).size,464);
assert.equal(data.filter(q=>q.source==='형성평가').length,118);
assert.equal(data.filter(q=>q.source==='워크북').length,346);
const hashes=[
  '9f6f427c58f2e362841f05e3a6fa59b42567218961afbbac6ba5c16ca6d8110a',
  '1ea0e7fb60738759df0d5e79282f29e64a629e8bd64168afcc766f6a12dd90d0',
  '6384551c5ce9df7b9ab5fbe41428b51696b7fcc0b2bbedf6ed1041975fc333d1',
  'a4269e8720115497042b21d66e1e31b9ec77079335874bd07bc7cff4cf550df1',
  'e1557112aae1a6def6b78095b4b86af5637dcf2a82c62bfc5e7647e5306a80f0',
  'e9392e921d07ad945ce7b9a6fb5332f21fcf13723af76c302a080009e1fcf195',
  '6df69b90a6e524405c22fb021f83b37d2bbc532c8dace00a36efb617469b3eb2',
  'dfccea5d054d54a591c6e6d0949f594edf3ec4da00682e84af31214f78802dd4',
  'e8179ad255669c71dd7921e4d26d998113c7d0d8884b839920614feccd6cb1e8',
  'cde9e03ed0494e376f9eaa0319a45bbfc91993c5db4c8059fc2e20eb1bce51bc'
];
for(const [i,q] of data.slice(454).entries()){
  assert.equal(q.id,`통치의기본구조_${109+i}`);
  assert.equal(q.type,'mc');
  assert.equal(q.source,'형성평가');
  assert.equal(q.topic,'헌법재판소의 지위와 조직');
  assert.ok(baseline.some(old=>old.topic===q.topic));
  assert.equal(q.choices.length,4);
  assert.ok(q.question.trim()&&q.explanation.trim());
  assert.ok(!Object.keys(q).some(k=>/image/i.test(k)));
  const content={question:q.question,choices:q.choices,answer:q.answer,explanation:q.explanation};
  assert.equal(createHash('sha256').update(JSON.stringify(content)).digest('hex'),hashes[i],q.id);
}
assert.match(data.at(-1).question,/이 사건 법률조항 중 “임원”/);
console.log('PASS: lecture 13, 10 questions / 40 choices / 10 revealed answers and explanations, Q10 passage included; 454 previous questions unchanged.');

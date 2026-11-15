import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

// U-KNOU, 2026-11-15: 14강 헌법재판소의 권한(1), Q1–Q10.
// Answers and original explanations were revealed by submitting each question.
// Q8 includes its separate passage. Q4's repeated explanation and Q5's typo
// are preserved as displayed. Only passage layout whitespace was normalized.
const file='data/통치의기본구조.json';
const data=JSON.parse(fs.readFileSync(file,'utf8'));
const baseline=JSON.parse(execFileSync('git',['show',`6f29da1:${file}`],{encoding:'utf8'}));
assert.equal(baseline.length,464);
assert.deepEqual(data.slice(0,464),baseline);
assert.equal(data.length,474);
assert.equal(new Set(data.map(q=>q.id)).size,474);
assert.equal(data.filter(q=>q.source==='형성평가').length,128);
assert.equal(data.filter(q=>q.source==='워크북').length,346);
const hashes=[
  '44cd3cea18127f6dfe386b3fb3e4b620024e3400632e4391c9f0036858f8c8f9',
  'b1c13f9eb2184f4e8b86242af4d8b1c4833da061531dabd55fb3e259f5f17186',
  'f92d806d54db16010bee60933297431859d639f51254b059d627f363ff8a5639',
  'edba7cbb12ee980d145c5521450bce41e227809275a593add131c2c1fc24bc37',
  'fc429fc459c4f30753ab121fab34b67c141799a9ca196f04f449a3d7786bd9ee',
  'f156736b295a2476b7df85140e122c2971d40b2bf99d89780923cd4432b83fad',
  'b486fd0fbb138e246b33465794dd199b0ecbd70e6a8e1ce838b2d581543e6f1d',
  'cd6c7fa50c347cc90b4504b0bc286fe7babbfdd1b2e7885a45184807259ffe6d',
  '3aca1f990576a8de4aee94722ea68faba2ff410c31e2d1a1a29207bdc6cdd211',
  'a3a487527388a03e7e2d2c6e82dd33eaf2faa6856011d468d1c01e571b122207'
];
const added=data.slice(464);
for(const [i,q] of added.entries()){
  assert.equal(q.id,`통치의기본구조_${119+i}`);
  assert.equal(q.type,'mc');
  assert.equal(q.source,'형성평가');
  assert.equal(q.topic,'헌법재판소의 권한(1)');
  assert.ok(baseline.some(old=>old.topic===q.topic));
  assert.equal(q.choices.length,4);
  assert.ok(q.question.trim()&&q.explanation.trim());
  assert.ok(!Object.keys(q).some(k=>/image/i.test(k)));
  const content={question:q.question,choices:q.choices,answer:q.answer,explanation:q.explanation};
  assert.equal(createHash('sha256').update(JSON.stringify(content)).digest('hex'),hashes[i],q.id);
}
assert.match(added[7].question,/피청구인의 이 사건 헌법과 법률 위배행위/);
console.log('PASS: lecture 14, 10 text questions / 40 choices / 10 revealed answers and original explanations; Q8 passage included, 464 existing questions unchanged.');

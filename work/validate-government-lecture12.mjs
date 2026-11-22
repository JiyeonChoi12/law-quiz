import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

// U-KNOU, 2026-11-02: 12강 법원의 권한과 운영, Q1–Q8.
// Every answer and explanation was revealed by answering in the question UI.
// Q3 includes its separately displayed passage; NBSP is normalized to space.
// Source: https://ucampus.knou.ac.kr/ekp/user/study/retrieveUSTStudy.do
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file='data/통치의기본구조.json';
const data=JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const baseline=JSON.parse(execFileSync('git',['show',`af05c22ef9dc1fc865f2918706e93d1fe451407a:${file}`],{cwd:root,encoding:'utf8'}));
const baselineIds=new Set(baseline.map(q=>q.id));
assert.equal(baseline.length,446);
assert.deepEqual(data.filter(q=>baselineIds.has(q.id)),baseline);
assert.equal(data.length,484);
assert.equal(new Set(data.map(q=>q.id)).size,484);
assert.equal(data.filter(q=>q.source==='형성평가').length,138);
assert.equal(data.filter(q=>q.source==='워크북').length,346);
const lecture12Ids=new Set(Array.from({length:8},(_,i)=>`통치의기본구조_${101+i}`));
const added=data.filter(q=>lecture12Ids.has(q.id));
assert.equal(added.length,8);
const hashes=[
  '3d91a9303dbda5a9de8a5d975443e7896e20341fdca776318396a38ec2904305',
  '20b3e530b90d1425aefaf0a2cf569ef214a33186960450bcb7341f05c83be9da',
  '0b9fdd7601a4a5c624bf2fdb37c7bc4f7b5886fac364a046bfac660ce2972dab',
  '6d06c6ee9d3fa21f56c34b8d5726b39bcf62d34dd82c8f89a7835d9366c6cc06',
  '27ec03a6523208b3e83061d4a566de4cc4ead5ad32baef105a8c79255b30fb42',
  '49b6f7851b6436de00eb21c21e228f7362de44290651d7db2c2aea9fd870c0cd',
  'd231fdd510e9b99f0e6a9ef67962c2230475d0ff7db98abdadcf10b72532c519',
  '5a2b49760dedef8e46627a7f6c7fc89c55830916c15802369ab8e7201abd5742'
];
for(const [i,q] of added.entries()){
  assert.equal(q.id,`통치의기본구조_${101+i}`);
  assert.equal(q.type,'mc');
  assert.equal(q.source,'형성평가');
  assert.equal(q.topic,'법원의 권한과 사법의 절차원리');
  assert.ok(baseline.some(old=>old.topic===q.topic));
  assert.equal(q.choices.length,4);
  assert.ok(q.question.trim()&&q.explanation.trim());
  assert.ok(!Object.keys(q).some(key=>/image/i.test(key)));
  const content={question:q.question,choices:q.choices,answer:q.answer,explanation:q.explanation};
  assert.equal(createHash('sha256').update(JSON.stringify(content)).digest('hex'),hashes[i],q.id);
}
assert.match(added[2].question,/헌법 제107조 제2항이 규정한/);
assert.match(added[2].question,/별도의 \( {8}\)를 기다리지 않고/);
console.log('PASS: lecture 12, 8 text questions / 32 choices / 8 revealed answers and explanations; Q3 passage included; existing tag reused; 446 prior questions unchanged.');

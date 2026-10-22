import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

// U-KNOU, 2026-10-22: 11강 법원의 조직과 원리, Q1–Q10.
// Each answer was submitted in the question UI; these hashes cover the
// visible question, four choices, revealed answer, and original explanation.
// Source: https://ucampus.knou.ac.kr/ekp/user/study/retrieveUSTStudy.do
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const file='data/통치의기본구조.json';
const data=JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const baseline=JSON.parse(execFileSync('git',['show',`fd3d98c2eb09d7381adc25ede6fecb367304422b:${file}`],{cwd:root,encoding:'utf8'}));
const baselineIds=new Set(baseline.map(q=>q.id));
assert.equal(baseline.length,436);
assert.deepEqual(data.filter(q=>baselineIds.has(q.id)),baseline);
assert.equal(data.length,446);
assert.equal(new Set(data.map(q=>q.id)).size,446);
assert.equal(data.filter(q=>q.source==='형성평가').length,100);
assert.equal(data.filter(q=>q.source==='워크북').length,346);
const added=data.filter(q=>!baselineIds.has(q.id));
assert.equal(added.length,10);
const hashes=[
  '9d5f4d9148fb0c7492d19c1e189400df058322dea4290a8508b99d7940ff434b',
  '5a4707c0a5521b607ed6ce323e5b75819b81abcf270dca1df7556a30b9fff304',
  '9cf0e280042be4415900604d58bc84a084b62df1a6f5822e81f3f85a69dd4dbe',
  '9be1d490ce7e7280e2628d77effed267dd20fbb4696a7edddbc8656cad7e21cf',
  '3f200496ab7f81a37a3592a69ada6dba3deb8c870b38cc2a12f87689a636eb1f',
  'bd6ed0c3d2c8b1dad81734fec6c20ee5cb8d5c4151211d3dd749bb11da7ae648',
  '6e81dfd2c9b0318be2659e67ebffb4311a45a0ed8b179d922543c7f35fee789a',
  '3dcf7ebe1631a193f1ca7a8d42a8916281dcca8bb03b69075972f464d054af03',
  'fd9f3c205cf9621921d9ca488ce9ca39b993821540d8972acadac95a59bbceee',
  '7c0ba4fd6bc24dfe4480a7bdaf056bbf29631a7412609c6198d66c29422572c4'
];
for(const [i,q] of added.entries()){
  assert.equal(q.id,`통치의기본구조_${String(91+i).padStart(3,'0')}`);
  assert.equal(q.type,'mc');
  assert.equal(q.source,'형성평가');
  assert.equal(q.topic,'법원의 조직과 구성 및 사법권 독립');
  assert.ok(baseline.some(old=>old.topic===q.topic));
  assert.equal(q.choices.length,4);
  assert.ok(q.question.trim()&&q.explanation.trim());
  assert.ok(!Object.keys(q).some(key=>/image/i.test(key)));
  const content={question:q.question,choices:q.choices,answer:q.answer,explanation:q.explanation};
  assert.equal(createHash('sha256').update(JSON.stringify(content)).digest('hex'),hashes[i],q.id);
}
console.log('PASS: lecture 11, 10 text questions / 40 choices / 10 revealed answers and original explanations; existing tag reused; 436 prior questions unchanged.');

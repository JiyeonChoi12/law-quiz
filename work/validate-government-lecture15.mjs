import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

// U-KNOU, 2026-11-23: 15강 헌법재판소의 권한(2), Q1–Q10.
// Answers and original explanations were revealed by submitting each question.
// Q9 retains all three explanation paragraphs; source wording is unchanged.
const file='data/통치의기본구조.json';
const data=JSON.parse(fs.readFileSync(file,'utf8'));
const baseline=JSON.parse(execFileSync('git',['show',`b0d56e5:${file}`],{encoding:'utf8'}));
assert.equal(baseline.length,474);
assert.deepEqual(data.slice(0,474),baseline);
assert.equal(data.length,484);
assert.equal(new Set(data.map(q=>q.id)).size,484);
assert.equal(data.filter(q=>q.source==='형성평가').length,138);
assert.equal(data.filter(q=>q.source==='워크북').length,346);
const hashes=[
 '16c451649f28609f5da82bfb60a856793d23369c25eb59b31f2d4606111b9991',
 '3475f7fbb13f301503b94d5876e4f05f5d2817a96b06bd0328723310bb8201cd',
 '32e5d49b2881316cf2c00efe4523d4a736a43b9c92f87edf1898f2579ecc77c3',
 '28a3ed4ecc0fc0bff5badc961f7f6981291235246150d8b18bd663e4940dc569',
 '1f85f0c563ba26ab84fe93e57e6c01264f91b56b5fed86ffde7260444294e8aa',
 '4cfeefa1a45f8f50e7e542ac22b9b20c8c0c58a7c55dcf7ac48a37e0d7c572fd',
 '3851ff865884a5aca4dc28d7ad2d634ec5d0d475a34fce98334d7bb95c165d2a',
 'ae4fc32323a41bf830f6f839e26ac4d3f2f645edcf2c39908235f88f6b88a88f',
 'e0aa3f93d8a9eefbecac9813a502bb578df156a23cc4988b599dd6aaace5ab00',
 'bcd2bf43ad49c7ef8f2e9b2a9d80c28483e9563e5c85cc10d91edeebf9eaaa15'
];
const added=data.slice(474);
assert.equal(added.length,10);
for(const [i,q] of added.entries()){
 assert.equal(q.id,`통치의기본구조_${129+i}`);
 assert.equal(q.type,'mc');
 assert.equal(q.source,'형성평가');
 assert.equal(q.topic,'헌법재판소의 권한(2)');
 assert.ok(baseline.some(old=>old.topic===q.topic));
 assert.equal(q.choices.length,4);
 assert.ok(q.question.trim()&&q.explanation.trim());
 assert.ok(!Object.keys(q).some(k=>/image/i.test(k)));
 const content={question:q.question,choices:q.choices,answer:q.answer,explanation:q.explanation};
 assert.equal(createHash('sha256').update(JSON.stringify(content)).digest('hex'),hashes[i],q.id);
}
assert.equal(added[8].explanation.split('\n\n').length,3);
console.log('PASS: lecture 15, 10 text questions / 40 choices / 10 revealed answers and original explanations; 474 existing questions unchanged.');

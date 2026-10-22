import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const data=read('data/채권각론.json');
const source=read('data/sources/채권각론_워크북_출처.json');
const baseline=JSON.parse(execFileSync('git',['show','e99db58f4bf1ef260e0ceb60e1025a29cbfd1179:data/채권각론.json'],{cwd:root,encoding:'utf8'}));
const workbook=data.filter(q=>q.source==='워크북');
assert.equal(baseline.length,167);
assert.deepEqual(data.filter(q=>q.source!=='워크북'),baseline);
assert.equal(data.length,467);assert.equal(workbook.length,300);
assert.equal(new Set(data.map(q=>q.id)).size,data.length);
const tags=new Set(baseline.map(q=>q.topic));
const key=['53144','51223','23425','13124','34213','12542','22151','52255','15332','31431','15144','41251','22534','24335','33224','13134','43223','15232','12215','24534','45411','51141','42511','11425','43515','21524','51455','52144','13522','11252','42122','12155','33251','42211','54442','35425','24231','15225','35151','54435','12455','24344','42253','53535','51243','32215','54324','33324','41452','31553','44222','24544','51511','34225','21253','25353','21355','51144','22244','23343'].join('');
assert.equal(key.length,300);assert.equal(source.answerKey,key);
const coverage=new Set();
for(const [i,q] of workbook.entries()){
  assert.equal(q.id,`채권각론_워크북_${String(i+1).padStart(3,'0')}`);
  assert.equal(q.workbookNumber,i+1);assert.equal(q.type,'mc');
  assert.equal(q.contentFormat,'text');assert.ok(!q.image);
  assert.equal(q.choices.length,5);assert.ok(q.choices.every(c=>typeof c==='string'&&c.trim()));
  assert.ok(q.question.trim()&&q.explanation.trim());assert.ok(tags.has(q.topic),q.topic);
  assert.deepEqual(q.answer,i===49?[0,1]:Number(key[i])-1,q.id);
  assert.equal(q.answerSource,'워크북 인쇄 정답');assert.equal(q.explanationSource,'워크북 인쇄 해설');
  assert.ok(q.workbookPage>=5&&q.workbookPage<=170);
  assert.ok(q.workbookPages.includes(q.workbookPage));q.workbookPages.forEach(p=>coverage.add(p));
  const text=q.question+q.choices.join('')+q.explanation;
  assert.ok(!/[\uFFFD\uE000-\uF8FF©⑥-⑳㉥-㉻]/.test(text),q.id);
  assert.ok(!/원문 이미지|원문 [①②③④⑤]번 보기|\(\)|\[\]|해설/.test(text),q.id);
  assert.ok(!/<[^>]+>/.test(text),q.id);
  assert.equal(source.questions[i].id,q.id);
  assert.deepEqual(source.questions[i].printedPages,q.workbookPages);
}
assert.deepEqual([...coverage].sort((a,b)=>a-b),Array.from({length:166},(_,i)=>i+5));
assert.equal(source.questionCount,300);assert.equal(source.questions.length,300);
assert.equal(source.independentImageAnswerCount,300);
assert.equal(source.sourceBytes,652705702);
assert.equal(source.sourceSha256,'5a8089ccc8853534dc622d77e971a905a73630eadb750d1b77fe837908f29d86');
assert.deepEqual(source.topicCounts,Object.fromEntries([...tags].map(t=>[t,workbook.filter(q=>q.topic===t).length])));
assert.deepEqual(source.sections.map(s=>s.count),[3,6,3,13,14,14,2,8,30,3,6,6,31,5,12,7,11,40,4,10,18,54]);
for(const section of source.sections){
  assert.deepEqual(workbook.filter(q=>q.workbookSection===section.section).map(q=>q.originalNumber),Array.from({length:section.count},(_,i)=>i+1));
}
const q=n=>workbook[n-1];
assert.match(q(39).choices[1],/乙은 丙을/);
assert.match(q(51).choices[2],/甲은 丙에/);
assert.equal(q(50).printedAnswer,'①/②');
assert.deepEqual(q(124).choices,['㉠ 보증금, ㉡ 권리금','㉠ 차임, ㉡ 보상금','㉠ 보상금, ㉡ 권리금','㉠ 권리금, ㉡ 보증금','㉠ 보증금, ㉡ 차임']);
assert.match(q(151).explanation,/시기\(始期\).*종기\(終期\)/);
assert.deepEqual(q(300).choices,['㉠, ㉢','㉡, ㉤','㉠, ㉡','㉡, ㉣','㉢, ㉣']);
assert.match(q(300).question,/㉠[\s\S]*㉡[\s\S]*㉢[\s\S]*㉣[\s\S]*㉤/);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const [,code]of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(code);
function functionSource(name){const start=html.indexOf('function '+name+'(');assert.ok(start>=0);return html.slice(start,html.indexOf('\n}',start)+2);}
const ctx=vm.createContext({NUMS:['①','②','③','④','⑤']});
vm.runInContext(['formatCorrectAnswer','checkMCAnswer','isCorrectChoice'].map(functionSource).join('\n'),ctx);
for(const item of workbook){
  const answers=Array.isArray(item.answer)?item.answer:[item.answer];
  for(let i=0;i<5;i++)assert.equal(ctx.isCorrectChoice(i,item.answer),answers.includes(i));
  assert.ok(ctx.checkMCAnswer(item.answer,item.answer));
  assert.equal(ctx.formatCorrectAnswer(item),answers.map(i=>ctx.NUMS[i]+' '+item.choices[i]).join(', '));
}
assert.ok(!ctx.checkMCAnswer([0],q(50).answer));
assert.ok(ctx.checkMCAnswer([1,0],q(50).answer));
console.log('PASS: 300 text workbook questions, printed answer key, pp.5–170, 15 existing tags, grading, 167 original questions unchanged.');

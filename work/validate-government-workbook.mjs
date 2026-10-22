import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const data=read('data/통치의기본구조.json'),source=read('data/sources/통치의기본구조_워크북_출처.json');
const baseline=JSON.parse(execFileSync('git',['show','ddc08e7fa379495929ec48d7007077224bb0c673:data/통치의기본구조.json'],{cwd:root,encoding:'utf8'}));
const workbook=data.filter(q=>q.source==='워크북');
const existingTopics=[...new Set(baseline.map(q=>q.topic))];
const newTopics=['법원의 조직과 구성 및 사법권 독립','법원의 권한과 사법의 절차원리','헌법재판소의 지위와 조직','헌법재판소의 권한(1)','헌법재판소의 권한(2)'];
const tags=new Set([...existingTopics,...newTopics]);
const baselineIds=new Set(baseline.map(q=>q.id));
assert.equal(baseline.length,90);assert.deepEqual(data.filter(q=>baselineIds.has(q.id)),baseline);
assert.equal(data.length,446);assert.equal(workbook.length,346);assert.equal(tags.size,15);
assert.deepEqual(source.existingTopics,existingTopics);assert.deepEqual(source.addedTopics,newTopics);
assert.equal(new Set(data.map(q=>q.id)).size,data.length);
const key=['42233','32341','33124','31213','42123','44233','34214','41433','32432','44441','21323','13234','34141','42334','43334','41213','12341','23421','42323','31423','23432','42341','42441','23124','23314','33133','43323','23332','13233','41441','21423','43432','23241','44134','34431','33133','13411','22344','33232','23143','24313','21431','24123','43133','13114','21423','31342','24412','21433','41212','21233','41223','32144','41423','32421','24143','23241','34123','24134','41122','12441','34241','33144','34143','23231','23134','12234','24341','32312','4'].join('');
assert.equal(key.length,346);assert.equal(source.answerKey,key);
const coverage=new Set();
for(const [i,q] of workbook.entries()){
  assert.equal(q.id,`통치의기본구조_워크북_${String(i+1).padStart(3,'0')}`);
  assert.equal(q.workbookNumber,i+1);assert.equal(q.type,'mc');assert.equal(q.contentFormat,'text');
  assert.ok(!Object.keys(q).some(k=>/image/i.test(k)),q.id);
  assert.equal(q.choices.length,4);assert.ok(q.choices.every(c=>typeof c==='string'&&c.trim()),q.id);
  assert.ok(q.question.includes('?'),q.id);assert.ok(q.explanation.trim());assert.ok(tags.has(q.topic));
  assert.equal(q.answer,Number(key[i])-1);assert.equal(q.printedAnswer,'①②③④'[q.answer]);
  assert.equal(q.answerSource,'워크북 인쇄 정답');
  assert.equal(q.topic,source.sections[q.workbookSection-1].topic);
  const hasExplanation=q.explanationSource==='워크북 인쇄 해설';
  assert.equal(source.questions[i].hasPrintedExplanation,hasExplanation);
  if(!hasExplanation){assert.equal(q.explanationSource,'원문 해설 없음');assert.equal(q.explanation,'원문에 해설이 없습니다.');}
  assert.ok(q.workbookPages.includes(q.workbookPage));q.workbookPages.forEach(p=>coverage.add(p));
  assert.deepEqual(source.questions[i].printedPages,q.workbookPages);assert.equal(source.questions[i].id,q.id);
  assert.equal(source.questions[i].printedAnswer,q.printedAnswer);assert.ok(source.questions[i].answerImageScore>.96);
  assert.ok(source.questions[i].videoSeconds.every(t=>t>=474&&t<620.64));
  const text=q.question+q.choices.join('')+q.explanation;
  assert.ok(!/[\uFFFD\uE000-\uF8FFㅏ-ㅣ]/.test(text),q.id);
  assert.ok(!/원문 이미지|판독 불가|확인 필요|<[^>]+>/.test(text),q.id);
  assert.ok(!/[①-④]/.test(q.choices.join('')),q.id);
}
assert.equal(source.questionCount,346);assert.equal(source.choiceCount,1384);
assert.equal(source.independentImageAnswerCount,346);
assert.equal(source.sourceBytes,688912833);
assert.equal(source.sourceSha256,'bf7c9978417f70a0d96dee36d892665252963ce9cfe2f4ad835efc4fa10748e7');
assert.equal(source.printedExplanationCount,251);assert.equal(source.noPrintedExplanationCount,95);
assert.equal(workbook.filter(q=>q.explanationSource==='워크북 인쇄 해설').length,251);
assert.equal(workbook.filter(q=>q.explanationSource==='원문 해설 없음').length,95);
assert.deepEqual([...coverage].sort((a,b)=>a-b),Array.from({length:136},(_,i)=>i+5));
assert.deepEqual(source.sections.map(s=>s.count),[26,7,34,9,48,34,7,32,8,13,12,7,37,27,45]);
for(const section of source.sections){assert.deepEqual(workbook.filter(q=>q.workbookSection===section.section).map(q=>q.originalNumber),Array.from({length:section.count},(_,i)=>i+1));}
assert.deepEqual(source.topicCounts,Object.fromEntries([...tags].map(t=>[t,workbook.filter(q=>q.topic===t).length])));
assert.equal(source.topicCounts['국회의 입법과 재정에 관한 권한'],57);
const q=n=>workbook[n-1];
assert.match(q(2).question,/㉠____과 ㉡____/);assert.equal(q(23).question.match(/____/g).length,2);
assert.deepEqual(q(72).choices,['㉠','㉡','㉢','㉣']);assert.equal(q(72).answer,2);
assert.match(q(218).question,/투표용지/);assert.match(q(218).question,/\( {4}\)/);
assert.match(q(259).choices[2],/…한 행위.*…권/);assert.match(q(259).choices[3],/…법 제…조 제…항/);
assert.match(q(286).choices[0],/訴追議決書/);assert.match(q(312).question,/不作爲/);assert.match(q(342).choices[0],/私人/);
assert.equal(q(298).answer,0);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const [,code]of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(code);
function functionSource(name){const start=html.indexOf('function '+name+'(');assert.ok(start>=0);return html.slice(start,html.indexOf('\n}',start)+2);}
const ctx=vm.createContext({NUMS:['①','②','③','④','⑤']});
vm.runInContext(['formatCorrectAnswer','checkMCAnswer','isCorrectChoice'].map(functionSource).join('\n'),ctx);
for(const item of workbook){
  for(let i=0;i<4;i++){assert.equal(ctx.isCorrectChoice(i,item.answer),i===item.answer);assert.equal(ctx.checkMCAnswer(i,item.answer),i===item.answer);}
  assert.equal(ctx.formatCorrectAnswer(item),ctx.NUMS[item.answer]+' '+item.choices[item.answer]);
}
console.log('PASS: 346 text workbook questions, 1384 choices, 346 verified printed keys, 251 printed explanations / 95 absent, 5 approved new tags, grading; 90 originals unchanged.');

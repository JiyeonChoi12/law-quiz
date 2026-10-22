import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const data=read('data/주식회사법.json'),source=read('data/sources/주식회사법_워크북_출처.json');
const baseline=JSON.parse(execFileSync('git',['show','9da931ce909818dcae8fe32f9ff0a9464879345d:data/주식회사법.json'],{cwd:root,encoding:'utf8'}));
const workbook=data.filter(q=>q.source==='워크북'),tags=new Set(baseline.map(q=>q.topic));
assert.equal(baseline.length,60);assert.deepEqual(data.filter(q=>q.source!=='워크북'),baseline);
assert.equal(data.length,209);assert.equal(workbook.length,149);assert.equal(tags.size,15);
assert.equal(new Set(data.map(q=>q.id)).size,data.length);
const key=['32232','13443','14313','31423','23443','34433','21344','32331','41214','31343','13414','24333','21333','11143','32213','32421','23412','44434','21123','44344','13411','34122','23441','41121','31432','13232','31213','24113','12434','2113'].join('');
assert.equal(key.length,149);assert.equal(source.answerKey,key);
const coverage=new Set();
for(const [i,q] of workbook.entries()){
  assert.equal(q.id,`주식회사법_워크북_${String(i+1).padStart(3,'0')}`);
  assert.equal(q.workbookNumber,i+1);assert.equal(q.type,'mc');assert.equal(q.contentFormat,'text');assert.ok(!q.image);
  assert.equal(q.choices.length,4);assert.ok(q.choices.every(c=>typeof c==='string'&&c.trim()));
  assert.ok(q.question.includes('?'),q.id);assert.ok(q.explanation.trim());assert.ok(tags.has(q.topic));
  assert.equal(q.answer,Number(key[i])-1);assert.equal(q.printedAnswer,'①②③④'[q.answer]);
  assert.equal(q.answerSource,'워크북 인쇄 정답');assert.equal(q.explanationSource,'워크북 인쇄 해설');
  assert.equal(q.topic,source.sections[q.workbookSection-1].topic);
  assert.ok(q.workbookPages.includes(q.workbookPage));q.workbookPages.forEach(p=>coverage.add(p));
  assert.deepEqual(source.questions[i].printedPages,q.workbookPages);assert.equal(source.questions[i].id,q.id);
  assert.ok(source.questions[i].answerImageScore>.9);
  assert.ok(source.questions[i].videoSeconds.every(t=>t>=456&&t<620));
  const text=q.question+q.choices.join('')+q.explanation;
  assert.ok(!/[\uFFFD\uE000-\uF8FF㉠-㉻ㅏ-ㅣ]/.test(text),q.id);
  assert.ok(!/원문 이미지|판독 불가|확인 필요|<[^>]+>/.test(text),q.id);
  assert.ok(!/[①-④]/.test(q.choices.join('')),q.id);
}
assert.equal(source.questionCount,149);assert.equal(source.choiceCount,596);
assert.equal(source.independentImageAnswerCount,149);
assert.equal(source.sourceBytes,693286000);
assert.equal(source.sourceSha256,'f124080ce566fe53061b0e4db225925772803607b4134acac30a6696e2971336');
assert.deepEqual([...coverage].sort((a,b)=>a-b),source.exercisePageRanges.flatMap(([a,b])=>Array.from({length:b-a+1},(_,i)=>a+i)));
assert.deepEqual(source.sections.map(s=>s.count),[10,10,10,10,13,7,10,10,10,10,10,9,10,10,10]);
for(const section of source.sections){assert.deepEqual(workbook.filter(q=>q.workbookSection===section.section).map(q=>q.originalNumber),Array.from({length:section.count},(_,i)=>i+1));}
assert.deepEqual(source.topicCounts,Object.fromEntries([...tags].map(t=>[t,workbook.filter(q=>q.topic===t).length])));
const q=n=>workbook[n-1];
assert.match(q(7).explanation,/13\. 기타:/);assert.match(q(119).explanation,/법원에서 선임한 경우의 직무[\s\S]*주총에서 선임한 경우의 직무/);
assert.equal(workbook.filter(q=>q.question.includes('[공통 지문]')).length,9);
assert.deepEqual(q(29).choices,['甲','甲, 乙','乙, 丙','甲, 乙, 丙']);
assert.match(q(55).question,/甲.*乙/);assert.match(q(36).choices[1],/假設人/);
assert.match(q(78).question,/訴/);assert.match(q(92).choices[0],/訴/);
assert.equal(q(99).answer,3);assert.match(q(94).question,/\[문제 3\]/);
assert.deepEqual(q(125).choices,['변경등기일로부터 6월 경과','변경등기일로부터 1년 경과','변경등기일로부터 2년 경과','변경등기일로부터 즉시']);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const [,code]of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(code);
function functionSource(name){const start=html.indexOf('function '+name+'(');assert.ok(start>=0);return html.slice(start,html.indexOf('\n}',start)+2);}
const ctx=vm.createContext({NUMS:['①','②','③','④','⑤']});
vm.runInContext(['formatCorrectAnswer','checkMCAnswer','isCorrectChoice'].map(functionSource).join('\n'),ctx);
for(const item of workbook){
  for(let i=0;i<4;i++){assert.equal(ctx.isCorrectChoice(i,item.answer),i===item.answer);assert.equal(ctx.checkMCAnswer(i,item.answer),i===item.answer);}
  assert.equal(ctx.formatCorrectAnswer(item),ctx.NUMS[item.answer]+' '+item.choices[item.answer]);
}
console.log('PASS: 149 text workbook questions, 596 choices, printed keys, 15 existing tags, shared passages, table explanations, grading; 60 originals unchanged.');

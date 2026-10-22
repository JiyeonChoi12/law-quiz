import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const data=read('data/물권법.json');
const source=read('data/sources/물권법_워크북_출처.json');
const baseline=JSON.parse(execFileSync('git',['show','703838fb434ec7fad3f9827538ee44a5e40675c3:data/물권법.json'],{cwd:root,encoding:'utf8'}));
const workbook=data.filter(q=>q.source==='워크북');
assert.equal(baseline.length,123);
assert.deepEqual(data.filter(q=>q.source!=='워크북'),baseline,'Existing questions must remain unchanged');
assert.equal(data.length,358);assert.equal(workbook.length,235);
assert.equal(new Set(data.map(q=>q.id)).size,data.length);
const tags=new Set(baseline.map(q=>q.topic));
const key='1353223522253114452521424112431545124322454415555552335332225211452121434535433512414333113342514211135412452554124435224131133425325322315314442422125524214333453312233545552324142543433515211251435345445512443234231535443343552354212';
assert.equal(key.length,235);assert.equal(source.answerKey,key);
const coverage=new Set();
for(const [i,q]of workbook.entries()){
  assert.equal(q.id,`물권법_워크북_${String(i+1).padStart(3,'0')}`);
  assert.equal(q.workbookNumber,i+1);assert.equal(q.type,'mc');
  assert.equal(q.contentFormat,'text');assert.ok(!q.image);
  assert.equal(q.choices.length,5);assert.ok(q.choices.every(x=>typeof x==='string'&&x.trim()));
  assert.ok(q.question.trim()&&q.explanation.trim());assert.ok(tags.has(q.topic),q.topic);
  assert.equal(q.answer,Number(key[i])-1,q.id);
  assert.equal(q.answerSource,'워크북 인쇄 정답');assert.equal(q.explanationSource,'워크북 인쇄 해설');
  assert.ok(q.workbookPage>=5&&q.workbookPage<=194);
  assert.ok(q.workbookPages.includes(q.workbookPage));
  q.workbookPages.forEach(p=>coverage.add(p));
  assert.ok(!/[\uFFFD\uE000-\uE007©ω§¤ㄱ-ㅎㅏ-ㅣ]/.test(q.question+q.choices.join('')+q.explanation),q.id);
  assert.ok(!/원문 이미지|원문 [①②③④⑤]번 보기|\(\)/.test(q.question+q.choices.join('')+q.explanation),q.id);
  assert.equal(source.questions[i].id,q.id);
  assert.deepEqual(source.questions[i].printedPages,q.workbookPages);
}
assert.deepEqual([...coverage].sort((a,b)=>a-b),Array.from({length:190},(_,i)=>i+5));
assert.equal(source.questionCount,235);assert.equal(source.questions.length,235);
const actualCounts=Object.fromEntries([...tags].map(t=>[t,workbook.filter(q=>q.topic===t).length]));
assert.deepEqual(source.topicCounts,actualCounts);
const q=n=>workbook[n-1];
assert.match(q(36).choices[3],/의사에 좇아/);
assert.match(q(56).choices[2],/매수인 C$/);
assert.match(q(88).choices[4],/水流地.*對岸.*堰/);
assert.match(q(139).explanation,/\[발생원인\][\s\S]*\[등기\][\s\S]*\[소멸시효\]/);
assert.deepEqual(q(145).choices,['㉠, ㉡, ㉢, ㉧','㉣, ㉦, ㉧','㉠, ㉡, ㉣, ㉦','㉣, ㉥, ㉧','㉡, ㉥, ㉦, ㉧']);
assert.match(q(233).question,/㉠[\s\S]*㉡[\s\S]*㉢[\s\S]*㉣[\s\S]*㉤[\s\S]*㉥/);
assert.match(q(233).choices[1],/㉠ 담보계약.*㉢ 대물반환의 예약.*㉥ 설정자/);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const [,code]of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(code);
assert.match(html,/워크북/);assert.match(html,/⑤/);
assert.match(html,/\.fb-exp,\.r-exp,\.wn-exp\{white-space:pre-line;\}/);
function functionSource(name){
  const start=html.indexOf('function '+name+'(');assert.ok(start>=0);
  return html.slice(start,html.indexOf('\n}',start)+2);
}
const ctx=vm.createContext({NUMS:['①','②','③','④','⑤']});
vm.runInContext(['formatCorrectAnswer','checkMCAnswer','isCorrectChoice'].map(functionSource).join('\n'),ctx);
for(const item of workbook){
  for(let i=0;i<5;i++)assert.equal(ctx.checkMCAnswer(i,item.answer),i===item.answer,item.id);
  assert.equal(ctx.formatCorrectAnswer(item),ctx.NUMS[item.answer]+' '+item.choices[item.answer]);
  assert.ok(!/<[^>]+>/.test(item.explanation),item.id+' explanation must not contain accidental HTML');
}
console.log('PASS: 235 text workbook questions, 235 printed answers, 15 existing tags, pp.5–194, 123 original questions unchanged.');

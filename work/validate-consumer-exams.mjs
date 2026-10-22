import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const data=read('data/소비자법.json');
const source=read('data/sources/소비자법_기출_출처.json');
const baseline=JSON.parse(execFileSync('git',['show','da48cd83ab51daa38a271f08904f32698c691398:data/소비자법.json'],{cwd:root,encoding:'utf8'}));
const past=data.filter(q=>q.id.startsWith('소비자법_기출'));
assert.equal(data.length,343);
assert.equal(past.length,280);
assert.deepEqual(data.filter(q=>q.source==='형성평가'),baseline.filter(q=>q.source==='형성평가'));
assert.deepEqual(data.filter(q=>q.year===2016),baseline.filter(q=>q.year===2016));
assert.equal(new Set(data.map(q=>q.id)).size,data.length);
const keys={2014:'43311234121342134114433212322431431',2015:'44441231233411342332341124343213234',2016:'11432243214323142413132321423422341',2017:'11423134224223334221332243441342441',2018:'34231441121324143221144341332121414',2019:'43123144331212212423113311221314234'};
for(let year=2012;year<=2019;year++){
  const qs=past.filter(q=>q.year===year);
  assert.equal(qs.length,35);
  assert.deepEqual(qs.map(q=>q.originalNumber),Array.from({length:35},(_,i)=>i+36));
  for(const [i,q] of qs.entries()){
    assert.equal(q.source,'기출문제');assert.equal(q.contentFormat,'text');assert.ok(!q.image,q.id);
    assert.equal(q.choices.length,4,q.id);
    assert.ok(q.choices.every(c=>typeof c==='string'&&c.trim().length>0),q.id);
    assert.ok(!/원문 이미지|원문 [①②③④]번 보기|출제위원|출제범위|\uFFFD/.test(q.question+q.choices.join('')),q.id);
    assert.ok(q.topic&&q.explanation&&q.answerSource,q.id);
    for(const a of Array.isArray(q.answer)?q.answer:[q.answer])assert.ok(Number.isInteger(a)&&a>=0&&a<4,q.id);
    if(year>=2014){
      assert.equal(q.answer,Number(keys[year][i])-1,q.id);
      assert.equal(source.answerKey.rows[year],keys[year]);
      assert.equal(q.explanationSource,'공식 해설 미제공');
    }else{
      assert.equal(q.answerSource,'자체 풀이(공식 정답 아님)');
      assert.match(q.question,/자체 풀이/);assert.match(q.explanation,/공식 정답\/공식 해설 아님/);
    }
  }
}
for(const old of baseline.filter(q=>q.source==='기출문제')){
  const q=data.find(q=>q.id===old.id);
  for(const field of ['answer','topic','year','originalNumber','answerSource'])assert.deepEqual(q[field],old[field],old.id+' '+field);
}
const q=(y,n)=>past.find(q=>q.year===y&&q.originalNumber===n);
for(const n of [58,59])assert.match(q(2013,n).question,/M피부관리샾.*150만원/s);
for(const n of [49,50])assert.match(q(2017,n).question,/10년.*위약금/s);
for(const n of [51,52])assert.match(q(2017,n).question,/㉠.*㉡.*㉢.*㉣/s);
assert.deepEqual(q(2017,50).choices,['3영업일, 발송','7영업일, 도달','3영업일, 도달','7영업일, 발송']);
assert.deepEqual(q(2018,46).choices,['(a) ×, (b) ○','(a) ×, (b) ×','(a) ○, (b) ○','(a) ○, (b) ×']);
assert.equal(q(2018,56).choices[1],q(2018,56).choices[3]);
assert.match(q(2019,58).question,/300,000원.*3,000,000원/s);
assert.deepEqual(q(2012,54).answer,[2,3]);assert.deepEqual(q(2013,56).answer,[0,1,3]);
assert.equal(past.filter(q=>q.reviewRequired).length,2);
assert.equal(source.publishedQuestionCount,past.length);
assert.equal(source.officialAnswerQuestionCount,210);assert.equal(source.selfSolvedQuestionCount,70);
assert.equal(source.attachments.filter(a=>a.published&&a.contentFormat==='text').length,8);
const imageDir=path.join(root,'data/images/consumer-past-exams');
assert.ok(!fs.existsSync(imageDir)||fs.readdirSync(imageDir).length===0);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const [,code] of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(code);
function functionSource(name){
  const start=html.indexOf('function '+name+'(');assert.ok(start>=0);
  return html.slice(start,html.indexOf('\n}',start)+2);
}
const ctx=vm.createContext({NUMS:['①','②','③','④']});
vm.runInContext(['formatCorrectAnswer','checkMCAnswer','isCorrectChoice'].map(functionSource).join('\n'),ctx);
assert.equal(ctx.checkMCAnswer([3,0,1],[0,1,3]),true);
assert.equal(ctx.checkMCAnswer([0,1],[0,1,3]),false);assert.equal(ctx.checkMCAnswer(2,2),true);
assert.equal(ctx.isCorrectChoice(1,[0,1,3]),true);
assert.equal(ctx.formatCorrectAnswer({type:'mc',answer:[0,2],choices:['A','B','C','D']}),'① A, ③ C');
let bm={old:{q:baseline.find(q=>q.image)}},wn={old:{q:baseline.find(q=>q.image),wrongCount:3,lastMyAns:'② 원문 ②번 보기'},other:{q:{id:'unrelated'},wrongCount:1}};
const migration=vm.createContext({getBM:()=>bm,saveBM:(_k,v)=>bm=v,getWN:()=>wn,saveWN:(_k,v)=>wn=v});
vm.runInContext(functionSource('refreshConsumerSavedQuestions'),migration);
migration.refreshConsumerSavedQuestions(data);
assert.ok(!bm.old.q.image&&!wn.old.q.image);assert.equal(wn.old.wrongCount,3);
assert.equal(wn.old.lastMyAns,'② 원문 ②번 보기');assert.equal(wn.other.q.id,'unrelated');
console.log('PASS: 280 text exams (210 official / 70 self-solved), 63 unchanged formative; existing IDs/answers; common passages; multiple-answer grading; saved-progress migration.');

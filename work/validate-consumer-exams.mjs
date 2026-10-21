import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const data=read('data/소비자법.json');
const source=read('data/sources/소비자법_기출_출처.json');
const added=data.filter(q=>q.id.startsWith('소비자법_기출'));
assert.equal(data.filter(q=>q.source==='형성평가').length,63);
assert.equal(added.length,175);
assert.equal(new Set(data.map(q=>q.id)).size,data.length);
const keys={
  2015:'44441231233411342332341124343213234',
  2016:'11432243214323142413132321423422341',
  2017:'11423134224223334221332243441342441',
  2018:'34231441121324143221144341332121414',
  2019:'43123144331212212423113311221314234',
};
for(const [year,key] of Object.entries(keys)){
  const questions=added.filter(q=>q.year===Number(year));
  assert.equal(questions.length,35);
  assert.equal(source.answerKey.rows[year],key);
  assert.deepEqual(questions.map(q=>q.originalNumber),Array.from({length:35},(_,i)=>i+36));
  for(const [i,q] of questions.entries()){
    assert.equal(q.answer,Number(key[i])-1,q.id);
    assert.equal(q.source,'기출문제');
    assert.equal(q.choices.length,4);
    assert.ok(q.topic&&q.explanation&&q.answerSource);
    assert.equal(q.explanationSource,'공식 해설 미제공');
    if(q.image){
      assert.ok(!q.image.includes('..'));
      assert.ok(fs.statSync(path.join(root,q.image)).size>1000);
      assert.ok(q.width>500&&q.height>80);
    }else{
      assert.equal(q.year,2016);
      assert.ok(!q.choices.some(c=>/생활법률|비자법 6|2016학년도/.test(c)),q.id);
    }
  }
}
assert.equal(added.filter(q=>q.image).length,140);
assert.equal(source.publishedQuestionCount,added.length);
assert.deepEqual(source.attachments.filter(a=>!a.published).map(a=>a.year),[2012,2013,2014]);
console.log('PASS: 175 official-key past exams; 63 formative questions; 140 image assets.');

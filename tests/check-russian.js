// Checks the Russian content against the OpenRussian dictionary data
// (CC BY-SA, github.com/Badestrand/russian-dictionary):
//  1. every word-list entry is well formed and unique, with one coverage weight each
//  2. every stress mark sits on a vowel and matches the dictionary (reviewed exceptions below)
//  3. every drill answer (noun cases, adjective + noun, present/past verbs, plurals)
//     matches the dictionary's tables
// Run: npm run test:russian   (downloads ~23 MB of dictionary data once into tests/.cache)
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.resolve(__dirname,'..'),CACHE=path.join(__dirname,'.cache');
const SRC='https://raw.githubusercontent.com/Badestrand/russian-dictionary/master/';
// Stress marks reviewed by hand where the dictionary matched a different word or form.
const ALLOW=new Set(['виду́','мо́ему','тво́ему','подде́рживать','полчаса́','почита́ть']);
let failed=0;const fail=m=>{console.log('  FAIL '+m);failed++};
async function tsv(name){
  fs.mkdirSync(CACHE,{recursive:true});const f=path.join(CACHE,name+'.csv');
  if(!fs.existsSync(f)){const r=await fetch(SRC+name+'.csv');if(!r.ok)throw new Error('download failed: '+name);fs.writeFileSync(f,Buffer.from(await r.arrayBuffer()))}
  const [h,...rows]=fs.readFileSync(f,'utf8').split(/\r?\n/);const H=h.split('\t');
  return rows.filter(Boolean).map(l=>{const c=l.split('\t'),o={};H.forEach((k,i)=>o[k]=c[i]||'');return o});
}
const strip=x=>x.replace(/́/g,''),low=x=>strip(x).toLowerCase().replace(/ё/g,'е');
(async()=>{
const data=fs.readFileSync(path.join(ROOT,'js/data.js'),'utf8');
const app=fs.readFileSync(path.join(ROOT,'js/app.js'),'utf8');
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const ctx={};vm.createContext(ctx);vm.runInContext(data.replace(/^const /gm,'globalThis.'),ctx);
const grab=name=>{const m=app.match(new RegExp('const '+name+'=(\\[[\\s\\S]*?\\]\\]);'));vm.runInContext('globalThis.'+name+'='+m[1],ctx);return ctx[name]};
const nouns=grab('nouns'),adjs=grab('adjs');
vm.runInContext(app.match(/(const AE=[\s\S]*?const adjForm=[^\n]*)/)[1].replace(/^const /gm,'globalThis.'),ctx);
const dict={},forms=new Map();
for(const fn of ['nouns','verbs','adjectives','others'])for(const r of await tsv(fn)){
  const k=r.bare.toLowerCase().replace(/ё/g,'е');(dict[fn]??={})[k]??=r;
  for(const [col,v] of Object.entries(r)){
    if(!v.includes("'")||/^(translations|usage)/.test(col))continue;
    for(const f of v.split(/[,;/ ]+/)){
      if(!f.includes("'"))continue;const b=f.replace(/'/g,'').toLowerCase();const pos=[];let n=0;
      for(let i=0;i<f.length;i++){if(f[i]==="'"){pos.push(i-1-n);n++}}
      if(!forms.has(b))forms.set(b,new Set());pos.forEach(p=>forms.get(b).add(p));
    }
  }
}
console.log('1. word list');
const seen=new Set();let n=0;
for(const e of ctx.FREQ.split(';')){n++;const parts=e.split('=');if(parts.length!==2){fail('malformed entry: '+e);continue}
  const k=low(parts[0]);if(seen.has(k))fail('duplicate: '+parts[0]);seen.add(k)}
if(ctx.FW.length!==n)fail(`weights (${ctx.FW.length}) do not match words (${n})`);
console.log(`  ${n} entries checked`);
console.log('2. stress marks');
const V='аеёиоуыэюя';let sc=0;
for(const t of new Set((data+app+html).match(/[А-Яа-яЁё́]+/g))){
  if(!t.includes('́')||t==='́')continue;
  const b=strip(t).toLowerCase(),pos=[];let k=0;for(let i=0;i<t.length;i++){if(t[i]==='́'){pos.push(i-1-k);k++}}
  if(pos.some(p=>p<0||!V.includes(b[p]))){fail('stress mark not on a vowel: '+t);continue}
  sc++;const f=forms.get(b);if(!f||ALLOW.has(t.toLowerCase()))continue;
  if(!pos.every(p=>f.has(p)))fail(`stress differs from dictionary: ${t}`);
}
console.log(`  ${sc} stressed words checked`);
console.log('3. drill answers');
const has=(v,cell)=>cell.split(',').map(x=>x.replace(/'/g,'').trim().toLowerCase().replace(/ё/g,'е')).includes(low(v));let dc=0;
for(const x of nouns){const r=dict.nouns[low(x[0])];if(!r){fail('noun not in dictionary: '+x[0]);continue}
  ['sg_gen','sg_dat','sg_acc','sg_inst','sg_prep'].forEach((c,i)=>{dc++;if(!has(x[2+i],r[c]))fail(`${x[0]} ${c}: ${x[2+i]} (dictionary: ${r[c]})`)})}
const CI=['gen','dat','acc','inst','prep'];
for(const a of adjs)for(const x of nouns)for(let ci=0;ci<5;ci++){
  const r=dict.adjectives[low(a[0])];dc++;const f=ctx.adjForm(a,x,ci),c=`decl_${x[7]}_${CI[ci]}`;
  if(!has(f,r[c]))fail(`${a[0]} + ${x[0]} ${CI[ci]}: ${f} (dictionary: ${r[c]})`);
}
for(const v of ctx.DAT.VB){const r=dict.verbs[low(v[0])];if(!r){fail('verb not in dictionary: '+v[0]);continue}
  ['presfut_sg1','presfut_sg2','presfut_sg3','presfut_pl1','presfut_pl2','presfut_pl3'].forEach((c,i)=>{dc++;if(!has(v[2][i],r[c]))fail(`${v[0]} ${c}: ${v[2][i]}`)});
  const st=strip(v[0]).replace(/ть$/,''),past=v[3]||[st+'л',st+'ла',st+'ли'];
  ['past_m','past_f','past_pl'].forEach((c,i)=>{dc++;if(!has(past[i],r[c]))fail(`${v[0]} ${c}: ${past[i]}`)});
}
for(const x of ctx.DAT.PL){const r=dict.nouns[low(x[0])];dc+=2;
  if(!has(x[2],r.pl_nom))fail(`${x[0]} pl_nom: ${x[2]}`);if(!has(x[3],r.pl_gen))fail(`${x[0]} pl_gen: ${x[3]}`)}
console.log(`  ${dc} forms checked`);
console.log(failed?`\n${failed} check(s) failed`:'\nAll Russian checks passed');process.exit(failed?1:0);
})().catch(e=>{console.error(e);process.exit(1)});

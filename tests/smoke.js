// Browser smoke test: loads the site at phone and desktop widths and drives every feature.
// Run: npm test   (needs Playwright's Chromium: npx playwright install chromium)
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const URL='file://'+path.resolve(__dirname,'../index.html');
let failed=0;const ok=(c,msg)=>{console.log((c?'  ok   ':'  FAIL ')+msg);if(!c)failed++};
(async()=>{
const b=await chromium.launch();
for(const [w,scheme] of [[390,'light'],[1280,'dark']]){
  console.log(`\n${w}px, ${scheme}`);
  const ctx=await b.newContext({viewport:{width:w,height:850},colorScheme:scheme});const p=await ctx.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(URL);await p.waitForTimeout(800);
  ok(errs.length===0,'no script errors '+errs.join('; '));
  ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no sideways scrolling');
  // coverage data
  const cov=await p.evaluate(()=>({n:FREQ.split(';').length,sum:FW.reduce((a,b)=>a+b,0)}));
  ok((await p.textContent('#covTxt')).includes('2,048 words → ≈86%'),'coverage meter shows the real total');
  ok(cov.n>=2000,`word list has ${cov.n} words`);
  ok(cov.sum>80&&cov.sum<95,`word list covers ${cov.sum.toFixed(1)}% of everyday speech`);
  // flashcards
  await p.click('#dirR');await p.selectOption('#cat','0');
  const first=await p.textContent('#cRu');await p.click('#know');
  ok(await p.textContent('#cRu')!==first,'Good moves to the next card');
  ok((await p.textContent('#newToday')).startsWith('1 '),'new word counted for today');
  ok(await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('rb-srs'));return Object.values(s).every(c=>c.length===3&&c[0]>=1)}),'spaced-repetition state saved');
  await p.click('#flip');ok(await p.evaluate(()=>document.getElementById('card').classList.contains('flip')),'Show answer flips the card');
  // production direction
  await p.click('#dirP');await p.selectOption('#cat','0');
  const ans=await p.textContent('#cEn');await p.fill('#pIn',ans);await p.click('#pRow button');
  ok((await p.textContent('#pFb')).startsWith('Верно'),'typed Russian answer accepted');
  await p.click('#dirR');
  // verb factory
  for(const m of ['conj','past','plur']){
    await p.click(`#vtabs [data-m="${m}"]`);await p.click('#vShow');
    ok((await p.textContent('#vFb')).includes('Answer'),`verb drill "${m}" shows an answer`);
  }
  // case factory
  await p.click('#fShow');ok((await p.textContent('#fFb')).length>2,'case drill shows an answer');
  // reading
  await p.click('#issues .tab:nth-child(3)');ok((await p.textContent('#issueTag')).includes('№ 3'),'reading issue 3 opens');
  // mock exam
  await p.click('#mGo');ok((await p.$$('.mq')).length>=30,'mock exam renders');await p.click('#mFin');
  ok((await p.$$('#mockBox tbody tr')).length===4,'mock exam scores four parts');
  // backup
  await p.click('#bMake');ok((await p.inputValue('#bOut')).startsWith('RYBOK1:'),'backup code created');
  // today screen
  ok((await p.$$('#tgrid .tc')).length===5,'Today screen shows five cards');
  // accessibility
  await p.reload();await p.waitForTimeout(500);
  await p.addScriptTag({content:fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8')});
  const v=await p.evaluate(async()=>(await axe.run(document,{runOnly:['wcag2a','wcag2aa']})).violations.map(x=>x.id+' x'+x.nodes.length));
  ok(v.length===0,'no WCAG A/AA violations '+v.join(', '));
  await ctx.close();
}
await b.close();
console.log(failed?`\n${failed} check(s) failed`:'\nAll UI checks passed');process.exit(failed?1:0);
})();

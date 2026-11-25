{
const $=s=>document.querySelector(s);
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const say=t=>{try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t.replace(/́/g,''));u.lang='ru-RU';u.rate=VO.r;const v=ruVoices.find(x=>x.name===VO.v)||ruVoices[0];if(v)u.voice=v;speechSynthesis.speak(u)}catch(e){}};
const spk='<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z"/></svg>';
const shuf=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const today=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/864e5);
const log=store.get('rb-log',{});
const L=()=>log[today()]||(log[today()]=[0,0]);
const saveLog=()=>store.set('rb-log',log);
const cap=()=>+store.get('rb-cap',35);
let START=store.get('rb-start',null);if(START===null){START=today();store.set('rb-start',START)}
const weekNow=()=>Math.min(8,Math.max(1,Math.floor((today()-START)/7)+1));
let todayDraw=()=>{},normAuto=()=>{};
const VO={v:store.get('rb-voice',''),r:+store.get('rb-rate',.9)};
let ruVoices=[];
const nz=x=>x.toLowerCase().replace(/́/g,'').replace(/ё/g,'е').replace(/\s+/g,' ').trim();

/* frequency list + coverage */
const strip=w=>w.replace(/\u0301/g,'');
const FL=[];{const seen=new Set();FREQ.split(';').forEach(e=>{const [w,t]=e.split('=');const k=strip(w);if(!seen.has(k)){seen.add(k);FL.push({w,t,k,r:FL.length+1})}})}
const NW=FL.length;
const WT=FL.map((e,i)=>FW[i]||0);
let youN=0,youC=0;
const youMark=(x,y,sm)=>{if(!youN)return'';const X=x(Math.min(youN,10000)),Y=y(youC),lab=`You: ${youN} words ≈ ${Math.round(youC)}%`;
return `<circle cx="${X}" cy="${Y}" r="8" fill="#fff" stroke="#16110e" stroke-width="3"/><text x="${X+14}" y="${Y+26}" style="font:700 ${sm?14:16}px Oswald,sans-serif;paint-order:stroke;stroke:#c8161d;stroke-width:5px">${lab}</text>`};
/* production chart */
const pts=CURVE;const at=n=>(pts.find(p=>p[0]===n)||[0,0])[1];
const cs=$('#cs');
const draw=()=>{const W=cs.clientWidth,H=cs.clientHeight,sm=W<520,ml=sm?34:44,mr=sm?8:20,mt=14,mb=32;
const x=v=>ml+v/10000*(W-ml-mr),y=v=>mt+(1-v/100)*(H-mt-mb);
const P=a=>a.map((p,i)=>(i?'L':'M')+x(p[0]).toFixed(1)+','+y(p[1]).toFixed(1)).join('');
const path=P(pts),hi=P(pts.filter(p=>p[0]<=2000))+`L${x(2000)},${y(0)}L${x(0)},${y(0)}Z`;
const xt=(sm?[0,2000,5000,10000]:[0,1000,2000,4000,6000,8000,10000]).map(v=>`<text x="${x(v)}" y="${H-8}" text-anchor="middle">${v.toLocaleString('en')}</text>`).join('');
const yt=[0,20,40,60,80,100].map(v=>`<line x1="${ml}" x2="${W-mr}" y1="${y(v)}" y2="${y(v)}" stroke="#fff" stroke-opacity=".18"/><text x="${ml-8}" y="${y(v)+4}" text-anchor="end">${v}%</text>`).join('');
let stripes='';for(let v=2250;v<10000;v+=sm?500:250)stripes+=`<line x1="${x(v)}" x2="${x(v)}" y1="${y(0)}" y2="${y(0)-8}" stroke="#16110e" stroke-opacity=".35" stroke-width="2"/>`;
cs.innerHTML=yt+`<path d="${path}L${x(10000)},${y(0)}L${x(0)},${y(0)}Z" fill="#16110e" fill-opacity=".28"/>`+stripes+`<path d="${hi}" fill="#f0b323"/><path d="${path}" fill="none" stroke="#fff" stroke-width="3"/>
<line x1="${x(2000)}" x2="${x(2000)}" y1="${y(at(2000))}" y2="${y(0)}" stroke="#16110e" stroke-width="2" stroke-dasharray="5 4"/>
<use href="#star" transform="translate(${x(2000)},${y(at(2000))}) scale(1.4)" fill="#f0b323" stroke="#16110e" stroke-width="1.4"/>
<text x="${W-mr}" y="${y(38)}" text-anchor="end" style="font:700 ${sm?20:30}px Oswald,sans-serif;text-transform:uppercase">≈2,000 words → ≈${Math.round(at(2000))}%</text>
<text x="${W-mr}" y="${y(38)+22}" text-anchor="end" style="font-size:15px">${sm?'of everyday speech':'of everyday spoken Russian.'}</text>
<text x="${W-mr}" y="${y(38)+41}" text-anchor="end" style="font-size:15px">${sm?`8,000 more add ≈${Math.round(at(10000)-at(2000))}%`:`The next 8,000 words add only ≈${Math.round(at(10000)-at(2000))}%.`}</text>`+xt+
`<text x="${W-mr}" y="${y(0)-14}" text-anchor="end" fill-opacity=".85">words known →</text>`+youMark(x,y,sm);};
const ro=new ResizeObserver(draw);ro.observe(cs);

/* routine */
const rt=[['Word drill','Reviews + up to 35 new words',25],['Grammar + drills','One pattern, 20 forms',15],['Listening input','Podcast or video, Russian subtitles',20],['Speak & write','Shadowing + 5 sentences',15]];
$('#routine').innerHTML=rt.map(r=>`<div class="row"><b>${r[0]}</b><div><div class="t" style="width:${r[2]/25*100}%">${r[1]}</div></div><span class="m">${r[2]} min</span></div>`).join('');

/* daily norm */
const norm=store.get('rb-norm',Array(56).fill(false));
const NG=$('#ng');
NG.innerHTML=Array.from({length:8},(_,w)=>`<div class="nr"><span>Нед. ${w+1}</span>${Array.from({length:7},(_,d)=>{const i=w*7+d;return `<button class="cell" type="button" data-i="${i}" aria-label="Week ${w+1}, day ${d+1}" aria-pressed="false"></button>`}).join('')}</div>`).join('');
const normDraw=()=>{let best=0,cur=0;NG.querySelectorAll('.cell').forEach(c=>{const on=!!norm[c.dataset.i];c.classList.toggle('on',on);c.setAttribute('aria-pressed',on);c.classList.toggle('now',+c.dataset.i===today()-START);c.innerHTML=on?'<svg width="60%" height="60%" viewBox="-11 -11 22 22"><use href="#star" fill="currentColor"/></svg>':''});
norm.forEach(v=>{cur=v?cur+1:0;best=Math.max(best,cur)});const n=norm.filter(Boolean).length;$('#nDays').textContent=n;$('#nStreak').textContent=best;$('#nHours').textContent=Math.round(n*1.25)+' h';};
NG.addEventListener('click',e=>{const c=e.target.closest('.cell');if(!c)return;norm[c.dataset.i]=!norm[c.dataset.i];store.set('rb-norm',norm);normDraw()});
const confirm2=(b,label,fn)=>{if(b.dataset.c){fn();b.textContent=label;delete b.dataset.c}else{b.dataset.c=1;b.textContent='Tap again to confirm';setTimeout(()=>{if(b.dataset.c){b.textContent=label;delete b.dataset.c}},4000)}};
$('#nReset').addEventListener('click',e=>confirm2(e.currentTarget,'Clear the norm',()=>{norm.fill(false);store.set('rb-norm',norm);normDraw()}));
normDraw();
normAuto=()=>{const i=today()-START;if(i>=0&&i<56&&L()[1]>=30&&!norm[i]){norm[i]=true;store.set('rb-norm',norm);normDraw()}};

/* plan + ranks */
const weeks=[
['Foundations reset','Alphabet, stress, present tense',['Word list: words 1–250','Master -ать / -ить present tense','Alphabet + the six pronunciation rules','Shadow 10 min of slow Russian daily','Learn 10 chunks from the list','Write 5 sentences about yourself']],
['Where and where to','Prepositional + accusative',['Word list: words 251–500','Где? → в/на + prepositional','Куда? → в/на + accusative','Adjective endings: новый, новая, новое','Put & place: стоять / ставить, лежать / класть','Case factory: 30 correct forms']],
['Have, have not, of','Genitive, numbers, negation',['Word list: words 501–750','у меня есть / у меня нет + gen.','Numbers: 1 книга, 2 книги, 5 книг','из, от, без, для, после','Negation: никто, ничего, нечего','Genitive plurals: лет, людей, минут']],
['Telling what happened','Past tense, aspect, -ся',['Word list: words 751–1000','Past tense: -л, -ла, -ло, -ли','Learn the 15 aspect pairs','Process (читал) vs result (прочитал)','-ся verbs: учиться, встречаться','Record a 1-minute story about yesterday']],
['Plans and movement','Future, motion, imperative',['Word list: words 1001–1250','буду + imperf. vs perfective future','идти/ходить, ехать/ездить + 5 prefixes','Imperative: читай, скажи, давай…','Describe your next weekend','Case factory with adjectives']],
['People and opinions','Dative, instrumental, свой',['Word list: words 1251–1500','Dative: мне нравится / нужно / холодно','Instrumental: с кем, заниматься чем','Verb + case table: 20 verbs','Possessives and свой','Agree and disagree chunks']],
['Linking ideas','B1 complex sentences',['Word list: words 1501–1750','который in every case','Comparatives: лучше, больше, интереснее','если vs если бы, чтобы','потому что / поэтому / хотя','Write a 150-word opinion text']],
['Fluency sprint','ТРКИ-1 style practice',['Words 1751–2048: about 86% coverage','Three 3-minute monologues a day','Role-play: shop, doctor, bank','Gazette issue 8 without the translation','Timed 150-word letter','Take the mock exam']]];
const TT=weeks.reduce((a,w)=>a+w[2].length,0);
const ranks=[[0,'Октябрёнок','Little Octobrist'],[Math.round(TT*.125),'Пионер','Pioneer'],[Math.round(TT*.375),'Комсомолец','Komsomol member'],[Math.round(TT*.625),'Ударник','Shock worker'],[Math.round(TT*.875),'Стахановец','Record-breaker'],[TT,'Герой труда','Hero of labour']];
const done=store.get('rb-done2',{});
const W=$('#weeks');
W.innerHTML=weeks.map((w,i)=>`<article class="wk" id="w${i}"><div class="n">${i+1}</div><div class="f">${w[1]}</div><h3>${w[0]}</h3>${w[2].map((t,j)=>`<label><input type="checkbox" id="c${i}-${j}" ${done[i+'-'+j]?'checked':''}><span>${t}</span></label>`).join('')}</article>`).join('');
const badge=(lvl)=>{let r='';const n=8+lvl*4;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=a+Math.PI/n*.55;r+=`<path d="M0,0L${(58*Math.cos(a)).toFixed(1)},${(58*Math.sin(a)).toFixed(1)}L${(58*Math.cos(b)).toFixed(1)},${(58*Math.sin(b)).toFixed(1)}Z" fill="#c8161d" opacity="${.35+lvl*.12}"/>`}
return r+`<circle r="${30+lvl*2}" fill="#c8161d"/><use href="#star" transform="scale(${2.2+lvl*.15})" fill="#f0b323"/>`;};
const prog=()=>{const n=Object.values(done).filter(Boolean).length,p=Math.round(n/TT*100);let li=0;ranks.forEach((r,i)=>{if(n>=r[0])li=i});
$('#pbar').style.width=p+'%';$('#ptxt').textContent=`${n} of ${TT} plan tasks fulfilled · ${p}%`;$('#rname').textContent=ranks[li][1];
$('#rnext').textContent=li<5?`${ranks[li][2]} · ${ranks[li+1][0]-n} tasks to ${ranks[li+1][1]}`:'Hero of labour · plan fulfilled!';$('#badge').innerHTML=badge(li);
weeks.forEach((w,i)=>$('#w'+i).classList.toggle('done',w[2].every((t,j)=>done[i+'-'+j])));};
W.addEventListener('change',e=>{done[e.target.id.slice(1)]=e.target.checked;store.set('rb-done2',done);prog()});
$('#reset').addEventListener('click',e=>confirm2(e.currentTarget,'Reset plan progress',()=>{Object.keys(done).forEach(k=>delete done[k]);store.set('rb-done2',done);W.querySelectorAll('input').forEach(i=>i.checked=false);prog()}));
prog();

/* alphabet */
const abc=[['А','a','ма́ма',1],['Б','b','брат',3],['В','v','вода́',2],['Г','g','го́род',3],['Д','d','дом',3],['Е','ye','есть',2],['Ё','yo','ёлка',3],['Ж','zh','жить',3],['З','z','зима́',3],['И','ee','и́мя',3],['Й','y','мой',3],['К','k','кот',1],['Л','l','ле́то',3],['М','m','мир',1],['Н','n','нет',2],['О','o','окно́',1],['П','p','па́па',3],['Р','r (rolled)','рука́',2],['С','s','сок',2],['Т','t','там',1],['У','oo','у́тро',2],['Ф','f','фо́то',3],['Х','kh','хлеб',2],['Ц','ts','у́лица',3],['Ч','ch','чай',3],['Ш','sh','шко́ла',3],['Щ','shch','ещё',3],['Ъ','hard sign','подъе́зд',4],['Ы','ɨ (deep i)','мы',3],['Ь','soft sign','день',4],['Э','e','э́то',3],['Ю','yu','юг',3],['Я','ya','я',3]];
$('#abcg').innerHTML=abc.map((a,i)=>`<button class="lt g${a[3]}" type="button" data-i="${i}"><b>${a[0]}${a[0].toLowerCase()}</b><i>${a[1]}</i>${a[2]}</button>`).join('');
$('#abcg').addEventListener('click',e=>{const b=e.target.closest('.lt');if(b)say(abc[b.dataset.i][2])});

/* grammar tabs */
$('#gtabs').addEventListener('click',e=>{const t=e.target.closest('.tab');if(!t)return;document.querySelectorAll('#gtabs .tab').forEach(b=>{b.setAttribute('aria-selected',b===t);$('#'+b.dataset.p).hidden=b!==t})});
const asp=[['де́лать','сде́лать','do / make'],['чита́ть','прочита́ть','read'],['писа́ть','написа́ть','write'],['говори́ть','сказа́ть','say / tell'],['ви́деть','уви́деть','see'],['понима́ть','поня́ть','understand'],['покупа́ть','купи́ть','buy'],['брать','взять','take'],['дава́ть','дать','give'],['начина́ть','нача́ть','begin'],['звони́ть','позвони́ть','call'],['отвеча́ть','отве́тить','answer'],['помога́ть','помо́чь','help'],['забыва́ть','забы́ть','forget'],['встреча́ть','встре́тить','meet']];
$('#aspect').innerHTML=asp.map(a=>`<tr><td class="k">${a[0]}</td><td class="k" style="color:var(--redt)">${a[1]}</td><td>${a[2]}</td></tr>`).join('');

/* flashcards */
const words=[
['Verbs','быть','to be','Я бу́ду до́ма ве́чером.'],['Verbs','мочь','can, be able','Ты мо́жешь мне помо́чь?'],['Verbs','хоте́ть','to want','Я хочу́ пить.'],['Verbs','знать','to know','Я не зна́ю, где он.'],['Verbs','говори́ть','to speak, say','Вы говори́те по-англи́йски?'],['Verbs','сказа́ть','to say (once)','Что он сказа́л?'],['Verbs','де́лать','to do','Что ты де́лаешь?'],['Verbs','ду́мать','to think','Я ду́маю, что ты прав.'],['Verbs','идти́','to go on foot (now)','Я иду́ домо́й.'],['Verbs','е́хать','to go by transport (now)','Мы е́дем на рабо́ту.'],['Verbs','жить','to live','Где ты живёшь?'],['Verbs','рабо́тать','to work','Она́ рабо́тает в ба́нке.'],['Verbs','понима́ть','to understand','Я не понима́ю.'],['Verbs','ви́деть','to see','Я тебя́ ви́жу.'],['Verbs','люби́ть','to love, like','Я люблю́ чита́ть.'],['Verbs','помо́чь','to help (once)','Помоги́те, пожа́луйста!'],['Verbs','взять','to take (once)','Я возьму́ ко́фе.'],['Verbs','купи́ть','to buy (once)','Что ты купи́л?'],['Verbs','ждать','to wait','Подожди́ мину́ту.'],['Verbs','по́мнить','to remember','Я по́мню э́тот день.'],['Verbs','спроси́ть','to ask (once)','Мо́жно спроси́ть?'],['Verbs','отве́тить','to answer (once)','Он не отве́тил.'],['Verbs','смотре́ть','to watch, look','Мы смо́трим фильм.'],['Verbs','слу́шать','to listen','Слу́шай меня́!'],['Verbs','учи́ть','to learn, study','Я учу́ ру́сский.'],['Verbs','сиде́ть','to sit','Он сиди́т до́ма.'],['Verbs','стоя́ть','to stand','Маши́на стои́т тут.'],['Verbs','получи́ть','to receive','Я получи́л письмо́.'],['Verbs','найти́','to find','Я не могу́ найти́ ключи́.'],['Verbs','рассказа́ть','to tell (a story)','Расскажи́ о себе́.'],['Verbs','писа́ть','to write','Я пишу́ письмо́.'],['Verbs','чита́ть','to read','Что ты чита́ешь?'],['Verbs','есть','to eat','Я ем суп.'],['Verbs','пить','to drink','Ты пьёшь ко́фе?'],['Verbs','спать','to sleep','Ребёнок спит.'],
['Nouns','вре́мя','time','У меня́ нет вре́мени.'],['Nouns','челове́к','person','Он хоро́ший челове́к.'],['Nouns','лю́ди','people','Там мно́го люде́й.'],['Nouns','день','day','Хоро́шего дня!'],['Nouns','год','year','Мне два́дцать лет.'],['Nouns','де́ло','matter, business','Как дела́?'],['Nouns','жизнь','life','Така́я жизнь.'],['Nouns','сло́во','word','Что зна́чит э́то сло́во?'],['Nouns','рабо́та','work, job','Я иду́ на рабо́ту.'],['Nouns','вопро́с','question','У меня́ вопро́с.'],['Nouns','друг','friend','Э́то мой друг.'],['Nouns','го́род','city','Я люблю́ э́тот го́род.'],['Nouns','де́ньги','money','У меня́ нет де́нег.'],['Nouns','страна́','country','Кака́я краси́вая страна́!'],['Nouns','язы́к','language, tongue','Ру́сский язы́к тру́дный?'],['Nouns','семья́','family','У меня́ больша́я семья́.'],['Nouns','ребёнок','child','Ребёнок игра́ет.'],['Nouns','де́ти','children','У вас есть де́ти?'],['Nouns','рука́','hand, arm','У меня́ боли́т рука́.'],['Nouns','дверь','door','Закро́й дверь.'],['Nouns','у́лица','street','Я живу́ на э́той у́лице.'],['Nouns','у́тро','morning','До́брое у́тро!'],['Nouns','ночь','night','Споко́йной но́чи!'],['Nouns','мир','world, peace','Мир большо́й.'],['Nouns','пробле́ма','problem','Нет пробле́м.'],['Nouns','исто́рия','story, history','Э́то до́лгая исто́рия.'],['Nouns','това́рищ','comrade, mate','Он мой ста́рый това́рищ.'],['Nouns','раз','time (occurrence)','Ещё раз, пожа́луйста.'],
['Adjectives','хоро́ший','good','Хоро́шая иде́я!'],['Adjectives','плохо́й','bad','Плоха́я пого́да.'],['Adjectives','большо́й','big','Э́то большо́й дом.'],['Adjectives','ма́ленький','small','Ма́ленькая ко́мната.'],['Adjectives','но́вый','new','У меня́ но́вая рабо́та.'],['Adjectives','ста́рый','old','Ста́рый друг.'],['Adjectives','пе́рвый','first','Э́то мой пе́рвый раз.'],['Adjectives','после́дний','last','После́дний авто́бус.'],['Adjectives','ва́жный','important','Э́то о́чень ва́жно.'],['Adjectives','интере́сный','interesting','Интере́сная кни́га.'],['Adjectives','тру́дный','difficult','Тру́дный вопро́с.'],['Adjectives','лёгкий','easy, light','Э́то лёгкое сло́во.'],['Adjectives','свобо́дный','free','Ты свобо́ден за́втра?'],['Adjectives','гото́вый','ready','Я гото́в!'],['Adjectives','ру́сский','Russian','Ру́сская ку́хня.'],['Adjectives','краси́вый','beautiful','Краси́вый го́род.'],
['Time & place','сего́дня','today','Сего́дня хо́лодно.'],['Time & place','за́втра','tomorrow','До за́втра!'],['Time & place','вчера́','yesterday','Вчера́ был дождь.'],['Time & place','у́тром','in the morning','У́тром я пью ко́фе.'],['Time & place','ве́чером','in the evening','Ве́чером я до́ма.'],['Time & place','но́чью','at night','Но́чью я сплю.'],['Time & place','ра́но','early','Ещё ра́но.'],['Time & place','по́здно','late','Уже́ по́здно.'],['Time & place','здесь','here','Я здесь.'],['Time & place','там','there','Кто там?'],['Time & place','до́ма','at home','Я до́ма.'],['Time & place','домо́й','(to) home','Я иду́ домо́й.'],['Time & place','везде́','everywhere','Везде́ снег.'],['Time & place','ря́дом','nearby','Магази́н ря́дом.'],['Time & place','далеко́','far','Э́то далеко́?'],['Time & place','давно́','for a long time','Я давно́ тут живу́.'],['Time & place','сейча́с','now','Я сейча́с за́нят.'],['Time & place','пото́м','later, then','Пото́м поговори́м.'],['Time & place','всегда́','always','Он всегда́ опа́здывает.'],['Time & place','иногда́','sometimes','Иногда́ я гото́влю.'],
['Little words','уже́','already','Я уже́ по́нял.'],['Little words','ещё','still, more','Ещё раз, пожа́луйста.'],['Little words','то́же','also','Я то́же.'],['Little words','то́лько','only','Э́то то́лько нача́ло.'],['Little words','потому́ что','because','Я до́ма, потому́ что бо́лен.'],['Little words','поэ́тому','that is why','Был дождь, поэ́тому мы до́ма.'],['Little words','е́сли','if','Е́сли бу́дет вре́мя, позвоню́.'],['Little words','когда́','when','Когда́ ты придёшь?'],['Little words','почему́','why','Почему́ ты не пришёл?'],['Little words','ну́жно','it is necessary','Мне ну́жно идти́.'],['Little words','мо́жно','may, is it OK','Мо́жно войти́?'],['Little words','наве́рное','probably','Наве́рное, он до́ма.'],['Little words','хотя́','although','Хотя́ я уста́л, я рабо́таю.'],['Little words','что́бы','in order to','Я учу́ ру́сский, что́бы говори́ть.'],['Little words','кото́рый','which, who','Друг, кото́рый живёт ря́дом.'],['Little words','о́чень','very','Э́то о́чень интере́сно.'],['Little words','мно́го','a lot, many','У меня́ мно́го рабо́ты.'],['Little words','ма́ло','little, few','У нас ма́ло вре́мени.'],['Little words','ведь','after all','Ведь я говори́л!'],['Little words','да́же','even','Он да́же не позвони́л.']];
const exMap=new Map(words.map(w=>[strip(w[1]),w[3]]));
const bandsDef=[[0,100],[100,300],[300,600],[600,1000],[1000,NW]];
const decks=[...bandsDef.map(([a,b])=>({name:`Frequency ${a+1}–${b}`,items:FL.slice(a,b).map(e=>({w:e.w,t:e.t,k:e.k,c:'#'+e.r+' by frequency',ex:exMap.get(e.k)||''}))})),
...[...new Set(words.map(w=>w[0]))].map(c=>({name:c+' (with examples)',items:words.filter(w=>w[0]===c).map(w=>({w:w[1],t:w[2],k:strip(w[1]),c,ex:w[3]}))}))];
$('#cat').innerHTML=decks.map((d,i)=>`<option value="${i}">${d.name} · ${d.items.length}</option>`).join('');
const INT=[0,1,3,7,16,35,90];
let srs=store.get('rb-srs',null);
if(!srs){srs={};store.get('rb-known',[]).map(strip).forEach((k,i)=>srs[k]=[7,today()+(i%7),2.5]);}
Object.keys(srs).forEach(k=>{const c=srs[k];if(c.length===2)srs[k]=[INT[c[0]]||1,c[1],2.5]});
const known=new Set(Object.keys(srs).filter(k=>k[0]!=='>'));
const saveK=()=>store.set('rb-srs',srs);
const learn=(k,iv)=>{srs[k]=[iv,today()+iv,2.5];if(k[0]!=='>')known.add(k)};
const nextIv=(c,easy)=>{if(!c||!c[0])return easy?4:1;return Math.max(c[0]+1,Math.round(c[0]*(c[2]||2.5)*(easy?1.3:1)))};
const forget=k=>{delete srs[k];delete srs['>'+k];known.delete(k)};
const ALL=new Map();decks.forEach(d=>d.items.forEach(it=>{if(!ALL.has(it.k))ALL.set(it.k,it)}));
let dir=store.get('rb-dir','r');
const kk=w=>dir==='p'?'>'+w.k:w.k;
const isDue=k=>!!srs[k]&&srs[k][1]<=today();
const dueKeys=()=>Object.keys(srs).filter(k=>isDue(k)&&ALL.has(k.replace(/^>/,'')));
const dueDir=()=>dueKeys().filter(k=>(k[0]==='>')===(dir==='p')).map(k=>ALL.get(k.replace(/^>/,'')));
const newLeft=()=>Math.max(0,cap()-L()[0]);
const fresh=w=>dir==='p'?known.has(w.k)&&!srs['>'+w.k]:!known.has(w.k);
const catOpts=()=>{const v=$('#cat').value,due=dueDir().length,P=dir==='p';
$('#cat').innerHTML=`<option value="due">Reviews due today · ${due}</option>`+decks.map((d,i)=>`<option value="${i}">${P?'Practise':'New'}: ${d.name} · ${d.items.filter(fresh).length} ${P?'ready':'left'}</option>`).join('');
$('#cat').value=v||(due?'due':'0');if(!$('#cat').value)$('#cat').value='0'};
catOpts();if(dueDir().length)$('#cat').value='due';
let q=[];const card=$('#card');
const deck=()=>{const v=$('#cat').value;return v==='due'?dueDir():decks[+v].items};
const days=n=>n===1?'1 day':n+' days';
const coverage=()=>{let c=0,n=0;FL.forEach((e,i)=>{if(known.has(e.k)){c+=WT[i];n++}});youN=n;youC=c;const mx=WT.reduce((a,b)=>a+b,0);
$('#covPct').textContent='≈'+Math.round(c)+'%';$('#covBar').style.width=c+'%';$('#covMax').style.left=mx+'%';
$('#covTxt').textContent=`of everyday speech covered by the ${n} list words you have learned. All ${NW.toLocaleString('en')} words → ≈${Math.round(mx)}% (white line).`;
$('#nAll').textContent=NW.toLocaleString('en');draw();bandsDraw();};
const show=()=>{card.classList.remove('flip');$('#pFb').textContent='';$('#pIn').value='';
$('#sLeft').textContent=q.length;$('#sKnown').textContent=dueKeys().length;$('#sTotal').textContent=known.size;
$('#newToday').textContent=`${L()[0]} learned today`;
const w=q[0],P=dir==='p';$('#pRow').hidden=!P||!w;$('#say1').style.visibility=P?'hidden':'visible';
if(!w){$('#know').textContent='Good';$('#easy').textContent='Easy';$('#cCat').textContent='';$('#cRu').textContent='Норма выполнена!';$('#cRev').hidden=true;
const due=$('#cat').value==='due',lim=!due&&!P&&newLeft()===0;
$('#cEn').textContent=due?'No reviews due':lim?'Daily limit reached':'Deck finished';
$('#cEx').textContent=due?'Pick a deck to learn or practise more words.':lim?`You have learned ${cap()} new words today. Come back tomorrow, or raise the daily limit.`:P?'Learn more words in Russian → English first; they then appear here.':'Pick the next deck, or come back tomorrow for reviews.';return}
const c0=srs[kk(w)];
$('#know').textContent='Good · '+days(nextIv(c0,false));$('#easy').textContent='Easy · '+days(nextIv(c0,true));
$('#cCat').textContent=w.c+(c0?' · review':' · new');
$('#cRu').textContent=P?w.t:w.w;$('#cEn').textContent=P?w.w:w.t;$('#cEx').textContent=w.ex;
const r=$('#cRev');r.hidden=false;r.href='https://context.reverso.net/translation/russian-english/'+encodeURIComponent(w.k);};
const build=()=>{const d=deck();if($('#cat').value==='due'){q=shuf(d.slice())}else{const nw=shuf(d.filter(fresh));q=[...shuf(d.filter(w=>isDue(kk(w)))),...(dir==='p'?nw:nw.slice(0,newLeft()))]}show()};
const syncRow=k=>{const i=$('#wlist').querySelector(`input[data-k="${CSS.escape(k)}"]`);if(i){i.checked=known.has(k);i.closest('.wl').classList.toggle('k',i.checked)}};
const tick=()=>{L()[1]++;saveLog();todayDraw();normAuto()};
const after=k=>{saveK();show();coverage();syncRow(k);catOpts();tick()};
card.addEventListener('click',e=>{if(e.target.closest('.say,a'))return;card.classList.toggle('flip')});
$('#flip').addEventListener('click',()=>card.classList.toggle('flip'));
new MutationObserver(()=>{$('#flip').textContent=card.classList.contains('flip')?'Show question':'Show answer'}).observe(card,{attributes:true,attributeFilter:['class']});
const sayCard=()=>q[0]&&say(q[0].w+(q[0].ex?'. '+q[0].ex:''));
$('#say1').addEventListener('click',sayCard);$('#say2').addEventListener('click',sayCard);
$('#again').addEventListener('click',()=>{if(!q.length)return;const w=q.shift();{const c=srs[kk(w)];if(c)srs[kk(w)]=[0,today(),Math.max(1.3,(c[2]||2.5)-.2)]}q.splice(Math.min(3,q.length),0,w);saveK();show();tick()});
const grade=easy=>{if(!q.length)return;const w=q.shift(),k=kk(w),c=srs[k];if(!c&&dir==='r')L()[0]++;const iv=nextIv(c,easy);srs[k]=[iv,today()+iv,Math.min(3.2,(c?(c[2]||2.5):2.5)+(easy?.15:0))];if(k[0]!=='>')known.add(k);after(w.k)};
$('#know').addEventListener('click',()=>grade(false));
$('#easy').addEventListener('click',()=>grade(true));
$('#shuffle').addEventListener('click',e=>confirm2(e.currentTarget,'Reset this deck',()=>{deck().forEach(w=>forget(w.k));saveK();build();coverage();wlDraw();catOpts()}));
$('#cat').addEventListener('change',build);
const setDir=d=>{dir=d;store.set('rb-dir',d);$('#dirR').setAttribute('aria-pressed',d==='r');$('#dirP').setAttribute('aria-pressed',d==='p');catOpts();if(dueDir().length)$('#cat').value='due';build()};
$('#dirR').setAttribute('aria-pressed',dir==='r');$('#dirP').setAttribute('aria-pressed',dir==='p');
$('#dirR').addEventListener('click',()=>setDir('r'));$('#dirP').addEventListener('click',()=>setDir('p'));
$('#capSel').value=String(cap());$('#capSel').addEventListener('change',e=>{store.set('rb-cap',+e.target.value);build();todayDraw()});
$('#pRow').addEventListener('submit',e=>{e.preventDefault();const w=q[0];if(!w)return;const v=nz($('#pIn').value),alts=[...ALL.values()].filter(x=>x.t===w.t).map(x=>nz(x.w)),ok=v===nz(w.w)||alts.includes(v);
const lev=(a,b)=>{const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length]};
const near=!ok&&lev(v,nz(w.w))===1;
$('#pFb').textContent=ok?(v===nz(w.w)?'Верно! Now grade yourself below.':'Also correct. The card’s word is '+strip(w.w)+'.'):near?'Almost: check the spelling: '+strip(w.w)+'.':'Answer: '+strip(w.w)+'. Press Again to see it soon.';$('#pFb').style.color=ok?'#fff':'var(--gold)';card.classList.add('flip')});

/* word list */
const bandsDraw=()=>{$('#bands').innerHTML=bandsDef.map(([a,b])=>{const sl=FL.slice(a,b),k=sl.filter(e=>known.has(e.k)).length,cv=WT.slice(a,b).reduce((x,y)=>x+y,0);return `<div><b>${a+1}–${b}</b><span>≈${Math.round(cv)}% of text · ${k}/${sl.length} known</span><i><u style="width:${k/sl.length*100}%"></u></i></div>`}).join('')};
$('#wb').innerHTML='<option value="-1">All bands</option>'+bandsDef.map(([a,b],i)=>`<option value="${i}">Words ${a+1}–${b}</option>`).join('');
let shown=[];
const wlDraw=()=>{const qv=strip($('#wq').value.trim().toLowerCase()),bi=+$('#wb').value,f=$('#wf').value;
shown=FL.filter(e=>(bi<0||(e.r>bandsDef[bi][0]&&e.r<=bandsDef[bi][1]))&&(!qv||e.k.toLowerCase().includes(qv)||e.t.toLowerCase().includes(qv))&&(f==='all'||(f==='known')===known.has(e.k)));
$('#wCount').textContent=`${shown.length} shown`;
$('#wlist').innerHTML=shown.length?shown.map(e=>{const k=known.has(e.k);return `<label class="wl${k?' k':''}"><input type="checkbox" data-k="${e.k}" ${k?'checked':''}><span class="r">#${e.r}</span><div><b>${e.w}</b><span>${e.t}</span><a class="rv" href="https://context.reverso.net/translation/russian-english/${encodeURIComponent(e.k)}" target="_blank" rel="noopener" aria-label="Examples for ${e.k}">↗</a></div></label>`}).join(''):'<p style="padding:16px">No words match. Try another search or band.</p>';};
$('#wlist').addEventListener('change',e=>{const k=e.target.dataset.k;if(e.target.checked)learn(k,16);else forget(k);e.target.closest('.wl').classList.toggle('k',e.target.checked);saveK();coverage();catOpts();build()});
['wq','wb','wf'].forEach(id=>$('#'+id).addEventListener('input',wlDraw));
$('#wAll').addEventListener('click',()=>{shown.forEach(e=>{if(!known.has(e.k))learn(e.k,16)});saveK();wlDraw();coverage();catOpts();build()});
$('#wNone').addEventListener('click',e=>confirm2(e.currentTarget,'Unmark shown',()=>{shown.forEach(x=>forget(x.k));saveK();wlDraw();coverage();catOpts();build()}));
$('#wb').value='0';build();coverage();wlDraw();

/* case factory */
const CN=['Genitive','Dative','Accusative','Instrumental','Prepositional'];
const CP=[['без','without'],['к','towards'],['Я ви́жу','I see'],['с','with'],['о','about']];
const nouns=[['брат','brother','брата','брату','брата','братом','брате','m',1],['ма́ма','mum','мамы','маме','маму','мамой','маме','f',1],['друг','friend','друга','другу','друга','другом','друге','m',1],['сестра́','sister','сестры','сестре','сестру','сестрой','сестре','f',1],['кни́га','book','книги','книге','книгу','книгой','книге','f',0],['го́род','city','города','городу','город','городом','городе','m',0],['маши́на','car','машины','машине','машину','машиной','машине','f',0],['музе́й','museum','музея','музею','музей','музеем','музее','m',0],['неде́ля','week','недели','неделе','неделю','неделей','неделе','f',0],['мо́ре','sea','моря','морю','море','морем','море','n',0],['письмо́','letter','письма','письму','письмо','письмом','письме','n',0],['учи́тель','teacher','учителя','учителю','учителя','учителем','учителе','m',1],['тетра́дь','notebook','тетради','тетради','тетрадь','тетрадью','тетради','f',0],['пло́щадь','square','площади','площади','площадь','площадью','площади','f',0],['врач','doctor','врача','врачу','врача','врачом','враче','m',1],['рабо́та','work','работы','работе','работу','работой','работе','f',0],['па́па','dad','папы','папе','папу','папой','папе','m',1],['това́рищ','comrade','товарища','товарищу','товарища','товарищем','товарище','m',1],['заво́д','factory','завода','заводу','завод','заводом','заводе','m',0],['соба́ка','dog','собаки','собаке','собаку','собакой','собаке','f',1],['окно́','window','окна','окну','окно','окном','окне','n',0],['кварти́ра','flat','квартиры','квартире','квартиру','квартирой','квартире','f',0]];
const adjs=[['но́вый','new','нов',0],['ста́рый','old','стар',0],['краси́вый','beautiful','красив',0],['хоро́ший','good','хорош',1],['интере́сный','interesting','интересн',0]];
const AE={m:[['ого','ому',null,'ым','ом'],'ый'],n:[['ого','ому','ое','ым','ом'],'ое'],f:[['ой','ой','ую','ой','ой'],'ая']};
const adjForm=(a,n,ci)=>{const g=n[7];let e=AE[g][0][ci];if(e===null)e=n[8]?'ого':'ый';if(a[3])e=e.replace(/^о(?=го|му|м$)/,'е').replace(/^ым$/,'им').replace(/^ый$/,'ий').replace(/^ой$/,'ей').replace(/^ое$/,'ее');return a[2]+e};
const adjNom=(a,n)=>{let e=AE[n[7]][1];if(a[3])e=e.replace('ый','ий').replace('ое','ее');return a[2]+e};
const fOn=store.get('rb-fcases',[1,1,1,1,1]);
$('#fCases').innerHTML=CN.map((c,i)=>`<label><input type="checkbox" data-i="${i}" id="fc${i}" ${fOn[i]?'checked':''}>${c}</label>`).join('');
let cur=null,fok=0,ftry=0,answered=false;
const norm1=s=>s.toLowerCase().replace(/\u0301/g,'').replace(/ё/g,'е').replace(/\s+/g,' ').trim();
const fNew=()=>{const on=fOn.map((v,i)=>v?i:-1).filter(i=>i>=0);const ci=on.length?on[Math.floor(Math.random()*on.length)]:0;let n;do{n=nouns[Math.floor(Math.random()*nouns.length)]}while(cur&&n===cur.n&&nouns.length>1);
const a=$('#fAdj').checked?adjs[Math.floor(Math.random()*adjs.length)]:null;cur={n,ci,a};answered=false;$('#fCase').textContent=CN[ci]+(a?' + adjective':'');$('#fPr').innerHTML=`${CP[ci][0]} <u>&nbsp;</u> <span style="color:#c9bdac;font-size:.6em">(${a?adjNom(a,n)+' ':''}${n[0].replace(/\u0301/g,'')})</span>`;$('#fGl').textContent=`${CP[ci][1]} … ${a?a[1]+' ':''}${n[1]}`;$('#fIn').value='';$('#fFb').textContent='';$('#fFb').className='fb';};
const fAns=()=>(cur.a?adjForm(cur.a,cur.n,cur.ci)+' ':'')+cur.n[2+cur.ci];
const fStat=()=>{$('#fOk').textContent=fok;$('#fRate').textContent=ftry?Math.round(fok/ftry*100)+'%':'—'};
$('#fForm').addEventListener('submit',e=>{e.preventDefault();const v=norm1($('#fIn').value);if(!v)return;if(answered){fNew();return}
const a=fAns(),ok=v===norm1(a);ftry++;if(ok)fok++;answered=true;fStat();
$('#fFb').className='fb '+(ok?'y':'n');$('#fFb').textContent=ok?`Верно! ${CP[cur.ci][0]} ${a}. Press Enter for the next noun.`:`Not quite: ${CP[cur.ci][0]} ${a}. Press Enter for the next noun.`;
$('#fPr').querySelector('u').textContent=a;});
$('#fShow').addEventListener('click',()=>{if(!answered){answered=true;ftry++;fStat()}$('#fPr').querySelector('u').textContent=fAns();$('#fFb').className='fb';$('#fFb').textContent=`${CP[cur.ci][0]} ${fAns()}`;});
$('#fNext').addEventListener('click',fNew);
$('#fAdj').checked=!!store.get('rb-fadj',0);$('#fAdj').addEventListener('change',e=>{store.set('rb-fadj',e.target.checked?1:0);fNew()});
$('#fCases').addEventListener('change',e=>{fOn[e.target.dataset.i]=e.target.checked?1:0;store.set('rb-fcases',fOn);fNew()});
fNew();

/* gazette */
let tf=[];
$('#issues').innerHTML=ISS.map((x,i)=>`<button class="tab" role="tab" type="button" data-i="${i}" aria-selected="false">№ ${i+1}</button>`).join('');
const rIssue=i=>{const x=ISS[i];tf=x.tf;store.set('rb-issue',i);
document.querySelectorAll('#issues .tab').forEach((b,j)=>b.setAttribute('aria-selected',j===i));
$('#issueTag').textContent=`Выпуск № ${i+1} · for week ${i+1}: ${x.w}`;$('#artTitle').textContent=x.t;
$('#art').innerHTML=x.p.map((p,j)=>`<div class="pp"><p>${p[0]}</p><button class="lk" type="button" data-i="${j}" aria-expanded="false">Show translation</button> <button class="lk" type="button" data-s="${j}">Listen</button><p class="en" id="en${j}" hidden>${p[1]}</p></div>`).join('');
$('#gloss').innerHTML=x.g.map(g=>`<span><b>${g[0]}</b> — ${g[1]}</span>`).join('');
$('#tf').innerHTML='<h3>Правда или нет?</h3>'+tf.map((t,j)=>`<div class="tfq"><p>${t[0]}</p><button type="button" data-i="${j}" data-v="1">Правда</button><button type="button" data-i="${j}" data-v="0">Нет</button><span id="tfw${j}" style="flex-basis:100%;font-size:15px;color:var(--soft)"></span></div>`).join('');};
$('#issues').addEventListener('click',e=>{const b=e.target.closest('.tab');if(b)rIssue(+b.dataset.i)});
$('#art').addEventListener('click',e=>{const b=e.target.closest('.lk');if(!b)return;if(b.dataset.s!==undefined){say(b.parentElement.querySelector('p').textContent);return}const el=$('#en'+b.dataset.i);el.hidden=!el.hidden;b.setAttribute('aria-expanded',!el.hidden);b.textContent=el.hidden?'Show translation':'Hide translation'});
$('#tf').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const t=tf[b.dataset.i],ok=(b.dataset.v==='1')===t[1];b.parentElement.querySelectorAll('button').forEach(x=>x.classList.remove('ok','no'));b.classList.add(ok?'ok':'no');$('#tfw'+b.dataset.i).textContent=(ok?'Верно. ':'Неверно. ')+t[2]});
rIssue(Math.min(+store.get('rb-issue',0)||0,ISS.length-1));

/* phrases */
const ph=[['Мне ка́жется, что…','It seems to me that…'],['Как ты ду́маешь?','What do you think?'],['По-мо́ему…','In my opinion…'],['Я согла́сен / согла́сна.','I agree.'],['Я не совсе́м согла́сен.','I don’t fully agree.'],['Де́ло в том, что…','The thing is that…'],['С одно́й стороны́… с друго́й стороны́…','On one hand… on the other…'],['Че́стно говоря́…','To be honest…'],['Кста́ти…','By the way…'],['В о́бщем…','All in all…'],['Наприме́р…','For example…'],['Зави́сит от того́, …','It depends on…'],['Я не уве́рен / уве́рена.','I’m not sure.'],['Что вы име́ете в виду́?','What do you mean?'],['Повтори́те, пожа́луйста, ме́дленнее.','Please repeat more slowly.'],['Как э́то сказа́ть по-ру́сски?','How do you say this in Russian?'],['Как пи́шется э́то сло́во?','How is this word spelled?'],['Мо́жно вопро́с?','Can I ask something?'],['Я хоте́л бы / хоте́ла бы…','I would like…'],['Бы́ло бы здо́рово, е́сли бы…','It would be great if…'],['Мне ну́жно…','I need to…'],['У меня́ есть иде́я.','I have an idea.'],['Ничего́ стра́шного.','No problem, it’s fine.'],['Не за что.','You’re welcome.'],['Извини́те, я опа́здываю.','Sorry, I’m running late.'],['Дава́й встре́тимся в…','Let’s meet at…'],['Во ско́лько?','At what time?'],['Ско́лько э́то сто́ит?','How much is it?'],['Мо́жно счёт, пожа́луйста?','The bill, please.'],['Я тут пе́рвый раз.','I’m here for the first time.'],['Я давно́ хоте́л…','I’ve long wanted to…'],['Я привы́к / привы́кла к…','I’m used to…'],['Мне интере́сно…','I’m curious…'],['Мне всё равно́.','I don’t mind.'],['Тем не ме́нее…','Nevertheless…'],['Поэ́тому я ду́маю, что…','That’s why I think…'],['Я так не ду́маю.','I don’t think so.'],['Ты прав / права́.','You’re right.'],['Вот э́то да!','Wow!'],['Как прошли́ выходны́е?','How was your weekend?'],['Что но́вого?','What’s new?'],['Я рад / ра́да тебя́ ви́деть.','Glad to see you.'],['Расскажи́ о себе́.','Tell me about yourself.'],['Я занима́юсь…','I do / practise…'],['Я учу́ ру́сский уже́…','I’ve been learning Russian for…'],['Мо́жно погро́мче?','Could you speak louder?'],['Пра́вда?','Really?'],['Коне́чно!','Of course!'],['Я поду́маю.','I’ll think about it.'],['Посмо́трим.','We’ll see.']];
$('#phr').innerHTML=ph.map((p,i)=>`<div class="ph"><div><b>${p[0]}</b><span>${p[1]}</span></div><button class="say" type="button" data-i="${i}" aria-label="Pronounce">${spk}</button></div>`).join('');
$('#phr').addEventListener('click',e=>{const b=e.target.closest('.say');if(b)say(ph[b.dataset.i][0])});

/* quiz */
const bank=[
['Я живу́ в ___ . (Москва)',['Москва','Москву','Москве','Москвой'],2,'Где? → prepositional: в Москве.',2],
['Я е́ду в ___ . (Москва)',['Москве','Москву','Москвы','Москва'],1,'Куда? → accusative: в Москву.',2],
['У меня́ нет ___ . (время)',['время','времени','временем','времена'],1,'нет + genitive: времени.',3],
['Я ви́жу ___ . (брат)',['брат','брату','брата','братом'],2,'People in the accusative look like the genitive: брата.',2],
['Вчера́ я ___ кни́гу и пошёл спать.',['читал','прочитал','читаю','прочитаю'],1,'Finished, then the next action → perfective: прочитал.',4],
['Ка́ждый день я ___ на рабо́ту на авто́бусе.',['еду','езжу','иду','хожу'],1,'Habit + transport → ездить: езжу.',5],
['Мне о́чень ___ э́тот фильм.',['нравлюсь','люблю','нравится','нравятся'],2,'The film pleases me: фильм нравится (singular).',6],
['Я пишу́ ___ . (ручка)',['ручка','ручку','ручке','ручкой'],3,'The tool you use → instrumental: ручкой.',6],
['За́втра я ___ тебе́.',['звоню','позвоню','звонил','буду позвонить'],1,'One action in the future → perfective: позвоню.',5],
['Э́то студе́нт, ___ живёт ря́дом.',['которая','который','которого','которым'],1,'Masculine, subject of «живёт» → который.',7],
['Мы говори́м с ___ . (друг)',['другу','друга','другом','друге'],2,'с (with) + instrumental: с другом.',6],
['Я иду́ к ___ . (врач)',['врачу','врача','врачом','враче'],0,'к + dative: к врачу.',6],
['Ему́ два́дцать пять ___ .',['год','года','лет','годов'],2,'5–20 → genitive plural, and for years that is лет.',3],
['Я хочу́, ___ ты пришёл.',['что','чтобы','если','потому что'],1,'Wanting someone else to act → чтобы + past.',7],
['Е́сли бы я знал, я ___ тебе́.',['скажу','сказал бы','говорю','скажи'],1,'Unreal condition: если бы … сказал бы.',7],
['В ___ я был в Москве́. (прошлый год)',['прошлый год','прошлого года','прошлом году','прошлым годом'],2,'в + year → prepositional with -у: в прошлом году.',2],
['Вчера́ она́ ___ в Петербу́рг на по́езде. (left)',['ушла','уехала','ехала','ездит'],1,'Left + by transport → у- + ехать: уехала.',5],
['У ___ есть маши́на. (она)',['её','ей','неё','она'],2,'After a preposition, её becomes неё: у неё.',6],
['Я ___ э́тот фильм три ра́за.',['смотрел','посмотрел','смотрю','посмотрю'],0,'Repeated action in the past → imperfective: смотрел.',4],
['Пять ___ . (минута)',['минута','минуты','минут','минутой'],2,'5+ → genitive plural: пять минут.',3],
['Я ду́маю о ___ . (моя семья)',['моя семья','мою семью','моей семье','моей семьи'],2,'о + prepositional, and мой agrees: о моей семье.',6],
['Он лю́бит ___ жену́. (his own)',['его','свою','своя','её'],1,'The owner is the subject, so use свой: свою жену.',6],
['Го́род, в ___ я живу́, о́чень краси́вый.',['который','котором','которого','которым'],1,'в + prepositional (где?): в котором.',7],
['Я занима́юсь ___ . (спорт)',['спорт','спорту','спортом','спорта'],2,'заниматься + instrumental: спортом.',6],
['Москва́ ___, чем Каза́нь.',['большая','больше','большой','самая'],1,'Comparative of большой: больше.',7],
['Мне ___ де́лать. (I have nothing to do)',['ничего','нечего','никто','некого'],1,'нечего + infinitive = nothing to do.',3],
['___ кни́гу на по́лку. (put it, upright)',['Поставь','Стоит','Положи','Лежит'],0,'Books on a shelf stand, and putting is ставить / поставить.',2],
['Е́сли за́втра ___ дождь, мы бу́дем до́ма.',['был','будет','есть','был бы'],1,'Real condition about the future → future: если будет.',7],
['___ , пожа́луйста! (Sit down, polite)',['Сидите','Садитесь','Сесть','Сидеть'],1,'Invitation to sit → imperfective imperative: садитесь.',5],
['Мне ___ . (I feel cold)',['холодный','холодно','холод','холодная'],1,'Dative + -о word: мне холодно.',6],
['Я ___ ру́сский язы́к.',['учусь','учу','учится','учит'],1,'With a direct object use учить: учу русский. Учиться takes no object.',4],
['Вы ___ звони́ли? (anyone at all)',['кому-то','кому-нибудь','никому','некому'],1,'In questions use -нибудь: кому-нибудь.',3],
['У меня́ нет ___ . (новая машина)',['новая машина','новой машины','новую машину','новой машине'],1,'нет + genitive, adjective agrees: новой машины.',3],
['Э́то сло́во ___ , чем то.',['труднее','трудный','трудно','самое трудное'],0,'Comparative: труднее.',7],
['Ле́кция ___ в де́вять.',['начинает','начинается','начать','начнёт'],1,'No object → -ся verb: начинается.',4]];
let qs=[],qi=0,score=0,miss=[];
const Q=$('#quiz');
const start=()=>{qs=shuf(bank.slice()).slice(0,10).map(x=>{const o=x[1].map((t,i)=>[t,i===x[2]]);shuf(o);return [x[0],o.map(a=>a[0]),o.findIndex(a=>a[1]),x[3],x[4]]});qi=0;score=0;miss=[];renderQ()};
const renderQ=()=>{if(qi>=qs.length){const wk=[...new Set(miss)].sort();const lv=score>=9?'Стахановец: your B1 core is solid':score>=6?'Ударник: strong A2+, almost there':'Пионер: start the plan at week 1';
Q.innerHTML=`<div class="meta"><span>Result</span><span>${score} / ${qs.length}</span></div><div class="stem">${lv}</div><p class="why">${wk.length?'Go back to: '+wk.map(w=>`<a href="#w${w-1}">week ${w}</a>`).join(', ')+'.':'No gaps found. Go straight to week 8 fluency work.'}</p><button class="btn red" id="retry" type="button">New round</button>`;$('#retry').addEventListener('click',start);return}
const x=qs[qi];Q.innerHTML=`<div class="meta"><span>Question ${qi+1} of ${qs.length}</span><span>Score ${score}</span></div><div class="stem">${x[0]}</div><div class="why" id="why">&nbsp;</div><div class="opts">${x[1].map((o,i)=>`<button class="opt" type="button" data-i="${i}">${o}</button>`).join('')}</div><div style="margin-top:16px;text-align:right"><button class="btn red" id="next" type="button" hidden>Next</button></div>`;};
Q.addEventListener('click',e=>{const o=e.target.closest('.opt');if(o&&!o.disabled){const x=qs[qi],i=+o.dataset.i,ok=i===x[2];
Q.querySelectorAll('.opt').forEach((b,j)=>{b.disabled=true;if(j===x[2])b.classList.add('ok');else if(j===i)b.classList.add('no')});
if(ok)score++;else miss.push(x[4]);$('#why').innerHTML=(ok?'<b style="color:var(--ok)">Верно.</b> ':'<b style="color:var(--bad)">Not quite.</b> ')+x[3];$('#next').hidden=false;$('#next').focus({preventScroll:true});return}
if(e.target.id==='next'){qi++;renderQ()}});
start();

/* voices */
const loadVoices=()=>{try{ruVoices=speechSynthesis.getVoices().filter(v=>/^ru/i.test(v.lang))}catch(e){ruVoices=[]}
$('#voiceSel').innerHTML=ruVoices.length?ruVoices.map(v=>`<option${v.name===VO.v?' selected':''}>${v.name}</option>`).join(''):'<option>No Russian voice found</option>';
$('#voiceMsg').textContent=ruVoices.length?'':'Your device has no Russian voice yet, so the speaker buttons may be silent or sound English. Android: Settings → search “Text-to-speech” → Google → install voice data → Russian. iPhone: Settings → Accessibility → Spoken Content → Voices → Russian.';};
loadVoices();try{speechSynthesis.onvoiceschanged=loadVoices}catch(e){}
$('#rate').value=VO.r;$('#rateV').textContent=VO.r.toFixed(2)+'×';
$('#rate').addEventListener('input',e=>{VO.r=+e.target.value;store.set('rb-rate',VO.r);$('#rateV').textContent=VO.r.toFixed(2)+'×'});
$('#voiceSel').addEventListener('change',e=>{VO.v=e.target.value;store.set('rb-voice',VO.v)});
$('#vTest').addEventListener('click',()=>say('Здравствуйте! Давайте учить русский язык вместе.'));

/* verb factory */
const {VB,ASP,MOT,PL,TOP,WT:WTK,RD,LS}=DAT;
const PRN=['я','ты','он / она','мы','вы','они'];
const pastOf=v=>v[3]||(()=>{const st=strip(v[0]).replace(/ть$/,'');return [st+'л',st+'ла',st+'ли']})();
const VM={conj:'Present tense',past:'Past tense',asp:'Aspect',mot:'Motion verbs',plur:'Plurals'};
let vm=store.get('rb-vmode','conj'),vc=null,vok=0,vtry=0,vdone=false;
const pick=a=>a[Math.floor(Math.random()*a.length)];
const vNew=()=>{vdone=false;$('#vFb').innerHTML='&nbsp;';$('#vIn').value='';let pr,gl,ans=null,opts=null,ci=0,why='';
if(vm==='conj'){const v=pick(VB),i=Math.floor(Math.random()*6);pr=`${PRN[i]} ___`;gl=`${v[0]} (${v[1]}), ${v[4]?'future (perfective)':'present tense'}`;ans=v[2][i]}
else if(vm==='past'){const v=pick(VB),i=Math.floor(Math.random()*3);pr=`${['он','она','они'][i]} ___`;gl=`${v[0]} (${v[1]}), past tense`;ans=pastOf(v)[i]}
else if(vm==='plur'){const n=pick(PL),g=Math.random()<.5;pr=g?'много ___':'Вот ___ .';gl=`${n[0]} (${n[1]}), ${g?'genitive plural':'nominative plural'}`;ans=g?n[3]:n[2]}
else{const x=pick(vm==='asp'?ASP:MOT),o=x[1].map((t,i)=>[t,i===x[2]]);shuf(o);pr=x[0];opts=o.map(a=>a[0]);ci=o.findIndex(a=>a[1]);why=x[3];gl=vm==='asp'?'Choose the right aspect':'Choose the right verb of motion'}
vc={ans,opts,ci,why};$('#vMode').textContent=VM[vm];$('#vPr').textContent=pr;$('#vGl').textContent=gl;
$('#vForm').hidden=!!opts;$('#vOpts').hidden=!opts;$('#vOpts').innerHTML=opts?opts.map((o,i)=>`<button class="opt" type="button" data-i="${i}">${o}</button>`).join(''):'';};
const vStat=()=>{$('#vScore').textContent=`${vok} of ${vtry} correct`};
const vMark=ok=>{vtry++;if(ok)vok++;vdone=true;vStat()};
$('#vForm').addEventListener('submit',e=>{e.preventDefault();if(vdone){vNew();return}const v=nz($('#vIn').value);if(!v)return;const ok=v===nz(vc.ans);vMark(ok);
$('#vFb').innerHTML=(ok?'<b style="color:var(--ok)">Верно!</b> ':'<b style="color:var(--bad)">Not quite.</b> Answer: ')+`<b>${vc.ans}</b>. Press Enter for the next one.`});
$('#vOpts').addEventListener('click',e=>{const o=e.target.closest('.opt');if(!o||vdone)return;const i=+o.dataset.i,ok=i===vc.ci;vMark(ok);
$('#vOpts').querySelectorAll('.opt').forEach((b,j)=>{b.disabled=true;if(j===vc.ci)b.classList.add('ok');else if(j===i)b.classList.add('no')});
$('#vFb').innerHTML=(ok?'<b style="color:var(--ok)">Верно.</b> ':'<b style="color:var(--bad)">Not quite.</b> ')+vc.why});
$('#vShow').addEventListener('click',()=>{if(!vdone)vMark(false);$('#vFb').innerHTML=vc.opts?`Answer: <b>${vc.opts[vc.ci]}</b>. ${vc.why}`:`Answer: <b>${vc.ans}</b>`;if(vc.opts)$('#vOpts').querySelectorAll('.opt').forEach((b,j)=>{b.disabled=true;if(j===vc.ci)b.classList.add('ok')})});
$('#vNext').addEventListener('click',vNew);
$('#vtabs').addEventListener('click',e=>{const t=e.target.closest('.tab');if(!t)return;vm=t.dataset.m;store.set('rb-vmode',vm);$('#vtabs').querySelectorAll('.tab').forEach(b=>b.setAttribute('aria-pressed',b===t));vNew()});
$('#vtabs').querySelectorAll('.tab').forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===vm));
vNew();

/* speaking */
const SCHK=['Start with «Я хочу рассказать о…»','Answer all three questions, each with a detail','Use at least one past and one future sentence','Use three linking words: во-первых, потому что, кроме того, поэтому','Finish with your opinion: «Мне кажется, что…»'];
const WCHK=['Greeting and sign-off, if it is a letter','At least 100 words','Clear start, middle and end','Past, present and future forms','Three or more linking words','Read it aloud once and fix the endings'];
const chk=(id,a)=>{$(id).innerHTML=a.map((t,i)=>`<li><label><input type="checkbox">${t}</label></li>`).join('')};
let ti=0;const sTopic=()=>{const t=TOP[ti];$('#sTopic').textContent=t[0];$('#sSub').innerHTML=t[1].map(x=>`<li>${x}</li>`).join('');chk('#sChk',SCHK)};
$('#sNew').addEventListener('click',()=>{ti=(ti+1+Math.floor(Math.random()*(TOP.length-1)))%TOP.length;sTopic();sRst()});
let sLeft=180,sInt=null;const sFmt=()=>{$('#sTime').textContent=sLeft>0?`${Math.floor(sLeft/60)}:${String(sLeft%60).padStart(2,'0')}`:'Время!'};
const sRst=()=>{clearInterval(sInt);sInt=null;sLeft=180;$('#sGo').textContent='Start';sFmt()};
$('#sGo').addEventListener('click',()=>{if(sInt){clearInterval(sInt);sInt=null;$('#sGo').textContent='Resume';return}if(sLeft<=0)sLeft=180;$('#sGo').textContent='Pause';sInt=setInterval(()=>{sLeft--;sFmt();if(sLeft<=0){clearInterval(sInt);sInt=null;$('#sGo').textContent='Start'}},1000)});
$('#sReset').addEventListener('click',sRst);
ti=Math.floor(Math.random()*TOP.length);sTopic();sFmt();
let mr=null,chunks=[];
$('#rec').addEventListener('click',async()=>{const b=$('#rec');
if(mr&&mr.state==='recording'){mr.stop();return}
try{const st=await navigator.mediaDevices.getUserMedia({audio:true});chunks=[];mr=new MediaRecorder(st);
mr.ondataavailable=e=>chunks.push(e.data);
mr.onstop=()=>{st.getTracks().forEach(t=>t.stop());const a=$('#recA');a.src=URL.createObjectURL(new Blob(chunks,{type:mr.mimeType||'audio/webm'}));a.hidden=false;b.textContent='Record again';$('#recMsg').textContent='Listen back: check endings, stress and where you hesitated.'};
mr.start();b.textContent='Stop recording';$('#recMsg').textContent='Recording… speak now.'}
catch(e){$('#recMsg').textContent='Recording is not available here. Open the GitHub version of the site in Chrome or Safari and allow the microphone.'}});
/* writing */
$('#wTask').innerHTML=WTK.map((w,i)=>`<option value="${i}">Task ${i+1}</option>`).join('');
const wDraw=()=>{const i=+$('#wTask').value;$('#wQ').textContent=WTK[i][0];$('#wText').value=store.get('rb-w'+i,'');$('#wModelBox').textContent=WTK[i][1];$('#wModelBox').hidden=true;$('#wModel').textContent='Show model answer';chk('#wChk',WCHK);wCount()};
const wCount=()=>{const n=($('#wText').value.match(/[\p{L}\d-]+/gu)||[]).length;$('#wcnt').textContent=`${n} words${n<100?' · aim for 100–150':' · good length'}`};
$('#wTask').addEventListener('change',wDraw);
$('#wText').addEventListener('input',()=>{store.set('rb-w'+$('#wTask').value,$('#wText').value);wCount()});
$('#wModel').addEventListener('click',()=>{const b=$('#wModelBox');b.hidden=!b.hidden;$('#wModel').textContent=b.hidden?'Show model answer':'Hide model answer'});
wDraw();

/* backup */
const bCode=()=>{const o={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('rb-'))o[k]=localStorage.getItem(k)}}catch(e){}return 'RYBOK1:'+btoa(unescape(encodeURIComponent(JSON.stringify(o))))};
$('#bMake').addEventListener('click',()=>{const c=bCode();$('#bOut').value=c;$('#bMsg').textContent=`Backup created (${Math.round(c.length/1024)} KB). Copy it somewhere safe, such as your notes app.`});
$('#bCopy').addEventListener('click',async()=>{if(!$('#bOut').value)$('#bOut').value=bCode();try{await navigator.clipboard.writeText($('#bOut').value);$('#bMsg').textContent='Copied.'}catch(e){$('#bOut').select();$('#bMsg').textContent='Select the code above and copy it.'}});
$('#bFile').addEventListener('click',()=>{try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([bCode()],{type:'text/plain'}));a.download='rybok-backup-'+new Date().toISOString().slice(0,10)+'.txt';document.body.appendChild(a);a.click();a.remove();$('#bMsg').textContent='File saved, if your browser allows downloads here.'}catch(e){$('#bMsg').textContent='Saving files is blocked here; use Copy instead.'}});
$('#bLoad').addEventListener('click',e=>{const v=$('#bIn').value.trim();let o=null;try{if(!v.startsWith('RYBOK1:'))throw 0;o=JSON.parse(decodeURIComponent(escape(atob(v.slice(7)))));if(!o||typeof o!=='object')throw 0}catch(err){$('#bMsg2').textContent='That doesn’t look like a backup code from this site.';return}
confirm2(e.currentTarget,'Restore progress',()=>{try{Object.keys(o).forEach(k=>{if(k.startsWith('rb-'))localStorage.setItem(k,o[k])});$('#bMsg2').textContent='Restored. Reloading…';setTimeout(()=>location.reload(),600)}catch(err){$('#bMsg2').textContent='Could not save here: storage is blocked in this browser.'}});
if(!e.currentTarget.dataset.c)return;$('#bMsg2').textContent='This replaces the progress in this browser. Tap again to confirm.'});

/* mock exam */
const MB=$('#mockBox');let mt0=0,mInt=null,mParts=null;
const mq=(id,q,opts)=>`<div class="mq" data-q="${id}"><p>${q}</p>${opts.map((o,i)=>`<label class="mo"><input type="radio" name="${id}" value="${i}">${o}</label>`).join('')}</div>`;
const mStart0=()=>{const last=store.get('rb-mock',null);MB.innerHTML=`<div class="mpart"><h3>Ready when you are</h3><p>Four parts on one page. Answer everything, then press “Finish and score” at the bottom. Each listening text can be played twice, as in the exam.</p>${last?`<p>Last attempt (${last.d}): grammar ${last.s[0]}%, reading ${last.s[1]}%, listening ${last.s[2]}%.</p>`:''}<button class="btn red" id="mGo" type="button">Start the mock exam</button></div>`;$('#mGo').addEventListener('click',mRun)};
const mRun=()=>{const pool=[...bank.map(x=>x.slice(0,4)),...ASP,...MOT];const G=shuf(pool.slice()).slice(0,20).map(x=>{const o=x[1].map((t,i)=>[t,i===x[2]]);shuf(o);return [x[0],o.map(a=>a[0]),o.findIndex(a=>a[1])]});
mParts={G,R:RD[1],L:[...LS[0][1],...LS[1][1]]};
MB.innerHTML=`<div class="mbar"><span>Mock exam · time <b id="mClock">0:00</b></span><button class="btn gold" id="mFin2" type="button">Finish and score</button></div>
<div class="mpart"><h3>Part 1 · Grammar and vocabulary</h3><p>Choose the correct option.</p>${G.map((x,i)=>mq('g'+i,(i+1)+'. '+x[0],x[1])).join('')}</div>
<div class="mpart"><h3>Part 2 · Reading</h3><div class="mtext">${RD[0]}</div>${RD[1].map((x,i)=>mq('r'+i,x[0],x[1])).join('')}</div>
<div class="mpart"><h3>Part 3 · Listening</h3><p>Listen without reading. Each text can be played twice.</p>${LS.map((t,j)=>`<div class="mtext"><button class="btn red" type="button" data-play="${j}">Play text ${j+1}</button> <span id="mPl${j}" style="font-size:14px;color:var(--soft)">2 plays left</span><div id="mTr${j}" hidden style="margin-top:8px">${t[0]}</div></div>${t[1].map((x,i)=>mq('l'+j+'_'+i,x[0],x[1])).join('')}`).join('')}</div>
<div class="mpart"><h3>Part 4 · Writing and speaking</h3><p>Do one writing task and one speaking topic in the <a href="#speak">practice section</a> with the timer, then tick what you managed.</p><ul class="chk">${['I wrote at least 100 words on the task','My text had a clear start, middle and end','I spoke for 3 minutes without long pauses','I used past and future tenses correctly'].map(t=>`<li><label><input type="checkbox" class="mself">${t}</label></li>`).join('')}</ul></div>
<button class="btn red" id="mFin" type="button">Finish and score</button>`;
const plays=[2,2];MB.querySelectorAll('[data-play]').forEach(b=>b.addEventListener('click',()=>{const j=+b.dataset.play;if(plays[j]<=0)return;plays[j]--;say(LS[j][0]);$('#mPl'+j).textContent=plays[j]?'1 play left':'No plays left';if(!plays[j])b.disabled=true}));
mt0=Date.now();clearInterval(mInt);mInt=setInterval(()=>{const s=Math.floor((Date.now()-mt0)/1000);const c=$('#mClock');if(c)c.textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`},1000);
$('#mFin').addEventListener('click',mScore);$('#mFin2').addEventListener('click',mScore);MB.scrollIntoView({block:'start'})};
const mScore=()=>{clearInterval(mInt);const val=id=>{const c=MB.querySelector(`input[name="${id}"]:checked`);return c?+c.value:-1};
const mark=(id,ci)=>{const v=val(id);MB.querySelectorAll(`input[name="${id}"]`).forEach((r,i)=>{r.disabled=true;const l=r.closest('.mo');if(i===ci)l.classList.add('ok');else if(i===v)l.classList.add('no')});return v===ci};
const g=mParts.G.filter((x,i)=>mark('g'+i,x[2])).length,r=RD[1].filter((x,i)=>mark('r'+i,x[2])).length;
let l=0;LS.forEach((t,j)=>t[1].forEach((x,i)=>{if(mark('l'+j+'_'+i,x[2]))l++;}));LS.forEach((t,j)=>{$('#mTr'+j).hidden=false});
const nL=LS[0][1].length+LS[1][1].length,sc=[Math.round(g/20*100),Math.round(r/RD[1].length*100),Math.round(l/nL*100)],self=MB.querySelectorAll('.mself:checked').length;
store.set('rb-mock',{d:new Date().toLocaleDateString('en-GB'),s:sc});
const row=(n,x,t)=>`<tr><td class="k">${n}</td><td style="text-align:right">${x}</td><td class="${t?'pass':'fail'}">${t?'Pass':'Not yet'}</td></tr>`;
const res=document.createElement('div');res.className='mpart';res.innerHTML=`<h3>Your result</h3><div class="scroll" tabindex="0"><table><thead><tr><th>Part</th><th style="text-align:right">Score</th><th>66% needed</th></tr></thead><tbody>${row('Grammar and vocabulary',sc[0]+'%',sc[0]>=66)}${row('Reading',sc[1]+'%',sc[1]>=66)}${row('Listening',sc[2]+'%',sc[2]>=66)}${row('Writing and speaking (self-check)',self+' of 4',self>=3)}</tbody></table></div><p style="margin-top:12px">${sc.every(x=>x>=66)&&self>=3?'You passed this short sample in every part. The real exam is much longer, so try a full official practice test before you book it.':'Correct answers are marked in green below. Go back to the weeks behind your weakest part, then try again.'}</p><div class="wbtn"><button class="btn red" id="mAgain" type="button">New mock exam</button></div>`;
MB.prepend(res);MB.querySelectorAll('#mFin,#mFin2').forEach(b=>b.disabled=true);$('#mAgain').addEventListener('click',mRun);res.scrollIntoView({block:'start'})};
mStart0();

/* today */
todayDraw=()=>{const d=today()-START,wk=weekNow(),done8=d>=56;$('#tTitle').textContent=done8?'Plan complete: keep your reviews going':`Today: week ${wk}, day ${d%7+1}`;
const due=dueKeys().length,nl=L()[0],c=cap(),gr=L()[1],W=weeks[wk-1],wd=W[2].filter((t,j)=>done[(wk-1)+'-'+j]).length,iss=ISS[wk-1];
const card=(ok,big,txt,btn,go)=>`<div class="tc${ok?' ok':''}"><b>${big}</b><span>${txt}</span><button class="btn" type="button" data-go="${go}">${btn}</button></div>`;
$('#tgrid').innerHTML=card(!due,due?due:'✓',due?'flashcard reviews due today. Do these first.':'No reviews due. Nice work.','Start reviews','rev')
+card(nl>=c,`${nl}/${c}`,'new words learned today','Learn new words','new')
+card(wd===W[2].length,`${wd}/${W[2].length}`,`tasks done in week ${wk}: ${W[0]}`,`Open week ${wk}`,'week')
+card(false,`№ ${wk}`,`This week’s reading: «${iss.t}»`,'Read it','read')
+card(gr>=30,`${Math.min(gr,30)}/30`,gr>=30?'cards answered: today’s norm is fulfilled.':'cards answered today. 30 fills today’s norm square.','Open the drill','drill');};
$('#tgrid').addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(!b)return;const g=b.dataset.go,wk=weekNow();
if(g==='rev'){setDir('r');$('#cat').value='due';build();$('#words').scrollIntoView()}
else if(g==='new'||g==='drill'){if(g==='new'){setDir('r');const i=decks.findIndex(d=>d.items.some(fresh));$('#cat').value=String(Math.max(0,i));build()}$('#words').scrollIntoView()}
else if(g==='week'){$('#w'+(wk-1)).scrollIntoView()}
else if(g==='read'){rIssue(wk-1);$('#paper').scrollIntoView()}});
$('#tRestart').addEventListener('click',e=>confirm2(e.currentTarget,'Restart the plan at week 1 today',()=>{START=today();store.set('rb-start',START);todayDraw();normDraw()}));
todayDraw();normAuto();
}

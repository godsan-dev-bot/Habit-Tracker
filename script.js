(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const KEY='vortexbits.v1',CATS=['Skill','Mind','Body','Health','Focus','Other'],ICONS=['◈','◇','⟡','⌬','⌁','▣','△','⟐'],COLORS=['#1fae63','#0f7a45','#6fbf3a','#19a88a','#3ddc84'];
const DAYS=['MON','TUE','WED','THU','FRI','SAT','SUN'],XPH=50;
const QUOTES=['Consistency is your superpower.','Keep the chain alive.','One more day. One more level.','Discipline is choosing what you want most.','Small steps, compounded, become a new self.','Show up today. Future you is watching.'];
const PHRASES=['BUILD BETTER HABITS','LEVEL UP YOUR LIFE','STAY CONSISTENT','BECOME UNSTOPPABLE'];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const today=()=>iso(new Date()),parse=s=>new Date(s+'T00:00:00'),add=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return iso(d)};
const monday=s=>{const d=parse(s);return add(s,-((d.getDay()+6)%7))};
const uid=()=>Math.random().toString(36).slice(2,9);
const mk=(name,desc,cat,icon,i)=>({id:uid(),name,desc,cat,icon,color:COLORS[i%5],freq:'daily',created:today(),log:{}});
const fresh=()=>({habits:[mk('Coding','Write code for 1 hour','Skill','◈',0),mk('Reading','Read 20 pages','Mind','◇',1),mk('Exercise','Move for 30 minutes','Body','⟡',2),mk('Study','Focused study session','Skill','⌬',3),mk('Meditation','10 minutes of quiet','Mind','⌁',4),mk('Water','Drink 2 liters','Health','▣',0),mk('Sleep','In bed before 23:00','Health','△',1)],xp:0,name:'OPERATOR',avatar:'◈',ach:{},mission:null,missed:'',fx:true});
let S;try{S=JSON.parse(localStorage.getItem(KEY)||localStorage.getItem('neohabits.v1'))||fresh()}catch{S=fresh()}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch{}};
let wOff=0,editing=null,q='',catF='All';

/* ---------- logic ---------- */
const due=(h,d)=>{const w=parse(d).getDay();return h.freq==='weekdays'?w>0&&w<6:h.freq==='weekends'?w===0||w===6:true};
const count=d=>S.habits.reduce((n,h)=>n+(h.log[d]?1:0),0);
function hStreak(h){let cur=0,d=today();if(due(h,d)&&!h.log[d])d=add(d,-1);for(let i=0;i<3650&&d>=add(h.created,-400);i++){if(due(h,d)){if(h.log[d])cur++;else break}d=add(d,-1)}
 let best=0,run=0;const ks=Object.keys(h.log).sort();if(ks.length){for(let d=ks[0];d<=today();d=add(d,1)){if(!due(h,d))continue;if(h.log[d]){run++;best=Math.max(best,run)}else run=0}}return{cur,best:Math.max(best,cur)}}
function allDates(){const s=new Set();S.habits.forEach(h=>Object.keys(h.log).forEach(k=>s.add(k)));return[...s].sort()}
function gStreak(){let cur=0,d=today();if(!count(d))d=add(d,-1);while(count(d)){cur++;d=add(d,-1)}
 const ks=allDates();let best=0,run=0;if(ks.length)for(let d=ks[0];d<=today();d=add(d,1)){if(count(d)){run++;best=Math.max(best,run)}else run=0}return{cur,best:Math.max(best,cur)}}
function pct(h,days=30){let n=0,dn=0;for(let i=0;i<days;i++){const d=add(today(),-i);if(d<h.created)break;if(due(h,d)){n++;if(h.log[d])dn++}}return n?Math.round(dn/n*100):0}
function level(xp){let l=1,need=500;while(xp>=need){xp-=need;l++;need=500+(l-1)*100}return{l,cur:xp,need}}
function bestWeek(){const m={};allDates().forEach(d=>{const k=monday(d);m[k]=(m[k]||0)+count(d)});return Math.max(0,...Object.values(m))}
function perfectRun(){let run=0,best=0;for(let i=365;i>=0;i--){const d=add(today(),-i),hs=S.habits.filter(h=>h.created<=d&&due(h,d));if(!hs.length)continue;if(hs.every(h=>h.log[d])){run++;best=Math.max(best,run)}else run=0}return best}
const ACH=[['◈','FIRST STEP','Complete your first habit',()=>allDates().length>0],['◇','CONSISTENT','Maintain a 7-day streak',()=>gStreak().best>=7],['⟡','DISCIPLINED','Maintain a 30-day streak',()=>gStreak().best>=30],['⌬','UNSTOPPABLE','Maintain a 100-day streak',()=>gStreak().best>=100],['△','PERFECT WEEK','Complete all habits for 7 days',()=>perfectRun()>=7]];
function checkAch(){ACH.forEach(a=>{if(!S.ach[a[1]]&&a[3]()){S.ach[a[1]]=today();toast('⌬ NEW ACHIEVEMENT UNLOCKED // '+a[1])}})}

function toggle(id,date=today(),src){const h=S.habits.find(x=>x.id===id);if(!h)return;const was=level(S.xp).l;
 if(h.log[date]){delete h.log[date];S.xp=Math.max(0,S.xp-XPH)}else{h.log[date]=1;S.xp+=XPH;toast('✓ HABIT COMPLETED');setTimeout(()=>toast('+'+XPH+' XP ACQUIRED'),250);setTimeout(()=>toast('◈ STREAK UPDATED'),500);if(src)burst(src);if(level(S.xp).l>was){const l=$('#levelup');l.innerHTML='LEVEL UP // NEW POWER UNLOCKED<br><small>LEVEL '+String(level(S.xp).l).padStart(2,'0')+'</small>';l.classList.remove('show');void l.offsetWidth;l.classList.add('show')}}
 checkAch();save();render()}

/* ---------- ui helpers ---------- */
function toast(m){const t=document.createElement('div');t.className='toast';t.textContent=m;$('#toasts').append(t);setTimeout(()=>t.remove(),2800)}
function burst(el){const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,k=document.createElement('span');k.className='shock';k.style.cssText=`left:${x}px;top:${y}px`;document.body.append(k);setTimeout(()=>k.remove(),850);for(let i=0;i<16;i++){const s=document.createElement('span'),a=Math.random()*6.28,d=30+Math.random()*60;s.className='spark'+(i%4?'':' g');if(!(i%4))s.textContent=['✓','◈','⟡','+'][i/4];s.style.cssText=`left:${x}px;top:${y}px;--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d}px`;document.body.append(s);setTimeout(()=>s.remove(),750)}}
function num(el,v,suf=''){const f=el._v||0,t0=performance.now();el._v=v;if(f===v){el.textContent=v+suf;return}const st=n=>{const k=Math.min(1,(n-t0)/600);el.textContent=Math.round(f+(v-f)*(1-Math.pow(1-k,3)))+suf;if(k<1)requestAnimationFrame(st)};requestAnimationFrame(st)}
const fmt=s=>parse(s).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});

/* ---------- render ---------- */
function render(){
 const hs=S.habits,t=today(),done=hs.filter(h=>h.log[t]).length,g=gStreak(),L=level(S.xp);
 const rate=hs.length?Math.round(hs.reduce((a,h)=>a+pct(h),0)/hs.length):0,bw=bestWeek();
 num($('#sTotal'),hs.length);$('#sToday').textContent=done+' / '+hs.length;$('#sTodayBar').style.width=(hs.length?done/hs.length*100:0)+'%';
 num($('#sCur'),g.cur);num($('#sLong'),g.best);num($('#sRate'),rate,'%');$('#sRateBar').style.width=rate+'%';
 $('#sLvl').textContent='LV '+L.l;$('#sLvlBar').style.width=L.cur/L.need*100+'%';
 // streak
 const next=[7,30,100,365,9999].find(m=>m>g.cur);$('#ring').style.strokeDashoffset=327*(1-Math.min(1,g.cur/next));
 num($('#rNum'),g.cur);num($('#rCur'),g.cur);num($('#rLong'),g.best);num($('#rWeek'),bw);
 $('#fire').textContent='🔥 '+g.cur+' DAY STREAK';$('#note').textContent=g.cur?'Next milestone: '+next+' days.':'Complete a habit today to start your chain.';
 $('#xLvl').textContent='LEVEL '+String(L.l).padStart(2,'0');$('#xBar').style.width=L.cur/L.need*100+'%';$('#xTxt').textContent=L.cur+' / '+L.need+' XP  ·  '+S.xp+' total';
 mission();cards();week();analytics();ach();profile();drawCharts(1)}
function mission(){let h=S.habits.find(x=>S.mission&&S.mission.date===today()&&x.id===S.mission.id);
 if(!h&&S.habits.length){const pool=S.habits.filter(x=>!x.log[today()]),p=pool.length?pool:S.habits;h=p[Math.floor(Math.random()*p.length)];S.mission={date:today(),id:h.id};save()}
 $('#mission').innerHTML=h?`<h3>${esc(h.icon)} ${esc(h.name)}</h3><p>${esc(h.desc||'Today’s priority habit.')}</p>${h.log[today()]?'<button class="btn" disabled>✓ MISSION CLEARED</button>':`<button class="btn prime" data-m="${h.id}">ACCEPT & COMPLETE</button>`}`:'<p>Add a habit to receive a daily mission.</p>'}
function cards(){const t=today(),ws=monday(t),list=S.habits.filter(h=>(catF==='All'||h.cat===catF)&&h.name.toLowerCase().includes(q));
 $('#grid').innerHTML=list.length?list.map(h=>{const st=hStreak(h),p=pct(h),dn=!!h.log[t];
 return`<article class="panel card ${dn?'done':''}" style="--c:${h.color}" data-id="${h.id}"><header><span class="ico">${esc(h.icon)}</span><div><h3>${esc(h.name)}</h3><p>${esc(h.desc)}</p></div></header>
 <div class="meta"><span>${esc(h.cat)}</span><span>${h.freq.toUpperCase()}</span><span>⌁ ${st.cur} DAY</span><span>△ BEST ${st.best}</span></div>
 <div class="bar"><i style="width:${p}%"></i></div><small>${p}% · since ${h.created}</small>
 <div class="wk">${DAYS.map((n,i)=>{const d=add(ws,i);return`<span class="${h.log[d]?'y':''} ${d===t?'t':''}" title="${d}">${h.log[d]?'✓':n[0]}</span>`}).join('')}</div>
 <footer><button class="btn done-btn" data-a="tg" aria-pressed="${dn}" aria-label="${dn?'Undo':'Complete'} ${esc(h.name)}">${dn?'✓':'○ COMPLETE'}</button><button class="btn sm" data-a="ed">✎ EDIT</button><button class="btn sm" data-a="rs">↺ RESET</button><button class="btn sm danger" data-a="dl">× DELETE</button></footer></article>`}).join(''):'<p class="empty">◇ No habits found. Create one with + NEW HABIT.</p>'}
function week(){const t=today(),ws=add(monday(t),wOff*7);$('#wLabel').textContent=fmt(ws).split(',')[0]+' → '+fmt(add(ws,6)).split(',')[0];
 let h=`<div class="wrow h"><span></span>${DAYS.map((n,i)=>`<span class="${add(ws,i)===t?'td':''}">${n}</span>`).join('')}</div>`;
 h+=S.habits.map(x=>`<div class="wrow"><span>${esc(x.icon)} ${esc(x.name)}</span>${DAYS.map((n,i)=>{const d=add(ws,i);return`<button class="hex ${x.log[d]?'y':''} ${d===t?'t':''}" data-w="${x.id}|${d}" ${d>t?'disabled':''} aria-label="${esc(x.name)} ${d}">${x.log[d]?'✓':'○'}</button>`}).join('')}</div>`).join('');
 const el=$('#week');el.innerHTML=h;el.style.animation='none';void el.offsetWidth;el.style.animation=''}
let rng=30;
const span=(n,off=0)=>Array.from({length:n},(_,i)=>add(today(),i-n+1-off)),tot=ds=>ds.reduce((a,d)=>a+count(d),0),dowOf=d=>(parse(d).getDay()+6)%7;
const poss=ds=>ds.reduce((a,d)=>a+S.habits.filter(h=>h.created<=d&&due(h,d)).length,0),rt=ds=>{const p=poss(ds);return p?Math.round(tot(ds)/p*100):0};
const hRate=(h,ds)=>{let n=0,k=0;ds.forEach(d=>{if(d>=h.created&&due(h,d)){n++;if(h.log[d])k++}});return{n,k,p:n?Math.round(k/n*100):0}};
function analytics(){const ds=span(rng),pv=span(rng,rng),r=rt(ds),dr=r-rt(pv),t=tot(ds),act=ds.filter(d=>count(d)).length,
 perf=ds.filter(d=>{const hs=S.habits.filter(h=>h.created<=d&&due(h,d));return hs.length&&hs.every(h=>h.log[d])}).length,
 dw=Array(7).fill(0);ds.forEach(d=>dw[dowOf(d)]+=count(d));const hi=dw.indexOf(Math.max(...dw)),lo=dw.indexOf(Math.min(...dw)),
 rows=S.habits.map(h=>({h,...hRate(h,ds),s:hStreak(h)})).sort((a,b)=>b.p-a.p);
 const K=[['◇','COMPLETION RATE',r+'%',dr,' pts'],['✓','COMPLETIONS',t,t-tot(pv),''],['⌁','ACTIVE DAYS',act+'/'+rng,null],['△','PERFECT DAYS',perf,null],['⟡','AVG / DAY',(t/rng).toFixed(1),null],['▣','BEST WEEKDAY',t?DAYS[hi]:'—',null]];
 $('#kpis').innerHTML=K.map((k,i)=>`<div class="panel kpi" style="--i:${i}"><span class="tag">${k[0]} ${k[1]}</span><b>${k[2]}</b>${k[3]==null?'':`<small class="dl ${k[3]>=0?'up':'dn'}">${k[3]>=0?'▲':'▼'} ${Math.abs(k[3])}${k[4]} vs prev</small>`}</div>`).join('');
 const I=[];if(S.habits.length&&t){I.push(`Completion is ${dr>=0?'up':'down'} ${Math.abs(dr)} points versus the previous ${rng} days.`);I.push(`Strongest day: ${DAYS[hi]} (${dw[hi]} completions). Weakest: ${DAYS[lo]} (${dw[lo]}).`);I.push(`Top habit: ${rows[0].h.icon} ${rows[0].h.name} at ${rows[0].p}%.`);const w=rows[rows.length-1];if(w!==rows[0])I.push(`Needs attention: ${w.h.icon} ${w.h.name} at ${w.p}%.`);const g=gStreak();I.push(g.cur?`Current chain: ${g.cur} days${g.cur>=g.best?' — your personal best.':', '+(g.best-g.cur)+' short of your best.'}`:'No active chain. Complete one habit today to start.');if(perf)I.push(`${perf} perfect day${perf>1?'s':''} in this range.`)}else I.push('Complete a few habits to unlock insights.');
 $('#ins').innerHTML=I.map(x=>`<li>${esc(x)}</li>`).join('');
 $('#tbl').innerHTML='<div class="tr th"><span>HABIT</span><span>DONE</span><span>RATE</span><span>STREAK</span><span>BEST</span></div>'+rows.map(x=>`<div class="tr"><span>${esc(x.h.icon)} ${esc(x.h.name)}</span><span>${x.k}/${x.n}</span><span class="rb"><i style="width:${x.p}%;background:${x.h.color}"></i><em>${x.p}%</em></span><span>${x.s.cur}</span><span>${x.s.best}</span></div>`).join('');
 const T=today(),st=add(monday(T),-52*7),nn=S.habits.length||1;let H='';for(let i=0;i<371;i++){const d=add(st,i);if(d>T){H+='<i style="visibility:hidden"></i>';continue}const c=count(d),q=c/nn,l=!c?0:q<=.25?1:q<=.5?2:q<1?3:4;H+=`<i class="l${l}" data-d="${d}" data-c="${c}"></i>`}$('#heat').innerHTML=H}
function ach(){$('#ach').innerHTML=ACH.map(a=>{const u=S.ach[a[1]];return`<div class="panel ${u?'on':''}"><span class="ai">${u?a[0]:'🔒'}</span><div><h3>${a[1]}</h3><p>${a[2]}${u?' · unlocked '+u:''}</p></div></div>`}).join('')}
function profile(){const L=level(S.xp).l;$('#pAv').textContent=S.avatar;num($('#pLvl'),L);num($('#pXp'),S.xp);num($('#pHab'),S.habits.length);num($('#pDays'),allDates().length)}

/* ---------- charts ---------- */
const GC='#1fae63',GC2=['#1fae63','#0f7a45','#6fbf3a','#19a88a','#3ddc84','#8bd1a8'];
function prep(c){const r=c.getBoundingClientRect(),d=devicePixelRatio||1;c.width=r.width*d;c.height=r.height*d;const x=c.getContext('2d');x.scale(d,d);x.clearRect(0,0,r.width,r.height);return[x,r.width,r.height]}
const lab=(x,s,px,py,al='center')=>{x.fillStyle='#6fa588';x.font='11px Rajdhani,sans-serif';x.textAlign=al;x.fillText(s,px,py)};
const buck=(ds,fn)=>{if(ds.length<=90)return ds.map(fn);const o=[];for(let i=0;i<ds.length;i+=7)o.push(ds.slice(i,i+7).reduce((a,d)=>a+fn(d),0));return o};
function drawCharts(k){const ds=span(rng),pv=span(rng,rng);
 {const[x,w,h]=prep($('#cTrend')),a=buck(ds,count),b=buck(pv,count),m=Math.max(1,...a,...b),px=i=>a.length>1?26+i*(w-30)/(a.length-1):w/2,py=v=>h-18-(h-34)*v/m*k;
  x.strokeStyle='rgba(31,174,99,.14)';x.lineWidth=1;for(let i=0;i<=3;i++){const y=h-18-(h-34)*i/3;x.beginPath();x.moveTo(26,y);x.lineTo(w,y);x.stroke();lab(x,Math.round(m*i/3),22,y+3,'right')}
  const path=v=>{x.beginPath();v.forEach((q,i)=>i?x.lineTo(px(i),py(q)):x.moveTo(px(i),py(q)))};
  x.setLineDash([4,4]);path(b);x.strokeStyle='rgba(111,165,136,.6)';x.lineWidth=1.5;x.stroke();x.setLineDash([]);
  path(a);x.strokeStyle=GC;x.lineWidth=2;x.shadowColor=GC;x.shadowBlur=8;x.stroke();x.shadowBlur=0;x.lineTo(px(a.length-1),h-18);x.lineTo(px(0),h-18);const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(31,174,99,.35)');g.addColorStop(1,'rgba(31,174,99,0)');x.fillStyle=g;x.fill();
  if(a.length<=31)a.forEach((q,i)=>{x.beginPath();x.arc(px(i),py(q),2.5,0,6.28);x.fillStyle=GC;x.fill()});
  lab(x,rng+'D AGO',26,h-4,'left');lab(x,'TODAY',w,h-4,'right')}
 {const[x,w,h]=prep($('#cDow')),dw=Array(7).fill(0);ds.forEach(d=>dw[dowOf(d)]+=count(d));const m=Math.max(1,...dw),bw=w/7,mi=dw.indexOf(Math.max(...dw));
  dw.forEach((v,i)=>{const bh=(h-34)*v/m*k;x.fillStyle=i===mi&&v?GC:'rgba(31,174,99,.45)';x.shadowColor=GC;x.shadowBlur=i===mi?12:0;x.fillRect(i*bw+bw*.2,h-18-bh,bw*.6,bh);x.shadowBlur=0;lab(x,DAYS[i],i*bw+bw/2,h-4);lab(x,v,i*bw+bw/2,h-22-bh)})}
 {const[x,w,h]=prep($('#cCat')),cm={};S.habits.forEach(hb=>{cm[hb.cat]=(cm[hb.cat]||0)+ds.reduce((a,d)=>a+(hb.log[d]?1:0),0)});const E=Object.entries(cm).filter(e=>e[1]),TT=E.reduce((a,e)=>a+e[1],0),R=Math.min(h/2-14,w/3),cx=R+16,cy=h/2;
  if(!TT)lab(x,'NO DATA YET',w/2,h/2);else{let s=-Math.PI/2;E.forEach((e,i)=>{const an=e[1]/TT*6.2832*k;x.beginPath();x.arc(cx,cy,R,s,s+an);x.strokeStyle=GC2[i%6];x.lineWidth=R*.38;x.shadowColor=GC2[i%6];x.shadowBlur=8;x.stroke();s+=an});x.shadowBlur=0;x.fillStyle='#d4f5e2';x.font='700 16px Orbitron,sans-serif';x.textAlign='center';x.fillText(TT,cx,cy+5);
   E.forEach((e,i)=>{const y=22+i*20;x.fillStyle=GC2[i%6];x.fillRect(cx+R+24,y-9,10,10);lab(x,e[0]+' · '+Math.round(e[1]/TT*100)+'%',cx+R+40,y,'left')})}}
 {const[x,w,h]=prep($('#cCons')),hs=S.habits.slice(0,8),rh=Math.min(24,(h-4)/Math.max(1,hs.length));hs.forEach((a,i)=>{const p=hRate(a,ds).p/100*k,y=i*rh+2;lab(x,a.icon+' '+a.name.slice(0,10),0,y+rh*.65,'left');x.fillStyle='rgba(31,174,99,.1)';x.fillRect(110,y+3,w-150,rh-8);x.fillStyle=a.color;x.fillRect(110,y+3,(w-150)*p,rh-8);lab(x,Math.round(p*100)+'%',w,y+rh*.65,'right')})}
 {const[x,w,h]=prep($('#cStreak')),run=d=>{let c=0,e=d;while(count(e)){c++;e=add(e,-1)}return c},a=(ds.length>90?ds.filter((_,i)=>i%7===6):ds).map(run),m=Math.max(1,...a),st=w/Math.max(1,a.length-1);
  x.beginPath();a.forEach((v,i)=>{const px=i*st,py=h-16-(h-30)*v/m*k;i?x.lineTo(px,py):x.moveTo(px,py)});x.strokeStyle=GC;x.lineWidth=2;x.shadowColor=GC;x.shadowBlur=8;x.stroke();x.shadowBlur=0;lab(x,'PEAK '+Math.max(...a),w,10,'right');lab(x,rng+'D AGO',0,h-2,'left');lab(x,'TODAY',w,h-2,'right')}}
function animCharts(){const t0=performance.now(),f=n=>{const k=Math.min(1,(n-t0)/800);drawCharts(1-Math.pow(1-k,3));if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)}

/* ---------- modal ---------- */
const modal=$('#modal'),form=$('#form');
function fillStatic(){$('#catFilter').innerHTML=['All',...CATS].map(c=>`<option>${c}</option>`).join('');form.elements.cat.innerHTML=CATS.map(c=>`<option>${c}</option>`).join('');
 $('#icons').innerHTML=ICONS.map((c,i)=>`<label><input type="radio" name="icon" value="${c}" ${i?'':'checked'}><span>${c}</span></label>`).join('');
 $('#colors').innerHTML=COLORS.map((c,i)=>`<label><input type="radio" name="color" value="${c}" ${i?'':'checked'}><span style="background:${c}"></span></label>`).join('');
 $('#pAvSel').innerHTML=['◈','◇','⟡','⌬','⌁','▣','△','⟐','⚙'].map(c=>`<option>${c}</option>`).join('')}
let opener;function openM(id){opener=document.activeElement;editing=id;const h=S.habits.find(x=>x.id===id);form.reset();$('#mTitle').textContent=h?'Edit habit':'New habit';
 if(h){form.elements.name.value=h.name;form.elements.desc.value=h.desc;form.elements.cat.value=h.cat;form.elements.freq.value=h.freq;form.elements.icon.value=h.icon;form.elements.color.value=h.color}
 modal.classList.add('open');modal.setAttribute('aria-hidden','false');setTimeout(()=>form.elements.name.focus(),50)}
const closeM=()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true');opener&&opener.focus&&opener.focus()};form.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const f=$$('input:not([type=radio]),select,button,input[type=radio]:checked',form),a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}});
form.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(form),d={name:f.get('name').trim(),desc:f.get('desc').trim(),cat:f.get('cat'),freq:f.get('freq'),icon:f.get('icon'),color:f.get('color')};if(!d.name)return;
 if(editing)Object.assign(S.habits.find(x=>x.id===editing),d);else S.habits.push({id:uid(),created:today(),log:{},...d});
 toast(editing?'◈ HABIT UPDATED':'◈ HABIT CREATED');save();render();closeM()});
$('#cancel').onclick=closeM;modal.addEventListener('pointerdown',e=>{if(e.target===modal)closeM()});
addEventListener('keydown',e=>{if(e.key==='Escape')closeM()});
$('#newBtn').onclick=()=>openM(null);

/* ---------- events ---------- */
$('#grid').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const id=b.closest('.card').dataset.id,h=S.habits.find(x=>x.id===id),a=b.dataset.a;
 if(a==='tg')toggle(id,today(),b);else if(a==='ed')openM(id);
 else if(a==='rs'&&confirm('Reset all progress for "'+h.name+'"?')){const n=Object.keys(h.log).length;S.xp=Math.max(0,S.xp-n*XPH);h.log={};save();render()}
 else if(a==='dl'&&confirm('Delete "'+h.name+'"?')){S.xp=Math.max(0,S.xp-Object.keys(h.log).length*XPH);S.habits=S.habits.filter(x=>x.id!==id);save();render()}});
$('#mission').addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(b)toggle(b.dataset.m,today(),b)});
$('#week').addEventListener('click',e=>{const b=e.target.closest('[data-w]');if(b){const[id,d]=b.dataset.w.split('|');toggle(id,d)}});
$('#wPrev').onclick=()=>{wOff--;week()};$('#wNext').onclick=()=>{if(wOff<0){wOff++;week()}};
$('#search').oninput=e=>{q=e.target.value.toLowerCase();cards()};$('#catFilter').onchange=e=>{catF=e.target.value;cards()};
$('#pName').oninput=e=>{S.name=e.target.value||'OPERATOR';save()};$('#pAvSel').onchange=e=>{S.avatar=e.target.value;save();profile()};
$('#fxOn').onchange=e=>{S.fx=e.target.checked;save();$('#fx').style.display=S.fx?'':'none'};
$('#export').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'}));a.download='vortex-bits.json';a.click();toast('↗ DATA EXPORTED')};
$('#wipe').onclick=()=>{if(confirm('Erase all habits and progress?')){S=fresh();save();render();toast('× DATA RESET')}};
$('#heat').addEventListener('pointerover',e=>{const c=e.target.dataset;if(c.d)$('#tip').textContent=c.c+' completed habits — '+fmt(c.d)});
$('#heat').addEventListener('click',e=>{const c=e.target.dataset;if(c.d)$('#tip').textContent=c.c+' completed habits — '+fmt(c.d)});
document.addEventListener('pointerdown',e=>{const b=e.target.closest('.btn');if(!b||b.disabled)return;const r=b.getBoundingClientRect(),s=document.createElement('span'),z=Math.max(r.width,r.height)/4;s.className='rip';s.style.cssText=`width:${z*2}px;height:${z*2}px;left:${e.clientX-r.left-z}px;top:${e.clientY-r.top-z}px`;b.append(s);setTimeout(()=>s.remove(),600)});

$$('.seg button').forEach(b=>b.onclick=()=>{rng=+b.dataset.r;$$('.seg button').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b)});analytics();animCharts();popK()});
const popK=()=>{const k=$('#kpis');k.classList.remove('pop');void k.offsetWidth;k.classList.add('pop')};
function scr(el){if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;const t=el.dataset.t||(el.dataset.t=el.textContent),ch='◈◇⟡⌬⌁▣△01';let i=0;const id=setInterval(()=>{el.textContent=[...t].map((c,k)=>k<i||c===' '?c:ch[Math.random()*ch.length|0]).join('');if(++i>t.length){clearInterval(id);el.textContent=t}},40)}
$$('.stats .stat').forEach((e,i)=>e.style.setProperty('--i',i));
/* ---------- ambience ---------- */
function clock(){const d=new Date();$('#clock').textContent=d.toLocaleTimeString('en-GB')}
setInterval(clock,1000);clock();
let qi=0;const qe=$('#quote');qe.textContent=QUOTES[0];setInterval(()=>{qe.style.opacity=0;setTimeout(()=>{qi=(qi+1)%QUOTES.length;qe.textContent=QUOTES[qi];qe.style.opacity=1},500)},9000);
(function type(){let p=0,n=0,del=false;const el=$('#typed');(function s(){const w=PHRASES[p];n+=del?-1:1;el.textContent=w.slice(0,n);let d=del?35:75;if(!del&&n===w.length){del=true;d=1500}else if(del&&n===0){del=false;p=(p+1)%PHRASES.length;d=400}setTimeout(s,d)})()})();
(function particles(){const c=$('#fx'),x=c.getContext('2d'),P=[];let W,H,cx,cy;const rs=()=>{W=c.width=innerWidth;H=c.height=innerHeight;cx=W*.62;cy=H*.34};rs();addEventListener('resize',rs);
 const mkp=()=>({a:Math.random()*6.28,r:Math.max(W,H)*(.15+Math.random()*.65),s:.002+Math.random()*.004,z:Math.random()*1.6+.5,px:0,py:0});
 for(let i=0;i<(innerWidth<720?45:85);i++)P.push(mkp());
 (function f(){if(!document.hidden&&S.fx&&!matchMedia('(prefers-reduced-motion:reduce)').matches){x.globalCompositeOperation='destination-out';x.fillStyle='rgba(0,0,0,.14)';x.fillRect(0,0,W,H);x.globalCompositeOperation='lighter';x.lineCap='round';
  P.forEach(p=>{p.a+=p.s*(600/(p.r+120));p.r-=.35+p.z*.2;if(p.r<18)Object.assign(p,mkp());const X=cx+Math.cos(p.a)*p.r,Y=cy+Math.sin(p.a)*p.r*.7;if(p.px){x.beginPath();x.moveTo(p.px,p.py);x.lineTo(X,Y);x.strokeStyle=`rgba(31,174,99,${Math.min(.8,.2+p.z*.25)})`;x.lineWidth=p.z;x.stroke()}p.px=X;p.py=Y});x.globalCompositeOperation='source-over'}requestAnimationFrame(f)})()})();
if(matchMedia('(hover:hover) and (pointer:fine)').matches){document.body.classList.add('cur');
 const dot=$('.cur-dot'),ring=$('.cur-ring'),gl=$('.cur-glow'),hud=$('.hud.tl'),vx=$('.vortex'),tr=Array.from({length:8},(_,i)=>{const el=document.createElement('i');el.className='cur-t';el.style.opacity=.5*(1-i/8);document.body.append(el);return{el,x:0,y:0}});
 let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my,gx=mx,gy=my;dot.style.transform=ring.style.transform=gl.style.transform=`translate(${mx}px,${my}px)`;
 addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;dot.style.transform=`translate(${mx}px,${my}px)`});
 (function f(){vx.style.transform=`translate(${(mx-innerWidth/2)*-.015}px,${(my-innerHeight/2)*-.015}px)`;rx+=(mx-rx)*.18;ry+=(my-ry)*.18;gx+=(mx-gx)*.07;gy+=(my-gy)*.07;ring.style.transform=`translate(${rx}px,${ry}px)`;gl.style.transform=`translate(${gx}px,${gy}px)`;let px=mx,py=my;tr.forEach((t,i)=>{t.x+=(px-t.x)*.35;t.y+=(py-t.y)*.35;t.el.style.transform=`translate(${t.x}px,${t.y}px) scale(${1-i/9})`;px=t.x;py=t.y});hud.textContent='X:'+String(mx|0).padStart(4,'0')+' Y:'+String(my|0).padStart(4,'0');requestAnimationFrame(f)})();
 document.addEventListener('pointerover',e=>ring.classList.toggle('hot',!!e.target.closest('a,button,input,select,label,.hex')));
 let last=null;document.addEventListener('pointermove',e=>{const p=e.target.closest('.panel');if(last&&last!==p)last.style.transform='';last=p;if(!p)return;const r=p.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;p.style.setProperty('--mx',px*100+'%');p.style.setProperty('--my',py*100+'%');if(p.matches('.stat,.card'))p.style.transform=`perspective(700px) rotateX(${(.5-py)*7}deg) rotateY(${(px-.5)*9}deg) translateY(-3px)`})}
{const spb=$('#spBar');let tk=0;addEventListener('scroll',()=>{if(tk)return;tk=requestAnimationFrame(()=>{tk=0;const m=document.documentElement.scrollHeight-innerHeight;spb.style.transform=`scaleX(${m>0?scrollY/m:0})`})},{passive:true})}
{const t=$('.ticker div');t.innerHTML+=t.innerHTML}
(function boot(){const b=$('#boot'),bar=$('#bootBar'),t=$('#bootTxt');requestAnimationFrame(()=>requestAnimationFrame(()=>bar.style.width='100%'));['LOADING HABIT CORE…','SYNCING STREAK ENGINE…','VORTEX ONLINE'].forEach((s,i)=>setTimeout(()=>t.textContent=s,i*450));setTimeout(()=>b.classList.add('off'),1500);setTimeout(()=>b.remove(),2100)})();

const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');const hd=en.target.querySelector('h2');if(hd&&!hd._s){hd._s=1;scr(hd)}if(en.target.id==='analytics'&&!en.target._a){en.target._a=1;animCharts();popK()}}}),{threshold:.08});$$('.rv').forEach(el=>io.observe(el));
const links=$$('.nav a'),so=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting)links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+en.target.id))}),{rootMargin:'-40% 0px -55% 0px'});['dashboard','habits','analytics','achievements','profile','settings'].forEach(id=>so.observe($('#'+id)));
addEventListener('resize',()=>drawCharts(1));

/* ---------- boot ---------- */
S.habits.forEach(h=>{const i=['#2bff88','#10b981','#a3ff12','#00e5c3','#7dffb0'].indexOf(h.color);if(i>-1)h.color=COLORS[i]});fillStatic();$('#pName').value=S.name;$('#pAvSel').value=S.avatar;$('#fxOn').checked=S.fx;$('#fx').style.display=S.fx?'':'none';
const y=add(today(),-1);if(S.missed!==today()){const m=S.habits.filter(h=>h.created<=y&&due(h,y)&&!h.log[y]).length;S.missed=today();save();if(m)setTimeout(()=>toast('⚠ HABIT MISSED // '+m+' YESTERDAY'),1200)}
render();
})();

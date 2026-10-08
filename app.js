
const $=id=>document.getElementById(id);let step=1,total=4;
const CHECKUP_STEPS=['Obiectiv','Flux lunar','Bază financiară','Context'];
const num=id=>Math.max(0,parseFloat($(id)?.value)||0);
function hideMainViews(){['home','homeFeatures','checkup','results','simulator','calculators','articles','article-investitii','article-economisire','article-urgenta','article-bursa','cookies'].forEach(id=>$(id)?.classList.add('hidden'))}
window.addEventListener('popstate',()=>{const h=location.hash.replace('#','');if(h==='calculators')showCalculators(false);else if(h.startsWith('calc-'))openCalculator(h.replace('calc-',''),false);else if(h==='articles')showArticles(false);else if(h.startsWith('article-'))showArticle(h.replace('article-',''),false);else if(h==='simulator')showSimulator(false,false);else if(h==='checkup')startCheckup(false);else if(h==='cookies')showCookies(false);else backHome(false)});
function showCalculators(push=true){hideMainViews();$('calculators').classList.remove('hidden');$('calculatorPanel').classList.add('hidden');if(push)history.pushState({view:'calculators'},'', '#calculators');scrollTop()}
function openCalculator(type,push=true){hideMainViews();$('calculators').classList.remove('hidden');$('calculatorPanel').classList.remove('hidden');if(push)history.pushState({view:'calculator',type},'', '#calc-'+type);renderCalculator(type);setTimeout(()=>$('calculatorPanel').scrollIntoView({behavior:'smooth',block:'start'}),20)}
function money(n){return Math.round(n).toLocaleString('ro-RO')+' lei'}
function pct(n){return (Math.round(n*10)/10).toLocaleString('ro-RO')+'%'}
function field(id,label,value,help=''){return '<div class="field"><label>'+label+'</label>'+(help?'<small>'+help+'</small>':'')+'<input id="'+id+'" type="number" min="0" value="'+(value??'')+'" placeholder="0"></div>'}
function renderCalculator(type){
const p=$('calculatorPanel');let title='',lead='',html='',calc='';
const back='<div class="actions"><button class="btn secondary" onclick="showCalculators()">← Toate calculatoarele</button></div>';
if(type==='compound'){title='Dobândă compusă';lead='Simulează evoluția unei sume inițiale plus contribuții lunare.';html='<div class="formgrid">'+field('c0','Sumă inițială (lei)',10000)+field('cm','Contribuție lunară (lei)',500)+field('cy','Perioadă (ani)',10)+field('cr','Randament anual ipotetic (%)',7)+'</div><div id="crout" class="sim-result"></div>';calc='compound'}
if(type==='monthly'){title='Cât să investesc lunar?';lead='Calculează contribuția lunară necesară pentru o sumă-țintă.';html='<div class="formgrid">'+field('mt','Obiectiv (lei)',100000)+field('m0','Sumă deja investită (lei)',10000)+field('my','Perioadă (ani)',10)+field('mr','Randament anual ipotetic (%)',7)+'</div><div id="mrout" class="sim-result"></div>';calc='monthly'}
if(type==='goal'){title='În cât timp ajung la obiectiv?';lead='Estimează perioada necesară pentru a ajunge la suma dorită.';html='<div class="formgrid">'+field('gt','Obiectiv (lei)',100000)+field('g0','Sumă inițială (lei)',10000)+field('gm','Contribuție lunară (lei)',500)+field('gr','Randament anual ipotetic (%)',7)+'</div><div id="grout" class="sim-result"></div>';calc='goal'}
if(type==='emergency'){title='Fond de urgență';lead='O regulă simplă: pornește de la cheltuielile esențiale și stabilește câte luni vrei să acoperi.';html='<div class="formgrid">'+field('ee','Cheltuieli lunare (lei)',4000)+field('em','Luni de rezervă',6)+field('ea','Economii existente (lei)',10000)+'</div><div id="erout" class="sim-result"></div>';calc='emergency'}
if(type==='savings'){title='Rata de economisire';lead='Află cât din venitul lunar rămâne după cheltuieli și ce se întâmplă dacă schimbi una dintre ele.';html='<div class="formgrid">'+field('si','Venit net lunar (lei)',7000)+field('se','Cheltuieli lunare (lei)',5000)+field('si2','Investiții/economii lunare (lei)',1000)+'</div><div id="srout" class="sim-result"></div>';calc='savings'}
if(type==='loan'){title='Costul unui credit';lead='Estimare matematică a ratei și a costului total, fără comisioane sau asigurări.';html='<div class="formgrid">'+field('lp','Suma împrumutată (lei)',100000)+field('ly','Perioada (ani)',5)+field('lr','Dobânda anuală (%)',7)+'</div><div id="lrout" class="sim-result"></div>';calc='loan'}
if(type==='inflation'){title='Puterea de cumpărare';lead='Vezi ce putere de cumpărare ar avea o sumă în viitor la o anumită rată a inflației.';html='<div class="formgrid">'+field('ip','Sumă actuală (lei)',10000)+field('iy','Perioada (ani)',10)+field('ir','Inflație anuală (%)',3)+'</div><div id="irout" class="sim-result"></div>';calc='inflation'}
if(type==='car'){title='Costul real al mașinii';lead='Nu te uita doar la combustibil. Adună costurile recurente pentru o imagine mai realistă.';html='<div class="formgrid">'+field('cp','Rată/leasing lunar (lei)',1000)+field('cf','Combustibil lunar (lei)',600)+field('ci','Asigurare + impozit lunar (lei)',250)+field('cmnt','Service + anvelope lunar (lei)',250)+'</div><div id="crcarout" class="sim-result"></div>';calc='car'}
p.innerHTML='<div class="eyebrow">CALCULATOR</div><h2 style="margin:0 0 6px;font-size:32px">'+title+'</h2><p style="color:var(--muted);margin:0 0 24px">'+lead+'</p>'+html+back;
runCalculator(calc)
}
function runCalculator(type){
const n=id=>num(id);
if(type==='compound'){const r=n('cr')/100/12,months=n('cy')*12;let v=n('c0');for(let i=0;i<months;i++)v=v*(1+r)+n('cm');$('crout').innerHTML=resultCards('Valoare finală',money(v),'Contribuții',money(n('c0')+n('cm')*months),'Câștig ipotetic',money(Math.max(0,v-n('c0')-n('cm')*months)))}
if(type==='monthly'){const months=n('my')*12,r=n('mr')/100/12,target=n('mt'),initial=n('m0');let needed=0;if(r===0)needed=Math.max(0,(target-initial)/months);else needed=Math.max(0,(target-initial*Math.pow(1+r,months))*r/(Math.pow(1+r,months)-1));$('mrout').innerHTML=resultCards('Contribuție lunară',money(needed),'Contribuții totale',money(needed*months),'Creștere ipotetică',money(Math.max(0,target-initial-needed*months)))}
if(type==='goal'){let v=n('g0'),m=n('gm'),r=n('gr')/100/12,months=0,target=n('gt');while(v<target&&months<1200){v=v*(1+r)+m;months++}$('grout').innerHTML=resultCards('Timp estimat',Math.floor(months/12)+' ani '+months%12+' luni','Contribuții',money(n('g0')===0?m*months:m*months),'Valoare la final',money(v))}
if(type==='emergency'){const target=n('ee')*n('em'),gap=Math.max(0,target-n('ea'));$('erout').innerHTML=resultCards('Fond recomandat',money(target),'Ai deja',money(n('ea')),'Îți mai lipsesc',money(gap))}
if(type==='savings'){const rate=n('si')?((n('si')-n('se'))/n('si'))*100:0;const investRate=n('si')?n('si2')/n('si')*100:0;$('srout').innerHTML=resultCards('Rata de economisire',pct(rate),'Economii + investiții',money(n('si')-n('se')),'Investiții/economii',pct(investRate))}
if(type==='loan'){const r=n('lr')/100/12,months=n('ly')*12,p=n('lp');let payment=r? p*r*Math.pow(1+r,months)/(Math.pow(1+r,months)-1):p/months;let total=payment*months;$('lrout').innerHTML=resultCards('Rată lunară',money(payment),'Total plătit',money(total),'Dobândă estimată',money(total-p))}
if(type==='inflation'){const future=n('ip')/Math.pow(1+n('ir')/100,n('iy'));$('irout').innerHTML=resultCards('Putere de cumpărare viitoare',money(future),'Pierdere de putere de cumpărare',pct((1-future/n('ip'))*100),'Suma nominală',money(n('ip')))}
if(type==='car'){const total=n('cp')+n('cf')+n('ci')+n('cmnt');$('crcarout').innerHTML=resultCards('Cost lunar estimat',money(total),'Cost anual',money(total*12),'Cost pe 5 ani',money(total*60))}
}
function resultCards(a,b,c,d,e,f){return '<div class="mini-grid"><div class="mini"><small>'+a+'</small><div class="result-big">'+b+'</div></div><div class="mini"><small>'+c+'</small><div class="result-big">'+d+'</div></div><div class="mini"><small>'+e+'</small><div class="result-big">'+f+'</div></div></div><p class="note">Calcul orientativ. Rezultatul depinde de ipotezele introduse și nu reprezintă o promisiune de randament sau o recomandare financiară.</p>'}
function showArticles(push=true){hideMainViews();$('articles')?.classList.remove('hidden');if(push)history.pushState({view:'articles'},'', '#articles');setTimeout(()=>$('articles').scrollIntoView({behavior:'smooth',block:'start'}),20)}
function showArticle(id,push=true){hideMainViews();$('article-'+id).classList.remove('hidden');if(push)history.pushState({view:'article',id:id},'', '#article-'+id);scrollTop()}
function showCookies(push=true){hideMainViews();$('cookies').classList.remove('hidden');if(push)history.pushState({view:'cookies'},'', '#cookies');scrollTop()}
const COOKIE_KEY='drmoney:cookieConsent';
function cookieConsent(){try{return JSON.parse(localStorage.getItem(COOKIE_KEY)||'null')}catch(e){return null}}
function showCookieBannerIfNeeded(){if(!cookieConsent())$('cookieBanner').classList.remove('hidden');else $('cookieFab').classList.remove('hidden')}
function applyCookiePreferences(prefs){/* Reserved for optional analytics/marketing integrations. No non-essential trackers are active in this version. */}
function saveCookieConsent(all){const prefs={necessary:true,analytics:!!all,marketing:!!all,updatedAt:new Date().toISOString()};localStorage.setItem(COOKIE_KEY,JSON.stringify(prefs));applyCookiePreferences(prefs);$('cookieBanner').classList.add('hidden');$('cookieOverlay').classList.add('hidden');$('cookieFab').classList.remove('hidden')}
function saveCustomCookieConsent(){const prefs={necessary:true,analytics:$('cookieAnalytics').checked,marketing:$('cookieMarketing').checked,updatedAt:new Date().toISOString()};localStorage.setItem(COOKIE_KEY,JSON.stringify(prefs));applyCookiePreferences(prefs);$('cookieBanner').classList.add('hidden');$('cookieOverlay').classList.add('hidden');$('cookieFab').classList.remove('hidden')}
function openCookieSettings(){const p=cookieConsent()||{analytics:false,marketing:false};$('cookieAnalytics').checked=!!p.analytics;$('cookieMarketing').checked=!!p.marketing;$('cookieOverlay').classList.remove('hidden')}
function closeCookieSettings(){if(cookieConsent())$('cookieOverlay').classList.add('hidden')}

async function subscribeNewsletter(event){
  event.preventDefault();
  const email=$('newsletterEmail').value.trim();
  const msg=$('newsletterMsg');
  if(!email)return;
  msg.className='newsletter-msg';
  msg.textContent='Se trimite...';
  try{
    const res=await fetch('/api/newsletter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});
    const data=await res.json().catch(()=>({}));
    if(!res.ok)throw new Error(data.error||'Nu am putut procesa înscrierea.');
    msg.className='newsletter-msg success';
    msg.textContent='Verifică-ți inboxul. Ți-am trimis un email pentru confirmarea înscrierii.';
    $('newsletterEmail').value='';
  }catch(e){
    msg.className='newsletter-msg error';
    msg.textContent=e.message||'A apărut o eroare. Încearcă din nou.';
  }
}
function startCheckup(push=true){
 ['home','homeFeatures','results','simulator','calculators','articles','article-investitii','article-economisire','article-urgenta','article-bursa','cookies'].forEach(id=>$(id)?.classList.add('hidden'));
 $('checkup').classList.remove('hidden');
 if(push)history.pushState({view:'checkup'},'', '#checkup');
 step=1;renderStep();scrollTop();
}
function renderStep(){
 document.querySelectorAll('.step').forEach((x,i)=>x.classList.toggle('active',i===step-1));
 document.querySelectorAll('.checkup-step').forEach((x,i)=>x.classList.toggle('active',i===step-1));
 $('bar').style.width=((step/total)*100)+'%';
 $('stepno').textContent=step+' / '+total;
 $('back').disabled=step===1;
 $('next').textContent=step===total?'Vezi scorul →':'Continuă →';
}
function required(){let ids=[];if(step===2)ids=['income','expenses'];if(step===3)ids=['cash','investments','debt'];for(const id of ids){const v=parseFloat($(id).value);if(!Number.isFinite(v)||v<0){toast('Completează câmpurile obligatorii.');$(id).focus();return false}}return true}
function nextStep(){if(!required())return;if(step<total){step++;renderStep()}else showResults()}
function prevStep(){if(step>1){step--;renderStep()}else backHome()}
function scoreData(){
const income=num('income'),expenses=num('expenses'),cash=num('cash'),invest=num('investments'),debt=num('debt'),monthlyInvest=num('monthlyInvest');
const debtBalance=num('debtBalance'),housing=num('housing'),age=num('age'),dependents=num('dependents');
const goal=$('goal')?.value||'',horizon=$('horizon')?.value||'unknown',employment=$('employment')?.value||'';
const savings=Math.max(0,income-expenses),savingsRate=income?savings/income:0,emergency=expenses?cash/expenses:0,debtRatio=income?debt/income:1,investRate=income?monthlyInvest/income:0;
const savingsScore=savingsRate<.05?20:savingsRate<.1?40:savingsRate<.15?60:savingsRate<.2?75:savingsRate<.3?90:100;
const emergencyScore=emergency<1?20:emergency<3?50:emergency<6?80:emergency<=12?100:90;
const debtScore=debtRatio===0?100:debtRatio<.1?90:debtRatio<.2?75:debtRatio<.3?55:debtRatio<.4?35:15;
const investScore=investRate===0?25:investRate<.05?40:investRate<.1?60:investRate<.2?80:investRate<.3?90:100;
const liquidityRatio=(cash+invest)>0?cash/(cash+invest):0;const liquidityScore=Math.round(Math.min(100,20+liquidityRatio*60+(cash>=expenses*3?20:0)));
const total=Math.round(savingsScore*.25+emergencyScore*.25+debtScore*.2+investScore*.15+liquidityScore*.15);return{income,expenses,cash,invest,debt,debtBalance,housing,monthlyInvest,age,dependents,goal,horizon,employment,savings,savingsRate,emergency,debtRatio,investRate,savingsScore,emergencyScore,debtScore,investScore,liquidityScore,total}}
function label(s){return s>=80?'Excelent':s>=65?'Bun':s>=50?'În dezvoltare':'Necesită atenție'}
function metric(n,v){return `<div class="sub"><div class="subtop"><span>${n}</span><b>${Math.round(v)}</b></div><div class="meter"><i style="width:${v}%"></i></div></div>`}
function showResults(){
$('articles')?.classList.add('hidden');
const d=scoreData(),goal=$('goal').value,horizon=$('horizon').value,age=num('age'),dep=num('dependents');
const previous=(()=>{try{return JSON.parse(localStorage.getItem('drmoney:lastCheckup')||'null')}catch(e){return null}})();
const contextHint=d.employment==='Salariat'?'venit de tip salariu':d.employment==='PFA / profesie liberală'?'venit din activitate independentă':d.employment==='Antreprenor / SRL'?'venit antreprenorial':'venituri mixte';

const scoreDelta=previous&&Number.isFinite(previous.total)?d.total-previous.total:null;
const progressText=scoreDelta===null?'Acesta este primul tău check-up. Repetă-l peste 30–90 de zile pentru a vedea evoluția.':scoreDelta>0?'Scorul tău a crescut față de ultimul check-up.':scoreDelta<0?'Scorul tău a scăzut față de ultimul check-up — nu e un verdict, ci un semnal de verificat.':'Scorul tău este neschimbat față de ultimul check-up.';
const target=d.expenses*3,gap=Math.max(0,target-d.cash),saveTarget=d.income*.2,saveGap=Math.max(0,saveTarget-d.savings);
let actions=[];
if(d.emergency<3)actions.push(['Adu rezerva la 3 luni','Ai '+d.emergency.toFixed(1)+' luni acoperite.','Țintă: '+Math.round(target).toLocaleString('ro-RO')+' lei','Primul prag de siguranță.']);
if(d.debtRatio>.3)actions.push(['Redu presiunea datoriilor','Ratele sunt '+(d.debtRatio*100).toFixed(1)+'% din venit.','Prioritate: datorii','Înainte de investiții agresive, verifică dobânda și costul total.']);
if(d.savingsRate<.2)actions.push(['Crește economisirea','Îți rămân '+Math.round(d.savings).toLocaleString('ro-RO')+' lei/lună.','Prag orientativ: '+Math.round(saveTarget).toLocaleString('ro-RO')+' lei','Diferența este de '+Math.round(saveGap).toLocaleString('ro-RO')+' lei/lună.']);
if(d.investRate<.1&&d.emergency>=3&&d.debtRatio<=.3)actions.push(['Crește investițiile recurente','Investești '+Math.round(d.investRate*100)+'% din venit.','Țintă de test: 10%','Crește gradual și testează impactul.']);
if(!actions.length)actions.push(['Optimizează, nu reinventa','Fundația financiară arată solid.','Următorul nivel: obiective','Testează scenarii și optimizează pentru obiectivul tău.']);
actions=actions.slice(0,3);
const cls=d.total>=80?'good':d.total>=50?'ok':'bad',status=d.total>=80?'Bază foarte solidă':d.total>=65?'Bun, cu loc de optimizare':d.total>=50?'În construcție':'Ai nevoie întâi de fundație';
const headline=d.total>=80?'Ai construit o bază financiară puternică.':d.total>=65?'Ești într-o poziție bună. Câteva ajustări pot face diferența.':d.total>=50?'Ai o bază, dar câteva lucruri merită rezolvate înainte de optimizare.':'Primul obiectiv nu este randamentul. Este stabilitatea.';
const pillar=(n,v,w)=>'<div class="pillar"><div class="pillar-top"><b>'+n+'</b><b>'+Math.round(v)+'/100</b></div><div class="bar-track"><div class="bar-fill" style="width:'+v+'%"></div></div><div class="why">'+w+'</div></div>';
$('checkup').classList.add('hidden');$('results').classList.remove('hidden');
$('results').innerHTML='<div class="report-hero"><div class="eyebrow" style="color:#b2ccff">RAPORTUL TĂU FINANCIAR</div><div class="report-row"><div><h2>'+headline+'</h2><p>Obiectiv: <b>'+goal+'</b> · Orizont: '+horizon+'. Dr. Money îți arată ce merită făcut mai întâi.</p></div><div class="score-pill '+cls+'">'+d.total+'<span style="font-size:20px;letter-spacing:0;color:#98a2b3"> /100</span></div></div><div class="target"><div class="target-card"><small>Direcția ta</small><b>'+goal+'</b></div><div class="target-card"><small>Status</small><b>'+status+'</b></div></div></div>'+
'<div class="card"><h3 class="section-title">Ce aș face prima dată</h3><p style="color:var(--muted)">Ordinea contează. Nu încerca să repari totul simultan.</p>'+actions.map((a,i)=>'<div class="action-card"><div style="display:flex;gap:11px"><span class="action-num">'+(i+1)+'</span><div><div class="action-title">'+a[0]+'</div><div style="color:var(--muted)">'+a[1]+'</div><div class="action-impact">'+a[2]+'</div></div></div><div class="why">→ '+a[3]+'</div></div>').join('')+'</div>'+
'<div class="report-grid"><div class="card"><h3 class="section-title">Unde ești acum</h3><div class="mini-grid"><div class="mini"><small>Cash-flow lunar</small><div class="metric-big">'+Math.round(d.savings).toLocaleString('ro-RO')+' lei</div></div><div class="mini"><small>Rezervă</small><div class="metric-big">'+d.emergency.toFixed(1)+' luni</div></div><div class="mini"><small>Investiții/lună</small><div class="metric-big">'+Math.round(d.monthlyInvest).toLocaleString('ro-RO')+' lei</div></div></div>'+pillar('Economisire',d.savingsScore,Math.round(d.savingsRate*100)+'% din venit rămâne după cheltuieli.')+pillar('Fond de urgență',d.emergencyScore,d.emergency.toFixed(1)+' luni acoperite.')+pillar('Datorii',d.debtScore,Math.round(d.debtRatio*100)+'% din venit merge către rate.')+pillar('Investiții',d.investScore,Math.round(d.investRate*100)+'% din venit este investit.')+pillar('Lichiditate',d.liquidityScore,'Echilibrul dintre bani lichizi și investiții.')+'</div>'+
'<div class="card"><h3 class="section-title">Testează 3 decizii</h3><div class="scenario-row"><div><b>+300 lei economisiți/lună</b><span>Vezi efectul asupra rezervei.</span></div><button class="btn secondary" onclick="scenario(300,0)">Testează</button></div><div class="scenario-row"><div><b>+500 lei investiți/lună</b><span>Vezi impactul pe 10 ani.</span></div><button class="btn secondary" onclick="scenario(0,500)">Testează</button></div><div class="scenario-row"><div><b>Fond de urgență la 3 luni</b><span>Îți lipsesc ~'+Math.round(gap).toLocaleString('ro-RO')+' lei.</span></div><button class="btn secondary" onclick="scenario('+Math.round(gap)+',0)">Vezi</button></div><div class="actions"><button class="btn" onclick="showSimulator(true)">Simulator complet →</button></div></div></div>'+
'<div class="card" style="margin-top:16px"><h3 class="section-title">Progres financiar</h3><div class="mini-grid"><div class="mini"><small>Scor actual</small><div class="metric-big">'+d.total+'/100</div></div><div class="mini"><small>Ultimul scor</small><div class="metric-big">'+(scoreDelta===null?'—':previous.total+'/100')+'</div></div><div class="mini"><small>Evoluție</small><div class="metric-big">'+(scoreDelta===null?'—':(scoreDelta>0?'+':'')+scoreDelta+' pct.')+'</div></div></div><p style="color:var(--muted);margin:14px 0 0">'+progressText+'</p></div><div class="card" style="margin-top:16px"><h3 class="section-title">De ce ai primit '+d.total+'/100?</h3><div class="insight"><b>Cel mai important semnal</b><span>'+actions[0][0]+': '+actions[0][1]+'</span></div><div class="insight"><b>Context</b><span>'+(age?age+' ani · ':'')+dep+' persoane în întreținere · obiectiv: '+goal+'.</span></div><p class="note">Scorul este orientativ pentru MVP. În următoarea versiune îl vom ajusta în funcție de obiectiv, vârstă, dependenți, stabilitatea venitului și tipul/costul datoriilor.</p></div>'+
'<div class="actions"><button class="btn secondary" onclick="startCheckup()">Refă check-up-ul</button><button class="btn secondary" onclick="backHome()">← Acasă</button></div>';
localStorage.setItem('drmoney:lastCheckup',JSON.stringify({...d,goal,horizon,age,dep,completedAt:new Date().toISOString()}));
const history=(()=>{try{return JSON.parse(localStorage.getItem('drmoney:scoreHistory')||'[]')}catch(e){return []}})();
history.push({score:d.total,completedAt:new Date().toISOString(),goal});
localStorage.setItem('drmoney:scoreHistory',JSON.stringify(history.slice(-10)));
scrollTop()}
function showSimulator(fromResults=false,push=true){['home','homeFeatures','checkup','results','calculators','articles','article-investitii','article-economisire','article-urgenta','article-bursa'].forEach(id=>$(id)?.classList.add('hidden'));$('simulator').classList.remove('hidden');if(push)history.pushState({view:'simulator'},'', '#simulator');if(fromResults){const d=scoreData();$('p0').value=Math.round(d.investments||d.invest);$('pm').value=Math.round(d.monthlyInvest||0);$('years').value=10}calculateInvestment();scrollTop()}
function scenario(extraSave,extraInvest){showSimulator(false);const d=scoreData();$("p0").value=Math.round(d.invest);$("pm").value=Math.round(d.monthlyInvest+extraInvest);$("years").value=10;calculateInvestment();if(extraSave>0)toast("Pentru rezerva de 3 luni mai lipsesc aproximativ "+extraSave.toLocaleString("ro-RO")+" lei.");}
function calculateInvestment(){const p0=num('p0'),pm=num('pm'),years=Math.max(1,num('years')),annual=num('rate')/100,n=years*12,r=annual/12;let fv=p0;for(let i=0;i<n;i++)fv=fv*(1+r)+pm;const contributed=p0+pm*n,gain=Math.max(0,fv-contributed);$('simResult').classList.remove('hidden');$('simResult').innerHTML=`<div class="mini-grid"><div class="mini"><small>Valoare finală</small><div class="result-big">${Math.round(fv).toLocaleString('ro-RO')} lei</div></div><div class="mini"><small>Contribuții</small><div class="result-big">${Math.round(contributed).toLocaleString('ro-RO')} lei</div></div><div class="mini"><small>Câștig ipotetic</small><div class="result-big">${Math.round(gain).toLocaleString('ro-RO')} lei</div></div></div><p class="note">Simulare cu capitalizare lunară. Nu include taxe, comisioane sau volatilitate și nu reprezintă o promisiune de randament.</p>`}
function backHome(push=true){hideMainViews();$('home').classList.remove('hidden');$('homeFeatures')?.classList.remove('hidden');$('articles')?.classList.add('hidden');if(push)history.pushState({view:'home'},'', '#home');scrollTop()}
function scrollTop(){window.scrollTo({top:0,behavior:'smooth'});}
document.getElementById("calculatorBtn").addEventListener("click",function(e){e.preventDefault();showCalculators();});
document.addEventListener('input',e=>{if(['c0','cm','cy','cr','mt','m0','my','mr','gt','g0','gm','gr','ee','em','ea','si','se','si2','lp','ly','lr','ip','iy','ir','cp','cf','ci','cmnt'].includes(e.target.id)){const h=location.hash;if(h.startsWith('#calc-'))runCalculator(h.replace('#calc-',''))}});
function toast(msg){$('toast').textContent=msg;$('toast').style.display='block';setTimeout(()=>$('toast').style.display='none',2200)}renderStep();backHome(false);showCookieBannerIfNeeded();

/* ===== Agenzia Navigare — logica catalogo + lingue ===== */
(function(){
  const BOATS = (window.BOATS || []).slice();
  const I18N = window.I18N;
  const LOCALE = {it:'it-IT', en:'en-IE', fr:'fr-FR', de:'de-DE', es:'es-ES', ru:'ru-RU'};
  const SPEC_ORDER = ['Length','Beam','Draft','Displacement','MaxPeople','Cabins',
                      'SpeedCruise','SpeedMax','Fuel','Water','HullShape','Omologation'];
  const PAGE = 24;

  const lang = () => window.__lang || 'it';
  const L = k => { const d = I18N[lang()] || I18N.it; return d[k] != null ? d[k] : (I18N.it[k] || k); };
  const loc = () => LOCALE[lang()] || 'it-IT';
  const fmtPrice = p => p ? new Intl.NumberFormat(loc(),{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(p) : null;
  const fmtLen = l => l ? l.toLocaleString(loc()) + ' m' : null;
  const img0 = b => (b.imgs && b.imgs[0]) ? b.imgs[0] : '';

  BOATS.forEach(b=>{
    let s=0;
    if(b.price) s += Math.min(b.price/50000, 60);
    if(b.len)   s += b.len;
    s += (b.imgs?b.imgs.length:0)*0.6;
    const y=parseInt(b.year); if(y) s += Math.max(0,(y-1990))*0.4;
    b._feat = s;
  });

  /* ---------- Header + mobile nav ---------- */
  const header = document.querySelector('.site-header');
  const nav = document.getElementById('mainnav');
  const toggle = document.getElementById('navToggle');
  addEventListener('scroll',()=>header.classList.toggle('solid', scrollY>40));
  toggle.addEventListener('click',()=>{nav.classList.toggle('open');toggle.classList.toggle('x');});
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.classList.remove('x');}));

  /* ---------- Hero + about images ---------- */
  const withImg = BOATS.filter(b=>img0(b)).sort((a,b)=>b._feat-a._feat);
  if(withImg[0]) document.getElementById('heroBg').style.backgroundImage=`url("${img0(withImg[0])}")`;
  if(withImg[3]) document.getElementById('aboutImg').style.backgroundImage=`url("${img0(withImg[3])}")`;
  document.getElementById('statBoats').textContent = BOATS.length;

  /* ---------- Stato filtri ---------- */
  const state = {type:'', price:'', len:'', sort:'feat', shown:PAGE};
  const grid = document.getElementById('grid');
  const countEl = document.getElementById('count');
  const loadMore = document.getElementById('loadMore');

  function inRange(v,spec){ if(!spec) return true; if(v==null) return false;
    const [a,b]=spec.split('-').map(Number); return v>=a && v<b; }

  function filtered(){
    let list = BOATS.filter(b =>
      (!state.type || b.type===state.type) &&
      inRange(b.price, state.price) &&
      inRange(b.len, state.len));
    const y=b=>parseInt(b.year)||0;
    const sorters={
      feat:(a,b)=>b._feat-a._feat,
      'price-desc':(a,b)=>(b.price||0)-(a.price||0),
      'price-asc':(a,b)=>(a.price||1e12)-(b.price||1e12),
      'len-desc':(a,b)=>(b.len||0)-(a.len||0),
      'year-desc':(a,b)=>y(b)-y(a),
    };
    return list.sort(sorters[state.sort]);
  }

  function cardHTML(b){
    const meta=[b.year, fmtLen(b.len)].filter(Boolean).join(' &nbsp;·&nbsp; ');
    const price = fmtPrice(b.price) || L('price_request');
    const priceCls = b.price ? '' : ' style="font-size:1.05rem"';
    return `<article class="card" data-id="${b.id}">
      <div class="card-img">
        ${img0(b)?`<img loading="lazy" src="${img0(b)}" alt="${b.builder} ${b.model}">`:''}
        <span class="card-type">${L('type_'+b.type)}</span>
      </div>
      <div class="card-body">
        <span class="card-builder">${b.builder}</span>
        <span class="card-model">${b.model}</span>
        <span class="card-meta">${meta}</span>
        <span class="card-price"${priceCls}>${price}</span>
      </div>
    </article>`;
  }

  function render(){
    const list = filtered();
    countEl.textContent = list.length;
    grid.innerHTML = list.slice(0,state.shown).map(cardHTML).join('');
    loadMore.hidden = state.shown >= list.length;
    grid.querySelectorAll('.card').forEach(c=>
      c.addEventListener('click',()=>location.hash='/barca/'+c.dataset.id));
  }
  window.__render = render;

  /* ---------- Eventi filtri ---------- */
  document.getElementById('typeChips').addEventListener('click',e=>{
    const b=e.target.closest('.chip'); if(!b) return;
    document.querySelectorAll('.chip').forEach(c=>c.classList.remove('is-active'));
    b.classList.add('is-active'); state.type=b.dataset.type; state.shown=PAGE; render();
  });
  const bind=(id,key)=>document.getElementById(id).addEventListener('change',e=>{
    state[key]=e.target.value; state.shown=PAGE; render();});
  bind('fPrice','price'); bind('fLen','len'); bind('fSort','sort');
  loadMore.addEventListener('click',()=>{state.shown+=PAGE;render();});

  /* ---------- Dettaglio barca ---------- */
  const detail=document.getElementById('detail');
  const panel=document.getElementById('detailPanel');

  function openDetail(b){
    const gallery=(b.imgs&&b.imgs.length)?b.imgs:[img0(b)].filter(Boolean);
    const specs=SPEC_ORDER.filter(k=>b.specs&&b.specs[k])
      .map(k=>`<div><span class="sk">${L('spec_'+k)}</span><span class="sv">${b.specs[k]}</span></div>`).join('');
    const price=fmtPrice(b.price)||L('price_request');
    const subj=encodeURIComponent(`${b.builder} ${b.model} (${b.year})`);
    panel.innerHTML=`
      <div class="dt-close"><span class="dt-crumb">${L('type_'+b.type)}</span>
        <button aria-label="×" onclick="location.hash=''">✕</button></div>
      <div class="dt-hero" id="dtHero" style="background-image:url('${gallery[0]||''}')"></div>
      ${gallery.length>1?`<div class="dt-thumbs" id="dtThumbs">${
        gallery.map((u,i)=>`<img src="${u}" data-i="${i}" class="${i===0?'sel':''}" alt="">`).join('')}</div>`:''}
      <div class="dt-body">
        <span class="dt-builder">${b.builder}</span>
        <h3 class="dt-title">${b.model}</h3>
        <div class="dt-year">${L('detail_year')} ${b.year} · ${L('type_'+b.type)}</div>
        <div class="dt-price">${price}</div>
        ${specs?`<div class="dt-specs">${specs}</div>`:''}
        ${b.desc?`<div class="dt-desc"><h4>${L('detail_note')}</h4><p>${b.desc}</p></div>`:''}
      </div>
      <div class="dt-cta">
        <a class="call" href="tel:+390586621381">${L('detail_call')}</a>
        <a class="mail" href="mailto:navigare@navigare.it?subject=${subj}">${L('detail_info')}</a>
      </div>`;
    const hero=document.getElementById('dtHero'), thumbs=document.getElementById('dtThumbs');
    if(thumbs) thumbs.addEventListener('click',e=>{
      const t=e.target.closest('img'); if(!t)return;
      hero.style.backgroundImage=`url('${gallery[t.dataset.i]}')`;
      thumbs.querySelectorAll('img').forEach(x=>x.classList.remove('sel')); t.classList.add('sel');
    });
    detail.classList.add('open'); detail.setAttribute('aria-hidden','false');
    document.body.classList.add('no-scroll'); panel.scrollTop=0;
  }
  function closeDetail(){
    detail.classList.remove('open'); detail.setAttribute('aria-hidden','true');
    document.body.classList.remove('no-scroll');
  }
  detail.addEventListener('click',e=>{if(e.target===detail) location.hash='';});

  function route(){
    const m=location.hash.match(/^#\/barca\/([\w-]+)/);
    if(m){ const b=BOATS.find(x=>x.id===m[1]); if(b){openDetail(b);return;} }
    closeDetail();
  }
  window.__route = route;
  addEventListener('hashchange',route);

  /* ---------- Lingue ---------- */
  function applyLang(lg){
    if(!I18N[lg]) lg='it';
    window.__lang = lg;
    document.documentElement.lang = lg;
    const d = I18N[lg];
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const k=el.dataset.i18n; if(d[k]!=null) el.textContent=d[k];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el=>{
      const k=el.dataset.i18nHtml; if(d[k]!=null) el.innerHTML=d[k];
    });
    document.querySelectorAll('.flag').forEach(f=>f.classList.toggle('is-active', f.dataset.lang===lg));
    try{ localStorage.setItem('nav_lang', lg); }catch(e){}
    render();
    if(location.hash.startsWith('#/barca/')) route();
  }
  document.getElementById('langbar').addEventListener('click',e=>{
    const f=e.target.closest('.flag'); if(f) applyLang(f.dataset.lang);
  });

  /* ---------- Start ---------- */
  let init='it';
  try{ const s=localStorage.getItem('nav_lang'); if(s&&I18N[s]) init=s;
       else { const n=(navigator.language||'it').slice(0,2); if(I18N[n]) init=n; } }catch(e){}
  applyLang(init);
  route();
})();

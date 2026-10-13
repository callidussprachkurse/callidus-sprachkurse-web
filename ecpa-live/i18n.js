/* ECP-Arts — Sprachumschalter.
   Die Seiten sind auf Englisch geschrieben; Uebersetzungen liegen als Woerterbuch
   in i18n/<code>.json und werden im Browser eingesetzt. Kein fremder Dienst:
   keine Web-Schrift von aussen, kein Uebersetzungsdienst, nichts verlaesst den Rechner. */
(() => {
  const SPRACHEN = [
    ['en', 'English'], ['de', 'Deutsch'], ['it', 'Italiano'], ['es', 'Español'],
    ['pt', 'Português'], ['ru', 'Русский'], ['zh', '中文'], ['ja', '日本語'], ['ar', 'العربية']
  ];
  const RTL = new Set(['ar']);
  /* Die Hausschriften (Cormorant, Inter) haben keine arabischen oder ostasiatischen
     Zeichen. Fuer diese Sprachen tauschen wir die beiden Schrift-Variablen aus,
     damit wirklich jede Ueberschrift und jeder Absatz umgestellt wird. */
  const SCHRIFT = {
    zh: ['"Songti SC","Noto Serif SC","Source Han Serif SC",serif',
         '"PingFang SC","Noto Sans SC","Microsoft YaHei",sans-serif'],
    ja: ['"Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif',
         '"Hiragino Sans","Yu Gothic","Noto Sans JP",sans-serif'],
    ar: ['"Geeza Pro","Noto Naskh Arabic","Traditional Arabic","Times New Roman",serif',
         '"Geeza Pro","Noto Kufi Arabic","Noto Sans Arabic",Tahoma,sans-serif']
  };
  const AUSWAHL = 'h1,h2,h3,h4,p,li,button,option,label,title,figcaption,div,a,span';
  const norm = (s) => s.replace(/\s+/g, ' ').trim();

  const stil = document.createElement('style');
  stil.textContent = `
  .sprache{position:relative;margin-left:clamp(14px,2vw,26px);flex:none}
  .sprache>button{background:none;border:0;cursor:pointer;color:inherit;opacity:.7;
    width:34px;height:34px;display:flex;align-items:center;justify-content:center;
    transition:opacity .3s}
  .sprache>button:hover,.sprache.auf>button{opacity:1}
  .sprache svg{width:17px;height:17px;display:block}
  .sprache ul{position:absolute;top:calc(100% + 12px);right:0;list-style:none;margin:0;padding:6px 0;
    background:rgba(12,11,10,.96);backdrop-filter:blur(14px);border:1px solid rgba(176,141,87,.28);
    min-width:158px;opacity:0;visibility:hidden;transform:translateY(-6px);
    transition:opacity .28s,transform .28s,visibility .28s;z-index:80}
  .sprache.auf ul{opacity:1;visibility:visible;transform:none}
  .sprache li{margin:0}
  .sprache li button{display:block;width:100%;text-align:left;background:none;border:0;cursor:pointer;
    padding:9px 18px;font-family:inherit;font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;
    color:var(--cream);opacity:.72;transition:opacity .25s,background .25s}
  .sprache li button:hover{opacity:1;background:rgba(176,141,87,.12)}
  .sprache li button[aria-current="true"]{opacity:1;color:var(--brass-hi)}
  html[dir="rtl"] .sprache ul{right:auto;left:0;text-align:right}
  html[dir="rtl"] .sprache li button{text-align:right}
  html[dir="rtl"] body{text-align:right}
  html[dir="rtl"] .duo .side,html[dir="rtl"] .wochen .r{text-align:right}
  @media(max-width:1400px){.sprache{order:2;margin-left:auto;margin-right:2px}
    nav .navtoggle{order:3}}
  `;
  document.head.appendChild(stil);

  const nav = document.getElementById('nav');
  const schalter = document.createElement('div');
  schalter.className = 'sprache';
  schalter.innerHTML =
    `<button type="button" aria-haspopup="true" aria-expanded="false" aria-label="Language">
       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
         <circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.9 2.6 15.1 0 18M12 3c-2.6 2.9-2.6 15.1 0 18"/>
       </svg></button>
     <ul>${SPRACHEN.map(([c, n]) =>
        `<li><button type="button" data-l="${c}">${n}</button></li>`).join('')}</ul>`;
  nav?.appendChild(schalter);          // ganz rechts aussen

  const knopf = schalter.querySelector('button');
  knopf.addEventListener('click', (e) => {
    e.stopPropagation();
    const auf = schalter.classList.toggle('auf');
    knopf.setAttribute('aria-expanded', auf);
  });
  document.addEventListener('click', () => {
    schalter.classList.remove('auf'); knopf.setAttribute('aria-expanded', 'false');
  });

  let original = null;                       // englische Fassung sichern
  let aktuell = new Map();                   // aktuell gueltiges Woerterbuch
  const sichern = () => {
    if (original) return;
    original = new Map();
    document.querySelectorAll(AUSWAHL).forEach(el => original.set(el, el.innerHTML));
  };

  const setzen = (code, buch) => {
    sichern();
    document.documentElement.lang = code;
    document.documentElement.dir = RTL.has(code) ? 'rtl' : 'ltr';
    const w = document.documentElement.style;
    if (SCHRIFT[code]) { w.setProperty('--serif', SCHRIFT[code][0]);
                         w.setProperty('--sans', SCHRIFT[code][1]); }
    else { w.removeProperty('--serif'); w.removeProperty('--sans'); }
    const karte = new Map();
    if (buch) {
      const t = document.createElement('div');
      for (const [q, z] of Object.entries(buch)) {
        if (q.startsWith('_')) continue;
        t.innerHTML = q;
        karte.set(norm(t.innerHTML), z);
      }
    }
    for (const [el, roh] of original) {
      if (!el.isConnected) continue;
      const neu = karte.get(norm(roh));
      if (neu !== undefined) { if (norm(el.innerHTML) !== norm(neu)) el.innerHTML = neu; }
      else if (norm(el.innerHTML) !== norm(roh) && !el.querySelector(AUSWAHL)) el.innerHTML = roh;
    }
    /* Zweite Runde: Text-Knoten, die im ersten Durchgang neu entstanden sind
       (z. B. weil ein Container zurueckgesetzt wurde und seine schon uebersetzten
       Kinder ersetzt hat), werden anhand ihres aktuellen (englischen) Textes
       direkt nachgezogen. Nur Blatt-Elemente, damit Container unberuehrt bleiben. */
    if (karte.size) {
      document.querySelectorAll(AUSWAHL).forEach(el => {
        if (el.querySelector(AUSWAHL)) return;
        const neu = karte.get(norm(el.innerHTML));
        if (neu !== undefined && norm(el.innerHTML) !== norm(neu)) el.innerHTML = neu;
      });
    }
    aktuell = karte;
    schalter.querySelectorAll('li button').forEach(b =>
      b.setAttribute('aria-current', b.dataset.l === code));
    try { localStorage.setItem('ecpa-lang', code); } catch (e) {}
  };

  const laden = async (code) => {
    if (code === 'en') return setzen('en', null);
    try {
      const buch = await (await fetch(`i18n/${code}.json`, {cache: 'no-cache'})).json();
      setzen(code, buch);
    } catch (e) { setzen('en', null); }
  };

  schalter.querySelectorAll('li button').forEach(b =>
    b.addEventListener('click', (e) => { e.stopPropagation();
      schalter.classList.remove('auf'); laden(b.dataset.l); }));

  /* Englisch ist immer die Ausgangssprache. Die Browsersprache wird bewusst NICHT
     ausgewertet: der Besucher soll selbst umschalten. Nur eine zuvor angeklickte
     Sprache wird beim naechsten Besuch wieder aufgenommen. */
  /* Inhalte, die erst spaeter aus einer JSON-Datei kommen (Programm-Uebersicht),
     melden sich hiermit nach und werden in der laufenden Sprache gesetzt. */
  /* Uebersetzt eine einzelne Zeichenkette (z. B. eine Formular-Meldung, die erst
     beim Absenden entsteht) in die gerade gewaehlte Sprache. Ohne Treffer bleibt
     der englische Text. */
  window.ecpaT = (s) => { const v = aktuell.get(norm(s)); return v === undefined ? s : v; };

  window.ecpaNachtragen = (wurzel) => {
    if (!wurzel) return;
    sichern();
    wurzel.querySelectorAll(AUSWAHL).forEach(el => {
      if (!original.has(el)) original.set(el, el.innerHTML);
      const roh = original.get(el);
      const neu = aktuell.get(norm(roh));
      if (neu !== undefined && norm(el.innerHTML) !== norm(neu)) el.innerHTML = neu;
    });
  };

  let start = null;
  try { start = localStorage.getItem('ecpa-lang'); } catch (e) {}
  if (start && start !== 'en') laden(start); else setzen('en', null);
})();

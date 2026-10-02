/* ECP-Arts — Hinweis zu Cookies und lokaler Speicherung.
   Die Seite setzt KEINE Werbe- oder Statistik-Cookies, bindet keine fremden
   Dienste ein und misst nichts. Gespeichert wird im Browser nur, was der
   Besucher selbst auswaehlt: seine Sprache. Nach Art. 5 Abs. 3 ePrivacy /
   § 25 TDDDG ist das eine unbedingt erforderliche Speicherung, fuer die keine
   Einwilligung noetig ist. Deshalb ein kurzer HINWEIS statt eines
   Zustimmungsdialogs mit Knöpfen, die nichts zu entscheiden haben. */
(() => {
  const SCHLUESSEL = 'ecpa-hinweis';
  try { if (localStorage.getItem(SCHLUESSEL)) return; } catch (e) {}

  const TEXTE = {
    en: ['This site sets no tracking or advertising cookies and loads nothing from third parties. Your chosen language is remembered in your browser — nothing else.',
         'Privacy notice', 'Understood'],
    de: ['Diese Seite setzt keine Werbe- oder Statistik-Cookies und lädt nichts von Dritten. Im Browser gemerkt wird allein Ihre gewählte Sprache — sonst nichts.',
         'Datenschutzerklärung', 'Verstanden'],
    it: ['Questo sito non usa cookie pubblicitari o statistici e non carica nulla da terzi. Nel browser resta solo la lingua che avete scelto — niente altro.',
         'Informativa sulla privacy', 'Ho capito'],
    es: ['Este sitio no usa cookies publicitarias ni de análisis y no carga nada de terceros. En su navegador solo se recuerda el idioma que ha elegido — nada más.',
         'Aviso de privacidad', 'Entendido'],
    pt: ['Este sítio não usa cookies de publicidade nem de estatística e não carrega nada de terceiros. No seu navegador fica apenas o idioma escolhido — mais nada.',
         'Política de privacidade', 'Compreendido'],
    ru: ['Этот сайт не использует рекламные и аналитические файлы cookie и ничего не загружает со сторонних сервисов. В браузере сохраняется только выбранный вами язык — и больше ничего.',
         'Политика конфиденциальности', 'Понятно'],
    zh: ['本站不使用广告或统计 Cookie，也不加载任何第三方内容。浏览器中仅保存您所选择的语言，别无其他。',
         '隐私声明', '明白了'],
    ja: ['このサイトは広告・統計用のクッキーを使わず、外部サービスも読み込みません。ブラウザに残るのは、お選びいただいた言語だけです。',
         'プライバシーに関する説明', '了解しました'],
    ar: ['لا يستخدم هذا الموقع ملفات تعريف ارتباط للإعلان أو الإحصاء، ولا يحمّل أي شيء من جهات خارجية. يُحفظ في متصفحك اللغة التي اخترتها فقط، لا غير.',
         'إشعار الخصوصية', 'مفهوم']
  };

  const stil = document.createElement('style');
  stil.textContent = `
  .ckhinweis{position:fixed;left:0;right:0;bottom:0;z-index:150;
    background:rgba(12,11,10,.94);backdrop-filter:blur(12px);
    border-top:1px solid rgba(176,141,87,.3);
    padding:18px clamp(20px,5vw,56px);
    display:flex;align-items:center;gap:clamp(16px,3vw,40px);flex-wrap:wrap;
    transform:translateY(110%);transition:transform .6s cubic-bezier(.16,1,.3,1)}
  .ckhinweis.da{transform:none}
  .ckhinweis p{margin:0;flex:1 1 380px;font-family:var(--sans,sans-serif);
    font-size:.82rem;line-height:1.65;color:rgba(239,233,221,.72)}
  .ckhinweis a{color:var(--brass-hi,#D9BC86);text-decoration:none;
    border-bottom:1px solid rgba(217,188,134,.4)}
  .ckhinweis button{flex:none;background:none;cursor:pointer;
    border:1px solid rgba(176,141,87,.5);color:var(--cream,#EFE9DD);
    padding:12px 30px;font-family:var(--sans,sans-serif);font-size:10.5px;
    letter-spacing:.28em;text-transform:uppercase;border-radius:0;
    transition:background .4s,color .4s,border-color .4s}
  .ckhinweis button:hover{background:var(--brass,#B08D57);border-color:var(--brass,#B08D57);color:#120E07}
  @media(prefers-reduced-motion:reduce){.ckhinweis{transition:none}}
  `;
  document.head.appendChild(stil);

  const sprache = () => {
    let l = null;
    try { l = localStorage.getItem('ecpa-lang'); } catch (e) {}
    return TEXTE[l] ? l : 'en';
  };
  const [text, linkwort, knopfwort] = TEXTE[sprache()];
  const wohin = location.pathname.replace(/[^/]*$/, '') + 'privacy.html';

  const leiste = document.createElement('div');
  leiste.className = 'ckhinweis';
  leiste.setAttribute('role', 'note');
  leiste.innerHTML = `<p>${text} <a href="${wohin}">${linkwort}</a></p>
                      <button type="button">${knopfwort}</button>`;
  document.body.appendChild(leiste);
  requestAnimationFrame(() => setTimeout(() => leiste.classList.add('da'), 900));

  leiste.querySelector('button').addEventListener('click', () => {
    leiste.classList.remove('da');
    try { localStorage.setItem(SCHLUESSEL, '1'); } catch (e) {}
    setTimeout(() => leiste.remove(), 700);
  });
})();

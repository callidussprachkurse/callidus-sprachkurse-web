"""Baut zwoelf Kopfbereich-Entwuerfe fuer ECP-Arts als eigenstaendige Seiten."""
import os, html

D = os.path.expanduser("~/Library/Application Support/ceogpt-website/site/ecpa-varianten/")
os.makedirs(D, exist_ok=True)

BASIS = """
@font-face{font-family:'Cormorant Garamond';font-style:normal;font-weight:400;font-display:swap;src:url(../cormorant-garamond-400-latin.woff2) format('woff2')}
@font-face{font-family:'Cormorant Garamond';font-style:normal;font-weight:500;font-display:swap;src:url(../cormorant-garamond-500-latin.woff2) format('woff2')}
@font-face{font-family:'Cormorant Garamond';font-style:normal;font-weight:600;font-display:swap;src:url(../cormorant-garamond-600-latin.woff2) format('woff2')}
@font-face{font-family:'Cormorant Garamond';font-style:italic;font-weight:400;font-display:swap;src:url(../cormorant-garamond-i400-latin.woff2) format('woff2')}
@font-face{font-family:'Inter';font-style:normal;font-weight:300;font-display:swap;src:url(../inter-300-latin.woff2) format('woff2')}
@font-face{font-family:'Inter';font-style:normal;font-weight:400;font-display:swap;src:url(../inter-400-latin.woff2) format('woff2')}
@font-face{font-family:'Inter';font-style:normal;font-weight:500;font-display:swap;src:url(../inter-500-latin.woff2) format('woff2')}
:root{--ink:#0C0B0A;--paper:#F5F1E8;--cream:#EFE9DD;--cream-dim:rgba(239,233,221,.66);
  --brass:#B08D57;--brass-hi:#D9BC86;--muted:#5C5348;
  --serif:'Cormorant Garamond',Georgia,serif;--sans:'Inter',system-ui,sans-serif}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:var(--sans);background:var(--ink);color:var(--cream);font-weight:400;-webkit-font-smoothing:antialiased;overflow-x:hidden}
img{display:block;max-width:100%}
.hero{position:relative;height:100vh;min-height:620px;overflow:hidden;display:flex}
.wrap{position:relative;z-index:5;width:100%;max-width:1240px;margin:0 auto;padding:0 clamp(24px,5vw,64px)}
.ey{font-size:10.5px;letter-spacing:.42em;text-transform:uppercase;color:var(--brass-hi);font-weight:500}
h1{font-family:var(--serif);font-weight:400;letter-spacing:-.012em;line-height:1.0;
   font-size:clamp(2.6rem,5.6vw,5rem);text-wrap:balance}
h1 em{font-style:italic;color:var(--brass-hi)}
p.lead{max-width:44ch;color:var(--cream-dim);font-size:1.02rem;line-height:1.75;margin-top:26px}
.rule{width:110px;height:1px;background:var(--brass);margin:34px 0 0}
.acts{display:flex;gap:34px;margin-top:38px;flex-wrap:wrap;align-items:center}
.lnk{font-size:11.5px;letter-spacing:.24em;text-transform:uppercase;text-decoration:none;color:var(--cream);padding-bottom:7px;border-bottom:1px solid var(--brass)}
.lnk.ghost{color:var(--cream-dim);border-color:rgba(239,233,221,.28)}
nav{position:absolute;top:0;left:0;right:0;z-index:6;display:flex;align-items:center;justify-content:space-between;
    padding:clamp(20px,3vw,34px) clamp(24px,5vw,64px)}
.logo{position:relative;overflow:hidden;width:214px;height:44.6px;flex:none}
.logo img{position:absolute;width:234.7px;max-width:none;left:-13.6px;top:-100px}
.menu{display:flex;gap:30px;font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--cream-dim)}
.korn{position:absolute;inset:0;z-index:4;pointer-events:none;opacity:.05;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")}
.bild{position:absolute;inset:0;z-index:0;background-size:cover;background-repeat:no-repeat}
.veil{position:absolute;inset:0;z-index:1}
.marke{position:absolute;right:clamp(20px,3vw,44px);top:50%;transform:translateY(-50%) rotate(90deg);z-index:5;
  font-size:9.5px;letter-spacing:.44em;text-transform:uppercase;color:rgba(239,233,221,.38);white-space:nowrap}
.hell{background:var(--paper);color:#1A1714}
.hell .ey{color:#8C6938}
.hell p.lead{color:var(--muted)}
.hell .lnk{color:#1A1714;border-color:#8C6938}
.hell .lnk.ghost{color:var(--muted);border-color:rgba(26,23,20,.22)}
.hell h1 em{color:#8C6938}
"""

NAV = """<nav>
  <a class="logo" href="#"><img src="logo-weiss.png" alt="ECP-Arts"></a>
  <div class="menu"><span>Programme</span><span>The 2027 Edition</span><span>Who It&rsquo;s For</span><span>Apply</span></div>
</nav>"""

NAV_DUNKEL = NAV.replace('logo-weiss.png', 'logo-weiss.png')

TITEL = "You have the training.<br>We build the <em>career</em>."
LEAD = ("A one-month intensive for emerging opera singers &mdash; master&rsquo;s and post-graduate. "
        "We teach what training leaves out: how to turn it into a working career.")

def seite(nr, name, css, koerper, dunkles_logo=True):
    doc = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ECP-Arts &mdash; Entwurf {nr:02d} &middot; {html.escape(name)}</title>
<style>{BASIS}
{css}</style></head>
<body>
{koerper}
</body></html>"""
    with open(D + f"entwurf-{nr:02d}.html", "w") as f:
        f.write(doc)
    return f"entwurf-{nr:02d}.html"

V = []

# 01 — Der leere Saal, von der Buehne aus
V.append(dict(nr=1, name="Der leere Saal", css="""
.bild{background-image:url('img/saal-von-buehne.jpg');background-position:center 62%;filter:grayscale(.75) contrast(1.05) brightness(.78)}
.veil{background:linear-gradient(98deg,rgba(6,5,4,.95) 0%,rgba(7,6,5,.88) 30%,rgba(7,6,5,.55) 64%,rgba(7,6,5,.42) 100%)}
.hero{align-items:center}
""", koerper=f"""<header class="hero">
  <div class="bild"></div><div class="veil"></div><div class="korn"></div>
  {NAV}
  <div class="wrap">
    <div class="ey">ECP-Arts &middot; The 2027 Edition</div>
    <h1 style="margin-top:22px;max-width:14ch">{TITEL}</h1>
    <div class="rule"></div>
    <p class="lead">{LEAD}</p>
    <div class="acts"><a class="lnk" href="#">Apply for 2027</a><a class="lnk ghost" href="#">Discover the Programme</a></div>
  </div>
  <div class="marke">Est. 2026 &middot; Edition I</div>
</header>"""))

# 02 — Bayreuth, zentriert, Goldrahmen
V.append(dict(nr=2, name="Barocker Saal, zentriert", css="""
.bild{background-image:url('img/bayreuth.jpg');background-position:center 45%;filter:grayscale(.35) brightness(.55) contrast(1.08)}
.veil{background:radial-gradient(85% 75% at 50% 48%,rgba(6,5,4,.42),rgba(5,4,3,.93) 78%)}
.hero{align-items:center;text-align:center}
.wrap{max-width:900px}
.rahmen{position:absolute;inset:clamp(18px,2.4vw,34px);border:1px solid rgba(217,188,134,.34);z-index:3;pointer-events:none}
.rahmen::after{content:"";position:absolute;inset:7px;border:1px solid rgba(217,188,134,.16)}
h1{font-size:clamp(2.5rem,5.2vw,4.6rem)}
.rule{margin:34px auto 0}
.acts{justify-content:center}
p.lead{margin-left:auto;margin-right:auto}
""", koerper=f"""<header class="hero">
  <div class="bild"></div><div class="veil"></div><div class="rahmen"></div><div class="korn"></div>
  {NAV}
  <div class="wrap">
    <div class="ey">Est. 2026 &middot; Edition I</div>
    <h1 style="margin-top:26px">{TITEL}</h1>
    <div class="rule"></div>
    <p class="lead">{LEAD}</p>
    <div class="acts"><a class="lnk" href="#">Apply for 2027</a><a class="lnk ghost" href="#">Discover the Programme</a></div>
  </div>
</header>"""))

# 03 — Diptychon: Schrift links auf Buetten, Logen rechts
V.append(dict(nr=3, name="Diptychon, Papier und Haus", css="""
.hero{display:grid;grid-template-columns:1fr 1fr;align-items:stretch}
.links{background:var(--paper);color:#1A1714;display:flex;align-items:center;padding:clamp(40px,6vw,96px);position:relative;z-index:5}
.links .ey{color:#8C6938}
.links p.lead{color:var(--muted)}
.links .lnk{color:#1A1714;border-color:#8C6938}
.links .lnk.ghost{color:var(--muted);border-color:rgba(26,23,20,.22)}
.links h1 em{color:#8C6938}
.rechts{position:relative;background:url('img/logen.jpg') center 40%/cover no-repeat;filter:grayscale(.3) brightness(.8)}
.rechts::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(245,241,232,.22),transparent 26%)}
nav{color:#1A1714}
nav .menu{color:rgba(26,23,20,.6)}
.logo{filter:invert(1) brightness(.3)}
h1{font-size:clamp(2.4rem,4.2vw,3.9rem)}
@media(max-width:900px){.hero{grid-template-columns:1fr}.rechts{display:none}}
""", koerper=f"""<header class="hero">
  {NAV}
  <div class="links"><div>
    <div class="ey">ECP-Arts &middot; The 2027 Edition</div>
    <h1 style="margin-top:22px">{TITEL}</h1>
    <div class="rule"></div>
    <p class="lead">{LEAD}</p>
    <div class="acts"><a class="lnk" href="#">Apply for 2027</a><a class="lnk ghost" href="#">Discover the Programme</a></div>
  </div></div>
  <div class="rechts"></div>
</header>"""))

# 04 — Kronleuchter, Text unten links
V.append(dict(nr=4, name="Kronleuchter", css="""
.bild{background-image:url('img/kronleuchter.jpg');background-position:62% 34%;filter:grayscale(.2) brightness(.62) contrast(1.06)}
.veil{background:linear-gradient(180deg,rgba(6,5,4,.55) 0%,rgba(6,5,4,.15) 34%,rgba(5,4,3,.92) 88%)}
.hero{align-items:flex-end}
.wrap{padding-bottom:clamp(56px,9vh,110px)}
h1{font-size:clamp(2.4rem,5vw,4.4rem)}
""", koerper=f"""<header class="hero">
  <div class="bild"></div><div class="veil"></div><div class="korn"></div>
  {NAV}
  <div class="wrap">
    <div class="ey">ECP-Arts &middot; The 2027 Edition</div>
    <h1 style="margin-top:20px;max-width:15ch">{TITEL}</h1>
    <div class="rule"></div>
    <p class="lead">{LEAD}</p>
    <div class="acts"><a class="lnk" href="#">Apply for 2027</a><a class="lnk ghost" href="#">Discover the Programme</a></div>
  </div>
</header>"""))

# 05 — Partitur, rein typografisch
V.append(dict(nr=5, name="Partitur, rein typografisch", css="""
.bild{background:radial-gradient(120% 85% at 18% 42%,#241d14 0%,#100D0A 46%,#070605 100%)}
.note{position:absolute;inset:-30%;z-index:1;background:url('img/partitur.jpg') 52% 34%/auto 128% no-repeat;
  transform:rotate(-8.5deg) scale(1.06);transform-origin:70% 45%;opacity:.13;mix-blend-mode:screen;
  -webkit-mask-image:radial-gradient(56% 80% at 86% 42%,#000 2%,rgba(0,0,0,.34) 44%,transparent 76%);
  mask-image:radial-gradient(56% 80% at 86% 42%,#000 2%,rgba(0,0,0,.34) 44%,transparent 76%)}
.hero{align-items:center}
""", koerper=f"""<header class="hero">
  <div class="bild"></div><div class="note"></div><div class="korn"></div>
  {NAV}
  <div class="wrap">
    <div class="ey">ECP-Arts &middot; The 2027 Edition</div>
    <h1 style="margin-top:22px;max-width:13ch">{TITEL}</h1>
    <div class="rule"></div>
    <p class="lead">{LEAD}</p>
    <div class="acts"><a class="lnk" href="#">Apply for 2027</a><a class="lnk ghost" href="#">Discover the Programme</a></div>
  </div>
  <div class="marke">Est. 2026 &middot; Edition I</div>
</header>"""))

# 06 — Titelseite eines Programmhefts
V.append(dict(nr=6, name="Titelseite", css="""
.hero{align-items:center;text-align:center;background:var(--paper);color:#1A1714}
.hero::before{content:"";position:absolute;inset:0;z-index:0;opacity:.055;
  background:url('img/partitur.jpg') center/cover no-repeat}
.wrap{max-width:820px}
.ey{color:#8C6938}
h1{font-size:clamp(2.3rem,4.6vw,4rem);line-height:1.06}
h1 em{color:#8C6938}
p.lead{color:var(--muted);margin-left:auto;margin-right:auto;max-width:52ch}
.orn{display:flex;align-items:center;justify-content:center;gap:16px;margin:30px 0}
.orn i{display:block;width:96px;height:1px;background:rgba(140,105,56,.5)}
.orn b{font-family:var(--serif);font-style:italic;font-weight:400;color:#8C6938;font-size:1.1rem}
.acts{justify-content:center}
.lnk{color:#1A1714;border-color:#8C6938}
.lnk.ghost{color:var(--muted);border-color:rgba(26,23,20,.22)}
.logo{filter:invert(1) brightness(.35)}
nav .menu{color:rgba(26,23,20,.6)}
.kolumne{position:absolute;bottom:34px;left:0;right:0;text-align:center;font-size:9.5px;letter-spacing:.4em;
  text-transform:uppercase;color:rgba(26,23,20,.42);z-index:5}
""", koerper=f"""<header class="hero">
  {NAV}
  <div class="wrap">
    <div class="ey">European Centre of Performing Arts</div>
    <div class="orn"><i></i><b>MMXXVII</b><i></i></div>
    <h1>{TITEL}</h1>
    <p class="lead">{LEAD}</p>
    <div class="acts" style="margin-top:34px"><a class="lnk" href="#">Apply for 2027</a><a class="lnk ghost" href="#">Discover the Programme</a></div>
  </div>
  <div class="kolumne">Edition I &middot; Germany &amp; Southern Europe &middot; September 2027</div>
</header>"""))

# 07 — Proszenium: goldener Doppelrahmen, tiefdunkles Haus
V.append(dict(nr=7, name="Proszenium", css="""
.bild{background-image:url('img/colon.jpg');background-position:center 30%;filter:grayscale(.55) brightness(.42) contrast(1.1)}
.veil{background:radial-gradient(70% 60% at 50% 52%,rgba(6,5,4,.30),rgba(4,3,3,.96) 80%)}
.hero{align-items:center;text-align:center}
.wrap{max-width:860px}
.prosz{position:absolute;inset:clamp(26px,3.4vw,52px);z-index:3;pointer-events:none;
  border:1px solid rgba(217,188,134,.5);box-shadow:0 0 0 1px rgba(217,188,134,.12) inset}
.prosz span{position:absolute;width:12px;height:12px;border:1px solid rgba(217,188,134,.6)}
.prosz span:nth-child(1){left:-6px;top:-6px}.prosz span:nth-child(2){right:-6px;top:-6px}
.prosz span:nth-child(3){left:-6px;bottom:-6px}.prosz span:nth-child(4){right:-6px;bottom:-6px}
.rule{margin:32px auto 0}.acts{justify-content:center}p.lead{margin-left:auto;margin-right:auto}
""", koerper=f"""<header class="hero">
  <div class="bild"></div><div class="veil"></div>
  <div class="prosz"><span></span><span></span><span></span><span></span></div><div class="korn"></div>
  {NAV}
  <div class="wrap">
    <div class="ey">ECP-Arts &middot; Edition I</div>
    <h1 style="margin-top:24px">{TITEL}</h1>
    <div class="rule"></div>
    <p class="lead">{LEAD}</p>
    <div class="acts"><a class="lnk" href="#">Apply for 2027</a><a class="lnk ghost" href="#">Discover the Programme</a></div>
  </div>
</header>"""))

# 08 — Zweiton, Text rechtsbuendig
V.append(dict(nr=8, name="Zweiton, rechtsbündig", css="""
.bild{background-image:url('img/wien.jpg');background-position:38% 42%;filter:contrast(1.08)}
.veil{background:linear-gradient(258deg,rgba(8,10,18,.94) 0%,rgba(8,10,18,.82) 34%,rgba(10,12,20,.45) 70%,rgba(10,12,20,.3) 100%),
                 linear-gradient(0deg,rgba(24,20,14,.55),rgba(24,20,14,.55))}
.hero{align-items:center;justify-content:flex-end;text-align:right}
.wrap{display:flex;justify-content:flex-end}
.inner{max-width:640px}
.rule{margin-left:auto}
.acts{justify-content:flex-end}
p.lead{margin-left:auto}
""", koerper=f"""<header class="hero">
  <div class="bild"></div><div class="veil"></div><div class="korn"></div>
  {NAV}
  <div class="wrap"><div class="inner">
    <div class="ey">ECP-Arts &middot; The 2027 Edition</div>
    <h1 style="margin-top:22px">{TITEL}</h1>
    <div class="rule"></div>
    <p class="lead">{LEAD}</p>
    <div class="acts"><a class="lnk" href="#">Apply for 2027</a><a class="lnk ghost" href="#">Discover the Programme</a></div>
  </div></div>
</header>"""))

# 09 — Lichtkegel, extrem reduziert
V.append(dict(nr=9, name="Lichtkegel", css="""
.bild{background:#070605}
.kegel{position:absolute;inset:0;z-index:1;
  background:radial-gradient(42% 58% at 50% 8%,rgba(226,206,168,.20),transparent 62%),
             conic-gradient(from 168deg at 50% -8%,transparent 0deg,rgba(226,206,168,.10) 12deg,transparent 26deg),
             radial-gradient(60% 40% at 50% 96%,rgba(226,206,168,.07),transparent 70%)}
.hero{align-items:center;text-align:center}
.wrap{max-width:860px}
h1{font-size:clamp(2.6rem,5.4vw,4.8rem)}
.rule{margin:34px auto 0}.acts{justify-content:center}p.lead{margin-left:auto;margin-right:auto}
""", koerper=f"""<header class="hero">
  <div class="bild"></div><div class="kegel"></div><div class="korn"></div>
  {NAV}
  <div class="wrap">
    <div class="ey">ECP-Arts &middot; Edition I</div>
    <h1 style="margin-top:26px">{TITEL}</h1>
    <div class="rule"></div>
    <p class="lead">{LEAD}</p>
    <div class="acts"><a class="lnk" href="#">Apply for 2027</a><a class="lnk ghost" href="#">Discover the Programme</a></div>
  </div>
</header>"""))

# 10 — Kupferstich auf Buetten
V.append(dict(nr=10, name="Kupferstich", css="""
.hero{align-items:center;background:var(--paper);color:#1A1714}
.bild{background-image:url('img/stich.jpg');background-position:center 46%;opacity:.5;filter:sepia(.25) contrast(1.02)}
.veil{background:linear-gradient(96deg,rgba(245,241,232,.97) 0%,rgba(245,241,232,.9) 34%,rgba(245,241,232,.55) 68%,rgba(245,241,232,.42) 100%)}
.ey{color:#8C6938}
h1{color:#14110E}
h1 em{color:#8C6938}
p.lead{color:#4E463B}
.rule{background:#8C6938}
.lnk{color:#1A1714;border-color:#8C6938}
.lnk.ghost{color:#6B6155;border-color:rgba(26,23,20,.24)}
.logo{filter:invert(1) brightness(.3)}
nav .menu{color:rgba(26,23,20,.62)}
.quelle{position:absolute;right:clamp(24px,5vw,64px);bottom:26px;z-index:5;font-size:9px;letter-spacing:.24em;
  text-transform:uppercase;color:rgba(26,23,20,.4)}
""", koerper=f"""<header class="hero">
  <div class="bild"></div><div class="veil"></div><div class="korn" style="opacity:.04"></div>
  {NAV}
  <div class="wrap">
    <div class="ey">ECP-Arts &middot; The 2027 Edition</div>
    <h1 style="margin-top:22px;max-width:14ch">{TITEL}</h1>
    <div class="rule"></div>
    <p class="lead">{LEAD}</p>
    <div class="acts"><a class="lnk" href="#">Apply for 2027</a><a class="lnk ghost" href="#">Discover the Programme</a></div>
  </div>
  <div class="quelle">Berlin, Opernhaus 1844</div>
</header>"""))

# 11 — Samt: fast schwarz, sehr leise
V.append(dict(nr=11, name="Samt", css="""
.bild{background-image:url('img/samt.jpg');background-position:center 40%;filter:brightness(.5) contrast(1.15)}
.veil{background:linear-gradient(180deg,rgba(6,5,5,.8),rgba(6,5,5,.55) 44%,rgba(6,5,5,.92))}
.hero{align-items:center}
.wrap{max-width:1000px}
h1{font-size:clamp(2.4rem,5vw,4.4rem);max-width:13ch}
""", koerper=f"""<header class="hero">
  <div class="bild"></div><div class="veil"></div><div class="korn"></div>
  {NAV}
  <div class="wrap">
    <div class="ey">ECP-Arts &middot; The 2027 Edition</div>
    <h1 style="margin-top:22px">{TITEL}</h1>
    <div class="rule"></div>
    <p class="lead">{LEAD}</p>
    <div class="acts"><a class="lnk" href="#">Apply for 2027</a><a class="lnk ghost" href="#">Discover the Programme</a></div>
  </div>
  <div class="marke">Est. 2026 &middot; Edition I</div>
</header>"""))

# 12 — Bildstreifen: drei Haeuser nebeneinander, Schrift darunter
V.append(dict(nr=12, name="Bildstreifen", css="""
.hero{flex-direction:column;justify-content:center;gap:0;background:#080706}
.streifen{position:relative;z-index:2;display:grid;grid-template-columns:repeat(3,1fr);gap:1px;height:46vh;min-height:280px;background:rgba(217,188,134,.22)}
.streifen div{background-size:cover;background-position:center;filter:grayscale(.55) brightness(.72) contrast(1.06)}
.s1{background-image:url('img/bayreuth.jpg')}
.s2{background-image:url('img/saal-von-buehne.jpg')}
.s3{background-image:url('img/logen.jpg')}
.unten{position:relative;z-index:3;padding:clamp(34px,5vh,64px) 0 0}
h1{font-size:clamp(2.1rem,4.2vw,3.6rem);max-width:17ch}
.zeile{display:flex;justify-content:space-between;align-items:flex-end;gap:40px;flex-wrap:wrap}
@media(max-width:900px){.streifen{grid-template-columns:1fr;height:30vh}.s2,.s3{display:none}}
""", koerper=f"""<header class="hero">
  {NAV}
  <div class="streifen"><div class="s1"></div><div class="s2"></div><div class="s3"></div></div>
  <div class="unten"><div class="wrap">
    <div class="zeile">
      <div>
        <div class="ey">ECP-Arts &middot; The 2027 Edition</div>
        <h1 style="margin-top:18px">{TITEL}</h1>
      </div>
      <div style="max-width:380px">
        <p class="lead" style="margin-top:0">{LEAD}</p>
        <div class="acts" style="margin-top:26px"><a class="lnk" href="#">Apply for 2027</a><a class="lnk ghost" href="#">Programme</a></div>
      </div>
    </div>
  </div></div>
  <div class="korn"></div>
</header>"""))

dateien = []
for v in V:
    dateien.append((v["nr"], v["name"], seite(v["nr"], v["name"], v["css"], v["koerper"])))

# Uebersichtsseite
li = "\n".join(
    f'<li><a href="{d}"><span class="n">{nr:02d}</span> {html.escape(name)}</a></li>' for nr, name, d in dateien)
index = f"""<!DOCTYPE html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>ECP-Arts &mdash; Kopfbereich-Entwürfe</title>
<style>{BASIS}
body{{padding:clamp(40px,7vw,90px) clamp(24px,5vw,64px);background:var(--ink)}}
h2{{font-family:var(--serif);font-weight:400;font-size:clamp(1.8rem,3.4vw,2.8rem);margin:14px 0 30px}}
ul{{list-style:none;max-width:760px;border-top:1px solid rgba(239,233,221,.16)}}
li a{{display:flex;gap:22px;align-items:baseline;padding:20px 2px;border-bottom:1px solid rgba(239,233,221,.16);
  color:var(--cream);text-decoration:none;font-size:1.15rem;font-family:var(--serif);transition:color .3s}}
li a:hover{{color:var(--brass-hi)}}
.n{{font-family:var(--sans);font-size:10.5px;letter-spacing:.3em;color:var(--brass)}}
</style></head><body>
<div class="ey">European Centre of Performing Arts</div>
<h2>Kopfbereich &mdash; zwölf Entwürfe</h2>
<ul>{li}</ul>
</body></html>"""
with open(D + "index.html", "w") as f:
    f.write(index)

print("gebaut:", len(dateien), "Entwürfe + Übersicht")
for nr, name, d in dateien:
    print(f"  {nr:02d}  {name}  ->  {d}")

/* CALLIDUS — Italienisch-Einstufungstest (eigene UI, Auswertung, Hintergrund-Versand)
   Fragen/Logik: einstufungstest-fragen.json. Versand ans Google-Formular: EST_GFORM (entry-IDs).
*/
(function () {
  "use strict";

  // === Sprach-Erkennung (DE/EN) ===
  var CALLIDUS_LANG = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0 ? 'en' : 'de';

  // === Wörterbuch (Fallback auf de) ===
  var I18N = {
    de: {
      dialogLabel: "Einstufungstest",
      headTitle: "Einstufungstest",
      close: "Schließen",
      loading: "Test wird geladen …",
      loadError: "Test konnte nicht geladen werden. Bitte später erneut versuchen.",
      introEy: "Italienisch",
      introH: "Wie gut ist Ihr Italienisch?",
      introSub: "Am Ende sehen Sie Ihr geschätztes Niveau (A1–C2) — und erhalten es zusätzlich per E-Mail.",
      startBtn: "Test starten",
      back: "Zurück",
      next: "Weiter",
      toResult: "Zum Ergebnis",
      contactEy: "Fast geschafft",
      contactH: "Wohin dürfen wir Ihr Ergebnis schicken?",
      contactSub: "Wir zeigen Ihr Niveau direkt an und senden es Ihnen zusätzlich per E-Mail. So können wir Sie bei der passenden Kurswahl unterstützen.",
      labelVorname: "Vorname",
      labelNachname: "Nachname",
      labelEmail: "E-Mail",
      emailPh: "name@beispiel.de",
      showResult: "Ergebnis anzeigen",
      required: "Bitte ausfüllen.",
      invalidEmail: "Bitte eine gültige E-Mail-Adresse angeben.",
      resultEy: "Ihr Ergebnis",
      scoreMid: " von ",
      scoreEnd: " richtig",
      mailHint1: "Eine Bestätigung mit Ihrem Ergebnis ist unterwegs an <b>",
      mailHint2: "</b>. Dies ist eine erste Einschätzung — das genaue Niveau stimmen wir gern persönlich mit Ihnen ab.",
      couponTop: "🎁 10 € Willkommens-Gutschein",
      couponSub1: "Code <b>",
      couponSub2: "</b> — einmalig einlösbar, <b>nur 15 Minuten gültig</b>. Jetzt direkt anmelden und 10 € sparen.",
      couponValid1: "Gültig noch <b id=\"est-cd-val\">",
      couponValid2: "</b>",
      couponExpiredTop: "Gutschein abgelaufen",
      couponExpiredSub: "Die 15 Minuten sind vorbei — Sie können sich natürlich weiterhin anmelden.",
      cta: "Jetzt zur Kursanmeldung",
      noAnswer: "— (keine Antwort)",
      ansLabel: "Ihre Antwort: ",
      correctMark: "  ✓ richtig",
      wrongMark: "  ✗ falsch — richtig: ",
      explLabel: "\n   Erklärung: "
    },
    en: {
      dialogLabel: "Placement test",
      headTitle: "Placement test",
      close: "Close",
      loading: "Loading test …",
      loadError: "The test could not be loaded. Please try again later.",
      introEy: "Italian",
      introH: "How good is your Italian?",
      introSub: "At the end you'll see your estimated level (A1–C2) — and we'll also send it to you by email.",
      startBtn: "Start test",
      back: "Back",
      next: "Next",
      toResult: "See result",
      contactEy: "Almost done",
      contactH: "Where should we send your result?",
      contactSub: "We'll show your level right away and also send it to you by email, so we can help you choose the right course.",
      labelVorname: "First name",
      labelNachname: "Last name",
      labelEmail: "Email",
      emailPh: "name@example.com",
      showResult: "Show result",
      required: "Please fill this in.",
      invalidEmail: "Please enter a valid email address.",
      resultEy: "Your result",
      scoreMid: " of ",
      scoreEnd: " correct",
      mailHint1: "A confirmation with your result is on its way to <b>",
      mailHint2: "</b>. This is a first estimate — we're happy to confirm your exact level with you personally.",
      couponTop: "🎁 €10 welcome voucher",
      couponSub1: "Code <b>",
      couponSub2: "</b> — single use, <b>valid for only 15 minutes</b>. Register now and save €10.",
      couponValid1: "Still valid for <b id=\"est-cd-val\">",
      couponValid2: "</b>",
      couponExpiredTop: "Voucher expired",
      couponExpiredSub: "The 15 minutes are over — you can of course still register.",
      cta: "Register for your course now",
      noAnswer: "— (no answer)",
      ansLabel: "Your answer: ",
      correctMark: "  ✓ correct",
      wrongMark: "  ✗ wrong — correct: ",
      explLabel: "\n   Explanation: "
    }
  };
  function t(k) {
    var lng = I18N[CALLIDUS_LANG] || I18N.de;
    return (k in lng) ? lng[k] : (I18N.de[k] != null ? I18N.de[k] : k);
  }
  // Erklärung/Stufenname in aktiver Sprache (Fallback auf Deutsch)
  function expl(q) { return (CALLIDUS_LANG === 'en' && q.e_en) ? q.e_en : q.e; }
  function levelName(q) { return (CALLIDUS_LANG === 'en' && q.n_en) ? q.n_en : q.n; }

  // === Datenablage Google-Formular (wird nach Anlegen befüllt) ===
  var EST_GFORM = {
    url: "https://docs.google.com/forms/d/e/1FAIpQLSePb1gA0OOClngAFSqXYtyA03K6BNa9Tb5HVU95ST34X3YI6g/formResponse",
    vorname: "entry.1104268092",
    nachname: "entry.2033069846",
    email: "entry.22038498",
    niveau: "entry.1968779195",
    punkte: "entry.867758154",
    antworten: "entry.512470190"
  };
  // Verstecktes Sprach-Feld für die spätere E-Mail-Lokalisierung
  var EST_LANG_ENTRY = "entry.PLACEHOLDER_LANG"; /* TODO: echte Entry-ID */

  var DATA = null, idx = 0, answers = [], kontakt = {}, ergebnis = null;
  var ov = null, body = null, built = false;
  var cdTimer = null;

  function fmtRest(ms) { ms = Math.max(0, ms); var s = Math.floor(ms / 1000); return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }
  function readCoupon() { try { return JSON.parse(localStorage.getItem("callidus_coupon") || "null"); } catch (e) { return null; } }
  function neuerGutschein() {
    var code = "EST10-" + Date.now().toString(36).slice(-4).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
    var g = { code: code, exp: Date.now() + 15 * 60 * 1000, used: false };
    try { localStorage.setItem("callidus_coupon", JSON.stringify(g)); } catch (e) {}
    return g;
  }
  function ermittleGutschein() {
    var s = readCoupon();
    if (s && s.used) return null;            // bereits eingelöst -> kein neuer
    if (s && s.exp > Date.now()) return s;   // noch gültig -> behalten (Timer läuft weiter)
    return neuerGutschein();                 // keiner/abgelaufen -> neuer 15-Minuten-Code
  }
  function starteCountdown(exp) {
    if (cdTimer) { clearInterval(cdTimer); cdTimer = null; }
    cdTimer = setInterval(function () {
      var span = document.getElementById("est-cd-val");
      if (!span) { clearInterval(cdTimer); cdTimer = null; return; }
      var rest = exp - Date.now();
      if (rest <= 0) {
        clearInterval(cdTimer); cdTimer = null;
        var card = span.closest(".est-coupon");
        if (card) card.innerHTML = '<div class="est-coupon-top" style="color:var(--muted)">' + t("couponExpiredTop") + '</div><div class="est-coupon-sub">' + t("couponExpiredSub") + '</div>';
        return;
      }
      span.textContent = fmtRest(rest);
    }, 1000);
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function build() {
    if (built) return;
    ov = el("div", "anm-overlay"); ov.id = "est-overlay";
    ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", t("dialogLabel"));
    var modal = el("div", "anm-modal");
    var head = el("div", "anm-head");
    head.appendChild(el("div", "t serif", t("headTitle")));
    var close = el("button", "anm-close"); close.setAttribute("aria-label", t("close")); close.innerHTML = "&times;";
    close.addEventListener("click", schliessen);
    head.appendChild(close);
    body = el("div", "anm-body"); body.id = "est-body";
    modal.appendChild(head); modal.appendChild(body);
    ov.appendChild(modal);
    ov.addEventListener("mousedown", function (e) { if (e.target === ov) schliessen(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && ov.classList.contains("open")) schliessen(); });
    document.body.appendChild(ov);
    built = true;
  }

  function oeffnen() {
    build();
    ov.classList.add("open"); document.body.style.overflow = "hidden";
    idx = 0; answers = []; kontakt = {}; ergebnis = null;
    if (!DATA) {
      body.innerHTML = '<p style="padding:20px 0;color:var(--muted)">' + t("loading") + '</p>';
      fetch("/einstufungstest-fragen.json", { cache: "no-store" }).then(function (r) { return r.json(); })
        .then(function (d) { DATA = d; answers = new Array(d.fragen.length).fill(null); renderIntro(); })
        .catch(function () { body.innerHTML = '<p style="padding:20px 0;color:#a33">' + t("loadError") + '</p>'; });
    } else {
      answers = new Array(DATA.fragen.length).fill(null); renderIntro();
    }
  }

  function schliessen() { if (cdTimer) { clearInterval(cdTimer); cdTimer = null; } if (ov) { ov.classList.remove("open"); document.body.style.overflow = ""; } }

  function fortschritt(done, total) {
    var pct = Math.round((done / total) * 100);
    return '<div class="est-prog"><div class="est-prog-bar" style="width:' + pct + '%"></div></div>'
      + '<div class="est-step">' + done + ' / ' + total + '</div>';
  }

  function renderIntro() {
    body.innerHTML = "";
    body.appendChild(el("div", "anm-ey", t("introEy")));
    body.appendChild(el("div", "anm-h serif", t("introH")));
    body.appendChild(el("p", "est-p", (CALLIDUS_LANG === 'en' && DATA.meta.hinweis_en) ? DATA.meta.hinweis_en : (DATA.meta.hinweis || "")));
    body.appendChild(el("p", "est-p", t("introSub")));
    var btn = el("button", "anm-btn est-start", t("startBtn"));
    btn.addEventListener("click", function () { idx = 0; renderFrage(); });
    var wrap = el("div", "est-actions"); wrap.appendChild(btn);
    body.appendChild(wrap);
  }

  function renderFrage() {
    var q = DATA.fragen[idx], total = DATA.fragen.length;
    body.innerHTML = "";
    body.insertAdjacentHTML("beforeend", fortschritt(idx + 1, total));
    body.appendChild(el("div", "est-frage serif", q.f.replace(/___/g, "<span class='est-luecke'>＿＿＿</span>")));
    var opts = el("div", "est-opts");
    q.o.forEach(function (text, i) {
      var b = el("button", "est-opt" + (answers[idx] === i ? " sel" : ""), text);
      b.addEventListener("click", function () {
        answers[idx] = i;
        opts.querySelectorAll(".est-opt").forEach(function (x) { x.classList.remove("sel"); });
        b.classList.add("sel");
        weiterBtn.disabled = false;
      });
      opts.appendChild(b);
    });
    body.appendChild(opts);
    var nav = el("div", "est-nav");
    var back = el("button", "est-back", t("back"));
    back.disabled = idx === 0;
    back.addEventListener("click", function () { if (idx > 0) { idx--; renderFrage(); } });
    var weiterBtn = el("button", "anm-btn est-weiter", idx === total - 1 ? t("toResult") : t("next"));
    weiterBtn.disabled = answers[idx] === null;
    weiterBtn.addEventListener("click", function () {
      if (answers[idx] === null) return;
      if (idx < total - 1) { idx++; renderFrage(); }
      else { renderKontakt(); }
    });
    nav.appendChild(back); nav.appendChild(weiterBtn);
    body.appendChild(nav);
  }

  function feld(id, label, type, ph) {
    var w = el("div", "est-field");
    w.appendChild(el("label", null, label + ' <span style="color:#b4452f">*</span>'));
    var inp = el("input"); inp.id = id; inp.type = type || "text"; if (ph) inp.placeholder = ph;
    inp.value = kontakt[id] || "";
    w.appendChild(inp);
    var err = el("div", "anm-errmsg"); err.id = id + "-err"; err.style.display = "none";
    w.appendChild(err);
    return w;
  }

  function renderKontakt() {
    body.innerHTML = "";
    body.insertAdjacentHTML("beforeend", fortschritt(DATA.fragen.length, DATA.fragen.length));
    body.appendChild(el("div", "anm-ey", t("contactEy")));
    body.appendChild(el("div", "anm-h serif", t("contactH")));
    body.appendChild(el("p", "est-p", t("contactSub")));
    var row = el("div", "est-row2");
    row.appendChild(feld("est-vorname", t("labelVorname"), "text"));
    row.appendChild(feld("est-nachname", t("labelNachname"), "text"));
    body.appendChild(row);
    body.appendChild(feld("est-email", t("labelEmail"), "email", t("emailPh")));
    var nav = el("div", "est-nav");
    var back = el("button", "est-back", t("back"));
    back.addEventListener("click", function () { idx = DATA.fragen.length - 1; renderFrage(); });
    var go = el("button", "anm-btn est-weiter", t("showResult"));
    go.addEventListener("click", absenden);
    nav.appendChild(back); nav.appendChild(go);
    body.appendChild(nav);
  }

  function setErr(id, msg) {
    var inp = document.getElementById(id), err = document.getElementById(id + "-err");
    if (inp) inp.classList.add("anm-err");
    if (err) { err.textContent = msg; err.style.display = "block"; }
  }
  function clearErr(id) {
    var inp = document.getElementById(id), err = document.getElementById(id + "-err");
    if (inp) inp.classList.remove("anm-err");
    if (err) err.style.display = "none";
  }

  function validKontakt() {
    var ok = true;
    ["est-vorname", "est-nachname", "est-email"].forEach(function (id) {
      clearErr(id);
      kontakt[id] = (document.getElementById(id).value || "").trim();
      if (!kontakt[id]) { setErr(id, t("required")); ok = false; }
    });
    if (kontakt["est-email"] && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(kontakt["est-email"])) {
      setErr("est-email", t("invalidEmail")); ok = false;
    }
    return ok;
  }

  function auswerten() {
    var sc = DATA.meta.scoring, order = sc.order, thr = sc.schwelle;
    var byLevel = {}; order.forEach(function (l) { byLevel[l] = 0; });
    var total = 0;
    DATA.fragen.forEach(function (q, i) { if (answers[i] === q.r) { byLevel[q.n]++; total++; } });
    var reached = null;
    for (var k = 0; k < order.length; k++) {
      if (byLevel[order[k]] >= thr) reached = order[k]; else break;
    }
    return { level: reached || order[0], total: total, anzahl: DATA.fragen.length, byLevel: byLevel };
  }

  function gf(form, entry, val) {
    if (!entry) return;
    var i = document.createElement("input");
    i.type = "hidden"; i.name = entry; i.value = val == null ? "" : String(val);
    form.appendChild(i);
  }

  function absenden() {
    if (!validKontakt()) return;
    ergebnis = auswerten();
    // Detail-Auswertung: Frage, Antwort, richtig/falsch, richtige Lösung + Erklärung
    var antLines = DATA.fragen.map(function (q, i) {
      var gew = answers[i] != null ? q.o[answers[i]] : t("noAnswer");
      var richtig = answers[i] === q.r;
      var z = (i + 1) + ". " + q.f.replace(/___/g, "_____") + "\n   " + t("ansLabel") + gew;
      if (richtig) { z += t("correctMark"); }
      else { var ex = expl(q); z += t("wrongMark") + q.o[q.r] + (ex ? t("explLabel") + ex : ""); }
      return z;
    }).join("\n\n");
    // Hintergrund-Versand ans Google-Formular (nur wenn konfiguriert)
    if (EST_GFORM.url) {
      try {
        var ifr = document.getElementById("est-sink");
        if (!ifr) { ifr = document.createElement("iframe"); ifr.id = "est-sink"; ifr.name = "est-sink"; ifr.style.display = "none"; document.body.appendChild(ifr); }
        var f = document.createElement("form");
        f.action = EST_GFORM.url; f.method = "POST"; f.target = "est-sink"; f.style.display = "none";
        gf(f, EST_GFORM.vorname, kontakt["est-vorname"]);
        gf(f, EST_GFORM.nachname, kontakt["est-nachname"]);
        gf(f, EST_GFORM.email, kontakt["est-email"]);
        gf(f, EST_GFORM.niveau, ergebnis.level);
        gf(f, EST_GFORM.punkte, ergebnis.total + "/" + ergebnis.anzahl);
        var _cpn = ermittleGutschein();
        var _codeLine = (_cpn && _cpn.code) ? ("CODE:" + _cpn.code + "\n") : "";
        gf(f, EST_GFORM.antworten, "LANG:" + CALLIDUS_LANG.toUpperCase() + "\n" + _codeLine + antLines);
        gf(f, EST_LANG_ENTRY, CALLIDUS_LANG.toUpperCase());
        document.body.appendChild(f); f.submit(); setTimeout(function () { f.remove(); }, 1500);
      } catch (e) { /* Ergebnis trotzdem anzeigen */ }
    }
    renderErgebnis();
  }

  function renderErgebnis() {
    var lvl = ergebnis.level;
    var niveausLoc = (CALLIDUS_LANG === 'en' && DATA.meta.niveaus_en) ? DATA.meta.niveaus_en : DATA.meta.niveaus;
    var desc = (niveausLoc && niveausLoc[lvl]) || ((DATA.meta.niveaus && DATA.meta.niveaus[lvl]) || "");
    // Niveau merken (Anmeldung nur dieses Niveau und darunter) + Willkommens-Gutschein ermitteln
    try { localStorage.setItem("callidus_est_niveau", lvl); } catch (e) {}
    var gut = ermittleGutschein();
    if (window.CALLIDUS_anmeldung && window.CALLIDUS_anmeldung.markiereNiveau) window.CALLIDUS_anmeldung.markiereNiveau();
    body.innerHTML = "";
    body.appendChild(el("div", "anm-ey", t("resultEy")));
    body.appendChild(el("div", "est-level serif", lvl));
    body.appendChild(el("p", "est-leveltxt", desc));
    body.appendChild(el("div", "est-score", ergebnis.total + t("scoreMid") + ergebnis.anzahl + t("scoreEnd")));
    var hint = el("p", "est-p", t("mailHint1") + (kontakt["est-email"] || "") + t("mailHint2"));
    body.appendChild(hint);
    if (gut) {
      var coupon = el("div", "est-coupon");
      coupon.innerHTML = '<div class="est-coupon-top">' + t("couponTop") + '</div>'
        + '<div class="est-coupon-sub">' + t("couponSub1") + gut.code + t("couponSub2") + '</div>'
        + '<div class="est-cd">' + t("couponValid1") + fmtRest(gut.exp - Date.now()) + t("couponValid2") + '</div>';
      body.appendChild(coupon);
      starteCountdown(gut.exp);
    }
    var wrap = el("div", "est-actions");
    var cta = el("button", "anm-btn est-start est-cta-shine", t("cta"));
    cta.addEventListener("click", function () {
      schliessen();
      if (window.CALLIDUS_anmeldung && window.CALLIDUS_anmeldung.oeffnen) window.CALLIDUS_anmeldung.oeffnen(lvl);
      else location.hash = "#preise";
    });
    wrap.appendChild(cta);
    var done = el("button", "est-back", t("close"));
    done.addEventListener("click", schliessen);
    wrap.appendChild(done);
    body.appendChild(wrap);
  }

  function bindeTrigger() {
    document.querySelectorAll("[data-einstufung]").forEach(function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); oeffnen(); });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindeTrigger);
  else bindeTrigger();
})();

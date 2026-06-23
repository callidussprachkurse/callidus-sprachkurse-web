/* CALLIDUS — Italienisch-Einstufungstest (eigene UI, Auswertung, Hintergrund-Versand)
   Fragen/Logik: einstufungstest-fragen.json. Versand ans Google-Formular: EST_GFORM (entry-IDs).
*/
(function () {
  "use strict";

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
        if (card) card.innerHTML = '<div class="est-coupon-top" style="color:var(--muted)">Gutschein abgelaufen</div><div class="est-coupon-sub">Die 15 Minuten sind vorbei — Sie können sich natürlich weiterhin anmelden.</div>';
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
    ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Einstufungstest");
    var modal = el("div", "anm-modal");
    var head = el("div", "anm-head");
    head.appendChild(el("div", "t serif", "Einstufungstest"));
    var close = el("button", "anm-close"); close.setAttribute("aria-label", "Schließen"); close.innerHTML = "&times;";
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
      body.innerHTML = '<p style="padding:20px 0;color:var(--muted)">Test wird geladen …</p>';
      fetch("/einstufungstest-fragen.json", { cache: "no-store" }).then(function (r) { return r.json(); })
        .then(function (d) { DATA = d; answers = new Array(d.fragen.length).fill(null); renderIntro(); })
        .catch(function () { body.innerHTML = '<p style="padding:20px 0;color:#a33">Test konnte nicht geladen werden. Bitte später erneut versuchen.</p>'; });
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
    body.appendChild(el("div", "anm-ey", "Italienisch"));
    body.appendChild(el("div", "anm-h serif", "Wie gut ist Ihr Italienisch?"));
    body.appendChild(el("p", "est-p", DATA.meta.hinweis || ""));
    body.appendChild(el("p", "est-p", "Am Ende sehen Sie Ihr geschätztes Niveau (A1–C2) — und erhalten es zusätzlich per E-Mail."));
    var btn = el("button", "anm-btn est-start", "Test starten");
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
    var back = el("button", "est-back", "Zurück");
    back.disabled = idx === 0;
    back.addEventListener("click", function () { if (idx > 0) { idx--; renderFrage(); } });
    var weiterBtn = el("button", "anm-btn est-weiter", idx === total - 1 ? "Zum Ergebnis" : "Weiter");
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
    body.appendChild(el("div", "anm-ey", "Fast geschafft"));
    body.appendChild(el("div", "anm-h serif", "Wohin dürfen wir Ihr Ergebnis schicken?"));
    body.appendChild(el("p", "est-p", "Wir zeigen Ihr Niveau direkt an und senden es Ihnen zusätzlich per E-Mail. So können wir Sie bei der passenden Kurswahl unterstützen."));
    var row = el("div", "est-row2");
    row.appendChild(feld("est-vorname", "Vorname", "text"));
    row.appendChild(feld("est-nachname", "Nachname", "text"));
    body.appendChild(row);
    body.appendChild(feld("est-email", "E-Mail", "email", "name@beispiel.de"));
    var nav = el("div", "est-nav");
    var back = el("button", "est-back", "Zurück");
    back.addEventListener("click", function () { idx = DATA.fragen.length - 1; renderFrage(); });
    var go = el("button", "anm-btn est-weiter", "Ergebnis anzeigen");
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
      if (!kontakt[id]) { setErr(id, "Bitte ausfüllen."); ok = false; }
    });
    if (kontakt["est-email"] && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(kontakt["est-email"])) {
      setErr("est-email", "Bitte eine gültige E-Mail-Adresse angeben."); ok = false;
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
      var gew = answers[i] != null ? q.o[answers[i]] : "— (keine Antwort)";
      var richtig = answers[i] === q.r;
      var z = (i + 1) + ". " + q.f.replace(/___/g, "_____") + "\n   Ihre Antwort: " + gew;
      if (richtig) { z += "  ✓ richtig"; }
      else { z += "  ✗ falsch — richtig: " + q.o[q.r] + (q.e ? "\n   Erklärung: " + q.e : ""); }
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
        gf(f, EST_GFORM.antworten, antLines);
        document.body.appendChild(f); f.submit(); setTimeout(function () { f.remove(); }, 1500);
      } catch (e) { /* Ergebnis trotzdem anzeigen */ }
    }
    renderErgebnis();
  }

  function renderErgebnis() {
    var lvl = ergebnis.level, desc = (DATA.meta.niveaus && DATA.meta.niveaus[lvl]) || "";
    // Niveau merken (Anmeldung nur dieses Niveau und darunter) + Willkommens-Gutschein ermitteln
    try { localStorage.setItem("callidus_est_niveau", lvl); } catch (e) {}
    var gut = ermittleGutschein();
    if (window.CALLIDUS_anmeldung && window.CALLIDUS_anmeldung.markiereNiveau) window.CALLIDUS_anmeldung.markiereNiveau();
    body.innerHTML = "";
    body.appendChild(el("div", "anm-ey", "Ihr Ergebnis"));
    body.appendChild(el("div", "est-level serif", lvl));
    body.appendChild(el("p", "est-leveltxt", desc));
    body.appendChild(el("div", "est-score", ergebnis.total + " von " + ergebnis.anzahl + " richtig"));
    var hint = el("p", "est-p", "Eine Bestätigung mit Ihrem Ergebnis ist unterwegs an <b>" + (kontakt["est-email"] || "") + "</b>. Dies ist eine erste Einschätzung — das genaue Niveau stimmen wir gern persönlich mit Ihnen ab.");
    body.appendChild(hint);
    if (gut) {
      var coupon = el("div", "est-coupon");
      coupon.innerHTML = '<div class="est-coupon-top">🎁 10 € Willkommens-Gutschein</div>'
        + '<div class="est-coupon-sub">Code <b>' + gut.code + '</b> — einmalig einlösbar, <b>nur 15 Minuten gültig</b>. Jetzt direkt anmelden und 10 € sparen.</div>'
        + '<div class="est-cd">Gültig noch <b id="est-cd-val">' + fmtRest(gut.exp - Date.now()) + '</b></div>';
      body.appendChild(coupon);
      starteCountdown(gut.exp);
    }
    var wrap = el("div", "est-actions");
    var cta = el("button", "anm-btn est-start est-cta-shine", "Jetzt zur Kursanmeldung");
    cta.addEventListener("click", function () {
      schliessen();
      if (window.CALLIDUS_anmeldung && window.CALLIDUS_anmeldung.oeffnen) window.CALLIDUS_anmeldung.oeffnen(lvl);
      else location.hash = "#preise";
    });
    wrap.appendChild(cta);
    var done = el("button", "est-back", "Schließen");
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

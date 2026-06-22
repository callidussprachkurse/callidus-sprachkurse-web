/* CALLIDUS Hamburg — Anmelde-Flow (Phase-1-Prototyp)
   Klickbarer, mehrstufiger Anmeldeprozess im Website-Look.
   Datenversand ans Google-Formular wird erst in Phase 3 verdrahtet
   (siehe plans/2026-06-21-hamburg-anmeldeprozess-website.md).
*/
(function () {
  "use strict";

  // ---- Kurs-Katalog -------------------------------------------------------
  // typ: 'gruppe' = feste Slots (Variante A), 'einzel' = freie Terminwahl (Variante B)
  var COURSES = {
    A1:       { label: "Kurs A1",            preis: "475 €",   typ: "gruppe" },
    A2:       { label: "Kurs A2",            preis: "490 €",   typ: "gruppe" },
    B1:       { label: "Kurs B1",            preis: "525 €",   typ: "gruppe" },
    B2:       { label: "Kurs B2",            preis: "540 €",   typ: "gruppe" },
    C1:       { label: "Kurs C1",            preis: "560 €",   typ: "gruppe" },
    C2:       { label: "Kurs C2",            preis: "599 €",   typ: "gruppe" },
    CILS:     { label: "CILS-Vorbereitung",  preis: "640 €",   typ: "gruppe" },
    KULTUR:   { label: "Kulturkurs",         preis: "370 €",   typ: "gruppe" },
    KONV:     { label: "Conversazione",       preis: "370 €",   typ: "gruppe" },
    ONLINE:   { label: "Online-Kurs",        preis: "455 €",   typ: "gruppe" },
    BUSINESS: { label: "Business-Kurs",      preis: "610 €",   typ: "gruppe", aufAnfrage: true },
    KINDER:   { label: "Kinderkurs",         preis: "365 €",   typ: "gruppe", kind: true },
    INTENSIV: { label: "Intensivkurs",       preis: "699 €",   typ: "gruppe" },
    SOMMER:   { label: "Sommerkurs",         preis: "699 €",   typ: "gruppe" },
    EINZEL:   { label: "Einzelunterricht",   preis: "1.399 €", typ: "einzel" }
  };

  // Gruppen-Kurse, die in der Kurswahl (generischer Einstieg) auswählbar sind
  var GRUPPEN_WAHL = ["A1","A2","B1","B2","C1","C2","CILS","KULTUR","KONV","ONLINE","KINDER","INTENSIV","SOMMER","BUSINESS"];

  // Kurs-Code aus dem Namen in der Preisliste ableiten
  function codeAusName(text) {
    var t = (text || "").toLowerCase();
    // Erst die Spezial-Kurse (deren Beschreibung kann ein Niveau wie "ab B1" enthalten)
    if (t.indexOf("cils") > -1) return "CILS";
    if (t.indexOf("conversazione") > -1 || t.indexOf("konversation") > -1) return "KONV";
    if (t.indexOf("kultur") > -1) return "KULTUR";
    if (t.indexOf("online") > -1) return "ONLINE";
    if (t.indexOf("business") > -1) return "BUSINESS";
    if (t.indexOf("kinder") > -1) return "KINDER";
    if (t.indexOf("intensiv") > -1) return "INTENSIV";
    if (t.indexOf("sommer") > -1) return "SOMMER";
    if (t.indexOf("einzel") > -1) return "EINZEL";
    // Dann die graduierten Kurse A1–C2
    var m = t.match(/\b([abc][12])\b/);
    if (m) return m[1].toUpperCase();
    return null;
  }

  // ---- Niveau-Filter (Einstufungstest -> Anmeldung) ----------------------
  var NIV_RANK = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
  function gespeichertesNiveau() {
    try { var v = localStorage.getItem("callidus_est_niveau"); return NIV_RANK[v] ? v : null; } catch (e) { return null; }
  }
  function niveauErlaubt(code) {
    var L = gespeichertesNiveau(); if (!L) return true;
    var lr = NIV_RANK[L];
    if (NIV_RANK[code]) return NIV_RANK[code] <= lr;   // graduierte Kurse A1–C2: nur Niveau oder darunter
    if (code === "KULTUR" || code === "KONV") return lr >= NIV_RANK.B1;  // Kultur- & Konversationskurs ab B1
    return true;                                        // CILS/Online/Business/… niveau-übergreifend
  }
  function zeigeNiveauHinweis(code) {
    var L = gespeichertesNiveau();
    var ov2 = el("div", "anm-overlay"); ov2.classList.add("open"); ov2.style.zIndex = "300";
    var m = el("div", "anm-modal"); m.style.maxWidth = "440px";
    m.innerHTML = '<div class="anm-body" style="padding:32px 26px;text-align:center">'
      + '<div class="anm-h serif" style="margin-bottom:10px">Dieser Kurs liegt über Ihrem Niveau</div>'
      + '<p style="color:var(--muted);line-height:1.6">Ihr Einstufungs-Ergebnis ist <b>' + esc(L) + '</b>. Bitte wählen Sie einen Kurs auf Niveau <b>' + esc(L) + '</b> oder darunter. Schätzen Sie sich höher ein? Dann beraten wir Sie gern persönlich.</p>'
      + '<button class="anm-btn" style="margin-top:24px">Verstanden</button></div>';
    ov2.appendChild(m); document.body.appendChild(ov2);
    function close() { ov2.remove(); }
    m.querySelector("button").addEventListener("click", close);
    ov2.addEventListener("mousedown", function (e) { if (e.target === ov2) close(); });
  }
  function markiereNiveau() {
    document.querySelectorAll(".price .pitem[data-kurs]").forEach(function (it) {
      var code = it.getAttribute("data-kurs");
      var locked = !niveauErlaubt(code);
      it.classList.toggle("anm-locked-row", locked);
      var pn = it.querySelector(".pn");
      var badge = it.querySelector(".anm-niv-badge");
      if (locked && pn && !badge) { var b = document.createElement("span"); b.className = "anm-niv-badge"; b.textContent = "über Ihrem Niveau"; pn.appendChild(b); }
      else if (!locked && badge) { badge.remove(); }
    });
  }
  window.CALLIDUS_anmeldung = { markiereNiveau: markiereNiveau, oeffnen: oeffnen };

  // ---- Willkommens-Gutschein (10 € bei direkter Anmeldung nach dem Test) --
  var GUTSCHEIN_WERT = 10;
  function aktiverGutschein() {
    try {
      var g = JSON.parse(localStorage.getItem("callidus_coupon") || "null");
      if (g && !g.used && g.exp > Date.now()) return g.code;
    } catch (e) {}
    return null;
  }
  function gutscheinEinloesen() {
    try {
      var g = JSON.parse(localStorage.getItem("callidus_coupon") || "null");
      if (g) { g.used = true; localStorage.setItem("callidus_coupon", JSON.stringify(g)); }
    } catch (e) {}
  }
  function preisZahl(s) { return parseInt(String(s).replace(/[^\d]/g, ""), 10) || 0; }
  function preisStr(n) { return n.toLocaleString("de-DE") + " €"; }

  // ---- Zustand ------------------------------------------------------------
  var slotsData = null;       // aus kurstermine.json
  var st = null;              // aktueller Anmelde-Zustand

  function neuerState() {
    return { kurs: null, branch: null, slot: null, wunsch: "", data: {}, steps: [], i: 0 };
  }

  // ---- DOM-Referenzen -----------------------------------------------------
  var overlay, modal, elTitle, elBody, elBar, elBack, elNext, elProgWrap;

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s){ return (s==null?"":String(s)).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];}); }

  function baueModal() {
    overlay = el("div", "anm-overlay");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML =
      '<div class="anm-modal" role="document">' +
        '<div class="anm-head">' +
          '<div class="t serif">Anmeldung</div>' +
          '<button class="anm-close" aria-label="Schließen">&times;</button>' +
        '</div>' +
        '<div class="anm-prog"><i style="width:0%"></i></div>' +
        '<div class="anm-body"></div>' +
        '<div class="anm-foot">' +
          '<button class="anm-btn ghost anm-back">Zurück</button>' +
          '<button class="anm-btn prim anm-next">Weiter</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    modal      = overlay.querySelector(".anm-modal");
    elTitle    = overlay.querySelector(".anm-head .t");
    elBody     = overlay.querySelector(".anm-body");
    elProgWrap = overlay.querySelector(".anm-prog");
    elBar      = overlay.querySelector(".anm-prog > i");
    elBack     = overlay.querySelector(".anm-back");
    elNext     = overlay.querySelector(".anm-next");

    overlay.querySelector(".anm-close").addEventListener("click", schliessen);
    overlay.addEventListener("mousedown", function (e) { if (e.target === overlay) schliessen(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && overlay.classList.contains("open")) schliessen(); });
    elBack.addEventListener("click", zurueck);
    elNext.addEventListener("click", weiter);
  }

  function schliessen() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  // ---- Flow steuern -------------------------------------------------------
  function oeffnen(code) {
    if (code && !niveauErlaubt(code)) { zeigeNiveauHinweis(code); return; }
    st = neuerState();
    if (code && COURSES[code]) {
      st.kurs = code;
      var c = COURSES[code];
      if (c.typ === "einzel") { st.branch = "einzel"; st.steps = ["einzeltermin","teilnehmer","kontakt","pruefung","danke"]; }
      else { st.branch = "gruppe"; st.steps = ["termin","teilnehmer","kontakt","pruefung","danke"]; }
    } else {
      st.steps = ["frage"]; // generischer Einstieg → erst Gruppe/Einzel fragen
    }
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    modal.scrollTop = 0;
    render();
  }

  function stepKey() { return st.steps[st.i]; }

  function render() {
    var key = stepKey();
    elBody.innerHTML = "";
    elBody.scrollTop = 0;
    if (modal) modal.scrollTop = 0;

    // Fortschrittsbalken (danke = 100%)
    var total = st.steps.length;
    var pct = Math.round(((st.i) / Math.max(1, total - 1)) * 100);
    elBar.style.width = pct + "%";
    elProgWrap.style.display = (key === "danke") ? "none" : "block";

    // Navigation
    elBack.style.visibility = (st.i > 0 && key !== "danke") ? "visible" : "hidden";
    elNext.textContent = "Weiter"; // Standard; einzelne Schritte überschreiben

    var RENDER = {
      frage: r_frage,
      kurswahl: r_kurswahl,
      termin: r_termin,
      einzeltermin: r_einzeltermin,
      teilnehmer: r_teilnehmer,
      kontakt: r_kontakt,
      pruefung: r_pruefung,
      danke: r_danke
    };
    (RENDER[key] || function(){})();
  }

  function weiter() {
    var key = stepKey();
    if (!validate(key)) return;
    if (key === "pruefung") { absenden(); return; }
    if (st.i < st.steps.length - 1) { st.i++; render(); }
  }
  function zurueck() {
    if (st.i > 0) { st.i--; render(); }
  }

  // ---- Schritte -----------------------------------------------------------

  function r_frage() {
    elTitle.textContent = "Anmeldung";
    elNext.style.display = "none";
    elBody.appendChild(el("div", "anm-ey", "Schritt 1 — Unterrichtsform"));
    elBody.appendChild(el("h3", "anm-h serif", "Gruppen- oder Einzelunterricht?"));
    var ch = el("div", "anm-choices");
    ch.innerHTML =
      '<div class="anm-choice" data-b="gruppe"><h4 class="serif">Gruppenunterricht</h4><p>Feste Kurse in kleinen Gruppen, von A1 bis C2 — gemeinsam lernen zu festen Terminen.</p></div>' +
      '<div class="anm-choice" data-b="einzel"><h4 class="serif">Einzelunterricht</h4><p>1:1, freie Terminwahl und individuelles Tempo. <span class="anm-tag">1.399 €</span></p></div>';
    ch.querySelectorAll(".anm-choice").forEach(function (c) {
      c.addEventListener("click", function () {
        var b = c.getAttribute("data-b");
        st.branch = b;
        if (b === "einzel") { st.kurs = "EINZEL"; st.steps = ["frage","einzeltermin","teilnehmer","kontakt","pruefung","danke"]; }
        else { st.steps = ["frage","kurswahl","termin","teilnehmer","kontakt","pruefung","danke"]; }
        st.i++; render();
      });
    });
    elBody.appendChild(ch);
  }

  function r_kurswahl() {
    elTitle.textContent = "Gruppenunterricht";
    elNext.style.display = "none";
    elBody.appendChild(el("div", "anm-ey", "Kurs wählen"));
    elBody.appendChild(el("h3", "anm-h serif", "Welcher Kurs interessiert Sie?"));
    var grid = el("div", "anm-choices anm-grid3");
    GRUPPEN_WAHL.forEach(function (code) {
      var c = COURSES[code];
      var erlaubt = niveauErlaubt(code);
      var card = el("div", "anm-choice" + (st.kurs === code ? " sel" : "") + (erlaubt ? "" : " anm-locked"));
      card.innerHTML = '<h4 class="serif">' + esc(c.label) + '</h4><p><span class="anm-tag">' + esc(c.preis) + '</span></p>' + (erlaubt ? "" : '<span class="anm-lock">über Ihrem Test-Niveau</span>');
      if (erlaubt) card.addEventListener("click", function () { st.kurs = code; st.i++; render(); });
      grid.appendChild(card);
    });
    elBody.appendChild(grid);
  }

  function r_termin() {
    var c = COURSES[st.kurs] || {};
    elTitle.textContent = c.label || "Kurs";
    elNext.style.display = "";
    elBody.appendChild(el("div", "anm-ey", "Schritt — Termin wählen"));
    elBody.appendChild(el("h3", "anm-h serif", "Verfügbare Termine für " + esc(c.label)));

    st._terminOk = false; // bei jedem Aufruf zurücksetzen (Kurswechsel)
    var liste = (slotsData && slotsData.slots ? slotsData.slots : []).filter(function (s) { return s.kurs === st.kurs; });

    if (c.aufAnfrage || liste.length === 0) {
      var note = el("div", "anm-note",
        c.aufAnfrage
          ? "<b>Auf Anfrage:</b> Diesen Kurs stellen wir individuell für Sie zusammen. Bitte schildern Sie kurz Ihren Wunsch — wir melden uns mit passenden Terminen."
          : "<b>Derzeit kein fester Termin angesetzt.</b> Tragen Sie Ihren Wunsch ein — wir informieren Sie, sobald ein passender Kurs startet, oder setzen Sie auf die Warteliste.");
      elBody.appendChild(note);
      var f = feld("textarea", "wunsch", "Ihr Termin- oder Kurswunsch", st.wunsch, false);
      elBody.appendChild(f.wrap);
      st._terminOk = true; // Wunsch optional
      return;
    }

    var box = el("div", "anm-slots");
    liste.forEach(function (s) {
      var voll = (s.plaetze_frei | 0) <= 0;
      var row = el("div", "anm-slot" + (voll ? " full" : "") + (st.slot && st.slot.id === s.id ? " sel" : ""));
      row.innerHTML =
        '<div class="anm-slot-l"><div class="anm-slot-t">' + esc(s.titel) + ' · ' + esc(s.tage) + ' · ' + esc(s.zeit) + '</div>' +
        '<div class="anm-slot-s">ab ' + esc(s.start) + ' · ' + esc(s.ort) + '</div></div>' +
        '<div class="free">' + (voll ? "ausgebucht" : "noch " + s.plaetze_frei + " frei") + '</div>';
      if (!voll) {
        row.addEventListener("click", function () {
          st.slot = s;
          box.querySelectorAll(".anm-slot").forEach(function (x) { x.classList.remove("sel"); });
          row.classList.add("sel");
          clearErr();
        });
      } else {
        var w = el("button", "anm-mini", "Auf Warteliste");
        w.addEventListener("click", function (ev) { ev.stopPropagation(); st.slot = { id: s.id, titel: s.titel, warteliste: true, tage: s.tage, zeit: s.zeit, start: s.start, ort: s.ort };
          box.querySelectorAll(".anm-slot").forEach(function (x) { x.classList.remove("sel"); }); row.classList.add("sel"); clearErr(); });
        row.appendChild(w);
      }
      box.appendChild(row);
    });
    elBody.appendChild(box);
  }

  function r_einzeltermin() {
    elTitle.textContent = "Einzelunterricht";
    elNext.style.display = "";
    elBody.appendChild(el("div", "anm-ey", "Schritt — Wunschtermin"));
    elBody.appendChild(el("h3", "anm-h serif", "Wann passt es Ihnen?"));
    elBody.appendChild(el("div", "anm-note", "Einzelunterricht (1:1) — <b>1.399 €</b>. Wählen Sie Ihre bevorzugten Tage/Zeiten; den genauen Termin stimmen wir persönlich mit Ihnen ab."));
    var f = feld("textarea", "wunsch", "Bevorzugte Tage & Uhrzeiten (z. B. Di/Do ab 18 Uhr)", st.wunsch, true);
    elBody.appendChild(f.wrap);
  }

  function r_teilnehmer() {
    var c = COURSES[st.kurs] || {};
    elTitle.textContent = c.label || "Anmeldung";
    elNext.style.display = "";
    elNext.textContent = "Weiter";
    elBody.appendChild(el("div", "anm-ey", "Schritt — Teilnehmer"));
    elBody.appendChild(el("h3", "anm-h serif", "Wer nimmt teil?"));

    var d = st.data;
    var artWrap = el("div", "anm-field");
    artWrap.innerHTML = '<label>Anmeldung für</label>';
    var seg = el("div", "anm-seg");
    var fuer = d.fuer || (c.kind ? "kind" : "erw");
    seg.innerHTML =
      '<button type="button" data-v="erw" class="' + (fuer==="erw"?"on":"") + '">Mich (erwachsen)</button>' +
      '<button type="button" data-v="kind" class="' + (fuer==="kind"?"on":"") + '">Mein Kind</button>';
    seg.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () { d.fuer = b.getAttribute("data-v"); render(); });
    });
    artWrap.appendChild(seg);
    elBody.appendChild(artWrap);
    d.fuer = fuer;

    var row = el("div", "anm-row");
    row.appendChild(feld("text", "vorname", "Vorname *", d.vorname, true).wrap);
    row.appendChild(feld("text", "nachname", "Nachname *", d.nachname, true).wrap);
    elBody.appendChild(row);

    elBody.appendChild(feld("date", "geburt", (fuer === "kind" ? "Geburtsdatum des Kindes *" : "Geburtsdatum *"), d.geburt, true).wrap);

    var gWrap = el("div", "anm-field");
    gWrap.innerHTML = '<label>Geschlecht *</label>';
    var gseg = el("div", "anm-seg");
    gseg.id = "anm-geschlecht";
    var g = d.geschlecht || "";
    gseg.innerHTML =
      '<button type="button" data-g="männlich" class="' + (g==="männlich"?"on":"") + '">männlich</button>' +
      '<button type="button" data-g="weiblich" class="' + (g==="weiblich"?"on":"") + '">weiblich</button>' +
      '<button type="button" data-g="divers" class="' + (g==="divers"?"on":"") + '">divers</button>';
    gseg.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () { d.geschlecht = b.getAttribute("data-g"); render(); });
    });
    gWrap.appendChild(gseg);
    elBody.appendChild(gWrap);

    var vk = feld("select", "vorkenntnisse", "Vorkenntnisse (für den Einstufungstest) *", d.vorkenntnisse, true);
    vk.input.innerHTML = ['', 'Keine (Anfänger)', 'A1', 'A2', 'B1', 'B2', 'C1']
      .map(function (o) { return '<option' + (d.vorkenntnisse === o ? ' selected' : '') + '>' + o + '</option>'; }).join("");
    elBody.appendChild(vk.wrap);
  }

  function r_kontakt() {
    elTitle.textContent = COURSES[st.kurs] ? COURSES[st.kurs].label : "Anmeldung";
    elNext.style.display = "";
    elBody.appendChild(el("div", "anm-ey", "Schritt — Kontakt"));
    elBody.appendChild(el("h3", "anm-h serif", "Wie erreichen wir Sie?"));
    var d = st.data;
    var row = el("div", "anm-row");
    row.appendChild(feld("email", "email", "E-Mail *", d.email, true).wrap);
    row.appendChild(feld("tel", "telefon", "Telefon *", d.telefon, true).wrap);
    elBody.appendChild(row);
    elBody.appendChild(feld("text", "strasse", "Straße & Hausnummer *", d.strasse, true).wrap);
    var row2 = el("div", "anm-row");
    row2.appendChild(feld("text", "plz", "PLZ *", d.plz, true).wrap);
    row2.appendChild(feld("text", "ort", "Ort *", d.ort, true).wrap);
    elBody.appendChild(row2);
    elBody.appendChild(feld("textarea", "anmerkung", "Anmerkung (optional)", d.anmerkung, false).wrap);
  }

  function r_pruefung() {
    elTitle.textContent = "Fast geschafft";
    elNext.style.display = "";
    elNext.textContent = "Jetzt kostenpflichtig anmelden";
    elBody.appendChild(el("div", "anm-ey", "Schritt — Prüfen & Absenden"));
    elBody.appendChild(el("h3", "anm-h serif", "Ihre Anmeldung im Überblick"));

    var c = COURSES[st.kurs] || {};
    var d = st.data;
    var termin = st.slot
      ? (st.slot.titel + " · " + st.slot.tage + " · " + st.slot.zeit + " · ab " + st.slot.start + (st.slot.warteliste ? " (Warteliste)" : ""))
      : (st.wunsch ? st.wunsch : "—");

    var sum = el("div", "anm-sum");
    function r(k, v) { return '<div class="r"><span class="k">' + esc(k) + '</span><span class="v">' + esc(v || "—") + '</span></div>'; }
    var gutschein = aktiverGutschein();
    var preisBlock;
    if (gutschein && preisZahl(c.preis) > 0) {
      preisBlock = r("Preis", c.preis)
        + '<div class="r anm-rabatt"><span class="k">Willkommensrabatt</span><span class="v">− ' + GUTSCHEIN_WERT + ' €</span></div>'
        + '<div class="r anm-total"><span class="k">Zu zahlen</span><span class="v">' + esc(preisStr(Math.max(0, preisZahl(c.preis) - GUTSCHEIN_WERT))) + '</span></div>';
    } else {
      preisBlock = r("Preis", c.preis);
    }
    sum.innerHTML =
      r("Kurs", c.label) +
      r("Form", st.branch === "einzel" ? "Einzelunterricht" : "Gruppenunterricht") +
      r("Termin", termin) +
      preisBlock +
      r("Teilnehmer", ((d.vorname||"") + " " + (d.nachname||"")).trim() + (d.fuer === "kind" ? " (Kind)" : "")) +
      r("E-Mail", d.email) +
      r("Telefon", d.telefon);
    elBody.appendChild(sum);
    if (gutschein && preisZahl(c.preis) > 0) {
      elBody.appendChild(el("div", "anm-coupon-banner", '🎁 <b>' + GUTSCHEIN_WERT + ' € Willkommens-Rabatt</b> aus Ihrem Einstufungstest wird verrechnet (Code <b>' + esc(gutschein) + '</b>).'));
    }

    if (d.fuer === "kind") {
      elBody.appendChild(el("div", "anm-note", "<b>Hinweis:</b> Bei minderjährigen Teilnehmern erfolgt die Anmeldung durch eine/n Erziehungsberechtigte/n."));
    }

    var consent = el("label", "anm-consent");
    consent.innerHTML =
      '<input type="checkbox" id="anm-consent"> ' +
      '<span>Ich habe die <a href="agb-datenschutz.pdf" target="_blank" rel="noopener">AGB und Datenschutzerklärung</a> gelesen und willige in die Verarbeitung meiner Daten zur Bearbeitung meiner Anmeldung ein. *</span>';
    elBody.appendChild(consent);
    var ph = el("div", "anm-errmsg"); ph.id = "anm-consent-err"; ph.style.display = "none"; ph.textContent = "Bitte bestätigen Sie die Einwilligung.";
    elBody.appendChild(ph);

    var wr = el("label", "anm-consent");
    wr.innerHTML =
      '<input type="checkbox" id="anm-widerruf"' + (d._vorzeitig ? ' checked' : '') + '> ' +
      '<span style="font-size:12.5px">Falls mein Kurs innerhalb der 14-tägigen Widerrufsfrist beginnt: Ich verlange ausdrücklich den Beginn vor Ablauf der Frist und weiß, dass ich bei einem Widerruf für bereits erbrachte Leistungen anteilig Wertersatz schulde. <a href="#" id="anm-wr-link">Widerrufsbelehrung</a> (optional)</span>';
    elBody.appendChild(wr);
    wr.querySelector("#anm-widerruf").addEventListener("change", function(){ d._vorzeitig = this.checked; });
    var wl = wr.querySelector("#anm-wr-link");
    if (wl) wl.addEventListener("click", function(e){ e.preventDefault(); var ov=document.getElementById("wr-overlay"); if(ov){ ov.classList.add("open"); } });
  }

  function r_danke() {
    elTitle.textContent = "Grazie mille!";
    elNext.style.display = "none";
    elBack.style.visibility = "hidden";
    var c = COURSES[st.kurs] || {};
    elBody.innerHTML =
      '<div class="anm-danke">' +
        '<div class="big serif">✓</div>' +
        '<h3 class="anm-h serif" style="margin-top:8px">Ihre Anmeldung ist eingegangen</h3>' +
        '<p>Vielen Dank' + (st.data.vorname ? ", " + esc(st.data.vorname) : "") + '. Wir haben Ihre Anmeldung für <b>' + esc(c.label) + '</b> erhalten.</p>' +
        '<p>Wir senden Ihnen in Kürze Ihre Rechnung (Lehrmaterial bereits inklusive). <b>Ihre Anmeldung ist hiermit verbindlich.</b></p>' +
        '<p>Bitte beachten Sie: Offiziell als Kursteilnehmer/in gelistet sind Sie erst nach vollständigem Zahlungseingang.</p>' +
        '<button class="anm-btn prim" id="anm-fertig" style="margin-top:18px">Schließen</button>' +
      '</div>';
    elBody.querySelector("#anm-fertig").addEventListener("click", schliessen);
  }

  // ---- Felder & Validierung ----------------------------------------------
  function feld(type, name, label, value, required) {
    var wrap = el("div", "anm-field");
    var lab = el("label", null, esc(label));
    lab.setAttribute("for", "anm-" + name);
    wrap.appendChild(lab);
    var input;
    if (type === "textarea") { input = el("textarea"); input.rows = 3; }
    else if (type === "select") { input = el("select"); }
    else { input = el("input"); input.type = type; }
    input.id = "anm-" + name;
    input.setAttribute("data-name", name);
    if (value && type !== "select") input.value = value;
    if (required) input.setAttribute("data-req", "1");
    input.addEventListener("input", function () {
      var k = input.getAttribute("data-name");
      if (k === "wunsch") st.wunsch = input.value; else st.data[k] = input.value;
      input.classList.remove("anm-err");
    });
    input.addEventListener("change", function () {
      var k = input.getAttribute("data-name");
      if (k === "wunsch") st.wunsch = input.value; else st.data[k] = input.value;
    });
    wrap.appendChild(input);
    return { wrap: wrap, input: input };
  }

  function clearErr() {
    var e = elBody.querySelector(".anm-errmsg.global");
    if (e) e.remove();
  }
  function zeigeFehler(msg) {
    clearErr();
    var e = el("div", "anm-errmsg global", esc(msg));
    elBody.appendChild(e);
  }

  function validate(key) {
    if (key === "termin") {
      if (st._terminOk) return true; // Wunsch-Fallback
      if (!st.slot) { zeigeFehler("Bitte wählen Sie einen Termin aus."); return false; }
      return true;
    }
    if (key === "einzeltermin") {
      if (!st.wunsch || !st.wunsch.trim()) { zeigeFehler("Bitte nennen Sie Ihre bevorzugten Zeiten."); markRequired(); return false; }
      return true;
    }
    if (key === "teilnehmer" || key === "kontakt") {
      var ok = true, first = null;
      elBody.querySelectorAll("[data-req]").forEach(function (inp) {
        var v = (inp.value || "").trim();
        var bad = !v || (inp.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v));
        if (bad) { inp.classList.add("anm-err"); if (!first) first = inp; ok = false; }
        else inp.classList.remove("anm-err");
      });
      if (key === "teilnehmer" && !st.data.geschlecht) {
        ok = false;
        var gs = document.getElementById("anm-geschlecht");
        if (gs) gs.style.outline = "1px solid #b3402f";
      }
      if (!ok) { zeigeFehler("Bitte füllen Sie die markierten Pflichtfelder korrekt aus (inkl. Geschlecht)."); if (first) first.focus(); }
      return ok;
    }
    if (key === "pruefung") {
      var cb = document.getElementById("anm-consent");
      var err = document.getElementById("anm-consent-err");
      if (!cb || !cb.checked) { if (err) err.style.display = "block"; return false; }
      if (err) err.style.display = "none";
      return true;
    }
    return true;
  }
  function markRequired() {
    elBody.querySelectorAll("[data-req]").forEach(function (inp) { if (!(inp.value || "").trim()) inp.classList.add("anm-err"); });
  }

  // ---- Absenden: Hintergrund-POST ans Google-Formular "KURSANMELDUNG" ------
  var GFORM = "https://docs.google.com/forms/d/e/1FAIpQLSek9KGreiQEs6akQoQOvGwYacHm4igGmR64AzDAtgBPOzsu7g/formResponse";
  var AGB_OK = "Hiermit bestätige ich, dass ich die allgemeinen Geschäftsbedingungen gelesen habe und mich darüber hinaus mit ihnen einverstanden erkläre.";

  function kategorie() {
    var KAT = {A1:"A1",A2:"A2",B1:"B1",B2:"B2",C1:"C1",C2:"C2",CILS:"CILS",KULTUR:"Sprach & Kultur",KONV:"Sprach & Kultur",BUSINESS:"Business",KINDER:"Kinder Kultur und Sprach",EINZEL:"Einzelunterricht"};
    if (KAT[st.kurs]) return KAT[st.kurs];
    var m = st.slot && /\b([ABC][12])\b/i.exec(st.slot.titel || "");
    if (m) return m[1].toUpperCase();
    var vk = (st.data.vorkenntnisse || "").toUpperCase();
    return /^[ABC][12]$/.test(vk) ? vk : "A1";
  }

  function absenden() {
    var d = st.data, c = COURSES[st.kurs] || {};
    var anschrift = [d.strasse, ((d.plz||"")+" "+(d.ort||"")).trim()].filter(Boolean).join("\n");
    var termin = st.slot
      ? (st.slot.titel+" · "+st.slot.tage+" · "+st.slot.zeit+" · ab "+st.slot.start+(st.slot.warteliste?" (WARTELISTE)":""))
      : (st.wunsch || "-");
    var nachricht = "[Online-Anmeldung Website]\n"
      + "Kurs: "+(c.label||st.kurs)+" ("+(c.preis||"")+")\n"
      + "Form: "+(st.branch==="einzel"?"Einzelunterricht":"Gruppe")+"\n"
      + "Termin/Wunsch: "+termin+"\n"
      + "Vorkenntnisse: "+(d.vorkenntnisse||"-")+"\n"
      + "Teilnehmer: "+(d.fuer==="kind"?"Kind":"Erwachsen")
      + "\nVorzeitiger Kursbeginn verlangt: "+(d._vorzeitig ? "ja (Wertersatz bekannt)" : "nein")
      + (aktiverGutschein() ? ("\nRabatt: "+GUTSCHEIN_WERT+" € Willkommensgutschein (Code "+aktiverGutschein()+", Einstufungstest)") : "")
      + (d.anmerkung ? ("\nAnmerkung: "+d.anmerkung) : "");
    var gb = (d.geburt||"").split("-");

    var sink = document.getElementById("anm-sink");
    if (!sink) { sink = el("iframe"); sink.name="anm-sink"; sink.id="anm-sink"; sink.style.display="none"; document.body.appendChild(sink); }
    var f = el("form"); f.method="POST"; f.action=GFORM; f.target="anm-sink"; f.style.display="none";
    function gf(n,v){ var i=document.createElement("input"); i.type="hidden"; i.name=n; i.value=(v==null?"":v); f.appendChild(i); }
    gf("emailAddress", d.email);
    gf("entry.1000057", d.vorname);
    gf("entry.2141434457", d.nachname);
    if (gb.length===3) { gf("entry.955415672_year",gb[0]); gf("entry.955415672_month",String(parseInt(gb[1],10))); gf("entry.955415672_day",String(parseInt(gb[2],10))); }
    gf("entry.1876159235", anschrift);
    gf("entry.1785755579", d.telefon);
    gf("entry.137747175", d.geschlecht);
    gf("entry.967112212", kategorie());
    gf("entry.1743512772", nachricht);
    gf("entry.1357558797", AGB_OK);
    gf("fvv","1"); gf("pageHistory","0,1,2,3,4,5,6,7,8,9,10,11,12,13");
    document.body.appendChild(f);
    try { f.submit(); } catch(e) {}
    setTimeout(function(){ try{ f.remove(); }catch(e){} }, 3000);
    gutscheinEinloesen(); // Gutschein ist einmalig — nach dem Absenden verbraucht

    st.i = st.steps.length - 1;
    render();
  }

  // ---- Init ---------------------------------------------------------------
  function bindeTrigger() {
    // Preislisten-Zeilen klickbar machen (Code aus dem Namen ableiten)
    document.querySelectorAll(".price .pitem").forEach(function (item) {
      var pn = item.querySelector(".pn");
      var code = codeAusName(pn ? pn.textContent : "");
      if (!code) return;
      item.setAttribute("data-kurs", code);
      item.setAttribute("role", "button");
      item.setAttribute("tabindex", "0");
      item.classList.add("anm-clickable");
      item.addEventListener("click", function () { oeffnen(code); });
      item.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); oeffnen(code); } });
    });
    markiereNiveau(); // bereits vorhandenes Test-Ergebnis (z. B. aus früherer Sitzung) berücksichtigen
    // Allgemeine CTA-Buttons
    document.querySelectorAll("[data-anmelden]").forEach(function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); oeffnen(null); });
    });
  }

  function ladeSlots() {
    return fetch("kurstermine.json", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (j) { slotsData = j; })
      .catch(function () { slotsData = { slots: [] }; });
  }

  function start() {
    baueModal();
    bindeTrigger();
    ladeSlots();
  }
  // Auch bei dynamischem/spätem Laden initialisieren (DOMContentLoaded ggf. schon vorbei)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();

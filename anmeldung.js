/* CALLIDUS Hamburg — Anmelde-Flow (Phase-1-Prototyp)
   Klickbarer, mehrstufiger Anmeldeprozess im Website-Look.
   Datenversand ans Google-Formular wird erst in Phase 3 verdrahtet
   (siehe plans/2026-06-21-hamburg-anmeldeprozess-website.md).
*/
(function () {
  "use strict";

  // ---- Sprache (DE/EN) ----------------------------------------------------
  // Erkennt die Seitensprache am <html lang="…">; "en…" -> EN, sonst DE.
  var CALLIDUS_LANG = (document.documentElement.lang || "de").toLowerCase().indexOf("en") === 0 ? "en" : "de";
  function tagEN(s){ if(CALLIDUS_LANG!=="en")return s; var m={"Montag":"Monday","Dienstag":"Tuesday","Mittwoch":"Wednesday","Donnerstag":"Thursday","Freitag":"Friday","Samstag":"Saturday","Sonntag":"Sunday"}; return String(s||"").split(/\s*&\s*/).map(function(x){return m[x.trim()]||x;}).join(" & "); }
  function ortEN(s){ if(CALLIDUS_LANG!=="en")return s; return String(s||"").replace("Italienisches Kulturinstitut Hamburg","Italian Cultural Institute Hamburg"); }

  // Sprache, die ans Google-Formular mitgesendet wird (für die spätere E-Mail-Lokalisierung).
  var ANM_LANG_ENTRY = "entry.PLACEHOLDER_LANG"; /* TODO: echte Entry-ID des Sprach-Feldes eintragen */

  // Wörterbuch aller kundenseitig sichtbaren Texte. Interne Notiz ans Büro bleibt deutsch (siehe absenden()).
  var I18N = {
    de: {
      // Kopf / Navigation
      titel_anmeldung: "Anmeldung",
      schliessen: "Schließen",
      zurueck: "Zurück",
      weiter: "Weiter",
      verstanden: "Verstanden",
      // Niveau-Gate
      niv_titel: "Dieser Kurs liegt über Ihrem Niveau",
      niv_text_a: "Ihr Einstufungs-Ergebnis ist ",
      niv_text_b: ". Bitte wählen Sie einen Kurs auf Niveau ",
      niv_text_c: " oder darunter. Schätzen Sie sich höher ein? Dann beraten wir Sie gern persönlich.",
      niv_badge: "über Ihrem Niveau",
      niv_lock_card: "über Ihrem Test-Niveau",
      // Schritt: Unterrichtsform
      ey_form: "Schritt 1 — Unterrichtsform",
      h_form: "Gruppen- oder Einzelunterricht?",
      choice_gruppe_h: "Gruppenunterricht",
      choice_gruppe_p: "Feste Kurse in kleinen Gruppen, von A1 bis C2 — gemeinsam lernen zu festen Terminen.",
      choice_einzel_h: "Einzelunterricht",
      choice_einzel_p_a: "1:1, freie Terminwahl und individuelles Tempo. ",
      // Schritt: Kurswahl
      titel_gruppe: "Gruppenunterricht",
      ey_kurswahl: "Kurs wählen",
      h_kurswahl: "Welcher Kurs interessiert Sie?",
      // Schritt: Termin
      titel_kurs: "Kurs",
      ey_termin: "Schritt — Termin wählen",
      h_termin_a: "Verfügbare Termine für ",
      note_aufanfrage: "<b>Auf Anfrage:</b> Diesen Kurs stellen wir individuell für Sie zusammen. Bitte schildern Sie kurz Ihren Wunsch — wir melden uns mit passenden Terminen.",
      note_keintermin: "<b>Derzeit kein fester Termin angesetzt.</b> Tragen Sie Ihren Wunsch ein — wir informieren Sie, sobald ein passender Kurs startet, oder setzen Sie auf die Warteliste.",
      feld_wunsch: "Ihr Termin- oder Kurswunsch",
      slot_ab: "ab ",
      slot_ausgebucht: "ausgebucht",
      slot_frei_a: "noch ",
      slot_frei_b: " frei",
      slot_warteliste_btn: "Auf Warteliste",
      slot_warteliste_tag: " (Warteliste)",
      // Schritt: Einzeltermin
      titel_einzel: "Einzelunterricht",
      ey_einzeltermin: "Schritt — Wunschtermin",
      h_einzeltermin: "Wann passt es Ihnen?",
      note_einzel_a: "Einzelunterricht (1:1) — <b>",
      note_einzel_b: "</b>. Wählen Sie Ihre bevorzugten Tage/Zeiten; den genauen Termin stimmen wir persönlich mit Ihnen ab.",
      feld_einzel_wunsch: "Bevorzugte Tage & Uhrzeiten (z. B. Di/Do ab 18 Uhr)",
      // Schritt: Teilnehmer
      ey_teilnehmer: "Schritt — Teilnehmer",
      h_teilnehmer: "Wer nimmt teil?",
      lab_anmeldung_fuer: "Anmeldung für",
      seg_erw: "Mich (erwachsen)",
      seg_kind: "Mein Kind",
      lab_vorname: "Vorname *",
      lab_nachname: "Nachname *",
      lab_geburt: "Geburtsdatum *",
      lab_geburt_kind: "Geburtsdatum des Kindes *",
      lab_geschlecht: "Geschlecht *",
      seg_m: "männlich",
      seg_w: "weiblich",
      seg_d: "divers",
      lab_vorkenntnisse: "Vorkenntnisse (für den Einstufungstest) *",
      opt_keine: "Keine (Anfänger)",
      // Schritt: Kontakt
      titel_anmeldung_fb: "Anmeldung",
      ey_kontakt: "Schritt — Kontakt",
      h_kontakt: "Wie erreichen wir Sie?",
      lab_email: "E-Mail *",
      lab_telefon: "Telefon *",
      lab_strasse: "Straße & Hausnummer *",
      lab_plz: "PLZ *",
      lab_ort: "Ort *",
      lab_anmerkung: "Anmerkung (optional)",
      // Schritt: Prüfung
      titel_pruefung: "Fast geschafft",
      btn_anmelden: "Jetzt kostenpflichtig anmelden",
      ey_pruefung: "Schritt — Prüfen & Absenden",
      h_pruefung: "Ihre Anmeldung im Überblick",
      sum_kurs: "Kurs",
      sum_form: "Form",
      sum_termin: "Termin",
      sum_preis: "Preis",
      sum_rabatt: "Willkommensrabatt",
      sum_zuzahlen: "Zu zahlen",
      sum_teilnehmer: "Teilnehmer",
      sum_email: "E-Mail",
      sum_telefon: "Telefon",
      form_einzel: "Einzelunterricht",
      form_gruppe: "Gruppenunterricht",
      kind_suffix: " (Kind)",
      coupon_banner_a: "🎁 <b>",
      coupon_banner_b: " € Willkommens-Rabatt</b> aus Ihrem Einstufungstest wird verrechnet (Code <b>",
      coupon_banner_c: "</b>).",
      kind_hinweis: "<b>Hinweis:</b> Bei minderjährigen Teilnehmern erfolgt die Anmeldung durch eine/n Erziehungsberechtigte/n.",
      consent_a: "Ich habe die <a href=\"agb-datenschutz.pdf\" target=\"_blank\" rel=\"noopener\">AGB und Datenschutzerklärung</a> gelesen und willige in die Verarbeitung meiner Daten zur Bearbeitung meiner Anmeldung ein. *",
      consent_err: "Bitte bestätigen Sie die Einwilligung.",
      widerruf_a: "Falls mein Kurs innerhalb der 14-tägigen Widerrufsfrist beginnt: Ich verlange ausdrücklich den Beginn vor Ablauf der Frist und weiß, dass ich bei einem Widerruf für bereits erbrachte Leistungen anteilig Wertersatz schulde. <a href=\"#\" id=\"anm-wr-link\">Widerrufsbelehrung</a> (optional)",
      // Danke
      danke_titel: "Grazie mille!",
      danke_h: "Ihre Anmeldung ist eingegangen",
      danke_p1_a: "Vielen Dank",
      danke_p1_b: ". Wir haben Ihre Anmeldung für <b>",
      danke_p1_c: "</b> erhalten.",
      danke_p2: "Wir senden Ihnen in Kürze Ihre Rechnung (Lehrmaterial bereits inklusive). <b>Ihre Anmeldung ist hiermit verbindlich.</b>",
      danke_p3: "Bitte beachten Sie: Offiziell als Kursteilnehmer/in gelistet sind Sie erst nach vollständigem Zahlungseingang.",
      // Validierung
      err_termin: "Bitte wählen Sie einen Termin aus.",
      err_einzelzeit: "Bitte nennen Sie Ihre bevorzugten Zeiten.",
      err_pflicht: "Bitte füllen Sie die markierten Pflichtfelder korrekt aus (inkl. Geschlecht).",
      // Kursnamen
      kurs_A1: "Kurs A1", kurs_A2: "Kurs A2", kurs_B1: "Kurs B1", kurs_B2: "Kurs B2",
      kurs_C1: "Kurs C1", kurs_C2: "Kurs C2", kurs_CILS: "CILS-Vorbereitung",
      kurs_KULTUR: "Kulturkurs", kurs_KONV: "Conversazione", kurs_ONLINE: "Online-Kurs",
      kurs_BUSINESS: "Business-Kurs", kurs_KINDER: "Kinderkurs", kurs_INTENSIV: "Intensivkurs",
      kurs_SOMMER: "Sommerkurs", kurs_EINZEL: "Einzelunterricht"
    },
    en: {
      // Head / navigation
      titel_anmeldung: "Registration",
      schliessen: "Close",
      zurueck: "Back",
      weiter: "Next",
      verstanden: "Understood",
      // Level gate
      niv_titel: "This course is above your level",
      niv_text_a: "Your placement result is ",
      niv_text_b: ". Please choose a course at level ",
      niv_text_c: " or below. Do you feel you are higher? We are happy to advise you personally.",
      niv_badge: "above your level",
      niv_lock_card: "above your test level",
      // Step: format
      ey_form: "Step 1 — Type of tuition",
      h_form: "Group or one-to-one tuition?",
      choice_gruppe_h: "Group tuition",
      choice_gruppe_p: "Fixed courses in small groups, from A1 to C2 — learning together at set times.",
      choice_einzel_h: "One-to-one tuition",
      choice_einzel_p_a: "1:1, free choice of dates and individual pace. ",
      // Step: course choice
      titel_gruppe: "Group tuition",
      ey_kurswahl: "Choose a course",
      h_kurswahl: "Which course interests you?",
      // Step: dates
      titel_kurs: "Course",
      ey_termin: "Step — Choose a date",
      h_termin_a: "Available dates for ",
      note_aufanfrage: "<b>On request:</b> We arrange this course individually for you. Please briefly describe your wishes — we will get back to you with suitable dates.",
      note_keintermin: "<b>No fixed date scheduled at present.</b> Enter your preference — we will let you know as soon as a suitable course starts, or place you on the waiting list.",
      feld_wunsch: "Your preferred dates or course",
      slot_ab: "from ",
      slot_ausgebucht: "fully booked",
      slot_frei_a: "",
      slot_frei_b: " place(s) left",
      slot_warteliste_btn: "Join waiting list",
      slot_warteliste_tag: " (waiting list)",
      // Step: one-to-one date
      titel_einzel: "One-to-one tuition",
      ey_einzeltermin: "Step — Preferred date",
      h_einzeltermin: "When suits you?",
      note_einzel_a: "One-to-one tuition (1:1) — <b>",
      note_einzel_b: "</b>. Choose your preferred days/times; we will arrange the exact schedule with you personally.",
      feld_einzel_wunsch: "Preferred days & times (e.g. Tue/Thu from 6 pm)",
      // Step: participant
      ey_teilnehmer: "Step — Participant",
      h_teilnehmer: "Who is taking part?",
      lab_anmeldung_fuer: "Registering for",
      seg_erw: "Myself (adult)",
      seg_kind: "My child",
      lab_vorname: "First name *",
      lab_nachname: "Last name *",
      lab_geburt: "Date of birth *",
      lab_geburt_kind: "Child's date of birth *",
      lab_geschlecht: "Gender *",
      seg_m: "male",
      seg_w: "female",
      seg_d: "diverse",
      lab_vorkenntnisse: "Prior knowledge (for the placement test) *",
      opt_keine: "None (beginner)",
      // Step: contact
      titel_anmeldung_fb: "Registration",
      ey_kontakt: "Step — Contact",
      h_kontakt: "How can we reach you?",
      lab_email: "Email *",
      lab_telefon: "Phone *",
      lab_strasse: "Street & house number *",
      lab_plz: "Postcode *",
      lab_ort: "Town/City *",
      lab_anmerkung: "Note (optional)",
      // Step: review
      titel_pruefung: "Almost done",
      btn_anmelden: "Register now (chargeable)",
      ey_pruefung: "Step — Review & submit",
      h_pruefung: "Your registration at a glance",
      sum_kurs: "Course",
      sum_form: "Type",
      sum_termin: "Date",
      sum_preis: "Price",
      sum_rabatt: "Welcome discount",
      sum_zuzahlen: "To pay",
      sum_teilnehmer: "Participant",
      sum_email: "Email",
      sum_telefon: "Phone",
      form_einzel: "One-to-one tuition",
      form_gruppe: "Group tuition",
      kind_suffix: " (child)",
      coupon_banner_a: "🎁 <b>€",
      coupon_banner_b: " welcome discount</b> from your placement test will be applied (code <b>",
      coupon_banner_c: "</b>).",
      kind_hinweis: "<b>Note:</b> For minors, registration is completed by a parent or legal guardian.",
      consent_a: "I have read the <a href=\"agb-datenschutz.pdf\" target=\"_blank\" rel=\"noopener\">terms and conditions and privacy policy</a> and consent to the processing of my data for the purpose of handling my registration. *",
      consent_err: "Please confirm your consent.",
      widerruf_a: "If my course begins within the 14-day cancellation period: I expressly request that it start before the period expires and I am aware that, in the event of cancellation, I owe proportionate compensation for services already provided. <a href=\"#\" id=\"anm-wr-link\">Cancellation policy</a> (optional)",
      // Thank you
      danke_titel: "Grazie mille!",
      danke_h: "Your registration has been received",
      danke_p1_a: "Thank you",
      danke_p1_b: ". We have received your registration for <b>",
      danke_p1_c: "</b>.",
      danke_p2: "We will send you your invoice shortly (teaching material already included). <b>Your registration is hereby binding.</b>",
      danke_p3: "Please note: you are officially listed as a course participant only after full payment has been received.",
      // Validation
      err_termin: "Please select a date.",
      err_einzelzeit: "Please tell us your preferred times.",
      err_pflicht: "Please complete the highlighted required fields correctly (including gender).",
      // Course names
      kurs_A1: "Course A1", kurs_A2: "Course A2", kurs_B1: "Course B1", kurs_B2: "Course B2",
      kurs_C1: "Course C1", kurs_C2: "Course C2", kurs_CILS: "CILS preparation",
      kurs_KULTUR: "Culture course", kurs_KONV: "Conversazione", kurs_ONLINE: "Online course",
      kurs_BUSINESS: "Business", kurs_KINDER: "Children's course", kurs_INTENSIV: "Intensive course",
      kurs_SOMMER: "Summer course", kurs_EINZEL: "One-to-one tuition"
    }
  };

  function t(k) {
    return (I18N[CALLIDUS_LANG][k] != null ? I18N[CALLIDUS_LANG] : I18N.de)[k];
  }

  // Kurs-Anzeigename in der aktuellen Sprache (Preise/Codes bleiben aus COURSES).
  function kursLabel(code) {
    var key = "kurs_" + code;
    var v = t(key);
    return v != null ? v : ((COURSES[code] && COURSES[code].label) || code);
  }

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
      + '<div class="anm-h serif" style="margin-bottom:10px">' + esc(t("niv_titel")) + '</div>'
      + '<p style="color:var(--muted);line-height:1.6">' + esc(t("niv_text_a")) + '<b>' + esc(L) + '</b>' + esc(t("niv_text_b")) + '<b>' + esc(L) + '</b>' + esc(t("niv_text_c")) + '</p>'
      + '<button class="anm-btn" style="margin-top:24px">' + esc(t("verstanden")) + '</button></div>';
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
      if (locked && pn && !badge) { var b = document.createElement("span"); b.className = "anm-niv-badge"; b.textContent = t("niv_badge"); pn.appendChild(b); }
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
          '<div class="t serif">' + esc(t("titel_anmeldung")) + '</div>' +
          '<button class="anm-close" aria-label="' + esc(t("schliessen")) + '">&times;</button>' +
        '</div>' +
        '<div class="anm-prog"><i style="width:0%"></i></div>' +
        '<div class="anm-body"></div>' +
        '<div class="anm-foot">' +
          '<button class="anm-btn ghost anm-back">' + esc(t("zurueck")) + '</button>' +
          '<button class="anm-btn prim anm-next">' + esc(t("weiter")) + '</button>' +
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
    elNext.textContent = t("weiter"); // Standard; einzelne Schritte überschreiben

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
    elTitle.textContent = t("titel_anmeldung");
    elNext.style.display = "none";
    elBody.appendChild(el("div", "anm-ey", esc(t("ey_form"))));
    elBody.appendChild(el("h3", "anm-h serif", esc(t("h_form"))));
    var ch = el("div", "anm-choices");
    ch.innerHTML =
      '<div class="anm-choice" data-b="gruppe"><h4 class="serif">' + esc(t("choice_gruppe_h")) + '</h4><p>' + esc(t("choice_gruppe_p")) + '</p></div>' +
      '<div class="anm-choice" data-b="einzel"><h4 class="serif">' + esc(t("choice_einzel_h")) + '</h4><p>' + esc(t("choice_einzel_p_a")) + '<span class="anm-tag">' + esc(COURSES.EINZEL.preis) + '</span></p></div>';
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
    elTitle.textContent = t("titel_gruppe");
    elNext.style.display = "none";
    elBody.appendChild(el("div", "anm-ey", esc(t("ey_kurswahl"))));
    elBody.appendChild(el("h3", "anm-h serif", esc(t("h_kurswahl"))));
    var grid = el("div", "anm-choices anm-grid3");
    GRUPPEN_WAHL.forEach(function (code) {
      var c = COURSES[code];
      var erlaubt = niveauErlaubt(code);
      var card = el("div", "anm-choice" + (st.kurs === code ? " sel" : "") + (erlaubt ? "" : " anm-locked"));
      card.innerHTML = '<h4 class="serif">' + esc(kursLabel(code)) + '</h4><p><span class="anm-tag">' + esc(c.preis) + '</span></p>' + (erlaubt ? "" : '<span class="anm-lock">' + esc(t("niv_lock_card")) + '</span>');
      if (erlaubt) card.addEventListener("click", function () { st.kurs = code; st.i++; render(); });
      grid.appendChild(card);
    });
    elBody.appendChild(grid);
  }

  function r_termin() {
    var c = COURSES[st.kurs] || {};
    elTitle.textContent = st.kurs ? kursLabel(st.kurs) : t("titel_kurs");
    elNext.style.display = "";
    elBody.appendChild(el("div", "anm-ey", esc(t("ey_termin"))));
    elBody.appendChild(el("h3", "anm-h serif", esc(t("h_termin_a")) + esc(kursLabel(st.kurs))));

    st._terminOk = false; // bei jedem Aufruf zurücksetzen (Kurswechsel)
    var liste = (slotsData && slotsData.slots ? slotsData.slots : []).filter(function (s) { return s.kurs === st.kurs; });

    if (c.aufAnfrage || liste.length === 0) {
      var note = el("div", "anm-note", c.aufAnfrage ? t("note_aufanfrage") : t("note_keintermin"));
      elBody.appendChild(note);
      var f = feld("textarea", "wunsch", t("feld_wunsch"), st.wunsch, false);
      elBody.appendChild(f.wrap);
      st._terminOk = true; // Wunsch optional
      return;
    }

    var box = el("div", "anm-slots");
    liste.forEach(function (s) {
      var voll = (s.plaetze_frei | 0) <= 0;
      var row = el("div", "anm-slot" + (voll ? " full" : "") + (st.slot && st.slot.id === s.id ? " sel" : ""));
      row.innerHTML =
        '<div class="anm-slot-l"><div class="anm-slot-t">' + esc(s.titel) + ' · ' + esc(tagEN(s.tage)) + ' · ' + esc(s.zeit) + '</div>' +
        '<div class="anm-slot-s">' + esc(t("slot_ab")) + esc(s.start) + ' · ' + esc(ortEN(s.ort)) + '</div></div>' +
        '<div class="free">' + (voll ? esc(t("slot_ausgebucht")) : esc(t("slot_frei_a")) + s.plaetze_frei + esc(t("slot_frei_b"))) + '</div>';
      if (!voll) {
        row.addEventListener("click", function () {
          st.slot = s;
          box.querySelectorAll(".anm-slot").forEach(function (x) { x.classList.remove("sel"); });
          row.classList.add("sel");
          clearErr();
        });
      } else {
        var w = el("button", "anm-mini", esc(t("slot_warteliste_btn")));
        w.addEventListener("click", function (ev) { ev.stopPropagation(); st.slot = { id: s.id, titel: s.titel, warteliste: true, tage: s.tage, zeit: s.zeit, start: s.start, ort: s.ort };
          box.querySelectorAll(".anm-slot").forEach(function (x) { x.classList.remove("sel"); }); row.classList.add("sel"); clearErr(); });
        row.appendChild(w);
      }
      box.appendChild(row);
    });
    elBody.appendChild(box);
  }

  function r_einzeltermin() {
    elTitle.textContent = t("titel_einzel");
    elNext.style.display = "";
    elBody.appendChild(el("div", "anm-ey", esc(t("ey_einzeltermin"))));
    elBody.appendChild(el("h3", "anm-h serif", esc(t("h_einzeltermin"))));
    elBody.appendChild(el("div", "anm-note", t("note_einzel_a") + esc(COURSES.EINZEL.preis) + t("note_einzel_b")));
    var f = feld("textarea", "wunsch", t("feld_einzel_wunsch"), st.wunsch, true);
    elBody.appendChild(f.wrap);
  }

  function r_teilnehmer() {
    var c = COURSES[st.kurs] || {};
    elTitle.textContent = st.kurs ? kursLabel(st.kurs) : t("titel_anmeldung_fb");
    elNext.style.display = "";
    elNext.textContent = t("weiter");
    elBody.appendChild(el("div", "anm-ey", esc(t("ey_teilnehmer"))));
    elBody.appendChild(el("h3", "anm-h serif", esc(t("h_teilnehmer"))));

    var d = st.data;
    var artWrap = el("div", "anm-field");
    artWrap.innerHTML = '<label>' + esc(t("lab_anmeldung_fuer")) + '</label>';
    var seg = el("div", "anm-seg");
    var fuer = d.fuer || (c.kind ? "kind" : "erw");
    seg.innerHTML =
      '<button type="button" data-v="erw" class="' + (fuer==="erw"?"on":"") + '">' + esc(t("seg_erw")) + '</button>' +
      '<button type="button" data-v="kind" class="' + (fuer==="kind"?"on":"") + '">' + esc(t("seg_kind")) + '</button>';
    seg.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () { d.fuer = b.getAttribute("data-v"); render(); });
    });
    artWrap.appendChild(seg);
    elBody.appendChild(artWrap);
    d.fuer = fuer;

    var row = el("div", "anm-row");
    row.appendChild(feld("text", "vorname", t("lab_vorname"), d.vorname, true).wrap);
    row.appendChild(feld("text", "nachname", t("lab_nachname"), d.nachname, true).wrap);
    elBody.appendChild(row);

    elBody.appendChild(feld("date", "geburt", (fuer === "kind" ? t("lab_geburt_kind") : t("lab_geburt")), d.geburt, true).wrap);

    var gWrap = el("div", "anm-field");
    gWrap.innerHTML = '<label>' + esc(t("lab_geschlecht")) + '</label>';
    var gseg = el("div", "anm-seg");
    gseg.id = "anm-geschlecht";
    var g = d.geschlecht || "";
    gseg.innerHTML =
      '<button type="button" data-g="männlich" class="' + (g==="männlich"?"on":"") + '">' + esc(t("seg_m")) + '</button>' +
      '<button type="button" data-g="weiblich" class="' + (g==="weiblich"?"on":"") + '">' + esc(t("seg_w")) + '</button>' +
      '<button type="button" data-g="divers" class="' + (g==="divers"?"on":"") + '">' + esc(t("seg_d")) + '</button>';
    gseg.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () { d.geschlecht = b.getAttribute("data-g"); render(); });
    });
    gWrap.appendChild(gseg);
    elBody.appendChild(gWrap);

    var vk = feld("select", "vorkenntnisse", t("lab_vorkenntnisse"), d.vorkenntnisse, true);
    vk.input.innerHTML = ['', t("opt_keine"), 'A1', 'A2', 'B1', 'B2', 'C1']
      .map(function (o) { return '<option' + (d.vorkenntnisse === o ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join("");
    elBody.appendChild(vk.wrap);
  }

  function r_kontakt() {
    elTitle.textContent = COURSES[st.kurs] ? kursLabel(st.kurs) : t("titel_anmeldung_fb");
    elNext.style.display = "";
    elBody.appendChild(el("div", "anm-ey", esc(t("ey_kontakt"))));
    elBody.appendChild(el("h3", "anm-h serif", esc(t("h_kontakt"))));
    var d = st.data;
    var row = el("div", "anm-row");
    row.appendChild(feld("email", "email", t("lab_email"), d.email, true).wrap);
    row.appendChild(feld("tel", "telefon", t("lab_telefon"), d.telefon, true).wrap);
    elBody.appendChild(row);
    elBody.appendChild(feld("text", "strasse", t("lab_strasse"), d.strasse, true).wrap);
    var row2 = el("div", "anm-row");
    row2.appendChild(feld("text", "plz", t("lab_plz"), d.plz, true).wrap);
    row2.appendChild(feld("text", "ort", t("lab_ort"), d.ort, true).wrap);
    elBody.appendChild(row2);
    elBody.appendChild(feld("textarea", "anmerkung", t("lab_anmerkung"), d.anmerkung, false).wrap);
  }

  function r_pruefung() {
    elTitle.textContent = t("titel_pruefung");
    elNext.style.display = "";
    elNext.textContent = t("btn_anmelden");
    elBody.appendChild(el("div", "anm-ey", esc(t("ey_pruefung"))));
    elBody.appendChild(el("h3", "anm-h serif", esc(t("h_pruefung"))));

    var c = COURSES[st.kurs] || {};
    var d = st.data;
    var termin = st.slot
      ? (st.slot.titel + " · " + tagEN(st.slot.tage) + " · " + st.slot.zeit + " · " + t("slot_ab") + st.slot.start + (st.slot.warteliste ? t("slot_warteliste_tag") : ""))
      : (st.wunsch ? st.wunsch : "—");

    var sum = el("div", "anm-sum");
    function r(k, v) { return '<div class="r"><span class="k">' + esc(k) + '</span><span class="v">' + esc(v || "—") + '</span></div>'; }
    var gutschein = aktiverGutschein();
    var preisBlock;
    if (gutschein && preisZahl(c.preis) > 0) {
      preisBlock = r(t("sum_preis"), c.preis)
        + '<div class="r anm-rabatt"><span class="k">' + esc(t("sum_rabatt")) + '</span><span class="v">− ' + GUTSCHEIN_WERT + ' €</span></div>'
        + '<div class="r anm-total"><span class="k">' + esc(t("sum_zuzahlen")) + '</span><span class="v">' + esc(preisStr(Math.max(0, preisZahl(c.preis) - GUTSCHEIN_WERT))) + '</span></div>';
    } else {
      preisBlock = r(t("sum_preis"), c.preis);
    }
    sum.innerHTML =
      r(t("sum_kurs"), kursLabel(st.kurs)) +
      r(t("sum_form"), st.branch === "einzel" ? t("form_einzel") : t("form_gruppe")) +
      r(t("sum_termin"), termin) +
      preisBlock +
      r(t("sum_teilnehmer"), ((d.vorname||"") + " " + (d.nachname||"")).trim() + (d.fuer === "kind" ? t("kind_suffix") : "")) +
      r(t("sum_email"), d.email) +
      r(t("sum_telefon"), d.telefon);
    elBody.appendChild(sum);
    if (gutschein && preisZahl(c.preis) > 0) {
      elBody.appendChild(el("div", "anm-coupon-banner", t("coupon_banner_a") + GUTSCHEIN_WERT + t("coupon_banner_b") + esc(gutschein) + t("coupon_banner_c")));
    }

    if (d.fuer === "kind") {
      elBody.appendChild(el("div", "anm-note", t("kind_hinweis")));
    }

    var consent = el("label", "anm-consent");
    consent.innerHTML =
      '<input type="checkbox" id="anm-consent"> ' +
      '<span>' + t("consent_a") + '</span>';
    elBody.appendChild(consent);
    var ph = el("div", "anm-errmsg"); ph.id = "anm-consent-err"; ph.style.display = "none"; ph.textContent = t("consent_err");
    elBody.appendChild(ph);

    var wr = el("label", "anm-consent");
    wr.innerHTML =
      '<input type="checkbox" id="anm-widerruf"' + (d._vorzeitig ? ' checked' : '') + '> ' +
      '<span style="font-size:12.5px">' + t("widerruf_a") + '</span>';
    elBody.appendChild(wr);
    wr.querySelector("#anm-widerruf").addEventListener("change", function(){ d._vorzeitig = this.checked; });
    var wl = wr.querySelector("#anm-wr-link");
    if (wl) wl.addEventListener("click", function(e){ e.preventDefault(); var ov=document.getElementById("wr-overlay"); if(ov){ ov.classList.add("open"); } });
  }

  function r_danke() {
    elTitle.textContent = t("danke_titel");
    elNext.style.display = "none";
    elBack.style.visibility = "hidden";
    var c = COURSES[st.kurs] || {};
    elBody.innerHTML =
      '<div class="anm-danke">' +
        '<div class="big serif">✓</div>' +
        '<h3 class="anm-h serif" style="margin-top:8px">' + esc(t("danke_h")) + '</h3>' +
        '<p>' + esc(t("danke_p1_a")) + (st.data.vorname ? ", " + esc(st.data.vorname) : "") + t("danke_p1_b") + esc(kursLabel(st.kurs)) + t("danke_p1_c") + '</p>' +
        '<p>' + t("danke_p2") + '</p>' +
        '<p>' + esc(t("danke_p3")) + '</p>' +
        '<button class="anm-btn prim" id="anm-fertig" style="margin-top:18px">' + esc(t("schliessen")) + '</button>' +
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
      if (!st.slot) { zeigeFehler(t("err_termin")); return false; }
      return true;
    }
    if (key === "einzeltermin") {
      if (!st.wunsch || !st.wunsch.trim()) { zeigeFehler(t("err_einzelzeit")); markRequired(); return false; }
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
      if (!ok) { zeigeFehler(t("err_pflicht")); if (first) first.focus(); }
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
    gf(ANM_LANG_ENTRY, CALLIDUS_LANG.toUpperCase()); // Sprache der Anmeldung ("DE"/"EN") für spätere E-Mail-Lokalisierung
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
    return fetch("/kurstermine.json", { cache: "no-store" })
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

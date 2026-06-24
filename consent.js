/* CALLIDUS Sprachkurse — Consent-Banner + GoatCounter (cookie-los, lädt ERST nach Einwilligung).
   Sprache automatisch aus <html lang>. Einwilligung in localStorage (callidus_consent),
   jederzeit über "Datenschutz-Einstellungen" im Footer widerrufbar.
   Ereignis-Tracking (nur nach Einwilligung): Instagram-, E-Mail-Klicks, Einstufungstest-Start. */
(function () {
  var KEY = "callidus_consent";
  var EN = (document.documentElement.lang || "de").toLowerCase().indexOf("en") === 0;
  var T = EN ? {
    text: "We'd like to measure anonymously how our website is used — with a privacy-friendly, cookie-free tool (GoatCounter): which pages and links (e.g. Instagram) are opened. No cookies, no personal profiles.",
    yes: "Accept", no: "Decline", more: "Privacy policy"
  } : {
    text: "Wir möchten anonym messen, wie unsere Website genutzt wird — mit einem datenschutzfreundlichen, cookie-losen Tool (GoatCounter): welche Seiten und Links (z. B. Instagram) aufgerufen werden. Keine Cookies, keine persönlichen Profile.",
    yes: "Einverstanden", no: "Ablehnen", more: "Datenschutz"
  };

  var css = document.createElement("style");
  css.textContent =
    ".cc-bar{position:fixed;left:0;right:0;bottom:0;z-index:300;background:#16130F;color:#E7DFCD;border-top:1px solid #A8814A;padding:16px 20px;display:none;font-family:'Inter',sans-serif;font-size:13.5px;line-height:1.55;box-shadow:0 -8px 30px rgba(0,0,0,.35)}" +
    ".cc-bar.show{display:block}" +
    ".cc-wrap{max-width:1100px;margin:0 auto;display:flex;gap:18px;align-items:center;flex-wrap:wrap;justify-content:center}" +
    ".cc-txt{flex:1;min-width:240px}.cc-txt a{color:#E0BE84;text-decoration:underline}" +
    ".cc-btns{display:flex;gap:10px;flex-shrink:0}" +
    ".cc-btn{font-family:inherit;font-size:13.5px;padding:11px 24px;border-radius:6px;cursor:pointer;border:1px solid #A8814A;transition:.2s;letter-spacing:.02em}" +
    ".cc-yes{background:#A8814A;color:#1a140b;font-weight:500}.cc-yes:hover{background:#bd9357}" +
    ".cc-no{background:transparent;color:#E7DFCD}.cc-no:hover{background:rgba(255,255,255,.08)}" +
    "@media(max-width:600px){.cc-btns{width:100%}.cc-btn{flex:1}}";
  document.head.appendChild(css);

  var bar = document.createElement("div");
  bar.className = "cc-bar";
  bar.setAttribute("role", "dialog");
  bar.setAttribute("aria-label", EN ? "Privacy consent" : "Datenschutz-Einwilligung");
  bar.innerHTML =
    '<div class="cc-wrap"><div class="cc-txt">' + T.text + ' <a href="#" data-cc-more>' + T.more + '</a></div>' +
    '<div class="cc-btns">' +
    '<button class="cc-btn cc-no" type="button">' + T.no + '</button>' +
    '<button class="cc-btn cc-yes" type="button">' + T.yes + '</button>' +
    '</div></div>';

  function mount() {
    document.body.appendChild(bar);
    var st = document.getElementById("cc-settings");
    if (st) st.addEventListener("click", function (e) { e.preventDefault(); show(); });
    decide();
  }
  function show() { bar.classList.add("show"); }
  function hide() { bar.classList.remove("show"); }

  var gcLoaded = false, bound = false;
  function loadGC() {
    if (gcLoaded) return; gcLoaded = true;
    var s = document.createElement("script");
    s.async = true; s.src = "//gc.zgo.at/count.js";
    s.setAttribute("data-goatcounter", "https://callidus.goatcounter.com/count");
    s.addEventListener("load", bindEvents);
    document.body.appendChild(s);
  }
  function ev(path, title) {
    try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: path, title: title, event: true }); } catch (e) {}
  }
  function bindEvents() {
    if (bound) return; bound = true;
    function on(sel, path, title) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
        el.addEventListener("click", function () { ev(path, title); });
      });
    }
    on(".ig-fab", "instagram-klick", "Instagram-Link");
    on(".mail-fab", "email-klick", "E-Mail-Link");
    on("[data-einstufung]", "einstufungstest-start", "Einstufungstest gestartet");
  }

  function grant() { try { localStorage.setItem(KEY, "granted"); } catch (e) {} hide(); loadGC(); }
  function deny() { try { localStorage.setItem(KEY, "denied"); } catch (e) {} hide(); }

  bar.addEventListener("click", function (e) {
    if (e.target.closest(".cc-yes")) grant();
    else if (e.target.closest(".cc-no")) deny();
    else if (e.target.closest("[data-cc-more]")) { e.preventDefault(); var d = document.getElementById("ds-link"); if (d) d.click(); }
  });

  function decide() {
    var c = null; try { c = localStorage.getItem(KEY); } catch (e) {}
    if (c === "granted") loadGC();
    else if (c === "denied") { /* kein Tracking */ }
    else show();
  }

  window.CALLIDUS_consent = { reopen: show };

  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();

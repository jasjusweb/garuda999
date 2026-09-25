/**
 * GARUDA999 — quick Deposit/Withdraw (logged in) | Masuk/Daftar (guest)
 * Mobile home only. Same behavior, polished UI.
 */
(function () {
  var STYLE_ID = "jasjus-quick-btn-style";
  var ROOT_ID = "jasjus-quick-btn";

  function path() {
    return String(location.pathname || "/").toLowerCase();
  }

  function isHome() {
    var p = path();
    return (
      p === "/" ||
      p === "/index" ||
      p === "/index.html" ||
      p === "/secure/home" ||
      p === "/secure/home.html" ||
      p === "/home" ||
      p === "/home.html"
    );
  }

  function isLoggedIn() {
    if (/^\/secure\//.test(path())) return true;
    if (document.querySelector(".g8-username, .g8-mem-name, .g8-name")) return true;
    if (document.querySelector('a[href*="logout" i], a[href*="/logout"]')) return true;
    if (document.querySelector('a[href*="/secure/admin"]')) return true;
    var body = (document.body && document.body.innerText) || "";
    if (/Profil:\s*[A-Za-z]/.test(body)) return true;
    return false;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css =
      "#" + ROOT_ID + "{" +
        "display:none;margin:0;padding:8px 10px 6px;width:100%;box-sizing:border-box;" +
        "background:transparent;" +
      "}" +
      "#" + ROOT_ID + " .quick-btn{" +
        "display:flex;width:100%;margin:0;padding:0;border:0;gap:8px;" +
        "font-family:inherit;box-sizing:border-box;" +
      "}" +
      "#" + ROOT_ID + " .quick-btn a{" +
        "flex:1 1 50%;display:inline-flex;align-items:center;justify-content:center;gap:7px;" +
        "min-height:46px;padding:12px 12px;margin:0;border:0;border-radius:12px;" +
        "text-decoration:none;font-size:14.5px;font-weight:700;letter-spacing:.03em;" +
        "line-height:1.2;box-sizing:border-box;" +
        "box-shadow:0 2px 8px rgba(15,23,42,.12);" +
        "-webkit-tap-highlight-color:transparent;" +
        "transition:transform .12s ease, filter .12s ease, box-shadow .12s ease;" +
      "}" +
      "#" + ROOT_ID + " .quick-btn a .qb-ico{" +
        "display:inline-flex;width:18px;height:18px;flex:0 0 18px;" +
        "align-items:center;justify-content:center;" +
      "}" +
      "#" + ROOT_ID + " .quick-btn a .qb-ico svg{" +
        "display:block;width:18px;height:18px;" +
      "}" +
      /* Deposit / Masuk — teal brand */ +
      "#" + ROOT_ID + " .quick-btn a:first-child{" +
        "background:linear-gradient(180deg,#12b5c4 0%,#008f9c 100%);" +
        "color:#fff;" +
      "}" +
      /* Withdraw / Daftar — gold */ +
      "#" + ROOT_ID + " .quick-btn a:last-child{" +
        "background:linear-gradient(180deg,#f0c33a 0%,#e0a800 100%);" +
        "color:#12343c;" +
      "}" +
      "#" + ROOT_ID + " .quick-btn a:active{" +
        "transform:scale(.98);filter:brightness(.94);" +
        "box-shadow:0 1px 4px rgba(15,23,42,.14);" +
      "}" +
      "@media (max-width:991px){#" + ROOT_ID + "{display:block;}}" +
      "@media (min-width:992px){#" + ROOT_ID + "{display:none!important;}}";

    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function iconWallet() {
    return (
      '<span class="qb-ico" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none"><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5v-9Z" stroke="currentColor" stroke-width="1.8"/><path d="M16 12.2h4.2V9.8H16a1.2 1.2 0 0 0 0 2.4Z" fill="currentColor"/></svg>' +
      "</span>"
    );
  }

  function iconCash() {
    return (
      '<span class="qb-ico" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="2.2" stroke="currentColor" stroke-width="1.8"/><path d="M7 10v4M17 10v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
      "</span>"
    );
  }

  function iconLogin() {
    return (
      '<span class="qb-ico" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none"><path d="M10 7V5a2 2 0 0 1 2-2h7v18h-7a2 2 0 0 1-2-2v-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3 12h11M10 8l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      "</span>"
    );
  }

  function iconRegister() {
    return (
      '<span class="qb-ico" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.2" stroke="currentColor" stroke-width="1.8"/><path d="M5.5 19c1.6-3 4-4.5 6.5-4.5S17 16 18.5 19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M19 8v4M17 10h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
      "</span>"
    );
  }

  function findAnchor() {
    return (
      document.querySelector("section.g8-banner.g8-banner-m") ||
      document.querySelector("section.g8-banner") ||
      document.querySelector(".slider.g8-banner") ||
      document.querySelector(".swiper-container.g8b-m") ||
      document.querySelector(".swiper-container")
    );
  }

  function buildHtml(loggedIn) {
    if (loggedIn) {
      return (
        '<section class="quick-btn">' +
        '<a href="/secure/admin/deposit">' + iconWallet() + "<span>Deposit</span></a>" +
        '<a href="/secure/admin/withdrawal">' + iconCash() + "<span>Withdraw</span></a>" +
        "</section>"
      );
    }
    return (
      '<section class="quick-btn">' +
      '<a href="#" class="g8pop-login">' + iconLogin() + "<span>Masuk</span></a>" +
      '<a href="/register">' + iconRegister() + "<span>Daftar</span></a>" +
      "</section>"
    );
  }

  function place() {
    if (!isHome()) {
      var old = document.getElementById(ROOT_ID);
      if (old) old.remove();
      return;
    }
    ensureStyles();
    var loggedIn = isLoggedIn();
    var root = document.getElementById(ROOT_ID);
    if (root) {
      var want = loggedIn ? "in" : "out";
      if (root.getAttribute("data-mode") === want) return;
      root.remove();
      root = null;
    }
    var anchor = findAnchor();
    if (!anchor) return;
    root = document.createElement("div");
    root.id = ROOT_ID;
    root.setAttribute("data-mode", loggedIn ? "in" : "out");
    root.innerHTML = buildHtml(loggedIn);
    if (anchor.parentElement && anchor.classList.contains("swiper-container")) {
      var banner = anchor.closest("section.g8-banner, section.slider") || anchor.parentElement;
      banner.insertAdjacentElement("afterend", root);
    } else {
      anchor.insertAdjacentElement("afterend", root);
    }
  }

  function boot() {
    place();
    setTimeout(place, 400);
    setTimeout(place, 1200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

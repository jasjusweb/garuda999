
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
      "#" +
      ROOT_ID +
      "{display:none;margin:0;padding:0;width:100%;box-sizing:border-box;}" +
      "#" +
      ROOT_ID +
      " .quick-btn{" +
      "display:flex;width:100%;margin:0;padding:0;border:0;overflow:hidden;" +
      "font-family:inherit;}" +
      "#" +
      ROOT_ID +
      " .quick-btn a{" +
      "flex:1 1 50%;display:flex;align-items:center;justify-content:center;" +
      "min-height:44px;padding:12px 10px;margin:0;border:0;border-radius:0;" +
      "text-decoration:none;font-size:15px;font-weight:700;letter-spacing:.02em;" +
      "color:#fff;line-height:1.2;box-sizing:border-box;}" +
      "#" +
      ROOT_ID +
      " .quick-btn a:first-child{background:#0d8a8a;color:#fff;}" +
      "#" +
      ROOT_ID +
      " .quick-btn a:last-child{background:#e6b000;color:#12343c;}" +
      "#" +
      ROOT_ID +
      " .quick-btn a:active{filter:brightness(.92);}" +
      "@media (max-width:991px){#" +
      ROOT_ID +
      "{display:block;}}" +
      "@media (min-width:992px){#" +
      ROOT_ID +
      "{display:none!important;}}";
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
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
        '<a href="/secure/admin/deposit">Deposit</a>' +
        '<a href="/secure/admin/withdrawal">Withdraw</a>' +
        "</section>"
      );
    }
    return (
      '<section class="quick-btn">' +
      '<a href="#" class="g8pop-login">Masuk</a>' +
      '<a href="#" class="g8pop-signup">Daftar</a>' +
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

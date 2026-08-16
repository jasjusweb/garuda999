(() => {
  const WORKER = "https://qriscepat.jasjusweb.workers.dev";
  const SESSION_KEY = "activeQrDataTurbo";
  const REMARK = "QRIS TURBO";
  if (!/deposit/i.test(location.pathname)) return;
  if (window.__qristurboBound) return;
  window.__qristurboBound = true;

  function ready(fn) {
    if (window.jQuery) { fn(window.jQuery); return; }
    var t = setInterval(function () {
      if (window.jQuery) { clearInterval(t); fn(window.jQuery); }
    }, 50);
  }

  function crc16(data) {
    var crc = 0xFFFF, i, b;
    for (i = 0; i < data.length; i++) {
      crc ^= data.charCodeAt(i) << 8;
      for (b = 0; b < 8; b++) crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
    }
    return ("0000" + (crc & 0xFFFF).toString(16).toUpperCase()).slice(-4);
  }
  function generateQrisPayload(o, a) {
    var t = "5802ID";
    var s = String(o || "").trim();
    if (s.length > 8 && s.slice(-8, -4) === "6304") s = s.slice(0, -8);
    var i = s.indexOf(t);
    if (i === -1) throw new Error("Format QRIS tidak valid.");
    var m = String(a);
    var n = "54" + String(m.length).padStart(2, "0") + m;
    var r = s.substring(0, i) + n + s.substring(i) + "6304";
    return r + crc16(r);
  }
  function uniqueCode(base, length) {
    if (base === 10000000) return 0;
    var n = Math.min(3, Math.max(1, parseInt(length, 10) || 2));
    var min = n === 1 ? 1 : Math.pow(10, n - 1);
    var max = Math.pow(10, n) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }
  function pad2(n) { return String(n).padStart(2, "0"); }
  function todayQuery() {
    var now = new Date();
    var s = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    var e = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 0);
    function fmt(d) {
      return pad2(d.getDate()) + "-" + pad2(d.getMonth() + 1) + "-" + d.getFullYear() + " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes());
    }
    return { searchDateFrom: fmt(s), searchDateTo: fmt(e) };
  }
  function waitForQRCode() {
    return new Promise(function (resolve, reject) {
      if (typeof QRCode !== "undefined") { resolve(); return; }
      if (!document.querySelector("script[data-qristurbo-qrcode]")) {
        var s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js";
        s.async = true;
        s.setAttribute("data-qristurbo-qrcode", "1");
        document.head.appendChild(s);
      }
      var start = Date.now();
      var t = setInterval(function () {
        if (typeof QRCode !== "undefined") { clearInterval(t); resolve(); }
        else if (Date.now() - start > 8000) { clearInterval(t); reject(new Error("Library QR gagal dimuat.")); }
      }, 50);
    });
  }
  waitForQRCode().catch(function () {});

  ready(function ($) {
    if (!document.getElementById("qristurbo-style")) {
      var st = document.createElement("style");
      st.id = "qristurbo-style";
      st.textContent =
        ".payment-method li[data-type='qristurbo']{visibility:visible!important;opacity:1!important;pointer-events:auto!important;cursor:pointer!important}" +
        ".qristurbo-panel{display:none;clear:both;width:100%;box-sizing:border-box;padding:8px 0 16px}" +
        ".qt-turbo .qristurbo-panel{display:block}" +
        ".qt-turbo .qt-native-rest{display:none!important}" +
        ".qt-turbo .row:has(.payment-method)>[class*='col-']:not(:has(.payment-method)){display:none!important}" +
        ".qristurbo-panel.qt-hasqr .qt-fields{display:none!important}" +
        ".qristurbo-panel .form-group{margin-bottom:16px}" +
        ".qristurbo-panel label{display:block;margin-bottom:8px;font-weight:700}" +
        ".qristurbo-panel .qt-msg{display:none;margin:8px 0;color:#c62828;font-size:13px}" +
        ".qristurbo-panel .qt-msg.err{display:block}" +
        ".qristurbo-panel .qt-card{text-align:center;color:#222;padding:8px 0}" +
        ".qristurbo-panel .qt-merchant{font-size:13px;color:#666;margin-bottom:10px}" +
        ".qristurbo-panel .qt-qr{width:220px;height:220px;margin:10px auto;display:flex;align-items:center;justify-content:center;background:#fff;border:2px solid #00a2b1;border-radius:8px;padding:8px;box-sizing:content-box}" +
        ".qristurbo-panel .qt-qr canvas,.qristurbo-panel .qt-qr img{width:220px!important;height:220px!important;max-width:100%;background:#fff;display:block}" +
        ".qristurbo-panel .qt-total{display:block;font-size:22px;font-weight:800;color:#00a2b1;margin:10px 0 8px}" +
        ".qristurbo-panel .qt-kode{display:inline-block;color:#c62828;background:#fff3f3;border:1px solid #ffcdd2;border-radius:6px;padding:2px 8px;font-weight:800}" +
        ".qristurbo-panel .qt-hint{margin-top:10px;font-size:12px;color:#666;line-height:1.4}" +
        ".qristurbo-panel .qt-ok{color:#166534;padding:16px 8px;text-align:center}" +
        ".qristurbo-panel .qt-fail{color:#9f1239;padding:16px 8px;text-align:center}" +
        ".qristurbo-panel .qt-again{margin-top:12px}";
      document.head.appendChild(st);
    }

    var cfg = null;
    var pollBal = null;
    var pollHit = null;
    var cfgWaiters = [];

    function boxOf(ul) {
      var box = ul.closest(".manual-form-container-v11");
      if (box.length) return box;
      var form = ul.closest("form");
      return form.length ? form : ul.parent();
    }

    function isTurboOn() {
      return $(".qt-turbo").length > 0 || $('.payment-method li[data-type="qristurbo"].active').length > 0;
    }

    function allPanels() {
      return $(".qristurbo-panel");
    }

    function panelOf(el) {
      if (el && el.length) {
        var p = el.closest(".qristurbo-panel");
        if (p.length) return p;
        var box = el.closest(".manual-form-container-v11, form");
        if (box.length) {
          var q = box.find(".qristurbo-panel").first();
          if (q.length) return q;
        }
      }
      var vis = allPanels().filter(":visible").first();
      return vis.length ? vis : allPanels().first();
    }

    function cleanupOld() {
      $(".qris-cepat-wrapper-v11 .tab[data-target='qristurbo']").remove();
      $(".qris-cepat-wrapper-v11 > .qristurbo-form-container, .qris-cepat-wrapper-v11 .qristurbo-form-container").remove();
      $(".qt-on").removeClass("qt-on");
      $(".qt-slot, .qt-hide, .qt-catatan").removeClass("qt-slot qt-hide qt-catatan");
    }

    function dismissNativePopups() {
      $("#popup_container, #popup_overlay, #popup_ok, .jqmOverlay").hide();
      $("body").css("overflow-y", "");
    }

    function wrapNativePopups() {
      ["confirmChecking", "confirmChecking2"].forEach(function (name) {
        var orig = window[name];
        if (typeof orig !== "function" || orig.__qt) return;
        var wrapped = function () {
          if (isTurboOn()) return false;
          return orig.apply(this, arguments);
        };
        wrapped.__qt = true;
        window[name] = wrapped;
      });
      ["jAlert", "jConfirm", "jError", "jPrompt"].forEach(function (name) {
        var orig = window[name];
        if (typeof orig !== "function" || orig.__qt) return;
        var wrapped = function () {
          if (isTurboOn()) return;
          return orig.apply(this, arguments);
        };
        wrapped.__qt = true;
        window[name] = wrapped;
      });
    }

    function panelHtml() {
      return (
        '<div class="qristurbo-panel">' +
          '<div class="qt-fields">' +
            '<div class="form-group">' +
              "<label>Total (IDR)</label>" +
              '<input type="text" class="form-control qt-nominal" inputmode="numeric" autocomplete="off" placeholder="Contoh: 50.000">' +
            "</div>" +
            '<div class="form-group">' +
              "<label>Promotion</label>" +
              '<select class="form-control qt-promo"><option value="">Silahkan Pilih</option></select>' +
            "</div>" +
            '<div class="qt-msg"></div>' +
            '<button type="button" class="button button--yellow qt-btn">Buat QR</button>' +
          "</div>" +
          '<div class="qt-result"></div>' +
        "</div>"
      );
    }

    function ensurePanel(ul) {
      var box = boxOf(ul);
      var panel = box.find(".qristurbo-panel").first();
      if (!panel.length) {
        panel = $(panelHtml());
        var row = ul.closest(".row");
        var group = ul.closest(".form-group");
        if (row.length) row.after(panel);
        else if (group.length) group.after(panel);
        else ul.after(panel);
      }
      if (!box.find("> .qt-native-rest").length) {
        var rest = panel.nextAll().not(".qristurbo-panel").not(".qt-native-rest");
        if (rest.length) rest.wrapAll('<div class="qt-native-rest"></div>');
      }
      return panel;
    }

    function setTurbo(box, on) {
      box.toggleClass("qt-turbo", !!on);
      wrapNativePopups();
      if (on) loadPromo(box.find(".qristurbo-panel"));
    }

    function injectMethod(ul) {
      var sample = ul.find('li[data-type="emoney"]').first();
      if (!sample.length) sample = ul.children("li:visible").first();
      if (!sample.length) sample = ul.children("li").not('[data-type="qris"]').first();
      if (!sample.length) return false;
      var li = ul.find('li[data-type="qristurbo"]').first();
      if (!li.length) {
        li = sample.clone(false, false);
        li.removeClass("active disabled").removeAttr("onclick");
        li.removeData("type").attr("data-type", "qristurbo").data("type", "qristurbo");
        sample.before(li);
      } else if (li.next()[0] !== sample[0]) {
        sample.before(li);
      }
      if ($.trim(li.text()) !== "QRIS") li.text("QRIS");
      var disp = sample.css("display") || "list-item";
      if (disp === "none") disp = "list-item";
      li.removeClass("disabled").css({
        display: disp,
        visibility: "visible",
        opacity: 1,
        pointerEvents: "auto",
        cursor: "pointer"
      });
      ensurePanel(ul);
      return true;
    }

    function injectAll() {
      cleanupOld();
      var ok = false;
      $(".payment-method").each(function () {
        if (injectMethod($(this))) ok = true;
      });
      wrapNativePopups();
      return ok;
    }

    function showMsg(text, isErr, wrap) {
      var el = panelOf(wrap).find(".qt-msg");
      if (!text) { el.hide().removeClass("err").text(""); return; }
      el.toggleClass("err", !!isErr).text(text).show();
    }

    function stopPoll() {
      if (pollBal) clearInterval(pollBal);
      if (pollHit) clearInterval(pollHit);
      pollBal = null;
      pollHit = null;
    }

    function resetForm() {
      stopPoll();
      sessionStorage.removeItem(SESSION_KEY);
      allPanels().removeClass("qt-hasqr").each(function () {
        var wrap = $(this);
        wrap.find(".qt-fields").show();
        wrap.find(".qt-btn").prop("disabled", false).text("Buat QR");
        wrap.find(".qt-result").hide().empty();
        wrap.find(".qt-msg").hide().removeClass("err").text("");
      });
    }

    function paintStatus(html) {
      allPanels().addClass("qt-hasqr").each(function () {
        var wrap = $(this);
        wrap.find(".qt-fields").hide();
        wrap.find(".qt-result").html(html).show();
      });
    }

    function showSuccess(amount) {
      stopPoll();
      sessionStorage.removeItem(SESSION_KEY);
      paintStatus(
        '<div class="qt-card qt-ok"><strong>Deposit berhasil</strong><p>Saldo Rp ' + Number(amount).toLocaleString("id-ID") + " sudah masuk.</p></div>"
      );
      $.get("/ajax/account/getAccountDto", function (r) {
        if (r && typeof r[2] === "number") $(".g8-bal-total").text("IDR " + r[2].toLocaleString("id-ID"));
      });
    }

    function showReject(status) {
      stopPoll();
      sessionStorage.removeItem(SESSION_KEY);
      paintStatus(
        '<div class="qt-card qt-fail"><strong>Deposit ditolak</strong><p>' + esc(status || "Transaksi ditolak / dibatalkan.") + "</p>" +
        '<div class="button button--yellow qt-again">Buat QR ulang</div></div>'
      );
    }

    function startWatch(data) {
      stopPoll();
      pollBal = setInterval(function () {
        $.get("/ajax/account/getAccountDto", function (r) {
          if (r && typeof r[2] === "number" && r[2] > data.initialBalance) showSuccess(data.amount);
        });
      }, 5000);
      pollHit = setInterval(function () {
        $.get("/ajax/trans/getHistoryTransaction", todayQuery(), function (res) {
          var code = res && res.code;
          if (code !== "200" && code !== 200 && String(code) !== "200") return;
          var list = res.data || [];
          var i, row, hitOk = null, hitNo = null;
          for (i = 0; i < list.length; i++) {
            row = list[i];
            if (row.transType !== "Deposit") continue;
            if (Math.abs(Number(row.amount) - Number(data.amount)) >= 0.00001) continue;
            if (data.transId != null && String(row.transId) !== String(data.transId)) continue;
            var si = Number(row.statusInt);
            var st = String(row.status || "").toLowerCase();
            if (si === 15 || st === "approved" || st.indexOf("approve") === 0) hitOk = row;
            if (si === 30 || /\b(cancel|reject|tolak|gagal|failed)\b/.test(st)) hitNo = row;
          }
          if (hitOk) showSuccess(data.amount);
          else if (hitNo) showReject(hitNo.status);
        });
      }, 8000);
    }

    function drawQr(el, payload) {
      if (!el) return;
      el.innerHTML = "";
      var img = document.createElement("img");
      img.alt = "QRIS";
      img.width = 220;
      img.height = 220;
      img.src = "https://api.qrserver.com/v1/create-qr-code/?size=220x220&ecc=M&data=" + encodeURIComponent(payload);
      el.appendChild(img);
      waitForQRCode().then(function () {
        try {
          el.innerHTML = "";
          new QRCode(el, { text: payload, width: 220, height: 220, correctLevel: QRCode.CorrectLevel.Q });
        } catch (e) {
          el.innerHTML = "";
          el.appendChild(img);
        }
      }).catch(function () {});
    }

    function cardHtml(data) {
      var name = (cfg && cfg.merchantDisplayName) || data.merchantDisplayName || "-";
      return (
        '<div class="qt-card">' +
          '<div class="qt-merchant">Merchant: <strong>' + esc(name) + "</strong></div>" +
          '<div class="qt-qr"></div>' +
          '<strong class="qt-total">Rp ' + Number(data.amount).toLocaleString("id-ID") + "</strong>" +
          '<div>Kode unik <span class="qt-kode">' + esc(data.uniqueCode) + "</span></div>" +
          '<div class="qt-hint">Scan sesuai nominal ini. QR tidak bisa dibatalkan dari sisi member.</div>' +
        "</div>"
      );
    }

    async function showQr(data) {
      if (!cfg || !cfg.qrisString) throw new Error("Barcode QRIS belum tersedia.");
      var payload = generateQrisPayload(cfg.qrisString, data.amount);
      var html = cardHtml(data);
      var wraps = allPanels();
      if (!wraps.length) {
        injectAll();
        wraps = allPanels();
      }
      wraps.addClass("qt-hasqr").each(function () {
        var wrap = $(this);
        wrap.find(".qt-fields").hide();
        wrap.find(".qt-result").html(html).show();
        drawQr(wrap.find(".qt-qr")[0], payload);
      });
      startWatch(data);
    }

    function loadPromo(wrap) {
      wrap = wrap && wrap.length ? wrap : allPanels().filter(":visible").first();
      var sel = wrap.find(".qt-promo").first();
      if (!sel.length || !cfg || !cfg.bankId) return;
      if (sel.data("qt-loaded") === cfg.bankId) return;
      sel.data("qt-loaded", cfg.bankId);
      $.ajax({
        url: "/ajax/credit/getDepositPromotion",
        type: "GET",
        dataType: "json",
        data: { bankId: cfg.bankId },
        success: function (res) {
          sel.empty().append('<option value="">Silahkan Pilih</option>');
          if (res && res[0] === "success" && res[1] && res[1].length) {
            res[1].forEach(function (p) {
              sel.append('<option value="' + esc(p[0]) + '">' + esc(p[1]) + "</option>");
            });
          }
        }
      });
    }

    function whenCfg() {
      if (cfg) return Promise.resolve(cfg);
      return new Promise(function (resolve) { cfgWaiters.push(resolve); });
    }

    async function loadConfig() {
      var dcRes = await fetch(WORKER + "/api/deposit-config", { credentials: "omit" });
      var qcRes = await fetch(WORKER + "/api/config", { credentials: "omit" });
      var dc = await dcRes.json();
      var qc = await qcRes.json();
      cfg = {
        success: dc.success !== false,
        message: dc.message || "",
        bankId: dc.bankId,
        minDeposit: dc.minDeposit || 25000,
        maxDeposit: dc.maxDeposit || 10000000,
        uniqueCodeLength: dc.uniqueCodeLength || 2,
        qrisString: qc.qrisString || "",
        merchantDisplayName: qc.merchantDisplayName || ""
      };
      if (qc.maintenanceMode) {
        cfg.success = false;
        cfg.message = qc.maintenanceText || "Sistem pembayaran dalam pemeliharaan.";
      }
      cfgWaiters.splice(0).forEach(function (fn) { fn(cfg); });
      return cfg;
    }

    function activateTurbo(li) {
      var ul = li.closest(".payment-method");
      var box = boxOf(ul);
      box.find(".payment-method li").removeClass("active");
      li.addClass("active").removeClass("disabled");
      setTurbo(box, true);
      var saved = sessionStorage.getItem(SESSION_KEY);
      if (!saved) return;
      try {
        var data = JSON.parse(saved);
        if (data && data.qrisString && data.amount) showQr(data).catch(function () {});
      } catch (e) {}
    }

    var mountedWatch = false;
    function waitMount() {
      if (mountedWatch) {
        injectAll();
        return;
      }
      mountedWatch = true;
      if (!window.__qtCapture) {
        window.__qtCapture = true;
        document.addEventListener("click", function (e) {
          var t = e.target && e.target.closest && e.target.closest('.payment-method li[data-type="qristurbo"]');
          if (!t) return;
          e.preventDefault();
          e.stopPropagation();
          if (e.stopImmediatePropagation) e.stopImmediatePropagation();
          activateTurbo($(t));
        }, true);
      }
      injectAll();
      var tries = 0;
      var timer = setInterval(function () {
        tries++;
        injectAll();
        if (tries >= 80) clearInterval(timer);
      }, 250);
    }

    $(document).on("click", ".payment-method li", function (e) {
      var type = String($(this).data("type") || $(this).attr("data-type") || "");
      var box = boxOf($(this).closest(".payment-method"));
      if (type === "qristurbo") {
        e.preventDefault();
        e.stopImmediatePropagation();
        activateTurbo($(this));
        return false;
      }
      setTimeout(function () {
        box.find('.payment-method li[data-type="qristurbo"]').removeClass("active");
        setTurbo(box, false);
      }, 0);
    });

    $("body").on("input", ".qt-nominal", function () {
      var raw = String(this.value || "").replace(/\D/g, "");
      this.value = raw ? Number(raw).toLocaleString("id-ID") : "";
    });

    $("body").on("click", ".qt-again", function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      resetForm();
    });

    $("body").on("click", ".qt-btn", async function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      wrapNativePopups();
      var wrap = panelOf($(this));
      var btn = $(this);
      showMsg("", false, wrap);
      btn.prop("disabled", true).text("Membuat QR...");
      try {
        var readyCfg = await whenCfg();
        if (readyCfg.success === false) throw new Error(readyCfg.message || "QRIS sedang tidak tersedia.");
        if (!readyCfg.qrisString) throw new Error("Barcode QRIS belum tersedia.");
        var savedPending = sessionStorage.getItem(SESSION_KEY);
        if (savedPending) {
          var hold = JSON.parse(savedPending);
          if (hold && hold.amount) {
            await showQr(hold);
            return;
          }
        }
        var raw = String(wrap.find(".qt-nominal").val() || "").replace(/[^\d]/g, "");
        var base = parseInt(raw, 10) || 0;
        if (!base) throw new Error("Masukan nominal terlebih dahulu.");
        if (base < (readyCfg.minDeposit || 25000)) throw new Error("Minimal deposit Rp " + Number(readyCfg.minDeposit || 25000).toLocaleString("id-ID") + ".");
        if (base > (readyCfg.maxDeposit || 10000000)) throw new Error("Maksimal deposit Rp " + Number(readyCfg.maxDeposit || 10000000).toLocaleString("id-ID") + ".");
        var promoId = wrap.find(".qt-promo").val() || "";
        var code = uniqueCode(base, readyCfg.uniqueCodeLength);
        var total = base + code;
        var acc = await $.get("/ajax/account/getAccountDto");
        if (!acc || typeof acc[2] !== "number") throw new Error("Gagal membaca saldo.");
        var deposit = await $.ajax({
          type: "POST",
          url: "/ajax/cm/reqDeposit",
          data: { amount: total, bankId: readyCfg.bankId, promotionId: promoId, telcoRemark: REMARK },
          global: false
        });
        dismissNativePopups();
        if (deposit && Array.isArray(deposit) && deposit[0] === "error.ex") {
          var em = String(deposit[1] || "");
          if (/pending/i.test(em) || /Maximum 1/i.test(em)) {
            throw new Error("Masih ada deposit pending. QR baru tidak bisa dibuat sampai transaksi ditolak.");
          }
          throw new Error(em || "Deposit gagal.");
        }
        var payload = {
          amount: total,
          uniqueCode: code,
          initialBalance: acc[2],
          qrisString: readyCfg.qrisString,
          merchantDisplayName: readyCfg.merchantDisplayName
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
        await showQr(payload);
        $.ajax({
          type: "GET",
          url: "/ajax/trans/getHistoryTransaction",
          data: todayQuery(),
          global: false
        }).done(function (hres) {
          var hc = hres && hres.code;
          if (hc !== "200" && hc !== 200 && String(hc) !== "200") return;
          var rows = hres.data || [];
          var pending = rows.filter(function (t) {
            return t.transType === "Deposit" && Math.abs(Number(t.amount) - total) < 0.00001 && Number(t.statusInt) === 10;
          });
          if (!pending.length) return;
          payload.transId = pending[pending.length - 1].transId;
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
        });
      } catch (err) {
        dismissNativePopups();
        showMsg((err && (err.message || err.statusText)) || "Gagal membuat QR.", true, wrap);
        btn.prop("disabled", false).text("Buat QR");
      }
    });

    waitMount();
    loadConfig().then(function () {
      waitMount();
      var saved = sessionStorage.getItem(SESSION_KEY);
      if (!saved) return;
      try {
        var data = JSON.parse(saved);
        if (!data || !data.qrisString || !data.amount) return;
        var li = $('.payment-method li[data-type="qristurbo"]').first();
        if (li.length) activateTurbo(li);
        showQr(data).catch(function () {});
      } catch (e) {}
    }).catch(function () {});
  });
})();

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
        ".qt-wrap{display:none;color:#222!important}" +
        ".qt-on .qt-wrap{display:block!important}" +
        ".qt-on .qt-wrap ~ *{display:none!important}" +
        ".qt-on .qt-slot{display:none!important}" +
        ".qt-on .manual-form-container-v11>.form-group:not(:has(.payment-method)){display:none!important}" +
        ".qt-on .form-group:has(.bank-get):not(:has(.payment-method)):not(:has(.qt-wrap))," +
        ".qt-on .form-group:has(.amo):not(:has(.payment-method)):not(:has(.qt-wrap))," +
        ".qt-on .form-group:has(.promotionId):not(:has(.payment-method)):not(:has(.qt-wrap))," +
        ".qt-on .form-group:has([name='amount']):not(:has(.payment-method)):not(:has(.qt-wrap))," +
        ".qt-on .form-group:has([name='receipt']):not(:has(.payment-method)):not(:has(.qt-wrap))," +
        ".qt-on .form-group:has([name='telcoRemark']):not(:has(.payment-method)):not(:has(.qt-wrap))," +
        ".qt-on .form-group:has([name='note']):not(:has(.payment-method)):not(:has(.qt-wrap))," +
        ".qt-on .form-group:has([name='notes']):not(:has(.payment-method)):not(:has(.qt-wrap))," +
        ".qt-on .form-group:has([name='remark']):not(:has(.payment-method)):not(:has(.qt-wrap))," +
        ".qt-on .form-group:has(.payment-line):not(:has(.qt-wrap))," +
        ".qt-on .form-group:has(.luxeqris):not(:has(.qt-wrap))," +
        ".qt-on .form-group:has(.g8qris):not(:has(.qt-wrap)){display:none!important}" +
        ".qt-on .bank-get," +
        ".qt-on .amo," +
        ".qt-on .promotionId," +
        ".qt-on [name='amount']," +
        ".qt-on [name='receipt']," +
        ".qt-on [name='telcoRemark']," +
        ".qt-on [name='note']," +
        ".qt-on [name='notes']," +
        ".qt-on [name='remark']," +
        ".qt-on .payment-line," +
        ".qt-on .luxeqris," +
        ".qt-on .g8qris{display:none!important}" +
        ".qt-on [onclick*='confirmChecking']," +
        ".qt-on [href*='confirmChecking']{display:none!important}" +
        ".qt-on .button:not(.qt-btn):not(.qt-again):not(.payment-method *){display:none!important}" +
        ".qt-on .qt-wrap .form-group{display:block!important}" +
        ".qt-wrap.qt-hasqr .qt-fields{display:none!important}" +
        ".qt-msg{display:none;margin:8px 0;color:#c62828!important;font-size:13px}" +
        ".qt-msg.err{display:block}" +
        ".qt-result{display:none}" +
        ".qt-card{background:#fff;border:1px solid #e6e6e6;border-radius:14px;padding:16px 12px 18px;text-align:center;color:#222!important;box-shadow:0 3px 16px rgba(0,0,0,.08)}" +
        ".qt-card *{color:#222!important}" +
        ".qt-merchant{font-size:13px;margin-bottom:8px}" +
        ".qt-qr{width:220px;height:220px;margin:10px auto;display:flex;align-items:center;justify-content:center;background:#fff;border:2px solid #00a2b1;border-radius:8px;padding:8px;box-sizing:content-box}" +
        ".qt-qr canvas,.qt-qr img{width:220px!important;height:220px!important;max-width:100%;background:#fff;display:block}" +
        ".qt-total{display:block;font-size:22px;font-weight:800;margin:10px 0 6px;color:#111!important}" +
        ".qt-kode-line{font-size:14px;margin:4px 0}" +
        ".qt-kode{display:inline-block;color:#c62828!important;background:#fff3f3;border:1px solid #ffcdd2;border-radius:6px;padding:2px 8px;font-weight:800}" +
        ".qt-hint{margin-top:10px;font-size:12px;line-height:1.4;color:#666!important}" +
        ".qt-ok,.qt-fail{padding:16px 8px;text-align:center}" +
        ".qt-ok{color:#166534!important}" +
        ".qt-fail{color:#9f1239!important}" +
        ".qt-again{margin-top:12px}";
      document.head.appendChild(st);
    }

    var cfg = null;
    var pollBal = null;
    var pollHit = null;
    var $form = null;
    var cfgWaiters = [];

    function findForm(el) {
      if (el && el.length) {
        var box = el.closest("#confirm-form-2, #confirm-form, form[action*='reqDeposit'], form");
        if (box.length) return box;
      }
      var vis = $("#confirm-form-2, #confirm-form, form[action*='reqDeposit']").filter(":visible").first();
      if (vis.length) return vis;
      var f = $("#confirm-form-2, #confirm-form, form[action*='reqDeposit']").first();
      return f.length ? f : $("form").first();
    }

    function markRoots(from, on) {
      var roots = $();
      if (from && from.length) {
        roots = roots.add(from);
        roots = roots.add(from.closest("#confirm-form-2, #confirm-form, .manual-form-container-v11, form"));
        roots = roots.add(from.find("#confirm-form-2, #confirm-form, .manual-form-container-v11"));
      }
      roots = roots.add($(".qt-wrap").closest("#confirm-form-2, #confirm-form, .manual-form-container-v11, form"));
      roots.each(function () {
        $(this).toggleClass("qt-on", !!on);
      });
    }

    function tagNativeSlots(wrap) {
      if (!wrap || !wrap.length) return;
      wrap.nextAll().addClass("qt-slot");
      wrap.parent().children().each(function () {
        var el = $(this);
        if (el.is(".qt-wrap") || el.find(".payment-method, .qt-wrap").length) return;
        if (el.find(".amo, .promotionId, .bank-get, [name='amount'], [name='receipt']").length) el.addClass("qt-slot");
        if (/total|promotion|rekening|bukti|catatan/i.test(el.find("label").text() || el.text())) el.addClass("qt-slot");
      });
    }

    function allWraps() {
      return $(".qt-wrap");
    }

    function panelOf(form) {
      return (form || findForm()).find(".qt-wrap").first();
    }

    function isTurboOn(form) {
      form = form || $form;
      if (!form || !form.length) form = findForm();
      return form.hasClass("qt-on") || form.find('.payment-method li[data-type="qristurbo"]').hasClass("active");
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

    function repairOld(form) {
      if (form.data("qt-repaired")) return;
      form.data("qt-repaired", 1);
      form.find(".qt-hide, .qt-catatan").each(function () {
        this.style.removeProperty("display");
      }).removeClass("qt-hide qt-catatan");
      form.find(".qt-btn, .qt-msg, .qt-result").filter(function () {
        return !$(this).closest(".qt-wrap").length;
      }).remove();
    }

    function ensurePanel(form, ul) {
      var wrap = form.find(".qt-wrap").first();
      if (wrap.length) return wrap;
      wrap = $(
        '<div class="qt-wrap">' +
          '<div class="qt-fields">' +
            '<div class="form-group">' +
              "<label>Total (IDR)</label>" +
              '<input type="text" class="form-control qt-nominal" inputmode="numeric" autocomplete="off" placeholder="Masukan Nominal">' +
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
      if (ul.next()[0] !== wrap[0]) ul.after(wrap);
      tagNativeSlots(wrap);
      return wrap;
    }

    function setTurboMode(form, on) {
      $form = form;
      markRoots(form, on);
      wrapNativePopups();
      if (!on) return;
      form.find(".qt-wrap").each(function () { tagNativeSlots($(this)); });
      loadPromo(form);
      var saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        try {
          var data = JSON.parse(saved);
          if (data && data.qrisString && data.amount) {
            showQr(data).catch(function () {});
          }
        } catch (e) {}
      }
    }

    function activateTurbo(form, li) {
      if (!form || !form.length) form = (li && li.closest("form")) || findForm(li);
      form.find(".payment-method li").removeClass("active");
      if (li && li.length) li.addClass("active").removeClass("disabled");
      setTurboMode(form, true);
    }

    function bindTurboClick(li) {
      if (li.attr("data-qt-bound") === "1") return;
      li.attr("data-qt-bound", "1");
      li.on("mousedown.qristurbo click.qristurbo", function (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        activateTurbo($(this).closest("form"), $(this));
        return false;
      });
    }

    function injectInto(ul, form) {
      var sample = ul.find('li[data-type="emoney"]').first();
      if (!sample.length) sample = ul.children("li:visible").first();
      if (!sample.length) sample = ul.children("li").not('[data-type="qris"]').first();
      if (!sample.length) return false;
      repairOld(form);
      var li = ul.find('li[data-type="qristurbo"]').first();
      if (!li.length) {
        li = sample.clone(false, false);
        li.removeClass("active disabled").removeAttr("onclick").removeAttr("data-qt-bound");
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
      bindTurboClick(li);
      ensurePanel(form, ul);
      if (!$form || !$form.length) $form = form;
      return true;
    }

    function injectAll() {
      var ok = false;
      $(".payment-method").each(function () {
        var ul = $(this);
        var form = ul.closest("form");
        if (!form.length) form = findForm(ul);
        if (injectInto(ul, form)) ok = true;
      });
      wrapNativePopups();
      return ok;
    }

    function showMsg(text, isErr, wrap) {
      var el = (wrap && wrap.length ? wrap : panelOf($form || findForm())).find(".qt-msg");
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
      allWraps().removeClass("qt-hasqr").each(function () {
        var wrap = $(this);
        wrap.find(".qt-fields").show();
        wrap.find(".qt-btn").prop("disabled", false).text("Buat QR");
        wrap.find(".qt-result").hide().empty();
        wrap.find(".qt-msg").hide().removeClass("err").text("");
      });
    }

    function paintStatus(html) {
      allWraps().addClass("qt-hasqr").each(function () {
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
          '<div class="qt-kode-line">Kode unik <span class="qt-kode">' + esc(data.uniqueCode) + "</span></div>" +
          '<div class="qt-hint">Scan sesuai nominal ini. QR tidak bisa dibatalkan dari sisi member.</div>' +
        "</div>"
      );
    }

    async function showQr(data) {
      if (!cfg || !cfg.qrisString) throw new Error("Barcode QRIS belum tersedia.");
      var payload = generateQrisPayload(cfg.qrisString, data.amount);
      var html = cardHtml(data);
      var wraps = allWraps();
      if (!wraps.length) {
        injectAll();
        wraps = allWraps();
      }
      wraps.addClass("qt-hasqr").each(function () {
        var wrap = $(this);
        markRoots(wrap, true);
        tagNativeSlots(wrap);
        wrap.find(".qt-fields").hide();
        wrap.find(".qt-result").html(html).css("display", "block");
        drawQr(wrap.find(".qt-qr")[0], payload);
      });
      startWatch(data);
    }

    function loadPromo(form) {
      form = form || $form || findForm();
      var sel = panelOf(form).find(".qt-promo").first();
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
          var $li = $(t);
          activateTurbo(findForm($li), $li);
        }, true);
      }
      injectAll();
      var tries = 0;
      var timer = setInterval(function () {
        tries++;
        injectAll();
        if (tries >= 80) clearInterval(timer);
      }, 250);
      $(document).ajaxComplete(function (_e, _xhr, settings) {
        var u = (settings && settings.url) || "";
        if (/reqDeposit/.test(u)) return;
        if (/getDeposit|payment|bank/i.test(u)) setTimeout(injectAll, 30);
      });
    }

    $(document).on("click", ".payment-method li", function (e) {
      var type = String($(this).data("type") || $(this).attr("data-type") || "");
      var form = findForm($(this));
      if (type === "qristurbo") {
        e.preventDefault();
        e.stopImmediatePropagation();
        activateTurbo(form, $(this));
        return false;
      }
      setTimeout(function () {
        form.find('.payment-method li[data-type="qristurbo"]').removeClass("active");
        setTurboMode(form, false);
      }, 0);
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
      var wrap = $(this).closest(".qt-wrap");
      var form = findForm(wrap);
      $form = form;
      markRoots(form, true);
      tagNativeSlots(wrap);
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
        var form = findForm();
        form.find('.payment-method li[data-type="qristurbo"]').addClass("active");
        markRoots(form, true);
        $form = form;
        showQr(data).catch(function () {});
      } catch (e) {}
    }).catch(function () {});
  });
})();

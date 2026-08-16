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

  ready(function ($) {
    if (!document.getElementById("qristurbo-style")) {
      var st = document.createElement("style");
      st.id = "qristurbo-style";
      st.textContent =
        ".payment-method li[data-type='qristurbo']{visibility:visible!important;opacity:1!important}" +
        "form.qt-on [name='telcoRemark'],form.qt-on [name='note'],form.qt-on [name='notes'],form.qt-on [name='remark']{display:none!important}" +
        "form.qt-on .qt-catatan{display:none!important}" +
        ".qt-result{display:none;text-align:center;margin:12px 0}" +
        ".qt-qr{min-height:180px;display:flex;align-items:center;justify-content:center;margin:8px 0}" +
        ".qt-qr canvas,.qt-qr img{max-width:220px;background:#fff;padding:8px}" +
        ".qt-total{display:block;font-size:18px;font-weight:700;margin:6px 0}" +
        ".qt-kode{color:#c62828;font-weight:700}" +
        ".qt-msg{display:none;margin:8px 0;color:#c62828}" +
        ".qt-msg.err{display:block}" +
        ".qt-ok,.qt-fail{padding:16px 8px}" +
        ".qt-ok{color:#166534}" +
        ".qt-fail{color:#9f1239}";
      document.head.appendChild(st);
    }

    var cfg = null;
    var pollBal = null;
    var pollHit = null;
    var $form = null;

    function findForm($) {
      var f = $('form[action*="reqDeposit"], #confirm-form, #confirm-form-2').first();
      return f.length ? f : $("form").first();
    }

    function groupOf(el) {
      var box = el.closest(".form-group");
      return box.length ? box : el;
    }

    function setorEls(form) {
      return form.find("a, button, input[type=button], input[type=submit], .button, [onclick*='confirmChecking']").filter(function () {
        if ($(this).hasClass("qt-btn") || $(this).hasClass("qt-again")) return false;
        if ($(this).closest(".payment-method, .qt-result").length) return false;
        var t = String($(this).text() || $(this).val() || "").toLowerCase();
        return t.indexOf("setor") !== -1 || $(this).is("[onclick*='confirmChecking']");
      });
    }

    function hideCatatan(form) {
      form.find("[name='telcoRemark'], [name='note'], [name='notes'], [name='remark']").each(function () {
        var el = $(this);
        var box = groupOf(el);
        box.addClass("qt-catatan").hide();
        el.closest("p, tr, li").addClass("qt-catatan");
      });
      form.find("label").filter(function () {
        return /catatan/i.test($(this).text() || "");
      }).each(function () {
        groupOf($(this)).addClass("qt-catatan").hide();
      });
    }

    function hideNativeExtras(form) {
      groupOf(form.find(".bank-get")).hide();
      groupOf(form.find("[name='receipt']")).hide();
      hideCatatan(form);
      form.find(".payment-line, .luxeqris, .g8qris").hide();
      setorEls(form).hide();
    }

    function isTurboOn(form) {
      form = form || $form;
      if (!form || !form.length) form = findForm($);
      return form.find('.payment-method li[data-type="qristurbo"]').hasClass("active");
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

    function setTurboMode(form, on) {
      $form = form;
      form.toggleClass("qt-on", !!on);
      wrapNativePopups();
      var btn = form.find(".qt-btn");
      var msg = form.find(".qt-msg");
      var result = form.find(".qt-result");
      if (!on) {
        btn.hide();
        msg.hide();
        result.hide();
        form.find(".qt-catatan").removeClass("qt-catatan");
        return;
      }
      hideNativeExtras(form);
      groupOf(form.find(".amo")).show();
      groupOf(form.find(".promotionId")).show();
      if (!result.is(":visible")) {
        form.find(".amo").closest(".form-group").show();
        form.find(".promotionId").closest(".form-group").show();
        btn.show();
      }
      loadPromo();
      var saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        try {
          var data = JSON.parse(saved);
          if (data && data.qrisString && data.amount && !result.is(":visible")) {
            showQr(data).catch(function () {});
          }
        } catch (e) {}
      }
    }

    function injectInto(ul, form) {
      var sample = ul.find('li[data-type="emoney"]').first();
      if (!sample.length) sample = ul.children("li:visible").first();
      if (!sample.length) sample = ul.children("li").not('[data-type="qris"]').first();
      if (!sample.length) return false;
      var li = ul.find('li[data-type="qristurbo"]').first();
      if (!li.length) {
        li = sample.clone();
        li.removeClass("active").removeData("type").attr("data-type", "qristurbo").data("type", "qristurbo");
      }
      li.text("QRIS");
      sample.before(li);
      var disp = sample.css("display") || "list-item";
      if (disp === "none") disp = "list-item";
      li.css({ display: disp, visibility: "visible", opacity: 1 });
      if (!form.find(".qt-btn").length) {
        var setor = setorEls(form).first();
        var cls = "button button--yellow qt-btn";
        if (setor.length && setor.attr("class")) cls = setor.attr("class") + " qt-btn";
        var btn = $('<button type="button" class="' + cls + '">Buat QR</button>');
        if (setor.length) setor.after(btn);
        else form.append(btn);
        btn.hide();
      }
      if (!form.find(".qt-msg").length) form.find(".qt-btn").before('<div class="form-group qt-msg"></div>');
      if (!form.find(".qt-result").length) form.find(".qt-btn").after('<div class="form-group qt-result"></div>');
      $form = form;
      return true;
    }

    function injectAll() {
      var ok = false;
      $(".payment-method").each(function () {
        var ul = $(this);
        var form = ul.closest("form");
        if (!form.length) form = $("body");
        if (injectInto(ul, form)) ok = true;
      });
      $("form.qt-on").each(function () {
        hideNativeExtras($(this));
        dismissNativePopups();
      });
      wrapNativePopups();
      return ok;
    }

    function showMsg(text, isErr) {
      var el = ($form || findForm($)).find(".qt-msg");
      if (!text) { el.hide().text(""); return; }
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
      var form = $form || findForm($);
      form.find(".qt-result").hide().empty();
      form.find(".qt-btn").prop("disabled", false).text("Buat QR").show();
      groupOf(form.find(".amo")).show();
      groupOf(form.find(".promotionId")).show();
      showMsg("", false);
    }

    function showSuccess(amount) {
      stopPoll();
      sessionStorage.removeItem(SESSION_KEY);
      var form = $form || findForm($);
      form.find(".qt-btn").hide();
      groupOf(form.find(".amo")).hide();
      groupOf(form.find(".promotionId")).hide();
      form.find(".qt-result").html(
        '<div class="qt-ok"><strong>Deposit berhasil</strong><p>Saldo Rp ' + Number(amount).toLocaleString("id-ID") + " sudah masuk.</p></div>"
      ).show();
      $.get("/ajax/account/getAccountDto", function (r) {
        if (r && typeof r[2] === "number") $(".g8-bal-total").text("IDR " + r[2].toLocaleString("id-ID"));
      });
    }

    function showReject(status) {
      stopPoll();
      sessionStorage.removeItem(SESSION_KEY);
      var form = $form || findForm($);
      form.find(".qt-btn").hide();
      groupOf(form.find(".amo")).hide();
      groupOf(form.find(".promotionId")).hide();
      form.find(".qt-result").html(
        '<div class="qt-fail"><strong>Deposit ditolak</strong><p>' + esc(status || "Transaksi ditolak / dibatalkan.") + "</p>" +
        '<div class="button button--yellow qt-again">Buat QR ulang</div></div>'
      ).show();
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

    async function showQr(data) {
      await waitForQRCode();
      var form = $form || findForm($);
      var payload = generateQrisPayload(cfg.qrisString, data.amount);
      groupOf(form.find(".amo")).hide();
      groupOf(form.find(".promotionId")).hide();
      form.find(".qt-btn").hide();
      showMsg("", false);
      var box = form.find(".qt-result");
      box.html(
        '<div>Merchant: <strong>' + esc(cfg.merchantDisplayName || "-") + "</strong></div>" +
        '<div class="qt-qr"></div>' +
        '<strong class="qt-total">Rp ' + Number(data.amount).toLocaleString("id-ID") + "</strong>" +
        '<div>Kode unik <span class="qt-kode">' + data.uniqueCode + "</span> &bull; Scan sesuai nominal ini</div>" +
        '<div style="margin-top:10px;font-size:13px;color:#666">Menunggu pembayaran. QR tidak bisa dibatalkan dari sisi member.</div>'
      ).show();
      new QRCode(box.find(".qt-qr")[0], { text: payload, width: 220, height: 220, correctLevel: QRCode.CorrectLevel.Q });
      startWatch(data);
    }

    function loadPromo() {
      var form = $form || findForm($);
      var sel = form.find(".promotionId").first();
      if (!sel.length || !cfg || !cfg.bankId) return;
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
      return cfg;
    }

    var mountedWatch = false;
    function waitMount() {
      if (mountedWatch) {
        injectAll();
        return;
      }
      mountedWatch = true;
      injectAll();
      var tries = 0;
      var timer = setInterval(function () {
        tries++;
        injectAll();
        if (tries >= 150) clearInterval(timer);
      }, 200);
      $(document).ajaxComplete(function (_e, _xhr, settings) {
        var u = (settings && settings.url) || "";
        if (/deposit|getDeposit|payment|bank/i.test(u)) setTimeout(injectAll, 30);
      });
      if (typeof MutationObserver !== "undefined") {
        var scheduled = null;
        var obs = new MutationObserver(function () {
          if (scheduled) return;
          scheduled = setTimeout(function () {
            scheduled = null;
            injectAll();
          }, 80);
        });
        obs.observe(document.body, { childList: true, subtree: true });
      }
    }

    $(document).on("click", ".payment-method li", function () {
      var form = $(this).closest("form");
      var type = String($(this).data("type") || $(this).attr("data-type") || "");
      var isTurbo = type === "qristurbo";
      var li = form.find('.payment-method li[data-type="qristurbo"]');
      setTimeout(function () {
        if (isTurbo) {
          form.find(".payment-method li").removeClass("active");
          li.addClass("active");
        } else {
          li.removeClass("active");
        }
        setTurboMode(form, isTurbo);
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
      if (!cfg) return;
      var form = $(this).closest("form");
      if (!form.length) form = findForm($);
      $form = form;
      var btn = $(this);
      showMsg("", false);
      if (cfg.success === false) { showMsg(cfg.message, true); return; }
      if (!cfg.qrisString) { showMsg("Barcode QRIS belum tersedia.", true); return; }
      var savedPending = sessionStorage.getItem(SESSION_KEY);
      if (savedPending) {
        try {
          var hold = JSON.parse(savedPending);
          if (hold && hold.amount) {
            showQr(hold).catch(function () {});
            return;
          }
        } catch (e0) {}
      }
      var raw = String(form.find(".amo").val() || "").replace(/[^\d]/g, "");
      var base = parseInt(raw, 10) || 0;
      if (!base) { showMsg("Masukan nominal terlebih dahulu.", true); return; }
      if (base < (cfg.minDeposit || 25000)) { showMsg("Minimal deposit Rp " + Number(cfg.minDeposit || 25000).toLocaleString("id-ID") + ".", true); return; }
      if (base > (cfg.maxDeposit || 10000000)) { showMsg("Maksimal deposit Rp " + Number(cfg.maxDeposit || 10000000).toLocaleString("id-ID") + ".", true); return; }
      var promoId = form.find(".promotionId").val() || "";
      var code = uniqueCode(base, cfg.uniqueCodeLength);
      var total = base + code;
      btn.prop("disabled", true).text("Membuat QR...");
      try {
        var acc = await $.get("/ajax/account/getAccountDto");
        if (!acc || typeof acc[2] !== "number") throw new Error("Gagal membaca saldo.");
        form.find('[name="telcoRemark"]').val(REMARK);
        hideCatatan(form);
        var deposit = await $.ajax({
          type: "POST",
          url: "/ajax/cm/reqDeposit",
          data: { amount: total, bankId: cfg.bankId, promotionId: promoId, telcoRemark: REMARK },
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
          qrisString: cfg.qrisString,
          merchantDisplayName: cfg.merchantDisplayName
        };
        $.ajax({
          type: "GET",
          url: "/ajax/trans/getHistoryTransaction",
          data: todayQuery(),
          global: false
        }).done(function (hres) {
          var hc = hres && hres.code;
          if (hc === "200" || hc === 200 || String(hc) === "200") {
            var rows = hres.data || [];
            var pending = rows.filter(function (t) {
              return t.transType === "Deposit" && Math.abs(Number(t.amount) - total) < 0.00001 && Number(t.statusInt) === 10;
            });
            if (pending.length) payload.transId = pending[pending.length - 1].transId;
          }
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
          showQr(payload).catch(function (err) { showMsg(err.message, true); });
        }).fail(function () {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
          showQr(payload).catch(function (err) { showMsg(err.message, true); });
        });
      } catch (err) {
        dismissNativePopups();
        showMsg((err && (err.message || err.statusText)) || "Gagal membuat QR.", true);
        btn.prop("disabled", false).text("Buat QR");
      }
    });

    waitMount();
    loadConfig().then(function () {
      waitMount();
      var saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        try {
          var data = JSON.parse(saved);
          if (data && data.qrisString && data.amount) {
            findForm($).find('.payment-method li[data-type="qristurbo"]').trigger("click");
            showQr(data).catch(function () {});
          }
        } catch (e) {}
      }
    }).catch(function () {});
  });
})();

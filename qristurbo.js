(() => {
  const WORKER = "https://qriscepat.jasjusweb.workers.dev";
  const SESSION_KEY = "activeQrDataTurbo";
  if (!/\/secure\/admin\/deposit/.test(location.pathname)) return;
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
        ".qt-app{margin:0 0 16px}" +
        ".qt-card{background:#fff;border:1px solid #e6e6e6;border-radius:14px;padding:18px;box-shadow:0 3px 16px rgba(0,0,0,.06)}" +
        ".qt-card h3{margin:0 0 14px;font-size:16px;color:#102033}" +
        ".qt-field{margin:0 0 12px}" +
        ".qt-field label{display:block;font-weight:600;font-size:13px;margin:0 0 6px;color:#555}" +
        ".qt-amount{display:flex;align-items:stretch;border:1px solid #ddd;border-radius:10px;overflow:hidden}" +
        ".qt-amount span{display:flex;align-items:center;padding:0 12px;background:#f8f9fa;font-weight:700;color:#666}" +
        ".qt-amount input,.qt-card select{width:100%;height:42px;border:0;padding:0 12px;font-size:15px;background:#fff}" +
        ".qt-card select{border:1px solid #ddd;border-radius:10px}" +
        ".qt-msg{display:none;margin:0 0 10px;padding:10px 12px;border-radius:8px;font-size:13px}" +
        ".qt-msg.err{display:block;background:#fff5f5;border:1px solid #ffd6d6;color:#c62828}" +
        ".qt-btn{width:100%;height:44px;border:0;border-radius:10px;background:#00a2b1;color:#fff;font-weight:700;cursor:pointer}" +
        ".qt-btn:disabled{opacity:.7;cursor:wait}" +
        ".qt-result{display:none;text-align:center}" +
        ".qt-qr{min-height:200px;display:flex;align-items:center;justify-content:center;margin:8px 0}" +
        ".qt-qr canvas,.qt-qr img{max-width:220px;border:2px solid #00a2b1;border-radius:8px;padding:8px;background:#fff}" +
        ".qt-total{display:block;font-size:22px;font-weight:800;color:#00a2b1;margin:6px 0}" +
        ".qt-kode{color:#c62828;font-weight:700}" +
        ".qt-ok,.qt-fail{padding:22px 10px;border-radius:12px}" +
        ".qt-ok{background:#f0fff4;color:#166534}" +
        ".qt-fail{background:#fff5f5;color:#9f1239}" +
        ".qt-again{margin-top:12px;background:#00a2b1;color:#fff;border:0;border-radius:8px;padding:10px 14px;font-weight:700;cursor:pointer}";
      document.head.appendChild(st);
    }

    var cfg = null;
    var pollBal = null;
    var pollHit = null;
    var $root = null;

    function uiHtml() {
      return '<div class="qt-app" data-qristurbo="1">' +
        '<div class="qt-card">' +
        '<div class="qt-input">' +
        '<h3>QRIS TURBO</h3>' +
        '<div class="qt-field"><label>Masukan nominal</label><div class="qt-amount"><span>Rp</span><input class="qt-nominal" inputmode="numeric" placeholder="Contoh: 50000" autocomplete="off"></div></div>' +
        '<div class="qt-field"><label>Pilih promo (opsional)</label><select class="qt-promo"><option value="">-- Tanpa Bonus --</option></select></div>' +
        '<div class="qt-msg"></div>' +
        '<button type="button" class="qt-btn">Buat QR</button>' +
        "</div>" +
        '<div class="qt-result"></div>' +
        "</div></div>";
    }

    function findForm($) {
      var f = $('form[action*="reqDeposit"], #confirm-form, #confirm-form-2').first();
      return f.length ? f : $("form").first();
    }

    function showMsg(text, isErr) {
      var el = $root.find(".qt-msg");
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
      $root.find(".qt-result").hide().empty();
      $root.find(".qt-input").show();
      $root.find(".qt-btn").prop("disabled", false).text("Buat QR");
      showMsg("", false);
    }

    function showSuccess(amount) {
      stopPoll();
      sessionStorage.removeItem(SESSION_KEY);
      $root.find(".qt-input").hide();
      $root.find(".qt-result").html(
        '<div class="qt-ok"><h3>Deposit berhasil</h3><p>Saldo <strong>Rp ' + Number(amount).toLocaleString("id-ID") + "</strong> sudah masuk.</p></div>"
      ).show();
      $.get("/ajax/account/getAccountDto", function (r) {
        if (r && typeof r[2] === "number") $(".g8-bal-total").text("IDR " + r[2].toLocaleString("id-ID"));
      });
    }

    function showReject(status) {
      stopPoll();
      sessionStorage.removeItem(SESSION_KEY);
      $root.find(".qt-input").hide();
      $root.find(".qt-result").html(
        '<div class="qt-fail"><h3>Deposit ditolak</h3><p>' + esc(status || "Transaksi ditolak / dibatalkan.") + "</p>" +
        '<button type="button" class="qt-again">Buat QR ulang</button></div>'
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
      var payload = generateQrisPayload(cfg.qrisString, data.amount);
      $root.find(".qt-input").hide();
      var box = $root.find(".qt-result");
      box.html(
        '<div class="qt-merchant">Merchant: <strong>' + esc(cfg.merchantDisplayName || "-") + "</strong></div>" +
        '<div class="qt-qr"></div>' +
        '<strong class="qt-total">Rp ' + Number(data.amount).toLocaleString("id-ID") + "</strong>" +
        '<div>Kode unik <span class="qt-kode">' + data.uniqueCode + "</span> &bull; Scan sesuai nominal ini</div>" +
        '<button type="button" class="qt-again" style="margin-top:14px">Batal / buat ulang</button>'
      ).show();
      new QRCode(box.find(".qt-qr")[0], { text: payload, width: 220, height: 220, correctLevel: QRCode.CorrectLevel.Q });
      startWatch(data);
    }

    function loadPromo() {
      var sel = $root.find(".qt-promo");
      if (!cfg || !cfg.bankId) return;
      $.ajax({
        url: "/ajax/credit/getDepositPromotion",
        type: "GET",
        dataType: "json",
        data: { bankId: cfg.bankId },
        success: function (res) {
          sel.empty().append('<option value="">-- Tanpa Bonus --</option>');
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
      cfg = Object.assign({}, dc, {
        qrisString: qc.qrisString || "",
        merchantDisplayName: qc.merchantDisplayName || "",
        uniqueCodeLength: dc.uniqueCodeLength || 2
      });
      if (qc.maintenanceMode) {
        cfg.success = false;
        cfg.message = qc.maintenanceText || "Sistem pembayaran dalam pemeliharaan.";
      }
      return cfg;
    }

    function mount() {
      if ($(".qt-app").length) return;
      var form = findForm($);
      $root = $(uiHtml());
      var overlay = $(".qris-cepat-wrapper-v11").first();
      if (overlay.length) {
        if (!overlay.find('.tab[data-target="qristurbo"]').length) {
          overlay.find(".depo-tabs").append('<button type="button" class="tab" data-target="qristurbo">QRIS TURBO</button>');
        }
        overlay.append($root.hide());
      } else if (form.length) {
        form.prepend($root);
        $(".payment-method li[data-type=qris]").show().css("display", "").each(function () {
          $(this).parent().prepend(this);
        });
        $root.hide();
      } else {
        $("body").prepend($root);
      }
      loadPromo();
      if (!$(".qris-cepat-wrapper-v11").length) {
        $(".payment-method li[data-type=qris]").first().trigger("click");
      }
    }

    $("body").on("click", ".qris-cepat-wrapper-v11 .tab", function () {
      var t = $(this).data("target");
      var wrap = $(this).closest(".qris-cepat-wrapper-v11");
      wrap.find(".qt-app").toggle(t === "qristurbo");
      if (t === "qristurbo") {
        wrap.find(".tab").removeClass("active");
        $(this).addClass("active");
        wrap.find(".manual-form-container-v11, .qris-form-container, .qris2-form-container").hide();
      }
    });

    $(document).on("click", ".payment-method li", function () {
      if (!$root || !$root.length) return;
      if ($(".qris-cepat-wrapper-v11").length) return;
      var isQris = $(this).data("type") === "qris";
      var form = $(this).closest("form");
      $root.toggle(isQris);
      if (isQris) {
        form.find(".payment-line, .luxeqris, .g8qris").hide();
        form.find(".bank-get").closest(".form-group").hide();
        form.find('[name="receipt"]').closest(".form-group").hide();
        form.find(".amo").closest(".form-group").hide();
        form.find(".promotionId").closest(".form-group").hide();
        form.find(".button, [onclick*='confirmChecking']").filter(function () {
          return $(this).closest(".qt-app").length === 0 && ($(this).is("[onclick]") || $(this).text().toLowerCase().indexOf("setor") !== -1);
        }).hide();
      }
    });

    $("body").on("input", ".qt-nominal", function () {
      var raw = String($(this).val() || "").replace(/[^\d]/g, "");
      var n = parseInt(raw, 10) || 0;
      $(this).val(raw ? n.toLocaleString("id-ID") : "");
    });

    $("body").on("click", ".qt-again", function () { resetForm(); });

    $("body").on("click", ".qt-btn", async function () {
      if (!cfg) return;
      var btn = $(this);
      showMsg("", false);
      if (cfg.success === false) { showMsg(cfg.message, true); return; }
      var raw = String($root.find(".qt-nominal").val() || "").replace(/[^\d]/g, "");
      var base = parseInt(raw, 10) || 0;
      if (!base) { showMsg("Masukan nominal terlebih dahulu.", true); return; }
      if (base < (cfg.minDeposit || 25000)) { showMsg("Minimal deposit Rp " + Number(cfg.minDeposit || 25000).toLocaleString("id-ID") + ".", true); return; }
      if (base > (cfg.maxDeposit || 10000000)) { showMsg("Maksimal deposit Rp " + Number(cfg.maxDeposit || 10000000).toLocaleString("id-ID") + ".", true); return; }
      var promoId = $root.find(".qt-promo").val() || "";
      var code = uniqueCode(base, cfg.uniqueCodeLength);
      var total = base + code;
      btn.prop("disabled", true).text("Membuat QR...");
      try {
        var acc = await $.get("/ajax/account/getAccountDto");
        if (!acc || typeof acc[2] !== "number") throw new Error("Gagal membaca saldo.");
        var remark = cfg.telcoRemark || "QRIS TURBO";
        var form = findForm($);
        form.find('input[name="telcoRemark"]').val(remark);
        var deposit = await $.ajax({
          type: "POST",
          url: "/ajax/cm/reqDeposit",
          data: { amount: total, bankId: cfg.bankId, promotionId: promoId, telcoRemark: remark }
        });
        if (deposit && Array.isArray(deposit) && deposit[0] === "error.ex") {
          throw new Error(deposit[1] || "Deposit gagal.");
        }
        var payload = {
          amount: total,
          uniqueCode: code,
          initialBalance: acc[2],
          qrisString: cfg.qrisString,
          merchantDisplayName: cfg.merchantDisplayName
        };
        $.get("/ajax/trans/getHistoryTransaction", todayQuery(), function (hres) {
          var hc = hres && hres.code;
          if (hc === "200" || hc === 200 || String(hc) === "200") {
            var rows = hres.data || [];
            var pending = rows.filter(function (t) {
              return t.transType === "Deposit" && Math.abs(Number(t.amount) - total) < 0.00001 && Number(t.statusInt) === 10;
            });
            if (pending.length) payload.transId = pending[pending.length - 1].transId;
          }
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
          showQr(payload).catch(function (e) { showMsg(e.message, true); });
        }).fail(function () {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
          showQr(payload).catch(function (e) { showMsg(e.message, true); });
        });
      } catch (e) {
        showMsg((e && (e.message || e.statusText)) || "Gagal membuat QR.", true);
        btn.prop("disabled", false).text("Buat QR");
      }
    });

    loadConfig().then(function () {
      mount();
      var saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        try {
          var data = JSON.parse(saved);
          if (data && data.qrisString && data.amount) {
            $(".qris-cepat-wrapper-v11 .tab[data-target=qristurbo]").trigger("click");
            $root.show();
            showQr(data).catch(function () {});
          }
        } catch (e) {}
      }
    }).catch(function () {});
  });
})();

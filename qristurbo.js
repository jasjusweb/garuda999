(() => {
  const WORKER = "https://qriscepat.jasjusweb.workers.dev";
  const STYLE_ID = "qristurbo-native-style";
  if (!/\/secure\/admin\/deposit/.test(location.pathname)) return;
  if (window.__qristurboNativeBound) return;
  window.__qristurboNativeBound = true;

  function ready(fn) {
    if (window.jQuery) { fn(window.jQuery); return; }
    const t = setInterval(() => {
      if (window.jQuery) { clearInterval(t); fn(window.jQuery); }
    }, 50);
  }

  function crc16(data) {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
      crc ^= data.charCodeAt(i) << 8;
      for (let b = 0; b < 8; b++) crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
    }
    return ("0000" + (crc & 0xFFFF).toString(16).toUpperCase()).slice(-4);
  }
  function generateQrisPayload(o, a) {
    const t = "5802ID";
    let s = String(o || "").trim();
    if (s.length > 8 && s.slice(-8, -4) === "6304") s = s.slice(0, -8);
    const i = s.indexOf(t);
    if (i === -1) throw new Error("Format qrisString tidak valid.");
    const m = String(a);
    const n = "54" + String(m.length).padStart(2, "0") + m;
    const r = s.substring(0, i) + n + s.substring(i) + "6304";
    return r + crc16(r);
  }
  function makeUniqueCode(baseAmount, length) {
    if (baseAmount === 10000000) return 0;
    const n = Math.min(3, Math.max(1, parseInt(length, 10) || 2));
    const min = n === 1 ? 1 : Math.pow(10, n - 1);
    const max = Math.pow(10, n) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function waitForQRCode(timeoutMs) {
    return new Promise(function (resolve, reject) {
      if (typeof QRCode !== "undefined") { resolve(); return; }
      if (!document.querySelector('script[data-qristurbo-qrcode]')) {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js";
        s.async = true;
        s.setAttribute("data-qristurbo-qrcode", "1");
        document.head.appendChild(s);
      }
      const start = Date.now();
      const t = setInterval(function () {
        if (typeof QRCode !== "undefined") { clearInterval(t); resolve(); }
        else if (Date.now() - start > (timeoutMs || 8000)) { clearInterval(t); reject(new Error("Library QRCode gagal dimuat.")); }
      }, 50);
    });
  }

  ready(function ($) {
    if (!document.getElementById(STYLE_ID)) {
      const st = document.createElement("style");
      st.id = STYLE_ID;
      st.textContent = '.payment-method li[data-type="qris"]{display:list-item!important}' +
        ".qristurbo-box{margin:10px 0 14px;padding:14px;border:1px solid #00a2b1;border-radius:12px;background:#f8fdfe;text-align:center}" +
        ".qristurbo-box .qt-qr{min-height:180px;display:flex;align-items:center;justify-content:center}" +
        ".qristurbo-box canvas,.qristurbo-box img{max-width:220px;height:auto;border-radius:8px;background:#fff}" +
        ".qristurbo-info{margin-top:8px;font-size:13px;color:#444}" +
        ".qristurbo-info b.kode{color:#c62828}" +
        ".qristurbo-info b.total{color:#00a2b1;font-size:18px;display:block;margin-top:4px}";
      document.head.appendChild(st);
    }

    let cfg = null;
    let reserveTimer = null;

    async function loadConfig() {
      const [dcRes, qcRes] = await Promise.all([
        fetch(WORKER + "/api/deposit-config", { credentials: "omit" }),
        fetch(WORKER + "/api/config", { credentials: "omit" }),
      ]);
      const dc = await dcRes.json();
      const qc = await qcRes.json();
      cfg = Object.assign({}, dc, {
        qrisString: qc.qrisString || dc.qrisString || "",
        merchantDisplayName: qc.merchantDisplayName || dc.merchantDisplayName || "",
        enableNativeQrisTab: dc.enableNativeQrisTab !== false,
        uniqueCodeLength: dc.uniqueCodeLength || 2,
      });
      if (qc.maintenanceMode) {
        cfg.success = false;
        cfg.message = qc.maintenanceText || dc.maintenanceText || "Sistem pembayaran dalam pemeliharaan.";
      }
      return cfg;
    }

    function qrisBoxHtml() {
      return '<div class="qristurbo-box" data-qristurbo="1">' +
        '<div class="qt-qr"><i class="fa fa-spinner fa-spin"></i> Menyiapkan QRIS...</div>' +
        '<div class="qristurbo-info">Pilih / ketik nominal. Sistem menambahkan kode unik 2 digit.</div>' +
        "</div>";
    }

    function ensureBox(form) {
      let box = form.find(".qristurbo-box");
      if (!box.length) {
        const host = form.find(".luxeqris, .g8qris, .payment-line").first();
        if (host.length) host.before(qrisBoxHtml());
        else form.find(".amo").closest(".form-group").before(qrisBoxHtml());
        box = form.find(".qristurbo-box");
      }
      return box;
    }

    async function renderQr(form, total) {
      const box = ensureBox(form);
      const hold = box.find(".qt-qr");
      if (!cfg || !cfg.qrisString) {
        hold.html('<span style="color:#c62828">QRIS string belum tersedia dari API.</span>');
        return;
      }
      try {
        await waitForQRCode(8000);
        const payload = generateQrisPayload(cfg.qrisString, total);
        hold.empty();
        new QRCode(hold[0], { text: payload, width: 220, height: 220, correctLevel: QRCode.CorrectLevel.Q });
      } catch (e) {
        hold.html('<span style="color:#c62828">' + (e && e.message ? e.message : "Gagal membuat QR") + "</span>");
      }
    }

    async function reserveFor(form, baseAmount) {
      if (cfg && cfg.success === false) throw new Error(cfg.message || "Sistem pembayaran dalam pemeliharaan.");
      if (baseAmount < (cfg.minDeposit || 25000)) throw new Error("Minimal deposit Rp " + Number(cfg.minDeposit || 25000).toLocaleString("id-ID"));
      if (baseAmount > (cfg.maxDeposit || 10000000)) throw new Error("Maksimal deposit Rp " + Number(cfg.maxDeposit || 10000000).toLocaleString("id-ID"));
      const amo = form.find(".amo");
      let uniqueCode = parseInt(amo.data("qris-code"), 10);
      const prevBase = parseInt(amo.data("qris-base"), 10);
      if (!uniqueCode || prevBase !== baseAmount) {
        uniqueCode = makeUniqueCode(baseAmount, cfg.uniqueCodeLength || 2);
      }
      const totalAmount = baseAmount + uniqueCode;
      amo.data("qris-total", totalAmount);
      amo.data("qris-code", uniqueCode);
      amo.data("qris-base", baseAmount);
      const box = ensureBox(form);
      const merchant = cfg.merchantDisplayName ? '<div style="margin-top:6px;font-size:12px;color:#666">Merchant: <strong>' + String(cfg.merchantDisplayName).replace(/</g,"&lt;") + "</strong></div>" : "";
      box.find(".qristurbo-info").html(
        'Kode unik: <b class="kode">' + uniqueCode + "</b> &bull; Transfer tepat " +
        '<b class="total">Rp ' + Number(totalAmount).toLocaleString("id-ID") + "</b>" +
        merchant +
        '<div style="margin-top:6px;font-size:12px;color:#666">Scan barcode, nominal sudah sesuai kode unik.</div>'
      );
      await renderQr(form, totalAmount);
      if (cfg && cfg.bankId) {
        const sel = form.find(".bank-get");
        if (sel.find('option[value="' + cfg.bankId + '"]').length === 0) {
          sel.append('<option value="' + cfg.bankId + '">QRIS STATIC</option>');
        }
        sel.val(cfg.bankId);
        form.find('input[name="telcoRemark"]').val(cfg.telcoRemark || "QRIS STATIC");
      }
      return { uniqueCode: uniqueCode, totalAmount: totalAmount };
    }

    function activate(form) {
      form.find(".payment-line").hide();
      form.find(".bank-get").closest(".form-group").hide();
      form.find('[name="receipt"]').closest(".form-group").hide();
      form.find(".luxeqris, .g8qris").hide();
      ensureBox(form).show();
      const raw = String(form.find(".amo").val() || "").replace(/[^\d]/g, "");
      const nominal = parseInt(raw, 10) || 0;
      if (nominal >= (cfg && cfg.minDeposit || 25000)) {
        clearTimeout(reserveTimer);
        reserveTimer = setTimeout(function () { reserveFor(form, nominal).catch(function (e) {
          ensureBox(form).find(".qristurbo-info").text(e.message || "Gagal kode unik");
        }); }, 250);
      }
    }

    function deactivate(form) {
      form.find(".qristurbo-box").hide();
      form.find(".bank-get").closest(".form-group").show();
      form.find('[name="receipt"]').closest(".form-group").show();
      form.find(".amo").removeData("qris-total qris-code qris-base");
    }

    function showNativeTab() {
      $(".payment-method li[data-type=qris]").each(function () {
        $(this).show().css("display", "");
        $(this).parent().prepend(this);
      });
      $(".payment-method:visible").each(function () {
        const ul = $(this);
        if (!ul.find("li.active:visible").length) {
          ul.find('li[data-type="qris"]').trigger("click");
        }
      });
    }

    $(document).on("click", ".payment-method li", function () {
      const form = $(this).closest("form");
      if ($(this).data("type") === "qris") activate(form);
      else deactivate(form);
    });

    $(document).on("input", "form .amo", function () {
      const form = $(this).closest("form");
      if (!form.find('.payment-method li[data-type="qris"]').hasClass("active")) return;
      const raw = String($(this).val() || "").replace(/[^\d]/g, "");
      const nominal = parseInt(raw, 10) || 0;
      clearTimeout(reserveTimer);
      if (!cfg || nominal < (cfg.minDeposit || 25000)) return;
      reserveTimer = setTimeout(function () {
        reserveFor(form, nominal).catch(function (e) {
          ensureBox(form).find(".qristurbo-info").text(e.message || "Gagal kode unik");
        });
      }, 400);
    });

    function wrapConfirm(name) {
      const orig = window[name];
      if (typeof orig !== "function" || orig.__qristurbo) return;
      const wrapped = function () {
        const form = name === "confirmChecking2" ? $("#confirm-form-2") : $("#confirm-form");
        if (form.find('.payment-method li[data-type="qris"]').hasClass("active")) {
          const total = form.find(".amo").data("qris-total");
          if (!total) {
            alert("Isi nominal QRIS dulu agar kode unik terbit.");
            return false;
          }
          form.find(".amo").val(total);
          if (cfg && cfg.bankId) form.find(".bank-get").val(cfg.bankId);
        }
        return orig.apply(this, arguments);
      };
      wrapped.__qristurbo = true;
      window[name] = wrapped;
    }
    wrapConfirm("confirmChecking");
    wrapConfirm("confirmChecking2");

    $(document).ajaxComplete(function (_e, _xhr, settings) {
      if (settings && /getDepositView/.test(settings.url || "")) {
        setTimeout(showNativeTab, 50);
        setTimeout(showNativeTab, 400);
      }
    });

    loadConfig().then(function () {
      showNativeTab();
      $("form").each(function () {
        if ($(this).find('.payment-method li[data-type="qris"].active').length) activate($(this));
      });
    }).catch(function () {});
  });
})();

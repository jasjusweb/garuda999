(function ($) {
  if (!$ || !$.fn) return;

  function path() {
    return String(location.pathname || "/").toLowerCase();
  }

  function isRegisterPage() {
    var p = path();
    if (p === "/register" || p === "/register.html" || p.indexOf("/register") === 0) return true;
    if (document.getElementById("ajax-form-join-special")) return true;
    if (document.getElementById("ajax-form-join-mob")) return true;
    if (document.querySelector('form[action*="/func/account/register"]')) return true;
    return false;
  }

  var MSG_MAP = [
    // error.ex server — per field, jangan digabung generic
    [
      /User\s*name is invalid,?\s*cannot duplicate\.?/i,
      "Username / ID sudah terdaftar. Silakan pakai ID lain.",
    ],
    [
      /Username is invalid,?\s*cannot duplicate\.?/i,
      "Username / ID sudah terdaftar. Silakan pakai ID lain.",
    ],
    [
      /Email is invalid,?\s*cannot duplicate\.?/i,
      "Email sudah terdaftar. Silakan pakai email lain.",
    ],
    [
      /Mobile( number)? is invalid,?\s*cannot duplicate\.?/i,
      "Nomor handphone sudah terdaftar. Silakan pakai nomor lain.",
    ],
    [
      /Contact Number is invalid,?\s*cannot duplicate\.?/i,
      "Nomor handphone sudah terdaftar. Silakan pakai nomor lain.",
    ],
    [
      /Bank Account No\.?\s*is invalid,?\s*cannot duplicate\.?/i,
      "Nomor rekening sudah terdaftar. Silakan pakai rekening lain.",
    ],
    [
      /Bank Account Name is invalid,?\s*cannot duplicate\.?/i,
      "Nama rekening sudah terdaftar. Silakan cek kembali.",
    ],
    [
      /Bank account is invalid,?\s*cannot duplicate\.?/i,
      "Rekening bank sudah terdaftar. Silakan pakai rekening lain.",
    ],
    // fallback field + duplicate (kalau format beda sedikit)
    [
      /Bank Account No\.?\s*(already )?(exist|exists|duplicated?)\.?/i,
      "Nomor rekening sudah terdaftar.",
    ],
    [
      /Bank account (already )?(exist|exists|duplicated?)\.?/i,
      "Rekening bank sudah terdaftar.",
    ],
    [
      /User\s*name (already )?(exist|exists)\.?/i,
      "Username / ID sudah terdaftar.",
    ],
    [/Username (already )?(exist|exists)\.?/i, "Username / ID sudah terdaftar."],
    [/Invalid username\.?/i, "Username tidak valid."],
    [/Email (already )?(exist|exists)\.?/i, "Email sudah terdaftar."],
    [/Invalid email\.?/i, "Email tidak valid."],
    [
      /Mobile( number)? (already )?(exist|exists)\.?/i,
      "Nomor handphone sudah terdaftar.",
    ],
    [/Invalid (mobile|phone|contact).*/i, "Nomor handphone tidak valid."],
    [
      /Contact Number (already )?(exist|exists)\.?/i,
      "Nomor handphone sudah terdaftar.",
    ],
    [
      /Bank Account Name.*(invalid|already).*/i,
      "Nama rekening tidak valid atau sudah terdaftar.",
    ],
    // generic "cannot duplicate" HANYA jika tidak ketahuan field-nya
    [
      /^[^.]{0,80}cannot duplicate\.?$/i,
      "Data sudah terdaftar. Cek username, email, nomor HP, atau rekening.",
    ],
    [
      /Welcome\.?\s*Your registration is successful\.?\s*Kindly login using your username and password\.?/i,
      "Pendaftaran berhasil. Silakan masuk dengan username dan password Anda.",
    ],
    [/Please enter at least\s*(\d+)\s*characters?\.?/i, "Minimal $1 karakter."],
    [/Please enter no more than\s*(\d+)\s*characters?\.?/i, "Maksimal $1 karakter."],
    [/This field is required\.?/i, "Wajib diisi."],
    [/Please fill out this field\.?/i, "Wajib diisi."],
    [/Please enter the same value again\.?/i, "Password tidak cocok."],
    [/Please enter a valid email address\.?/i, "Masukkan alamat email yang valid."],
    [/Please enter a valid number\.?/i, "Masukkan angka yang valid."],
    [/Passwords? (do not|don't) match\.?/i, "Password tidak cocok."],
    [/Invalid password\.?/i, "Password tidak valid."],
  ];

  function fieldLabel(key) {
    var map = {
      Username: "Username / ID",
      "User name": "Username / ID",
      Email: "Email",
      Password: "Password",
      confirmPassword: "Konfirmasi Password",
      "Confirm Password": "Konfirmasi Password",
      Mobile: "Nomor HP",
      mobile: "Nomor HP",
      "Contact Number": "Nomor HP",
      Bank: "Bank",
      accNo: "Nomor Rekening",
      "Bank Account No": "Nomor Rekening",
      "Bank Account No.": "Nomor Rekening",
      bankAccName: "Nama Rekening",
      "Bank Account Name": "Nama Rekening",
    };
    return map[key] || key;
  }

  function translateFieldMsg(key, msg) {
    var raw = String(msg == null ? "" : msg).trim();
    var k = String(key || "").trim();
    var combined = (k ? k + " " : "") + raw;
    // Server sering kasih "Email is invalid, cannot duplicate." tanpa prefix key
    var direct = translateText(raw);
    if (direct !== raw) return direct;
    var withKey = translateText(combined);
    if (withKey !== combined) return withKey;

    // Object error: key=Username, msg=Invalid username. / already exist
    if (/cannot duplicate|already exist|already exists|duplicated?/i.test(raw)) {
      if (/user\s*name|username/i.test(k))
        return "Username / ID sudah terdaftar. Silakan pakai ID lain.";
      if (/email/i.test(k))
        return "Email sudah terdaftar. Silakan pakai email lain.";
      if (/mobile|phone|contact/i.test(k))
        return "Nomor handphone sudah terdaftar. Silakan pakai nomor lain.";
      if (/acc\s*no|account no|bank account no/i.test(k))
        return "Nomor rekening sudah terdaftar. Silakan pakai rekening lain.";
      if (/acc\s*name|account name|bankaccname/i.test(k))
        return "Nama rekening sudah terdaftar. Silakan cek kembali.";
    }
    if (/invalid/i.test(raw)) {
      if (/user\s*name|username/i.test(k)) return "Username tidak valid.";
      if (/email/i.test(k)) return "Email tidak valid.";
      if (/mobile|phone|contact/i.test(k)) return "Nomor handphone tidak valid.";
    }
    var rest = translateText(raw);
    return fieldLabel(k) + ": " + rest;
  }

  function translateText(text) {
    var t = String(text == null ? "" : text).trim();
    if (!t) return t;

    // Beberapa pesan digabung koma: "Email is invalid, cannot duplicate."
    // — sudah di-cover MSG_MAP penuh; jangan partial-replace "cannot duplicate" saja.

    // Field-prefixed: "Username: Invalid username."
    var pref = t.match(/^([A-Za-z][A-Za-z0-9 ._-]{0,40}):\s*(.+)$/);
    if (pref) {
      return translateFieldMsg(pref[1], pref[2]);
    }
    for (var i = 0; i < MSG_MAP.length; i++) {
      if (MSG_MAP[i][0].test(t)) return t.replace(MSG_MAP[i][0], MSG_MAP[i][1]);
    }
    return t;
  }

  function patchLabels() {
    try {
      if (typeof labels !== "undefined" && labels) {
        labels.registerSuccess =
          "Pendaftaran berhasil. Silakan masuk dengan username dan password Anda.";
        labels.bankInfoUpdateSuccess = "Info bank berhasil diperbarui.";
        if (labels.success) labels.success = "Berhasil";
        if (labels.alert) labels.alert = "Peringatan";
      }
      if (typeof messages !== "undefined" && messages) {
        messages.confirmUpdatePwd = "Konfirmasi ganti password?";
        messages.errorUpdatePwd = "Password minimal 6 karakter.";
        messages.logincaptchaError = "Captcha salah. Silakan coba lagi.";
        messages.loginconcurrentError =
          "Akun Anda sedang login di perangkat lain.";
        messages.statusmaintenance = "Sedang dalam pemeliharaan.";
      }
      if ($.alerts) {
        $.alerts.okButton = "OK";
        $.alerts.cancelButton = "Batal";
      }
      if (typeof buttons !== "undefined" && buttons) {
        buttons.cancel = "Batal";
        buttons.yes = "Ya";
      }
    } catch (e) {}
  }

  function patchValidator() {
    if (!$.validator || !$.validator.messages) return;
    $.extend($.validator.messages, {
      required: "Wajib diisi.",
      email: "Masukkan alamat email yang valid.",
      number: "Masukkan angka yang valid.",
      minlength: $.validator.format("Minimal {0} karakter."),
      maxlength: $.validator.format("Maksimal {0} karakter."),
      rangelength: $.validator.format("Panjang {0}–{1} karakter."),
      equalTo: "Password tidak cocok.",
    });
  }

  function patchAlerts() {
    if (window.__jasjusRegAlertPatched) return;
    window.__jasjusRegAlertPatched = true;

    if (typeof window.alertMsg === "function") {
      var prevAlertMsg = window.alertMsg;
      window.alertMsg = function (msg) {
        return prevAlertMsg(translateText(msg));
      };
    }

    if (typeof window.successMsg === "function") {
      var prevSuccess = window.successMsg;
      window.successMsg = function (msg) {
        return prevSuccess(translateText(msg));
      };
    }

    if (typeof window.jAlert === "function") {
      var prevJAlert = window.jAlert;
      window.jAlert = function (msg, title, callback) {
        var m = translateText(msg);
        var t = title;
        if (typeof t === "string") {
          if (/^alert$/i.test(t) || /^warning$/i.test(t)) t = "Peringatan";
          else if (/^success$/i.test(t) || /^berhasil$/i.test(t)) t = "Berhasil";
          else if (/^sorry$/i.test(t) || /^error$/i.test(t)) t = "Peringatan";
          else t = translateText(t);
        }
        return prevJAlert.call(this, m, t, callback);
      };
    }

    // Translate popup content if already rendered / MutationObserver for #popup_message
    var obs = new MutationObserver(function () {
      var $msg = $("#popup_message, #popup_title");
      $msg.each(function () {
        var $el = $(this);
        var raw = $el.text();
        if (!raw || !/[A-Za-z]{4,}/.test(raw)) return;
        if (
          !/bank|account|duplicate|invalid|username|email|mobile|password|please|exist|welcome|kindly|required|character/i.test(
            raw
          )
        )
          return;
        var next = translateText(raw);
        if (next && next !== raw) $el.text(next);
      });
      $("#popup_ok").each(function () {
        var $b = $(this);
        if (/^\s*OK\s*$/i.test($b.val() || $b.text())) {
          /* keep OK — universal */
        }
      });
      $("#popup_cancel").each(function () {
        var $b = $(this);
        var v = $b.is("input") ? $b.val() : $b.text();
        if (/^\s*Cancel\s*$/i.test(v)) {
          if ($b.is("input")) $b.val("Batal");
          else $b.text("Batal");
        }
      });
    });
    if (document.body) {
      obs.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
  }

  var EYE_OPEN =
    '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 5c-5 0-9.3 3.1-11 7 1.7 3.9 6 7 11 7s9.3-3.1 11-7c-1.7-3.9-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/></svg>';
  var EYE_OFF =
    '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M2.1 3.5 3.5 2.1l18.4 18.4-1.4 1.4-3.1-3.1A12.7 12.7 0 0 1 12 19c-5 0-9.3-3.1-11-7a13.7 13.7 0 0 1 4.7-5.2L2.1 3.5zM12 7a5 5 0 0 1 5 5c0 .7-.1 1.3-.4 1.9l-6.5-6.5c.6-.3 1.2-.4 1.9-.4zm-7.6 5c.9 1.9 2.7 3.5 5 4.4l-1.7-1.7A5 5 0 0 1 12 9c.3 0 .6 0 .9.1L9.7 5.9A12.5 12.5 0 0 0 4.4 12zM12 5c1.2 0 2.3.2 3.4.6l-1.6 1.6A5 5 0 0 0 8.2 12l-1.7-1.7C7.6 7.5 9.6 5 12 5zm7.6 7c-.5-1.1-1.3-2.1-2.2-2.9l1.5-1.5c1.4 1.2 2.5 2.7 3.1 4.4-1.1 2.5-3.2 4.5-5.8 5.7l-1.6-1.6c2-.8 3.6-2.3 4.5-4.1z"/></svg>';

  function ensureEyeStyles() {
    $("#jasjus-reg-eye-style").remove();
    $("head").append(
      '<style id="jasjus-reg-eye-style">' +
        /* wrap mengikuti tinggi input; jangan ganggu layout label di atas */ +
        "#ajax-form-join-mob .jasjus-reg-eye-wrap," +
        "#ajax-form-join-special .jasjus-reg-eye-wrap," +
        "form[action*='register'] .jasjus-reg-eye-wrap{" +
        "position:relative!important;display:block!important;" +
        "width:100%!important;max-width:100%!important;" +
        "flex:none!important;align-self:stretch!important;" +
        "box-sizing:border-box!important;margin:0!important;padding:0!important;" +
        "border:0!important;background:transparent!important;line-height:0!important;}" +
        "#ajax-form-join-mob .jasjus-reg-eye-wrap > input," +
        "#ajax-form-join-special .jasjus-reg-eye-wrap > input," +
        "form[action*='register'] .jasjus-reg-eye-wrap > input{" +
        "padding-right:44px!important;box-sizing:border-box!important;" +
        "width:100%!important;max-width:100%!important;}" +
        ".jasjus-reg-eye{" +
        "position:absolute!important;right:4px!important;top:0!important;bottom:0!important;" +
        "margin:auto 0!important;transform:none!important;" +
        "width:40px!important;height:40px!important;max-height:100%!important;" +
        "border:0!important;background:transparent!important;box-shadow:none!important;" +
        "padding:0!important;color:#5a6570!important;cursor:pointer!important;" +
        "display:flex!important;align-items:center!important;justify-content:center!important;" +
        "z-index:6!important;line-height:1!important;-webkit-tap-highlight-color:transparent;}" +
        ".jasjus-reg-eye svg{display:block!important;width:18px!important;height:18px!important;pointer-events:none!important;}" +
        ".jasjus-reg-eye:active{color:#111!important;opacity:.75;}" +
        /* mobile: form stack — pastikan wrap full width di bawah label */ +
        "@media (max-width:991px){" +
        "#ajax-form-join-mob .form-group," +
        "#ajax-form-join-special .form-group{" +
        "display:block!important;}" +
        "#ajax-form-join-mob .form-group > label," +
        "#ajax-form-join-special .form-group > label{" +
        "display:block!important;width:100%!important;margin-bottom:6px!important;}" +
        "#ajax-form-join-mob .jasjus-reg-eye-wrap," +
        "#ajax-form-join-special .jasjus-reg-eye-wrap{" +
        "display:block!important;width:100%!important;}" +
        ".jasjus-reg-eye{width:42px!important;height:100%!important;right:2px!important;}" +
        ".jasjus-reg-eye svg{width:20px!important;height:20px!important;}" +
        "form[action*='register'] .jasjus-reg-eye-wrap > input{padding-right:46px!important;}" +
        "}" +
        "</style>"
    );
  }

  function addEyeToInput($input) {
    if (!$input || !$input.length) return;
    ensureEyeStyles();
    $input.each(function () {
      var $el = $(this);
      var $wrap = $el.parent();

      // upgrade wrap lama (FA icon) → button SVG
      if ($wrap.hasClass("jasjus-reg-eye-wrap")) {
        var $existing = $wrap.children("button.jasjus-reg-eye");
        if ($existing.length && $existing.find("svg").length) {
          $el.data("jasjus-reg-eye", 1);
          return;
        }
        $wrap.children("i.fa, i.jasjus-reg-eye, button.jasjus-reg-eye").remove();
        var $btnUp = $(
          '<button type="button" class="jasjus-reg-eye" tabindex="-1" aria-label="Tampilkan password" title="Tampilkan / sembunyikan">' +
            EYE_OPEN +
            "</button>"
        );
        $wrap.append($btnUp);
        $btnUp.on("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          var show = $el.attr("type") === "password";
          $el.attr("type", show ? "text" : "password");
          $btnUp.html(show ? EYE_OFF : EYE_OPEN);
          $btnUp.attr(
            "aria-label",
            show ? "Sembunyikan password" : "Tampilkan password"
          );
        });
        $el.data("jasjus-reg-eye", 1);
        return;
      }

      if ($el.data("jasjus-reg-eye")) return;

      // buang icon FA tema / sisa inject lama
      $el.closest(".form-group").children("i.fa-eye, i.fa-eye-slash, .jasjus-reg-eye").remove();
      $el.next("i.fa-eye, i.fa-eye-slash").remove();
      $el.wrap('<span class="jasjus-reg-eye-wrap"></span>');
      var $btn = $(
        '<button type="button" class="jasjus-reg-eye" tabindex="-1" aria-label="Tampilkan password" title="Tampilkan / sembunyikan">' +
          EYE_OPEN +
          "</button>"
      );
      $el.parent().append($btn);
      $el.data("jasjus-reg-eye", 1);
      $btn.on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var show = $el.attr("type") === "password";
        $el.attr("type", show ? "text" : "password");
        $btn.html(show ? EYE_OFF : EYE_OPEN);
        $btn.attr("aria-label", show ? "Sembunyikan password" : "Tampilkan password");
      });
    });
  }

  function placeEyes() {
    addEyeToInput(
      $(
        '#ajax-form-join-special input[name="password"],' +
          '#ajax-form-join-special input[name="confirmPassword"],' +
          '#ajax-form-join-mob input[name="password"],' +
          '#ajax-form-join-mob input[name="confirmPassword"],' +
          "#password, #password-mob," +
          'form[action*="/func/account/register"] input[type="password"]'
      )
    );
  }

  function translateInlineErrors() {
    $(
      "label.error, .error, em.error, span.error, .help-block, .invalid-feedback"
    ).each(function () {
      var $el = $(this);
      var raw = ($el.text() || "").trim();
      if (!raw || !/[A-Za-z]{3,}/.test(raw)) return;
      if (
        !/please|required|character|invalid|password|match|email|number|enter|exist|duplicate|bank/i.test(
          raw
        )
      )
        return;
      var next = translateText(raw);
      if (next && next !== raw) $el.text(next);
    });
  }

  function boot() {
    if (!isRegisterPage()) return;
    patchLabels();
    patchValidator();
    patchAlerts();
    placeEyes();
    translateInlineErrors();

    setTimeout(placeEyes, 400);
    setTimeout(placeEyes, 1200);

    var n = 0;
    var tick = setInterval(function () {
      placeEyes();
      translateInlineErrors();
      if (++n > 40) clearInterval(tick);
    }, 500);

    $(document).on(
      "click keyup blur focusout",
      'form[action*="register"] input, form[action*="register"] button, #ajax-form-join-special button, #ajax-form-join-mob button',
      function () {
        setTimeout(translateInlineErrors, 50);
        setTimeout(translateInlineErrors, 250);
      }
    );

    $(document).ajaxComplete(function () {
      setTimeout(translateInlineErrors, 30);
    });
  }

  $(boot);
})(window.jQuery);

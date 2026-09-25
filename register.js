/**
 * GARUDA999 — /register UX
 * - Icon mata password (pakai pola tema .form-group.eye)
 * - Popup / pesan validasi EN → ID (bank duplicate, dll)
 */
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
    [
      /Bank Account No\.?\s*is invalid,?\s*cannot duplicate\.?/i,
      "Nomor rekening tidak valid atau sudah terdaftar.",
    ],
    [
      /Bank Account No\.?\s*(already )?(exist|exists|duplicated?)\.?/i,
      "Nomor rekening sudah terdaftar.",
    ],
    [
      /Bank account (already )?(exist|exists|duplicated?)\.?/i,
      "Rekening bank sudah terdaftar.",
    ],
    [/cannot duplicate\.?/i, "Data sudah terdaftar / tidak boleh duplikat."],
    [/Username (already )?(exist|exists)\.?/i, "Username sudah digunakan."],
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

  function translateText(text) {
    var t = String(text == null ? "" : text).trim();
    if (!t) return t;
    // Field-prefixed: "Username: Invalid username."
    var pref = t.match(/^([A-Za-z][A-Za-z0-9 ._-]{0,40}):\s*(.+)$/);
    if (pref) {
      var fieldMap = {
        Username: "Username",
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
      var key = pref[1];
      var rest = translateText(pref[2]);
      var label = fieldMap[key] || key;
      return label + ": " + rest;
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

  function ensureEyeStyles() {
    if ($("#jasjus-reg-eye-style").length) return;
    $("head").append(
      '<style id="jasjus-reg-eye-style">' +
        ".jasjus-reg-eye-wrap{" +
        "position:relative!important;display:block!important;" +
        "flex:1 1 auto!important;width:100%!important;max-width:100%!important;" +
        "box-sizing:border-box!important;margin:0!important;padding:0!important;" +
        "border:0!important;background:transparent!important;}" +
        ".jasjus-reg-eye-wrap > input{" +
        "padding-right:36px!important;box-sizing:border-box!important;width:100%!important;}" +
        ".jasjus-reg-eye{" +
        "position:absolute!important;right:10px!important;top:50%!important;" +
        "transform:translateY(-50%)!important;margin:0!important;" +
        "border:0!important;background:transparent!important;box-shadow:none!important;" +
        "padding:0!important;color:#444!important;cursor:pointer!important;" +
        "font-size:15px!important;line-height:1!important;z-index:6!important;}" +
        ".jasjus-reg-eye:hover{color:#111!important;}" +
        "</style>"
    );
  }

  function addEyeToInput($input) {
    if (!$input || !$input.length) return;
    ensureEyeStyles();
    $input.each(function () {
      var $el = $(this);
      if ($el.data("jasjus-reg-eye")) return;
      if ($el.parent().hasClass("jasjus-reg-eye-wrap")) {
        $el.data("jasjus-reg-eye", 1);
        return;
      }
      // buang icon tema mentah di flex .form-group (sering kepergok label)
      $el.closest(".form-group").children("i.fa-eye, i.fa-eye-slash").remove();
      $el.wrap('<span class="jasjus-reg-eye-wrap"></span>');
      var $ico = $(
        '<i class="fa fa-eye jasjus-reg-eye" aria-hidden="true" title="Tampilkan / sembunyikan"></i>'
      );
      $el.parent().append($ico);
      $el.data("jasjus-reg-eye", 1);
      $ico.on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var show = $el.attr("type") === "password";
        $el.attr("type", show ? "text" : "password");
        $ico.toggleClass("fa-eye fa-eye-slash");
        $ico.attr("title", show ? "Sembunyikan" : "Tampilkan / sembunyikan");
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

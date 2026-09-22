
(function ($) {
  var HINT_HTML =
    '<div class="jasjus-pwd-hint" style="display:block!important;margin:10px 0 14px;padding:10px 12px;border-radius:8px;background:#fff8e6;border:1px solid #f0d78c;color:#5c4a12;font-size:13px;line-height:1.45;clear:both">' +
    "<strong>Perhatian:</strong> Password hanya huruf dan angka (contoh <code>Abc123</code>), minimal 6 karakter. " +
    "<strong>Jangan pakai karakter khusus</strong> seperti @ # ! ? spasi — biasanya ditolak / dianggap tidak sesuai." +
    "</div>";

  var EYE_OPEN =
    '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 5c-5 0-9.3 3.1-11 7 1.7 3.9 6 7 11 7s9.3-3.1 11-7c-1.7-3.9-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/></svg>';
  var EYE_OFF =
    '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M2.1 3.5 3.5 2.1l18.4 18.4-1.4 1.4-3.1-3.1A12.7 12.7 0 0 1 12 19c-5 0-9.3-3.1-11-7a13.7 13.7 0 0 1 4.7-5.2L2.1 3.5zM12 7a5 5 0 0 1 5 5c0 .7-.1 1.3-.4 1.9l-6.5-6.5c.6-.3 1.2-.4 1.9-.4zm-7.6 5c.9 1.9 2.7 3.5 5 4.4l-1.7-1.7A5 5 0 0 1 12 9c.3 0 .6 0 .9.1L9.7 5.9A12.5 12.5 0 0 0 4.4 12zM12 5c1.2 0 2.3.2 3.4.6l-1.6 1.6A5 5 0 0 0 8.2 12l-1.7-1.7C7.6 7.5 9.6 5 12 5zm7.6 7c-.5-1.1-1.3-2.1-2.2-2.9l1.5-1.5c1.4 1.2 2.5 2.7 3.1 4.4-1.1 2.5-3.2 4.5-5.8 5.7l-1.6-1.6c2-.8 3.6-2.3 4.5-4.1z"/></svg>';

  function goHome() {
    window.location.href = "/secure/home";
  }

  function isChangePasswordUrl(url) {
    return /changePassword|change\.password|changepassword/i.test(String(url || ""));
  }

  function isSuccessPayload(data) {
    if (data == null) return false;
    if (typeof data === "string") {
      var t = data.trim();
      if (/^success$/i.test(t)) return true;
      if (/password.*(success|berhasil|changed|updated)/i.test(t)) return true;
      try {
        data = JSON.parse(t);
      } catch (e) {
        return false;
      }
    }
    if (Array.isArray(data)) {
      var head = String(data[0] == null ? "" : data[0]).toLowerCase();
      return head === "success" || head === "ok" || head === "200";
    }
    if (typeof data === "object") {
      var code = String(data.code != null ? data.code : data.status != null ? data.status : "").toLowerCase();
      var msg = String(data.message || data.msg || data.result || "");
      if (code === "200" || code === "success" || code === "ok") return true;
      if (data.success === true) return true;
      if (/berhasil|success|changed|updated/i.test(msg) && !/fail|error|salah|invalid/i.test(msg)) return true;
    }
    return false;
  }

  function insertHint($anchor, mode) {
    if (!$anchor || !$anchor.length) return;
    var id = mode === "mob" ? "jasjus-pwd-hint-mob" : "jasjus-pwd-hint-desk";
    if ($("#" + id).length) return;
    var $hint = $(HINT_HTML).attr("id", id);
    $anchor.after($hint);
  }

  function insertHintBeforeInput($input, mode) {
    if (!$input || !$input.length) return;
    var id = mode === "mob" ? "jasjus-pwd-hint-mob" : "jasjus-pwd-hint-desk";
    if ($("#" + id).length) return;
    var $hint = $(HINT_HTML).attr("id", id);
    var $row = $input.closest(".form-group, .form-row, .form-input, .field, li").first();
    if ($row.length) $row.before($hint);
    else $input.before($hint);
  }

  function placeHint() {
    var $deskTitle = $(".field-title").filter(function () {
      return /ganti password|change password/i.test($(this).text());
    }).first();
    if ($deskTitle.length) insertHint($deskTitle, "desk");
    else insertHintBeforeInput($("#oldPwd"), "desk");

    var $mobTitle = $("h3").filter(function () {
      return /ganti password|change password/i.test($(this).text());
    }).first();
    if ($mobTitle.length) insertHint($mobTitle, "mob");
    else insertHintBeforeInput($("#oldPwdMob"), "mob");

    if (!$("#jasjus-pwd-hint-desk").length) insertHintBeforeInput($("#oldPwd"), "desk");
    if (!$("#jasjus-pwd-hint-mob").length) insertHintBeforeInput($("#oldPwdMob"), "mob");
  }

  function applyLabels() {
    $(".field-title").text("Ganti Password");
    $("input#oldPwd").prev("label").html('<span class="text-danger">*</span> Password Saat Ini');
    $("input#newPwd").prev("label").html('<span class="text-danger">*</span> Password Baru');
    $("input#confirmPwd").prev("label").html('<span class="text-danger">*</span> Ulangi Password Baru');

    $("h3:contains('Change Password'), h3:contains('Ganti Password')").text("Ganti Password");
    $("input#oldPwdMob").prev("label").html('<span class="text-danger">*</span> Password Saat Ini');
    $("input#newPwdMob").prev("label").html('<span class="text-danger">*</span> Password Baru');
    $("input#confirmPwdMob").prev("label").html('<span class="text-danger">*</span> Ulangi Password Baru');
  }

  var MSG_MAP = [
    [/please enter at least\s*(\d+)\s*characters\.?/i, "Minimal $1 karakter."],
    [/please enter at least\s*(\d+)\s*character\.?/i, "Minimal $1 karakter."],
    [/please enter no more than\s*(\d+)\s*characters\.?/i, "Maksimal $1 karakter."],
    [/this field is required\.?/i, "Wajib diisi."],
    [/please fill out this field\.?/i, "Wajib diisi."],
    [/please enter the same value again\.?/i, "Password tidak cocok."],
    [/please enter a value between\s*(\d+)\s*and\s*(\d+)\s*characters long\.?/i, "Panjang password $1–$2 karakter."],
    [/passwords? (do not|don't) match\.?/i, "Password tidak cocok."],
    [/invalid (password|value)\.?/i, "Password tidak valid."],
    [/wrong password\.?/i, "Password salah."],
    [/current password.*(incorrect|wrong|invalid).*/i, "Password saat ini salah."],
    [/new password.*(invalid|incorrect).*/i, "Password baru tidak valid."],
  ];

  function translateText(text) {
    var t = String(text || "").trim();
    if (!t) return t;
    for (var i = 0; i < MSG_MAP.length; i++) {
      if (MSG_MAP[i][0].test(t)) return t.replace(MSG_MAP[i][0], MSG_MAP[i][1]);
    }
    return t;
  }

  function applyIndonesianUi() {
    // Tombol submit
    $("form")
      .has("#oldPwd, #newPwd, #oldPwdMob, #newPwdMob")
      .find('button[type="submit"], input[type="submit"], .btn, button')
      .each(function () {
        var $b = $(this);
        if ($b.hasClass("jasjus-pwd-eye")) return;
        var label = ($b.is("input") ? $b.val() : $b.text()) || "";
        if (/^\s*submit\s*$/i.test(label)) {
          if ($b.is("input")) $b.val("KIRIM");
          else $b.text("KIRIM");
        }
      });

    // Pesan error jquery.validate / label.error
    $('label.error, .error, .help-block, .text-danger, span.error, em.error, .invalid-feedback').each(function () {
      var $el = $(this);
      if ($el.closest(".jasjus-pwd-hint").length) return;
      if ($el.is("label") && $el.attr("for") && !$el.hasClass("error") && !$el.hasClass("text-danger")) return;
      var raw = $el.text();
      if (!/[A-Za-z]{3,}/.test(raw)) return;
      if (!/please|required|character|invalid|password|match|wrong|enter/i.test(raw)) return;
      var next = translateText(raw);
      if (next && next !== raw) $el.text(next);
    });

    // Override default jquery.validate messages
    if ($.validator && $.validator.messages) {
      $.extend($.validator.messages, {
        required: "Wajib diisi.",
        minlength: $.validator.format("Minimal {0} karakter."),
        maxlength: $.validator.format("Maksimal {0} karakter."),
        rangelength: $.validator.format("Panjang password {0}–{1} karakter."),
        equalTo: "Password tidak cocok.",
      });
    }
  }

  function ensureEyeStyles() {
    if ($("#jasjus-pwd-eye-style").length) return;
    $("head").append(
      '<style id="jasjus-pwd-eye-style">' +
        ".jasjus-pwd-eye-host{position:relative!important;}" +
        "input.jasjus-pwd-input{padding-right:44px!important;box-sizing:border-box;}" +
        ".jasjus-pwd-eye{" +
        "position:absolute;right:10px;top:50%;transform:translateY(-50%);" +
        "width:36px;height:36px;border:0;background:transparent;padding:0;" +
        "margin:0;color:#666;cursor:pointer;display:inline-flex;" +
        "align-items:center;justify-content:center;z-index:8;line-height:1;}" +
        ".jasjus-pwd-eye:hover,.jasjus-pwd-eye:focus{color:#222;outline:none;}" +
        ".jasjus-pwd-eye svg{display:block;pointer-events:none;}" +
        "</style>"
    );
  }

  function addEyeToInput($input) {
    if (!$input || !$input.length) return;
    if ($input.data("jasjus-eye")) return;

    ensureEyeStyles();
    $input.addClass("jasjus-pwd-input");

    var $host = $input.parent();
    if (!$host.hasClass("jasjus-pwd-eye-host")) {
      $host.addClass("jasjus-pwd-eye-host");
      var pos = $host.css("position");
      if (!pos || pos === "static") $host.css("position", "relative");
    }

    var $btn = $(
      '<button type="button" class="jasjus-pwd-eye" tabindex="-1" aria-label="Tampilkan password" title="Tampilkan / sembunyikan password">' +
        EYE_OPEN +
        "</button>"
    );
    $host.append($btn);
    $input.data("jasjus-eye", 1);

    $btn.on("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var show = $input.attr("type") === "password";
      $input.attr("type", show ? "text" : "password");
      $btn.html(show ? EYE_OFF : EYE_OPEN);
      $btn.attr("aria-label", show ? "Sembunyikan password" : "Tampilkan password");
    });
  }

  function placeEyes() {
    [
      "#oldPwd",
      "#newPwd",
      "#confirmPwd",
      "#oldPwdMob",
      "#newPwdMob",
      "#confirmPwdMob",
    ].forEach(function (sel) {
      addEyeToInput($(sel));
    });
  }

  $(function () {
    if (window.location.pathname !== "/secure/admin/profile") return;

    function refreshAll() {
      applyLabels();
      placeHint();
      placeEyes();
      applyIndonesianUi();
    }

    refreshAll();
    setTimeout(refreshAll, 300);
    setTimeout(refreshAll, 1200);

    // Terjemahkan error yang muncul saat validasi
    var tick = setInterval(applyIndonesianUi, 400);
    setTimeout(function () {
      clearInterval(tick);
    }, 15000);
    $(document).on("click keyup blur", "#oldPwd,#newPwd,#confirmPwd,#oldPwdMob,#newPwdMob,#confirmPwdMob,button,input[type=submit]", function () {
      setTimeout(applyIndonesianUi, 50);
      setTimeout(applyIndonesianUi, 200);
    });

    $(document).ajaxSuccess(function (_ev, xhr, settings) {
      if (!settings || !isChangePasswordUrl(settings.url)) return;
      var data = xhr.responseJSON;
      if (data == null) {
        try {
          data = JSON.parse(xhr.responseText || "");
        } catch (e) {
          data = xhr.responseText;
        }
      }
      if (isSuccessPayload(data)) setTimeout(goHome, 400);
    });

    $(document).ajaxComplete(function (_ev, xhr, settings) {
      if (!settings || !isChangePasswordUrl(settings.url)) return;
      var text = String(xhr.responseText || "");
      if (/success|berhasil/i.test(text) && !/fail|error|invalid|salah/i.test(text)) {
        setTimeout(goHome, 500);
      }
    });
  });
})(jQuery);

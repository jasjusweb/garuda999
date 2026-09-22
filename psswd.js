
(function ($) {
  var HINT_HTML =
    '<div class="jasjus-pwd-hint" style="display:block!important;margin:10px 0 14px;padding:10px 14px;border-radius:8px;background:#fff8e6;border:1px solid #f0d78c;color:#5c4a12;font-size:13px;line-height:1.45;clear:both;box-sizing:border-box">' +
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
    $("#jasjus-pwd-eye-style").remove();
    $("head").append(
      '<style id="jasjus-pwd-eye-style">' +
        ".jasjus-pwd-wrap{" +
        "position:relative!important;display:block!important;" +
        "width:100%!important;max-width:100%!important;height:44px!important;" +
        "min-height:44px!important;max-height:44px!important;" +
        "box-sizing:border-box!important;margin:0 0 0 0!important;padding:0!important;" +
        "border:0!important;background:transparent!important;overflow:visible!important;" +
        "line-height:normal!important;flex:none!important;}" +
        ".jasjus-pwd-wrap > input," +
        ".jasjus-pwd-wrap > input.error," +
        ".jasjus-pwd-wrap > input.valid{" +
        "display:block!important;width:100%!important;max-width:100%!important;" +
        "height:44px!important;min-height:44px!important;max-height:44px!important;" +
        "line-height:44px!important;padding-top:0!important;padding-bottom:0!important;" +
        "padding-right:42px!important;box-sizing:border-box!important;margin:0!important;}" +
        ".jasjus-pwd-eye{" +
        "position:absolute!important;right:8px!important;top:22px!important;" +
        "transform:translateY(-50%)!important;bottom:auto!important;margin:0!important;" +
        "width:32px!important;height:32px!important;" +
        "border:0!important;background:transparent!important;box-shadow:none!important;" +
        "padding:0!important;color:#6b7280!important;cursor:pointer!important;" +
        "display:flex!important;align-items:center!important;justify-content:center!important;" +
        "z-index:9!important;line-height:1!important;border-radius:0!important;}" +
        ".jasjus-pwd-eye:hover,.jasjus-pwd-eye:focus{color:#111!important;outline:none!important;}" +
        ".jasjus-pwd-eye svg{display:block!important;width:18px!important;height:18px!important;pointer-events:none!important;}" +
        ".jasjus-pwd-wrap + label.error," +
        ".jasjus-pwd-wrap + .error," +
        ".jasjus-pwd-wrap + em.error," +
        ".jasjus-pwd-wrap + span.error," +
        "label.error[for=oldPwd],label.error[for=newPwd],label.error[for=confirmPwd]," +
        "label.error[for=oldPwdMob],label.error[for=newPwdMob],label.error[for=confirmPwdMob]{" +
        "display:block!important;width:100%!important;height:auto!important;" +
        "margin:6px 0 12px!important;padding:0!important;clear:both!important;" +
        "float:none!important;line-height:1.35!important;position:static!important;}" +
        "#jasjus-pwd-hint-desk,#jasjus-pwd-hint-mob,.jasjus-pwd-hint{" +
        "grid-column:1/-1;width:100%;max-width:100%;box-sizing:border-box;" +
        "padding:10px 14px!important;}" +
        "body.jasjus-pwd-profile .text-right," +
        "body.jasjus-pwd-profile [align=right]{" +
        "padding-right:10px!important;}" +
        "</style>"
    );
  }

  function markProfilePage() {
    $("body").addClass("jasjus-pwd-profile");
  }

  function relocatePwdErrors() {
    $(".jasjus-pwd-wrap").each(function () {
      var $wrap = $(this);
      $wrap.children().each(function () {
        var $el = $(this);
        if ($el.is("input, button, .jasjus-pwd-eye")) return;
        var txt = ($el.text() || "").trim();
        var isErr =
          $el.hasClass("error") ||
          $el.is("label.error, em.error, span.error") ||
          /tidak cocok|minimal|wajib|please|character|required|match|password/i.test(txt);
        if (!isErr) return;
        $wrap.after($el);
      });
      $wrap.css({ height: "44px", minHeight: "44px", maxHeight: "44px" });
      $wrap.children("input").css({
        height: "44px",
        minHeight: "44px",
        maxHeight: "44px",
        boxSizing: "border-box",
        lineHeight: "44px",
      });
    });
  }

  function patchValidatorPlacement() {
    if (!$.validator || $.validator.__jasjusPwdPatched) return;
    $.validator.__jasjusPwdPatched = true;
    var prev = $.validator.defaults.errorPlacement;
    $.validator.setDefaults({
      errorPlacement: function (error, element) {
        var $el = $(element);
        if ($el.parent().hasClass("jasjus-pwd-wrap")) {
          error.insertAfter($el.parent());
          return;
        }
        if (typeof prev === "function") prev.call(this, error, element);
        else error.insertAfter(element);
      },
    });
  }

  function addEyeToInput($input) {
    if (!$input || !$input.length) return;
    if ($input.data("jasjus-eye")) return;
    if ($input.parent().hasClass("jasjus-pwd-wrap")) {
      $input.data("jasjus-eye", 1);
      return;
    }

    ensureEyeStyles();
    $input.wrap('<span class="jasjus-pwd-wrap"></span>');
    var $wrap = $input.parent();
    var $btn = $(
      '<button type="button" class="jasjus-pwd-eye" tabindex="-1" aria-label="Tampilkan password" title="Tampilkan / sembunyikan">' +
        EYE_OPEN +
        "</button>"
    );
    $wrap.append($btn);
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
      markProfilePage();
      patchValidatorPlacement();
      ensureEyeStyles();
      applyLabels();
      placeHint();
      placeEyes();
      applyIndonesianUi();
      relocatePwdErrors();
    }

    refreshAll();
    setTimeout(refreshAll, 300);
    setTimeout(refreshAll, 1200);

    // Terjemahkan error yang muncul saat validasi + rapikan posisi
    var tick = setInterval(function () {
      applyIndonesianUi();
      relocatePwdErrors();
    }, 300);
    setTimeout(function () {
      clearInterval(tick);
    }, 20000);
    $(document).on(
      "click keyup blur focusout",
      "#oldPwd,#newPwd,#confirmPwd,#oldPwdMob,#newPwdMob,#confirmPwdMob,button,input[type=submit]",
      function () {
        setTimeout(function () {
          applyIndonesianUi();
          relocatePwdErrors();
        }, 30);
        setTimeout(function () {
          applyIndonesianUi();
          relocatePwdErrors();
        }, 200);
      }
    );

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

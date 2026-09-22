
(function ($) {
  var HINT_HTML =
    '<div class="jasjus-pwd-hint" style="display:block!important;margin:10px 0 14px;padding:10px 12px;border-radius:8px;background:#fff8e6;border:1px solid #f0d78c;color:#5c4a12;font-size:13px;line-height:1.45;clear:both">' +
    "<strong>Perhatian:</strong> Password hanya huruf dan angka (contoh <code>Abc123</code>), minimal 6 karakter. " +
    "<strong>Jangan pakai karakter khusus</strong> seperti @ # ! ? spasi — biasanya ditolak / dianggap tidak sesuai." +
    "</div>";

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
    // Desktop: judul .field-title
    var $deskTitle = $(".field-title").filter(function () {
      return /ganti password|change password/i.test($(this).text());
    }).first();
    if ($deskTitle.length) insertHint($deskTitle, "desk");
    else insertHintBeforeInput($("#oldPwd"), "desk");

    // Mobile: h3 Ganti Password
    var $mobTitle = $("h3").filter(function () {
      return /ganti password|change password/i.test($(this).text());
    }).first();
    if ($mobTitle.length) insertHint($mobTitle, "mob");
    else insertHintBeforeInput($("#oldPwdMob"), "mob");

    // Cadangan keras: langsung sebelum input mobile/desktop
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

  $(function () {
    if (window.location.pathname !== "/secure/admin/profile") return;

    applyLabels();
    placeHint();
    setTimeout(function () {
      applyLabels();
      placeHint();
    }, 300);
    setTimeout(function () {
      applyLabels();
      placeHint();
    }, 1200);

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

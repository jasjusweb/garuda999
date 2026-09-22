
(function ($) {
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

  function placeHint() {
    if ($("#jasjus-pwd-hint").length) return;

    var hint =
      '<div id="jasjus-pwd-hint" style="display:block;margin:10px 0 14px;padding:10px 12px;border-radius:8px;background:#fff8e6;border:1px solid #f0d78c;color:#5c4a12;font-size:13px;line-height:1.45;clear:both">' +
      "<strong>Perhatian:</strong> Password hanya huruf dan angka (contoh <code>Abc123</code>), minimal 6 karakter. " +
      "<strong>Jangan pakai karakter khusus</strong> seperti @ # ! ? spasi — biasanya ditolak / dianggap tidak sesuai." +
      "</div>";

    // Desktop: judul .field-title di kolom kanan
    var $desktopTitle = $(".field-title").filter(function () {
      return /ganti password|change password/i.test($(this).text());
    }).first();
    if ($desktopTitle.length) {
      $desktopTitle.after(hint);
      return;
    }

    // Mobile / fallback: h3
    var $h3 = $("h3").filter(function () {
      return /ganti password|change password/i.test($(this).text());
    }).first();
    if ($h3.length) {
      $h3.after(hint);
      return;
    }

    // Cadangan: tepat di atas field password
    var $old = $("input#oldPwd, input#oldPwdMob").first();
    if ($old.length) {
      var $row = $old.closest(".form-group, .form-row, .form-input, li, div");
      if ($row.length) $row.first().before(hint);
      else $old.before(hint);
    }
  }

  $(function () {
    if (window.location.pathname !== "/secure/admin/profile") return;

    $(".field-title").text("Ganti Password");
    $("input#oldPwd").prev("label").html('<span class="text-danger">*</span> Password Saat Ini');
    $("input#newPwd").prev("label").html('<span class="text-danger">*</span> Password Baru');
    $("input#confirmPwd").prev("label").html('<span class="text-danger">*</span> Ulangi Password Baru');

    $("h3:contains('Change Password')").text("Ganti Password");
    $("input#oldPwdMob").prev("label").html('<span class="text-danger">*</span> Password Saat Ini');
    $("input#newPwdMob").prev("label").html('<span class="text-danger">*</span> Password Baru');
    $("input#confirmPwdMob").prev("label").html('<span class="text-danger">*</span> Ulangi Password Baru');

    placeHint();
    // kadang form desktop di-render belakangan
    setTimeout(placeHint, 300);
    setTimeout(placeHint, 1000);

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

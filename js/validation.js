// =========================
// validation.js  (FIXED)
// اعتبارسنجی داده‌های ورودی مراحل دَنگی
// =========================

// --- مپ ارقام فارسی به انگلیسی ---
const MAP_FA_TO_EN = { '۰':'0','۱':'1','۲':'2','۳':'3','۴':'4','۵':'5','۶':'6','۷':'7','۸':'8','۹':'9' };

// --- تبدیل همه‌ی رقم‌های فارسی به انگلیسی ---
function toEnDigits(str) {
  return String(str).replace(/[۰-۹]/g, ch => MAP_FA_TO_EN[ch] ?? ch);
}

// --- پارس امن عدد (پشتیبانی از ارقام فارسی + جداکننده هزارگان فارسی/کاما) ---
function parseFaNumber(raw) {
  if (raw == null) return NaN;
  let s = String(raw);
  // اول ارقام فارسی -> انگلیسی
  s = toEnDigits(s);
  // حذف جداکننده‌های هزارگان فارسی (٬ U+066C) و کاما
  s = s.replace(/٬|,/g, '');
  // حذف هرچیز غیرعدد (فقط 0-9 بماند)
  s = s.replace(/[^\d]/g, '');
  if (!s) return NaN;
  return Number(s);
}

// فقط حروف اسکریپت فارسی/عربی + فاصله و نیم‌فاصله
const persianNameRegex = /^[\u0600-\u06FF\u200c\s]+$/u;

// ===== مدیریت نمایش/پاک‌سازی خطا =====
function getContainer(el) {
  // پیام خطا را در انتهای .form-group می‌گذاریم تا دقیقاً زیر ورودی باشد
  return el.closest('.form-group') || el.parentElement || document.body;
}

function showError(inputEl, message) {
  clearError(inputEl);
  inputEl.classList.add('error');

  const container = getContainer(inputEl);

  const err = document.createElement('small');
  err.className = 'error-message';
  err.textContent = message;

  container.appendChild(err);
}

function clearError(inputEl) {
  inputEl.classList.remove('error');
  const container = getContainer(inputEl);
  const olds = container.querySelectorAll('.error-message');
  olds.forEach(e => e.remove());
}

// ===== اعتبارسنجی مرحله به مرحله =====

// مرحله ۱: تعداد افراد
function validateNumPeople(inputEl) {
  clearError(inputEl);
  const num = parseFaNumber(inputEl.value);
  // بازه منطقی: ۲ تا ۵۰
  if (!num || num < 2 || num > 50) {
    showError(inputEl, 'تعداد افراد باید عددی بین ۲ تا ۵۰ باشد.');
    return false;
  }
  return true;
}

// مرحله ۲: اسامی
function validateNames(inputs) {
  let valid = true;

  // پاک کردن خطای قبلی
  inputs.forEach(i => clearError(i));

  // خالی نبودن / فقط حروف فارسی
  inputs.forEach(input => {
    const val = (input.value || '').trim();
    if (!val) {
      showError(input, 'نام نمی‌تواند خالی باشد.');
      valid = false;
      return;
    }
    if (!persianNameRegex.test(val)) {
      showError(input, 'نام باید فقط شامل حروف فارسی باشد.');
      valid = false;
      return;
    }
  });

  // تکراری نبودن
  const names = inputs.map(i => (i.value || '').trim());
  const count = names.reduce((m, n) => (m[n] = (m[n] || 0) + 1, m), {});
  inputs.forEach((input, idx) => {
    const n = names[idx];
    if (n && count[n] > 1) {
      clearError(input); // پیام قبلی را با پیام تکراری جایگزین کن
      showError(input, 'نام تکراری است.');
      valid = false;
    }
  });

  return valid;
}

// مرحله ۳: تعداد تراکنش‌ها
function validateNumTransactions(inputEl) {
  clearError(inputEl);
  const num = parseFaNumber(inputEl.value);
  // ۱ تا ۱۰۰
  if (!num || num < 1 || num > 100) {
    showError(inputEl, 'تعداد تراکنش‌ها باید عددی بین ۱ تا ۱۰۰ باشد.');
    return false;
  }
  return true;
}

// مرحله ۴: جزئیات تراکنش
function validateTransaction(payerEl, amountEl, participantsEl) {
  // پاک‌سازی خطاهای قبلی
  clearError(payerEl);
  clearError(amountEl);
  clearError(participantsEl);

  let valid = true;

  // پرداخت‌کننده
  if (!payerEl.value) {
    showError(payerEl, 'لطفاً پرداخت‌کننده را انتخاب کنید.');
    valid = false;
  }

  // مبلغ
  const amount = parseFaNumber(amountEl.value);
  if (!amount || amount <= 0) {
    showError(amountEl, 'مبلغ باید بزرگ‌تر از صفر باشد.');
    valid = false;
  }

  // افراد سهیم
  const participants = Array.from(participantsEl.selectedOptions).map(o => o.value);
  if (participants.length === 0) {
    // اگر Choices.js فعال است، پیام را در همان کانتینر هم نشان بده
    const container = participantsEl.closest('.form-group') || participantsEl.parentElement;
    showError(container.querySelector('.choices') || participantsEl, 'حداقل یک نفر باید انتخاب شود.');
    valid = false;
  }

  return valid;
}

// ===== اکسپورت توابع برای استفاده در flow.js =====
window.validation = {
  parseFaNumber,          // در صورت نیاز در flow.js مستقیم هم می‌تواند استفاده شود
  validateNumPeople,
  validateNames,
  validateNumTransactions,
  validateTransaction
};

// ===== استایل خطا (inject) =====
const style = document.createElement('style');
style.innerHTML = `
  .error {
    border: 2px solid #e74c3c !important;
    background: #ffecec;
  }
  .error-message {
    color: #e74c3c;
    font-size: 0.85rem;
    margin-top: 6px;
    display: block;
    text-align: right;
  }
`;
document.head.appendChild(style);

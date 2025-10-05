document.addEventListener("DOMContentLoaded", () => {
  const startSection = document.querySelector(".start-step");
  const step1 = document.querySelector(".step-1");
  const step2 = document.querySelector(".step-2");
  const startBtn = document.querySelector(".start-step .btn");
  const nextBtn1 = document.getElementById("next-btn");
  const numInput = document.getElementById("num-people");
  const nameFieldsContainer = document.getElementById("name-fields");
  const nextBtn2 = step2.querySelector(".btn");

  step1.style.display = "none";
  step2.style.display = "none";

  startBtn.addEventListener("click", () => {
    startSection.style.display = "none";
    step1.style.display = "block";
    window.scrollTo(0, 0);
  });

  nextBtn1.addEventListener("click", () => {
    const numPeople = parseInt(numInput.value.trim());

    if (!numPeople || numPeople <= 0) {
      alert("لطفاً یک عدد معتبر وارد کنید!");
      return;
    }

    localStorage.setItem("numPeople", numPeople);

    step1.style.display = "none";
    step2.style.display = "block";
    window.scrollTo(0, 0);

    nameFieldsContainer.innerHTML = ""; 
    for (let i = 1; i <= numPeople; i++) {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = `نام فرد ${i}`;
      input.classList.add("name-input");
      nameFieldsContainer.appendChild(input);
    }
  });

  nextBtn2.addEventListener("click", () => {
    const names = Array.from(document.querySelectorAll(".name-input")).map(el =>
      el.value.trim()
    );

    if (names.some(name => name === "")) {
      alert("لطفاً نام همه افراد را وارد کنید!");
      return;
    }

    localStorage.setItem("names", JSON.stringify(names));
    alert("نام‌ها با موفقیت ذخیره شدند! (اینجا بعداً می‌ریم به مرحله ۳)");
  });
});
document.addEventListener('DOMContentLoaded', function () {
  const participantsSelect = document.querySelector('#participants');
  if (participantsSelect) {
    new Choices(participantsSelect, {
      removeItemButton: true,       // برای حذف انتخاب‌ها با ضربدر
      placeholder: true,            // نمایش placeholder
      placeholderValue: 'از لیست افراد وارد شده انتخاب کنید',
      noResultsText: 'نتیجه‌ای یافت نشد',
      itemSelectText: '',           // متن انتخاب
      shouldSort: false,            // ترتیب رو حفظ کن
    });
  }
});

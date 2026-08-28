(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     Utilities
  --------------------------------------------------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------------------------------------------------------------------
     Footer year
  --------------------------------------------------------------------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const startYear = 2019;
  const currentYear = new Date().getFullYear();
  const yearsExperience = currentYear - startYear;
  const numberWords = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
  ];
  document.getElementById("yearsExperience").textContent =
    numberWords[yearsExperience];

  /* ---------------------------------------------------------------------
     Header: blur + shadow once the page has scrolled
  --------------------------------------------------------------------- */
  const header = $("#siteHeader");
  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------------
     Mobile menu
  --------------------------------------------------------------------- */
  const menuToggle = $("#menuToggle");
  const primaryNav = $("#primaryNav");

  function closeMenu() {
    menuToggle.classList.remove("is-open");
    primaryNav.classList.remove("is-open");
    header.classList.remove("is-menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  function toggleMenu() {
    const open = primaryNav.classList.toggle("is-open");
    menuToggle.classList.toggle("is-open", open);
    header.classList.toggle("is-menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }
  menuToggle.addEventListener("click", toggleMenu);

  /* ---------------------------------------------------------------------
     SPA-style view routing (Home / About / Clients / Info / Book)
  --------------------------------------------------------------------- */
  const views = $$(".view");
  const navLinks = $$(".nav-link");

  function showView(name, { scroll = true } = {}) {
    let matched = false;
    views.forEach((v) => {
      const active = v.dataset.view === name;
      v.classList.toggle("is-active", active);
      if (active) matched = true;
    });
    if (!matched) {
      views.forEach((v) =>
        v.classList.toggle("is-active", v.dataset.view === "home"),
      );
      name = "home";
    }
    navLinks.forEach((l) =>
      l.classList.toggle("is-active", l.dataset.target === name),
    );
    header.classList.toggle("is-on-hero", name === "home");
    if (scroll)
      window.scrollTo({
        top: 0,
        behavior: "instant" in window ? "instant" : "auto",
      });
    closeMenu();
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.dataset.target;
      history.pushState(null, "", "#" + target);
      showView(target);
    });
  });

  window.addEventListener("popstate", () => {
    showView((location.hash || "#home").slice(1));
  });

  // initial route
  showView((location.hash || "#home").slice(1), { scroll: false });

  /* ---------------------------------------------------------------------
     Testimonials — simple fade rotation with dots
  --------------------------------------------------------------------- */
  const testimonials = $$(".testimonial");
  const dotsWrap = $("#testimonialDots");
  let tIndex = 0;
  let tTimer = null;

  if (testimonials.length) {
    testimonials.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.setAttribute("aria-label", "Show testimonial " + (i + 1));
      dot.addEventListener("click", () => setTestimonial(i));
      dotsWrap.appendChild(dot);
    });

    function setTestimonial(i) {
      tIndex = (i + testimonials.length) % testimonials.length;
      testimonials.forEach((t, idx) =>
        t.classList.toggle("is-active", idx === tIndex),
      );
      Array.from(dotsWrap.children).forEach((d, idx) =>
        d.classList.toggle("is-active", idx === tIndex),
      );
      restartAutoplay();
    }

    function restartAutoplay() {
      clearInterval(tTimer);
      tTimer = setInterval(() => setTestimonial(tIndex + 1), 6000);
    }

    setTestimonial(0);

    const prevBtn = $("#testimonialPrev");
    const nextBtn = $("#testimonialNext");
    if (prevBtn)
      prevBtn.addEventListener("click", () => setTestimonial(tIndex - 1));
    if (nextBtn)
      nextBtn.addEventListener("click", () => setTestimonial(tIndex + 1));
  }

  /* ---------------------------------------------------------------------
     FAQ accordion
  --------------------------------------------------------------------- */
  $$(".faq-question").forEach((btn) => {
    const answer = btn.nextElementSibling;
    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      // close all others
      $$(".faq-question").forEach((other) => {
        if (other !== btn) {
          other.setAttribute("aria-expanded", "false");
          other.nextElementSibling.style.maxHeight = null;
        }
      });

      btn.setAttribute("aria-expanded", String(!isOpen));
      answer.style.maxHeight = isOpen ? null : answer.scrollHeight + "px";
    });
  });

  /* ---------------------------------------------------------------------
     Consultation form — client-side validation + confirmation state
  --------------------------------------------------------------------- */
  const form = $("#bookForm");
  const success = $("#bookSuccess");

  const prefDateInput = $("#prefDate");
  if (prefDateInput) prefDateInput.min = new Date().toISOString().split("T")[0];

  const addressField = $("#addressField");
  const addressInput = $("#address");
  const apptRadios = $$('input[name="apptType"]');

  function syncAddressField() {
    const isMobile =
      form.querySelector('input[name="apptType"]:checked')?.value === "Mobile";
    addressField.classList.toggle("is-open", isMobile);
    if (!isMobile) {
      addressField.closest(".field")?.classList.remove("has-error");
      addressInput.value = "";
    }
  }
  apptRadios.forEach((r) => r.addEventListener("change", syncAddressField));
  syncAddressField();

  function setError(fieldEl, hasError) {
    fieldEl.classList.toggle("has-error", hasError);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameField = $("#fullName").closest(".field");
      const emailField = $("#email").closest(".field");
      const apptField = $('input[name="apptType"]').closest(".field");
      const dateField = $("#prefDate").closest(".field");
      const timeField = $("#prefTime").closest(".field");

      const nameOK = $("#fullName").value.trim().length > 1;
      const emailOK = isValidEmail($("#email").value.trim());
      const apptOK = !!form.querySelector('input[name="apptType"]:checked');
      const dateOK = $("#prefDate").value.trim().length > 0;
      const timeOK = $("#prefTime").value.trim().length > 0;
      const isMobile =
        apptOK &&
        form.querySelector('input[name="apptType"]:checked').value === "Mobile";
      const addressOK = !isMobile || addressInput.value.trim().length > 3;

      setError(nameField, !nameOK);
      setError(emailField, !emailOK);
      setError(apptField, !apptOK);
      setError(dateField, !dateOK);
      setError(timeField, !timeOK);
      setError(addressField, !addressOK);

      if (!nameOK || !emailOK || !apptOK || !dateOK || !timeOK || !addressOK) {
        const firstInvalid = form.querySelector(".has-error input, .has-error");
        if (firstInvalid)
          firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      // No backend is wired up — this simply confirms receipt in the UI.
      // Replace this block with a real submission (fetch/EmailJS/Formspree/etc).
      form.hidden = true;
      success.hidden = false;
    });

    $("#bookAnother").addEventListener("click", () => {
      form.reset();
      $$(".field", form).forEach((f) => f.classList.remove("has-error"));
      syncAddressField();
      success.hidden = true;
      form.hidden = false;
    });
  }
})();

/* Raman Metal Industries — interactions */
(function () {
  'use strict';

  /* ---------- mobile nav ---------- */
  var header = document.getElementById('siteHeader');
  var toggle = document.querySelector('.nav__toggle');
  var mobile = document.getElementById('mobileNav');

  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      mobile.hidden = open;
      header.classList.toggle('is-open', !open);
    });
    mobile.addEventListener('click', function (e) {
      if (e.target.tagName !== 'A') return;
      toggle.setAttribute('aria-expanded', 'false');
      mobile.hidden = true;
      header.classList.remove('is-open');
    });
  }

  /* ---------- desktop "Manufacturing" submenu (keyboard/touch) ---------- */
  var subBtn = document.querySelector('.nav__link--btn');
  if (subBtn) {
    subBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var open = subBtn.getAttribute('aria-expanded') === 'true';
      subBtn.setAttribute('aria-expanded', String(!open));
      subBtn.parentElement.classList.toggle('is-open', !open);
    });
    document.addEventListener('click', function (e) {
      if (!subBtn.parentElement.contains(e.target)) {
        subBtn.setAttribute('aria-expanded', 'false');
        subBtn.parentElement.classList.remove('is-open');
      }
    });
  }

  /* ---------- product carousel ---------- */
  var track = document.getElementById('rangeTrack');
  if (track) {
    var viewport = track.parentElement;
    var index = 0;

    function step() {
      var card = track.querySelector('.pcard');
      if (!card) return 373;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 25;
      return card.getBoundingClientRect().width + gap;
    }
    function maxIndex() {
      var per = Math.max(1, Math.round(viewport.clientWidth / step()));
      return Math.max(0, track.children.length - per);
    }
    function apply() {
      index = Math.min(Math.max(index, 0), maxIndex());
      track.style.transform = 'translateX(' + -index * step() + 'px)';
      document.querySelectorAll('.range__arrow').forEach(function (b) {
        var next = b.dataset.dir === 'next';
        b.disabled = next ? index >= maxIndex() : index <= 0;
      });
    }

    document.querySelectorAll('.range__arrow').forEach(function (btn) {
      btn.addEventListener('click', function () {
        index += btn.dataset.dir === 'next' ? 1 : -1;
        apply();
      });
    });

    window.addEventListener('resize', apply);
    apply();
  }

  /* ---------- contact form ---------- */
  var form = document.querySelector('.cform');
  if (form) {
    var status = form.querySelector('.cform__status');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;

      form.querySelectorAll('input, select').forEach(function (el) {
        var field = el.closest('.field');
        if (!field) return;
        var bad = !el.checkValidity();
        field.classList.toggle('is-invalid', bad);
        if (bad && ok) { el.focus(); ok = false; }
      });

      if (!ok) {
        status.textContent = 'Please complete the highlighted fields.';
        status.className = 'cform__status is-err';
        return;
      }

      // No backend is wired up yet — swap this for your endpoint.
      status.textContent = 'Thank you. We will get back to you shortly.';
      status.className = 'cform__status is-ok';
      form.reset();
    });

    form.addEventListener('input', function (e) {
      var field = e.target.closest('.field');
      if (field) field.classList.remove('is-invalid');
    });
  }

  /* ---------- smooth in-page scrolling ---------- */
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

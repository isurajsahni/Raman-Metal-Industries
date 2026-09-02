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
  if (track && track.parentElement) {
    /* Endless in both directions. Copies of the first cards trail the real ones
       and copies of the last cards lead them, so the belt never runs out. When
       the index lands in a cloned region we shift the track by exactly one full
       set of cards — the belt repeats with that period, so the swap cannot be
       seen — and the index is back on a real card. Nothing below depends on
       `transitionend` arriving: it is only an early hint, a timer is the backstop
       (a tab that is not painting never advances its transitions at all). */
    var viewport = track.parentElement;
    var arrows   = document.querySelectorAll('.range__arrow');
    var motionQ  = window.matchMedia ? window.matchMedia('(prefers-reduced-motion:reduce)') : null;

    var DURATION = 550;   // slide length, ms
    var EASING   = 'cubic-bezier(.22,.61,.36,1)';
    var DRAG_MIN = 6;     // px of travel before a pointer gesture counts as a drag
    var FLICK_V  = 0.35;  // px/ms — a swipe faster than this always changes card

    var cards   = [];     // the original <li>s, captured before anything is cloned
    var clones  = 0;      // copies added to EACH end; 0 while the carousel is static
    var index   = 0;      // index into track.children, NOT into cards
    var step    = 1;      // measured card width + gap
    var cardW   = 0;
    var looping = false;  // false when every card already fits on screen
    var timer   = null;   // settle fallback
    var resizeTimer = null;

    function reduced() { return !!(motionQ && motionQ.matches); }

    /* ---- geometry (everything is measured; nothing is hardcoded) ---- */

    /* Rect differences are unaffected by the track's own transform, so this is
       safe to call mid-slide. */
    function measure() {
      var kids = track.children;
      if (!kids.length) { cardW = 0; step = 1; return; }
      var first = kids[0].getBoundingClientRect();
      cardW = first.width;
      step  = kids.length > 1
        ? kids[1].getBoundingClientRect().left - first.left
        : cardW + (parseFloat(getComputedStyle(track).columnGap) || 0);
      if (!(step > 0)) step = cardW || 1;
    }

    /* Cards that are at least partly visible — the belt must cover all of them. */
    function perView() {
      return Math.max(1, Math.ceil(viewport.clientWidth / step));
    }

    /* True when the whole row already fits and there is nothing to scroll. */
    function fitsWhole() {
      var gap = Math.max(0, step - cardW);
      return cards.length * step - gap <= viewport.clientWidth + 1;
    }

    /* One spare card beyond what is on screen, so a slide — or an over-drag —
       can never reach the end of the belt. 0 means "sit still". */
    function wantedClones() {
      if (!cards.length || fitsWhole()) return 0;
      return Math.min(cards.length, perView() + 1);
    }

    /* ---- transform ---- */

    /* Live translateX, correct even while a transition is running. */
    function currentX() {
      var m = getComputedStyle(track).transform;
      if (!m || m === 'none') return 0;
      var v = m.slice(m.indexOf('(') + 1, m.lastIndexOf(')')).split(',');
      return parseFloat(v.length > 6 ? v[12] : v[4]) || 0;   // matrix3d puts tx at 12
    }

    /* The one place the transform is written. */
    function setX(x, animate) {
      track.style.transition = animate ? 'transform ' + DURATION + 'ms ' + EASING : 'none';
      track.style.transform  = 'translateX(' + x + 'px)';
    }

    /* Walk `index` back onto a real card, moving the track by whole sets as we
       go. Because the belt repeats every `cards.length` cards this is invisible,
       whether the track is parked or halfway through a slide. */
    function normalize() {
      if (!looping) return;
      var cycle = cards.length * step;
      var shift = 0;
      while (index >= clones + cards.length) { index -= cards.length; shift += cycle; }
      while (index < clones)                 { index += cards.length; shift -= cycle; }
      if (shift) setX(currentX() + shift, false);
    }

    /* ---- moving ---- */

    function clearSettle() {
      if (timer) { clearTimeout(timer); timer = null; }
      track.removeEventListener('transitionend', onTransitionEnd);
    }
    function onTransitionEnd(e) {
      if (e.target === track && e.propertyName === 'transform') settle();
    }
    /* Runs on transitionend OR on the timer, whichever comes first. Landing
       early only costs the tail of an animation nobody could see. */
    function settle() {
      clearSettle();
      normalize();
      setX(-index * step, false);
    }

    /* Animate to whatever `index` now says, then arm the settle. */
    function glide() {
      clearSettle();
      if (reduced()) { setX(-index * step, false); normalize(); return; }
      void track.offsetHeight;                 // flush the untransitioned position first
      setX(-index * step, true);
      timer = setTimeout(settle, DURATION + 80);
      track.addEventListener('transitionend', onTransitionEnd);
    }

    /* A burst of clicks — or a tab that is not painting, whose transitions never
       advance — can leave the track several cards behind `index`. Close that gap
       in one go: the belt is finite, and letting the two drift apart is what
       would eventually slide it past the end. */
    function resync() {
      if (Math.abs(-currentX() / step - index) > 1) setX(-index * step, false);
    }

    function move(delta) {
      if (!looping) return;
      clearSettle();
      resync();
      normalize();                             // start from a canonical position
      index += delta;
      glide();
    }

    /* ---- building the belt ---- */

    function makeClone(node) {
      var copy = node.cloneNode(true);
      copy.setAttribute('data-clone', '');
      copy.setAttribute('aria-hidden', 'true');          // duplicates, not content
      copy.querySelectorAll('a,button,input,select,textarea,[tabindex]')
          .forEach(function (el) { el.setAttribute('tabindex', '-1'); });
      return copy;
    }

    /* `keep` is the real-card index that should end up under the left edge. */
    function build(keep) {
      var i;
      track.querySelectorAll('[data-clone]').forEach(function (el) { track.removeChild(el); });

      measure();
      clones  = wantedClones();
      looping = clones > 0;
      markArrows();

      if (!looping) {                          // everything fits: park it
        index = 0;
        setX(0, false);
        return;
      }

      for (i = 0; i < clones; i++) track.appendChild(makeClone(cards[i]));
      for (i = 0; i < clones; i++) {
        track.insertBefore(makeClone(cards[cards.length - 1 - i]), track.firstChild);
      }

      index = clones + Math.min(Math.max(keep || 0, 0), cards.length - 1);
      setX(-index * step, false);
    }

    function markArrows() {
      arrows.forEach(function (btn) {
        btn.disabled = false;                  // the carousel never dead-ends now
        if (looping) btn.removeAttribute('aria-disabled');
        else btn.setAttribute('aria-disabled', 'true');
      });
      viewport.classList.toggle('is-draggable', looping);
    }

    /* ---- resize: re-measure, and only touch the DOM if the belt must change ---- */

    function onResize() {
      clearSettle();
      normalize();
      measure();
      if (wantedClones() !== clones) build(looping ? index - clones : 0);
      else setX(looping ? -index * step : 0, false);
    }

    /* ---- pointer drag / swipe ---- */

    var pointerId = null, downX = 0, downY = 0, downTime = 0;
    var baseX = 0, dragDX = 0, dragging = false, decided = false;

    function onPointerDown(e) {
      if (!looping || !e.isPrimary) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pointerId = e.pointerId;
      downX = e.clientX; downY = e.clientY; downTime = Date.now();
      dragDX = 0; dragging = false; decided = false;
    }

    function onPointerMove(e) {
      if (pointerId === null || e.pointerId !== pointerId) return;
      var dx = e.clientX - downX;
      var dy = e.clientY - downY;

      if (!decided) {
        if (Math.abs(dx) < DRAG_MIN && Math.abs(dy) < DRAG_MIN) return;
        decided = true;
        /* A mostly-vertical gesture is none of our business — dropping it here is
           what keeps the page scrollable under a finger. */
        if (Math.abs(dx) <= Math.abs(dy)) { pointerId = null; return; }
        dragging = true;
        clearSettle();
        normalize();
        baseX = currentX();                    // pick the track up wherever it is
        setX(baseX, false);
        viewport.classList.add('is-dragging');
        if (viewport.setPointerCapture) {
          try { viewport.setPointerCapture(pointerId); } catch (err) {}
        }
      }
      if (!dragging) return;

      dragDX = dx;
      var x = baseX + dx;
      /* Rebase by whole sets so even a very long drag keeps finding belt. */
      var cycle = cards.length * step;
      while (-x >= (clones + cards.length) * step) { baseX += cycle; x += cycle; }
      while (-x <   clones * step)                 { baseX -= cycle; x -= cycle; }
      if (e.cancelable) e.preventDefault();    // no text selection / image ghosting
      setX(x, false);
    }

    function onPointerUp(e) {
      if (pointerId === null || (e && e.pointerId !== pointerId)) return;
      var wasDragging = dragging;
      var dx = dragDX;
      pointerId = null; dragging = false; decided = false;
      viewport.classList.remove('is-dragging');
      if (!wasDragging) return;

      var speed = Math.abs(dx) / Math.max(1, Date.now() - downTime);   // px/ms
      var here  = -(baseX + dx) / step;        // fractional card under the left edge
      /* A flick commits to the next card along; anything gentler settles on the
         nearest one, which is what makes a 3px nudge spring straight back. */
      index = (speed > FLICK_V && Math.abs(dx) > 4)
        ? (dx < 0 ? Math.floor(here) + 1 : Math.ceil(here) - 1)
        : Math.round(here);
      glide();

      /* Swallow the click the browser fires after a real drag. */
      if (Math.abs(dx) > 4) {
        viewport.addEventListener('click', swallowClick, true);
        setTimeout(function () {
          viewport.removeEventListener('click', swallowClick, true);
        }, 0);
      }
    }

    function swallowClick(e) { e.preventDefault(); e.stopPropagation(); }

    function onKey(e) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); move(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
    }

    /* ---- wiring ---- */

    for (var seed = 0; seed < track.children.length; seed++) cards.push(track.children[seed]);

    viewport.setAttribute('tabindex', '0');
    viewport.setAttribute('role', 'group');
    viewport.setAttribute('aria-roledescription', 'carousel');
    if (!viewport.getAttribute('aria-label')) {
      viewport.setAttribute('aria-label', 'Manufacturing range');
    }
    /* Horizontal pans are ours, vertical ones stay with the page. Mirrored in
       the stylesheet — this line is only here so the swipe works without it. */
    viewport.style.touchAction = 'pan-y';

    arrows.forEach(function (btn) {
      btn.type = 'button';
      btn.addEventListener('click', function () {
        move(btn.dataset.dir === 'next' ? 1 : -1);
      });
    });

    viewport.addEventListener('keydown', onKey);
    var rangeNav = document.querySelector('.range__nav');
    if (rangeNav) rangeNav.addEventListener('keydown', onKey);

    viewport.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    /* Images are natively draggable, which would fight the swipe. */
    viewport.addEventListener('dragstart', function (e) {
      if (pointerId !== null) e.preventDefault();
    });
    viewport.addEventListener('selectstart', function (e) {
      if (dragging) e.preventDefault();
    });

    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(onResize, 150);
    });
    window.addEventListener('load', onResize);   // late-loading images / fonts

    build(0);
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

/* Lekhya one-pager — minimal, dependency-free, no network calls. */
(function () {
  'use strict';

  // Store links. Set `ios` to the real App Store URL once the listing is live —
  // until then it stays null and the iOS badges are hidden rather than pointing
  // at a placeholder id, which would render every "Download on the App Store"
  // button as a dead link.
  var STORE = {
    ios: null,
    android: 'https://play.google.com/store/apps/details?id=com.btech.lekhya'
  };

  // Wire real store URLs onto every badge/button that declares a platform, and
  // hide any badge whose store isn't live yet.
  document.querySelectorAll('[data-store]').forEach(function (el) {
    var url = STORE[el.getAttribute('data-store')];
    if (url) {
      el.setAttribute('href', url);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
    } else {
      el.hidden = true;
      el.setAttribute('aria-hidden', 'true');
    }
  });

  // Surface the visitor's likely platform first (gentle, not forced).
  var ua = navigator.userAgent || '';
  var isAndroid = /Android/i.test(ua);
  var isIOS = /iPhone|iPad|iPod/i.test(ua) || (/Mac/i.test(ua) && 'ontouchend' in document);
  if (isAndroid || isIOS) {
    var want = isAndroid ? 'android' : 'ios';
    document.querySelectorAll('.cta-row').forEach(function (row) {
      var primary = row.querySelector('[data-store="' + want + '"]');
      if (primary && primary.parentNode.firstElementChild !== primary) {
        primary.parentNode.insertBefore(primary, primary.parentNode.firstElementChild);
      }
    });
  }

  // Current year in the footer.
  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());

  // Mobile nav toggle.
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  if (toggle && header) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    header.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () {
        header.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Scroll-reveal — respects prefers-reduced-motion via CSS fallback.
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }
})();

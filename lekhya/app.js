/* Lekhya one-pager — minimal, dependency-free. The only network call is the
   feedback form's, and only when a visitor presses Send. */
(function () {
  'use strict';

  // Store links. Set `ios` to the real App Store URL once the listing is live,
  // and turn the "Coming soon" <span> badges in the HTML back into <a> links.
  var STORE = {
    ios: null,
    android: 'https://play.google.com/store/apps/details?id=com.btech.lekhya'
  };

  // Wire real store URLs onto every link that declares a platform. A "Coming
  // soon" badge is a <span>, not a link, so it stays visible and inert; a link
  // whose store isn't live yet is hidden rather than left dead.
  document.querySelectorAll('a[data-store]').forEach(function (el) {
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

  // Feedback inbox. Posts to a Google Apps Script web app (lekhya/feedback/)
  // that emails the team group. Until FEEDBACK_URL is set, or if the post
  // fails, the visitor gets a pre-filled email instead, so nothing typed is lost.
  var FEEDBACK_URL = '';
  var FEEDBACK_TO = 'lekhya-app@googlegroups.com';
  var form = document.getElementById('fb-form');
  if (form) {
    var hi = document.documentElement.lang === 'hi';
    var t = hi ? {
      sending: 'भेजा जा रहा है…',
      ok: 'धन्यवाद! आपका संदेश हमें मिल गया।',
      mail: 'आपका ईमेल ऐप खुल रहा है — वहाँ से भेज दें।',
      fail: 'अभी भेजा नहीं जा सका। ',
      fallback: 'ईमेल से भेजें'
    } : {
      sending: 'Sending…',
      ok: 'Thank you! Your message reached us.',
      mail: 'Your email app is opening — send it from there.',
      fail: "Couldn't send just now. ",
      fallback: 'Send by email instead'
    };
    var status = form.querySelector('.fb-status');
    var button = form.querySelector('button[type="submit"]');
    var say = function (state, text, href) {
      status.setAttribute('data-state', state);
      status.textContent = text;
      if (href) {
        var a = document.createElement('a');
        a.href = href;
        a.textContent = t.fallback;
        status.appendChild(a);
      }
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault(); // the browser has already enforced required/email/maxlength
      var d = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        type: form.elements.type.value,
        message: form.elements.message.value.trim(),
        website: form.elements.website.value, // honeypot
        lang: hi ? 'hi' : 'en'
      };
      if (d.website) { say('ok', t.ok); form.reset(); return; }

      var subject = d.type === 'feature' ? 'Lekhya Feature Request' : 'Lekhya Feedback';
      var body = 'Name: ' + d.name + '\nEmail: ' + d.email + '\nType: ' + subject +
        '\nPage language: ' + d.lang + '\n\n' + d.message;
      var mailto = 'mailto:' + FEEDBACK_TO + '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      if (!FEEDBACK_URL) { say('ok', t.mail); window.location.href = mailto; return; }

      button.disabled = true;
      say('', t.sending);
      // text/plain keeps this a "simple" request: Apps Script can't answer a CORS preflight.
      fetch(FEEDBACK_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(d) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j.ok) throw new Error(j.error || 'failed');
          say('ok', t.ok);
          form.reset();
        })
        .catch(function () { say('err', t.fail, mailto); })
        .then(function () { button.disabled = false; });
    });
  }

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

/* ============================================================
   Time Zone Buddy — consent-gated website analytics
   ------------------------------------------------------------
   Firebase Analytics (GA4) is loaded ONLY after the visitor
   explicitly opts in. Until then no Firebase script is fetched,
   no cookies are set, and no data is sent to Google — satisfying
   the EU ePrivacy Directive / GDPR "prior consent" requirement.

   Consent choice is remembered in localStorage. A "Cookie
   Settings" link is injected into the footer so consent can be
   withdrawn/changed as easily as it was given.

   Each page sets `window.TZB_PAGE_SOURCE` before loading this file.
   ============================================================ */
(function () {
  'use strict';

  var CONSENT_KEY = 'tzb_cookie_consent_v1';
  var FIREBASE_VERSION = '12.13.0';
  var firebaseConfig = {
    apiKey: "AIzaSyCn7GMc5UZO7iKN3OsOkC23iQB7Zp9PNtY",
    authDomain: "time-zone-buddy-pinecode.firebaseapp.com",
    projectId: "time-zone-buddy-pinecode",
    storageBucket: "time-zone-buddy-pinecode.firebasestorage.app",
    messagingSenderId: "808205346526",
    appId: "1:808205346526:web:3aef061bd46ed801ec844f",
    measurementId: "G-05SZGTC4KJ"
  };

  var analyticsLoaded = false;

  function readConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function writeConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) { /* private mode */ }
  }

  // Dynamically import & initialise Firebase Analytics. Called only after
  // consent is granted, so nothing loads before opt-in.
  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    var base = 'https://www.gstatic.com/firebasejs/' + FIREBASE_VERSION + '/';
    Promise.all([
      import(base + 'firebase-app.js'),
      import(base + 'firebase-analytics.js')
    ]).then(function (mods) {
      var initializeApp = mods[0].initializeApp;
      var getAnalytics = mods[1].getAnalytics;
      var logEvent = mods[1].logEvent;

      var app = initializeApp(firebaseConfig);
      var analytics = getAnalytics(app);
      var source = window.TZB_PAGE_SOURCE || 'unknown';

      document.addEventListener('click', function (e) {
        var cta = e.target.closest && e.target.closest('[data-section]');
        if (cta) {
          logEvent(analytics, 'cta_click', { section: cta.dataset.section, source: source });
        }
      });
    }).catch(function () {
      analyticsLoaded = false; // allow a retry on a later visit
    });
  }

  function removeBanner() {
    var el = document.getElementById('tzb-cc');
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function showBanner() {
    if (document.getElementById('tzb-cc')) return;

    var wrap = document.createElement('div');
    wrap.className = 'tzb-cc';
    wrap.id = 'tzb-cc';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-label', 'Cookie consent');
    wrap.innerHTML = ''
      + '<div class="tzb-cc__inner">'
      +   '<p class="tzb-cc__text">We use Firebase Analytics to understand which features are popular '
      +     'and improve the app. Analytics cookies load <strong>only if you accept</strong>. '
      +     'See our <a href="privacy-policy.html">Privacy Policy</a>.</p>'
      +   '<div class="tzb-cc__actions">'
      +     '<button type="button" class="tzb-cc__btn tzb-cc__btn--ghost" data-cc="decline">Decline</button>'
      +     '<button type="button" class="tzb-cc__btn tzb-cc__btn--solid" data-cc="accept">Accept</button>'
      +   '</div>'
      + '</div>';

    wrap.querySelector('[data-cc="accept"]').addEventListener('click', function () {
      writeConsent('granted');
      removeBanner();
      loadAnalytics();
    });
    wrap.querySelector('[data-cc="decline"]').addEventListener('click', function () {
      writeConsent('denied');
      removeBanner();
    });

    document.body.appendChild(wrap);
  }

  // Wire any "Cookie Settings" links (placed statically in the footer) so they
  // reopen the consent prompt. Falls back to injecting one if a page has none.
  function wireSettingsLinks() {
    var links = document.querySelectorAll('[data-cc="settings"]');
    if (links.length) {
      Array.prototype.forEach.call(links, function (link) {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          showBanner();
        });
      });
      return;
    }
    var footer = document.querySelector('footer');
    if (!footer) return;
    var link = document.createElement('a');
    link.href = '#';
    link.textContent = 'Cookie Settings';
    link.setAttribute('data-cc', 'settings');
    link.className = 'hover:text-[var(--color-brand)] transition-colors';
    link.addEventListener('click', function (e) {
      e.preventDefault();
      showBanner();
    });
    footer.appendChild(link);
  }

  // Allow other UI (or the console) to reopen the consent prompt.
  window.tzbOpenCookieSettings = showBanner;

  function boot() {
    wireSettingsLinks();
    var consent = readConsent();
    if (consent === 'granted') {
      loadAnalytics();
    } else if (consent !== 'denied') {
      showBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

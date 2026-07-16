/**
 * Time Zone Buddy — Website JS
 * Alpine.js components + GSAP animations
 * Reference: docs/website_AI_instructions.md sections 6, 8, 9
 */

/* ── Theme Toggle ─────────────────────────────────────────── */

document.addEventListener('alpine:init', () => {

  Alpine.data('themeToggle', () => ({
    dark: false,
    init() {
      const stored = localStorage.getItem('theme');
      if (stored) {
        this.dark = stored === 'dark';
      } else {
        this.dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      this.apply();
    },
    toggle() {
      this.dark = !this.dark;
      localStorage.setItem('theme', this.dark ? 'dark' : 'light');
      this.apply();
    },
    apply() {
      document.documentElement.classList.toggle('dark', this.dark);
    }
  }));

  /* ── Sticky Nav ─────────────────────────────────────────── */

  Alpine.data('stickyNav', () => ({
    menuOpen: false,
    solid: false,
    init() {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        ScrollTrigger.create({
          trigger: '#hero',
          start: 'bottom top',
          onEnter:       () => { this.solid = true; },
          onLeaveBack:   () => { this.solid = false; }
        });
      }
    }
  }));

  /* ── Carousel ────────────────────────────────────────────── */

  Alpine.data('carousel', () => ({
    active: 0,
    total: 8,           // 8 screenshot slides (home, detail, meeting overlap, time shift, DST, home widgets, lock, gallery)
    touchStartX: 0,
    get prevIndex() { return (this.active - 1 + this.total) % this.total; },
    get nextIndex() { return (this.active + 1) % this.total; },
    prev()  { this.active = this.prevIndex; },
    next()  { this.active = this.nextIndex; },
    goTo(i) { this.active = i; },
    onTouchStart(e) { this.touchStartX = e.touches[0].clientX; },
    onTouchEnd(e) {
      const delta = e.changedTouches[0].clientX - this.touchStartX;
      if (delta < -40) this.next();
      else if (delta > 40) this.prev();
    },
    onKeyDown(e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); this.next(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); this.prev(); }
    },
    init() {}
  }));

  /* ── FAQ Accordion ───────────────────────────────────────── */

  Alpine.data('faqAccordion', () => ({
    open: null,
    items: [
      { q: 'What does the free version include?',
        a: 'Up to 5 time zones, the full aurora zone card display (daylight, sunrise/sunset, work hours), the time-shift planner, and the free Single Zone Home Screen widget (small & medium). Ads are shown. Groups, Meeting Overlap, Lock Screen & Meeting Hub widgets, DST alerts, notifications, and exports require Lifetime or Plus.' },
      { q: 'What is Lifetime? Is it really a one-time purchase?',
        a: 'Yes. The Lifetime option ($39.99 AUD) unlocks everything except iCloud Sync with a single purchase. No subscription, no renewal. You keep all current features forever on iOS, iPadOS, and macOS.' },
      { q: 'Why does Lifetime not include iCloud Sync?',
        a: "iCloud Sync is an active, continuously running service. Because it requires ongoing infrastructure and maintenance, it's the one feature that honestly belongs with a subscription. Everything else is a one-time unlock." },
      { q: 'What does Plus include that Lifetime doesn\'t?',
        a: 'iCloud Sync (your zones appear instantly on every Apple device), early access to new features, and future platform support (Windows, Web). If iCloud Sync matters to you, Plus is the right choice.' },
      { q: 'Is my data private?',
        a: 'Yes. Time Zone Buddy has no servers of our own and no accounts — your zones, groups, and settings never leave your device. We use only anonymous, aggregate analytics (Firebase) to see which features are used; it is never linked to your identity and never sold. iCloud Sync (Plus only) stores data in your personal iCloud account — not ours.' },
      { q: 'How do DST alerts work?',
        a: 'When a tracked timezone has an upcoming daylight saving change within 7 days, an amber banner appears on the Home screen (Lifetime/Plus only). Optional push notifications fire at 7 days before, the business day before, the morning of, and the day after — all scheduled on-device.' },
      { q: 'Does Time Zone Buddy work with Siri and Shortcuts?',
        a: 'Yes. Three App Shortcuts ship with the app and appear automatically in Siri, Spotlight, and the Shortcuts app: "Plan a meeting in Time Zone Buddy", "Add a time zone in Time Zone Buddy", and "Show alerts in Time Zone Buddy". Long-pressing the Home Screen icon exposes the same three Quick Actions. Saved zones are indexed in Spotlight — tap a result to open the zone instantly.' },
      { q: 'What are public holidays?',
        a: 'Lifetime and Plus subscribers see upcoming public holidays for each location in the detail screen. Data covers 100+ countries and is sourced from Nager.Date — a free, open-source public holiday API (MIT licence). Holiday data is cached on your device and works offline. A weekly version check runs automatically — if Nager.Date has updated their data, the cache refreshes so corrections reach you without waiting for the next annual cycle. Data is best-effort; some regional or local observances may not be reflected.' },
      { q: 'What is Meeting Overlap?',
        a: "Meeting Overlap finds the best time window across any number of timezones. It ranks windows by how many people's work hours they cover, and shows local times for each zone. Requires Lifetime or Plus." },
      { q: 'Does Time Zone Buddy have widgets?',
        a: "Yes. The Single Zone widget is free and comes in small and medium sizes — it shows any saved city's live time with daylight-aware shading, and the medium size adds a day timeline and a work-hours status line with the next start or finish time. Lifetime and Plus add Lock Screen clocks (circular, inline, and rectangular accessory widgets) and the Meeting Hub widget (small, medium, and large) showing who's working right now across all your zones, who's coming online soon, and who's off duty. Tap any widget to jump straight into the app. Widgets read your data on-device through a private App Group — nothing leaves your device." },
      { q: 'How do I add a time zone?',
        a: 'Tap the + button in the top-right corner. Search by city name, country, timezone abbreviation, or region (e.g. "Australia", "EST", "Tokyo"). Tap a result to add it.' },
      { q: 'Can I edit the name shown on a zone card?',
        a: 'Yes. Tap any zone to open the Detail view, then tap the pencil icon next to the city name. Type a custom display label (e.g. "Sarah in London", "NYC Office"). The IANA timezone is always shown below.' },
      { q: 'How do I create a group?',
        a: 'Groups require Lifetime or Plus. Tap the Manage Groups pill on the Home screen → tap + → name the group → add zones. You can reorder zones and collapse/expand groups on the Home screen.' },
      { q: 'How does the time-shift planner work?',
        a: 'The TimeShiftBar is docked at the bottom of the Home screen. Drag the slider ±12 hours in 15-minute steps. Tap the date or time above the slider to pick any future date. All zone cards update instantly.' },
      { q: 'Can I use Time Zone Buddy on iPad and Mac?',
        a: 'Yes. Time Zone Buddy runs on iPhone, iPad, and Mac. iCloud Sync (Plus) keeps your zones in sync across supported Apple devices.' },
      { q: 'Does the app require an internet connection?',
        a: 'No. All core functionality works offline. Network activity is limited to: MapKit city map thumbnails in the Detail view, SunriseSunset.io solar data (fetched once per location then cached), Firebase Analytics (anonymous aggregate events), iCloud Sync (Plus only), and App Store purchase processing.' },
      { q: 'How do I cancel my Plus subscription?',
        a: 'Go to iOS Settings → your Apple ID → Subscriptions → Time Zone Buddy Plus → Cancel Subscription. Cancelling stops future billing; Plus features remain active until the end of the current billing period.' },
      { q: 'How do I restore a purchase?',
        a: 'Open Time Zone Buddy → Settings → Restore Purchases. Your Lifetime purchase or Plus subscription will be restored using your Apple ID.' }
    ],
    toggle(i) {
      this.open = this.open === i ? null : i;
    }
  }));

});

/* ── GSAP Animations ─────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);

  // Hero entrance
  gsap.from('.hero-headline', { opacity: 0, y: 30, duration: 0.6, ease: 'power2.out' });
  gsap.from('.hero-subhead',  { opacity: 0, y: 30, duration: 0.6, delay: 0.15, ease: 'power2.out' });
  gsap.from('.hero-ctas',     { opacity: 0, y: 30, duration: 0.6, delay: 0.3,  ease: 'power2.out' });
  // Only the hero device frame should do the entrance reveal. The carousel
  // slides are also `.device-frame` elements, but their opacity is controlled
  // by the `.carousel-slide.active` CSS rule — letting GSAP write inline
  // `opacity` onto them permanently breaks the cross-fade (the active slide
  // gets stuck invisible), so they are excluded here.
  gsap.from('.device-frame:not(.carousel-slide)', { opacity: 0, scale: 0.95, duration: 0.8, delay: 0.2, ease: 'power2.out' });

  // Feature panels — alternate slide from left and right
  document.querySelectorAll('.feature-panel').forEach((panel, i) => {
    gsap.from(panel, {
      scrollTrigger: { trigger: panel, start: 'top 80%' },
      opacity: 0,
      x: i % 2 === 0 ? -60 : 60,
      duration: 0.7,
      ease: 'power2.out'
    });
  });

  // Final CTA
  const finalCta = document.querySelector('.final-cta');
  if (finalCta) {
    gsap.from(finalCta, {
      scrollTrigger: { trigger: finalCta, start: 'top 85%' },
      opacity: 0,
      y: 40,
      duration: 0.6,
      ease: 'power2.out'
    });
  }
});

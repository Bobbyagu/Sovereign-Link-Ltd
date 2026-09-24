/* Sovereign — vanilla JS: nav, reveal, testimonial slider, FAQ accordion, contact form */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');

  /* Header border on scroll */
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile nav */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.getElementById('primary-nav');
  const setNav = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    links.classList.toggle('open', open);
  };
  toggle.addEventListener('click', () => setNav(toggle.getAttribute('aria-expanded') !== 'true'));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });

  /* Active nav link on scroll */
  const navAnchors = [...links.querySelectorAll('a')];
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navAnchors.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['home', 'features', 'how-it-works', 'products', 'faq', 'contact'].forEach((id) => {
    const el = document.getElementById(id); if (el) spy.observe(el);
  });

  /* Reveal on scroll */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* Testimonial slider */
  const quotes = [...document.querySelectorAll('.quote')];
  const now = document.getElementById('qNow');
  let current = 0;
  const show = (i) => {
    current = (i + quotes.length) % quotes.length;
    quotes.forEach((q, idx) => {
      const active = idx === current;
      q.hidden = !active;
      q.classList.toggle('is-active', active);
    });
    now.textContent = current + 1;
  };
  document.getElementById('qPrev').addEventListener('click', () => show(current - 1));
  document.getElementById('qNext').addEventListener('click', () => show(current + 1));

  /* FAQ accordion (one open at a time) */
  const buttons = [...document.querySelectorAll('.acc-btn')];
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      buttons.forEach((b) => {
        b.setAttribute('aria-expanded', 'false');
        b.closest('.acc-item').classList.remove('open');
      });
      if (!open) {
        btn.setAttribute('aria-expanded', 'true');
        btn.closest('.acc-item').classList.add('open');
      }
    });
  });

  /* Contact form.
     Works two ways (set one on the <form> in index.html):
       data-endpoint="https://formspree.io/f/xxxx"  -> posts the form in the background
       data-email="you@yourdomain.com"              -> opens the visitor's email app */
  const form = document.getElementById('contactForm');
  const statusEl = document.getElementById('formStatus');
  const say = (msg, type) => { statusEl.textContent = msg; statusEl.className = 'form-status ' + (type || ''); };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    say('');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = new FormData(form);
    if (data.get('website')) return; /* honeypot: bots fill this in */
    const endpoint = form.dataset.endpoint.trim();
    const email = form.dataset.email.trim();
    const btn = form.querySelector('button[type="submit"]');

    if (endpoint) {
      btn.disabled = true; say('Sending…');
      try {
        const res = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(res.status);
        form.reset(); say('Thank you — your message has been sent.', 'ok');
      } catch (err) {
        say('Sorry, that didn’t send. Please try again in a moment.', 'err');
      } finally { btn.disabled = false; }
    } else if (email) {
      const body = 'Name: ' + data.get('name') + '\nEmail: ' + data.get('email') + '\n\n' + data.get('message');
      window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent('Website inquiry from ' + data.get('name')) + '&body=' + encodeURIComponent(body);
      say('Opening your email app to send the message…', 'ok');
    } else {
      say('The contact form isn’t connected yet.', 'err');
    }
  });
})();

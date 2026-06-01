/* ============================================================
   ŠPAJZA RESTAURANT — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ── A. LANGUAGE TOGGLE ───────────────────────────────── */
  const html        = document.documentElement;
  const langToggle  = document.getElementById('lang-toggle');
  const STORAGE_KEY = 'spajza-lang';

  function applyLanguage(lang) {
    html.lang = lang;
    html.dataset.lang = lang;

    /* Show the OTHER language on the toggle button */
    langToggle.textContent = lang === 'sl' ? 'EN' : 'SL';

    const T = window.TRANSLATIONS[lang];
    if (!T) return;

    /* 1. Elements with a data-key → UI strings from TRANSLATIONS */
    document.querySelectorAll('[data-key]').forEach(el => {
      const key = el.dataset.key;
      if (!(key in T)) return;
      /* Headings / paragraphs that contain HTML (e.g. <strong>) */
      if (el.tagName === 'P' && T[key].includes('<')) {
        el.innerHTML = T[key];
      } else {
        el.textContent = T[key];
      }
    });

    /* 2. Elements with inline data-sl / data-en → dish names etc. */
    document.querySelectorAll('[data-sl]').forEach(el => {
      const text = el.dataset[lang];
      if (text !== undefined) el.textContent = text;
    });

    /* 3. Placeholders */
    document.querySelectorAll('[data-placeholder-key]').forEach(el => {
      const key = el.dataset.placeholderKey;
      if (key in T) el.placeholder = T[key];
    });

    /* 4. Select first option */
    document.querySelectorAll('select option[data-key]').forEach(el => {
      const key = el.dataset.key;
      if (key in T) el.textContent = T[key];
    });

    /* 5. Update lightbox caption if open */
    const lbCaption = document.getElementById('lightbox-caption');
    const lbImg     = document.querySelector('#lightbox img');
    if (lbCaption && lbImg && lbImg.dataset.captionKey) {
      lbCaption.textContent = T[lbImg.dataset.captionKey] || '';
    }

    localStorage.setItem(STORAGE_KEY, lang);
  }

  function toggleLanguage() {
    const current = html.dataset.lang || 'sl';
    applyLanguage(current === 'sl' ? 'en' : 'sl');
  }

  langToggle.addEventListener('click', toggleLanguage);

  /* Restore saved preference, then apply */
  const saved = localStorage.getItem(STORAGE_KEY) || 'sl';
  applyLanguage(saved);


  /* ── B. NAVBAR ─────────────────────────────────────────── */
  const navbar    = document.getElementById('navbar');
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks  = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    const open = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!open));
    navLinks.classList.toggle('nav-open', !open);
  });

  /* Close mobile menu when a link is clicked */
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('nav-open');
    });
  });


  /* ── C. MENU TABS ──────────────────────────────────────── */
  const tabs   = document.querySelectorAll('[role="tab"]');
  const panels = document.querySelectorAll('[role="tabpanel"]');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
      panels.forEach(p => p.classList.remove('active'));
      tab.setAttribute('aria-selected', 'true');
      const targetPanel = document.querySelector(`[data-panel="${tab.dataset.tab}"]`);
      if (targetPanel) targetPanel.classList.add('active');
    });

    /* Keyboard navigation for tabs */
    tab.addEventListener('keydown', e => {
      const tabArray = [...tabs];
      const idx = tabArray.indexOf(tab);
      if (e.key === 'ArrowRight') {
        tabArray[(idx + 1) % tabArray.length].focus();
        tabArray[(idx + 1) % tabArray.length].click();
      } else if (e.key === 'ArrowLeft') {
        tabArray[(idx - 1 + tabArray.length) % tabArray.length].focus();
        tabArray[(idx - 1 + tabArray.length) % tabArray.length].click();
      }
    });
  });


  /* ── D. SCROLL REVEAL ──────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach(el => revealObserver.observe(el));


  /* ── E. RESERVATION FORM ───────────────────────────────── */
  const form       = document.getElementById('reservation-form');
  const formStatus = document.getElementById('form-status');
  const dateInput  = document.getElementById('res-date');

  /* Set minimum date to today */
  if (dateInput) {
    dateInput.min = new Date().toISOString().split('T')[0];
  }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showStatus(type, message) {
    formStatus.textContent = message;
    formStatus.className = `form-status visible ${type}`;
  }

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const lang = html.dataset.lang || 'sl';
      const T    = window.TRANSLATIONS[lang];

      const name  = form.elements['name'].value.trim();
      const email = form.elements['email'].value.trim();
      const date  = form.elements['date'].value;
      const party = form.elements['party'].value;

      if (!name || !EMAIL_RE.test(email) || !date || !party) {
        showStatus('error', T.form_error);
        return;
      }

      /* Demo: no backend — show success and reset */
      /* TODO: replace with fetch POST to Formspree/Netlify Forms for production */
      showStatus('success', T.form_success);
      form.reset();
      dateInput.min = new Date().toISOString().split('T')[0];
    });
  }


  /* ── F. LIGHTBOX ───────────────────────────────────────── */
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = lightbox ? lightbox.querySelector('img') : null;
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxCap   = document.getElementById('lightbox-caption');

  function openLightbox(src, alt, captionKey) {
    if (!lightbox) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightboxImg.dataset.captionKey = captionKey;
    const lang = html.dataset.lang || 'sl';
    lightboxCap.textContent = window.TRANSLATIONS[lang][captionKey] || alt;
    lightbox.showModal();
  }

  document.querySelectorAll('.gallery-item').forEach(item => {
    function trigger() {
      const img        = item.querySelector('img');
      const captionKey = item.dataset.keyCaption;
      openLightbox(img.src, img.alt, captionKey);
    }

    item.addEventListener('click', trigger);
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger();
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => lightbox.close());
  }

  if (lightbox) {
    /* Close on backdrop click */
    lightbox.addEventListener('click', e => {
      const rect = lightbox.getBoundingClientRect();
      const clickedOutside =
        e.clientX < rect.left || e.clientX > rect.right ||
        e.clientY < rect.top  || e.clientY > rect.bottom;
      if (clickedOutside) lightbox.close();
    });
  }

})();

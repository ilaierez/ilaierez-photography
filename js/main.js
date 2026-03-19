/* ===========================
   MAIN.JS — Shared across all pages
   =========================== */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollReveal();
  initStats();
  initHeroBg();
  initContactForm();
});

/* -------------------------------------------------------
   NAV — sticky state, hamburger toggle, active link
------------------------------------------------------- */
function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const toggle   = document.querySelector('.nav__toggle');
  const menu     = document.querySelector('.nav__links');

  /* Scroll state */
  function onScroll() {
    nav.classList.toggle('nav--scrolled', window.scrollY > 20);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Hamburger */
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('nav__links--open');
      toggle.classList.toggle('nav__toggle--open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    /* Close when a nav link is clicked */
    menu.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('nav__links--open');
        toggle.classList.remove('nav__toggle--open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* Mark active link by current page filename */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    const linkPage = (link.getAttribute('href') || '').split('/').pop();
    const isHome   = (currentPage === '' || currentPage === 'index.html');
    const linkHome = (linkPage === 'index.html' || linkPage === '');
    if (linkPage === currentPage || (isHome && linkHome)) {
      link.classList.add('nav__link--active');
    }
  });
}

/* -------------------------------------------------------
   SCROLL REVEAL — IntersectionObserver on [data-reveal]
------------------------------------------------------- */
function initScrollReveal() {
  const elements = document.querySelectorAll('[data-reveal]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* -------------------------------------------------------
   STATS — count-up animation on scroll
------------------------------------------------------- */
function initStats() {
  const stats = document.querySelectorAll('.stat__number[data-target]');
  if (!stats.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateStat(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(stat => observer.observe(stat));
}

function animateStat(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1400;
  const start    = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    /* Ease-out cubic */
    const ease    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }

  requestAnimationFrame(step);
}

/* -------------------------------------------------------
   HERO BG — subtle pan effect on load
------------------------------------------------------- */
function initHeroBg() {
  const bg = document.querySelector('.hero__bg');
  if (!bg) return;
  /* Small delay lets the browser paint first */
  requestAnimationFrame(() => {
    setTimeout(() => bg.classList.add('is-loaded'), 100);
  });
}

/* -------------------------------------------------------
   CONTACT FORM — frontend validation + success message
------------------------------------------------------- */
function initContactForm() {
  const form = document.querySelector('.form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    const valid = validateForm(form);

    if (!valid) {
      e.preventDefault();
      return;
    }

    /* If the form still has the placeholder action, handle client-side */
    const action = form.getAttribute('action') || '';
    if (action.includes('YOUR_FORM_ID') || action === '') {
      e.preventDefault();
      showSuccess(form);
    }
    /* Otherwise the browser submits to Formspree normally */
  });

  /* Clear error styling on user input */
  form.querySelectorAll('.form__input, .form__select, .form__textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.classList.remove('form__input--error');
      const err = field.closest('.form__group')?.querySelector('.form__error');
      if (err) err.classList.remove('form__error--visible');
    });
  });
}

function validateForm(form) {
  let valid = true;

  const name    = form.querySelector('[name="name"]');
  const email   = form.querySelector('[name="email"]');
  const message = form.querySelector('[name="message"]');

  if (name && !name.value.trim()) {
    setFieldError(name, 'Please enter your name');
    valid = false;
  }
  if (email && !isValidEmail(email.value.trim())) {
    setFieldError(email, 'Please enter a valid email address');
    valid = false;
  }
  if (message && !message.value.trim()) {
    setFieldError(message, 'Please enter a message');
    valid = false;
  }

  return valid;
}

function setFieldError(field, msg) {
  field.classList.add('form__input--error');
  const group = field.closest('.form__group');
  if (!group) return;
  let err = group.querySelector('.form__error');
  if (!err) {
    err = document.createElement('span');
    err.className = 'form__error';
    group.appendChild(err);
  }
  err.textContent = msg;
  err.classList.add('form__error--visible');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showSuccess(form) {
  const success = form.querySelector('.form__success');
  if (success) success.classList.add('form__success--visible');

  form.querySelectorAll('.form__input, .form__select, .form__textarea').forEach(f => {
    f.value = '';
  });

  const btn = form.querySelector('[type="submit"]');
  if (btn) {
    btn.disabled = true;
    setTimeout(() => { btn.disabled = false; }, 5000);
  }
}

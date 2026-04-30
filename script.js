/* ================================================================
   PORTFOLIO — script.js
   All interactive features & animations
   ================================================================ */

'use strict';

/* ── 01. LOADER ───────────────────────────────────────────────── */
(function initLoader() {
  const loader       = document.getElementById('loader');
  const loaderText   = document.getElementById('loaderText');
  const loaderProg   = document.getElementById('loaderProgress');
  const words        = ['initialising'];
  let   wordIdx      = 0;
  let   charIdx      = 0;
  let   progress     = 0;
  let   progInterval;

  // Animate progress bar
  progInterval = setInterval(() => {
    progress += Math.random() * 18;
    if (progress > 100) progress = 100;
    loaderProg.style.width = progress + '%';
    if (progress >= 100) clearInterval(progInterval);
  }, 120);

  // Typing in loader
  function typeWord() {
    if (wordIdx >= words.length) {
      setTimeout(hideLoader, 100);
      return;
    }
    const word = words[wordIdx];
    if (charIdx <= word.length) {
      loaderText.textContent = word.slice(0, charIdx);
      charIdx++;
      setTimeout(typeWord, 60);
    } else {
      setTimeout(() => {
        charIdx = 0;
        wordIdx++;
        typeWord();
      }, 400);
    }
  }

  function hideLoader() {
    loader.classList.add('fade-out');
    document.body.style.overflow = '';
    setTimeout(() => loader.remove(), 600);
    // Trigger hero reveals after loader
    triggerHeroReveals();
  }

  // Prevent scroll during load
  document.body.style.overflow = 'hidden';
  setTimeout(typeWord, 200);
})();


/* ── 02. CUSTOM CURSOR ────────────────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Ring follows with lag
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Grow ring on hoverable elements
  const hoverables = 'a, button, .project-card, .tech-icon-item, .skill-card, .tl-card, input, textarea';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverables)) ring.classList.add('hovered');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverables)) ring.classList.remove('hovered');
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '';
  });
})();


/* ── 03. PARTICLE CANVAS ──────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], mouse = { x: null, y: null };
  const COUNT     = window.innerWidth < 768 ? 50 : 100;
  const MAX_DIST  = 130;
  const SPEED     = 0.4;

  function resize() {
    W = canvas.width  = canvas.parentElement.offsetWidth;
    H = canvas.height = canvas.parentElement.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : -4;
      this.vx = (Math.random() - 0.5) * SPEED;
      this.vy = (Math.random() - 0.5) * SPEED;
      this.r  = Math.random() * 1.6 + 0.4;
      this.alpha = Math.random() * 0.5 + 0.15;
    }
    update() {
      // Subtle mouse repulsion
      if (mouse.x !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 90) {
          this.vx += (dx / d) * 0.06;
          this.vy += (dy / d) * 0.06;
        }
      }
      // Damping
      this.vx *= 0.99;
      this.vy *= 0.99;
      this.x  += this.vx;
      this.y  += this.vy;

      // Wrap around
      if (this.x < -4) this.x = W + 4;
      if (this.x > W + 4) this.x = -4;
      if (this.y < -4) this.y = H + 4;
      if (this.y > H + 4) this.y = -4;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,230,190,${this.alpha})`;
      ctx.fill();
    }
  }

  function init() {
    particles = [];
    for (let i = 0; i < COUNT; i++) particles.push(new Particle());
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,230,190,${0.12 * (1 - d / MAX_DIST)})`;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(loop);
  }

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  window.addEventListener('resize', () => { resize(); init(); });

  resize();
  init();
  loop();
})();


/* ── 04. TYPING EFFECT (Hero) ─────────────────────────────────── */
(function initTyping() {
  const el    = document.getElementById('typingText');
  if (!el) return;
  const roles = [
    'Frontend Developer',
    'UI/UX Enthusiast',
    'React Developer',
    'Creative Coder',
  ];
  let rIdx = 0, cIdx = 0, deleting = false;
  const SPEED_TYPE = 80, SPEED_DEL = 45, PAUSE = 1800;

  function tick() {
    const current = roles[rIdx];
    if (!deleting) {
      el.textContent = current.slice(0, cIdx + 1);
      cIdx++;
      if (cIdx === current.length) {
        deleting = true;
        setTimeout(tick, PAUSE);
        return;
      }
    } else {
      el.textContent = current.slice(0, cIdx - 1);
      cIdx--;
      if (cIdx === 0) {
        deleting = false;
        rIdx = (rIdx + 1) % roles.length;
      }
    }
    setTimeout(tick, deleting ? SPEED_DEL : SPEED_TYPE);
  }

  setTimeout(tick, 1200);
})();


/* ── 05. HERO SCROLL-REVEAL (called after loader) ─────────────── */
function triggerHeroReveals() {
  const heroEls = document.querySelectorAll('.hero .reveal-up, .hero .reveal-fade');
  heroEls.forEach((el, i) => {
    const delay = parseFloat(getComputedStyle(el).getPropertyValue('--delay') || '0');
    setTimeout(() => el.classList.add('visible'), delay * 1000 + 100);
  });
}


/* ── 06. SCROLL-TRIGGERED ANIMATIONS (IntersectionObserver) ───── */
(function initScrollReveal() {
  const revealEls = document.querySelectorAll(
    '.reveal-up:not(.hero .reveal-up), .reveal-left, .reveal-right, .reveal-fade:not(.hero .reveal-fade)'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
})();


/* ── 07. SKILL BAR ANIMATION ──────────────────────────────────── */
(function initSkillBars() {
  const bars = document.querySelectorAll('.skill-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const pct = bar.dataset.pct;
        // Small delay so CSS transition fires after paint
        requestAnimationFrame(() => {
          setTimeout(() => { bar.style.width = pct + '%'; }, 150);
        });
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(b => observer.observe(b));
})();


/* ── 08. NAVBAR: scroll class + active section highlight ──────── */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function onScroll() {
    // Scrolled class
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active section
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.getAttribute('id');
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ── 09. MOBILE HAMBURGER ─────────────────────────────────────── */
(function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });

  // Close on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      btn.classList.remove('open');
    });
  });
})();


/* ── 10. DARK / LIGHT MODE TOGGLE ────────────────────────────── */
(function initTheme() {
  const btn  = document.getElementById('themeToggle');
  const html = document.documentElement;
  const key  = 'portfolio-theme';

  // Restore saved preference
  const saved = localStorage.getItem(key);
  if (saved) html.setAttribute('data-theme', saved);

  btn && btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem(key, next);
  });
})();


/* ── 11. EXPERIENCE TABS ──────────────────────────────────────── */
(function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      // Update button states
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show / hide panels
      document.querySelectorAll('.timeline').forEach(tl => {
        const isTarget = tl.id === `tab-${target}`;
        tl.classList.toggle('hidden', !isTarget);

        // Re-trigger reveal animations inside newly shown panel
        if (isTarget) {
          tl.querySelectorAll('.reveal-left, .reveal-right, .reveal-up').forEach(el => {
            el.classList.remove('visible');
            setTimeout(() => el.classList.add('visible'), 80);
          });
        }
      });
    });
  });
})();


/* ── 12. CONTACT FORM VALIDATION ─────────────────────────────── */
(function initContactForm() {
  const form       = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn  = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const submitIcon = document.getElementById('submitIcon');
  const successMsg = document.getElementById('formSuccess');

  // Error helpers
  function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
    const input = form.querySelector(`#${id.replace('Error', '')} ~ *`) ||
                  form.querySelector(`[id="f${id.replace('Error','')}"]`);
  }

  function clearErrors() {
    form.querySelectorAll('.form-error').forEach(e => e.textContent = '');
    form.querySelectorAll('.error').forEach(e => e.classList.remove('error'));
  }

  function setInputError(inputId, msg, errId) {
    const inp = document.getElementById(inputId);
    const err = document.getElementById(errId);
    if (inp) inp.classList.add('error');
    if (err) err.textContent = msg;
  }

  function validate() {
    clearErrors();
    let valid = true;

    const name    = document.getElementById('fname');
    const email   = document.getElementById('femail');
    const message = document.getElementById('fmessage');

    if (!name || !name.value.trim()) {
      setInputError('fname', 'Name is required.', 'nameError');
      valid = false;
    } else if (name.value.trim().length < 2) {
      setInputError('fname', 'Name must be at least 2 characters.', 'nameError');
      valid = false;
    }

    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !email.value.trim()) {
      setInputError('femail', 'Email is required.', 'emailError');
      valid = false;
    } else if (!emailRx.test(email.value.trim())) {
      setInputError('femail', 'Please enter a valid email.', 'emailError');
      valid = false;
    }

    if (!message || !message.value.trim()) {
      setInputError('fmessage', 'Message is required.', 'messageError');
      valid = false;
    } else if (message.value.trim().length < 10) {
      setInputError('fmessage', 'Message must be at least 10 characters.', 'messageError');
      valid = false;
    }

    return valid;
  }

  // Clear error on input
  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => {
      el.classList.remove('error');
      const errId = el.id.replace('f', '') + 'Error';
      const errEl = document.getElementById(errId);
      if (errEl) errEl.textContent = '';
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) return;

    // Simulate sending
    submitBtn.disabled = true;
    submitBtn.classList.add('btn-loading');
    submitText.textContent = 'Sending…';
    submitIcon.className   = 'bx bx-loader-alt';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.classList.remove('btn-loading');
      submitText.textContent = 'Send Message';
      submitIcon.className   = 'bx bx-send';
      successMsg.classList.add('show');
      form.reset();
      setTimeout(() => successMsg.classList.remove('show'), 5000);
    }, 1800);
  });
})();


/* ── 13. SCROLL-TO-TOP BUTTON ─────────────────────────────────── */
(function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ── 14. SMOOTH ANCHOR SCROLL ─────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '70');
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ── 15. FOOTER YEAR ──────────────────────────────────────────── */
(function setYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
})();


/* ── 16. PROJECT CARD GLOW FOLLOW MOUSE ──────────────────────── */
(function initCardGlow() {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x    = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
      const y    = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });
})();


/* ── 17. SECTION COUNT-UP NUMBERS (stats) ────────────────────── */
(function initCountUp() {
  const statNums = document.querySelectorAll('.stat-num');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.textContent.replace(/\D/g, '')) || 0;
      const suffix = el.textContent.replace(/[\d]/g, '');
      let   cur    = 0;
      const step   = Math.ceil(target / 40);
      const timer  = setInterval(() => {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(timer); }
        el.textContent = cur + suffix;
      }, 35);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => observer.observe(el));
})();


/* ── 18. TECH ICON TOOLTIP ────────────────────────────────────── */
(function initTooltips() {
  // Simple CSS-driven tooltips via data-tip attribute
  // (pure CSS fallback already works; this adds keyboard accessibility)
  document.querySelectorAll('[data-tip]').forEach(el => {
    el.setAttribute('title', el.dataset.tip);
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', el.dataset.tip);
  });
})();


/* ── 19. PAGE VISIBILITY — pause canvas when hidden ──────────── */
(function initVisibility() {
  // Particles are RAF-based; pausing saves battery on hidden tabs
  // We rely on the browser's built-in RAF throttling when tab is hidden
  document.addEventListener('visibilitychange', () => {
    // No extra work needed — rAF auto-pauses in hidden tabs
  });
})();


/* ── 20. KEYBOARD NAVIGATION ENHANCEMENTS ─────────────────────── */
(function initKeyboard() {
  // Show focus styles only on keyboard nav
  document.addEventListener('keydown', e => {
    if (e.key === 'Tab') document.body.classList.add('keyboard-nav');
  });
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
  });
})();


/* ── 21. GSAP-LIKE HERO TEXT STAGGER (pure JS) ───────────────── */
// Already handled via CSS --delay variables + triggerHeroReveals()
// This ensures the hero badge animates slightly after the CTA
(function initHeroBadge() {
  const badge = document.querySelector('.hero-badge');
  if (!badge) return;
  setTimeout(() => badge.classList.add('visible'), 1400);
})();

/* ── DONE ─────────────────────────────────────────────────────── */
console.log('%c< Himani Rodhiyal Portfolio />', 'color:#00e6be;font-family:monospace;font-size:1rem;font-weight:bold;');
console.log('%cBuilt with HTML · CSS · Vanilla JS', 'color:#6b7a90;font-family:monospace;font-size:.8rem;');
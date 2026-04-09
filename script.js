/* ================================================================
   AMAN'S PORTFOLIO — script.js
   Covers:
     1. Particle canvas (hero background network effect)
     2. Typed / rotating tagline
     3. Navbar scroll-state & mobile menu toggle
     4. Scroll-reveal (IntersectionObserver)
     5. Skill bar animation (triggered on reveal)
     6. Footer year auto-update
================================================================ */

/* ----------------------------------------------------------------
   1.  PARTICLE CANVAS NETWORK
       Draws floating dots connected by lines when close enough.
       Dots subtly react to the mouse cursor.
---------------------------------------------------------------- */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx   = canvas.getContext('2d');

  /* ── Config ── */
  const CONFIG = {
    count:       90,       /* number of particles */
    speed:       0.45,     /* base movement speed */
    maxDist:     130,      /* max distance to draw a connecting line */
    dotRadius:   2,        /* particle dot radius */
    mouseRadius: 140,      /* radius of mouse interaction */
    color:       '41, 121, 255',   /* electric blue (RGB) matching --accent */
    lineOpacity: 0.18,
  };

  let W, H, particles = [];
  let mouse = { x: null, y: null };

  /* Resize handler — keeps canvas pixel-perfect */
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  /* Track mouse (only within hero) */
  canvas.closest('#hero')?.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.closest('#hero')?.addEventListener('mouseleave', () => {
    mouse.x = null; mouse.y = null;
  });

  /* Particle class */
  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x  = Math.random() * W;
      this.y  = initial ? Math.random() * H : (Math.random() < .5 ? -5 : H + 5);
      this.vx = (Math.random() - .5) * CONFIG.speed * 2;
      this.vy = (Math.random() - .5) * CONFIG.speed * 2;
      this.r  = Math.random() * CONFIG.dotRadius + .8;
      this.opacity = Math.random() * .5 + .3;
    }

    update() {
      /* Mouse repulsion */
      if (mouse.x !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const d  = Math.hypot(dx, dy);
        if (d < CONFIG.mouseRadius) {
          const force = (CONFIG.mouseRadius - d) / CONFIG.mouseRadius;
          this.x += (dx / d) * force * 1.8;
          this.y += (dy / d) * force * 1.8;
        }
      }

      this.x += this.vx;
      this.y += this.vy;

      /* Wrap-around on edges */
      if (this.x < -10)    this.x = W + 10;
      if (this.x > W + 10) this.x = -10;
      if (this.y < -10)    this.y = H + 10;
      if (this.y > H + 10) this.y = -10;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.color}, ${this.opacity})`;
      ctx.fill();
    }
  }

  /* Spawn all particles */
  for (let i = 0; i < CONFIG.count; i++) particles.push(new Particle());

  /* Draw connecting lines between nearby particles */
  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.hypot(dx, dy);
        if (d < CONFIG.maxDist) {
          const alpha = (1 - d / CONFIG.maxDist) * CONFIG.lineOpacity;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${CONFIG.color}, ${alpha})`;
          ctx.lineWidth   = .8;
          ctx.stroke();
        }
      }
    }
  }

  /* Main animation loop */
  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animate);
  }
  animate();
})();


/* ----------------------------------------------------------------
   2.  TYPED / ROTATING TAGLINE
       Cycles through an array of roles, typing and erasing each.
---------------------------------------------------------------- */
(function initTyped() {
  const el = document.getElementById('typedRole');
  if (!el) return;

  const roles = [
    'JEE Aspirant',
    'Creative Editor',
    'Android Modder',
    'Linux Explorer',
    'Badminton Player',
  ];

  let   roleIdx  = 0;
  let   charIdx  = 0;
  let   isErasing = false;
  const TYPE_SPEED  = 85;   /* ms per character typed */
  const ERASE_SPEED = 45;   /* ms per character erased */
  const PAUSE_FULL  = 2200; /* ms to pause at full word */
  const PAUSE_EMPTY = 400;  /* ms to pause before typing next */

  function tick() {
    const current = roles[roleIdx];

    if (!isErasing) {
      /* Typing forward */
      charIdx++;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === current.length) {
        /* Pause at end before erasing */
        isErasing = true;
        setTimeout(tick, PAUSE_FULL);
        return;
      }
      setTimeout(tick, TYPE_SPEED);
    } else {
      /* Erasing backward */
      charIdx--;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === 0) {
        /* Move to next role */
        isErasing = false;
        roleIdx   = (roleIdx + 1) % roles.length;
        setTimeout(tick, PAUSE_EMPTY);
        return;
      }
      setTimeout(tick, ERASE_SPEED);
    }
  }

  /* Start after a short delay (lets hero animation settle) */
  setTimeout(tick, 1800);
})();


/* ----------------------------------------------------------------
   3.  NAVBAR: scroll state + mobile hamburger toggle
---------------------------------------------------------------- */
(function initNav() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  /* Add .scrolled class when page is scrolled past 10px */
  function handleScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); /* run once on load */

  /* Toggle mobile menu */
  hamburger?.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileMenu.classList.toggle('open', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
    /* Prevent body scroll when menu is open */
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
})();

/* Called from each mobile nav link's onclick */
function closeMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  hamburger?.classList.remove('open');
  hamburger?.setAttribute('aria-expanded', false);
  mobileMenu?.classList.remove('open');
  mobileMenu?.setAttribute('aria-hidden', true);
  document.body.style.overflow = '';
}


/* ----------------------------------------------------------------
   4.  SCROLL REVEAL — IntersectionObserver
       Adds .visible to .reveal elements as they enter viewport.
       Also triggers skill bar fill animation.
---------------------------------------------------------------- */
(function initReveal() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');

        /* If this revealed element (or its subtree) has skill bars,
           animate them to their target width */
        entry.target.querySelectorAll('.skill-fill').forEach(bar => {
          /* Small delay so the card animation completes first */
          setTimeout(() => {
            bar.style.width = bar.style.getPropertyValue('--p') ||
                              getComputedStyle(bar).getPropertyValue('--p');
          }, 200);
        });

        /* Stop observing once visible */
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,   /* trigger when 12% of element is visible */
      rootMargin: '0px 0px -40px 0px',
    }
  );

  /* Observe every .reveal element */
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ----------------------------------------------------------------
   5.  SKILL BAR FILL
       Reads the CSS custom property --p from inline style and
       sets the element's width. Called during reveal (above),
       but also runs on DOMContentLoaded as a fallback for
       elements already in the viewport.
---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  /* Trigger bars that are already visible on load */
  document.querySelectorAll('.skill-fill').forEach(bar => {
    /* The --p variable is set inline on each .skill-fill element */
    const target = bar.style.getPropertyValue('--p');
    if (target) {
      /* Delay slightly so CSS transition fires properly */
      setTimeout(() => { bar.style.width = target; }, 600);
    }
  });
});


/* ----------------------------------------------------------------
   6.  FOOTER — dynamic year
       Keeps the copyright year always current.
---------------------------------------------------------------- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ----------------------------------------------------------------
   7.  ACTIVE NAV LINK — highlight on scroll
       Marks whichever section is in view as "active" in the nav.
---------------------------------------------------------------- */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        links.forEach(link => {
          const isActive = link.getAttribute('href') === `#${id}`;
          link.style.color = isActive
            ? 'var(--accent)'
            : '';
        });
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach(sec => sectionObserver.observe(sec));
})();

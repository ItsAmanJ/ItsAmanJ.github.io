/* ================================================================
   AMAN'S PORTFOLIO — script-enhancements.js
   ENHANCEMENT PATCH — Add this script tag AFTER script.js

   New features:
     1.  Custom cursor (glow aura + precise dot)
     2.  Scroll progress rail (right side dots)
     3.  Magnetic card tilt on mouse move
     4.  Scroll-to-top button with SVG progress ring
     5.  Konami code easter egg
     6.  Heading line reveal fix (works with existing observer)
     7.  Smooth number count-up for stats
================================================================ */
/* ----------------------------------------------------------------
   2.  SCROLL PROGRESS RAIL
---------------------------------------------------------------- */
(function initScrollRail() {
  const sections = [
    { id: 'hero',         label: 'Home' },
    { id: 'about',        label: 'About' },
    { id: 'skills',       label: 'Skills' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'hobbies',      label: 'Hobbies' },
    { id: 'digitalhub',   label: 'Hub' },
    { id: 'contact',      label: 'Contact' },
  ];

  const rail = document.createElement('nav');
  rail.id = 'scroll-rail';
  rail.setAttribute('aria-label', 'Section navigation');

  sections.forEach((sec, i) => {
    if (i > 0) {
      const line = document.createElement('div');
      line.className = 'rail-line';
      rail.appendChild(line);
    }

    const dot = document.createElement('button');
    dot.className = 'rail-section-dot';
    dot.setAttribute('data-label', sec.label);
    dot.setAttribute('aria-label', 'Go to ' + sec.label);
    dot.addEventListener('click', () => {
      const el = document.getElementById(sec.id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
    rail.appendChild(dot);
  });

  document.body.appendChild(rail);

  // Show rail after scrolling past hero
  const hero = document.getElementById('hero');
  const dots = rail.querySelectorAll('.rail-section-dot');

  const sectionEls = sections.map(s => document.getElementById(s.id)).filter(Boolean);

  // IntersectionObserver to track active section
  const railObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = sectionEls.indexOf(entry.target);
          dots.forEach((d, i) => d.classList.toggle('active', i === idx));
        }
      });
    },
    { rootMargin: '-30% 0px -65% 0px' }
  );

  sectionEls.forEach(el => railObserver.observe(el));

  // Show/hide rail based on scroll position
  window.addEventListener('scroll', () => {
    if (!hero) return;
    const heroBottom = hero.getBoundingClientRect().bottom;
    rail.classList.toggle('visible', heroBottom < 0);
  }, { passive: true });
})();


/* ----------------------------------------------------------------
   3.  MAGNETIC CARD TILT
        Subtle 3D tilt following mouse position within cards.
---------------------------------------------------------------- */
(function initMagneticCards() {
  const cards = document.querySelectorAll('.hobby-card, .skill-card, .gaming-card');

  cards.forEach(card => {
    card.classList.add('magnetic-card');

    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const tiltX  = dy * -8;  // max 8deg tilt
      const tiltY  = dx *  8;

      card.style.transform = `
        perspective(800px)
        rotateX(${tiltX}deg)
        rotateY(${tiltY}deg)
        translateZ(4px)
        translateY(-4px)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(.22,1,.36,1), box-shadow 0.5s ease';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';
    });
  });
})();


/* ----------------------------------------------------------------
   4.  SCROLL-TO-TOP BUTTON WITH PROGRESS RING
---------------------------------------------------------------- */
(function initScrollTop() {
  const btn = document.createElement('button');
  btn.id = 'scroll-top-btn';
  btn.setAttribute('aria-label', 'Scroll to top');
  btn.innerHTML = `
    <svg class="progress-ring" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r="26"/>
    </svg>
    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
         width="18" height="18">
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  `;
  document.body.appendChild(btn);

  const circle = btn.querySelector('.progress-ring circle');
  const CIRCUMFERENCE = 2 * Math.PI * 26; // ≈163
  circle.style.strokeDasharray = CIRCUMFERENCE;

  function updateProgress() {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const progress   = docHeight > 0 ? scrollTop / docHeight : 0;
    const offset     = CIRCUMFERENCE * (1 - progress);
    circle.style.strokeDashoffset = offset;

    btn.classList.toggle('visible', scrollTop > 400);
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ----------------------------------------------------------------
   5.  KONAMI CODE EASTER EGG
        Up Up Down Down Left Right Left Right B A
---------------------------------------------------------------- */
(function initKonami() {
  const KONAMI = [
    'ArrowUp','ArrowUp',
    'ArrowDown','ArrowDown',
    'ArrowLeft','ArrowRight',
    'ArrowLeft','ArrowRight',
    'b','a'
  ];
  let idx = 0;

  // Build matrix columns for background
  const matrixChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const overlay = document.createElement('div');
  overlay.id = 'konami-overlay';
  overlay.innerHTML = `
    <div class="konami-matrix" id="konamiMatrix"></div>
    <p class="konami-text">
      ↑ ↑ ↓ ↓ ← → ← → B A<br/>
      <span style="color:var(--accent-3); font-size:0.8em">achievement unlocked</span><br/><br/>
      <span style="font-size:2rem">🏆</span><br/>
      <span style="color:var(--text-primary); font-size:1.1rem; font-family:var(--font-display)">
        CHEAT CODE ACTIVATED
      </span><br/>
      <span style="color:var(--text-muted); font-size:0.75rem">
        97.616 percentile & still knows the Konami Code.<br/>
        True final boss energy. 🔥
      </span>
    </p>
    <button class="konami-close" id="konamiClose">[ ESC ] CLOSE</button>
  `;
  document.body.appendChild(overlay);

  // Spawn matrix columns
  const matrix = document.getElementById('konamiMatrix');
  for (let i = 0; i < 24; i++) {
    const col = document.createElement('div');
    col.className = 'konami-col';
    col.style.left = (i * 4.2) + '%';
    col.style.animationDuration = (Math.random() * 3 + 2) + 's';
    col.style.animationDelay    = (Math.random() * 2) + 's';
    let txt = '';
    for (let j = 0; j < 30; j++) {
      txt += matrixChars[Math.floor(Math.random() * matrixChars.length)] + '\n';
    }
    col.textContent = txt;
    matrix.appendChild(col);
  }

  function openKonami() {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Move focus into overlay so Escape key works without clicking
    setTimeout(() => document.getElementById('konamiClose')?.focus(), 50);
  }

  function closeKonami() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    idx = 0;
  }

  document.getElementById('konamiClose').addEventListener('click', closeKonami);

  document.addEventListener('keydown', e => {
    if (e.key === KONAMI[idx]) {
      idx++;
      if (idx === KONAMI.length) { openKonami(); }
    } else {
      idx = e.key === KONAMI[0] ? 1 : 0;
    }
  });

  overlay.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeKonami();
  });
})();


/* ----------------------------------------------------------------
   6.  HEADING LINE REVEAL FIX
        Make the .heading-line inside .section-heading animate
        when the parent .reveal gets .visible.
---------------------------------------------------------------- */
(function patchHeadingLineReveal() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.section-heading').forEach(h => observer.observe(h));
})();


/* ----------------------------------------------------------------
   7.  STATS COUNT-UP ANIMATION
        Animates the numbers in .stat-num when they scroll into view.
---------------------------------------------------------------- */
(function initStatCountUp() {
  const statNums = document.querySelectorAll('.stat-num');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        observer.unobserve(el);

        // Extract numeric value from the direct text node only (ignoring <sup> children)
        const supEl    = el.querySelector('sup');
        const supHTML  = supEl?.outerHTML || '';
        // Clone without sup to get clean number text
        const clone    = el.cloneNode(true);
        clone.querySelectorAll('sup').forEach(s => s.remove());
        const rawClean = clone.textContent.trim();

        const num = parseFloat(rawClean.replace(/[^0-9.]/g, ''));
        if (isNaN(num) || num === Infinity) return;

        const decimals = rawClean.includes('.') ? rawClean.split('.')[1]?.replace(/[^0-9]/g,'').length || 0 : 0;
        // suffix = any trailing non-numeric text after the number (e.g. nothing, since sup is removed)
     const suffix   = rawClean.replace(/^[\d.]+/, '');

        const duration  = 1800;
        const startTime = performance.now();

        function step(now) {
          const p    = Math.min((now - startTime) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          const val  = (num * ease).toFixed(decimals);
          // Rebuild: number + any plain suffix + original sup HTML (not duplicated)
          el.innerHTML = val + suffix + supHTML;
          if (p < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
      });
    },
    { threshold: 0.5 }
  );

  statNums.forEach(el => observer.observe(el));
})();
/* ----------------------------------------------------------------
   9.  HERO — Type-out secret message on name selection
        (matching the "select the name to reveal" easter egg hint)
---------------------------------------------------------------- */
(function initNameSelectEgg() {
  const heroName = document.querySelector('.hero-name');
  if (!heroName) return;

  let eggActive = false; // prevent duplicate badges

  document.addEventListener('selectionchange', () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const selected = sel.toString().trim().toLowerCase();
    if (selected === 'aman' && !eggActive) {
      eggActive = true;
      // Create a small floating badge
      const badge = document.createElement('div');
      badge.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        z-index: 9000;
        background: linear-gradient(135deg, var(--bg-card), #0f1e3d);
        border: 1px solid var(--accent);
        border-radius: 12px;
        padding: 1.25rem 2rem;
        font-family: var(--font-mono);
        font-size: .85rem;
        color: var(--accent-3);
        text-align: center;
        box-shadow: 0 0 60px rgba(41,121,255,0.3), 0 20px 60px rgba(0,0,0,0.8);
        transition: transform 0.4s cubic-bezier(.34,1.56,.64,1), opacity 0.4s ease;
        opacity: 0;
        pointer-events: none;
        line-height: 1.8;
      `;
      badge.innerHTML = `
        <div style="font-size:1.2rem; margin-bottom:.3rem;">✦</div>
        <div style="color:var(--text-primary); font-family:var(--font-display); font-size:1rem; font-weight:700;">
          You found it.
        </div>
        <div style="font-size:.72rem; color:var(--text-muted); margin-top:.35rem;">
          जय वाराणसी 🕉️
        </div>
      `;
      document.body.appendChild(badge);

      requestAnimationFrame(() => {
        badge.style.transform = 'translate(-50%, -50%) scale(1)';
        badge.style.opacity = '1';
      });

      setTimeout(() => {
        badge.style.transform = 'translate(-50%, -50%) scale(0.9)';
        badge.style.opacity = '0';
        setTimeout(() => { badge.remove(); eggActive = false; }, 400);
      }, 2800);
    }
  });
})();

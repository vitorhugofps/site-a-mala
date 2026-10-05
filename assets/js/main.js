/* =========================================================
   MARIA LAÍS · A MALA — interações e cenas de scroll
   GSAP 3 + ScrollTrigger + SplitText + Lenis
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isMobile = () => innerWidth <= 860;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: 'expo.out' });
  gsap.config({ nullTargetWarn: false });

  /* ---------- contatos ---------- */
  const WA = '5534984009272';
  const waLink = (msg) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
  // abre links externos com um <a> real (mais compatível que window.open)
  const openExternal = (href) => { const a = document.createElement('a'); a.href = href; a.target = '_blank'; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove(); };
  // modo prévia (página hospedada sem permissão de iframe): os vídeos abrem no YouTube
  const PREVIEW = document.documentElement.hasAttribute('data-preview') || !!window.AMALA_PREVIEW;

  /* ---------- dados do DVD (capítulos do vídeo oficial) ---------- */
  const DVD_ID = 'IL7bzaJbU4o';
  const DVD_LEN = 2474;
  const SETLIST = [
    { t: 0,    title: 'Esse Amor que me Mata / Não Olhe Assim / Antes de Voltar pra Casa' },
    { t: 305,  title: 'Final Feliz / Não Desligue o Telefone / O Amor não Deixa' },
    { t: 568,  title: 'Deu Bom Demais', ined: true },
    { t: 717,  title: 'Você Sempre Será / Bem que se Quis / Evidências' },
    { t: 999,  title: 'Reinicia (part. Naessa)', ined: true },
    { t: 1164, title: 'Te Levo Comigo / Conto de Fadas / No Dia do seu Casamento' },
    { t: 1472, title: 'Traumatizou', ined: true },
    { t: 1654, title: 'Nuvem de Lágrimas / Meu Desespero / Roupa de Lua de Mel' },
    { t: 1998, title: 'Camas Avulsas', ined: true },
    { t: 2181, title: 'Disk Me / Perto de Você / Prisão sem Grades' }
  ];
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  /* =========================================================
     Vídeo de abertura: 4K para telas grandes/retina
     ========================================================= */
  const intro = $('[data-intro]');
  (function pickIntro() {
    const q = new URLSearchParams(location.search).get('q');
    const c = navigator.connection || {};
    const px = Math.max(innerWidth, innerHeight) * (devicePixelRatio || 1);
    let src = intro.getAttribute('data-src-1080');
    if (q === '4k') src = intro.getAttribute('data-src-4k');
    else if (q === '720' || c.saveData || /(^|-)2g|3g/.test(c.effectiveType || '') || innerWidth < 700) src = intro.getAttribute('data-src-720');
    else if (px >= 2600) src = intro.getAttribute('data-src-4k');
    intro.src = src;
    intro.addEventListener('error', () => {
      const fb = intro.getAttribute('data-src-1080');
      if (!intro.src.endsWith(fb)) { intro.src = fb; intro.load(); intro.play().catch(() => {}); }
    }, { once: true });
    intro.load();
  })();

  /* =========================================================
     Scroll suave
     ========================================================= */
  let lenis = null;
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, touchMultiplier: 1.2 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  const scrollToEl = (el) => {
    if (!el) return;
    let target = el;
    // seções com cena presa: pular direto para o fim da cena
    if (el.id === 'dvd') { target = el.offsetTop + el.offsetHeight - innerHeight; }
    if (lenis) lenis.scrollTo(target, { duration: 1.6 });
    else (typeof target === 'number' ? scrollTo({ top: target }) : el.scrollIntoView());
  };
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const el = $(id);
    if (!el) return;
    e.preventDefault();
    closeMenu();
    scrollToEl(el);
  }));

  /* =========================================================
     Carregamento
     ========================================================= */
  const pctEl = $('[data-pct]');
  const prog = { v: 0 };
  const loadTween = gsap.to(prog, { v: 88, duration: 3.2, ease: 'power2.out', onUpdate: () => (pctEl.textContent = Math.round(prog.v)) });
  const videoReady = new Promise((r) => {
    if (intro.readyState >= 3) return r();
    intro.addEventListener('canplay', r, { once: true });
    intro.addEventListener('error', r, { once: true });
  });
  Promise.race([Promise.all([document.fonts.ready, videoReady]), new Promise((r) => setTimeout(r, 6500))]).then(() => {
    loadTween.kill();
    gsap.to(prog, { v: 100, duration: 0.5, ease: 'power1.out', onUpdate: () => (pctEl.textContent = Math.round(prog.v)), onComplete: reveal });
  });

  function reveal() {
    const loader = $('.loader');
    intro.play().catch(() => {});
    const tl = gsap.timeline({ onComplete: () => { loader.remove(); } });
    tl.to('.loader__eq i', { scaleY: 0.05, duration: 0.5, stagger: 0.05, ease: 'power3.in' })
      .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '-=0.1')
      .add(() => { document.body.classList.remove('is-loading'); lenis && lenis.start(); ScrollTrigger.refresh(); }, '-=0.6');
    if (!reduce) {
      tl.fromTo('.abertura__bars span', { height: '50vh' }, { height: isMobile() ? '6vh' : '11vh', duration: 1.8, ease: 'expo.inOut' }, '-=0.9')
        .from('.abertura__media', { scale: 1.25, duration: 2.6, ease: 'expo.out' }, '<')
        .from(titleSplit ? titleSplit.chars : '.abertura__title', { yPercent: 120, rotate: 6, opacity: 0, duration: 1.4, stagger: 0.035 }, '-=1.2')
        .from('.abertura__kicker, .abertura__foot, .abertura__scroll', { y: 24, opacity: 0, duration: 1.2, stagger: 0.12 }, '-=1.1');
    }
  }

  /* split de títulos (antes do reveal) */
  let titleSplit = null;
  if (!reduce) {
    titleSplit = new SplitText('.abertura__title', { type: 'chars,words', charsClass: 'char', wordsClass: 'word', aria: 'auto' });
  }

  /* =========================================================
     Cursor e botões magnéticos
     ========================================================= */
  if (fine && !reduce) {
    document.documentElement.classList.add('has-cursor');
    const cur = $('.cursor');
    const label = $('.cursor__label');
    const xTo = gsap.quickTo(cur, 'x', { duration: 0.35, ease: 'power3' });
    const yTo = gsap.quickTo(cur, 'y', { duration: 0.35, ease: 'power3' });
    addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); }, { passive: true });
    document.addEventListener('pointerover', (e) => {
      const lab = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button, [role="button"], label');
      cur.classList.toggle('is-label', !!lab);
      label.textContent = lab ? lab.dataset.cursor : '';
      cur.classList.toggle('is-link', !lab && !!link);
    });
    $$('[data-magnetic]').forEach((el) => {
      const mx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, .4)' });
      const my = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, .4)' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.3);
        my((e.clientY - r.top - r.height / 2) * 0.4);
      });
      el.addEventListener('pointerleave', () => { mx(0); my(0); });
    });
  }

  /* =========================================================
     Navegação, progresso, menu
     ========================================================= */
  const nav = $('[data-nav]');
  const bar = $('.progress span');
  const waFloat = $('.wa-float');
  let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      bar.style.transform = `scaleX(${self.progress})`;
      nav.classList.toggle('is-solid', y > innerHeight * 0.5);
      nav.classList.toggle('is-hidden', y > innerHeight * 1.2 && y > lastY + 2 && !menuOpen);
      if (y < lastY - 2) nav.classList.remove('is-hidden');
      lastY = y;
    }
  });
  ScrollTrigger.create({ trigger: '#manifesto', start: 'top 60%', onEnter: () => waFloat.classList.add('is-visible'), onLeaveBack: () => waFloat.classList.remove('is-visible') });

  const menu = $('#menu');
  const menuBtn = $('[data-menu-toggle]');
  let menuOpen = false;
  function closeMenu() { if (!menuOpen) return; menuOpen = false; menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); lenis && lenis.start(); }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) { closeMenu(); menuBtn.focus(); } });
  menuBtn.addEventListener('click', () => {
    menuOpen = !menuOpen;
    menu.hidden = !menuOpen;
    menuBtn.setAttribute('aria-expanded', String(menuOpen));
    if (menuOpen) { lenis && lenis.stop(); gsap.from('.menu a', { yPercent: 60, opacity: 0, duration: 0.8, stagger: 0.05 }); setTimeout(() => $('.menu a').focus(), 50); }
    else lenis && lenis.start();
  });

  /* =========================================================
     Vídeos sob demanda
     ========================================================= */
  const lazyIO = new IntersectionObserver((entries) => {
    entries.forEach(({ target: v, isIntersecting }) => {
      if (isIntersecting) {
        if (!v.src && v.dataset.src) { v.src = v.dataset.src; }
        v.play().catch(() => {});
      } else if (!v.paused) v.pause();
    });
  }, { rootMargin: '200px 0px' });
  $$('[data-lazy-video]').forEach((v) => lazyIO.observe(v));
  // a abertura pausa fora da tela
  new IntersectionObserver(([e]) => { e.isIntersecting ? intro.play().catch(() => {}) : intro.pause(); }).observe($('.abertura__stage'));

  /* =========================================================
     Player do YouTube (carrega só no clique)
     ========================================================= */
  const player = $('[data-player]');
  const frame = $('[data-player-frame]');
  let lastFocus = null;
  function openPlayer(id, title, start = 0) {
    if (PREVIEW) { openExternal(`https://www.youtube.com/watch?v=${encodeURIComponent(id)}${start ? `&t=${start}s` : ''}`); return; }
    lastFocus = document.activeElement;
    const ifr = document.createElement('iframe');
    ifr.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&playsinline=1${start ? `&start=${start}` : ''}`;
    ifr.title = title || 'Vídeo da Maria Laís';
    ifr.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    ifr.allowFullscreen = true;
    ifr.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.replaceChildren(ifr);
    $('[data-player-title]').textContent = title || '';
    $('[data-player-yt]').href = `https://www.youtube.com/watch?v=${encodeURIComponent(id)}${start ? `&t=${start}s` : ''}`;
    player.showModal();
    $('[data-player-close]').focus();
    lenis && lenis.stop();
    gsap.fromTo('.player__box', { y: 40, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.8 });
  }
  function closePlayer() { player.close(); }
  player.addEventListener('close', () => { frame.innerHTML = ''; lenis && lenis.start(); lastFocus && lastFocus.focus && lastFocus.focus(); });
  player.addEventListener('click', (e) => { if (e.target === player) closePlayer(); });
  $('[data-player-close]').addEventListener('click', closePlayer);
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-yt]');
    if (!el) return;
    e.preventDefault();
    openPlayer(el.dataset.yt, el.dataset.ytTitle, +(el.dataset.start || 0));
  });
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('li[data-yt]')) { e.preventDefault(); e.target.click(); }
  });

  /* botões de projeto abrem o WhatsApp com a mensagem certa */
  $$('[data-wa]').forEach((a) => {
    a.href = waLink(`Olá! Vim pelo site da Maria Laís. ${a.dataset.wa}.`);
    a.target = '_blank'; a.rel = 'noopener';
  });

  /* miniaturas do YouTube com reserva local */
  $$('img[data-fallback]').forEach((img) => {
    const swap = () => { if (img.dataset.fallback && img.src !== img.dataset.fallback) img.src = img.dataset.fallback; };
    img.addEventListener('error', swap, { once: true });
    img.addEventListener('load', () => { if (img.naturalWidth <= 120) swap(); }, { once: true });
  });

  /* =========================================================
     Linhas de neon (retângulos do cenário do DVD)
     ========================================================= */
  const neons = $$('svg.neon');
  function sizeNeons() {
    neons.forEach((svg) => {
      const r = svg.getBoundingClientRect();
      const rect = svg.querySelector('rect');
      rect.setAttribute('x', 1); rect.setAttribute('y', 1);
      rect.setAttribute('width', Math.max(0, r.width - 2));
      rect.setAttribute('height', Math.max(0, r.height - 2));
      rect.setAttribute('rx', svg.classList.contains('neon--cta') ? 22 : 3);
    });
  }
  sizeNeons();
  addEventListener('resize', sizeNeons);
  if ('ResizeObserver' in window) { const ro = new ResizeObserver(sizeNeons); neons.forEach((n) => ro.observe(n)); }
  const drawNeon = (svg, delay = 0) => {
    const rect = svg.querySelector('rect');
    gsap.set(rect, { strokeDasharray: 1, strokeDashoffset: 1 });
    return gsap.timeline({ delay })
      .to(rect, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' })
      .fromTo(svg, { opacity: 1 }, { keyframes: { opacity: [1, 0.25, 1, 0.5, 1] }, duration: 0.5, ease: 'none' }, '-=0.4');
  };

  /* =========================================================
     Faíscas do logo (canvas)
     ========================================================= */
  const sparks = (() => {
    const cv = $('[data-sparks]');
    const ctx = cv.getContext('2d');
    const logo = $('[data-logo]');
    let W = 0, H = 0, dpr = 1, lw = 0, lh = 0;
    const P = [];
    let active = false, last = performance.now(), flare = 0;
    function size() {
      dpr = Math.min(2, devicePixelRatio || 1);
      lw = logo.offsetWidth; lh = logo.offsetHeight;
      W = lw * 1.2; H = lh * 1.2;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const point = (deg) => {
      const a = (deg * Math.PI) / 180;
      const cx = lw * (0.1 + 0.699), cy = lh * (0.1 + 0.5), R = lw * 0.281;
      return [cx + R * Math.sin(a), cy - R * Math.cos(a)];
    };
    function emit(deg, n = 3, power = 1) {
      for (let i = 0; i < n; i++) {
        const [x, y] = point(deg + (Math.random() - 0.5) * 4);
        const a = Math.random() * Math.PI * 2, s = (0.3 + Math.random() * 1.4) * power;
        P.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.2, life: 1, size: 0.6 + Math.random() * 2.2, hue: Math.random() < 0.35 ? 195 : 220 });
      }
      if (P.length > 160) P.splice(0, P.length - 160);
    }
    function star(x, y, r, alpha) {
      ctx.globalAlpha = alpha;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(160,220,255,.5)'); g.addColorStop(1, 'rgba(95,212,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(x - r * 6, y - 0.5, r * 12, 1);
      ctx.fillRect(x - 0.5, y - r * 6, 1, r * 12);
    }
    function frame(now) {
      const dt = Math.min(50, now - last) / 16.67; last = now;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      if (active && Math.random() < 0.18) emit(306 + Math.random() * 290, 1, 0.4);
      for (let i = P.length - 1; i >= 0; i--) {
        const p = P[i];
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 0.01 * dt; p.life -= 0.012 * dt;
        if (p.life <= 0) { P.splice(i, 1); continue; }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = `hsl(${p.hue} 100% ${70 + p.life * 30}%)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill();
      }
      if (flare > 0.01) {
        const [fx, fy] = point(28);
        star(fx, fy, 2.6 + Math.sin(now / 380) * 0.8, flare * (0.75 + Math.sin(now / 520) * 0.25));
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      if (running) requestAnimationFrame(frame);
    }
    let running = false;
    const start = () => { if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } };
    const stop = () => { running = false; };
    size(); addEventListener('resize', size);
    return { emit, start, stop, set active(v) { active = v; }, set flare(v) { flare = v; }, size };
  })();

  /* =========================================================
     ABERTURA → LOGO (cena presa)
     ========================================================= */
  const stage = $('.abertura__stage');
  const wrap = $('[data-intro-wrap]');
  const logo = $('[data-logo]');
  const arc = $('[data-logo-arc]');
  const bars = $$('.logo3d__bar');

  // equalizador vivo nas barras do logo
  const eq = bars.map((b) => gsap.to(b, { scaleY: 'random(0.35, 1)', duration: 'random(0.22, 0.5)', ease: 'sine.inOut', repeat: -1, yoyo: true, repeatRefresh: true, paused: true }));

  function circleGeom() {
    const w = stage.offsetWidth, h = stage.offsetHeight;
    const lw = logo.offsetWidth, lh = logo.offsetHeight;
    const left = w / 2 - lw / 2, top = h / 2 - lh * 0.52;
    return { w, h, x: left + lw * 0.699, y: top + lh * 0.5, r: lw * 0.262 };
  }

  const lockWm = $('[data-lockup-wm]');
  const lockDiv = $('[data-lockup-div]');
  function lockupGeom() {
    const g = circleGeom();
    const { w, h } = g;
    const lw = logo.offsetWidth, lh = logo.offsetHeight;
    const cx = w / 2, cy = h / 2 - lh * 0.02;
    const ratio = 237 / 805;
    let s, dx, dy, wm;
    if (w > h * 0.9) {
      s = Math.min(0.62, (w * 0.5) / lw);
      const L = lw * s, lhS = lh * s;
      const wmW = Math.min(L * 0.8, w * 0.32), gap = Math.max(32, w * 0.035);
      const left = (w - (L + gap * 2 + wmW)) / 2;
      dx = left + L / 2 - cx; dy = -h * 0.03;
      wm = { x: left + L + gap * 2, y: cy + dy - (wmW * ratio) / 2, w: wmW, divX: left + L + gap, divY: cy + dy - lhS * 0.34, divH: lhS * 0.68 };
    } else {
      s = 0.8; dx = 0; dy = -h * 0.1;
      const lhS = lh * s, wmW = Math.min(w * 0.62, 320);
      wm = { x: (w - wmW) / 2, y: cy + dy + lhS * 0.5 + 14, w: wmW, divX: -9999, divY: 0, divH: 0 };
    }
    return { s, dx, dy, wm, x: cx + s * (g.x - cx) + dx, y: cy + s * (g.y - cy) + dy, r: g.r * s };
  }
  function placeLockup() {
    const { wm } = lockupGeom();
    Object.assign(lockWm.style, { left: `${wm.x}px`, top: `${wm.y}px`, width: `${wm.w}px` });
    Object.assign(lockDiv.style, { left: `${wm.divX}px`, top: `${wm.divY}px`, height: `${wm.divH}px` });
  }
  placeLockup();
  ScrollTrigger.addEventListener('refresh', placeLockup);

  if (!reduce) {
    const circ = { r: 0, x: 0, y: 0 };
    const applyCirc = () => {
      wrap.style.setProperty('--r', `${circ.r}px`);
      wrap.style.setProperty('--x', `${circ.x}px`);
      wrap.style.setProperty('--y', `${circ.y}px`);
    };
    const sweep = { s: 0 };
    const flareObj = { v: 0 };
    let lastS = 0;

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.abertura', start: 'top top', end: 'bottom bottom', scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const on = self.progress > 0.3;
          sparks.active = self.progress > 0.55;
          on ? (sparks.start(), eq.forEach((t) => t.play())) : eq.forEach((t) => t.pause());
        },
        onLeave: () => { sparks.stop(); eq.forEach((t) => t.pause()); },
        onEnterBack: () => sparks.start()
      }
    });

    tl.to('[data-intro-copy]', { opacity: 0, y: -80, duration: 0.12 }, 0)
      .to('.abertura__bars span', { scaleY: 0, duration: 0.1 }, 0)
      .fromTo(circ, {
        r: () => { const g = circleGeom(); return Math.hypot(g.w, g.h); },
        x: () => circleGeom().w / 2,
        y: () => circleGeom().h / 2
      }, {
        r: () => circleGeom().r, x: () => circleGeom().x, y: () => circleGeom().y,
        duration: 0.36, ease: 'power2.inOut', onUpdate: applyCirc
      }, 0.06)
      .to('.abertura__media', { scale: 1.32, filter: 'brightness(.72) saturate(1.1)', duration: 0.42, ease: 'power1.inOut' }, 0.06)
      .to('.abertura__shade', { opacity: 0.4, duration: 0.3 }, 0.1)
      .fromTo(sweep, { s: 0 }, {
        s: 360, duration: 0.26, ease: 'power1.inOut',
        onUpdate: () => {
          arc.style.setProperty('--sweep', `${sweep.s}deg`);
          if (sweep.s > lastS + 0.5) sparks.emit(272 + sweep.s, 4, 1.4);
          lastS = sweep.s;
        }
      }, 0.3)
      .fromTo('[data-logo-name]', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out' }, 0.4)
      .fromTo(bars, { opacity: 0 }, { opacity: 1, duration: 0.08, stagger: 0.03 }, 0.48)
      .fromTo('[data-logo-amala]', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.12, ease: 'power2.out' }, 0.56)
      .fromTo(logo, { '--shine': '100%' }, { '--shine': '0%', duration: 0.4 }, 0.5)
      .fromTo(logo, { scale: 1.12 }, { scale: 1, duration: 0.5, ease: 'power2.out' }, 0.3)
      .fromTo(flareObj, { v: 0 }, { v: 1, duration: 0.1, onUpdate: () => (sparks.flare = flareObj.v) }, 0.62)
      .fromTo('[data-logo-sub]', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.14, ease: 'power2.out' }, 0.66)
      // assinatura final: MARIA LAÍS | A MALA, como na arte oficial
      .to(logo, { scale: () => lockupGeom().s, x: () => lockupGeom().dx, y: () => lockupGeom().dy, duration: 0.2, ease: 'power2.inOut' }, 0.86)
      .to(circ, { r: () => lockupGeom().r, x: () => lockupGeom().x, y: () => lockupGeom().y, duration: 0.2, ease: 'power2.inOut', onUpdate: applyCirc }, 0.86)
      .fromTo(lockDiv, { scaleY: 0 }, { scaleY: 1, duration: 0.1, ease: 'power2.out' }, 0.98)
      .fromTo(lockWm, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.16, ease: 'power2.out' }, 1.0)
      .to({}, { duration: 0.16 });

    ScrollTrigger.addEventListener('refreshInit', () => sparks.size());

    // brilho especular e leve inclinação seguindo o mouse
    if (fine) {
      const rx = gsap.quickTo(logo, 'rotationY', { duration: 1, ease: 'power3' });
      const ry = gsap.quickTo(logo, 'rotationX', { duration: 1, ease: 'power3' });
      gsap.set(stage, { perspective: 1400 });
      stage.addEventListener('pointermove', (e) => {
        const r = logo.getBoundingClientRect();
        logo.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
        logo.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
        rx(((e.clientX / innerWidth) - 0.5) * 10);
        ry(-((e.clientY / innerHeight) - 0.5) * 8);
      });
    }
  } else {
    // movimento reduzido: abertura estática com o título visível
    arc.style.setProperty('--sweep', '360deg');
  }

  /* =========================================================
     MANIFESTO: palavras acendem com o scroll
     ========================================================= */
  const quote = $('[data-words]');
  if (!reduce) {
    const split = new SplitText(quote, { type: 'words', wordsClass: 'word', aria: 'auto' });
    gsap.to(split.words, {
      opacity: 1, stagger: 0.08, ease: 'none',
      scrollTrigger: { trigger: quote, start: 'top 78%', end: 'bottom 45%', scrub: 0.6 }
    });
    gsap.fromTo('.manifesto__portrait', { yPercent: 12, clipPath: 'inset(30% 0 0 0 round 999px 999px 18px 18px)' },
      { yPercent: -6, clipPath: 'inset(0% 0 0 0 round 999px 999px 18px 18px)', ease: 'none', scrollTrigger: { trigger: '.manifesto', start: 'top bottom', end: 'center center', scrub: 1 } });
    gsap.from('.manifesto__sign, .manifesto__body', { y: 30, opacity: 0, duration: 1.2, stagger: 0.12, scrollTrigger: { trigger: '.manifesto__sign', start: 'top 88%' } });
  }

  /* =========================================================
     NÚMEROS: contadores + neon
     ========================================================= */
  $$('.num').forEach((card, i) => {
    const n = card.querySelector('[data-count]');
    const end = +n.dataset.count;
    const svg = card.querySelector('svg.neon');
    if (reduce) { n.textContent = end; return; }
    gsap.set(svg.querySelector('rect'), { strokeDasharray: 1, strokeDashoffset: 1 });
    ScrollTrigger.create({
      trigger: card, start: 'top 82%', once: true,
      onEnter: () => {
        drawNeon(svg, i * 0.12);
        const o = { v: 0 };
        gsap.to(o, { v: end, duration: 2.2, delay: i * 0.12, ease: 'power3.out', onUpdate: () => (n.textContent = Math.round(o.v)) });
        gsap.from(card.querySelector('strong'), { backgroundPosition: '100% 50%', duration: 2.4, delay: i * 0.12, ease: 'power2.out' });
      }
    });
  });

  /* marquee com velocidade ligada ao scroll */
  (function marquee() {
    const track = $('[data-marquee] .marquee__track');
    track.innerHTML += track.innerHTML;
    if (reduce) return;
    let x = 0, dir = 1, half = track.scrollWidth / 2;
    addEventListener('resize', () => (half = track.scrollWidth / 2));
    let vel = 0;
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => { vel = s.getVelocity(); if (Math.abs(vel) > 20) dir = vel > 0 ? 1 : -1; } });
    gsap.ticker.add((t, dt) => {
      const speed = (0.9 + Math.min(14, Math.abs(vel) / 220)) * dir;
      vel *= 0.92;
      x -= speed * (dt / 16.67);
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      track.style.transform = `translate3d(${x}px,0,0)`;
    });
  })();

  /* =========================================================
     DVD: quadro que cresce até a tela cheia
     ========================================================= */
  if (!reduce) {
    const small = () => innerWidth <= 860;
    const dtl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.dvd', start: 'top top', end: 'bottom bottom', scrub: 0.8 } });
    dtl.fromTo('[data-dvd-frame]', { clipPath: () => (small() ? 'inset(26% 8% 26% 8% round 20px)' : 'inset(30% 36% 30% 36% round 24px)') }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 0.55, ease: 'power2.inOut' }, 0)
      .fromTo('[data-dvd-l]', { xPercent: 0 }, { xPercent: -70, opacity: 0, duration: 0.5, ease: 'power2.in' }, 0.05)
      .fromTo('[data-dvd-r]', { xPercent: 0 }, { xPercent: 70, opacity: 0, duration: 0.5, ease: 'power2.in' }, 0.05)
      .fromTo('[data-dvd-frame] video', { scale: 1.3 }, { scale: 1, duration: 0.6 }, 0)
      .fromTo('[data-dvd-frame]', { '--shade': 0 }, { '--shade': 1, duration: 0.2 }, 0.55)
      .fromTo('[data-dvd-info]', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }, 0.62)
      .to({}, { duration: 0.18 });
  }

  /* =========================================================
     FAIXAS: rolagem horizontal presa + prévias
     ========================================================= */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
    const track = $('[data-rail-track]');
    const dist = () => track.scrollWidth - innerWidth;
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.faixas__pin', start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 }
    });
    $$('.card', track).forEach((card) => {
      const media = card.querySelector('.card__media');
      if (!media) return;
      gsap.fromTo(media, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      gsap.from(card, { y: 80, rotate: 2, opacity: 0, duration: 1.2, scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 95%' } });
    });
    gsap.from('.faixas__head > *', { y: 40, opacity: 0, duration: 1.2, stagger: 0.1, scrollTrigger: { trigger: '.faixas', start: 'top 70%' } });
    return () => {};
  });

  // evita que o foco por teclado role o trilho por dentro e desalinhe o GSAP
  const rail = $('[data-rail]');
  rail.addEventListener('scroll', () => { if (innerWidth > 860 && !reduce && rail.scrollLeft) rail.scrollLeft = 0; });
  rail.addEventListener('focusin', (e) => {
    const card = e.target.closest('.card');
    if (!card || innerWidth <= 860 || reduce) return;
    const st = ScrollTrigger.getAll().find((t) => t.pin === $('.faixas__pin'));
    if (!st) return;
    const track = $('[data-rail-track]');
    const max = track.scrollWidth - innerWidth;
    const target = st.start + clamp(card.offsetLeft - innerWidth * 0.2, 0, max);
    lenis ? lenis.scrollTo(target, { immediate: true }) : scrollTo(0, target);
  });

  $$('.card').forEach((card) => {
    const v = card.querySelector('video');
    const play = () => { if (!v) return; if (!v.src) v.src = v.dataset.src; v.currentTime = 0; v.play().then(() => card.classList.add('is-playing')).catch(() => {}); };
    const stop = () => { if (!v) return; v.pause(); card.classList.remove('is-playing'); };
    if (fine) {
      card.addEventListener('pointerenter', play);
      card.addEventListener('pointerleave', () => { stop(); gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'power3' }); });
      if (!reduce) card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        gsap.to(card, { rotationY: ((e.clientX - r.left) / r.width - 0.5) * 8, rotationX: -((e.clientY - r.top) / r.height - 0.5) * 6, transformPerspective: 900, duration: 0.6, ease: 'power3' });
      });
    } else if (v) {
      new IntersectionObserver(([e]) => (e.intersectionRatio > 0.7 ? play() : stop()), { threshold: [0, 0.7] }).observe(card);
    }
    card.addEventListener('focus', play);
    card.addEventListener('blur', stop);
  });

  /* =========================================================
     SETLIST: onda sonora interativa
     ========================================================= */
  (function setlist() {
    const wave = $('[data-wave]');
    const svg = $('[data-wave-svg]');
    const head = $('[data-wave-head]');
    const time = $('[data-wave-time]');
    const tip = $('[data-wave-tip]');
    const list = $('[data-setlist]');
    const NS = 'http://www.w3.org/2000/svg';
    const ends = SETLIST.map((s, i) => (SETLIST[i + 1] ? SETLIST[i + 1].t : DVD_LEN));

    list.innerHTML = SETLIST.map((s, i) => `<li><button type="button" data-seg="${i}" data-yt="${DVD_ID}" data-start="${s.t}" data-yt-title="${s.title.replace(/"/g, '&quot;')}"><span class="t">${s.title}${s.ined ? '<span class="tag">Inédita</span>' : ''}</span><span class="s">${fmt(s.t)}</span></button></li>`).join('');

    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    let groups = [];
    function build() {
      seed = 7;
      const w = wave.clientWidth, h = wave.clientHeight;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.innerHTML = '';
      const step = w < 700 ? 4 : 6, bw = step < 5 ? 2 : 3;
      const n = Math.floor(w / step);
      groups = SETLIST.map((s, i) => {
        const g = document.createElementNS(NS, 'g');
        g.dataset.seg = i;
        if (s.ined) g.classList.add('is-ined');
        svg.appendChild(g);
        return g;
      });
      for (let k = 0; k < n; k++) {
        const t = ((k + 0.5) / n) * DVD_LEN;
        const i = SETLIST.findIndex((s, j) => t >= s.t && t < ends[j]);
        const s0 = SETLIST[i].t, s1 = ends[i];
        const local = (t - s0) / (s1 - s0);
        const edge = Math.min(1, Math.min(local, 1 - local) * 18);
        const env = 0.35 + 0.45 * Math.abs(Math.sin(local * Math.PI * (2 + (i % 3)))) + 0.2 * Math.sin(local * Math.PI);
        const amp = clamp(env * (0.55 + rnd() * 0.6) * edge, 0.04, 1);
        const bh = Math.max(2, amp * h * 0.92);
        const r = document.createElementNS(NS, 'rect');
        r.setAttribute('x', k * step); r.setAttribute('y', (h - bh) / 2);
        r.setAttribute('width', bw); r.setAttribute('height', bh); r.setAttribute('rx', 1);
        groups[i].appendChild(r);
      }
      // áreas clicáveis por faixa
      SETLIST.forEach((s, i) => {
        const hit = document.createElementNS(NS, 'rect');
        hit.setAttribute('class', 'seg-hit');
        hit.setAttribute('x', (s.t / DVD_LEN) * w); hit.setAttribute('y', 0);
        hit.setAttribute('width', ((ends[i] - s.t) / DVD_LEN) * w); hit.setAttribute('height', h);
        hit.dataset.seg = i;
        svg.appendChild(hit);
      });
    }
    build();
    let rw = wave.clientWidth;
    addEventListener('resize', () => { if (Math.abs(wave.clientWidth - rw) > 40) { rw = wave.clientWidth; build(); } });

    let current = -1;
    function setActive(i) {
      if (i === current) return;
      current = i;
      wave.classList.toggle('has-active', i > -1);
      groups.forEach((g, j) => g.classList.toggle('is-active', j === i));
      $$('button', list).forEach((b) => b.classList.toggle('is-active', +b.dataset.seg === i));
      if (i > -1) tip.innerHTML = `${String(i + 1).padStart(2, '0')}. ${SETLIST[i].title}<small>${fmt(SETLIST[i].t)} no DVD, clique para assistir</small>`;
    }
    function pos(clientX) {
      const r = wave.getBoundingClientRect();
      const x = clamp(clientX - r.left, 0, r.width);
      const t = (x / r.width) * DVD_LEN;
      return { x, t, i: SETLIST.findIndex((s, j) => t >= s.t && t < ends[j]), w: r.width };
    }
    wave.addEventListener('pointermove', (e) => {
      const p = pos(e.clientX);
      head.style.transform = `translateX(${p.x}px)`;
      time.textContent = fmt(p.t);
      tip.style.left = `${clamp(p.x, 140, p.w - 140)}px`;
      setActive(p.i);
    });
    wave.addEventListener('pointerleave', () => setActive(-1));
    wave.addEventListener('click', (e) => {
      const p = pos(e.clientX);
      if (p.i < 0) return;
      openPlayer(DVD_ID, SETLIST[p.i].title, SETLIST[p.i].t);
    });
    list.addEventListener('pointerover', (e) => { const b = e.target.closest('button'); if (b) setActive(+b.dataset.seg); });
    list.addEventListener('pointerleave', () => setActive(-1));
    list.addEventListener('focusin', (e) => { const b = e.target.closest('button'); if (b) setActive(+b.dataset.seg); });

    if (!reduce) {
      ScrollTrigger.create({
        trigger: wave, start: 'top 80%', once: true,
        onEnter: () => {
          const rects = $$('rect:not(.seg-hit)', svg);
          gsap.fromTo(rects, { scaleY: 0, transformOrigin: '50% 50%', transformBox: 'fill-box' }, { scaleY: 1, duration: 1.2, ease: 'elastic.out(1, .6)', stagger: { each: 0.004, from: 'start' } });
        }
      });
      gsap.from('.setlist__list li', { y: 30, opacity: 0, duration: 1, stagger: 0.05, scrollTrigger: { trigger: list, start: 'top 85%' } });
    }
  })();

  /* =========================================================
     EXPERIÊNCIAS: painéis que se empilham
     ========================================================= */
  const panels = $$('[data-panel]');
  panels.forEach((p) => { const s = document.createElement('div'); s.className = 'panel__shade'; p.appendChild(s); });
  if (!reduce) {
    panels.forEach((p, i) => {
      const img = p.querySelector('.panel__img');
      gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from(p.querySelectorAll('h3, p, ul, .btn'), { y: 50, opacity: 0, duration: 1.1, stagger: 0.08, scrollTrigger: { trigger: p, start: 'top 70%' } });
      const next = panels[i + 1];
      if (!next) return;
      gsap.timeline({ scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 20%', scrub: true } })
        .to(p, { scale: 0.9, ease: 'none' }, 0)
        .to(p.querySelector('.panel__shade'), { opacity: 0.65, ease: 'none' }, 0);
    });
  }

  /* =========================================================
     FORMATOS DE SHOW: mapa de palco interativo
     ========================================================= */
  (function formatos() {
    const POS = {
      'Maria Laís': [50, 74, true], 'Violão': [30, 68], 'Sanfona': [70, 68], 'Baixo': [20, 52], 'Bateria': [50, 48], 'Percussão': [80, 52],
      'Técnico de PA': [12, 16], 'Técnico de som': [12, 16], 'Técnico de luz': [31, 16], 'Produtor': [50, 16], 'Técnico de palco': [69, 16], 'Roadie': [88, 16]
    };
    const F = {
      carro: ['Maria Laís', 'Violão', 'Sanfona', 'Baixo'],
      reduzido: ['Maria Laís', 'Violão', 'Sanfona', 'Bateria', 'Baixo', 'Técnico de som', 'Roadie', 'Produtor'],
      van: ['Maria Laís', 'Violão', 'Baixo', 'Percussão', 'Bateria', 'Sanfona', 'Técnico de PA', 'Técnico de palco', 'Roadie', 'Técnico de luz', 'Produtor'],
      aereo: ['Maria Laís', 'Violão', 'Baixo', 'Percussão', 'Bateria', 'Sanfona', 'Técnico de PA', 'Técnico de palco', 'Roadie', 'Técnico de luz', 'Produtor']
    };
    const slotsEl = $('[data-slots]');
    const slots = {};
    Object.entries(POS).forEach(([name, [x, y, star]]) => {
      if (name === 'Técnico de som') return;
      const d = document.createElement('div');
      d.className = 'slot' + (star ? ' is-star' : '');
      d.style.left = `${x}%`; d.style.top = `${y}%`;
      d.innerHTML = `<i></i><span>${name}</span>`;
      slotsEl.appendChild(d);
      slots[name] = d;
    });
    const countEl = $('[data-formato-count]');
    const listEl = $('[data-formato-list]');
    const tabs = $$('[data-formato]');
    let count = { v: 11 };
    function show(key, animate = true) {
      const roles = F[key];
      tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.formato === key)));
      const on = new Set(roles.map((r) => (r === 'Técnico de som' ? 'Técnico de PA' : r)));
      slots['Técnico de PA'].querySelector('span').textContent = roles.includes('Técnico de som') ? 'Técnico de som' : 'Técnico de PA';
      Object.entries(slots).forEach(([name, el], i) => {
        const vis = on.has(name);
        gsap.to(el, { scale: vis ? 1 : 0.3, opacity: vis ? 1 : 0.08, duration: animate && !reduce ? 0.7 : 0, delay: animate && !reduce ? i * 0.03 : 0, ease: vis ? 'back.out(2)' : 'power2.in' });
      });
      gsap.to(count, { v: roles.length, duration: animate && !reduce ? 0.9 : 0, ease: 'power3.out', onUpdate: () => (countEl.textContent = String(Math.round(count.v)).padStart(2, '0')) });
      listEl.innerHTML = roles.map((r) => `<li>${r}</li>`).join('');
      if (animate && !reduce) gsap.from(listEl.children, { y: 12, opacity: 0, duration: 0.5, stagger: 0.025 });
    }
    tabs.forEach((t) => t.addEventListener('click', () => show(t.dataset.formato)));
    $('[data-formatos-tabs]').addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); tabs[(i + 1) % tabs.length].focus(); tabs[(i + 1) % tabs.length].click(); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); tabs[(i - 1 + tabs.length) % tabs.length].focus(); tabs[(i - 1 + tabs.length) % tabs.length].click(); }
    });
    show('van', false);
    if (!reduce) {
      gsap.set(Object.values(slots), { scale: 0, opacity: 0 });
      ScrollTrigger.create({ trigger: '.formatos__stage', start: 'top 75%', once: true, onEnter: () => show('van') });
      gsap.from('.formatos__tabs button', { x: -40, opacity: 0, duration: 1, stagger: 0.08, scrollTrigger: { trigger: '.formatos__tabs', start: 'top 85%' } });
    }
  })();

  /* =========================================================
     GALERIA: rolo de filme com inclinação pela velocidade
     ========================================================= */
  (function gallery() {
    const photos = ['23', '01', '03', '09', '13', '18', '02', '14', '06', '20', '08', '16', '21', '04', '10', '19', '22', '05', '15', '24', '07', '17'];
    const alts = 'Maria Laís no palco do DVD Mais ou Menos Assim';
    const rows = $$('.galeria__row');
    const half = Math.ceil(photos.length / 2);
    [photos.slice(0, half), photos.slice(half)].forEach((set, r) => {
      rows[r].innerHTML = set.map((p) => `<button class="shot" type="button" data-shot="assets/img/palco-${p}.jpg" data-cursor="Ver"><img src="assets/img/palco-${p}.jpg" alt="${alts}" loading="lazy"></button>`).join('');
    });
    if (!reduce) {
      rows.forEach((row) => {
        const dir = +row.dataset.row;
        gsap.fromTo(row, { x: () => (dir > 0 ? 0 : -(row.scrollWidth - innerWidth) * 0.5) }, {
          x: () => (dir > 0 ? -(row.scrollWidth - innerWidth) * 0.5 : 0), ease: 'none',
          scrollTrigger: { trigger: '.galeria', start: 'top bottom', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true }
        });
      });
      const skew = gsap.quickTo(rows, 'skewX', { duration: 0.5, ease: 'power3' });
      ScrollTrigger.create({ trigger: '.galeria', start: 'top bottom', end: 'bottom top', onUpdate: (s) => skew(clamp(s.getVelocity() / -300, -8, 8)), onLeave: () => skew(0), onLeaveBack: () => skew(0) });
      gsap.from('.galeria__title', { yPercent: 40, opacity: 0, duration: 1.4, scrollTrigger: { trigger: '.galeria', start: 'top 75%' } });
    }

    const lb = $('[data-lightbox]');
    const lbImg = $('[data-lightbox-img]');
    const shots = $$('[data-shot]');
    let idx = 0;
    const show = (i) => { idx = (i + shots.length) % shots.length; lbImg.src = shots[idx].dataset.shot; lbImg.alt = alts; };
    shots.forEach((s, i) => s.addEventListener('click', () => { show(i); lb.showModal(); lenis && lenis.stop(); gsap.fromTo(lbImg, { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7 }); }));
    $('[data-lb-prev]').addEventListener('click', () => show(idx - 1));
    $('[data-lb-next]').addEventListener('click', () => show(idx + 1));
    $('[data-lb-close]').addEventListener('click', () => lb.close());
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', () => lenis && lenis.start());
    lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') show(idx + 1); if (e.key === 'ArrowLeft') show(idx - 1); });
  })();

  /* =========================================================
     CRÉDITOS rolando
     ========================================================= */
  if (!reduce) {
    const roll = $('[data-credits]');
    const win = $('.creditos__window');
    gsap.fromTo(roll, { y: () => win.offsetHeight * 0.25 }, {
      y: () => -(roll.offsetHeight - win.offsetHeight * 0.45), ease: 'none',
      scrollTrigger: { trigger: '.creditos', start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true }
    });
    ScrollTrigger.create({ trigger: '.creditos', start: 'top 60%', once: true, onEnter: () => drawNeon($('.neon--frame')) });
  }

  /* =========================================================
     SOCIAL: cromo que acompanha o mouse
     ========================================================= */
  const social = $('.social');
  if (fine) social.addEventListener('pointermove', (e) => social.style.setProperty('--mx', `${(e.clientX / innerWidth) * 100}%`));
  if (!reduce) {
    gsap.fromTo('.social__handle', { backgroundPosition: '100% 50%', yPercent: 30 }, { backgroundPosition: '0% 50%', yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.social', start: 'top bottom', end: 'center center', scrub: 1 } });
    gsap.from('.social__links li', { y: 40, opacity: 0, duration: 1, stagger: 0.07, scrollTrigger: { trigger: '.social__links', start: 'top 90%' } });
  }

  /* =========================================================
     CTA FINAL
     ========================================================= */
  const cta = $('[data-cta]');
  if (fine) cta.addEventListener('pointermove', (e) => {
    const r = cta.getBoundingClientRect();
    cta.style.setProperty('--sx', `${e.clientX - r.left}px`);
    cta.style.setProperty('--sy', `${e.clientY - r.top}px`);
  });
  const ctaSplit = new SplitText('[data-cta-title]', { type: 'words,chars', wordsClass: 'word', charsClass: 'char', aria: 'auto' });
  if (!reduce) {
    gsap.set(ctaSplit.chars, { yPercent: 110, rotateX: -70, opacity: 0 });
    gsap.set('.neon--cta rect', { strokeDasharray: 1, strokeDashoffset: 1 });
    ScrollTrigger.create({
      trigger: cta, start: 'top 55%', once: true,
      onEnter: () => {
        gsap.timeline()
          .to(ctaSplit.chars, { yPercent: 0, rotateX: 0, opacity: 1, duration: 1.3, stagger: 0.03, ease: 'expo.out', transformPerspective: 600 })
          .add(drawNeon($('.neon--cta')), 0.2)
          .from('.cta__lead, .cta__form > *', { y: 30, opacity: 0, duration: 1, stagger: 0.08 }, 0.6)
          .to(ctaSplit.chars, { backgroundPosition: '100% 50%', duration: 2.4, stagger: { each: 0.03, repeat: -1, yoyo: true }, ease: 'sine.inOut' }, 1.4);
      }
    });
  }

  /* formulário → WhatsApp */
  $('[data-wa-form]').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const data = f.get('data');
    const dataBr = data ? data.split('-').reverse().join('/') : 'a combinar';
    const lines = [
      'Olá! Vim pelo site e quero contratar a Maria Laís (A Mala).',
      `Tipo de evento: ${f.get('tipo')}`,
      `Cidade: ${f.get('cidade') || 'a informar'}`,
      `Data: ${dataBr}`,
      f.get('nome') ? `Meu nome: ${f.get('nome')}` : ''
    ].filter(Boolean);
    openExternal(waLink(lines.join('\n')));
  });

  /* feixes de luz azul das artes oficiais: deriva lenta com o scroll */
  if (!reduce) {
    $$('.feixe').forEach((f) => {
      const sec = f.closest('section');
      gsap.fromTo(f, { yPercent: 18, rotate: -4 }, { yPercent: -18, rotate: 4, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: 1 } });
    });
  }

  /* ---------- atualizações finais ---------- */
  addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts.ready.then(() => ScrollTrigger.refresh());
})();

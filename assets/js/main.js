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
  const root = document.documentElement;
  const W0 = 620, S0 = '96%'; // peso e largura de repouso dos títulos

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

  intro.play().catch(() => {});

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
  ScrollTrigger.create({ trigger: '#sobre', start: 'top 60%', onEnter: () => waFloat.classList.add('is-visible'), onLeaveBack: () => waFloat.classList.remove('is-visible') });

  const menu = $('#menu');
  const menuBtn = $('[data-menu-toggle]');
  let menuOpen = false;
  const behindMenu = () => ['main', 'footer', '[data-dock]', '.wa-float', '.nav__logo', '.nav__cta'].map((q) => $(q)).filter(Boolean);
  function closeMenu() { if (!menuOpen) return; menuOpen = false; menu.hidden = true; behindMenu().forEach((el) => (el.inert = false)); menuBtn.setAttribute('aria-expanded', 'false'); lenis && lenis.start(); }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) { closeMenu(); menuBtn.focus(); } });
  menuBtn.addEventListener('click', () => {
    menuOpen = !menuOpen;
    menu.hidden = !menuOpen;
    menuBtn.setAttribute('aria-expanded', String(menuOpen));
    behindMenu().forEach((el) => (el.inert = menuOpen));
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

  /* =========================================================
     Player do YouTube (carrega só no clique)
     ========================================================= */
  const player = $('[data-player]');
  const frame = $('[data-player-frame]');
  let lastFocus = null;
  let musicWasOn = false;
  function openPlayer(id, title, start = 0) {
    if (PREVIEW) { openExternal(`https://www.youtube.com/watch?v=${encodeURIComponent(id)}${start ? `&t=${start}s` : ''}`); return; }
    musicWasOn = music.wanted;
    if (musicWasOn) music.pause();
    lastFocus = document.activeElement;
    const ifr = document.createElement('iframe');
    ifr.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&playsinline=1${start ? `&start=${start}` : ''}`;
    ifr.title = title || 'Vídeo da Maria Laís';
    ifr.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
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
  player.addEventListener('close', () => { frame.innerHTML = ''; lenis && lenis.start(); lastFocus && lastFocus.focus && lastFocus.focus(); if (musicWasOn) music.play(); });
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

  /* =========================================================
     MÚSICA DO DVD: áudio contínuo + player flutuante + análise de frequência
     ========================================================= */
  const music = (() => {
    const el = $('[data-music]');
    const dock = $('[data-dock]');
    const playBtn = $('[data-dock-play]');
    const ring = $('[data-dock-ring]');
    const bar = $('[data-dock-bar]');
    const seek = $('[data-dock-seek]');
    const titleEl = $('[data-dock-title]');
    const cv = $('[data-dock-eq]');
    const ctx2d = cv.getContext('2d');
    const LIST = [
      { src: 'assets/audio/traumatizou.m4a', title: 'Traumatizou' },
      { src: 'assets/audio/reinicia.m4a', title: 'Reinicia (part. Naessa)' }
    ];
    let idx = 0, ac = null, analyser = null, gain = null, data = null, loaded = false, wanted = false;
    function load(i) { idx = (i + LIST.length) % LIST.length; el.src = LIST[idx].src; titleEl.textContent = LIST[idx].title; loaded = true; }
    function graph() {
      if (ac) return;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        ac = new AC();
        const srcNode = ac.createMediaElementSource(el);
        analyser = ac.createAnalyser(); analyser.fftSize = 128; analyser.smoothingTimeConstant = 0.78;
        gain = ac.createGain(); gain.gain.value = 0;
        srcNode.connect(analyser); analyser.connect(gain); gain.connect(ac.destination);
        data = new Uint8Array(analyser.frequencyBinCount);
      } catch (e) { ac = null; }
    }
    function fadeTo(v, t = 1.2) { if (gain && ac) { gain.gain.cancelScheduledValues(ac.currentTime); gain.gain.setTargetAtTime(v, ac.currentTime, t / 3); } }
    async function play() {
      if (!loaded) load(idx);
      graph();
      if (ac && ac.state === 'suspended') await ac.resume().catch(() => {});
      wanted = true;
      try { await el.play(); fadeTo(0.9); } catch (e) { wanted = false; }
      sync();
    }
    function pause(fade = true) {
      wanted = false;
      if (fade && gain) { fadeTo(0, 0.4); setTimeout(() => { if (!wanted) el.pause(); }, 380); } else el.pause();
      sync();
    }
    function sync() {
      const on = wanted && !el.paused;
      dock.classList.toggle('is-playing', wanted);
      document.body.classList.toggle('is-sound', wanted);
      $$('[data-sound-label]').forEach((l) => (l.textContent = wanted ? 'Som ligado' : 'Ligar o som'));
      $$('[data-sound-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(wanted)));
      playBtn.setAttribute('aria-label', wanted ? 'Pausar música' : 'Tocar música');
      if (on) loop();
    }
    playBtn.addEventListener('click', () => (wanted ? pause() : play()));
    $('[data-dock-next]').addEventListener('click', () => { load(idx + 1); if (wanted) play(); });
    el.addEventListener('ended', () => { load(idx + 1); play(); });
    el.addEventListener('timeupdate', () => {
      const p = el.duration ? el.currentTime / el.duration : 0;
      ring.style.strokeDashoffset = String(1 - p);
      bar.style.transform = `scaleX(${p})`;
      seek.setAttribute('aria-valuenow', Math.round(p * 100));
    });
    const seekTo = (clientX) => { const r = seek.getBoundingClientRect(); if (el.duration) el.currentTime = clamp((clientX - r.left) / r.width, 0, 1) * el.duration; };
    seek.addEventListener('click', (e) => seekTo(e.clientX));
    seek.addEventListener('keydown', (e) => {
      if (!el.duration) return;
      if (e.key === 'ArrowRight') el.currentTime = Math.min(el.duration, el.currentTime + 5);
      if (e.key === 'ArrowLeft') el.currentTime = Math.max(0, el.currentTime - 5);
    });
    // níveis de frequência (0..1) para quem quiser reagir à música
    function levels(n) {
      const out = new Array(n).fill(0);
      if (!analyser || el.paused) return out;
      analyser.getByteFrequencyData(data);
      const per = Math.floor((data.length * 0.7) / n);
      for (let i = 0; i < n; i++) { let s = 0; for (let k = 0; k < per; k++) s += data[i * per + k]; out[i] = s / per / 255; }
      return out;
    }
    let raf = 0;
    function loop() {
      cancelAnimationFrame(raf);
      const W = cv.width, H = cv.height, N = 16;
      const draw = () => {
        const lv = levels(N);
        ctx2d.clearRect(0, 0, W, H);
        ctx2d.fillStyle = root.style.getPropertyValue('--accent').trim() || '#1fe5ff';
        const bw = W / N;
        for (let i = 0; i < N; i++) {
          const h = Math.max(2, (analyser ? lv[i] : 0.15 + 0.1 * Math.sin(performance.now() / 300 + i)) * H);
          ctx2d.globalAlpha = 0.45 + lv[i] * 0.55;
          ctx2d.fillRect(i * bw + 1, (H - h) / 2, bw - 2, h);
        }
        ctx2d.globalAlpha = 1;
        if (!el.paused) raf = requestAnimationFrame(draw);
      };
      draw();
    }
    el.addEventListener('play', loop);
    el.addEventListener('pause', () => { cancelAnimationFrame(raf); ctx2d.clearRect(0, 0, cv.width, cv.height); });
    return { start: play, play, pause, levels, get playing() { return wanted && !el.paused; }, get wanted() { return wanted; } };
  })();

  // no celular, o player se recolhe quando o formulário de contratação está na tela
  new IntersectionObserver(([e]) => { const t = e.isIntersecting && innerWidth <= 860; $('[data-dock]').classList.toggle('is-tucked', t); $('.wa-float').classList.toggle('is-hidden-cta', t); }, { threshold: 0.05 }).observe($('[data-booking]'));

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
     SOM: liga sozinho no primeiro toque/tecla (o navegador exige um gesto)
     ========================================================= */
  let userPaused = false;
  const soundBtns = $$('[data-sound-toggle]');
  soundBtns.forEach((b) => b.addEventListener('click', () => {
    if (music.wanted) { userPaused = true; music.pause(); } else { userPaused = false; music.play(); }
  }));
  $('[data-dock-play]').addEventListener('click', () => { userPaused = music.wanted; }, true);
  const autoEvents = ['pointerdown', 'keydown', 'touchend'];
  function autoStart(e) {
    if (e.type === 'keydown' && /^(Tab|Escape|Shift|Alt|Control|Meta)$/.test(e.key)) return;
    if (e.target.closest && e.target.closest('[data-sound-toggle], [data-dock], [data-player], [data-yt]')) { off(); return; }
    off();
    if (!userPaused && !music.wanted) music.play();
  }
  function off() { autoEvents.forEach((t) => removeEventListener(t, autoStart, true)); }
  autoEvents.forEach((t) => addEventListener(t, autoStart, true));
  setTimeout(() => $('[data-dock]').classList.add('is-visible'), reduce ? 0 : 1600);

  /* pulso da música (0..1) em --beat, para brilhos e o logo pulsarem no ritmo */
  let beat = 0;
  gsap.ticker.add(() => {
    let target = 0;
    if (music.playing) { const lv = music.levels(6); target = Math.min(1, (lv[0] * 0.6 + lv[1] * 0.4) * 1.35); }
    beat += (target - beat) * (target > beat ? 0.45 : 0.12);
    if (beat < 0.002) beat = 0;
    root.style.setProperty('--beat', beat.toFixed(3));
    if (heroBeat && heroBeat.on()) gsap.set(heroBeat.chars, { fontWeight: W0 + beat * 200 });
  });
  let heroBeat = null; // preenchido pela abertura: o título engorda no ritmo da música

  /* =========================================================
     COR DE PALCO: cada seção acende uma luz (ciano e rosa)
     ========================================================= */
  const ACCENT = { ciano: '#1fe5ff', rosa: '#ff4fb8' };
  let accentNow = ACCENT.ciano;
  const themeMeta = $('meta[name="theme-color"]');
  function setAccent(name) {
    const c = ACCENT[name] || ACCENT.ciano;
    if (c === accentNow) return;
    accentNow = c;
    gsap.to(root, { '--accent': c, duration: reduce ? 0 : 0.9, ease: 'power2.out', overwrite: true });
    themeMeta && themeMeta.setAttribute('content', '#060608');
  }
  $$('[data-accent]').forEach((sec) => {
    ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => s.isActive && setAccent(sec.dataset.accent) });
  });

  /* =========================================================
     TÍTULOS QUE DANÇAM: peso e largura da fonte variável animados
     ========================================================= */
  const playSplits = new Map();
  $$('[data-play-type]').forEach((h) => {
    if (reduce) return;
    const sp = new SplitText(h, { type: 'words,chars', wordsClass: 'word', charsClass: 'char', aria: 'auto' });
    playSplits.set(h, sp);
    if (h.classList.contains('hero__title')) return; // a abertura cuida do próprio título
    gsap.set(sp.chars, { opacity: 0, yPercent: 70, fontWeight: 200, fontStretch: '75%', rotate: () => gsap.utils.random(-14, 14) });
    ScrollTrigger.create({
      trigger: h, start: 'top 85%', once: true,
      onEnter: () => gsap.to(sp.chars, { opacity: 1, yPercent: 0, rotate: 0, fontWeight: W0, fontStretch: S0, duration: 1.1, ease: 'back.out(2.2)', stagger: { each: 0.028, from: 'random' }, clearProps: 'fontWeight,fontStretch,rotate' })
    });
  });
  // perto do cursor as letras engordam e esticam, como se respirassem
  if (fine && !reduce) {
    playSplits.forEach((sp, h) => {
      const chars = sp.chars;
      let raf = 0, px = 0, py = 0;
      const apply = () => {
        raf = 0;
        chars.forEach((c) => {
          const r = c.getBoundingClientRect();
          const d = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2));
          const k = clamp(1 - d / 260, 0, 1);
          gsap.to(c, { fontWeight: W0 + k * 180, fontStretch: `${96 + k * 4}%`, yPercent: -k * 8, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
        });
      };
      h.addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(apply); });
      h.addEventListener('pointerleave', () => gsap.to(chars, { fontWeight: W0, fontStretch: S0, yPercent: 0, duration: 0.8, ease: 'elastic.out(1, .5)', overwrite: 'auto' }));
    });
  }

  /* =========================================================
     ABERTURA: o vídeo do DVD aparece por dentro do logo (violão);
     ao rolar, a câmera entra pela barra do equalizador e o show toma a tela
     ========================================================= */
  const heroEl = $('.hero');
  const heroStage = $('.hero__stage');
  const heroMask = $('[data-hero-mask]');
  const heroHalo = $('[data-hero-halo]');
  const heroCopy = $('[data-hero-copy]');
  const LA = 1069 / 1420;        // proporção do logo
  const FX = 0.4, FY = 0.6066;   // centro da 3ª barra do equalizador (ponto de entrada)
  const hs = { z: 0, a: reduce ? 1 : 0 };
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  let geoCache = null;
  addEventListener('resize', () => (geoCache = null));
  function heroGeo() {
    if (geoCache) return geoCache;
    const w = heroStage.clientWidth, h = heroStage.clientHeight;
    const L = Math.min(w * (w < 700 ? 0.9 : 0.66), (h * 0.6) / LA, 1180);
    return (geoCache = { w, h, L, x0: (w - L) / 2, y0: (h - L * LA) / 2 - h * 0.02 });
  }
  let heroOpen = false;
  function applyHero() {
    const open = hs.a >= 0.999;
    if (open !== heroOpen) { heroOpen = open; heroMask.classList.toggle('is-open', open); heroHalo.classList.toggle('is-open', open); }
    heroHalo.classList.toggle('is-zoom', hs.z > 0.06);
    if (open) return;
    const g = heroGeo();
    const pulse = 1 + beat * 0.035 * (1 - hs.z);
    const s = Math.pow(60, hs.z) * pulse;
    const L = g.L * s;
    const fx0 = g.x0 + FX * g.L + ptr.x, fy0 = g.y0 + FY * g.L * LA + ptr.y;
    const k = clamp(hs.z * 1.6, 0, 1);
    const cx = fx0 + (g.w / 2 - fx0) * k, cy = fy0 + (g.h / 2 - fy0) * k;
    heroMask.style.setProperty('--ms', `${L.toFixed(1)}px`);
    heroMask.style.setProperty('--mx', `${(cx - FX * L).toFixed(1)}px`);
    heroMask.style.setProperty('--my', `${(cy - FY * L * LA).toFixed(1)}px`);
    heroMask.style.setProperty('--a', hs.a.toFixed(3));
  }
  applyHero();
  let heroVisible = true;
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; e.isIntersecting ? intro.play().catch(() => {}) : intro.pause(); }).observe(heroEl);
  gsap.ticker.add(() => {
    if (!heroVisible) return;
    ptr.x += (ptr.tx - ptr.x) * 0.06; ptr.y += (ptr.ty - ptr.y) * 0.06;
    applyHero();
  });
  if (fine && !reduce) heroStage.addEventListener('pointermove', (e) => { ptr.tx = (e.clientX / innerWidth - 0.5) * -26; ptr.ty = (e.clientY / innerHeight - 0.5) * -18; });

  const heroTitle = $('.hero__title');
  const navLogo = $('.nav__logo');
  if (!reduce) { heroCopy.inert = true; navLogo.classList.add('is-hidden'); }
  const heroSplit = playSplits.get(heroTitle);
  let heroDone = !!reduce;
  if (heroSplit) heroBeat = { chars: heroSplit.chars, on: () => heroVisible && heroDone && (music.playing || beat > 0) };
  if (!reduce) {
    // entrada: o logo acende como luz de palco
    gsap.from(heroHalo, { opacity: 0, scale: 0.9, duration: 2, ease: 'expo.out', delay: 0.15 });
    gsap.from('[data-hero-cue], [data-badge]', { opacity: 0, y: 20, duration: 1.2, delay: 0.9, stagger: 0.15 });
    if (heroSplit) gsap.set(heroSplit.chars, { opacity: 0, yPercent: 80, fontWeight: 200, fontStretch: '75%', rotate: () => gsap.utils.random(-18, 18) });

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: heroEl, start: 'top top', end: 'bottom bottom', scrub: 0.9, invalidateOnRefresh: true,
        onUpdate: (self) => {
          const on = self.progress > 0.62;
          if (on !== heroCopy.classList.contains('is-on')) { heroCopy.classList.toggle('is-on', on); heroCopy.inert = !on; }
          navLogo.classList.toggle('is-hidden', self.progress < 0.5);
          heroDone = self.progress > 0.84;
        }
      }
    });
    tl.to(hs, { z: 1, duration: 0.55, ease: 'power2.in' }, 0)
      .to(hs, { a: 1, duration: 0.12, ease: 'power1.in' }, 0.44)
      .to('[data-hero-cue]', { opacity: 0, y: 30, duration: 0.08 }, 0)
      .to('[data-badge]', { opacity: 0, scale: 0.6, duration: 0.1 }, 0.2)
      .fromTo('.hero__video', { scale: 1.04, filter: 'brightness(1.4) saturate(1.3)' }, { scale: 1.18, filter: 'brightness(1.05) saturate(1.1)', duration: 0.6, ease: 'power1.inOut' }, 0)
      .to('.hero__shade', { opacity: 1, duration: 0.18 }, 0.52)
      .to(heroCopy, { opacity: 1, duration: 0.08 }, 0.6)
      .from('.hero__kicker', { y: 30, opacity: 0, duration: 0.1, ease: 'power2.out' }, 0.6);
    if (heroSplit) tl.to(heroSplit.chars, { opacity: 1, yPercent: 0, rotate: 0, fontWeight: W0, fontStretch: S0, duration: 0.16, ease: 'back.out(2)', stagger: { each: 0.006, from: 'start' } }, 0.62);
    tl.from('.hero__foot', { y: 40, opacity: 0, duration: 0.12, ease: 'power2.out' }, 0.74)
      .to('[data-badge]', { opacity: 1, scale: 1, duration: 0.1 }, 0.8)
      .to({}, { duration: 0.12 });
  } else {
    heroCopy.classList.add('is-on');
  }

  /* selo giratório: gira sozinho e acelera com o scroll */
  const badgeText = $('[data-badge] text');
  let scrollVel = 0;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => { scrollVel = s.getVelocity(); } });
  if (!reduce && badgeText) {
    let rot = 0;
    gsap.ticker.add((t, dt) => {
      rot += (0.012 + Math.abs(scrollVel) * 0.00004 + beat * 0.05) * dt;
      badgeText.setAttribute('transform', `rotate(${rot % 360} 100 100)`);
    });
  }

  /* faixas cruzadas (letreiros) que correm com o scroll e com a música */
  $$('[data-band]').forEach((track) => {
    track.innerHTML += track.innerHTML;
    if (reduce) return;
    const dir = +track.dataset.band || -1;
    let x = 0, half = track.scrollWidth / 2;
    addEventListener('resize', () => (half = track.scrollWidth / 2));
    gsap.ticker.add((t, dt) => {
      const flip = scrollVel < -40 ? -1 : 1;
      const speed = (1.1 + Math.min(16, Math.abs(scrollVel) / 200) + beat * 3) * dir * flip;
      x += speed * (dt / 16.67);
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      track.style.transform = `translate3d(${x}px,0,0)`;
    });
  });
  gsap.ticker.add(() => { scrollVel *= 0.94; });

  /* =========================================================
     SOBRE: frases enormes que correm com o scroll, com vídeo no meio
     ========================================================= */
  if (!reduce) {
    $$('.line').forEach((line) => {
      const dir = +line.dataset.dir;
      const media = line.querySelectorAll('.inmedia');
      const range = () => Math.max(0, line.scrollWidth - innerWidth + innerWidth * 0.08);
      gsap.fromTo(line, { x: () => (dir < 0 ? 0 : -range()) }, {
        x: () => (dir < 0 ? -range() : 0), ease: 'none',
        scrollTrigger: { trigger: line, start: 'top bottom', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true }
      });
      gsap.from(media, { width: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: line, start: 'top 85%' } });
    });
    const quote = $('.sobre__quote');
    const split = new SplitText(quote, { type: 'words', wordsClass: 'word', aria: 'auto' });
    gsap.to(split.words, { opacity: 1, stagger: 0.08, ease: 'none', scrollTrigger: { trigger: quote, start: 'top 80%', end: 'bottom 50%', scrub: 0.6 } });
    gsap.from('.sobre__side > *', { y: 30, opacity: 0, duration: 1.2, stagger: 0.12, scrollTrigger: { trigger: '.sobre__side', start: 'top 88%' } });
  }

  /* =========================================================
     NÚMEROS: contadores
     ========================================================= */
  $$('.num').forEach((card, i) => {
    const n = card.querySelector('[data-count]');
    const end = +n.dataset.count;
    if (reduce) { n.textContent = end; return; }
    ScrollTrigger.create({
      trigger: card, start: 'top 82%', once: true,
      onEnter: () => {
        const o = { v: 0 };
        gsap.to(o, { v: end, duration: 2.2, delay: i * 0.12, ease: 'power3.out', onUpdate: () => (n.textContent = Math.round(o.v)) });
        gsap.from(card.querySelector('strong'), { yPercent: 40, opacity: 0, duration: 1.4, delay: i * 0.1, ease: 'expo.out' });
      }
    });
  });

  /* =========================================================
     DVD: quadro que cresce até a tela cheia
     ========================================================= */
  if (!reduce) {
    const small = () => innerWidth <= 860;
    $('[data-dvd-info]').inert = true;
    const dtl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.dvd', start: 'top top', end: 'bottom bottom', scrub: 0.8 } });
    dtl.fromTo('[data-dvd-frame]', { clipPath: () => (small() ? 'inset(26% 8% 26% 8% round 20px)' : 'inset(30% 36% 30% 36% round 24px)') }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 0.55, ease: 'power2.inOut' }, 0)
      .fromTo('[data-dvd-l]', { xPercent: 0 }, { xPercent: -70, opacity: 0, duration: 0.5, ease: 'power2.in' }, 0.05)
      .fromTo('[data-dvd-r]', { xPercent: 0 }, { xPercent: 70, opacity: 0, duration: 0.5, ease: 'power2.in' }, 0.05)
      .fromTo('[data-dvd-frame] video', { scale: 1.3 }, { scale: 1, duration: 0.6 }, 0)
      .fromTo('[data-dvd-frame]', { '--shade': 0 }, { '--shade': 1, duration: 0.2 }, 0.55)
      .fromTo('[data-dvd-info]', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out', onStart: () => ($('[data-dvd-info]').inert = false), onReverseComplete: () => ($('[data-dvd-info]').inert = true) }, 0.62)
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
      scrollTrigger: { trigger: '.faixas__pin', start: 'top top', end: () => `+=${dist()}`, pin: true, refreshPriority: 1, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 }
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
     EXPERIÊNCIAS: lista com foto que segue o cursor
     ========================================================= */
  (function experiencias() {
    const list = $('[data-exp]');
    const float = $('[data-exp-float]');
    const fimg = $('[data-exp-float-img]');
    if (fine && !reduce) {
      const fx = gsap.quickTo(float, 'x', { duration: 0.7, ease: 'power3' });
      const fy = gsap.quickTo(float, 'y', { duration: 0.7, ease: 'power3' });
      const rot = gsap.quickTo(float, 'rotation', { duration: 0.9, ease: 'power3' });
      let lastX = 0;
      gsap.set(float, { x: -9999, y: -9999 });
      let placed = false;
      list.addEventListener('pointermove', (e) => {
        const tx = e.clientX - float.offsetWidth * 0.5, ty = e.clientY - float.offsetHeight * 0.55;
        if (!placed) { gsap.set(float, { x: tx, y: ty }); placed = true; }
        fx(tx); fy(ty);
        rot(clamp((e.clientX - lastX) * 0.6, -8, 8)); lastX = e.clientX;
        const row = e.target.closest('.exp__row');
        if (row) { if (!fimg.src.endsWith(row.dataset.img)) fimg.src = row.dataset.img; float.classList.add('is-on'); }
        else float.classList.remove('is-on');
      });
      list.addEventListener('pointerleave', () => { float.classList.remove('is-on'); rot(0); placed = false; });
    }
    if (!reduce) {
      $$('.exp__row', list).forEach((row, k) => {
        gsap.from(row.querySelector('.exp__name'), { yPercent: 100, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: row, start: 'top 90%' } });
        gsap.from(row.querySelector('.exp__desc'), { opacity: 0, x: 30, duration: 1.2, ease: 'expo.out', delay: 0.1, scrollTrigger: { trigger: row, start: 'top 90%' } });
      });
      gsap.from('.exp__head > *', { y: 40, opacity: 0, duration: 1.2, stagger: 0.1, scrollTrigger: { trigger: '.exp', start: 'top 75%' } });
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
      ScrollTrigger.create({ trigger: '.galeria', start: 'top bottom', end: 'bottom top', onUpdate: (s) => skew(clamp(s.getVelocity() / -500, -3, 3)), onLeave: () => skew(0), onLeaveBack: () => skew(0) });
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
     SOCIAL: cromo que acompanha o mouse
     ========================================================= */
  const social = $('.social');
  if (fine) social.addEventListener('pointermove', (e) => social.style.setProperty('--mx', `${(e.clientX / innerWidth) * 100}%`));
  if (!reduce) {
    gsap.fromTo('.social__handle', { yPercent: 30, rotate: -3 }, { yPercent: 0, rotate: 0, ease: 'none', scrollTrigger: { trigger: '.social', start: 'top bottom', end: 'center center', scrub: 1 } });
    gsap.from('.social__links li', { y: 40, opacity: 0, duration: 1, stagger: 0.07, scrollTrigger: { trigger: '.social__links', start: 'top 90%' } });
  }

  /* =========================================================
     CONTRATAÇÃO: pedido em 3 etapas com prévia da mensagem
     ========================================================= */
  const cta = $('[data-cta]');
  if (fine) cta.addEventListener('pointermove', (e) => {
    const r = cta.getBoundingClientRect();
    cta.style.setProperty('--sx', `${e.clientX - r.left}px`);
    cta.style.setProperty('--sy', `${e.clientY - r.top}px`);
  });
  if (!reduce) {
    const ctaSplit = new SplitText('.cta__l', { type: 'words,chars', wordsClass: 'word', charsClass: 'char' });
    gsap.set(ctaSplit.chars, { yPercent: 90, opacity: 0, fontWeight: 200, fontStretch: '75%', rotate: () => gsap.utils.random(-16, 16) });
    ScrollTrigger.create({
      trigger: cta, start: 'top 60%', once: true,
      onEnter: () => {
        gsap.timeline()
          .to(ctaSplit.chars, { yPercent: 0, opacity: 1, rotate: 0, fontWeight: W0, fontStretch: S0, duration: 1.2, stagger: 0.03, ease: 'back.out(2)', clearProps: 'fontWeight,fontStretch,rotate' })
          .from('.cta__lead, .cta__contacts > div', { y: 24, opacity: 0, duration: 1, stagger: 0.06 }, 0.4)
          .from('.booking', { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out' }, 0.2);
      }
    });
  }

  (function booking() {
    const form = $('[data-booking]');
    const panels = $$('[data-step]', form);
    const bar = $('[data-step-bar]');
    const num = $('[data-step-num]');
    const back = $('[data-back]', form), next = $('[data-next]', form), send = $('[data-send]', form);
    const preview = $('[data-preview]');
    const out = $('[data-publico-out]');
    const range = $('#b-publico');
    let step = 1;
    const fmtNum = (n) => Number(n).toLocaleString('pt-BR');
    function message() {
      const f = new FormData(form);
      const d = f.get('data');
      const dataBr = d ? d.split('-').reverse().join('/') : 'a combinar';
      return [
        'Olá! Vim pelo site e quero contratar a Maria Laís (A Mala).',
        `Evento: ${f.get('tipo')}`,
        `Cidade: ${f.get('cidade') || 'a informar'}`,
        `Data: ${dataBr}`,
        `Público estimado: ${fmtNum(f.get('publico'))} pessoas`,
        f.get('empresa') ? `Empresa ou evento: ${f.get('empresa')}` : '',
        f.get('obs') ? `Detalhes: ${f.get('obs')}` : '',
        f.get('nome') ? `Meu nome: ${f.get('nome')}` : ''
      ].filter(Boolean).join('\n');
    }
    const refresh = () => {
      out.textContent = `${fmtNum(range.value)} pessoas`;
      range.style.setProperty('--p', `${((range.value - range.min) / (range.max - range.min)) * 100}%`);
      preview.textContent = message();
    };
    function go(n) {
      const prev = step;
      step = clamp(n, 1, panels.length);
      panels.forEach((p) => {
        const s = +p.dataset.step;
        p.classList.toggle('is-active', s === step);
        p.classList.toggle('is-left', s < step);
        p.toggleAttribute('inert', s !== step);
      });
      bar.style.width = `${(step / panels.length) * 100}%`;
      num.textContent = step;
      back.disabled = step === 1;
      next.hidden = step === panels.length;
      send.hidden = step !== panels.length;
      if (prev !== step) {
        const first = panels[step - 1].querySelector('input:checked, input:not([type="radio"]), textarea');
        setTimeout(() => first && first.focus({ preventScroll: true }), 350);
      }
    }
    form.addEventListener('input', refresh);
    form.addEventListener('change', refresh);
    next.addEventListener('click', () => go(step + 1));
    back.addEventListener('click', () => go(step - 1));
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT' && step < panels.length) { e.preventDefault(); go(step + 1); }
    });
    form.addEventListener('submit', (e) => { e.preventDefault(); openExternal(waLink(message())); });
    refresh(); go(1);
  })();

  /* ---------- atualizações finais ---------- */
  addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts.ready.then(() => ScrollTrigger.refresh());
})();

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
     Entrada: carrega e libera o som com um clique
     ========================================================= */
  const gate = $('[data-gate]');
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
    gsap.to(prog, { v: 100, duration: 0.5, ease: 'power1.out', onUpdate: () => (pctEl.textContent = Math.round(prog.v)), onComplete: () => { gate.classList.add('is-ready'); $('[data-enter="sound"]').focus({ preventScroll: true }); } });
  });
  const behind = ['header.nav', 'main', 'footer', '[data-dock]', '.wa-float'].map((s) => $(s)).filter(Boolean);
  behind.forEach((el) => el.setAttribute('inert', ''));
  let entered = false;
  $$('[data-enter]').forEach((b) => b.addEventListener('click', () => {
    if (entered) return;
    entered = true;
    if (b.dataset.enter === 'sound') music.start();
    reveal();
  }));

  function reveal() {
    intro.play().catch(() => {});
    const tl = gsap.timeline({ onComplete: () => gate.remove() });
    tl.to('.gate__inner', { y: -40, opacity: 0, duration: 0.6, ease: 'power3.in' })
      .to(gate, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '-=0.1')
      .add(() => {
        behind.forEach((el) => el.removeAttribute('inert'));
        document.body.classList.remove('is-loading'); lenis && lenis.start(); ScrollTrigger.refresh();
        $('[data-dock]').classList.add('is-visible');
        const h1 = $('.abertura__title'); h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true });
      }, '-=0.6');
    if (!reduce) {
      tl.fromTo('.abertura__bars span', { height: '50vh' }, { height: isMobile() ? '5vh' : '9vh', duration: 1.8, ease: 'expo.inOut' }, '-=0.9')
        .from('.abertura__media', { scale: 1.25, duration: 2.6, ease: 'expo.out' }, '<')
        .from(titleSplit ? titleSplit.chars : '.abertura__title', { yPercent: 110, opacity: 0, duration: 1.2, stagger: 0.025 }, '-=1.2')
        .from('.abertura__kicker, .abertura__foot, .abertura__scroll', { y: 24, opacity: 0, duration: 1.2, stagger: 0.12 }, '-=1.0');
    }
  }

  /* split de títulos (antes do reveal) */
  let titleSplit = null;
  if (!reduce) {
    titleSplit = new SplitText('.abertura__title > span', { type: 'words,chars', wordsClass: 'word', charsClass: 'char' });
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
  ScrollTrigger.create({ trigger: '#sobre', start: 'top 60%', onEnter: () => waFloat.classList.add('is-visible'), onLeaveBack: () => waFloat.classList.remove('is-visible') });

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
        ctx2d.fillStyle = '#fff';
        const bw = W / N;
        for (let i = 0; i < N; i++) {
          const h = Math.max(2, (analyser ? lv[i] : 0.15 + 0.1 * Math.sin(performance.now() / 300 + i)) * H);
          ctx2d.globalAlpha = 0.35 + lv[i] * 0.65;
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
  new IntersectionObserver(([e]) => { $('[data-dock]').classList.toggle('is-tucked', e.isIntersecting && innerWidth <= 860); }, { threshold: 0.05 }).observe($('[data-booking]'));

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
     Faíscas do logo (canvas)
     ========================================================= */
  // faíscas desativadas: direção minimalista em preto e prata
  const sparks = { emit() {}, start() {}, stop() {}, size() {}, set active(v) {}, set flare(v) {} };

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

  // com a música tocando, as barras do logo viram um equalizador de verdade
  gsap.ticker.add(() => {
    if (!music.playing) return;
    const r = stage.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const lv = music.levels(4);
    bars.forEach((b, i) => gsap.set(b, { scaleY: 0.3 + Math.min(1, lv[[1, 0, 2, 3][i]] * 1.25) * 0.7 }));
  });

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
    // o vídeo vira uma faixa horizontal (corte de cinema) e some antes do logo
    const band = { t: 0, s: 0 };
    const applyBand = () => { wrap.style.clipPath = `inset(${band.t}% ${band.s}% ${band.t}% ${band.s}%)`; };
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
          on ? (sparks.start(), music.playing ? eq.forEach((t) => t.pause()) : eq.forEach((t) => t.play())) : eq.forEach((t) => t.pause());
        },
        onLeave: () => { sparks.stop(); eq.forEach((t) => t.pause()); },
        onEnterBack: () => sparks.start()
      }
    });

    tl.to('[data-intro-copy]', { opacity: 0, y: -80, duration: 0.12 }, 0)
      .to('.abertura__bars span', { scaleY: 0, duration: 0.1 }, 0)
      .fromTo(band, { t: 0, s: 0 }, { t: 41, s: 6, duration: 0.3, ease: 'power2.inOut', onUpdate: applyBand }, 0.06)
      .to(wrap, { opacity: 0, duration: 0.1 }, 0.34)
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
      .fromTo('[data-logo-sub]', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.14, ease: 'power2.out' }, 0.66)
      // assinatura final: MARIA LAÍS | A MALA, como na arte oficial
      .to(logo, { scale: () => lockupGeom().s, x: () => lockupGeom().dx, y: () => lockupGeom().dy, duration: 0.2, ease: 'power2.inOut' }, 0.86)
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
    gsap.fromTo('.social__handle', { backgroundPosition: '100% 50%', yPercent: 30 }, { backgroundPosition: '0% 50%', yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.social', start: 'top bottom', end: 'center center', scrub: 1 } });
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
    gsap.set(ctaSplit.chars, { yPercent: 110, opacity: 0 });
    ScrollTrigger.create({
      trigger: cta, start: 'top 60%', once: true,
      onEnter: () => {
        gsap.timeline()
          .to(ctaSplit.chars, { yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.022, ease: 'expo.out' })
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

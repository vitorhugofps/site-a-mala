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
    if (!id || id[0] !== '#' || id.length < 2) return;
    const el = $(id);
    if (!el) return;
    e.preventDefault();
    closeMenu();
    scrollToEl(el);
  }));

  intro.play().catch(() => {});

  /* =========================================================
     PRELOADER: contador 000 → 100 com as barras do logo
     ========================================================= */
  const loaderEl = $('[data-loader]');
  let introDone;
  const introReady = new Promise((r) => (introDone = r));
  (function loader() {
    if (!loaderEl || reduce) { loaderEl && loaderEl.remove(); introDone(); return; }
    document.body.classList.add('is-loading');
    const behindL = ['.skip', 'header.nav', 'main', 'footer', '[data-dock]', '.wa-float'].map((q) => $(q)).filter(Boolean);
    behindL.forEach((el) => (el.inert = true));
    lenis && lenis.stop();
    const num = $('[data-loader-num]'), bars = $$('.loader__bars i', loaderEl);
    const st = { v: 0 };
    const counter = gsap.to(st, { v: 86, duration: 1.4, ease: 'power2.out', onUpdate: () => { num.textContent = String(Math.round(st.v)).padStart(3, '0'); bars.forEach((b, i) => gsap.set(b, { scaleY: clamp(st.v / 100 * 1.2 - i * 0.08 + 0.15 * Math.sin(st.v / 6 + i), 0.12, 1) })); } });
    const ready = new Promise((r) => { if (intro.readyState >= 2) r(); intro.addEventListener('loadeddata', r, { once: true }); intro.addEventListener('error', r, { once: true }); });
    Promise.race([Promise.all([document.fonts.ready, ready, new Promise((r) => setTimeout(r, 1300))]), new Promise((r) => setTimeout(r, 4000))]).then(() => {
      counter.kill();
      gsap.timeline({ onComplete: () => { loaderEl.remove(); behindL.forEach((el) => (el.inert = false)); document.body.classList.remove('is-loading'); lenis && lenis.start(); ScrollTrigger.refresh(); } })
        .to(st, { v: 100, duration: 0.4, ease: 'power1.out', onUpdate: () => (num.textContent = String(Math.round(st.v)).padStart(3, '0')) })
        .to(bars, { scaleY: 1, duration: 0.3, stagger: 0.04, ease: 'power2.out' }, 0)
        .to('.loader__count, .loader__label', { yPercent: -60, opacity: 0, duration: 0.6, ease: 'power3.in' }, 0.45)
        .to(bars, { scaleY: 0, duration: 0.5, stagger: 0.04, ease: 'power3.in' }, 0.5)
        .to(loaderEl, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut' }, 0.8)
        .add(introDone, 1.1);
    });
  })();

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
      const mx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
      const my = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.15);
        my((e.clientY - r.top - r.height / 2) * 0.2);
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
  const behindMenu = () => ['.skip', 'main', 'footer', '[data-dock]', '.wa-float', '.nav__logo', '.nav__cta'].map((q) => $(q)).filter(Boolean);
  function closeMenu() { if (!menuOpen) return; menuOpen = false; menu.hidden = true; menuBtn.querySelector('.sr').textContent = 'Abrir menu'; behindMenu().forEach((el) => (el.inert = false)); menuBtn.setAttribute('aria-expanded', 'false'); lenis && lenis.start(); }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) { closeMenu(); menuBtn.focus(); } });
  menuBtn.addEventListener('click', () => {
    menuOpen = !menuOpen;
    menu.hidden = !menuOpen;
    menuBtn.setAttribute('aria-expanded', String(menuOpen));
    menuBtn.querySelector('.sr').textContent = menuOpen ? 'Fechar menu' : 'Abrir menu';
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
     PLAYER PRÓPRIO (YouTube IFrame API sem controles nativos)
     ========================================================= */
  const player = $('[data-player]');
  const frame = $('[data-player-frame]');
  const mpStage = $('[data-mp-stage]');
  const mpTitle = $('[data-player-title]');
  const mpYT = $('[data-player-yt]');
  const mpPoster = $('[data-mp-poster]');
  const mpPosterImg = $('[data-mp-poster-img]');
  const mpSeek = $('[data-mp-seek]');
  const mpProg = $('[data-mp-prog]');
  const mpBuf = $('[data-mp-buf]');
  const mpTip = $('[data-mp-tip]');
  const mpMarks = $('[data-mp-marks]');
  const mpCur = $('[data-mp-cur]');
  const mpDur = $('[data-mp-dur]');
  const mpChap = $('[data-mp-chap]');
  const mpVol = $('[data-mp-vol]');
  const mpList = $('[data-mp-list]');
  let lastFocus = null, musicWasOn = false, yt = null, ytReady = null, current = null, poll = 0, idleT = 0, dragging = false;
  const fmtT = (s) => { s = Math.max(0, Math.floor(s || 0)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return (h ? `${h}:${String(m).padStart(2, '0')}` : String(m).padStart(2, '0')) + ':' + String(x).padStart(2, '0'); };

  // playlist: os cards das mais assistidas (na mesma ordem) + capítulos do DVD
  const PLAYLIST = $$('.card[data-yt]').map((c) => ({ id: c.dataset.yt, title: c.dataset.ytTitle, img: (c.querySelector('img') || {}).getAttribute ? c.querySelector('img').getAttribute('src') : '', meta: (c.querySelector('.card__info p') || {}).textContent || '' }));
  mpList.innerHTML = PLAYLIST.map((v, i) => `<li><button type="button" data-mp-item="${i}"><img src="${v.img}" alt="" loading="lazy"><span><b>${v.title.replace(/</g, '&lt;')}</b><small>${String(i + 1).padStart(2, '0')} · ${v.meta.replace(/Inédita/i, 'INÉDITA ·').trim()}</small></span></button></li>`).join('');

  function loadYT() {
    if (ytReady) return ytReady;
    ytReady = new Promise((resolve, reject) => {
      if (window.YT && window.YT.Player) return resolve(window.YT);
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { prev && prev(); resolve(window.YT); };
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      s.onerror = reject;
      document.head.appendChild(s);
      setTimeout(() => reject(new Error('timeout')), 9000);
    });
    return ytReady;
  }
  function chaptersFor(id) { return id === DVD_ID ? SETLIST : null; }
  function drawMarks(id, dur) {
    const ch = chaptersFor(id);
    mpMarks.innerHTML = ch && dur ? ch.slice(1).map((c) => `<i style="left:${(c.t / dur) * 100}%"></i>`).join('') : '';
  }
  function chapterAt(id, t) { const ch = chaptersFor(id); if (!ch) return ''; let k = 0; ch.forEach((c, i) => { if (t >= c.t) k = i; }); return `${String(k + 1).padStart(2, '0')} · ${ch[k].title}`; }
  function setState(cls, on) { player.classList.toggle(cls, on); }
  function tick() {
    if (!yt || !yt.getDuration) return;
    const d = yt.getDuration() || 0, t = dragging ? +mpSeek.dataset.t || 0 : (yt.getCurrentTime() || 0);
    mpProg.style.transform = `scaleX(${d ? t / d : 0})`;
    mpBuf.style.transform = `scaleX(${yt.getVideoLoadedFraction ? yt.getVideoLoadedFraction() : 0})`;
    mpCur.textContent = fmtT(t); mpDur.textContent = fmtT(d);
    mpSeek.setAttribute('aria-valuenow', d ? Math.round((t / d) * 100) : 0);
    mpChap.textContent = chapterAt(current && current.id, t);
    if (d && !mpMarks.dataset.done) { drawMarks(current.id, d); mpMarks.dataset.done = '1'; }
  }
  function onState(e) {
    const S = window.YT.PlayerState;
    setState('is-playing', e.data === S.PLAYING);
    setState('is-paused', e.data === S.PAUSED);
    setState('is-buffering', e.data === S.BUFFERING);
    if (e.data === S.PLAYING) { setState('is-started', true); wake(); }
    if (e.data === S.ENDED) next(1);
  }
  function wake() {
    setState('is-idle', false);
    clearTimeout(idleT);
    idleT = setTimeout(() => { if (player.classList.contains('is-playing') && !dragging) setState('is-idle', true); }, 2600);
  }
  function load(item, start = 0, autoplay = true) {
    current = item;
    mpMarks.dataset.done = ''; mpMarks.innerHTML = '';
    mpTitle.textContent = item.title;
    mpYT.href = `https://www.youtube.com/watch?v=${encodeURIComponent(item.id)}${start ? `&t=${start}s` : ''}`;
    mpPosterImg.src = item.img || 'assets/img/card-dvd.webp';
    setState('is-started', false);
    $$('[data-mp-item]', mpList).forEach((b) => b.classList.toggle('is-current', PLAYLIST[+b.dataset.mpItem].id === item.id));
    const cur = $('.is-current', mpList); cur && cur.scrollIntoView({ block: 'nearest' });
    gsap.fromTo(mpTitle, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: 'expo.out' });
    setState('is-buffering', true);
    loadYT().then((YT) => {
      if (!yt) {
        const el = document.createElement('div'); frame.replaceChildren(el);
        yt = new YT.Player(el, {
          host: 'https://www.youtube-nocookie.com', videoId: item.id,
          playerVars: { autoplay: autoplay ? 1 : 0, controls: 0, disablekb: 1, fs: 0, rel: 0, iv_load_policy: 3, modestbranding: 1, playsinline: 1, start: Math.floor(start), origin: location.origin },
          events: {
            onReady: () => { yt.setVolume(+mpVol.value); if (autoplay) yt.playVideo(); setState('is-buffering', false); },
            onStateChange: onState
          }
        });
      } else {
        autoplay ? yt.loadVideoById({ videoId: item.id, startSeconds: start }) : yt.cueVideoById({ videoId: item.id, startSeconds: start });
      }
    }).catch(() => { setState('is-buffering', false); player.close(); openExternal(mpYT.href); });
    clearInterval(poll); poll = setInterval(tick, 250);
  }
  function openPlayer(id, title, start = 0) {
    if (PREVIEW) { openExternal(`https://www.youtube.com/watch?v=${encodeURIComponent(id)}${start ? `&t=${start}s` : ''}`); return; }
    musicWasOn = music.wanted;
    if (musicWasOn) music.pause();
    lastFocus = document.activeElement;
    const found = PLAYLIST.find((v) => v.id === id);
    const item = found ? { ...found } : { id, title: title || 'Maria Laís', img: 'assets/img/card-dvd.webp', meta: '' };
    if (id === DVD_ID && title && start) item.title = `DVD completo · ${title}`; else if (id === DVD_ID) item.title = 'Mais ou Menos Assim, DVD completo';
    if (!player.open) player.showModal();
    load(item, start, true);
    $('[data-mp-play]').focus({ preventScroll: true });
    lenis && lenis.stop();
    gsap.fromTo('.mp__box', { y: 40, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'expo.out' });
    gsap.from('.mp__list li', { x: 30, opacity: 0, duration: 0.8, stagger: 0.04, ease: 'expo.out', delay: 0.15 });
  }
  function toggle() { if (!yt || !yt.getPlayerState) return; const S = window.YT.PlayerState; yt.getPlayerState() === S.PLAYING ? yt.pauseVideo() : yt.playVideo(); wake(); }
  function next(dir) { if (!current) return; const i = PLAYLIST.findIndex((v) => v.id === current.id); const n = PLAYLIST[(i + dir + PLAYLIST.length) % PLAYLIST.length]; load(n, 0, true); }
  function seekTo(clientX, commit) {
    const r = mpSeek.getBoundingClientRect(); const p = clamp((clientX - r.left) / r.width, 0, 1);
    const d = yt && yt.getDuration ? yt.getDuration() : 0; const t = p * d;
    mpSeek.dataset.t = t;
    mpTip.style.left = `${p * 100}%`; mpTip.textContent = `${fmtT(t)}${chapterAt(current && current.id, t) ? '  ·  ' + chapterAt(current.id, t) : ''}`;
    if (commit && yt) yt.seekTo(t, true);
    tick();
  }
  function closePlayer() { player.close(); }
  player.addEventListener('close', () => {
    clearInterval(poll); clearTimeout(idleT);
    try { yt && yt.pauseVideo && yt.pauseVideo(); } catch (e) {}
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setState('is-playing', false); setState('is-idle', false);
    lenis && lenis.start(); lastFocus && lastFocus.focus && lastFocus.focus(); if (musicWasOn) music.play();
  });
  player.addEventListener('click', (e) => { if (e.target === player) closePlayer(); });
  $('[data-player-close]').addEventListener('click', closePlayer);
  $('[data-mp-hit]').addEventListener('click', toggle);
  $('[data-mp-hit]').addEventListener('dblclick', () => $('[data-mp-fs]').click());
  mpPoster.addEventListener('click', () => { yt && yt.playVideo ? yt.playVideo() : null; });
  $('[data-mp-play]').addEventListener('click', toggle);
  $('[data-mp-prev]').addEventListener('click', () => next(-1));
  $('[data-mp-next]').addEventListener('click', () => next(1));
  $('[data-mp-mute]').addEventListener('click', () => { if (!yt) return; const m = yt.isMuted(); m ? yt.unMute() : yt.mute(); setState('is-muted', !m); });
  mpVol.addEventListener('input', () => { if (!yt) return; yt.setVolume(+mpVol.value); if (+mpVol.value > 0 && yt.isMuted()) { yt.unMute(); setState('is-muted', false); } });
  $('[data-mp-fs]').addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else (mpStage.requestFullscreen || mpStage.webkitRequestFullscreen || (() => {})).call(mpStage);
  });
  mpList.addEventListener('click', (e) => { const b = e.target.closest('[data-mp-item]'); if (b) load(PLAYLIST[+b.dataset.mpItem], 0, true); });
  mpSeek.addEventListener('pointerdown', (e) => { dragging = true; mpSeek.classList.add('is-drag'); mpSeek.setPointerCapture(e.pointerId); seekTo(e.clientX, false); });
  mpSeek.addEventListener('pointermove', (e) => { seekTo(e.clientX, false); if (!dragging) { mpSeek.dataset.t = ''; } wake(); });
  mpSeek.addEventListener('pointerup', (e) => { if (!dragging) return; dragging = false; mpSeek.classList.remove('is-drag'); seekTo(e.clientX, true); });
  mpStage.addEventListener('pointermove', wake);
  player.addEventListener('keydown', (e) => {
    if (!yt || !yt.getCurrentTime) return;
    if (e.target.closest('input, .mp__list, .mp__bar')) return;
    const k = e.key.toLowerCase();
    if (k === ' ' || k === 'k') { e.preventDefault(); toggle(); }
    else if (k === 'arrowright') { e.preventDefault(); yt.seekTo(yt.getCurrentTime() + 5, true); wake(); }
    else if (k === 'arrowleft') { e.preventDefault(); yt.seekTo(Math.max(0, yt.getCurrentTime() - 5), true); wake(); }
    else if (k === 'm') $('[data-mp-mute]').click();
    else if (k === 'f') $('[data-mp-fs]').click();
  });
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
        ctx2d.fillStyle = '#ffc531';
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
  new IntersectionObserver(([e]) => { const t = e.isIntersecting; $('[data-dock]').classList.toggle('is-tucked', t); $('.wa-float').classList.toggle('is-hidden-cta', t); }, { threshold: 0.05 }).observe($('[data-booking]'));

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
  introReady.then(() => setTimeout(() => $('[data-dock]').classList.add('is-visible'), reduce ? 0 : 900));

  /* pulso da música (0..1) em --beat: o logo da abertura respira no ritmo */
  let beat = 0;
  gsap.ticker.add(() => {
    let target = 0;
    if (music.playing) { const lv = music.levels(6); target = Math.min(1, (lv[0] * 0.6 + lv[1] * 0.4) * 1.35); }
    beat += (target - beat) * (target > beat ? 0.45 : 0.12);
    if (beat < 0.002) beat = 0;
    if (beat || root.__b) { root.style.setProperty('--beat', beat.toFixed(3)); root.__b = beat; }
  });

  /* =========================================================
     TÍTULOS: as linhas sobem por trás de uma máscara
     ========================================================= */
  const splits = new Map();
  $$('[data-play-type]').forEach((h) => {
    if (reduce) return;
    const sp = new SplitText(h, { type: 'lines,words', linesClass: 'tl', wordsClass: 'tw', mask: 'lines', aria: 'auto' });
    splits.set(h, sp);
    if (h.classList.contains('hero__title')) return; // a abertura cuida do próprio título
    gsap.set(sp.words, { yPercent: 110 });
    ScrollTrigger.create({
      trigger: h, start: 'top 86%', once: true,
      onEnter: () => gsap.to(sp.words, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.06 })
    });
  });

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
    const pulse = 1 + beat * 0.02 * (1 - hs.z);
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
  if (!reduce) { heroCopy.inert = true; navLogo.classList.add('is-hidden'); navLogo.inert = true; }
  const heroSplit = splits.get(heroTitle);
  if (!reduce) {
    // entrada: o logo acende como luz de palco
    gsap.set(heroHalo, { opacity: 0, scale: 0.86 }); gsap.set('[data-hero-cue]', { opacity: 0, y: 20 });
    introReady.then(() => {
      gsap.to(heroHalo, { opacity: 1, scale: 1, duration: 2.2, ease: 'expo.out' });
      gsap.to('[data-hero-cue]', { opacity: 1, y: 0, duration: 1.2, delay: 0.8 });
    });
    if (heroSplit) gsap.set(heroSplit.words, { yPercent: 110 });

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: heroEl, start: 'top top', end: 'bottom bottom', scrub: 0.9, invalidateOnRefresh: true,
        onUpdate: (self) => {
          const on = self.progress > 0.62;
          if (on !== heroCopy.classList.contains('is-on')) { heroCopy.classList.toggle('is-on', on); heroCopy.inert = !on; }
          navLogo.classList.toggle('is-hidden', self.progress < 0.5); navLogo.inert = self.progress < 0.5;
        }
      }
    });
    tl.to(hs, { z: 1, duration: 0.55, ease: 'power2.in' }, 0)
      .to(hs, { a: 1, duration: 0.12, ease: 'power1.in' }, 0.44)
      .to('[data-hero-cue]', { opacity: 0, y: 30, duration: 0.08 }, 0)
      .fromTo('.hero__video', { scale: 1.04, filter: 'brightness(1.4) saturate(1.3)' }, { scale: 1.18, filter: 'brightness(1.05) saturate(1.1)', duration: 0.6, ease: 'power1.inOut' }, 0)
      .to('.hero__shade', { opacity: 1, duration: 0.18 }, 0.52)
      .to(heroCopy, { opacity: 1, duration: 0.08 }, 0.6)
      .from('.hero__kicker', { y: 30, opacity: 0, duration: 0.1, ease: 'power2.out' }, 0.6);
    if (heroSplit) tl.to(heroSplit.words, { yPercent: 0, duration: 0.14, ease: 'power3.out', stagger: 0.012 }, 0.62);
    tl.from('.hero__foot', { y: 40, opacity: 0, duration: 0.12, ease: 'power2.out' }, 0.74)
      .to({}, { duration: 0.12 });
  } else {
    heroCopy.classList.add('is-on');
  }

  let scrollVel = 0;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (st) => { scrollVel = st.getVelocity(); } });

  /* letreiro com os nomes das músicas: corre devagar e acelera com o scroll */
  $$('[data-band]').forEach((track) => {
    track.innerHTML += track.innerHTML;
    if (reduce) return;
    const dir = +track.dataset.band || -1;
    let x = 0, half = track.scrollWidth / 2;
    addEventListener('resize', () => (half = track.scrollWidth / 2));
    let bandVis = true; new IntersectionObserver(([e]) => (bandVis = e.isIntersecting)).observe(track);
    gsap.ticker.add((t, dt) => {
      if (!bandVis) return;
      const flip = scrollVel < -40 ? -1 : 1;
      const speed = (0.7 + Math.min(8, Math.abs(scrollVel) / 300)) * dir * flip;
      x += speed * (dt / 16.67);
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      track.style.transform = `translate3d(${x}px,0,0)`;
    });
  });
  gsap.ticker.add(() => { scrollVel *= 0.94; });

  /* =========================================================
     IDENTIDADE EM MOVIMENTO
     ========================================================= */
  // texto que decodifica (rótulos mono, HUD)
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/—·#';
  function scramble(el, text, dur = 0.9) {
    if (reduce) { el.textContent = text; return; }
    const o = { p: 0 }; const len = text.length;
    gsap.killTweensOf(el.__s || {});
    el.__s = o;
    gsap.to(o, { p: 1, duration: dur, ease: 'none', onUpdate: () => {
      const n = Math.floor(o.p * len);
      let out = text.slice(0, n);
      for (let i = n; i < len; i++) out += text[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      el.textContent = out;
    }, onComplete: () => (el.textContent = text) });
  }
  $$('[data-scramble]').forEach((el) => {
    const txt = el.textContent;
    if (reduce) return;
    el.textContent = '';
    ScrollTrigger.create({ trigger: el.parentElement, start: 'top 85%', once: true, onEnter: () => scramble(el, txt, 1.1) });
  });
  $$('.nav__links a').forEach((a) => { const t = a.textContent; a.addEventListener('pointerenter', () => scramble(a, t, 0.45)); });


  // sobre: rastro de fotos do DVD seguindo o cursor
  (function trail() {
    const box = $('[data-trail]'); const sec = $('.sobre');
    if (!box || !fine || reduce) return;
    const srcs = ['01', '02', '03', '04', '05', '06', '07', '08', '10', '13', '15', '16'].map((n) => `assets/img/palco-${n}.webp`);
    let pool = null, k = 0, lx = 0, ly = 0, z = 1;
    const build = () => { pool = srcs.map((s) => { const i = new Image(); i.src = s; i.alt = ''; i.decoding = 'async'; box.appendChild(i); return i; }); };
    sec.addEventListener('pointermove', (e) => {
      const r = sec.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top;
      if (!pool) { build(); lx = x; ly = y; return; }
      if (Math.hypot(x - lx, y - ly) < 110) return;
      lx = x; ly = y;
      const img = pool[k++ % pool.length];
      const w = img.offsetWidth || 220, h = w * 0.625;
      gsap.killTweensOf(img);
      gsap.set(img, { x: x - w / 2, y: y - h / 2, zIndex: z++, opacity: 1, scale: 0.6, rotate: 0 });
      gsap.timeline().to(img, { scale: 1, duration: 0.5, ease: 'expo.out' }).to(img, { opacity: 0, scale: 0.85, duration: 0.7, ease: 'power2.in' }, 0.55);
    });
  })();

  // números: equalizador gigante que reage à música
  (function eqBars() {
    const box = $('[data-eq]'); if (!box) return;
    const N = innerWidth < 700 ? 28 : 64;
    box.innerHTML = '<i></i>'.repeat(N);
    const bars = $$('i', box);
    if (reduce) return;
    let vis = false;
    new IntersectionObserver(([e]) => (vis = e.isIntersecting)).observe(box);
    gsap.ticker.add((t) => {
      if (!vis) return;
      const lv = music.playing ? music.levels(N / 2) : null;
      bars.forEach((b, i) => {
        const j = i < N / 2 ? N / 2 - 1 - i : i - N / 2;
        const v = lv ? 0.08 + lv[j] * 0.95 : 0.1 + 0.08 * (Math.sin(t * 2.2 + i * 0.45) + 1) + 0.05 * Math.sin(t * 5.3 + i);
        b.style.transform = `scaleY(${v.toFixed(3)})`;
      });
    });
  })();

  // frases do "sobre" inclinam com a velocidade do scroll
  if (!reduce) {
    const lines = $$('.line');
    const skewTo = lines.map((l) => gsap.quickTo(l, 'skewX', { duration: 0.6, ease: 'power3' }));
    let sobreVis = false; new IntersectionObserver(([e]) => (sobreVis = e.isIntersecting)).observe($('.sobre'));
    gsap.ticker.add(() => { if (!sobreVis) return; const v = clamp(-scrollVel / 380, -7, 7); skewTo.forEach((f) => f(v)); });
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

  /* =========================================================
     DVD: quadro que cresce até a tela cheia
     ========================================================= */
  if (!reduce) {
    const small = () => innerWidth <= 860;
    $('[data-dvd-info]').inert = true;
    const dtl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.dvd', start: 'top top', end: 'bottom bottom', scrub: 0.8 } });
    dtl.fromTo('[data-dvd-frame]', { clipPath: () => (small() ? 'inset(8% 8% 46% 8% round 10px)' : 'inset(10% 38% 46% 34% round 10px)') }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 0.55, ease: 'power2.inOut' }, 0)
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
    });
    gsap.from('.faixas__head > p', { y: 24, opacity: 0, duration: 1.2, scrollTrigger: { trigger: '.faixas', start: 'top 70%' } });
    // coverflow: o card do centro ganha destaque, os outros recuam e escurecem
    const cards = $$('.card', track);
    const cf = () => {
      const cx = innerWidth / 2;
      cards.forEach((c) => {
        const r = c.getBoundingClientRect(); if (r.right < -200 || r.left > innerWidth + 200) return;
        const d = clamp(Math.abs(r.left + r.width / 2 - cx) / (innerWidth * 0.55), 0, 1);
        c.style.transform = `scale(${(1 - d * 0.12).toFixed(3)})`;
        c.style.setProperty('--dim', (d * 0.55).toFixed(3));
      });
    };
    let cfOn = false; ScrollTrigger.create({ trigger: '.faixas', start: 'top bottom', end: 'bottom top', onToggle: (st) => (cfOn = st.isActive) });
    const cfTick = () => cfOn && cf();
    gsap.ticker.add(cfTick);
    return () => { gsap.ticker.remove(cfTick); cards.forEach((c) => { c.style.transform = ''; c.style.removeProperty('--dim'); }); };
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
      card.addEventListener('pointerleave', stop);
    } else if (v) {
      new IntersectionObserver(([e]) => (e.intersectionRatio > 0.7 ? play() : stop()), { threshold: [0, 0.7] }).observe(card);
    }
    card.addEventListener('focus', play);
    card.addEventListener('blur', stop);
  });

  /* =========================================================
     FORMATOS: cards que se empilham no scroll
     ========================================================= */
  (function stack() {
    const cards = $$('.stack__card');
    if (reduce) return;
    cards.forEach((card, i) => {
      const shade = document.createElement('span'); shade.className = 'stack__shade'; card.appendChild(shade);
      const img = card.querySelector('.stack__img');
      gsap.fromTo(img, { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'top 20%', scrub: true } });
      const name = card.querySelector('.stack__name');
      gsap.from(name, { yPercent: 60, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 65%' } });
      gsap.from(card.querySelectorAll('.stack__meta, .stack__desc, .btn'), { y: 24, opacity: 0, duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 60%' } });
      const nxt = cards[i + 1];
      if (!nxt) return;
      gsap.timeline({ scrollTrigger: { trigger: nxt, start: 'top bottom', end: 'top 15%', scrub: true } })
        .to(card, { scale: 0.9, ease: 'none' }, 0)
        .to(shade, { opacity: 0.6, ease: 'none' }, 0);
    });
    // foco por teclado: leva o card para a posição natural (o próximo card sticky não cobre o botão)
    $('[data-stack]').addEventListener('focusin', (e) => {
      const card = e.target.closest('.stack__card'); if (!card) return;
      let y = 0, el = card; while (el) { y += el.offsetTop; el = el.offsetParent; }
      const top = y - (parseFloat(getComputedStyle(card).top) || 0);
      lenis ? lenis.scrollTo(top, { immediate: true }) : scrollTo(0, top);
    });
  })();

  /* =========================================================
     GALERIA: duas faixas de fotos do DVD que correm em sentidos opostos
     ========================================================= */
  (function gallery() {
    const photos = ['01', '02', '03', '04', '05', '06', '07', '08', '10', '13', '15', '16'];
    const alts = 'Maria Laís no palco do DVD Mais ou Menos Assim';
    const rows = $$('.galeria__row');
    const half = Math.ceil(photos.length / 2);
    [photos.slice(0, half), photos.slice(half)].forEach((set, r) => {
      rows[r].innerHTML = set.map((p) => `<button class="shot" type="button" data-shot="assets/img/palco-${p}.webp" data-cursor="Ver"><img src="assets/img/palco-${p}.webp" alt="${alts}" width="1800" height="1012" loading="lazy"></button>`).join('');
    });
    if (!reduce) {
      rows.forEach((row) => {
        const dir = +row.dataset.row;
        gsap.fromTo(row, { x: () => (dir > 0 ? 0 : -(row.scrollWidth - innerWidth) * 0.5) }, {
          x: () => (dir > 0 ? -(row.scrollWidth - innerWidth) * 0.5 : 0), ease: 'none',
          scrollTrigger: { trigger: '.galeria', start: 'top bottom', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true }
        });
      });
      gsap.from('.galeria__head > p', { y: 24, opacity: 0, duration: 1.2, scrollTrigger: { trigger: '.galeria', start: 'top 75%' } });
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
     SOCIAL
     ========================================================= */
  if (!reduce) {
    gsap.fromTo('.social__handle', { yPercent: 25, opacity: 0.2 }, { yPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.social', start: 'top bottom', end: 'center center', scrub: 1 } });
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
    ScrollTrigger.create({
      trigger: cta, start: 'top 60%', once: true,
      onEnter: () => {
        gsap.timeline()
          .from('.cta__wa, .cta__contacts > div', { y: 24, opacity: 0, duration: 1, stagger: 0.06 }, 0.4)
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

/* YANA CH. — portfolio. Scroll scenes are driven by GSAP ScrollTrigger, smooth scroll by Lenis.
   Tall sections (.tall) hold a sticky .pin; scene progress = how far the tall section has scrolled. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lang = () => html.dataset.lang;
  const bi = (ru, en) => `<span lang="ru">${ru}</span><span lang="en">${en}</span>`;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const go = (y) => {
    if (lenis) lenis.scrollTo(y, { duration: 1.7, easing: t => 1 - Math.pow(1 - t, 4), force: true });
    else scrollTo(0, y);
  };
  const lock = (on) => { if (lenis) on ? lenis.stop() : lenis.start(); else document.body.style.overflow = on ? 'hidden' : ''; };
  const topOf = (el) => el.getBoundingClientRect().top + scrollY;

  /* ---------- text splitting ---------- */
  const langSpans = (el) => { const s = $$(':scope > [lang]', el); return s.length ? s : [el]; };
  const splitWords = (el, wrap) => langSpans(el).map(sp => {
    const words = sp.textContent.trim().split(/\s+/);
    sp.innerHTML = words.map(w => wrap ? `<span class="w"><span>${w}</span></span>` : `<span class="w">${w} </span>`).join(wrap ? ' ' : '');
    return $$(wrap ? '.w > span' : '.w', sp);
  });

  /* ---------- sections, rail, menu ---------- */
  const secs = $$('main [data-num]');
  const rail = $('#rail'), menuList = $('#menuList');
  secs.forEach((s, i) => {
    const b = document.createElement('button');
    b.innerHTML = `<span>${s.dataset.num} · ${bi(s.dataset.ru, s.dataset.en)}</span><i></i>`;
    b.setAttribute('aria-label', s.dataset.en);
    b.onclick = () => go(i ? topOf(s) : 0);
    rail.append(b);
    const li = document.createElement('li');
    li.style.setProperty('--i', i);
    li.innerHTML = `<a href="#${s.id}" data-pic="${s.dataset.pic}"><i>${s.dataset.num}</i>${bi(s.dataset.ru, s.dataset.en)}</a>`;
    menuList.append(li);
  });
  const railBtns = $$('button', rail), menuLinks = $$('a', menuList);
  let active = -1;
  const setActive = (i) => {
    if (i === active) return;
    active = i;
    const s = secs[i];
    html.dataset.theme = s.dataset.theme;
    $('#nowNum').textContent = s.dataset.num;
    $('#nowLab').textContent = s.dataset[lang()];
    railBtns.forEach((b, k) => b.classList.toggle('on', k === i));
    menuLinks.forEach((a, k) => a.classList.toggle('on', k === i));
  };
  secs.forEach((s, i) => ScrollTrigger.create({ trigger: s, start: 'top 55%', end: 'bottom 55%', onToggle: st => st.isActive && setActive(i) }));
  setActive(0);

  const menuBtn = $('#menuBtn'), menu = $('#menu'), menuPic = $('#menuPic');
  const setMenu = (on) => {
    html.classList.toggle('menu-open', on);
    menuBtn.setAttribute('aria-expanded', on);
    menu.setAttribute('aria-hidden', !on);
    lock(on);
  };
  menuBtn.onclick = () => setMenu(!html.classList.contains('menu-open'));
  menuLinks.forEach((a, i) => {
    a.onclick = (e) => { e.preventDefault(); setMenu(false); go(i ? topOf(secs[i]) : 0); };
    a.onmouseenter = () => { menuPic.src = `assets/img/${a.dataset.pic}-s.webp`; };
  });
  $$('[data-go]').forEach(a => a.onclick = (e) => { e.preventDefault(); setMenu(false); go(0); });

  /* ---------- contact: header link, quiet dock, prefilled WhatsApp ---------- */
  const waText = { ru: 'Здравствуйте, Яна! Хочу обсудить проект интерьера.', en: 'Hello Yana! I would like to discuss an interior project.' };
  const setWa = () => $$('[data-wa]').forEach(a => { a.href = 'https://wa.me/79112136655?text=' + encodeURIComponent(waText[lang()]); });
  setWa();
  const contacts = $('#contacts'), dock = $('#dock'), dockBtn = $('#dockBtn');
  $$('[data-contact]').forEach(a => a.onclick = (e) => { e.preventDefault(); setMenu(false); go(topOf(contacts)); });
  const setDock = (on) => { dock.classList.toggle('open', on); dockBtn.setAttribute('aria-expanded', on); };
  dockBtn.onclick = () => setDock(!dock.classList.contains('open'));
  document.addEventListener('click', e => { if (!dock.contains(e.target)) setDock(false); });
  const dockVis = () => {
    const show = scrollY > innerHeight * 0.9 && contacts.getBoundingClientRect().top > innerHeight * 0.6;
    dock.classList.toggle('show', show);
    if (!show) setDock(false);
  };
  addEventListener('scroll', dockVis, { passive: true }); dockVis();

  /* ---------- language ---------- */
  $('#langBtn').onclick = () => {
    const l = lang() === 'ru' ? 'en' : 'ru';
    html.dataset.lang = l; html.lang = l;
    try { localStorage.setItem('yana-lang', l); } catch (e) {}
    $('#nowLab').textContent = secs[active].dataset[l];
    setVisCap(visI, true);
    setWa();
    const k = servI; servI = -1; setServ(k);
    if ($('#lb').classList.contains('on')) lbShow();
    ScrollTrigger.refresh();
  };

  /* ---------- ambient background: floor grid runs towards you, glows drift ---------- */
  const grid = $('#floorGrid'), o1 = $('.o1'), o2 = $('.o2');
  const ambient = () => {
    const y = scrollY, w = innerWidth;
    grid.style.transform = `translate3d(0,${(y * 0.45) % 120}px,0)`;
    o1.style.transform = `translate3d(${Math.sin(y / 1500) * w * 0.35 + w * 0.2}px,${Math.cos(y / 1900) * innerHeight * 0.3 + innerHeight * 0.2}px,0)`;
    o2.style.transform = `translate3d(${Math.cos(y / 1300) * w * -0.3 - w * 0.1}px,${Math.sin(y / 1700) * innerHeight * -0.3}px,0)`;
  };
  addEventListener('scroll', ambient, { passive: true }); ambient();

  /* ---------- 00 hero: camera flies through the enfilade ---------- */
  const world = $('#world'), stage = $('#stage'), door = $('#door'), hFoot = $('#hFoot');
  const END = +door.dataset.z;
  const its = $$('.it', world).map(el => { el.style.setProperty('--z', el.dataset.z); return { el, z: +el.dataset.z, keep: 'keep' in el.dataset }; });
  const hero = (p) => {
    const t = clamp(p / 0.8), cam = END * (0.5 - 0.5 * Math.cos(Math.PI * t));
    world.style.transform = `translate3d(0,0,${cam}px)`;
    its.forEach(o => {
      const d = o.z - cam;
      let op = d < 0 ? 1 + d / 420 : 1;
      if (!o.keep) op *= clamp((1640 - d) / 700);
      op = clamp(op);
      o.el.style.opacity = op;
      o.el.style.visibility = op < 0.004 ? 'hidden' : 'visible';
    });
    const k = clamp((p - 0.52) / 0.3), e = k * k * (3 - 2 * k);
    door.style.setProperty('--ct', 10 * (1 - e) + '%');
    door.style.setProperty('--cb', 10 * (1 - e) + '%');
    door.style.setProperty('--cx', 33 * (1 - e) + '%');
    door.style.setProperty('--cr', 50 * (1 - e) + 'vw');
    hFoot.style.opacity = clamp(1 - p * 14);
  };
  ScrollTrigger.create({ trigger: '#top', start: 'top top', end: 'bottom bottom', onUpdate: s => hero(s.progress), onRefresh: s => hero(s.progress) });
  hero(0);
  if (fine && !reduce) {
    gsap.set(stage, { '--px': 50, '--py': 50 });
    stage.style.perspectiveOrigin = 'calc(var(--px) * 1%) calc(var(--py) * 1%)';
    addEventListener('mousemove', e => gsap.to(stage, { '--px': 50 + (e.clientX / innerWidth - 0.5) * 16, '--py': 50 + (e.clientY / innerHeight - 0.5) * 16, duration: 0.9, ease: 'power3', overwrite: true }));
  }

  /* ---------- generic reveals ---------- */
  $$('[data-split]').forEach(el => {
    const sets = splitWords(el, true);
    sets.forEach(ws => gsap.set(ws, { yPercent: 115 }));
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => sets.forEach(ws => gsap.to(ws, { yPercent: 0, duration: 1.2, stagger: 0.07, ease: 'expo.out' })) });
  });
  gsap.set('[data-rise]', { y: 38, opacity: 0 });
  ScrollTrigger.batch('[data-rise]', { start: 'top 92%', once: true, onEnter: els => gsap.to(els, { y: 0, opacity: 1, duration: 1.1, stagger: 0.09, ease: 'expo.out' }) });
  $$('[data-count]').forEach(el => {
    const o = { v: 0 }, to = +el.dataset.count;
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: to, duration: 2, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v); } }) });
  });

  /* ---------- 01 about: portrait turns in 3D ---------- */
  gsap.fromTo('#aboutTilt', { rotationY: -36, rotationX: 10, z: -160 }, { rotationY: 9, rotationX: -3, z: 0, ease: 'none', scrollTrigger: { trigger: '.about-pic', start: 'top 100%', end: 'bottom 10%', scrub: 0.6 } });

  /* ---------- 02 philosophy: words light up, pictures float in depth ---------- */
  {
    const tl = gsap.timeline({ scrollTrigger: { trigger: '#philosophy', start: 'top top', end: 'bottom bottom', scrub: 0.4 } });
    splitWords($('#phSay')).forEach(ws => tl.to(ws, { opacity: 1, ease: 'none', duration: 0.25, stagger: { amount: 1 } }, 0));
    tl.from('#phPts li', { opacity: 0, y: 46, rotationX: -40, stagger: 0.12, duration: 0.4, ease: 'power2.out' }, 1.2).to({}, { duration: 0.35 });
    $$('.ph-float img').forEach((im, i) => {
      const sp = +im.dataset.sp, dir = i % 2 ? 1 : -1;
      gsap.fromTo(im, { y: 190 * sp, rotationY: 24 * dir, rotationX: 10, z: -120 * sp }, { y: -190 * sp, rotationY: -24 * dir, rotationX: -10, z: 90 * sp, ease: 'none', scrollTrigger: { trigger: '#philosophy', start: 'top bottom', end: 'bottom top', scrub: 0.9 } });
    });
  }

  /* ---------- 03 services: a drum of six services turns with the scroll ---------- */
  const drum = $('#drum'), servItems = $$('#drum > li'), SN = servItems.length, SSTEP = 360 / SN;
  let servI = -1;
  const setServ = (i) => {
    if (i === servI) return;
    servI = i;
    servItems.forEach((li, k) => li.classList.toggle('on', k === i));
    $('#servN').textContent = '0' + (i + 1);
    $('#servDesc').innerHTML = $('p', servItems[i]).innerHTML;
    const im = $('#servPic'), n = new Image();
    im.style.opacity = 0;
    n.onload = () => { if (servI === i) { im.src = n.src; im.style.opacity = 1; } };
    n.src = `assets/img/${servItems[i].dataset.img}-s.webp`;
  };
  const layoutDrum = () => {
    const R = Math.round(drum.offsetHeight / 2 / Math.tan(Math.PI / SN) * 1.3);
    servItems.forEach((li, i) => { li.style.transform = `rotateX(${-i * SSTEP}deg) translateZ(${R}px)`; });
    gsap.set(drum, { z: -R });
  };
  gsap.timeline({ onUpdate: () => setServ(clamp(Math.round(gsap.getProperty(drum, 'rotationX') / SSTEP), 0, SN - 1)),
    scrollTrigger: { trigger: '#services', start: 'top top', end: 'bottom bottom', scrub: 0.6 } })
    .to({}, { duration: 0.3 }).to(drum, { rotationX: (SN - 1) * SSTEP, duration: 5, ease: 'none' }).to({}, { duration: 0.5 });
  setServ(0);

  /* ---------- 04 included: cards stack, the one below tips back ---------- */
  {
    const cards = $$('#stack .card');
    cards.forEach((c, i) => {
      if (i === cards.length - 1) return;
      gsap.to($('.card-in', c), { scale: 0.92, rotationX: -6, ease: 'none', scrollTrigger: { trigger: cards[i + 1], start: 'top 88%', end: 'top 14%', scrub: true } });
    });
  }

  /* ---------- 05 drawings: plan layers explode in axonometry, then face you ---------- */
  {
    const iso = $('#iso'), sheets = $$('.sheet', iso), lis = $$('#layers li');
    const small = () => innerWidth < 860;
    gsap.set(iso, { rotationX: 58, rotationZ: -38, scale: 0.6 });
    gsap.set(sheets, { z: i => i * 5 });
    const hi = (p) => {
      const idx = p > 0.62 ? 0 : clamp(Math.floor(p / 0.5 * 5), 0, 4);
      lis.forEach((l, k) => l.classList.toggle('on', k === idx));
      sheets.forEach((s, k) => s.classList.toggle('hi', 4 - k === idx));
    };
    gsap.timeline({ scrollTrigger: { trigger: '#drawings', start: 'top top', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true, onUpdate: s => hi(s.progress) } })
      .to(sheets, { z: i => i * (small() ? 56 : 96), duration: 1, ease: 'power1.inOut' }, 0)
      .to(iso, { y: () => (small() ? 70 : 120), duration: 1, ease: 'power1.inOut' }, 0)
      .to(iso, { rotationZ: -22, duration: 0.5, ease: 'none' })
      .to(sheets, { z: 0, duration: 1, ease: 'power2.inOut' }, 'flat')
      .to(iso, { rotationX: 0, rotationZ: 0, scale: 1, y: 0, duration: 1, ease: 'power2.inOut' }, 'flat')
      .to(sheets.slice(0, 4), { opacity: 0, duration: 0.4 }, 'flat+=0.45')
      .to({}, { duration: 0.35 });
    hi(0);

    const DWG = $$('#sheetGrid button').map(b => {
      b.innerHTML = `<img src="assets/dwg/${b.dataset.dwg}-s.webp" alt="" loading="lazy"><span>${bi(b.dataset.ru, b.dataset.en)}</span>`;
      return { src: `assets/dwg/${b.dataset.dwg}.webp`, ru: b.dataset.ru, en: b.dataset.en };
    });
    $$('#sheetGrid button').forEach((b, i) => b.onclick = () => lbOpen(DWG, i, { ru: 'Рабочий чертёж', en: 'Working drawing' }, true));
    gsap.from('#sheetGrid button', { opacity: 0, y: 60, rotationX: -35, stagger: 0.07, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '#sheetGrid', start: 'top 85%' } });
  }

  /* ---------- 06 visualisation: renders on a ring that turns with the scroll ---------- */
  const VIS = [
    ['du_living_mural', 'Гостиная · Душанбе', 'Living room · Dushanbe'],
    ['cy_living_tv', 'Гостиная · Кипр', 'Living room · Cyprus'],
    ['du_kitchen_niche', 'Кухня · Душанбе', 'Kitchen · Dushanbe'],
    ['cy_master', 'Мастер-спальня · Кипр', 'Master bedroom · Cyprus'],
    ['du_kids_chairs', 'Детская · Душанбе', 'Child’s room · Dushanbe'],
    ['cy_kitchen', 'Кухня · Кипр', 'Kitchen · Cyprus'],
    ['du_master_bed', 'Мастер-спальня · Душанбе', 'Master bedroom · Dushanbe'],
    ['sp_kitchen', 'Кухня · Санкт-Петербург', 'Kitchen · Saint Petersburg'],
    ['cy_office', 'Кабинет · Кипр', 'Study · Cyprus'],
    ['du_hall_3', 'Прихожая · Душанбе', 'Entrance hall · Dushanbe']
  ];
  const ring = $('#ring'), N = VIS.length, STEP = 360 / N;
  let visI = -1;
  const visItems = VIS.map(v => ({ src: `assets/img/${v[0]}.webp`, ru: v[1], en: v[2] }));
  const panels = VIS.map((v, i) => {
    const d = document.createElement('div');
    d.className = 'panel'; d.dataset.cursor = 'open';
    d.innerHTML = `<img src="assets/img/${v[0]}${innerWidth < 760 ? '-s' : ''}.webp" alt="${v[2]}" loading="lazy">`;
    d.onclick = () => lbOpen(visItems, i, { ru: '3D-визуализация', en: '3D visualisation' });
    ring.append(d);
    return d;
  });
  function setVisCap(i, force) {
    if (i === visI && !force) return;
    visI = i;
    if (i < 0) return;
    $('#visN').textContent = String(i + 1).padStart(2, '0');
    $('#visCap').textContent = VIS[i][lang() === 'ru' ? 1 : 2];
  }
  const layoutRing = () => {
    const R = Math.round(ring.offsetWidth / 2 / Math.tan(Math.PI / N) * 1.1);
    panels.forEach((p, i) => { p.style.transform = `rotateY(${i * STEP}deg) translateZ(${R}px)`; });
    gsap.set(ring, { z: -R });
  };
  gsap.fromTo(ring, { rotationY: 14, rotationX: 4 }, { rotationY: -(N - 1) * STEP - 6, rotationX: -3, ease: 'none', scrollTrigger: { trigger: '#visual', start: 'top top', end: 'bottom bottom', scrub: 0.7 },
    onUpdate: () => setVisCap(clamp(Math.round(-gsap.getProperty(ring, 'rotationY') / STEP), 0, N - 1)) });
  setVisCap(0);

  /* ---------- 07 procurement: cards drift at different depths ---------- */
  $$('#procCards figure').forEach(f => {
    const sp = +f.dataset.sp;
    gsap.fromTo(f, { y: 90 * sp, rotationY: -16, z: -60 * sp }, { y: -90 * sp, rotationY: 12, z: 40 * sp, ease: 'none', scrollTrigger: { trigger: '#procurement', start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
  });

  /* ---------- 08 implementation: the drawing floats over the built room ---------- */
  {
    const st = { trigger: '#implScene', start: 'top bottom', end: 'bottom top', scrub: 0.8 };
    gsap.fromTo('.impl-a', { rotationY: 16, rotationX: 5, y: 50 }, { rotationY: -7, rotationX: -2, y: -40, ease: 'none', scrollTrigger: st });
    gsap.fromTo('.impl-b', { y: 150, rotationZ: -9, rotationY: -28, z: 20 }, { y: -70, rotationZ: 3, rotationY: 14, z: 130, ease: 'none', scrollTrigger: { ...st } });
    gsap.set('#ticks li', { '--s': 0, opacity: 0.35 });
    ScrollTrigger.batch('#ticks li', { start: 'top 86%', once: true, onEnter: els => gsap.to(els, { '--s': 1, opacity: 1, duration: 0.6, stagger: 0.13 }) });
  }

  /* ---------- 09 projects: three faces of a prism ---------- */
  const prism = $('#prism'), faces = $$('.face', prism), tabs = $$('#projTabs button');
  const layoutPrism = () => {
    const ap = Math.round(prism.offsetWidth / 2 / Math.tan(Math.PI / 3));
    faces.forEach((f, i) => { f.style.transform = `rotateY(${i * 120}deg) translateZ(${ap}px)`; });
    gsap.set(prism, { z: -ap });
  };
  {
    const setTab = () => { const i = clamp(Math.round(-gsap.getProperty(prism, 'rotationY') / 120), 0, 2); tabs.forEach((t, k) => t.classList.toggle('on', k === i)); };
    gsap.timeline({ onUpdate: setTab, scrollTrigger: { trigger: '#projects', start: 'top top', end: 'bottom bottom', scrub: 0.7 } })
      .to({}, { duration: 0.4 })
      .to(prism, { rotationY: -120, duration: 1, ease: 'power2.inOut' })
      .to({}, { duration: 0.5 })
      .to(prism, { rotationY: -240, duration: 1, ease: 'power2.inOut' })
      .to({}, { duration: 0.5 });
    setTab();
    const sec = $('#projects');
    tabs.forEach((t, i) => t.onclick = () => go(topOf(sec) + [0.04, 0.5, 0.97][i] * (sec.offsetHeight - innerHeight)));
    faces.forEach(f => f.onclick = () => {
      const P = window.PROJECTS[f.dataset.proj];
      lbOpen(P.items.map(it => ({ src: `assets/img/${it[0]}.webp`, ru: it[1], en: it[2] })), 0, P.title);
    });
  }

  /* ---------- 10 stages: horizontal walk ---------- */
  const stepsSec = $('#stages'), track = $('#track'), steps = $$('.step', track);
  const layoutSteps = () => { stepsSec.style.height = innerHeight + Math.max(0, track.scrollWidth - innerWidth) + 'px'; };
  gsap.to(track, { x: () => -Math.max(0, track.scrollWidth - innerWidth), ease: 'none', scrollTrigger: { trigger: stepsSec, start: 'top top', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true,
    onUpdate: s => {
      $('#trackLine').style.transform = `scaleX(${s.progress})`;
      steps.forEach(el => el.classList.toggle('on', el.getBoundingClientRect().left < innerWidth * 0.62));
    } } });
  // per-step 3D turn-in, driven by each card's own position on screen
  const stepTurn = () => steps.forEach(el => {
    const k = clamp((innerWidth * 1.02 - el.getBoundingClientRect().left) / (innerWidth * 0.45));
    gsap.set(el, { rotationY: 42 * (1 - k), z: -220 * (1 - k), opacity: 0.15 + 0.85 * k, transformOrigin: '0% 50%' });
  });

  /* ---------- 11 timing ---------- */
  gsap.to('#dialP', { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '#timeBig', start: 'top 85%', end: 'center 45%', scrub: 0.6 } });
  gsap.from('.time-n', { scale: 0.55, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#timeBig', start: 'top 85%', end: 'center 55%', scrub: 0.6 } });
  gsap.fromTo('.dial', { rotation: -90 }, { rotation: 90, ease: 'none', scrollTrigger: { trigger: '#timeBig', start: 'top bottom', end: 'bottom top', scrub: 0.8 } });

  /* ---------- coda + contacts ---------- */
  splitWords($('#codaQ')).forEach(ws => gsap.to(ws, { opacity: 1, ease: 'none', stagger: { amount: 1 }, duration: 0.2, scrollTrigger: { trigger: '#codaQ', start: 'top 82%', end: 'bottom 48%', scrub: 0.4 } }));
  {
    const n = $('#contName');
    n.innerHTML = [...n.textContent].map(c => `<span>${c}</span>`).join('');
    gsap.from($$('span', n), { rotationX: -95, yPercent: 50, opacity: 0, duration: 1.4, stagger: 0.07, ease: 'expo.out', scrollTrigger: { trigger: n, start: 'top 88%' } });
  }

  /* ---------- lightbox ---------- */
  const lb = $('#lb'), lbImg = $('#lbImg');
  let lbList = [], lbI = 0, lbTitle = null;
  function lbShow() {
    const it = lbList[lbI];
    lbImg.classList.add('sw');
    const im = new Image();
    im.onload = im.onerror = () => { lbImg.src = it.src; lbImg.classList.remove('sw'); };
    im.src = it.src;
    $('#lbT').textContent = lbTitle[lang()];
    $('#lbC').textContent = it[lang()];
    $('#lbN').textContent = `${lbI + 1} / ${lbList.length}`;
  }
  function lbOpen(list, i, title, dwg) {
    lbList = list; lbI = i; lbTitle = title;
    lb.classList.toggle('dwg', !!dwg);
    lb.classList.add('on'); lb.setAttribute('aria-hidden', 'false');
    lock(true); lbShow();
  }
  const lbClose = () => { lb.classList.remove('on'); lb.setAttribute('aria-hidden', 'true'); lock(false); };
  const lbStep = (d) => { lbI = (lbI + d + lbList.length) % lbList.length; lbShow(); };
  $('#lbX').onclick = lbClose; $('#lbP').onclick = () => lbStep(-1); $('#lbNx').onclick = () => lbStep(1);
  lb.onclick = (e) => { if (e.target === lb) lbClose(); };
  let tx = 0;
  lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) lbStep(d < 0 ? 1 : -1); });
  addEventListener('keydown', e => {
    if (lb.classList.contains('on')) {
      if (e.key === 'Escape') lbClose(); else if (e.key === 'ArrowRight') lbStep(1); else if (e.key === 'ArrowLeft') lbStep(-1);
    } else if (e.key === 'Escape') setMenu(false);
  });

  /* ---------- cursor ---------- */
  if (fine) {
    const cur = $('#cursor'), ct = $('#cursorT');
    const cx = gsap.quickTo(cur, 'x', { duration: 0.25, ease: 'power3' }), cy = gsap.quickTo(cur, 'y', { duration: 0.25, ease: 'power3' });
    addEventListener('mousemove', e => { cx(e.clientX); cy(e.clientY); });
    addEventListener('mouseover', e => {
      const big = e.target.closest('[data-cursor]');
      const v = big && big.dataset.cursor;
      ct.textContent = v === 'open' ? (lang() === 'ru' ? 'Открыть' : 'Open') : v || '';
      cur.classList.toggle('big', !!big);
      cur.classList.toggle('link', !big && !!e.target.closest('a, button, .rows li'));
    });
  }

  /* ---------- layout + refresh ---------- */
  // keep the gap between YANA and CH. on the screen centre, where the far doorway sits
  const layoutTitle = () => { const [a, b] = $$('.h-title .ht'); $('.h-title').style.setProperty('--x', (b.offsetWidth - a.offsetWidth) / 2 + 'px'); };
  const layout = () => { layoutRing(); layoutPrism(); layoutSteps(); layoutTitle(); layoutDrum(); };
  ScrollTrigger.addEventListener('refreshInit', layout);
  ScrollTrigger.addEventListener('refresh', stepTurn);
  addEventListener('scroll', stepTurn, { passive: true });
  layout();
  let rt;
  const soon = () => { clearTimeout(rt); rt = setTimeout(() => ScrollTrigger.refresh(), 200); };
  document.addEventListener('load', e => { if (e.target.tagName === 'IMG') soon(); }, true);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(soon);
  addEventListener('load', soon);

  /* ---------- loader + intro ---------- */
  {
    const loader = $('#loader'), n = $('#loaderN'), arch = $('.loader-arch path'), o = { v: 0 };
    gsap.set('.ht b', { yPercent: 115 });
    gsap.set('#hFoot p', { opacity: 0, y: 14 });
    const ready = new Promise(r => { const im = $('#door img'); if (im.complete) r(); else { im.onload = im.onerror = r; setTimeout(r, 3500); } });
    try { history.scrollRestoration = 'manual'; } catch (e) {}
    lock(true); scrollTo(0, 0);
    gsap.to(o, { v: 100, duration: reduce ? 0.2 : 1.5, ease: 'power2.inOut',
      onUpdate: () => { n.textContent = Math.round(o.v); arch.style.setProperty('--o', 1 - o.v / 100); },
      onComplete: () => ready.then(() => {
        loader.classList.add('done'); lock(false);
        gsap.to('.ht b', { yPercent: 0, duration: 1.5, stagger: 0.14, ease: 'expo.out', delay: 0.15 });
        gsap.to('#hFoot p', { opacity: 1, y: 0, duration: 1, stagger: 0.1, delay: 0.7 });
      }) });
  }
})();

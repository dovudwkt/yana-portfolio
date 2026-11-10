/* YANA CH. — site behaviour. Vanilla JS, no dependencies. */
(function () {
  'use strict';

  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var smooth = function (a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lang = function () { return root.getAttribute('data-lang') || 'ru'; };

  /* ---------------- language ---------------- */
  var META = {
    ru: {
      title: 'YANA CH. — Private Interior Architect',
      desc: 'Яна Ч. — дизайнер интерьера и архитектор. Дизайн-проекты, рабочие чертежи, 3D-визуализация, комплектация и сопровождение реализации. Душанбе и международные проекты.'
    },
    en: {
      title: 'YANA CH. — Private Interior Architect',
      desc: 'Yana Ch. — interior designer and architect. Design projects, working drawings, 3D visualisation, procurement and site supervision. Dushanbe and international projects.'
    }
  };
  function setLang(l, save) {
    root.setAttribute('data-lang', l);
    root.setAttribute('lang', l);
    $$('[data-set-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === l)); });
    document.title = META[l].title;
    var d = $('meta[name="description"]'); if (d) d.setAttribute('content', META[l].desc);
    if (save) { try { localStorage.setItem('yana-lang', l); } catch (e) {} }
    updateWhere(true);
    if (lb.open) lb.render();
  }
  $$('[data-set-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-set-lang'), true); });
  });

  /* ---------------- menu ---------------- */
  var menuBtn = $('.top__menu'), menu = $('#menu');
  function toggleMenu(open) {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  }
  menuBtn.addEventListener('click', function () { toggleMenu(menu.hidden); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { toggleMenu(false); }); });

  /* ---------------- header: solid / dark / current section ---------------- */
  var top = $('#top-bar'), sections = $$('main > section'), whereNum = $('.top__num'), whereSec = $('.top__sec');
  var current = null;
  function updateWhere(force) {
    var y = 70, found = sections[0];
    for (var i = 0; i < sections.length; i++) {
      var r = sections[i].getBoundingClientRect();
      if (r.top <= y && r.bottom > y) { found = sections[i]; break; }
    }
    if (found !== current || force) {
      current = found;
      var dark = found.hasAttribute('data-dark') && !(found.classList.contains('hero') && !found.classList.contains('is-night'));
      top.classList.toggle('on-dark', dark);
      whereNum.textContent = found.getAttribute('data-num') || '';
      whereSec.textContent = found.getAttribute('data-label-' + lang()) || '';
    }
    top.classList.toggle('is-solid', window.scrollY > 40 && !found.classList.contains('hero'));
  }

  /* ---------------- hero: line → light → night ---------------- */
  var hero = $('.hero'), heroTrack = $('.hero__track'), heroStages = $$('.hero__stages li');
  function updateHero() {
    if (reduced) { hero.style.setProperty('--wipe', 1); return; }
    var r = heroTrack.getBoundingClientRect();
    var span = r.height - window.innerHeight;
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    var p = clamp(-r.top / span, 0, 1);
    var wipe = smooth(0.04, 0.32, p), open = smooth(0.30, 0.56, p), night = smooth(0.64, 0.9, p);
    hero.style.setProperty('--p', p.toFixed(4));
    hero.style.setProperty('--wipe', wipe.toFixed(4));
    hero.style.setProperty('--e', open.toFixed(4));
    hero.style.setProperty('--night', night.toFixed(4));
    var stage = night > 0.5 ? 2 : (wipe > 0.5 ? 1 : 0);
    heroStages.forEach(function (li, i) { li.classList.toggle('is-on', i === stage); });
    var wasNight = hero.classList.contains('is-night');
    hero.classList.toggle('is-night', night > 0.5);
    if (wasNight !== night > 0.5) updateWhere(true);
  }

  /* ---------------- cinematic chapters ---------------- */
  var chapters = $('[data-chapters]'), chapterEls = chapters ? $$('.chapter', chapters) : [], chapterI = $('.chapters__i'), chapterBar = $('.chapters__bar');
  var activeChapter = 0;
  function updateChapters() {
    if (!chapters || reduced) return;
    var r = chapters.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    var p = clamp(-r.top / (r.height - window.innerHeight), 0, 0.9999);
    var i = Math.floor(p * chapterEls.length);
    chapterBar.style.setProperty('--cp', p.toFixed(4));
    if (i !== activeChapter) {
      chapterEls[activeChapter].classList.remove('is-on');
      chapterEls[i].classList.add('is-on');
      activeChapter = i;
      chapterI.textContent = ('0' + (i + 1)).slice(-2);
    }
  }
  // Warm the chapter images early so the crossfades never show a blank frame.
  if (chapters && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es, o) {
      if (es[0].isIntersecting) { chapterEls.forEach(function (c) { var im = $('img', c); im.loading = 'eager'; }); o.disconnect(); }
    }, { rootMargin: '800px 0px' }).observe(chapters);
  }

  /* ---------------- stages progress line ---------------- */
  var steps = $('[data-steps]'), stepEls = steps ? $$('.step', steps) : [];
  function updateSteps() {
    if (!steps) return;
    var r = steps.getBoundingClientRect(), vh = window.innerHeight;
    var p = clamp((vh * 0.75 - r.top) / (r.height + vh * 0.25), 0, 1);
    steps.style.setProperty('--sp', p.toFixed(3));
    stepEls.forEach(function (s, i) { s.classList.toggle('is-reached', p >= (i + 0.5) / stepEls.length || s.getBoundingClientRect().top < vh * 0.6); });
  }

  /* ---------------- one scroll loop ---------------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      updateHero(); updateChapters(); updateSteps(); updateWhere(false);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------------- reveal + counters ---------------- */
  function countUp(el) {
    var to = +el.getAttribute('data-count'), t0 = null;
    if (reduced) return;
    function step(t) {
      if (!t0) t0 = t;
      var k = clamp((t - t0) / 1400, 0, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        $$('[data-count]', e.target).forEach(countUp);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('.rv').forEach(function (el) { io.observe(el); });
  } else {
    $$('.rv').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------- services: hover preview ---------------- */
  var preview = $('.services__frame img');
  if (preview) {
    $$('.toc__row').forEach(function (row) {
      var show = function () {
        $$('.toc__row.is-on').forEach(function (r) { r.classList.remove('is-on'); });
        row.classList.add('is-on');
        var src = row.getAttribute('data-preview');
        if (preview.getAttribute('src') === src) return;
        preview.classList.add('is-fading');
        var im = new Image();
        im.onload = function () {
          preview.src = src;
          preview.classList.toggle('is-dwg', src.indexOf('/dwg/') > -1);
          preview.classList.remove('is-fading');
        };
        im.src = src;
      };
      row.addEventListener('mouseenter', show);
      row.addEventListener('focus', show);
    });
    preview.classList.add('is-dwg');
  }

  /* ---------------- drawings filter ---------------- */
  $$('.filters button').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-filter');
      $$('.filters button').forEach(function (x) { x.classList.toggle('is-on', x === b); });
      $$('.sht').forEach(function (s) {
        s.classList.toggle('is-hidden', f !== 'all' && s.getAttribute('data-cat') !== f);
        s.classList.add('is-in');
      });
    });
  });

  /* ---------------- line ⇄ 3D compare ---------------- */
  $$('.compare').forEach(function (c) {
    var r = $('.compare__range', c);
    var set = function () { c.style.setProperty('--pos', r.value + '%'); };
    r.addEventListener('input', set);
    set();
    // gentle hint: sweep once when it first comes into view
    if ('IntersectionObserver' in window && !reduced) {
      new IntersectionObserver(function (es, o) {
        if (!es[0].isIntersecting) return;
        o.disconnect();
        var t0 = null;
        (function sweep(t) {
          if (!t0) t0 = t;
          var k = clamp((t - t0) / 2200, 0, 1);
          r.value = 50 + Math.sin(k * Math.PI * 2) * 32;
          set();
          if (k < 1) requestAnimationFrame(sweep);
        })(performance.now());
      }, { threshold: 0.6 }).observe(c);
    }
  });

  /* ---------------- day ⇄ night ---------------- */
  $$('.daynight').forEach(function (d) {
    $$('[data-dn]', d).forEach(function (b) {
      b.addEventListener('click', function () {
        var m = b.getAttribute('data-dn');
        d.setAttribute('data-mode', m);
        $$('[data-dn]', d).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      });
    });
  });

  /* ---------------- procurement: render ⇄ schedule ---------------- */
  var spec = $('.spec');
  if (spec) {
    var mark = function (id, on) {
      $$('[data-item]', spec).forEach(function (el) { el.classList.toggle('is-on', on && el.getAttribute('data-item') === id); });
    };
    $$('[data-item]', spec).forEach(function (el) {
      var id = el.getAttribute('data-item');
      el.addEventListener('mouseenter', function () { mark(id, true); });
      el.addEventListener('mouseleave', function () { mark(id, false); });
      el.addEventListener('focus', function () { mark(id, true); });
      el.addEventListener('blur', function () { mark(id, false); });
    });
    $$('.hot', spec).forEach(function (h) {
      h.addEventListener('click', function () {
        var id = h.getAttribute('data-item');
        mark(id, true);
        var row = $('.item[data-item="' + id + '"]', spec);
        if (row && window.innerWidth < 900) row.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      });
    });
  }

  /* ---------------- lightbox ---------------- */
  var lbEl = $('#lb'), view = $('.lb__view', lbEl);
  var lb = {
    open: false, items: [], i: 0, title: null, lastFocus: null,
    img: document.createElement('img'),
    show: function (items, i, title) {
      this.items = items; this.i = i || 0; this.title = title || null;
      this.lastFocus = document.activeElement;
      lbEl.hidden = false; this.open = true;
      lbEl.classList.toggle('is-single', items.length < 2);
      document.body.classList.add('lb-open');
      this.render();
      $('.lb__close', lbEl).focus();
    },
    render: function () {
      var it = this.items[this.i], l = lang(), im = this.img;
      lbEl.classList.remove('is-zoom');
      lbEl.classList.toggle('has-zoom', !!it.zoom);
      im.classList.toggle('is-dwg', !!it.zoom);
      if (im.getAttribute('src') !== it.src) {
        im.classList.add('is-loading');
        im.onload = function () { im.classList.remove('is-loading'); };
        im.src = it.src;
      }
      im.alt = it[l] || '';
      $('.lb__cap', lbEl).textContent = it[l] || '';
      $('.lb__title', lbEl).textContent = this.title ? this.title[l] : '';
      $('.lb__count', lbEl).textContent = (this.i + 1) + ' / ' + this.items.length;
      // preload neighbours
      [this.i + 1, this.i - 1].forEach(function (k) {
        var n = lb.items[(k + lb.items.length) % lb.items.length]; if (n) { var p = new Image(); p.src = n.src; }
      });
    },
    go: function (d) { this.i = (this.i + d + this.items.length) % this.items.length; this.render(); },
    close: function () {
      lbEl.hidden = true; this.open = false;
      document.body.classList.remove('lb-open');
      if (this.lastFocus) this.lastFocus.focus();
    }
  };
  lb.img.className = 'lb__img';
  lb.img.alt = '';
  view.appendChild(lb.img);

  function fromFigure(f) {
    return { src: f.getAttribute('data-lb-src'), ru: f.getAttribute('data-cap-ru'), en: f.getAttribute('data-cap-en'), zoom: f.hasAttribute('data-lb-zoom') };
  }
  $$('[data-lb-group]').forEach(function (f) {
    f.setAttribute('tabindex', '0');
    f.setAttribute('role', 'button');
    var open = function () {
      var g = f.getAttribute('data-lb-group');
      var group = $$('[data-lb-group="' + g + '"]').filter(function (x) { return !x.classList.contains('is-hidden'); });
      lb.show(group.map(fromFigure), group.indexOf(f));
    };
    f.addEventListener('click', open);
    f.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
  $$('[data-project]').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = window.PROJECTS && window.PROJECTS[b.getAttribute('data-project')];
      if (!p) return;
      lb.show(p.items.map(function (x) { return { src: 'assets/img/' + x[0] + '.webp', ru: x[1], en: x[2] }; }), 0, p.title);
    });
  });
  $('.lb__close', lbEl).addEventListener('click', function () { lb.close(); });
  $('.lb__prev', lbEl).addEventListener('click', function () { lb.go(-1); });
  $('.lb__next', lbEl).addEventListener('click', function () { lb.go(1); });
  lb.img.addEventListener('click', function (e) {
    if (!lb.items[lb.i].zoom) return;
    var zoomed = lbEl.classList.toggle('is-zoom');
    if (zoomed) {
      // keep the clicked point under the cursor
      var r = lb.img.getBoundingClientRect();
      var fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
      requestAnimationFrame(function () {
        view.scrollLeft = fx * lb.img.offsetWidth - view.clientWidth / 2;
        view.scrollTop = fy * lb.img.offsetHeight - view.clientHeight / 2;
      });
    }
  });
  lbEl.addEventListener('click', function (e) { if (e.target === view && !lbEl.classList.contains('is-zoom')) lb.close(); });
  document.addEventListener('keydown', function (e) {
    if (lb.open) {
      if (e.key === 'Escape') lb.close();
      else if (e.key === 'ArrowRight') lb.go(1);
      else if (e.key === 'ArrowLeft') lb.go(-1);
    } else if (e.key === 'Escape' && !menu.hidden) toggleMenu(false);
  });
  // drag to pan when zoomed (mouse); touch uses native scrolling
  (function () {
    var drag = null;
    view.addEventListener('pointerdown', function (e) {
      if (!lbEl.classList.contains('is-zoom') || e.pointerType !== 'mouse') return;
      drag = { x: e.clientX, y: e.clientY, l: view.scrollLeft, t: view.scrollTop, moved: false };
    });
    window.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
      view.scrollLeft = drag.l - dx; view.scrollTop = drag.t - dy;
    });
    window.addEventListener('pointerup', function () {
      if (drag && drag.moved) { lb.img.addEventListener('click', stop, { capture: true, once: true }); }
      drag = null;
    });
    function stop(e) { e.stopImmediatePropagation(); }
  })();
  // swipe between images
  (function () {
    var sx = null, sy = null;
    view.addEventListener('touchstart', function (e) { if (lbEl.classList.contains('is-zoom')) return; sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    view.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) lb.go(dx < 0 ? 1 : -1);
      sx = null;
    });
  })();

  /* ---------------- init ---------------- */
  setLang(lang(), false);
  onScroll();
})();

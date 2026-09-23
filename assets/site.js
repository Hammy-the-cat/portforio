const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- fireflies — ページ全体をゆっくり舞う光 ---------- */
(() => {
  const box = document.getElementById('fireflies');
  if (reduceMotion || !box) return;
  const n = 12;
  for (let i = 0; i < n; i++) {
    const f = document.createElement('div');
    f.className = 'fly';
    const size = Math.random() * 2.4 + 1.8;            // 1.8〜4.2px
    f.style.width = f.style.height = size.toFixed(1) + 'px';
    f.style.left = (Math.random() * 96 + 2) + '%';
    f.style.setProperty('--d', (Math.random() * 16 + 20).toFixed(1) + 's');   // 上昇 20〜36s
    f.style.setProperty('--s', (Math.random() * 4 + 3.5).toFixed(1) + 's');   // 揺れ
    f.style.setProperty('--o', (Math.random() * .3 + .35).toFixed(2));        // 明るさ
    f.style.setProperty('--delay', (-Math.random() * 30).toFixed(1) + 's');   // 途中から開始
    box.appendChild(f);
  }
})();

/* ---------- starry sky ---------- */
(() => {
  const sky = document.getElementById('sky');
  if (!sky) return;
  const n = 70;
  for (let i = 0; i < n; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2 + 1;
    s.style.width = s.style.height = size + 'px';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.setProperty('--tw', (Math.random() * 4 + 2.5) + 's');
    s.style.animationDelay = (Math.random() * 5) + 's';
    sky.appendChild(s);
  }
})();

/* ---------- cat eyes follow the cursor ---------- */
(() => {
  if (reduceMotion) return;
  const pupils = document.querySelectorAll('.cat .pupil');
  const stage = document.querySelector('.moon-stage');
  if (!stage) return;
  window.addEventListener('mousemove', (e) => {
    const r = stage.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth / 2)));
    const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2)));
    pupils.forEach(p => { p.style.transform = `translate(${dx * 3.2}px, ${dy * 2.4}px)`; });
  }, { passive: true });
})();

/* ---------- auto-fit text: 幅に収まるまで縮小、無理なら折り返しに戻す ---------- */
(() => {
  const els = document.querySelectorAll('[data-fit]');
  if (!els.length) return;
  const fit = () => {
    els.forEach(el => {
      el.style.fontSize = '';
      el.classList.remove('fit-wrap');
      const min = parseFloat(el.dataset.fit) || 12;
      let size = parseFloat(getComputedStyle(el).fontSize);
      let guard = 60;
      while (el.scrollWidth > el.clientWidth + 1 && size - 0.5 >= min && guard--) {
        size -= 0.5;
        el.style.fontSize = size + 'px';
      }
      // 最小サイズでも収まらない場合は通常の折り返しへ
      if (el.scrollWidth > el.clientWidth + 1) {
        el.style.fontSize = '';
        el.classList.add('fit-wrap');
      }
    });
  };
  window.addEventListener('resize', fit);
  document.addEventListener('langchange', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  fit();
})();

/* ---------- horizontal scroll showcase (PCのみ) ---------- */
(() => {
  const wrap = document.getElementById('appsHscroll');
  if (!wrap) return;
  const track = wrap.querySelector('.hscroll-track');
  const slides = [...wrap.querySelectorAll('.hslide')];
  const dotBox = wrap.querySelector('.hscroll-dots');
  dotBox.innerHTML = slides.map((_, i) => `<span class="hdot${i ? '' : ' on'}"></span>`).join('');
  const dots = [...dotBox.children];
  const mq = window.matchMedia('(min-width: 981px) and (min-height: 640px)');
  const SCROLL_PER_SLIDE = 1.8;   // 1スライドの横移動に要する縦スクロール量（画面幅比）
  const HOLD = 0.22;              // 各スライドで静止する区間の割合（前後それぞれ）
  const EASE = 0.11;              // 追従の慣性（小さいほど滑らか・遅れ大）
  let active = false, travel = 0, target = 0, current = 0, raf = 0;
  const n = dots.length;

  const smooth = t => t * t * (3 - 2 * t);
  const slidePos = p => {                 // 進捗0〜1 → スライド位置0〜n-1（静止区間つき）
    const u = p * (n - 1);
    const i = Math.min(n - 2, Math.floor(u));
    const f = Math.min(1, Math.max(0, ((u - i) - HOLD) / (1 - 2 * HOLD)));
    return i + smooth(f);
  };
  const render = () => {
    current += (target - current) * EASE;
    if (Math.abs(target - current) < 0.3) current = target;
    track.style.transform = `translate3d(${-current}px,0,0)`;
    const idx = Math.round(current / (travel / (n - 1)));
    dots.forEach((d, i) => d.classList.toggle('on', i === idx));
    raf = current === target ? 0 : requestAnimationFrame(render);
  };
  const onScroll = () => {
    if (!active) return;
    const total = wrap.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    const p = Math.min(1, Math.max(0, -wrap.getBoundingClientRect().top / total));
    target = slidePos(p) * (travel / (n - 1));
    if (!raf) raf = requestAnimationFrame(render);
  };
  const layout = () => {
    const off = () => {
      active = false;
      wrap.classList.remove('active');
      wrap.style.height = '';
      track.style.transform = '';
    };
    if (reduceMotion || !mq.matches) return off();
    wrap.classList.add('active');
    // 画面の高さに収まらないスライドがあれば、切れないよう縦積み表示に戻す
    if (slides.some(s => s.firstElementChild.scrollHeight > window.innerHeight - 24)) return off();
    active = true;
    travel = track.scrollWidth - window.innerWidth;
    wrap.style.height = (window.innerHeight + travel * SCROLL_PER_SLIDE) + 'px';
    // スライド内はビューポート交差が遅れるため即時表示にする
    wrap.querySelectorAll('.fade-in').forEach(el => el.classList.add('show'));
    onScroll();
  };
  // #slide-id で来たら、横スライド中はその位置まで縦スクロールする
  const jumpToHash = () => {
    const i = slides.findIndex(s => '#' + s.id === location.hash);
    if (i < 0 || !active) return;
    const docTop = window.scrollY + wrap.getBoundingClientRect().top;
    const total = wrap.offsetHeight - window.innerHeight;
    // smooth指定だとブラウザのアンカースクロールと競合するため instant で上書きする
    window.scrollTo({ top: docTop + total * (i / (n - 1)), behavior: 'instant' });
    current = target = i * (travel / (n - 1));
    track.style.transform = `translate3d(${-current}px,0,0)`;
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', layout);
  window.addEventListener('hashchange', jumpToHash);
  mq.addEventListener ? mq.addEventListener('change', layout) : mq.addListener(layout);
  const init = () => { layout(); if (location.hash) jumpToHash(); };
  init();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(init);
  window.addEventListener('load', init);
})();

/* ---------- language toggle (JA <-> EN) ---------- */
(() => {
  const btn = document.getElementById('langToggle');
  const els = document.querySelectorAll('[data-en]');
  els.forEach(el => { el.dataset.ja = el.innerHTML; });
  const apply = (lang) => {
    els.forEach(el => { el.innerHTML = lang === 'en' ? el.dataset.en : el.dataset.ja; });
    document.documentElement.lang = lang;
    btn.textContent = lang === 'en' ? '日本語' : 'EN';
    try { localStorage.setItem('lang', lang); } catch (e) {}
    document.dispatchEvent(new CustomEvent('langchange'));
  };
  let lang = 'ja';
  try { lang = localStorage.getItem('lang') || 'ja'; } catch (e) {}
  btn.addEventListener('click', () => { lang = (lang === 'en') ? 'ja' : 'en'; apply(lang); });
  if (lang === 'en') apply('en');
})();

/* ---------- scroll reveal ---------- */
(() => {
  const els = document.querySelectorAll('.fade-in');
  if (reduceMotion) { els.forEach(el => el.classList.add('show')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('show'); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
  // hero plays immediately
  document.querySelectorAll('.hero .fade-in').forEach((el, i) => {
    setTimeout(() => el.classList.add('show'), 250 + i * 180);
  });
})();


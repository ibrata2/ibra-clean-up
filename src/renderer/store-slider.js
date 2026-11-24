/* IBRA STORE Slider — سلايد شو آخر البرامج والألعاب من موقع IBRA STORE
 * كود مستقل بالكامل بدون مكتبات. يرث الخط واللون والخلفية من التطبيق.
 * اللون الأساسي: من متغير CSS ‎--ibra-accent‎ وإذا ما موجود يستخدم الثابت ACCENT.
 * الاستخدام: IbraStoreSlider.mount(document.getElementById('storeSlider'), { label: 'عرض البرنامج ←' })
 * إذا فشل الجلب يختفي المربع بهدوء.
 */
(function () {
  'use strict';
  var ACCENT = '#e0283c';               // ← غيّره إذا تريد لون ثابت
  var API = 'https://ibraprogram.netlify.app/api/apps';
  var APP_URL = 'https://ibraprogram.netlify.app/app/';
  var INTERVAL = 4000, LIMIT = 10;

  var CSS = '' +
    '.iss{position:relative;border-radius:16px;overflow:hidden;font-family:inherit;color:inherit;background:inherit;height:230px;border:1px solid color-mix(in srgb,currentColor 12%,transparent);isolation:isolate}' +
    '.iss-track{position:absolute;inset:0}' +
    '.iss-slide{position:absolute;inset:0;opacity:0;transition:opacity .6s ease;pointer-events:none;display:flex;align-items:flex-end}' +
    '.iss-slide.on{opacity:1;pointer-events:auto}' +
    '.iss-bg{position:absolute;inset:0;background-size:cover;background-position:center;transform:scale(1.04);transition:transform 4.5s ease}' +
    '.iss-slide.on .iss-bg{transform:scale(1)}' +
    '.iss-bg.blur{filter:blur(18px) saturate(1.3);transform:scale(1.25)}' +
    '.iss-shade{position:absolute;inset:0;background:linear-gradient(0deg,rgba(0,0,0,.82) 0%,rgba(0,0,0,.45) 45%,rgba(0,0,0,.1) 100%)}' +
    '.iss-body{position:relative;display:flex;gap:16px;align-items:center;padding:20px 24px;width:100%;color:#fff}' +
    '.iss-ico{width:68px;height:68px;border-radius:16px;object-fit:cover;flex-shrink:0;box-shadow:0 6px 20px rgba(0,0,0,.45);background:rgba(255,255,255,.08)}' +
    '.iss-txt{flex:1;min-width:0}' +
    '.iss-cat{display:inline-block;font-size:11.5px;font-weight:700;padding:2px 10px;border-radius:20px;background:var(--iss-accent);color:#fff;margin-bottom:6px}' +
    '.iss-name{font-size:21px;font-weight:800;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.iss-tag{font-size:13px;opacity:.85;margin-top:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}' +
    '.iss-btn{flex-shrink:0;font-family:inherit;font-size:13.5px;font-weight:700;border:none;border-radius:11px;padding:10px 18px;cursor:pointer;background:var(--iss-accent);color:#fff;box-shadow:0 6px 18px color-mix(in srgb,var(--iss-accent) 45%,transparent);transition:filter .15s}' +
    '.iss-btn:hover{filter:brightness(1.12)}' +
    '.iss-arrow{position:absolute;top:50%;transform:translateY(-50%);width:36px;height:36px;border-radius:50%;border:none;cursor:pointer;background:rgba(0,0,0,.4);color:#fff;font-size:18px;display:grid;place-items:center;opacity:0;transition:opacity .2s;z-index:2;font-family:inherit}' +
    '.iss:hover .iss-arrow{opacity:1}.iss-arrow:hover{background:var(--iss-accent)}' +
    '.iss-prev{inset-inline-start:10px}.iss-next{inset-inline-end:10px}' +
    '.iss-dots{position:absolute;top:12px;inset-inline-end:14px;display:flex;gap:6px;z-index:2}' +
    '.iss-dot{width:8px;height:8px;border-radius:8px;border:none;padding:0;cursor:pointer;background:rgba(255,255,255,.45);transition:all .25s}' +
    '.iss-dot.on{width:22px;background:var(--iss-accent)}' +
    '.iss-brand{position:absolute;top:12px;inset-inline-start:14px;z-index:2;font-size:11.5px;font-weight:800;letter-spacing:.5px;color:#fff;background:rgba(0,0,0,.35);padding:3px 10px;border-radius:20px}';

  function injectCSS() {
    if (document.getElementById('iss-style')) return;
    var st = document.createElement('style'); st.id = 'iss-style'; st.textContent = CSS; document.head.appendChild(st);
  }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function safeUrl(u) { return typeof u === 'string' && /^https?:\/\//i.test(u) ? u : ''; }

  function mount(host, opts) {
    if (!host) return;
    opts = opts || {};
    host.style.display = 'none';
    var accent = (getComputedStyle(host).getPropertyValue('--ibra-accent') || '').trim() || ACCENT;
    injectCSS();
    var ctrl = new AbortController();
    var timeout = setTimeout(function () { ctrl.abort(); }, 10000);
    fetch(API, { signal: ctrl.signal, headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        clearTimeout(timeout);
        var list = Array.isArray(data) ? data : (data && (data.apps || data.items || data.data)) || [];
        list = list.filter(function (a) { return a && a.name && a.slug; })
          .sort(function (a, b) { return (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0); })
          .slice(0, opts.limit || LIMIT);
        if (!list.length) return;
        build(host, list, accent, opts);
      })
      .catch(function () { clearTimeout(timeout); host.style.display = 'none'; });
  }

  function build(host, list, accent, opts) {
    host.innerHTML = '';
    var root = el('div', 'iss'); root.style.setProperty('--iss-accent', accent);
    var track = el('div', 'iss-track'); root.appendChild(track);
    var dots = el('div', 'iss-dots');
    var slides = [], idx = 0, timer = null, paused = false;
    list.forEach(function (a, i) {
      var s = el('div', 'iss-slide' + (i === 0 ? ' on' : ''));
      var shot = safeUrl(a.screenshots && a.screenshots[0]); var icon = safeUrl(a.icon);
      var bg = el('div', 'iss-bg' + (shot ? '' : ' blur'));
      if (shot || icon) bg.style.backgroundImage = 'url("' + (shot || icon).replace(/"/g, '%22') + '")';
      s.appendChild(bg); s.appendChild(el('div', 'iss-shade'));
      var body = el('div', 'iss-body');
      if (icon) { var im = el('img', 'iss-ico'); im.src = icon; im.alt = ''; im.onerror = function () { im.remove(); }; body.appendChild(im); }
      var tx = el('div', 'iss-txt');
      if (a.categories && a.categories[0]) tx.appendChild(el('span', 'iss-cat', a.categories[0]));
      var nm = el('div', 'iss-name', a.name); nm.dir = 'auto'; tx.appendChild(nm);
      if (a.tagline) { var tg = el('div', 'iss-tag', a.tagline); tg.dir = 'auto'; tx.appendChild(tg); }
      body.appendChild(tx);
      var btn = el('button', 'iss-btn', opts.label || 'عرض البرنامج ←');
      btn.addEventListener('click', function () { window.open(APP_URL + encodeURIComponent(a.slug), '_blank'); });
      body.appendChild(btn); s.appendChild(body);
      track.appendChild(s); slides.push(s);
      var d = el('button', 'iss-dot' + (i === 0 ? ' on' : '')); d.setAttribute('aria-label', a.name);
      d.addEventListener('click', function () { go(i); restart(); });
      dots.appendChild(d);
    });
    function go(n) {
      slides[idx].classList.remove('on'); dots.children[idx].classList.remove('on');
      idx = (n + slides.length) % slides.length;
      slides[idx].classList.add('on'); dots.children[idx].classList.add('on');
    }
    function restart() { clearInterval(timer); if (slides.length > 1) timer = setInterval(function () { if (!paused) go(idx + 1); }, INTERVAL); }
    if (slides.length > 1) {
      var rtl = getComputedStyle(host).direction === 'rtl';
      var prev = el('button', 'iss-arrow iss-prev', rtl ? '›' : '‹'); var next = el('button', 'iss-arrow iss-next', rtl ? '‹' : '›');
      prev.addEventListener('click', function () { go(idx - 1); restart(); });
      next.addEventListener('click', function () { go(idx + 1); restart(); });
      root.appendChild(prev); root.appendChild(next); root.appendChild(dots);
    }
    root.appendChild(el('div', 'iss-brand', 'IBRA STORE'));
    root.addEventListener('mouseenter', function () { paused = true; });
    root.addEventListener('mouseleave', function () { paused = false; });
    host.appendChild(root); host.style.display = '';
    restart();
    host._issStop = function () { clearInterval(timer); };
  }

  window.IbraStoreSlider = { mount: mount, ACCENT: ACCENT };
})();

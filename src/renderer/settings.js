// IBRA CLEAN UP — الإعدادات: الستايل، اللغة، النسخ الاحتياطي، التحديث الداخلي + سلايد IBRA STORE
'use strict';
Object.assign(I18N.ar, {
  updT: 'تحديث البرنامج', updCur: 'الإصدار الحالي', updCheck: 'التحقق من التحديثات', updChecking: 'جارِ التحقق...', updNone: 'عندك آخر إصدار ✓', updNotListed: 'البرنامج غير منشور بالمتجر بعد.',
  updAvail: (v) => `يتوفر إصدار جديد: ${v}`, updDownload: 'تحميل التحديث', updDownloading: 'جارِ تحميل التحديث...', updInstall: 'تنصيب التحديث الآن', updFail: 'تعذر التحقق من التحديث — تأكد من الإنترنت.',
  updAskDl: (v) => `تريد تحمل الإصدار ${v} داخل البرنامج؟`, updAskInst: 'البرنامج راح يتسكر ويتنصب التحديث فوق النسخة الحالية، وبعدها يرجع يشتغل تلقائياً. ملفاتك وإعداداتك ونسخك الاحتياطية تبقى مثل ما هي.',
  updNoDirect: 'ما لكينا رابط تحميل مباشر لملف التثبيت بالمتجر. تريد نفتح صفحة البرنامج حتى تحمله؟', openPage: 'فتح صفحة البرنامج', updBad: 'الملف المحمل مو ملف تثبيت صالح أو بصمته غير مطابقة — انحذف وما تنصب شي.', updDev: 'التنصيب الداخلي يشتغل بالنسخة المنصبة فقط.', updBanner: 'يتوفر تحديث', notes: 'الجديد',
  storeLabel: 'عرض البرنامج ←', backupT: 'النسخ الاحتياطي لمخلفات التثبيت',
});
Object.assign(I18N.en, {
  updT: 'App update', updCur: 'Current version', updCheck: 'Check for updates', updChecking: 'Checking...', updNone: 'You have the latest version ✓', updNotListed: 'The app is not listed in the store yet.',
  updAvail: (v) => `New version available: ${v}`, updDownload: 'Download update', updDownloading: 'Downloading update...', updInstall: 'Install update now', updFail: 'Could not check for updates — check your internet.',
  updAskDl: (v) => `Download version ${v} inside the app?`, updAskInst: 'The app will close, install the update over the current version, then start again automatically. Your files, settings and backups are kept.',
  updNoDirect: 'No direct installer link was found in the store. Open the app page to download it?', openPage: 'Open app page', updBad: 'The downloaded file is not a valid installer or its hash does not match — it was deleted and nothing was installed.', updDev: 'In-app install works in the installed version only.', updBanner: 'Update available', notes: 'What\'s new',
  storeLabel: 'View app →', backupT: 'Installer cleanup backups',
});

S.upd = { state: 'idle', info: null, prog: null };
const THEME_LIST = [
  { id: 'glass-red', k: 'th_glassRed', sb: '#2a0f14', bg: 'linear-gradient(135deg,#1a0b0e,#0c0a0b)', ln: 'rgba(212,175,55,.5)', bt: '#e0283c' },
  { id: 'glass-white-red', k: 'th_glassWhiteRed', sb: 'rgba(214,31,54,.14)', bg: 'linear-gradient(135deg,#fff,#fbe7ea)', ln: '#f0c9cf', bt: '#d61f36' },
  { id: 'glass-white', k: 'th_glassWhite', sb: 'rgba(80,100,200,.1)', bg: 'linear-gradient(135deg,#fff,#eef1f8)', ln: '#d9dde8', bt: '#a07810' },
  { id: 'glass-clear', k: 'th_glassClear', d: 'thd_glassClear', sb: 'rgba(255,255,255,.18)', bg: 'linear-gradient(135deg,#3b6bd6,#c2416b 60%,#e8a33b)', ln: 'rgba(255,255,255,.45)', bt: 'rgba(255,255,255,.85)' },
  { id: 'dark', k: 'th_dark', sb: '#1c1e22', bg: '#111214', ln: '#2b2e34', bt: '#d4af37' },
  { id: 'light', k: 'th_light', sb: '#f1f1f5', bg: '#ffffff', ln: '#e6e6ec', bt: '#a07810' },
  { id: 'system', k: 'th_system', d: 'thd_system', sb: '#1c1e22', bg: 'linear-gradient(135deg,#111214 50%,#ffffff 50%)', ln: '#8888', bt: '#d4af37' },
];
const LIGHT = new Set(['glass-white-red', 'glass-white', 'light']);
function applyThemeUI(r) {
  if (!r) return;
  const h = document.documentElement;
  h.dataset.theme = r.key;
  h.classList.toggle('glass-on', !!r.glassOn);
  if (LIGHT.has(r.key)) h.setAttribute('data-light', ''); else h.removeAttribute('data-light');
  S.themeKey = r.key; S.supportsGlass = r.supportsGlass;
}
api.onThemeChanged(applyThemeUI);

async function renderSettings() {
  const el = $('#v-settings');
  if (!S.msi.dir) S.msi.dir = await api.msiBackupDir();
  const cur = S.themeName || 'glass-red';
  const u = S.upd;
  let updBody = '';
  if (u.state === 'checking') updBody = `<span class="spin"></span> ${t('updChecking')}`;
  else if (u.state === 'error') updBody = `<span style="color:var(--review)">⚠️ ${t('updFail')}</span>`;
  else if (u.info && u.info.notListed) updBody = `<span class="muted">${t('updNotListed')}</span>`;
  else if (u.info && !u.info.available) updBody = `<span style="color:var(--safe)">${t('updNone')}</span>`;
  else if (u.info && u.info.available) {
    updBody = `<b class="gold">${t('updAvail', esc(u.info.version))}</b>${u.info.notes ? `<div class="muted" style="margin-top:6px;white-space:pre-line">${t('notes')}: ${esc(u.info.notes)}</div>` : ''}`;
    if (u.state === 'downloading') updBody += `<div class="row" style="margin-top:10px"><span class="spin"></span><span class="grow">${t('updDownloading')} <span class="ltr" id="updPct">${u.prog ? fmt(u.prog.got) + (u.prog.total ? ' / ' + fmt(u.prog.total) : '') : ''}</span></span><button class="btn sm" data-uact="cancel">${t('cancel')}</button></div><div class="pbar" style="margin-top:8px;height:8px"><i id="updBar" style="width:${u.prog && u.prog.total ? u.prog.got / u.prog.total * 100 : 5}%"></i></div>`;
    else if (u.state === 'ready') updBody += `<div style="margin-top:10px"><button class="btn primary" data-uact="install">${icon('bolt')}${t('updInstall')}</button></div>`;
    else updBody += `<div style="margin-top:10px"><button class="btn primary" data-uact="download">${icon('down')}${t('updDownload')}</button></div>`;
  }
  el.innerHTML = `
    <h1>${t('settings')}</h1>
    <div class="card" style="margin-top:14px">
      <h2>${t('themeT')}</h2>
      <div class="themes">${THEME_LIST.map((th) => `<div class="theme-card ${cur === th.id ? 'on' : ''}" data-theme-pick="${th.id}">
        <div class="theme-prev" style="background:${th.bg}"><div class="sb" style="background:${th.sb}"></div><div class="ct"><div class="ln" style="background:${th.ln};width:80%"></div><div class="ln" style="background:${th.ln};width:55%"></div><div class="bt" style="background:${th.bt}"></div></div></div>
        <b>${t(th.k)}</b>${th.d ? `<small>${t(th.d)}</small>` : ''}</div>`).join('')}</div>
      ${S.supportsGlass ? '' : `<p class="dim" style="margin:10px 0 0;font-size:12.5px">${t('glassNote')}</p>`}
    </div>
    <div class="grid g2" style="margin-top:14px">
      <div class="card"><h2>${t('langT')}</h2>
        <div class="radio"><label class="${S.lang === 'ar' ? 'on' : ''}" data-lang-pick="ar"><b>العربية</b><small>RTL</small></label><label class="${S.lang === 'en' ? 'on' : ''}" data-lang-pick="en"><b>English</b><small>LTR</small></label></div></div>
      <div class="card"><h2>${t('updT')}</h2>
        <div class="row"><span class="muted">${t('updCur')}</span><b class="ltr">${esc(S.version)}</b><span class="grow"></span><button class="btn" data-uact="check" ${u.state === 'checking' || u.state === 'downloading' ? 'disabled' : ''}>${icon('refresh')}${t('updCheck')}</button></div>
        <div style="margin-top:10px">${updBody}</div></div>
    </div>
    <div class="card" style="margin-top:14px"><h2>${t('backupT')}</h2>
      <div class="row wrap"><div class="pathbox grow" style="margin:0">${esc(S.msi.dir.dir)}</div><button class="btn" data-mact="pickdir">${t('change')}</button></div>
      <p class="dim" style="font-size:12.5px;margin:10px 0 0">${t('bk90')}</p></div>`;
}

api.onUpdProgress((p) => {
  S.upd.prog = p;
  const pct = $('#updPct'), bar = $('#updBar');
  if (pct) pct.textContent = fmt(p.got) + (p.total ? ' / ' + fmt(p.total) : '');
  if (bar && p.total) bar.style.width = (p.got / p.total * 100) + '%';
});

async function updAction(a) {
  const u = S.upd;
  const rerender = () => { renderSidebar(); if (S.view === 'settings') renderSettings(); };
  if (a === 'check') {
    u.state = 'checking'; rerender();
    const r = await api.updCheck();
    u.state = r.ok ? 'idle' : 'error'; u.info = r.ok ? r : null; rerender();
    return;
  }
  if (a === 'download') {
    if (!u.info.url) {
      if (await ask({ title: t('updT'), body: t('updNoDirect'), ok: t('openPage') })) api.updOpenPage();
      return;
    }
    if (!(await ask({ title: t('updT'), body: t('updAskDl', esc(u.info.version)), ok: t('updDownload') }))) return;
    u.state = 'downloading'; u.prog = null; rerender();
    const r = await api.updDownload();
    if (r.ok) { u.state = 'ready'; rerender(); return updAction('install'); }
    u.state = 'idle'; rerender();
    if (r.error === 'notInstaller' || r.error === 'hashMismatch') { if (await ask({ title: t('updT'), body: t('updBad') + '<br><br>' + t('updNoDirect'), ok: t('openPage') })) api.updOpenPage(); }
    else if (r.error !== 'aborted') toast('⚠️ ' + esc(r.error || ''), 5000);
    return;
  }
  if (a === 'cancel') { await api.updCancel(); u.state = 'idle'; return rerender(); }
  if (a === 'install') {
    if (!(await ask({ title: t('updInstall'), body: t('updAskInst'), ok: t('updInstall') }))) return;
    const r = await api.updInstall();
    if (!r.ok) toast('⚠️ ' + (r.error === 'devMode' ? t('updDev') : esc(r.error)), 5000);
  }
}

document.addEventListener('click', async (e) => {
  const tp = e.target.closest('[data-theme-pick]');
  if (tp) { S.themeName = tp.dataset.themePick; applyThemeUI(await api.setTheme(S.themeName)); return renderSettings(); }
  const lp = e.target.closest('[data-lang-pick]');
  if (lp) { S.lang = lp.dataset.langPick; applyLang(); api.saveSettings({ lang: S.lang }); if (storeNode) { storeNode.remove(); storeNode = null; } return go('settings'); }
  const ua = e.target.closest('[data-uact]');
  if (ua) return updAction(ua.dataset.uact);
  const ub = e.target.closest('[data-upd-banner]');
  if (ub) return go('settings');
});

// ───── سلايد IBRA STORE (يتركب مرة وحدة ويتنقل بين الرسومات) ─────
let storeNode = null;
function placeStoreSlider() {
  const slot = $('#storeSlot'); if (!slot) return;
  if (!storeNode) { storeNode = document.createElement('div'); storeNode.style.marginTop = '16px'; IbraStoreSlider.mount(storeNode, { label: t('storeLabel') }); }
  slot.appendChild(storeNode);
}

// فحص صامت للتحديث عند التشغيل (يعرض تنبيه فقط — لا تحميل بدون موافقة)
setTimeout(async () => {
  const r = await api.updCheck().catch(() => null);
  if (r && r.ok) { S.upd.info = r; renderSidebar(); }
}, 4000);

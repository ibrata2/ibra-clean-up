// IBRA CLEAN UP — العملية الرئيسية
// برمجة وتطوير ابراهيم الخزرجي — IBRAPROGRAM
const { app, BrowserWindow, ipcMain, shell, dialog, clipboard, nativeTheme } = require('electron');
const { Worker } = require('worker_threads');
const { execFile, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const os = require('os');
const { GROUPS, CATEGORIES } = require('./junk-defs');

const IS_WIN = process.platform === 'win32';
let win = null;
let worker = null;
let lastTree = null;          // آخر نتيجة فحص للشجرة
let lastJunk = {};            // آخر نتائج فحص الكاش حسب الفئة

// ───── مسارات النظام ─────
const ENV = (() => {
  const U = process.env.USERPROFILE || os.homedir();
  const sysDrive = (process.env.SystemDrive || 'C:') + path.sep;
  return {
    U,
    L: process.env.LOCALAPPDATA || path.join(U, 'AppData', 'Local'),
    R: process.env.APPDATA || path.join(U, 'AppData', 'Roaming'),
    T: process.env.TEMP || os.tmpdir(),
    W: process.env.WINDIR || path.join(sysDrive, 'Windows'),
    P: process.env.PROGRAMDATA || path.join(sysDrive, 'ProgramData'),
    SYS: sysDrive.replace(/[\\/]$/, ''),
    USERS: path.join(sysDrive, 'Users'),
  };
})();

const expandTokens = (p) => p.replace(/\{(U|L|R|T|W|P|SYS)\}/g, (_, k) => ENV[k]);

// ───── الإعدادات والسجل ─────
const dataDir = () => app.getPath('userData');
const readJSON = (f, def) => { try { return JSON.parse(fs.readFileSync(path.join(dataDir(), f), 'utf8')); } catch { return def; } };
const writeJSON = (f, v) => { try { fs.mkdirSync(dataDir(), { recursive: true }); fs.writeFileSync(path.join(dataDir(), f), JSON.stringify(v, null, 1)); } catch { } };
function addHistory(entry) {
  const h = readJSON('history.json', []);
  h.unshift({ at: Date.now(), ...entry });
  writeJSON('history.json', h.slice(0, 500));
}

// ───── الحماية: مسارات ممنوع حذفها نهائياً ─────
const norm = (p) => path.resolve(p).replace(/[\\/]+$/, '').toLowerCase();
function protectedRoots() {
  const U = ENV.U;
  const list = [
    ENV.SYS + path.sep, ENV.USERS, U, path.join(U, 'AppData'), ENV.L, ENV.R, path.join(U, 'AppData', 'LocalLow'),
    ENV.W, ENV.P, ENV.T, path.join(ENV.SYS + path.sep, 'Program Files'), path.join(ENV.SYS + path.sep, 'Program Files (x86)'),
    path.join(U, 'Desktop'), path.join(U, 'Documents'), path.join(U, 'Downloads'), path.join(U, 'Pictures'),
    path.join(U, 'Videos'), path.join(U, 'Music'), path.join(U, 'OneDrive'), path.join(U, 'Favorites'), path.join(U, 'Contacts'),
    path.join(ENV.L, 'Microsoft'), path.join(ENV.R, 'Microsoft'), path.join(ENV.L, 'Packages'), path.join(ENV.L, 'Programs'),
    path.dirname(process.execPath),
  ];
  // جذور الأقراص الأخرى
  for (const d of 'DEFGHIJKLMNOPQRSTUVWXYZ') list.push(d + ':' + path.sep);
  return new Set(list.map(norm));
}
const WIN_ALLOWED = () => [path.join(ENV.W, 'Temp'), path.join(ENV.W, 'SoftwareDistribution', 'Download'), path.join(ENV.W, 'ServiceProfiles', 'NetworkService', 'AppData', 'Local', 'Microsoft', 'Windows', 'DeliveryOptimization', 'Cache')].map(norm);
const PROTECTED_NAMES = /^(ntuser\.(dat|ini|pol)|usrclass\.dat|desktop\.ini|pagefile\.sys|hiberfil\.sys|swapfile\.sys|bootmgr)/i;

function checkDeletable(p) {
  if (!p || typeof p !== 'string' || p.length < 4) return 'مسار غير صالح';
  const n = norm(p);
  if (protectedRoots().has(n)) return 'مجلد نظام أساسي — محمي من الحذف (تكدر تحذف محتواه بالتحديد)';
  if (PROTECTED_NAMES.test(path.basename(p))) return 'ملف نظام محمي';
  const w = norm(ENV.W);
  if (n.startsWith(w + path.sep.toLowerCase()) && !WIN_ALLOWED().some((a) => n === a || n.startsWith(a + path.sep.toLowerCase()))) return 'داخل مجلد ويندوز — محمي';
  for (const pf of ['Program Files', 'Program Files (x86)']) {
    const pn = norm(path.join(ENV.SYS + path.sep, pf));
    if (n.startsWith(pn + path.sep.toLowerCase())) return 'ملفات برامج مثبتة — احذفها من إلغاء التثبيت';
  }
  return null;
}

// ───── النافذة ─────
// ───── الستايلات ─────
const WIN_BUILD = IS_WIN ? Number(os.release().split('.')[2] || 0) : 0;
const SUPPORTS_GLASS = WIN_BUILD >= 22000; // ويندوز 11
const THEMES = {
  'glass-red':   { dark: true,  bg: '#0c0a0b', bar: '#120b0d', sym: '#d4af37', glass: true },
  'glass-white-red': { dark: false, bg: '#f6f1f1', bar: '#f7eff0', sym: '#c4142c', glass: true },
  'glass-white': { dark: false, bg: '#f4f5f8', bar: '#f4f5f8', sym: '#333333', glass: true },
  'glass-clear': { dark: true,  bg: '#101010', bar: '#141414', sym: '#ffffff', glass: true, clear: true },
  'dark':        { dark: true,  bg: '#111214', bar: '#111214', sym: '#e6e6e6' },
  'light':       { dark: false, bg: '#ffffff', bar: '#ffffff', sym: '#222222' },
};
function resolveTheme(name) {
  if (name === 'system') return nativeTheme.shouldUseDarkColorsForSystemPreference ? 'dark' : 'light';
  return THEMES[name] ? name : 'glass-red';
}
function applyTheme(name) {
  const key = resolveTheme(name);
  const t = THEMES[key];
  const glassOn = !!(t.glass && SUPPORTS_GLASS);
  nativeTheme.themeSource = t.dark ? 'dark' : 'light';
  if (win && !win.isDestroyed()) {
    try { win.setBackgroundMaterial(glassOn ? 'acrylic' : 'none'); } catch { }
    win.setBackgroundColor(glassOn ? '#00000000' : t.bg);
    if (IS_WIN) try { win.setTitleBarOverlay({ color: glassOn ? '#00000000' : t.bar, symbolColor: t.sym, height: 40 }); } catch { }
  }
  return { key, glassOn, supportsGlass: SUPPORTS_GLASS };
}
ipcMain.handle('theme:set', (_e, name) => { writeJSON('settings.json', { ...readJSON('settings.json', {}), theme: name }); return applyTheme(name); });
nativeTheme.on('updated', () => { if ((readJSON('settings.json', {}).theme) === 'system') { const r = applyTheme('system'); send('theme:changed', r); } });

function createWindow() {
  const startTheme = THEMES[resolveTheme(readJSON('settings.json', {}).theme || 'glass-red')];
  nativeTheme.themeSource = startTheme.dark ? 'dark' : 'light';
  win = new BrowserWindow({
    width: 1360, height: 860, minWidth: 1040, minHeight: 640,
    backgroundColor: startTheme.bg,
    title: 'IBRA CLEAN UP',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    titleBarStyle: IS_WIN ? 'hidden' : 'default',
    titleBarOverlay: IS_WIN ? { color: startTheme.bar, symbolColor: startTheme.sym, height: 40 } : undefined,
    show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: false },
  });
  win.removeMenu();
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.once('ready-to-show', () => { applyTheme(readJSON('settings.json', {}).theme || 'glass-red'); win.show(); });
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());

const send = (ch, data) => { if (win && !win.isDestroyed()) win.webContents.send(ch, data); };

// قسم تنظيف مخلفات Windows Installer
require('./msi')({ ipcMain, send, readJSON, writeJSON, addHistory, ENV, dialog, shell, getWin: () => win });
// التحديث الداخلي
require('./updater')({ ipcMain, send });

function getWorker() {
  if (worker) return worker;
  worker = new Worker(path.join(__dirname, 'scanner-worker.js').replace(/app\.asar([\\/])/, 'app.asar.unpacked$1'));
  worker.on('error', (e) => { send('scan:error', String(e)); worker = null; });
  worker.on('exit', () => { worker = null; });
  return worker;
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    execFile(cmd, args, { windowsHide: true, timeout: opts.timeout || 120000, maxBuffer: 16 * 1024 * 1024 }, (err, stdout, stderr) => resolve({ ok: !err, code: err ? err.code : 0, stdout: String(stdout || ''), stderr: String(stderr || '') }));
  });
}
const ps = (script, timeout) => run('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script], { timeout });

// ═════════════ معلومات عامة ═════════════
ipcMain.handle('app:info', async () => {
  let isAdmin = false;
  if (IS_WIN) isAdmin = (await run('net', ['session'], { timeout: 8000 })).ok;
  return { env: ENV, version: require('../package.json').version, isAdmin, platform: process.platform, settings: readJSON('settings.json', { lang: 'ar' }), supportsGlass: SUPPORTS_GLASS, theme: applyTheme(readJSON('settings.json', {}).theme || 'glass-red') };
});
ipcMain.handle('settings:save', (_e, s) => { writeJSON('settings.json', { ...readJSON('settings.json', {}), ...s }); return true; });

ipcMain.handle('drives:list', async () => {
  const letters = IS_WIN ? 'CDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((l) => l + ':\\') : ['/'];
  const out = [];
  for (const d of letters) {
    try {
      if (IS_WIN && !fs.existsSync(d)) continue;
      const s = await fsp.statfs(d);
      const total = s.blocks * s.bsize; const free = s.bavail * s.bsize;
      if (total > 0) out.push({ drive: d, total, free, used: total - free });
    } catch { }
  }
  return out;
});

// ═════════════ فحص الشجرة ═════════════
ipcMain.handle('scan:tree', (_e, root) => new Promise((resolve) => {
  const w = getWorker();
  const onMsg = (m) => {
    if (m.type === 'progress') send('scan:progress', m);
    else if (m.type === 'tree-done') {
      w.off('message', onMsg);
      const r = m.result;
      const N = r.nodes.names.length;
      const children = Array.from({ length: N }, () => []);
      for (let i = 1; i < N; i++) children[r.nodes.parent[i]].push(i);
      for (const c of children) c.sort((a, b) => r.nodes.size[b] - r.nodes.size[a]);
      lastTree = { ...r, children, pathIndex: null };
      const findings = r.findings.map((f) => ({ kind: f.kind, id: f.id, path: nodePath(f.id), size: r.nodes.size[f.id], files: r.nodes.files[f.id], mtime: r.nodes.mtime[f.id] }))
        .sort((a, b) => b.size - a.size);
      resolve({ ok: true, root: r.root, cancelled: r.cancelled, elapsed: r.elapsed, stats: r.stats, top: r.top, exts: r.exts, findings, rootNode: nodeInfo(0) });
    } else if (m.type === 'error') { w.off('message', onMsg); resolve({ ok: false, error: m.message }); }
  };
  w.on('message', onMsg);
  w.postMessage({ type: 'scanTree', root });
}));

ipcMain.handle('scan:cancel', () => { if (worker) worker.postMessage({ type: 'cancel' }); return true; });

function nodePath(id) {
  const t = lastTree; const parts = [];
  let i = id;
  while (i > 0) { parts.unshift(t.nodes.names[i]); i = t.nodes.parent[i]; }
  return path.join(t.root, ...parts);
}
function idOfPath(p) {
  const t = lastTree;
  if (!t.pathIndex) { t.pathIndex = new Map(); for (let i = 0; i < t.nodes.names.length; i++) t.pathIndex.set(norm(nodePath(i)), i); }
  const v = t.pathIndex.get(norm(p));
  return v === undefined ? -1 : v;
}
function nodeInfo(id) {
  const n = lastTree.nodes;
  return { id, name: id === 0 ? lastTree.root : n.names[id], path: nodePath(id), size: n.size[id], files: n.files[id], dirs: n.dirs[id], mtime: n.mtime[id], direct: n.direct[id], parent: n.parent[id], hasChildren: lastTree.children[id].length > 0 };
}
ipcMain.handle('tree:node', (_e, id) => {
  if (!lastTree || id < 0 || id >= lastTree.nodes.names.length) return null;
  const crumbs = []; let i = id;
  while (i >= 0) { crumbs.unshift({ id: i, name: i === 0 ? lastTree.root : lastTree.nodes.names[i] }); i = lastTree.nodes.parent[i]; }
  return { node: nodeInfo(id), crumbs, children: lastTree.children[id].slice(0, 500).map(nodeInfo) };
});
ipcMain.handle('tree:findPath', (_e, p) => {
  if (!lastTree) return -1;
  return idOfPath(p);
});

ipcMain.handle('dir:files', async (_e, dir) => {
  const out = [];
  try {
    const ents = await fsp.readdir(dir, { withFileTypes: true });
    for (const ent of ents) {
      if (!ent.isFile() && !ent.isSymbolicLink()) continue;
      try { const st = await fsp.lstat(path.join(dir, ent.name)); if (st.isFile()) out.push({ name: ent.name, path: path.join(dir, ent.name), size: st.size, mtime: st.mtimeMs }); } catch { }
    }
  } catch (e) { return { ok: false, error: e.code || String(e) }; }
  out.sort((a, b) => b.size - a.size);
  return { ok: true, files: out.slice(0, 3000), total: out.length };
});

// ═════════════ الكاش والملفات المؤقتة ═════════════
ipcMain.handle('junk:defs', () => ({ groups: GROUPS, categories: CATEGORIES.map((c) => ({ ...c, paths: c.paths.map(expandTokens) })) }));

function catPaths(c) {
  let paths = c.paths.map(expandTokens);
  if (c.special === 'recyclebin') {
    paths = [];
    for (const l of (IS_WIN ? 'CDEFGHIJKLMNOPQRSTUVWXYZ' : '')) { const p = l + ':\\$Recycle.Bin'; if (fs.existsSync(l + ':\\')) paths.push(p); }
  }
  return paths;
}

ipcMain.handle('junk:scan', (_e, ids) => new Promise((resolve) => {
  const cats = CATEGORIES.filter((c) => !ids || ids.includes(c.id)).map((c) => ({ id: c.id, mode: c.mode || 'contents', special: c.special, listDirs: !!c.listDirs, paths: catPaths(c) }));
  const w = getWorker();
  const results = {};
  const onMsg = (m) => {
    if (m.type === 'junk-progress') send('junk:progress', m.id);
    else if (m.type === 'junk-result') { lastJunk[m.id] = m; results[m.id] = m; send('junk:result', m); }
    else if (m.type === 'junk-done') { w.off('message', onMsg); resolve({ ok: true, results }); }
    else if (m.type === 'error') { w.off('message', onMsg); resolve({ ok: false, error: m.message }); }
  };
  w.on('message', onMsg);
  w.postMessage({ type: 'scanJunk', cats });
}));

async function rmPath(p, mode) {
  if (mode === 'trash') { await shell.trashItem(p); return; }
  await fsp.rm(p, { recursive: true, force: true, maxRetries: 1 });
}

// تنظيف فئات كاملة (محتوى المجلدات) أو عناصر محددة داخلها
ipcMain.handle('junk:clean', async (_e, { ids, items, mode }) => {
  const res = { deleted: 0, failed: 0, freed: 0, failures: [] };
  const fail = (p, e) => { res.failed++; if (res.failures.length < 60) res.failures.push({ path: p, error: e && (e.code || e.message) || String(e) }); };
  const m = mode === 'trash' ? 'trash' : 'permanent';

  // عناصر محددة اختارها المستخدم
  if (items && items.length) {
    for (const it of items) {
      const why = checkDeletable(it.path);
      if (why) { fail(it.path, { message: why }); continue; }
      try { await rmPath(it.path, m); res.deleted++; res.freed += it.size || 0; } catch (e) { fail(it.path, e); }
    }
    addHistory({ kind: 'junk-items', mode: m, count: res.deleted, freed: res.freed, failed: res.failed, sample: items.slice(0, 5).map((i) => i.path) });
    return res;
  }

  for (const id of ids || []) {
    const c = CATEGORIES.find((x) => x.id === id);
    const scan = lastJunk[id];
    if (!c || !scan) continue;
    if (c.special === 'recyclebin') {
      const r = await ps('Clear-RecycleBin -Force -ErrorAction SilentlyContinue');
      if (r.ok) { res.deleted++; res.freed += scan.size; } else fail('سلة المحذوفات', { message: r.stderr });
      continue;
    }
    if (c.special === 'downloads-installers') {
      for (const f of scan.top) {
        try { await rmPath(f.path, m); res.deleted++; res.freed += f.size; } catch (e) { fail(f.path, e); }
      }
      continue;
    }
    for (const root of scan.roots) {
      if (c.mode === 'files') {
        try { await rmPath(root, 'permanent'); res.deleted++; } catch (e) { fail(root, e); }
        continue;
      }
      let ents = [];
      try { ents = await fsp.readdir(root); } catch (e) { fail(root, e); continue; }
      for (const name of ents) {
        const p = path.join(root, name);
        if (checkDeletable(p)) continue;
        try { await rmPath(p, m); res.deleted++; } catch (e) { fail(p, e); }
      }
    }
  }
  addHistory({ kind: 'junk', mode: m, cats: ids, count: res.deleted, failed: res.failed });
  return res;
});

// منع التحميل التلقائي (مثل نموذج كروم)
ipcMain.handle('junk:prevent', async (_e, id) => {
  const c = CATEGORIES.find((x) => x.id === id);
  if (!c || !c.prevent || !IS_WIN) return { ok: false, error: 'غير متاح' };
  const p = c.prevent;
  const r = await run('reg', ['add', p.key, '/v', p.name, '/t', 'REG_DWORD', '/d', String(p.value), '/f']);
  if (r.ok) addHistory({ kind: 'prevent', cat: id, key: p.key + '\\' + p.name });
  return { ok: r.ok, error: r.stderr };
});
ipcMain.handle('junk:preventUndo', async (_e, id) => {
  const c = CATEGORIES.find((x) => x.id === id);
  if (!c || !c.prevent || !IS_WIN) return { ok: false };
  const r = await run('reg', ['delete', c.prevent.key, '/v', c.prevent.name, '/f']);
  return { ok: r.ok, error: r.stderr };
});
ipcMain.handle('junk:preventState', async (_e, id) => {
  const c = CATEGORIES.find((x) => x.id === id);
  if (!c || !c.prevent || !IS_WIN) return false;
  const r = await run('reg', ['query', c.prevent.key, '/v', c.prevent.name], { timeout: 8000 });
  return r.ok;
});

// ═════════════ الحذف من المحلل والملفات الكبيرة ═════════════
ipcMain.handle('delete:paths', async (_e, { items, mode }) => {
  const res = { deleted: 0, failed: 0, freed: 0, failures: [], done: [] };
  const m = mode === 'permanent' ? 'permanent' : 'trash';
  for (const it of items) {
    const why = checkDeletable(it.path);
    if (why) { res.failed++; res.failures.push({ path: it.path, error: why }); continue; }
    try { await rmPath(it.path, m); res.deleted++; res.freed += it.size || 0; res.done.push(it); }
    catch (e) { res.failed++; if (res.failures.length < 60) res.failures.push({ path: it.path, error: e.code || e.message }); }
  }
  // تحديث شجرة الفحص بدون ما نعيد الفحص
  if (lastTree) for (const d of res.done) removeFromTree(d.path, d.size || 0);
  addHistory({ kind: 'delete', mode: m, count: res.deleted, freed: res.freed, failed: res.failed, sample: res.done.slice(0, 8).map((d) => d.path) });
  return res;
});
ipcMain.handle('delete:check', (_e, p) => checkDeletable(p));

function removeFromTree(p, knownSize) {
  const t = lastTree; const target = norm(p);
  const found = idOfPath(p);
  if (found > 0) {
    const s = t.nodes.size[found], f = t.nodes.files[found];
    let i = t.nodes.parent[found];
    const par = i;
    while (i >= 0) { t.nodes.size[i] -= s; t.nodes.files[i] -= f; i = t.nodes.parent[i]; }
    t.children[par] = t.children[par].filter((c) => c !== found);
    return;
  }
  // ملف: نقصه من مجلده
  const parentDir = norm(path.dirname(p));
  const it = t.top.find((x) => norm(x.path) === target);
  const size = it ? it.size : knownSize;
  t.top = t.top.filter((x) => norm(x.path) !== target);
  const j = idOfPath(parentDir);
  if (j >= 0 && size) {
    let k = j; t.nodes.direct[j] -= size;
    while (k >= 0) { t.nodes.size[k] -= size; t.nodes.files[k] -= 1; k = t.nodes.parent[k]; }
  }
}

// ═════════════ أدوات ويندوز ═════════════
ipcMain.handle('shell:openFolder', async (_e, p) => {
  try {
    const st = await fsp.stat(p);
    if (st.isDirectory()) return (await shell.openPath(p)) === '';
    shell.showItemInFolder(p); return true;
  } catch { const d = path.dirname(p); if (fs.existsSync(d)) { await shell.openPath(d); return true; } return false; }
});
ipcMain.handle('shell:openFile', async (_e, p) => (await shell.openPath(p)) === '');
ipcMain.handle('shell:external', (_e, url) => { if (/^https?:\/\//.test(url)) shell.openExternal(url); });
ipcMain.handle('clipboard:write', (_e, t) => { clipboard.writeText(String(t)); return true; });
ipcMain.handle('dialog:pickFolder', async () => {
  const r = await dialog.showOpenDialog(win, { properties: ['openDirectory'] });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle('tools:cleanmgr', () => { if (IS_WIN) spawn('cleanmgr.exe', ['/d', ENV.SYS], { detached: true, stdio: 'ignore' }).unref(); return true; });
ipcMain.handle('tools:storageSense', () => { if (IS_WIN) shell.openExternal('ms-settings:storagesense'); return true; });
ipcMain.handle('admin:relaunch', async () => {
  if (!IS_WIN) return false;
  const exe = process.execPath;
  const args = app.isPackaged ? '' : `'${app.getAppPath()}'`;
  const r = await ps(`Start-Process -FilePath '${exe.replace(/'/g, "''")}' ${args ? '-ArgumentList ' + args : ''} -Verb RunAs`, 60000);
  if (r.ok) app.quit();
  return r.ok;
});
ipcMain.handle('history:get', () => readJSON('history.json', []));
ipcMain.handle('history:clear', () => { writeJSON('history.json', []); return true; });

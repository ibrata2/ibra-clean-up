// IBRA CLEAN UP — محرك الفحص (يشتغل بخيط منفصل حتى ما تعلك الواجهة)
const { parentPort } = require('worker_threads');
const fsp = require('fs/promises');
const path = require('path');

let cancelled = false;

// ───── محدد التوازي حتى ما نفتح ملفات أكثر من اللازم ─────
function makeLimiter(max) {
  let active = 0;
  const queue = [];
  const next = () => {
    if (active >= max || queue.length === 0) return;
    active++;
    const { fn, resolve, reject } = queue.shift();
    Promise.resolve().then(fn).then(resolve, reject).finally(() => { active--; next(); });
  };
  return (fn) => new Promise((resolve, reject) => { queue.push({ fn, resolve, reject }); next(); });
}

// ───── كومة صغرى لأكبر الملفات ─────
class TopK {
  constructor(k) { this.k = k; this.h = []; }
  push(item) {
    const h = this.h;
    if (h.length < this.k) { h.push(item); this._up(h.length - 1); }
    else if (item.size > h[0].size) { h[0] = item; this._down(0); }
  }
  _up(i) { const h = this.h; while (i > 0) { const p = (i - 1) >> 1; if (h[p].size <= h[i].size) break; [h[p], h[i]] = [h[i], h[p]]; i = p; } }
  _down(i) { const h = this.h; const n = h.length; for (;;) { let m = i; const l = 2 * i + 1, r = l + 1; if (l < n && h[l].size < h[m].size) m = l; if (r < n && h[r].size < h[m].size) m = r; if (m === i) break; [h[m], h[i]] = [h[i], h[m]]; i = m; } }
  sorted() { return [...this.h].sort((a, b) => b.size - a.size); }
}

const FINDING_DIRS = { node_modules: 'node_modules', __pycache__: 'pycache', '.venv': 'venv', venv: 'venv', '.next': 'next', '.nuxt': 'next', '.dart_tool': 'dart_tool', '.angular': 'next' };

// تحديد نوع العنصر بدقة: الاختصارات والـ Junction نتخطاها، وملفات OneDrive نعاملها كملفات عادية
async function classify(full, ent) {
  if (ent.isDirectory()) return 'dir';
  if (ent.isFile()) return 'file';
  if (ent.isSymbolicLink()) {
    try {
      const st = await fsp.lstat(full);
      if (st.isSymbolicLink()) return 'link';
      if (st.isDirectory()) return 'link'; // junction/mount point — نتخطاه حتى ما نحسب نفس الشي مرتين
      if (st.isFile()) return 'file';
    } catch { return 'error'; }
  }
  return 'other';
}

// ═════════════ فحص شجرة المجلدات ═════════════
async function scanTree(root, opts = {}) {
  cancelled = false;
  const limit = makeLimiter(opts.concurrency || 64);
  const names = [], parent = [], size = [], files = [], dirs = [], mtime = [], direct = [];
  const top = new TopK(opts.topCount || 1500);
  const exts = new Map();
  const findings = [];
  let fileCount = 0, dirCount = 0, bytes = 0, errors = 0, links = 0, current = root;
  const errorSamples = [];
  const t0 = Date.now();
  let lastPost = 0;

  const newNode = (name, p) => { names.push(name); parent.push(p); size.push(0); files.push(0); dirs.push(0); mtime.push(0); direct.push(0); return names.length - 1; };

  const progress = (force) => {
    const now = Date.now();
    if (!force && now - lastPost < 250) return;
    lastPost = now;
    parentPort.postMessage({ type: 'progress', files: fileCount, dirs: dirCount, bytes, errors, current, elapsed: now - t0 });
  };

  async function walk(dirPath, id, inFinding) {
    if (cancelled) return;
    current = dirPath;
    const subdirs = [];
    const fileEnts = [];
    try {
      await limit(async () => {
        const dir = await fsp.opendir(dirPath, { bufferSize: 128 });
        for await (const ent of dir) {
          if (cancelled) break;
          const full = path.join(dirPath, ent.name);
          const kind = await classify(full, ent);
          if (kind === 'dir') subdirs.push(ent.name);
          else if (kind === 'file') fileEnts.push(full);
          else if (kind === 'link') links++;
        }
      });
    } catch (e) {
      errors++;
      if (errorSamples.length < 40) errorSamples.push({ path: dirPath, code: e.code || String(e.message || e) });
      return;
    }

    await Promise.all(fileEnts.map((full) => limit(async () => {
      if (cancelled) return;
      try {
        const st = await fsp.lstat(full);
        const s = st.size;
        const m = st.mtimeMs;
        size[id] += s; direct[id] += s; files[id]++;
        if (m > mtime[id]) mtime[id] = m;
        fileCount++; bytes += s;
        let ext = path.extname(full).toLowerCase();
        if (ext.length > 12 || ext.length < 2) ext = '';
        const e = exts.get(ext); if (e) { e[0] += s; e[1]++; } else exts.set(ext, [s, 1]);
        if (s > 0) top.push({ path: full, size: s, mtime: m });
      } catch (e) { errors++; }
    })));
    progress(false);

    await Promise.all(subdirs.map(async (name) => {
      if (cancelled) return;
      const cid = newNode(name, id);
      dirCount++;
      const kind = FINDING_DIRS[name.toLowerCase()];
      let flag = inFinding;
      if (kind && !inFinding) { findings.push({ kind, id: cid }); flag = true; }
      await walk(path.join(dirPath, name), cid, flag);
    }));

    // جمع الأحجام للأب بعد ما يخلص الابن
  }

  const rootId = newNode(root, -1);
  await walk(root, rootId, false);

  // تجميع الأحجام من الأسفل للأعلى (الأبناء دائماً رقمهم أكبر من الأب)
  for (let i = names.length - 1; i > 0; i--) {
    const p = parent[i];
    size[p] += size[i]; files[p] += files[i]; dirs[p] += dirs[i] + 1;
    if (mtime[i] > mtime[p]) mtime[p] = mtime[i];
  }
  // تصحيح: أحجام الملفات المباشرة أضيفت لـ size[id] ثم أضفنا الأبناء — صحيح

  progress(true);
  return {
    root, cancelled, elapsed: Date.now() - t0,
    nodes: { names, parent, size, files, dirs, mtime, direct },
    top: top.sorted(),
    exts: [...exts.entries()].map(([ext, [s, c]]) => ({ ext, size: s, count: c })).sort((a, b) => b.size - a.size),
    findings,
    stats: { files: fileCount, dirs: dirCount, bytes, errors, links, errorSamples },
  };
}

// ═════════════ توسيع المسارات اللي بيها * ═════════════
function wildcardToRegex(seg) {
  return new RegExp('^' + seg.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');
}

async function expandPattern(pattern) {
  const parts = pattern.split(/[\\/]+/).filter((p, i) => p.length || i === 0);
  let base = parts.shift();
  if (base === '') base = path.sep; // مسار لينكس للاختبار
  else if (/^[a-z]:$/i.test(base)) base = base + path.sep;
  let current = [base];
  for (const seg of parts) {
    const next = [];
    if (!seg.includes('*') && !seg.includes('?')) {
      for (const c of current) next.push(path.join(c, seg));
    } else {
      const re = wildcardToRegex(seg);
      for (const c of current) {
        try {
          const ents = await fsp.readdir(c);
          for (const n of ents) if (re.test(n)) next.push(path.join(c, n));
        } catch { /* غير موجود */ }
      }
    }
    current = next;
    if (!current.length) break;
  }
  const out = [];
  for (const c of current) {
    try { const st = await fsp.lstat(c); out.push({ path: c, isDir: st.isDirectory(), size: st.size, mtime: st.mtimeMs }); } catch { }
  }
  return out;
}

// جمع حجم مجلد كامل + أكبر ملفاته
async function sumDir(dirPath, top, limit, acc) {
  if (cancelled) return;
  let ents;
  try { ents = await limit(() => fsp.readdir(dirPath, { withFileTypes: true })); } catch { acc.errors++; return; }
  const subs = [];
  await Promise.all(ents.map((ent) => limit(async () => {
    const full = path.join(dirPath, ent.name);
    const kind = await classify(full, ent);
    if (kind === 'dir') subs.push(full);
    else if (kind === 'file') {
      try { const st = await fsp.lstat(full); acc.size += st.size; acc.count++; top.push({ path: full, size: st.size, mtime: st.mtimeMs }); } catch { acc.errors++; }
    }
  })));
  await Promise.all(subs.map((s) => sumDir(s, top, limit, acc)));
}

// مثل sumDir لكن يرجع حجم كل مجلد فرعي مباشر لوحده (مشروع كاب كات، نسخة آيفون...)
async function sumDirByChild(rootPath, top, limit, acc, items) {
  let ents;
  try { ents = await fsp.readdir(rootPath, { withFileTypes: true }); } catch { acc.errors++; return; }
  for (const ent of ents) {
    if (cancelled) return;
    const full = path.join(rootPath, ent.name);
    const kind = await classify(full, ent);
    if (kind === 'dir') {
      const sub = { size: 0, count: 0, errors: 0 };
      const subTop = new TopK(1);
      let mt = 0;
      await sumDir(full, { push: (f) => { top.push(f); subTop.push(f); if (f.mtime > mt) mt = f.mtime; } }, limit, sub);
      if (!mt) { try { mt = (await fsp.stat(full)).mtimeMs; } catch { } }
      acc.size += sub.size; acc.count += sub.count; acc.errors += sub.errors;
      items.push({ path: full, name: ent.name, isDir: true, size: sub.size, count: sub.count, mtime: mt, parent: rootPath });
    } else if (kind === 'file') {
      try {
        const st = await fsp.lstat(full);
        acc.size += st.size; acc.count++;
        top.push({ path: full, size: st.size, mtime: st.mtimeMs });
        items.push({ path: full, name: ent.name, isDir: false, size: st.size, count: 1, mtime: st.mtimeMs, parent: rootPath });
      } catch { acc.errors++; }
    }
  }
}

const INSTALLER_EXT =new Set(['.exe', '.msi', '.msix', '.appx', '.iso', '.img', '.zip', '.rar', '.7z', '.apk', '.dmg']);

async function scanJunk(cats) {
  cancelled = false;
  const limit = makeLimiter(48);
  for (const cat of cats) {
    if (cancelled) break;
    parentPort.postMessage({ type: 'junk-progress', id: cat.id });
    const top = new TopK(300);
    const acc = { size: 0, count: 0, errors: 0 };
    const roots = [];
    const items = [];
    if (cat.special === 'downloads-installers') {
      const minAge = Date.now() - 14 * 86400000;
      for (const p of cat.paths) {
        let ents = [];
        try { ents = await fsp.readdir(p, { withFileTypes: true }); } catch { continue; }
        roots.push(p);
        for (const ent of ents) {
          if (!ent.isFile()) continue;
          const full = path.join(p, ent.name);
          if (!INSTALLER_EXT.has(path.extname(ent.name).toLowerCase())) continue;
          try { const st = await fsp.lstat(full); if (st.mtimeMs < minAge) { acc.size += st.size; acc.count++; top.push({ path: full, size: st.size, mtime: st.mtimeMs }); } } catch { }
        }
      }
    } else {
      const seen = new Set();
      for (const pat of cat.paths) {
        const matches = await expandPattern(pat);
        for (const m of matches) {
          const key = m.path.toLowerCase();
          if (seen.has(key)) continue;
          // لا نحسب مجلد داخل مجلد محسوب سابقاً
          if ([...seen].some((s) => key.startsWith(s + path.sep.toLowerCase()))) continue;
          seen.add(key);
          if (m.isDir) {
            roots.push(m.path);
            if (cat.listDirs) await sumDirByChild(m.path, top, limit, acc, items);
            else await sumDir(m.path, top, limit, acc);
          } else if (cat.mode === 'files') { roots.push(m.path); acc.size += m.size; acc.count++; top.push({ path: m.path, size: m.size, mtime: m.mtime }); }
        }
      }
    }
    items.sort((a, b) => b.size - a.size);
    parentPort.postMessage({ type: 'junk-result', id: cat.id, size: acc.size, count: acc.count, errors: acc.errors, roots: [...new Set(roots)], top: top.sorted(), items: items.slice(0, 400) });
  }
  return { cancelled };
}

// ═════════════ استقبال الأوامر ═════════════
parentPort.on('message', async (msg) => {
  if (msg.type === 'cancel') { cancelled = true; return; }
  try {
    if (msg.type === 'scanTree') {
      const res = await scanTree(msg.root, msg.opts);
      parentPort.postMessage({ type: 'tree-done', result: res });
    } else if (msg.type === 'scanJunk') {
      const res = await scanJunk(msg.cats);
      parentPort.postMessage({ type: 'junk-done', result: res });
    }
  } catch (e) {
    parentPort.postMessage({ type: 'error', message: String(e && e.stack || e) });
  }
});

// IBRA CLEAN UP — التحديث الداخلي (فحص، تحميل، تنصيب) — كل خطوة بموافقة المستخدم
const { app, net, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const { spawn } = require('child_process');

const STORE = 'https://ibraprogram.netlify.app';
const API = STORE + '/api/apps';
const SLUGS = ['ibra-clean-up', 'ibracleanup', 'ibra-cleanup', 'ibra-clean'];

const parseVer = (v) => String(v || '').replace(/^v/i, '').split(/[.\-+]/).slice(0, 3).map((x) => parseInt(x, 10) || 0);
function newer(a, b) { const x = parseVer(a), y = parseVer(b); for (let i = 0; i < 3; i++) { if (x[i] > y[i]) return true; if (x[i] < y[i]) return false; } return false; }

// يدور بكل حقول العنصر على رابط ملف تثبيت ويندوز
function findInstaller(item) {
  const found = [];
  const walk = (o, keyPath) => {
    if (!o) return;
    if (typeof o === 'string') { if (/^https?:\/\//i.test(o)) found.push({ url: o, key: keyPath.toLowerCase() }); return; }
    if (Array.isArray(o)) { o.forEach((v, i) => walk(v, keyPath + '.' + i + (v && v.platform ? '.' + v.platform : '') + (v && v.os ? '.' + v.os : ''))); return; }
    if (typeof o === 'object') for (const k of Object.keys(o)) { if (/icon|screenshot|image|video|thumb/i.test(k)) continue; walk(o[k], keyPath + '.' + k); }
  };
  walk(item, '');
  const score = (f) => (/\.(exe|msi)(\?|$)/i.test(f.url) ? 10 : 0) + (/win/.test(f.key) ? 5 : 0) + (/setup|install/i.test(f.url) ? 2 : 0) + (/android|apk|ios|ipa|mac|apple/.test(f.key + f.url.toLowerCase()) ? -20 : 0) + (/download|file|link|url|mirror/.test(f.key) ? 1 : 0);
  found.sort((a, b) => score(b) - score(a));
  const best = found.find((f) => score(f) >= 5);
  if (!best) return null;
  let url = best.url;
  const gd = /drive\.google\.com\/file\/d\/([^/?#]+)/.exec(url) || /drive\.google\.com\/open\?id=([^&#]+)/.exec(url);
  if (gd) url = `https://drive.google.com/uc?export=download&id=${gd[1]}`;
  return url;
}
function findVersion(item) {
  for (const k of ['version', 'latestVersion', 'currentVersion', 'appVersion']) if (item[k]) return String(item[k]);
  let v = null;
  const walk = (o) => { if (v || !o || typeof o !== 'object') return; for (const k of Object.keys(o)) { if (/version/i.test(k) && typeof o[k] === 'string' && /\d+\.\d+/.test(o[k])) { v = o[k]; return; } walk(o[k]); } };
  walk(item);
  return v;
}

module.exports = function registerUpdater({ ipcMain, send }) {
  const current = require('../package.json').version;
  let info = null;
  let downloaded = null;
  let req = null;

  async function check() {
    try {
      const r = await net.fetch(API, { headers: { Accept: 'application/json' } });
      if (!r.ok) return { ok: false, error: 'http ' + r.status, current };
      const data = await r.json();
      const list = Array.isArray(data) ? data : (data.apps || data.items || data.data || []);
      const item = list.find((a) => a && SLUGS.includes(String(a.slug || '').toLowerCase())) || list.find((a) => a && /clean\s*up/i.test(a.name || ''));
      if (!item) return { ok: true, available: false, current, notListed: true };
      const version = findVersion(item);
      const url = findInstaller(item);
      info = { ok: true, current, version, available: !!(version && newer(version, current)), url, page: STORE + '/app/' + encodeURIComponent(item.slug), notes: item.changelog || item.whatsNew || item.releaseNotes || '', sha256: item.sha256 || (item.windows && item.windows.sha256) || null };
      return info;
    } catch (e) { return { ok: false, error: e.message, current }; }
  }

  function download() {
    return new Promise((resolve) => {
      if (!info || !info.url) return resolve({ ok: false, error: 'noUrl' });
      const file = path.join(os.tmpdir(), `IBRA-CLEAN-UP-Update-${info.version}.exe`);
      try { fs.rmSync(file, { force: true }); } catch { }
      const out = fs.createWriteStream(file);
      const hash = crypto.createHash('sha256');
      let got = 0, total = 0, head = null, finished = false;
      const fail = (error) => { if (finished) return; finished = true; try { out.destroy(); fs.rmSync(file, { force: true }); } catch { } resolve({ ok: false, error }); };
      req = net.request({ url: info.url, redirect: 'follow' });
      req.on('response', (res) => {
        if (res.statusCode >= 400) return fail('http ' + res.statusCode);
        const ct = String(res.headers['content-type'] || '');
        if (/text\/html/i.test(ct)) return fail('notInstaller');
        total = parseInt(res.headers['content-length'], 10) || 0;
        res.on('data', (chunk) => {
          if (!head) head = chunk.slice(0, 2).toString('latin1');
          got += chunk.length; hash.update(chunk); out.write(chunk);
          send('update:progress', { got, total });
        });
        res.on('end', () => {
          out.end(() => {
            if (finished) return; finished = true;
            const sha = hash.digest('hex');
            if (head !== 'MZ' || got < 1024 * 1024) { try { fs.rmSync(file, { force: true }); } catch { } return resolve({ ok: false, error: 'notInstaller' }); }
            if (info.sha256 && info.sha256.toLowerCase() !== sha) { try { fs.rmSync(file, { force: true }); } catch { } return resolve({ ok: false, error: 'hashMismatch' }); }
            downloaded = { file, sha, size: got };
            resolve({ ok: true, ...downloaded });
          });
        });
        res.on('error', (e) => fail(e.message));
      });
      req.on('error', (e) => fail(e.message));
      req.end();
    });
  }

  function install() {
    if (!downloaded || !fs.existsSync(downloaded.file)) return { ok: false, error: 'notDownloaded' };
    if (!app.isPackaged) return { ok: false, error: 'devMode' };
    const dir = path.dirname(process.execPath);
    // تنصيب صامت فوق النسخة الحالية بنفس المجلد، والمثبّت يعيد تشغيل البرنامج بعد ما يخلص
    spawn(downloaded.file, ['/S', '/UPDATE', '/D=' + dir], { detached: true, stdio: 'ignore', windowsHide: false }).unref();
    setTimeout(() => app.quit(), 400);
    return { ok: true };
  }

  ipcMain.handle('update:check', () => check());
  ipcMain.handle('update:download', () => download());
  ipcMain.handle('update:cancel', () => { try { req && req.abort(); } catch { } return true; });
  ipcMain.handle('update:install', () => install());
  ipcMain.handle('update:openPage', () => { if (info && info.page) shell.openExternal(info.page); else shell.openExternal(STORE); return true; });
  return { check, newer, findInstaller, findVersion };
};

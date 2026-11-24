// IBRA CLEAN UP — Windows Installer Cleaner (تنظيف مخلفات تثبيت البرامج)
// محرك مستقل: Windows Installer API (ProductsEx / PatchesEx عبر كائن COM الرسمي WindowsInstaller.Installer)
// + تحقق ثاني من سجل الويندوز (UserData\*\LocalPackage). لا يستخدم Win32_Product أبداً.
// القاعدة: أي شك = الملف محمي. أي فحص ناقص = التنظيف موقوف.
// برمجة وتطوير ابراهيم الخزرجي — IBRAPROGRAM
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const crypto = require('crypto');
const os = require('os');
const { execFile } = require('child_process');

const IS_WIN = process.platform === 'win32';
const FAKE = process.env.IBRA_MSI_FAKE || null; // للاختبار فقط
const RECENT_MS = process.env.IBRA_MSI_RECENT_MS != null ? Number(process.env.IBRA_MSI_RECENT_MS) : 2 * 86400000; // ملفات أحدث من يومين نستثنيها (ممكن تثبيت جاري)

// ───── سكربت التعداد (يشتغل بـ PowerShell) ─────
const PS_ENUM = String.raw`
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
function GP($o, $n, $a) { return $o.GetType().InvokeMember($n, [System.Reflection.BindingFlags]::GetProperty, $null, $o, $a) }
$r = [ordered]@{ ok = $true; admin = $false; mutex = $false; inProgress = $false; regOk = $true; errors = @(); warnings = @(); products = @(); patches = @(); reg = @() }
try { $r.admin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator) } catch {}
try { $m = $null; if ([System.Threading.Mutex]::TryOpenExisting('Global\_MSIExecute', [ref]$m)) { $r.mutex = $true; $m.Dispose() } } catch [System.UnauthorizedAccessException] { $r.mutex = $true } catch {}
try { if (Test-Path 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Installer\InProgress') { $r.inProgress = $true } } catch {}
$inst = $null
try { $inst = New-Object -ComObject WindowsInstaller.Installer } catch { $r.ok = $false; $r.errors += ('COM: ' + $_.Exception.Message) }
if ($inst) {
  try {
    $col = GP $inst 'ProductsEx' @('', 's-1-1-0', 7)
    $n = GP $col 'Count' $null
    for ($i = 0; $i -lt $n; $i++) {
      $p = GP $col 'Item' @($i)
      $o = [ordered]@{ code = (GP $p 'ProductCode' $null); ctx = (GP $p 'Context' $null); sid = ''; name = ''; pkg = ''; err = '' }
      try { $o.sid = [string](GP $p 'UserSid' $null) } catch {}
      try { $o.pkg = [string](GP $p 'InstallProperty' @('LocalPackage')) } catch { $o.err = $_.Exception.InnerException.Message }
      try { $o.name = [string](GP $p 'InstallProperty' @('ProductName')) } catch {}
      $r.products += $o
    }
  } catch { $r.ok = $false; $r.errors += ('ProductsEx: ' + $_.Exception.Message) }
  try {
    $col = GP $inst 'PatchesEx' @('', 's-1-1-0', 7, 15)
    $n = GP $col 'Count' $null
    for ($i = 0; $i -lt $n; $i++) {
      $p = GP $col 'Item' @($i)
      $o = [ordered]@{ code = (GP $p 'PatchCode' $null); product = (GP $p 'ProductCode' $null); ctx = (GP $p 'Context' $null); name = ''; pkg = ''; err = '' }
      try { $o.pkg = [string](GP $p 'PatchProperty' @('LocalPackage')) } catch { $o.err = $_.Exception.InnerException.Message }
      try { $o.name = [string](GP $p 'PatchProperty' @('DisplayName')) } catch {}
      $r.patches += $o
    }
  } catch { $r.ok = $false; $r.errors += ('PatchesEx: ' + $_.Exception.Message) }
}
try {
  $base = 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Installer\UserData'
  if (-not (Test-Path $base)) { throw 'UserData key missing' }
  foreach ($sid in (Get-ChildItem $base)) {
    $pp = Join-Path $sid.PSPath 'Products'
    if (Test-Path $pp) { foreach ($k in (Get-ChildItem $pp)) {
      $ip = Join-Path $k.PSPath 'InstallProperties'
      if (Test-Path $ip) { $v = Get-ItemProperty $ip; if ($v.LocalPackage) { $r.reg += [ordered]@{ kind = 'product'; key = $k.PSChildName; pkg = [string]$v.LocalPackage; name = [string]$v.DisplayName } } }
    } }
    $pt = Join-Path $sid.PSPath 'Patches'
    if (Test-Path $pt) { foreach ($k in (Get-ChildItem $pt)) {
      $v = Get-ItemProperty $k.PSPath; if ($v.LocalPackage) { $r.reg += [ordered]@{ kind = 'patch'; key = $k.PSChildName; pkg = [string]$v.LocalPackage; name = '' } }
    } }
  }
} catch { $r.regOk = $false; $r.errors += ('Registry: ' + $_.Exception.Message) }
$r | ConvertTo-Json -Depth 5 -Compress
`;

// قراءة معلومات الملخص (اسم المنتج) من ملفات MSI/MSP بدون تشغيلها — قراءة فقط
const PS_SUMMARY = String.raw`
$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
function GP($o, $n, $a) { return $o.GetType().InvokeMember($n, [System.Reflection.BindingFlags]::GetProperty, $null, $o, $a) }
$inst = New-Object -ComObject WindowsInstaller.Installer
$paths = Get-Content -Raw -Encoding UTF8 $env:IBRA_LIST | ConvertFrom-Json
$out = @{}
foreach ($p in $paths) {
  try {
    $si = GP $inst 'SummaryInformation' @($p, 0)
    $out[$p] = [ordered]@{ title = [string](GP $si 'Property' @(2)); subject = [string](GP $si 'Property' @(3)); author = [string](GP $si 'Property' @(4)) }
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($si)
  } catch { }
}
$out | ConvertTo-Json -Depth 3 -Compress
`;

const PS_GETACL = String.raw`
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$paths = Get-Content -Raw -Encoding UTF8 $env:IBRA_LIST | ConvertFrom-Json
$out = @{}
foreach ($p in $paths) { try { $out[$p] = (Get-Acl -LiteralPath $p).Sddl } catch { } }
$out | ConvertTo-Json -Compress
`;

const PS_SETACL = String.raw`
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$items = Get-Content -Raw -Encoding UTF8 $env:IBRA_LIST | ConvertFrom-Json
$out = @{}
foreach ($it in $items) {
  try { $acl = Get-Acl -LiteralPath $it.path; $acl.SetSecurityDescriptorSddlForm($it.sddl, 'Access'); Set-Acl -LiteralPath $it.path -AclObject $acl; $out[$it.path] = 'ok' }
  catch { $out[$it.path] = $_.Exception.Message }
}
$out | ConvertTo-Json -Compress
`;

const toArr = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);
const low = (p) => path.resolve(String(p)).toLowerCase();

let currentPS = null;
function runPS(script, list, timeout = 600000) {
  return new Promise((resolve) => {
    let listFile = null;
    const env = { ...process.env };
    if (list) {
      listFile = path.join(os.tmpdir(), `ibra-msi-${process.pid}-${Date.now()}.json`);
      fs.writeFileSync(listFile, JSON.stringify(list), 'utf8');
      env.IBRA_LIST = listFile;
    }
    const enc = Buffer.from(script, 'utf16le').toString('base64');
    currentPS = execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', enc],
      { windowsHide: true, timeout, maxBuffer: 64 * 1024 * 1024, env }, (err, stdout, stderr) => {
        currentPS = null;
        if (listFile) fs.rm(listFile, { force: true }, () => {});
        const txt = String(stdout || '').trim();
        const start = txt.indexOf('{');
        if (start < 0) return resolve({ ok: false, error: (err && err.message) || String(stderr || 'no output') });
        try { resolve({ ok: true, data: JSON.parse(txt.slice(start)) }); }
        catch (e) { resolve({ ok: false, error: 'JSON: ' + e.message }); }
      });
  });
}

function hashFile(p) {
  return new Promise((resolve, reject) => {
    const h = crypto.createHash('sha256');
    fs.createReadStream(p).on('error', reject).on('data', (d) => h.update(d)).on('end', () => resolve(h.digest('hex')));
  });
}
async function freeBytes(p) { try { const s = await fsp.statfs(p); return s.bavail * s.bsize; } catch { return null; } }
const stamp = () => { const d = new Date(); const z = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}${z(d.getMonth() + 1)}${z(d.getDate())}-${z(d.getHours())}${z(d.getMinutes())}${z(d.getSeconds())}`; };

module.exports = function registerMsi({ ipcMain, send, readJSON, writeJSON, addHistory, ENV, dialog, getWin, shell }) {
  const INSTALLER_DIR = process.env.IBRA_MSI_DIR || path.join(ENV.W, 'Installer');
  const instLow = low(INSTALLER_DIR);
  let last = null;
  let cancelled = false;
  let busy = false;

  const settings = () => readJSON('settings.json', {});
  const exclusions = () => new Set(toArr(settings().msiExclude).map((p) => String(p).toLowerCase()));
  const defaultBackupRoot = () => {
    for (const d of ['D:\\', 'E:\\', 'F:\\']) if (IS_WIN && fs.existsSync(d)) return path.join(d, 'IBRA Installer Backup');
    return path.join(IS_WIN ? (ENV.SYS + path.sep) : os.homedir(), 'IBRA Installer Backup');
  };
  const backupRoot = () => settings().msiBackupDir || defaultBackupRoot();
  const progress = (stage, done, total, extra) => send('msi:progress', { stage, done, total, ...extra });

  function opLog(entry) {
    const line = JSON.stringify({ at: new Date().toISOString(), ...entry }) + '\n';
    try { fs.mkdirSync(backupRoot(), { recursive: true }); fs.appendFileSync(path.join(backupRoot(), 'operations.log'), line, 'utf8'); } catch { }
    addHistory({ kind: 'msi-' + entry.op, count: entry.count, freed: entry.freed, failed: entry.failed, sample: entry.sample });
  }

  // ───── التعداد (حقيقي أو وهمي للاختبار) ─────
  async function enumerate() {
    if (FAKE) {
      const f = JSON.parse(fs.readFileSync(FAKE, 'utf8'));
      return { ok: f.ok !== false, admin: f.admin !== false, mutex: !!f.mutex, inProgress: !!f.inProgress, regOk: f.regOk !== false, errors: toArr(f.errors), products: toArr(f.products), patches: toArr(f.patches), reg: toArr(f.reg) };
    }
    if (!IS_WIN) return { ok: false, admin: false, errors: ['Windows only'], products: [], patches: [], reg: [], regOk: false };
    const r = await runPS(PS_ENUM);
    if (!r.ok) return { ok: false, admin: false, errors: [r.error], products: [], patches: [], reg: [], regOk: false };
    const d = r.data;
    return { ok: !!d.ok, admin: !!d.admin, mutex: !!d.mutex, inProgress: !!d.inProgress, regOk: !!d.regOk, errors: toArr(d.errors), products: toArr(d.products), patches: toArr(d.patches), reg: toArr(d.reg) };
  }

  function buildUsed(en) {
    const used = new Map();
    const prodName = new Map();
    for (const p of en.products) if (p.code) prodName.set(String(p.code).toUpperCase(), p.name || '');
    const add = (pkg, info) => {
      if (!pkg) return;
      const k = low(pkg);
      const cur = used.get(k);
      if (cur) { if (!cur.sources.includes(info.source)) cur.sources.push(info.source); if (!cur.product && info.product) cur.product = info.product; }
      else used.set(k, { ...info, sources: [info.source] });
    };
    for (const p of en.products) add(p.pkg, { source: 'api', kind: 'product', product: p.name, code: p.code });
    for (const p of en.patches) add(p.pkg, { source: 'api', kind: 'patch', product: (p.name ? p.name + ' — ' : '') + (prodName.get(String(p.product || '').toUpperCase()) || ''), code: p.code });
    for (const r of en.reg) add(r.pkg, { source: 'registry', kind: r.kind, product: r.name || '', code: r.key });
    return used;
  }

  function verdict(en) {
    const reasons = [];
    if (!en.admin) reasons.push('notAdmin');
    if (!en.ok) reasons.push('apiFailed');
    if (!en.regOk) reasons.push('regFailed');
    if (en.mutex || en.inProgress) reasons.push('installRunning');
    if (cancelled) reasons.push('cancelled');
    return { complete: reasons.length === 0, reasons };
  }

  async function dirSize(dir) {
    let size = 0, count = 0;
    let ents = [];
    try { ents = await fsp.readdir(dir, { withFileTypes: true }); } catch { return { size, count, error: true }; }
    for (const e of ents) {
      const p = path.join(dir, e.name);
      try {
        const st = await fsp.lstat(p);
        if (st.isSymbolicLink()) continue; // لا نتبع الروابط
        if (st.isDirectory()) { const s = await dirSize(p); size += s.size; count += s.count; }
        else if (st.isFile()) { size += st.size; count++; }
      } catch { }
    }
    return { size, count };
  }

  // ═════════════ الفحص ═════════════
  async function scan() {
    cancelled = false;
    const t0 = Date.now();
    progress('enum', 0, 3);
    const en = await enumerate();
    if (cancelled) return { ok: false, cancelled: true };
    const used = buildUsed(en);
    const v = verdict(en);
    progress('files', 1, 3);

    const excl = exclusions();
    const items = [];
    let ents = [];
    try { ents = await fsp.readdir(INSTALLER_DIR, { withFileTypes: true }); }
    catch (e) { return { ok: false, error: 'listFailed', detail: e.code || e.message, enumErrors: en.errors }; }
    let i = 0;
    for (const e of ents) {
      if (cancelled) break;
      if (++i % 50 === 0) progress('files', i, ents.length);
      const p = path.join(INSTALLER_DIR, e.name);
      const it = { path: p, name: e.name, ext: path.extname(e.name).toLowerCase(), isDir: false, size: 0, created: 0, modified: 0, cat: 'unknown', reason: 'unknownStat', product: '', sources: [] };
      let st;
      try { st = await fsp.lstat(p); } catch { items.push(it); continue; }
      it.created = st.birthtimeMs || st.ctimeMs; it.modified = st.mtimeMs;
      if (st.isSymbolicLink()) { it.cat = 'excluded'; it.reason = 'exclLink'; items.push(it); continue; }
      if (st.isDirectory()) {
        const s = await dirSize(p);
        it.isDir = true; it.size = s.size; it.count = s.count; it.cat = 'excluded'; it.reason = 'exclDir';
        items.push(it); continue;
      }
      it.size = st.size;
      const k = low(p);
      const u = used.get(k);
      if (u) { it.cat = 'used'; it.reason = u.sources.includes('api') ? 'usedApi' : 'usedReg'; it.product = u.product || ''; it.sources = u.sources; it.kindOf = u.kind; it.code = u.code; }
      else if (excl.has(k)) { it.cat = 'excluded'; it.reason = 'exclUser'; }
      else if (it.ext !== '.msi' && it.ext !== '.msp') { it.cat = 'excluded'; it.reason = 'exclType'; }
      else if (Date.now() - Math.max(it.modified, it.created) < RECENT_MS) { it.cat = 'excluded'; it.reason = 'exclRecent'; }
      else if (v.complete) { it.cat = 'orphan'; it.reason = 'orphan'; }
      else { it.cat = 'unknown'; it.reason = 'unknownIncomplete'; }
      items.push(it);
    }
    if (cancelled) { progress('done', 3, 3); return { ok: false, cancelled: true }; }

    // معلومات الملخص للملفات المرشحة والمجهولة (حتى تعرف من أي برنامج)
    progress('info', 2, 3);
    const need = items.filter((x) => (x.cat === 'orphan' || x.cat === 'unknown') && (x.ext === '.msi' || x.ext === '.msp')).map((x) => x.path).slice(0, 3000);
    if (need.length && IS_WIN && !FAKE) {
      const r = await runPS(PS_SUMMARY, need);
      if (r.ok && r.data) for (const x of items) { const s = r.data[x.path]; if (s) x.hint = s.subject || s.title || ''; x.author = s ? s.author : ''; }
    } else if (FAKE) {
      const f = JSON.parse(fs.readFileSync(FAKE, 'utf8'));
      for (const x of items) if (f.summary && f.summary[x.name]) x.hint = f.summary[x.name];
    }

    const sum = (cat) => items.filter((x) => x.cat === cat).reduce((a, b) => a + b.size, 0);
    const totals = { size: items.reduce((a, b) => a + b.size, 0), files: items.reduce((a, b) => a + (b.isDir ? b.count : 1), 0), used: sum('used'), orphan: sum('orphan'), excluded: sum('excluded'), unknown: sum('unknown') };
    totals.recoverable = v.complete ? totals.orphan : 0;
    const counts = {}; for (const x of items) counts[x.cat] = (counts[x.cat] || 0) + 1;
    last = { ok: true, at: Date.now(), elapsed: Date.now() - t0, dir: INSTALLER_DIR, complete: v.complete, reasons: v.reasons, admin: en.admin, errors: en.errors, products: en.products.length, patches: en.patches.length, regEntries: en.reg.length, items, totals, counts };
    progress('done', 3, 3);
    return last;
  }

  // ═════════════ إعادة التحقق قبل أي نقل أو حذف ═════════════
  async function reverify(paths) {
    const en = await enumerate();
    const v = verdict(en);
    if (!v.complete) return { ok: false, reasons: v.reasons, errors: en.errors };
    const used = buildUsed(en);
    const excl = exclusions();
    const allowed = [], rejected = [];
    for (const p of paths) {
      const k = low(p);
      if (low(path.dirname(p)) !== instLow) { rejected.push({ path: p, reason: 'outside' }); continue; }
      const ext = path.extname(p).toLowerCase();
      if (ext !== '.msi' && ext !== '.msp') { rejected.push({ path: p, reason: 'exclType' }); continue; }
      if (used.has(k)) { rejected.push({ path: p, reason: 'nowUsed' }); continue; }
      if (excl.has(k)) { rejected.push({ path: p, reason: 'exclUser' }); continue; }
      let st;
      try { st = await fsp.lstat(p); } catch { rejected.push({ path: p, reason: 'missing' }); continue; }
      if (st.isSymbolicLink() || !st.isFile()) { rejected.push({ path: p, reason: 'exclLink' }); continue; }
      try { if (low(await fsp.realpath(p)) !== k) { rejected.push({ path: p, reason: 'exclLink' }); continue; } } catch { rejected.push({ path: p, reason: 'missing' }); continue; }
      if (Date.now() - Math.max(st.mtimeMs, st.birthtimeMs || 0) < RECENT_MS) { rejected.push({ path: p, reason: 'exclRecent' }); continue; }
      allowed.push({ path: p, size: st.size, mtime: st.mtimeMs, atime: st.atimeMs, birth: st.birthtimeMs, mode: st.mode });
    }
    return { ok: true, allowed, rejected };
  }

  // ───── النسخ الاحتياطي: السجل (journal) ─────
  const manifestPath = (session) => path.join(session, 'manifest.json');
  const readManifest = (session) => { try { return JSON.parse(fs.readFileSync(manifestPath(session), 'utf8')); } catch { return null; } };
  const writeManifest = (session, m) => { const tmp = manifestPath(session) + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(m, null, 1), 'utf8'); fs.renameSync(tmp, manifestPath(session)); };

  async function getAcls(paths) {
    if (FAKE || !IS_WIN) return Object.fromEntries(paths.map((p) => [p, 'O:BAG:SYD:(A;;FA;;;SY)(A;;FA;;;BA)']));
    const r = await runPS(PS_GETACL, paths);
    return r.ok && r.data ? r.data : {};
  }
  async function setAcls(items) {
    if (FAKE || !IS_WIN || !items.length) return {};
    const r = await runPS(PS_SETACL, items);
    return r.ok && r.data ? r.data : {};
  }
  async function removeOriginal(p) {
    try { await fsp.unlink(p); return null; }
    catch (e) {
      if (e.code === 'EPERM' || e.code === 'EACCES') {
        // ملف للقراءة فقط: نشيل الخاصية فقط (مو كسر قفل)
        try { await fsp.chmod(p, 0o666); await fsp.unlink(p); return null; } catch (e2) { return e2.code || e2.message; }
      }
      return e.code || e.message;
    }
  }

  async function moveToBackup(paths) {
    if (busy) return { ok: false, error: 'busy' };
    busy = true;
    try {
      const root = backupRoot();
      const rl = low(root);
      if (rl === instLow || rl.startsWith(instLow + path.sep) || rl.startsWith(low(ENV.W) + path.sep)) return { ok: false, error: 'badBackupDir' };
      progress('verify', 0, 1);
      const rv = await reverify(paths);
      if (!rv.ok) return { ok: false, error: 'verifyFailed', reasons: rv.reasons, errors: rv.errors };
      if (!rv.allowed.length) return { ok: false, error: 'nothingAllowed', rejected: rv.rejected };
      const total = rv.allowed.reduce((a, b) => a + b.size, 0);
      fs.mkdirSync(root, { recursive: true });
      const free = await freeBytes(root);
      if (free != null && free < total * 1.05 + 50 * 2 ** 20) return { ok: false, error: 'noSpace', need: total, free };

      const session = path.join(root, stamp());
      const filesDir = path.join(session, 'files');
      fs.mkdirSync(filesDir, { recursive: true });
      const acls = await getAcls(rv.allowed.map((a) => a.path));
      const m = { app: 'IBRA CLEAN UP', type: 'windows-installer-backup', version: 1, created: new Date().toISOString(), source: INSTALLER_DIR, entries: [] };
      writeManifest(session, m);
      const freeBefore = await freeBytes(INSTALLER_DIR);
      const res = { moved: 0, failed: 0, bytes: 0, failures: [], rejected: rv.rejected, session };
      let n = 0;
      for (const a of rv.allowed) {
        n++; progress('move', n, rv.allowed.length, { file: path.basename(a.path) });
        let name = path.basename(a.path);
        if (fs.existsSync(path.join(filesDir, name))) name = path.parse(name).name + '-' + n + path.extname(name);
        const dest = path.join(filesDir, name);
        const e = { original: a.path, backup: 'files/' + name, size: a.size, mtime: a.mtime, atime: a.atime, birth: a.birth, mode: a.mode, sddl: acls[a.path] || '', sha256: '', state: 'pending', at: new Date().toISOString() };
        m.entries.push(e); writeManifest(session, m);
        try {
          e.sha256 = await hashFile(a.path);
          e.state = 'copying'; writeManifest(session, m);
          await fsp.copyFile(a.path, dest, fs.constants.COPYFILE_EXCL);
          const st = await fsp.stat(dest);
          const h2 = await hashFile(dest);
          if (st.size !== a.size || h2 !== e.sha256) throw Object.assign(new Error('hash mismatch'), { code: 'VERIFY' });
          e.state = 'verified'; writeManifest(session, m);
          const err = await removeOriginal(a.path);
          if (err) { await fsp.rm(dest, { force: true }); e.state = 'aborted'; e.error = err; res.failed++; res.failures.push({ path: a.path, error: err }); }
          else { e.state = 'moved'; e.movedAt = new Date().toISOString(); res.moved++; res.bytes += a.size; }
        } catch (err) {
          try { await fsp.rm(dest, { force: true }); } catch { }
          e.state = 'aborted'; e.error = err.code || err.message; res.failed++; res.failures.push({ path: a.path, error: e.error });
        }
        writeManifest(session, m);
      }
      const freeAfter = await freeBytes(INSTALLER_DIR);
      res.freed = freeBefore != null && freeAfter != null ? Math.max(0, freeAfter - freeBefore) : res.bytes;
      res.sameDrive = low(root).slice(0, 2) === instLow.slice(0, 2);
      if (!res.moved) { try { fs.rmSync(session, { recursive: true, force: true }); } catch { } res.session = null; }
      opLog({ op: 'move', count: res.moved, failed: res.failed, freed: res.bytes, session: res.session, sample: rv.allowed.slice(0, 8).map((a) => a.path) });
      if (last) markGone(rv.allowed.map((a) => a.path).filter((p) => !res.failures.find((f) => f.path === p)));
      return { ok: true, ...res };
    } finally { busy = false; progress('done', 1, 1); }
  }

  async function deletePermanent(paths) {
    if (busy) return { ok: false, error: 'busy' };
    busy = true;
    try {
      progress('verify', 0, 1);
      const rv = await reverify(paths);
      if (!rv.ok) return { ok: false, error: 'verifyFailed', reasons: rv.reasons, errors: rv.errors };
      const freeBefore = await freeBytes(INSTALLER_DIR);
      const res = { deleted: 0, failed: 0, bytes: 0, failures: [], rejected: rv.rejected };
      let n = 0;
      for (const a of rv.allowed) {
        n++; progress('delete', n, rv.allowed.length, { file: path.basename(a.path) });
        const err = await removeOriginal(a.path);
        if (err) { res.failed++; res.failures.push({ path: a.path, error: err }); } else { res.deleted++; res.bytes += a.size; }
      }
      const freeAfter = await freeBytes(INSTALLER_DIR);
      res.freed = freeBefore != null && freeAfter != null ? Math.max(0, freeAfter - freeBefore) : res.bytes;
      opLog({ op: 'delete', count: res.deleted, failed: res.failed, freed: res.bytes, sample: rv.allowed.slice(0, 8).map((a) => a.path) });
      if (last) markGone(rv.allowed.map((a) => a.path).filter((p) => !res.failures.find((f) => f.path === p)));
      return { ok: true, ...res };
    } finally { busy = false; progress('done', 1, 1); }
  }

  function markGone(paths) {
    const g = new Set(paths.map(low));
    last.items = last.items.filter((x) => !g.has(low(x.path)));
    const sum = (cat) => last.items.filter((x) => x.cat === cat).reduce((a, b) => a + b.size, 0);
    Object.assign(last.totals, { size: last.items.reduce((a, b) => a + b.size, 0), files: last.items.reduce((a, b) => a + (b.isDir ? b.count : 1), 0), used: sum('used'), orphan: sum('orphan'), excluded: sum('excluded'), unknown: sum('unknown') });
    last.totals.recoverable = last.complete ? last.totals.orphan : 0;
    last.counts = {}; for (const x of last.items) last.counts[x.cat] = (last.counts[x.cat] || 0) + 1;
  }

  // ───── إصلاح أي عملية نقل انقطعت (كهرباء، إغلاق مفاجئ) ─────
  async function recoverSession(session, m) {
    let changed = false;
    for (const e of m.entries) {
      if (!['pending', 'copying', 'verified', 'restoring'].includes(e.state)) continue;
      const bk = path.join(session, e.backup);
      const origExists = fs.existsSync(e.original);
      const bkExists = fs.existsSync(bk);
      if (e.state === 'restoring') {
        // الاستعادة انقطعت: إذا الأصلي رجع وسليم نحذف النسخة، وإلا نرجعها "منقولة"
        if (origExists && e.sha256) { try { if (await hashFile(e.original) === e.sha256) { e.state = 'restored'; if (bkExists) await fsp.rm(bk, { force: true }); changed = true; continue; } } catch { } try { await fsp.rm(e.original, { force: true }); } catch { } }
        e.state = bkExists ? 'moved' : 'lost'; changed = true; continue;
      }
      if (origExists) { if (bkExists) await fsp.rm(bk, { force: true }); e.state = 'aborted'; e.error = 'interrupted'; changed = true; }
      else if (bkExists && e.sha256) {
        let ok = false; try { ok = (await hashFile(bk)) === e.sha256; } catch { }
        e.state = ok ? 'moved' : 'lost'; changed = true;
      } else { e.state = 'lost'; changed = true; }
    }
    if (changed) writeManifest(session, m);
  }

  async function listBackups() {
    const root = backupRoot();
    const out = [];
    let dirs = [];
    try { dirs = await fsp.readdir(root, { withFileTypes: true }); } catch { return { root, sessions: [] }; }
    for (const d of dirs) {
      if (!d.isDirectory()) continue;
      const session = path.join(root, d.name);
      const m = readManifest(session);
      if (!m || m.type !== 'windows-installer-backup') continue;
      await recoverSession(session, m);
      const entries = m.entries.filter((e) => e.state !== 'aborted');
      out.push({ session, name: d.name, created: m.created, entries, movedCount: entries.filter((e) => e.state === 'moved').length, movedSize: entries.filter((e) => e.state === 'moved').reduce((a, b) => a + b.size, 0) });
    }
    out.sort((a, b) => b.name.localeCompare(a.name));
    return { root, sessions: out, free: await freeBytes(root) };
  }

  async function restore(session, originals, overwrite) {
    if (busy) return { ok: false, error: 'busy' };
    busy = true;
    try {
      const m = readManifest(session);
      if (!m) return { ok: false, error: 'noManifest' };
      await recoverSession(session, m);
      const want = originals ? new Set(originals.map(low)) : null;
      const res = { restored: 0, failed: 0, conflicts: [], failures: [] };
      const aclItems = [];
      const list = m.entries.filter((e) => e.state === 'moved' && (!want || want.has(low(e.original))));
      let n = 0;
      for (const e of list) {
        n++; progress('restore', n, list.length, { file: path.basename(e.original) });
        const bk = path.join(session, e.backup);
        if (low(path.dirname(e.original)) !== low(m.source)) { res.failed++; res.failures.push({ path: e.original, error: 'badPath' }); continue; }
        if (fs.existsSync(e.original) && !overwrite) { res.conflicts.push(e.original); continue; }
        try {
          if (await hashFile(bk) !== e.sha256) throw Object.assign(new Error('backup corrupted'), { code: 'BACKUP_CORRUPT' });
          e.state = 'restoring'; writeManifest(session, m);
          if (fs.existsSync(e.original)) { await fsp.chmod(e.original, 0o666).catch(() => {}); await fsp.unlink(e.original); }
          await fsp.copyFile(bk, e.original, fs.constants.COPYFILE_EXCL);
          if (await hashFile(e.original) !== e.sha256) throw Object.assign(new Error('restore verify failed'), { code: 'VERIFY' });
          try { await fsp.utimes(e.original, new Date(e.atime || e.mtime), new Date(e.mtime)); } catch { }
          try { if (e.mode && !(e.mode & 0o200)) await fsp.chmod(e.original, 0o444); } catch { }
          if (e.sddl) aclItems.push({ path: e.original, sddl: e.sddl });
          await fsp.rm(bk, { force: true });
          e.state = 'restored'; e.restoredAt = new Date().toISOString(); res.restored++;
        } catch (err) {
          if (e.state === 'restoring') { try { await fsp.rm(e.original, { force: true }); } catch { } e.state = 'moved'; }
          res.failed++; res.failures.push({ path: e.original, error: err.code || err.message });
        }
        writeManifest(session, m);
      }
      const aclRes = await setAcls(aclItems);
      res.aclErrors = Object.entries(aclRes).filter(([, v]) => v !== 'ok').map(([p, v]) => ({ path: p, error: v }));
      opLog({ op: 'restore', count: res.restored, failed: res.failed, session, sample: list.slice(0, 8).map((e) => e.original) });
      return { ok: true, ...res };
    } finally { busy = false; progress('done', 1, 1); }
  }

  async function purgeBackup(session, originals) {
    const m = readManifest(session);
    if (!m) return { ok: false, error: 'noManifest' };
    const want = originals ? new Set(originals.map(low)) : null;
    let purged = 0, bytes = 0;
    for (const e of m.entries) {
      if (e.state !== 'moved' || (want && !want.has(low(e.original)))) continue;
      try { await fsp.rm(path.join(session, e.backup), { force: true }); e.state = 'purged'; e.purgedAt = new Date().toISOString(); purged++; bytes += e.size; } catch { }
    }
    writeManifest(session, m);
    if (!m.entries.some((e) => e.state === 'moved')) { try { fs.rmSync(path.join(session, 'files'), { recursive: true, force: true }); } catch { } }
    opLog({ op: 'purge', count: purged, freed: bytes, session });
    return { ok: true, purged, bytes };
  }

  function reportRows() {
    return (last ? last.items : []).map((x) => ({ category: x.cat, file: x.name, path: x.path, size: x.size, type: x.isDir ? 'folder' : x.ext, created: x.created ? new Date(x.created).toISOString() : '', product: x.product || x.hint || '', reason: x.reason, sources: (x.sources || []).join('+') }));
  }
  async function exportReport(format, labels) {
    if (!last) return { ok: false, error: 'noScan' };
    const ext = format === 'html' ? 'html' : 'csv';
    const r = await dialog.showSaveDialog(getWin(), { defaultPath: `IBRA-Installer-Report-${stamp()}.${ext}`, filters: [{ name: ext.toUpperCase(), extensions: [ext] }] });
    if (r.canceled || !r.filePath) return { ok: false, canceled: true };
    const rows = reportRows();
    const L = labels || {};
    if (ext === 'csv') {
      const q = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
      const head = ['category', 'file', 'path', 'size', 'type', 'created', 'product', 'reason', 'sources'];
      const lines = [head.map((h) => q(L[h] || h)).join(',')].concat(rows.map((row) => head.map((h) => q(h === 'category' ? (L['c_' + row[h]] || row[h]) : h === 'reason' ? (L['r_' + row[h]] || row[h]) : row[h])).join(',')));
      fs.writeFileSync(r.filePath, '\ufeff' + lines.join('\r\n'), 'utf8');
    } else {
      const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      const fmt = (b) => { const u = ['B', 'KB', 'MB', 'GB', 'TB']; let i = 0; b = +b || 0; while (b >= 1024 && i < 4) { b /= 1024; i++; } return b.toFixed(i ? 2 : 0) + ' ' + u[i]; };
      const t = last.totals;
      const html = `<!doctype html><html dir="${L.dir || 'rtl'}"><meta charset="utf-8"><title>IBRA CLEAN UP — Windows Installer</title>
<style>body{font-family:Segoe UI,Tahoma,sans-serif;background:#0c0a0b;color:#eee;padding:24px}h1{color:#d4af37}table{border-collapse:collapse;width:100%;font-size:13px}td,th{border-bottom:1px solid #333;padding:6px 8px;text-align:start}.used{color:#3ddc97}.orphan{color:#ff9f43}.unknown{color:#aaa}.excluded{color:#8aa0ff}.k{display:inline-block;margin:0 14px 10px 0;background:#1a1416;padding:10px 14px;border-radius:10px}</style>
<h1>IBRA CLEAN UP — ${esc(L.title || 'Windows Installer')}</h1><p>${esc(last.dir)} • ${new Date(last.at).toLocaleString()} • ${last.complete ? '✓' : '⚠ ' + esc(last.reasons.join(', '))}</p>
<div>${[['total', t.size], ['used', t.used], ['orphan', t.orphan], ['excluded', t.excluded], ['unknown', t.unknown], ['recoverable', t.recoverable]].map(([k, v]) => `<span class="k">${esc(L['t_' + k] || k)}: <b>${fmt(v)}</b></span>`).join('')}</div>
<table><tr>${['category', 'file', 'size', 'type', 'created', 'product', 'reason'].map((h) => `<th>${esc(L[h] || h)}</th>`).join('')}</tr>
${rows.map((row) => `<tr class="${row.category}"><td>${esc(L['c_' + row.category] || row.category)}</td><td>${esc(row.file)}</td><td>${fmt(row.size)}</td><td>${esc(row.type)}</td><td>${esc(row.created.slice(0, 10))}</td><td>${esc(row.product)}</td><td>${esc(L['r_' + row.reason] || row.reason)}</td></tr>`).join('')}</table>
<p style="color:#888">IBRAPROGRAM — برمجة وتطوير ابراهيم الخزرجي</p></html>`;
      fs.writeFileSync(r.filePath, html, 'utf8');
    }
    return { ok: true, file: r.filePath };
  }

  // ═════════════ IPC ═════════════
  ipcMain.handle('msi:scan', async () => { if (busy) return { ok: false, error: 'busy' }; busy = true; try { return await scan(); } catch (e) { return { ok: false, error: 'exception', detail: String(e && e.message || e) }; } finally { busy = false; } });
  ipcMain.handle('msi:cancel', () => { cancelled = true; if (currentPS) try { currentPS.kill(); } catch { } return true; });
  ipcMain.handle('msi:last', () => last);
  ipcMain.handle('msi:move', (_e, paths) => moveToBackup(paths).catch((e) => ({ ok: false, error: 'exception', detail: String(e.message || e) })));
  ipcMain.handle('msi:delete', (_e, paths) => deletePermanent(paths).catch((e) => ({ ok: false, error: 'exception', detail: String(e.message || e) })));
  ipcMain.handle('msi:backups', () => listBackups());
  ipcMain.handle('msi:restore', (_e, { session, originals, overwrite }) => restore(session, originals, overwrite).catch((e) => ({ ok: false, error: 'exception', detail: String(e.message || e) })));
  ipcMain.handle('msi:purge', (_e, { session, originals }) => purgeBackup(session, originals));
  ipcMain.handle('msi:exclude', (_e, { paths, on }) => {
    const s = readJSON('settings.json', {});
    const set = new Set(toArr(s.msiExclude).map((p) => String(p).toLowerCase()));
    for (const p of paths) on ? set.add(low(p)) : set.delete(low(p));
    writeJSON('settings.json', { ...s, msiExclude: [...set] });
    if (last) for (const x of last.items) if (paths.map(low).includes(low(x.path))) {
      if (on && (x.cat === 'orphan' || x.cat === 'unknown')) { x.prevCat = x.cat; x.prevReason = x.reason; x.cat = 'excluded'; x.reason = 'exclUser'; }
      else if (!on && x.reason === 'exclUser') { x.cat = x.prevCat || (last.complete ? 'orphan' : 'unknown'); x.reason = x.prevReason || (last.complete ? 'orphan' : 'unknownIncomplete'); }
    }
    if (last) markGone([]);
    return { ok: true, last };
  });
  ipcMain.handle('msi:backupDir', () => ({ dir: backupRoot(), isDefault: !settings().msiBackupDir }));
  ipcMain.handle('msi:pickBackupDir', async () => {
    const r = await dialog.showOpenDialog(getWin(), { properties: ['openDirectory', 'createDirectory'] });
    if (r.canceled || !r.filePaths[0]) return null;
    let dir = r.filePaths[0];
    const dl = low(dir);
    if (dl === instLow || dl.startsWith(instLow + path.sep) || dl === low(ENV.W) || dl.startsWith(low(ENV.W) + path.sep)) return { error: 'badBackupDir' };
    if (path.basename(dir) !== 'IBRA Installer Backup') dir = path.join(dir, 'IBRA Installer Backup');
    writeJSON('settings.json', { ...readJSON('settings.json', {}), msiBackupDir: dir });
    return { dir, free: await freeBytes(r.filePaths[0]) };
  });
  ipcMain.handle('msi:export', (_e, { format, labels }) => exportReport(format, labels));
  ipcMain.handle('msi:openLocation', (_e, p) => { shell.showItemInFolder(p); return true; });

  return { INSTALLER_DIR };
};

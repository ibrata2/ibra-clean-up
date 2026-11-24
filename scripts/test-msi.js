// اختبار محرك تنظيف Windows Installer بمجلد وهمي (بدون ويندوز)
const path = require('path'), fs = require('fs'), os = require('os'), assert = require('assert');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ibra-msi-'));
const inst = path.join(root, 'Windows', 'Installer'); fs.mkdirSync(path.join(inst, '$PatchCache$', 'x'), { recursive: true });
const old = (p, size) => { fs.writeFileSync(p, crypto.randomBytes(size)); const t = (Date.now() - 30 * 864e5) / 1000; fs.utimesSync(p, t, t); };
const crypto = require('crypto');
old(path.join(inst, 'used1.msi'), 3000); old(path.join(inst, 'patchUsed.msp'), 2000); old(path.join(inst, 'regOnly.msi'), 1500);
old(path.join(inst, 'orphan1.msi'), 5000); old(path.join(inst, 'orphan2.msp'), 7000); old(path.join(inst, 'icon.ico'), 100);
fs.writeFileSync(path.join(inst, 'fresh.msi'), 'new'); const later = Date.now() / 1000 + 3600; fs.utimesSync(path.join(inst, 'fresh.msi'), later, later); old(path.join(inst, '$PatchCache$', 'x', 'big.cab'), 9000);
const fake = path.join(root, 'fake.json');
const enumData = (extra = {}) => fs.writeFileSync(fake, JSON.stringify({ admin: true, products: [{ code: '{A}', name: 'Office', pkg: path.join(inst, 'used1.msi') }], patches: [{ code: '{P}', product: '{A}', name: 'KB123', pkg: path.join(inst, 'patchUsed.msp') }], reg: [{ kind: 'product', key: 'X', pkg: path.join(inst, 'REGONLY.MSI'), name: 'Old App' }], summary: { 'orphan1.msi': 'Visual C++ 2010' }, ...extra }));
enumData();
process.env.IBRA_MSI_FAKE = fake; process.env.IBRA_MSI_DIR = inst; process.env.IBRA_MSI_RECENT_MS = '1';
const handlers = {}; const store = {}; const hist = [];
require('../src/msi.js')({ ipcMain: { handle: (n, f) => { handlers[n] = f; } }, send: () => {}, readJSON: (f, d) => store[f] || d, writeJSON: (f, v) => { store[f] = v; }, addHistory: (e) => hist.push(e), ENV: { W: path.join(root, 'Windows'), SYS: root }, dialog: {}, getWin: () => null, shell: {} });
store['settings.json'] = { msiBackupDir: path.join(root, 'Backup', 'IBRA Installer Backup') };
const call = (n, a) => handlers[n]({}, a);
(async () => {
  let r = await call('msi:scan');
  const cat = Object.fromEntries(r.items.map((x) => [x.name, x.cat + ':' + x.reason]));
  console.log(cat);
  assert.equal(cat['used1.msi'], 'used:usedApi'); assert.equal(cat['patchUsed.msp'], 'used:usedApi'); assert.equal(cat['regOnly.msi'], 'used:usedReg');
  assert.equal(cat['orphan1.msi'], 'orphan:orphan'); assert.equal(cat['icon.ico'], 'excluded:exclType'); assert.equal(cat['fresh.msi'], 'excluded:exclRecent'); assert.equal(cat['$PatchCache$'], 'excluded:exclDir');
  assert.equal(r.complete, true); assert.equal(r.totals.recoverable, 12000);
  assert.equal(r.items.find((x) => x.name === 'orphan1.msi').hint, 'Visual C++ 2010');
  console.log('✓ التصنيف صحيح، المسترجع', r.totals.recoverable);

  // محاولة نقل ملف مستخدم + ملف خارج المجلد → مرفوضة
  r = await call('msi:move', [path.join(inst, 'used1.msi'), path.join(root, 'fake.json')]);
  assert.equal(r.ok, false); console.log('✓ رفض نقل الملف المستخدم والملف الخارجي:', r.error);

  // بين الفحص والنقل صار orphan2 مستخدم → لازم ينرفض
  enumData({ patches: [{ code: '{P}', product: '{A}', pkg: path.join(inst, 'patchUsed.msp') }, { code: '{Q}', product: '{A}', pkg: path.join(inst, 'orphan2.msp') }] });
  r = await call('msi:move', [path.join(inst, 'orphan1.msi'), path.join(inst, 'orphan2.msp')]);
  assert.equal(r.moved, 1); assert.equal(r.rejected[0].reason, 'nowUsed'); assert(fs.existsSync(path.join(inst, 'orphan2.msp')));
  assert(!fs.existsSync(path.join(inst, 'orphan1.msi')));
  console.log('✓ إعادة التحقق قبل النقل: نُقل 1 ورُفض الملف اللي صار مستخدم');
  enumData();

  // فحص ناقص → لا يوجد يتيم ويمنع النقل
  enumData({ regOk: false, errors: ['Registry: denied'] });
  r = await call('msi:scan');
  assert.equal(r.complete, false); assert(!r.items.some((x) => x.cat === 'orphan')); assert.equal(r.totals.recoverable, 0);
  const mv = await call('msi:move', [path.join(inst, 'orphan2.msp')]);
  assert.equal(mv.ok, false); assert.equal(mv.error, 'verifyFailed');
  console.log('✓ فحص ناقص: كل المرشحة صارت غير معروفة والتنظيف موقوف', r.reasons);
  enumData({ mutex: true });
  assert.equal((await call('msi:move', [path.join(inst, 'orphan2.msp')])).error, 'verifyFailed');
  console.log('✓ تثبيت جاري: التنظيف موقوف');
  enumData();

  // النسخة الاحتياطية والاستعادة
  let b = await call('msi:backups');
  const s = b.sessions[0]; assert.equal(s.movedCount, 1);
  const e = s.entries[0]; assert.equal(e.state, 'moved'); assert.equal(e.sha256.length, 64); assert(e.sddl);
  // تعارض: ملف بنفس الاسم رجع
  fs.writeFileSync(path.join(inst, 'orphan1.msi'), 'other');
  r = await call('msi:restore', { session: s.session });
  assert.equal(r.restored, 0); assert.equal(r.conflicts.length, 1); console.log('✓ ما يكتب فوق ملف موجود بدون موافقة');
  fs.rmSync(path.join(inst, 'orphan1.msi'));
  r = await call('msi:restore', { session: s.session });
  assert.equal(r.restored, 1);
  const h = crypto.createHash('sha256').update(fs.readFileSync(path.join(inst, 'orphan1.msi'))).digest('hex');
  assert.equal(h, e.sha256); console.log('✓ الاستعادة: البصمة مطابقة للأصل');

  // انقطاع الكهرباء أثناء النقل: الأصلي موجود والنسخة نصها
  r = await call('msi:scan');
  const sess = path.join(root, 'Backup', 'IBRA Installer Backup', '20990101-000000'); fs.mkdirSync(path.join(sess, 'files'), { recursive: true });
  fs.writeFileSync(path.join(sess, 'files', 'orphan1.msi'), 'half');
  fs.writeFileSync(path.join(sess, 'manifest.json'), JSON.stringify({ type: 'windows-installer-backup', source: inst, entries: [{ original: path.join(inst, 'orphan1.msi'), backup: 'files/orphan1.msi', size: 5000, sha256: e.sha256, state: 'copying' }] }));
  b = await call('msi:backups');
  assert(!fs.existsSync(path.join(sess, 'files', 'orphan1.msi'))); assert(fs.existsSync(path.join(inst, 'orphan1.msi')));
  console.log('✓ عملية نقل منقطعة: انحذفت النسخة الناقصة والأصلي سليم');

  // استثناء
  r = await call('msi:exclude', { paths: [path.join(inst, 'orphan1.msi')], on: true });
  assert.equal(r.last.items.find((x) => x.name === 'orphan1.msi').cat, 'excluded');
  assert.equal((await call('msi:move', [path.join(inst, 'orphan1.msi')])).error, 'nothingAllowed');
  console.log('✓ الملف المستثنى ما ينلمس');
  await call('msi:exclude', { paths: [path.join(inst, 'orphan1.msi')], on: false });

  // الحذف النهائي
  r = await call('msi:delete', [path.join(inst, 'orphan1.msi')]);
  assert.equal(r.deleted, 1); assert(fs.existsSync(path.join(inst, 'used1.msi')));
  console.log('✓ الحذف النهائي لليتيم فقط، والمستخدم باقي');
  console.log('السجل:', hist.map((x) => x.kind).join(', '));
  fs.rmSync(root, { recursive: true, force: true });
  console.log('\nكل الاختبارات نجحت ✅');
})().catch((e) => { console.error('❌', e); process.exit(1); });

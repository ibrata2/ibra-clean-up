// يشغل البرنامج على حاسبة وهمية ويصور كل الشاشات (للاختبار فقط)
const path = require('path'), fs = require('fs');
const ROOT = process.env.FAKE_ROOT; const OUT = process.env.SHOT_OUT;
const U = path.join(ROOT, 'Users', 'Ibrahim');
const mk = (rel, size, ageDays = 3) => { const p = path.join(U, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); const fd = fs.openSync(p, 'w'); fs.ftruncateSync(fd, Math.round(size)); fs.closeSync(fd); const tm = (Date.now() - ageDays * 864e5) / 1000; fs.utimesSync(p, tm, tm); };
const G = 2 ** 30, M = 2 ** 20;
if (!fs.existsSync(U)) {
  mk('AppData/Local/Google/Chrome/User Data/OptGuideOnDeviceModel/2025.8.8.1141/weights.bin', 3.9 * G, 60);
  mk('AppData/Local/Google/Chrome/User Data/Default/Cache/Cache_Data/data_1', 820 * M);
  mk('AppData/Local/Google/Chrome/User Data/Default/Code Cache/js/a', 260 * M);
  mk('AppData/Local/CapCut/User Data/Projects/com.lveditor.draft/0915 ريل بيرسنك/Resources/video.mp4', 4.2 * G, 70);
  mk('AppData/Local/CapCut/User Data/Projects/com.lveditor.draft/1012 تاتو اسد/Resources/v.mp4', 2.6 * G, 40);
  mk('AppData/Local/CapCut/User Data/Projects/com.lveditor.draft/1120 اعلان/draft_content.json', 12 * M, 4);
  mk('AppData/Local/CapCut/User Data/Cache/effect/a.zip', 1.7 * G);
  mk('AppData/Roaming/Apple Computer/MobileSync/Backup/00008110-001A/Manifest.db', 38 * G, 400);
  mk('AppData/Roaming/Apple Computer/MobileSync/Backup/00008030-0042/Manifest.db', 21 * G, 30);
  mk('AppData/Roaming/Apple Computer/iTunes/iPhone Software Updates/iPhone15,2_18.1_Restore.ipsw', 7.4 * G, 120);
  mk('AppData/Roaming/3uTools/Firmware/iPhone_18.0.ipsw', 6.9 * G, 90);
  mk('AppData/Roaming/3uTools/Apps/WhatsApp.ipa', 310 * M, 200);
  mk('AppData/Roaming/Adobe/Common/Media Cache Files/clip.cfa', 5.1 * G, 20);
  mk('AppData/Roaming/Adobe/Common/Peak Files/x.pek', 600 * M);
  mk('AppData/Local/Temp/setup_tmp/big.tmp', 2.3 * G);
  mk('AppData/Local/Temp/a.log', 40 * M);
  mk('AppData/Local/npm-cache/_cacache/content/x', 1.4 * G);
  mk('AppData/Local/electron-builder/Cache/nsis.7z', 900 * M);
  mk('AppData/Local/NVIDIA/DXCache/s.bin', 480 * M);
  mk('AppData/Roaming/Telegram Desktop/tdata/user_data/media_cache/m', 3.3 * G);
  mk('AppData/Roaming/Claude/vm_bundles/claudevm.bundle/rootfs.img', 9.8 * G, 10);
  mk('.cache/huggingface/hub/models--x/blobs/model.safetensors', 13 * G, 150);
  mk('Downloads/ChromeSetup.exe', 140 * M, 200); mk('Downloads/Win11_24H2_Arabic.iso', 5.6 * G, 300); mk('Downloads/project.zip', 820 * M, 60);
  mk('Videos/ريلز/تاتو 2026.mp4', 3.1 * G, 20); mk('Pictures/Studio/photo.psd', 900 * M);
  mk('Documents/Projects/ibra-zombie/node_modules/electron/dist/electron.exe', 210 * M, 30);
  mk('Documents/Projects/ibra-tank/node_modules/three/build/three.js', 160 * M, 50);
  mk('.android/avd/Pixel_7.avd/userdata-qemu.img', 7.8 * G, 220);
  fs.mkdirSync(path.join(ROOT, 'Users', 'Public', 'Documents'), { recursive: true });
}
const INST = path.join(ROOT, 'Windows', 'Installer');
if (!fs.existsSync(INST)) {
  fs.mkdirSync(path.join(INST, '$PatchCache$', 'Managed'), { recursive: true });
  const f = (n, size, days) => { const p = path.join(INST, n); const fd = fs.openSync(p, 'w'); fs.ftruncateSync(fd, Math.round(size / (process.env.SHOT_PROMO ? 1 : 64))); fs.closeSync(fd); const t = (Date.now() - days * 864e5) / 1000; fs.utimesSync(p, t, t); };
  f('1a2b3c.msi', 180 * M, 400); f('4d5e6f.msp', 1.2 * G, 300); f('7a8b9c.msp', 850 * M, 500); f('d00d1e.msi', 95 * M, 200);
  f('ab12cd.msp', 2.4 * G, 700); f('ef34aa.msp', 1.7 * G, 650); f('99ff00.msi', 420 * M, 900); f('c0ffee.msp', 640 * M, 800); f('SourceHash{1234}', 2 * M, 50);
  f('$PatchCache$/Managed/big.cab', 3.1 * G, 600); f('fresh01.msi', 30 * M, 0);
}
const fakeMsi = path.join(ROOT, 'msi-fake.json');
fs.writeFileSync(fakeMsi, JSON.stringify({ admin: true,
  products: [{ code: '{90160000-0011}', name: 'Microsoft Office Professional Plus 2016', pkg: path.join(INST, '1a2b3c.msi') }, { code: '{A1B2}', name: 'Adobe Acrobat Reader', pkg: path.join(INST, 'd00d1e.msi') }],
  patches: [{ code: '{P1}', product: '{90160000-0011}', name: 'Security Update KB5002', pkg: path.join(INST, '4d5e6f.msp') }],
  reg: [{ kind: 'patch', key: 'P9', pkg: path.join(INST, '7a8b9c.msp'), name: '' }],
  summary: { 'ab12cd.msp': 'Microsoft Office 2013 Service Pack 1', 'ef34aa.msp': 'Visual Studio 2017 Update', '99ff00.msi': 'Microsoft Visual C++ 2010 Redistributable', 'c0ffee.msp': 'Adobe Reader XI Update' } }));
process.env.IBRA_MSI_FAKE = fakeMsi; process.env.IBRA_MSI_DIR = INST;
process.env.USERPROFILE = U; process.env.LOCALAPPDATA = path.join(U, 'AppData/Local'); process.env.APPDATA = path.join(U, 'AppData/Roaming');
process.env.TEMP = path.join(U, 'AppData/Local/Temp'); process.env.SystemDrive = ROOT; process.env.WINDIR = path.join(ROOT, 'Windows'); process.env.PROGRAMDATA = path.join(ROOT, 'ProgramData');
const { app, protocol } = require('electron');
require('../src/main.js');
app.whenReady().then(() => {
  const icon = fs.readFileSync(path.join(__dirname, '..', 'build', 'icon.png'));
  const apps = [
    { name: 'IBRA CLEAN UP', slug: 'ibra-clean-up', tagline: 'محلل المساحة ومنظف الكاش لويندوز', categories: ['برامج'], icon: 'https://ibraprogram.netlify.app/img/1.png', screenshots: [], createdAt: '2026-11-24T10:00:00Z', version: '1.1.0', changelog: 'قسم مخلفات التثبيت + ستايلات جديدة', downloads: [{ platform: 'Windows', url: 'https://ibraprogram.netlify.app/files/IBRA-CLEAN-UP-Setup-1.1.0.exe' }] },
    { name: 'IBRA ZOMBIE', slug: 'ibra-zombie', tagline: 'لعبة نجاة من الزومبي بشوارع العراق', categories: ['ألعاب'], icon: 'https://ibraprogram.netlify.app/img/2.png', screenshots: ['https://ibraprogram.netlify.app/img/s2.png'], createdAt: '2026-11-23T10:00:00Z' },
    { name: 'IBRA PLAYER', slug: 'ibra-player', tagline: 'مشغل ميديا بستايلات زجاجية', categories: ['برامج'], icon: 'https://ibraprogram.netlify.app/img/3.png', screenshots: [], createdAt: '2026-11-16T10:00:00Z' },
  ];
  protocol.handle('https', (req) => {
    const u = new URL(req.url);
    if (u.pathname === '/api/apps') return new Response(JSON.stringify(apps), { headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } });
    if (u.pathname.startsWith('/files/')) { const b = Buffer.alloc(2.5 * 1024 * 1024); b.write('MZ'); return new Response(b, { headers: { 'content-type': 'application/octet-stream', 'content-length': String(b.length) } }); }
    if (u.pathname.startsWith('/img/')) return new Response(icon, { headers: { 'content-type': 'image/png' } });
    return new Response('nope', { status: 404 });
  });
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
app.on('browser-window-created', (_e, win) => {
  win.webContents.once('did-finish-load', async () => {
    win.setSize(1360, 860);
    const js = (c) => win.webContents.executeJavaScript(c);
    const shot = async (n) => { await wait(700); if (process.env.SHOT_PROMO) { await js(`S.isAdmin=true; renderSidebar(); if (S.view==='installer') renderInstaller();`); await wait(700); } if (process.env.SHOT_PROMO) await js(fs.readFileSync(path.join(__dirname, 'promo-fix.js'), 'utf8') + '(' + JSON.stringify(ROOT) + ')'); if (process.env.SHOT_PROMO) await wait(400); const img = await win.webContents.capturePage(); fs.writeFileSync(path.join(OUT, n + '.png'), img.toPNG()); };
    try {
      await wait(2500); console.log('TYPES', await js(`[typeof renderSettings, typeof renderInstaller, typeof placeStoreSlider, typeof ask, [...document.scripts].map(x=>x.src.split('/').pop()).join(',')].join(' ')`)); await shot('1-home-slider'); if (process.env.SHOT_PROMO) {
        const U2 = JSON.stringify(U);
        await js(`document.querySelector('[data-act=scan-me]').click()`); await wait(3000);
        await js(`(async()=>{ const id = await window.ibra.findPath(${JSON.stringify(path.join(U,'AppData','Roaming'))}); S.sel=null; await openNode(id); document.querySelector('.li[data-dir]').click(); })()`); await wait(1000); await shot('p2-analyzer');
        await js(`go('clean'); scanJunk()`); await wait(2500);
        await js(`['chrome-ai','capcut-drafts'].forEach(i=>S.openCats.add(i)); S.junkChecked.add('user-temp'); S.junkChecked.add('chrome'); S.junkChecked.add('npm'); renderClean()`); await wait(900); await shot('p3-clean');
        await js(`go('installer')`); await wait(400); await js(`document.querySelector('[data-mact=scan]').click()`); await wait(2500);
        await js(`S.msi.res.items.filter(x=>x.cat==='orphan').slice(0,3).forEach(x=>S.msi.sel.set(x.path,{path:x.path,size:x.size})); renderInstaller()`); await wait(800); await shot('p4-installer');
        await js(`go('large')`); await wait(700); await shot('p5-large');
        await js(`go('settings')`); await wait(800); await shot('p6-settings');
        await js(`document.querySelector('[data-theme-pick="glass-white-red"]').click()`); await wait(500); await js(`go('analyzer')`); await wait(900); await shot('p7-white-red');
        await js(`document.querySelector('[data-theme-pick]')||0; go('settings')`); await wait(300); await js(`document.querySelector('[data-theme-pick="glass-red"]').click()`); await wait(300);
        app.quit(); return;
      } if (process.env.SHOT_QUICK) { await js(`document.querySelector('[data-act=lang]').click()`); await wait(800); await shot('1b-home-en'); app.quit(); return; }
      await js(`go('installer')`); await wait(500); await shot('2-installer-empty');
      await js(`document.querySelector('[data-mact=scan]').click()`); await wait(2500); await shot('3-installer-scan');
      await js(`S.msi.filter='orphan'; S.msi.res.items.filter(x=>x.cat==='orphan').forEach(x=>S.msi.sel.set(x.path,{path:x.path,size:x.size})); renderInstaller()`); await wait(600);
      await js(`document.querySelector('[data-mdetail]').click()`); await wait(400); await shot('4-installer-orphans');
      await js(`document.querySelector('[data-mact=move]').click()`); await wait(800); await shot('5-move-confirm');
      await js(`document.querySelector('[data-a=yes]').click()`); for (let k = 0; k < 40; k++) { await wait(500); if (await js('!S.msi.prog')) break; } await wait(800); await shot('6-after-move');
      console.log('AFTER-MOVE', await js(`JSON.stringify({orphans:S.msi.res.counts.orphan||0, rec:S.msi.res.totals.recoverable})`));
      await js(`S.msi.tab='backups'; renderInstaller()`); await wait(1200); await shot('7-backups');
      await js(`document.querySelector('[data-mrestore][data-orig]').click()`); await wait(2500); await shot('8-after-restore-one');
      await js(`go('settings')`); await wait(800); await shot('9-settings');
      await js(`document.querySelector('[data-uact=check]').click()`); await wait(1500); await shot('10-update-available');
      await js(`document.querySelector('[data-uact=download]').click()`); await wait(500); await shot('11-update-ask');
      await js(`document.querySelector('[data-a=yes]').click()`); await wait(2500); await shot('12-update-install-ask');
      await js(`document.querySelector('[data-a=no]').click()`); await wait(300);
      for (const th of ['glass-white-red','glass-white','glass-clear','dark','light']) { await js(`document.querySelector('[data-theme-pick="${th}"]').click()`); await wait(500); await js(`go('home')`); await wait(900); await shot('th-' + th + '-home'); await js(`go('installer')`); await wait(700); await shot('th-' + th + '-installer'); await js(`go('settings')`); await wait(400); }
      await js(`document.querySelector('[data-theme-pick="glass-red"]').click()`); await wait(300);
      await js(`document.querySelector('[data-lang-pick=en]').click()`); await wait(400); await js(`go('installer')`); await wait(700); await shot('20-english-installer');
      await js(`document.querySelector('[data-lang-pick]')||0; go('home')`); await wait(1500); await shot('21-english-home');
    } catch (e) { console.error('SHOT ERROR', e); }
    app.quit();
  });
  win.webContents.on('console-message', (_e, lvl, msg) => { if (lvl >= 2) console.log('CONSOLE', msg); });
});

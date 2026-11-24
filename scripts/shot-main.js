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
process.env.USERPROFILE = U; process.env.LOCALAPPDATA = path.join(U, 'AppData/Local'); process.env.APPDATA = path.join(U, 'AppData/Roaming');
process.env.TEMP = path.join(U, 'AppData/Local/Temp'); process.env.SystemDrive = ROOT; process.env.WINDIR = path.join(ROOT, 'Windows'); process.env.PROGRAMDATA = path.join(ROOT, 'ProgramData');
const { app } = require('electron');
require('../src/main.js');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
app.on('browser-window-created', (_e, win) => {
  win.webContents.once('did-finish-load', async () => {
    win.setSize(1360, 860);
    const js = (c) => win.webContents.executeJavaScript(c);
    const shot = async (n) => { await wait(700); const img = await win.webContents.capturePage(); fs.writeFileSync(path.join(OUT, n + '.png'), img.toPNG()); };
    try {
      await wait(1200); await shot('1-home');
      await js(`document.querySelector('[data-act=scan-users]').click()`); await wait(2500);
      await shot('2-analyzer-users');
      await js(`(async()=>{ const id = await window.ibra.findPath(${JSON.stringify(U)}); S.sel=null; await openNode(id); })()`); await wait(800);
      await shot('3-analyzer-profile');
      await js(`(async()=>{ const id = await window.ibra.findPath(${JSON.stringify(path.join(U,'AppData','Roaming'))}); S.sel=null; await openNode(id); document.querySelector('.li[data-dir]').click(); })()`); await wait(800);
      await shot('4-analyzer-roaming');
      await js(`go('clean'); scanJunk()`); await wait(2500);
      await js(`['chrome-ai','capcut-drafts'].forEach(i=>S.openCats.add(i)); S.junkChecked.add('user-temp'); S.junkChecked.add('chrome'); renderClean()`); await wait(800);
      await shot('5-clean');
      await js(`document.getElementById('main').scrollTop = 900`); await shot('6-clean-scroll');
      await js(`S.subChecked.set('capcut-drafts', new Map([[S.junk['capcut-drafts'].items[0].path, {path:S.junk['capcut-drafts'].items[0].path, size:S.junk['capcut-drafts'].items[0].size}]])); renderClean()`); await wait(400);
      await js(`document.querySelector('[data-act=clean-sel]').click()`); await shot('6b-clean-confirm');
      await js(`document.querySelector('[data-m=yes]').click()`); await wait(3000);
      await js(`document.getElementById('main').scrollTop = 0`); await shot('6c-clean-after');
      console.log('AFTER', await js(`JSON.stringify({temp:S.junk['user-temp'].size, chrome:S.junk['chrome'].size, capcut:S.junk['capcut-drafts'].items.map(i=>i.name)})`));
      await js(`go('large')`); await shot('7-large');
      await js(`go('smart')`); await wait(800); await shot('8-smart');
      await js(`go('types')`); await shot('9-types');
      await js(`(async()=>{ const id = await window.ibra.findPath(${JSON.stringify(path.join(U,'Downloads'))}); go('analyzer'); S.sel=null; await openNode(id); S.aTab='files'; await loadDirFiles(); renderAnalyzer(); })()`); await wait(1000);
      await js(`document.querySelector('[data-act=del-one]') ; document.querySelector('.li[data-file] .cb').click()`); await wait(300);
      await js(`document.querySelector('[data-act=del-an]').click()`); await shot('10-confirm');
      await js(`document.querySelector('[data-m=yes]').click()`); await wait(1500); await shot('11-after-delete');
      await js(`go('history')`); await shot('12-history');
      await js(`go('about')`); await shot('13-about');
      await js(`document.querySelector('[data-act=lang]').click()`); await wait(300); await js(`go('clean')`); await shot('14-english-clean');
    } catch (e) { console.error('SHOT ERROR', e); }
    app.quit();
  });
  win.webContents.on('console-message', (_e, lvl, msg) => { if (lvl >= 2) console.log('CONSOLE', msg); });
});

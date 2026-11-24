// يبني ملف التثبيت Setup.exe من مجلد dist/win-unpacked باستخدام NSIS
const { execFileSync } = require('child_process');
const path = require('path'), fs = require('fs'), os = require('os');
const version = require('../package.json').version;
let makensis = 'makensis', env = { ...process.env };
const cached = path.join(os.homedir(), '.cache', 'electron-builder', 'nsis', 'nsis-3.0.4.1');
const local = process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'electron-builder', 'Cache', 'nsis', 'nsis-3.0.4.1');
if (process.platform === 'win32') {
  for (const c of [process.env.NSIS_PATH, 'C:\\Program Files (x86)\\NSIS\\makensis.exe', 'C:\\Program Files\\NSIS\\makensis.exe', local && path.join(local, 'Bin', 'makensis.exe')]) if (c && fs.existsSync(c)) { makensis = c; break; }
} else if (fs.existsSync(path.join(cached, 'linux', 'makensis'))) {
  makensis = path.join(cached, 'linux', 'makensis'); env.NSISDIR = cached;
}
const flag = process.platform === 'win32' ? '/' : '-';
execFileSync(makensis, [`${flag}DVERSION=${version}`, `${flag}V2`, path.join(__dirname, '..', 'build', 'installer.nsi')], { stdio: 'inherit', env });
console.log('Installer ready: dist/IBRA-CLEAN-UP-Setup-' + version + '.exe');

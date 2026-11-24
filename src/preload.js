const { contextBridge, ipcRenderer } = require('electron');

const inv = (ch) => (...a) => ipcRenderer.invoke(ch, ...a);
const on = (ch) => (cb) => { const f = (_e, d) => cb(d); ipcRenderer.on(ch, f); return () => ipcRenderer.off(ch, f); };

contextBridge.exposeInMainWorld('ibra', {
  info: inv('app:info'), saveSettings: inv('settings:save'), drives: inv('drives:list'),
  scanTree: inv('scan:tree'), cancelScan: inv('scan:cancel'), onScanProgress: on('scan:progress'),
  node: inv('tree:node'), findPath: inv('tree:findPath'), dirFiles: inv('dir:files'),
  junkDefs: inv('junk:defs'), junkScan: inv('junk:scan'), junkClean: inv('junk:clean'),
  onJunkProgress: on('junk:progress'), onJunkResult: on('junk:result'),
  prevent: inv('junk:prevent'), preventUndo: inv('junk:preventUndo'), preventState: inv('junk:preventState'),
  deletePaths: inv('delete:paths'), checkDeletable: inv('delete:check'),
  openFolder: inv('shell:openFolder'), openFile: inv('shell:openFile'), external: inv('shell:external'),
  copy: inv('clipboard:write'), pickFolder: inv('dialog:pickFolder'),
  cleanmgr: inv('tools:cleanmgr'), storageSense: inv('tools:storageSense'), relaunchAdmin: inv('admin:relaunch'),
  setTheme: inv('theme:set'), onThemeChanged: on('theme:changed'),
  msiScan: inv('msi:scan'), msiCancel: inv('msi:cancel'), msiLast: inv('msi:last'), onMsiProgress: on('msi:progress'),
  msiMove: inv('msi:move'), msiDelete: inv('msi:delete'), msiBackups: inv('msi:backups'), msiRestore: inv('msi:restore'), msiPurge: inv('msi:purge'),
  msiExclude: inv('msi:exclude'), msiBackupDir: inv('msi:backupDir'), msiPickBackupDir: inv('msi:pickBackupDir'), msiExport: inv('msi:export'), msiOpenLocation: inv('msi:openLocation'),
  updCheck: inv('update:check'), updDownload: inv('update:download'), updCancel: inv('update:cancel'), updInstall: inv('update:install'), updOpenPage: inv('update:openPage'), onUpdProgress: on('update:progress'),
  history: inv('history:get'), clearHistory: inv('history:clear'),
});

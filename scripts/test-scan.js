// اختبار سريع لمحرك الفحص
const { Worker } = require('worker_threads');
const path = require('path'), fs = require('fs'), os = require('os');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ibra-'));
const mk = (p, n) => { fs.mkdirSync(path.dirname(path.join(tmp, p)), { recursive: true }); fs.writeFileSync(path.join(tmp, p), Buffer.alloc(n)); };
mk('U/Videos/a.mp4', 5000); mk('U/proj/node_modules/x/index.js', 300); mk('U/proj/node_modules/y/node_modules/z.js', 200);
mk('U/AppData/Local/CapCut/User Data/Projects/com.lveditor.draft/0101/Resources/v.mp4', 7000);
mk('U/AppData/Local/CapCut/User Data/Projects/com.lveditor.draft/0202/draft.json', 100);
mk('U/AppData/Local/Google/Chrome/User Data/OptGuideOnDeviceModel/2024/weights.bin', 9000);
fs.symlinkSync(path.join(tmp, 'U'), path.join(tmp, 'U/loop'));
const w = new Worker(path.join(__dirname, '../src/scanner-worker.js'));
let step = 0;
w.on('message', (m) => {
  if (m.type === 'tree-done') {
    const r = m.result; console.log('root size', r.nodes.size[0], 'files', r.stats.files, 'dirs', r.stats.dirs, 'links', r.stats.links);
    console.log('top', r.top.slice(0, 3).map(t => path.basename(t.path) + ':' + t.size));
    console.log('findings', r.findings.map(f => f.kind + ':' + r.nodes.names[f.id] + ':' + r.nodes.size[f.id]));
    const { CATEGORIES } = require('../src/junk-defs');
    const L = path.join(tmp, 'U/AppData/Local');
    const cats = CATEGORIES.filter(c => ['capcut-drafts', 'chrome-ai'].includes(c.id)).map(c => ({ ...c, paths: c.paths.map(p => p.replace('{L}', L).replace(/\\/g, '/')) }));
    w.postMessage({ type: 'scanJunk', cats });
  } else if (m.type === 'junk-result') console.log('junk', m.id, m.size, m.count, m.items.map(i => i.name + ':' + i.size));
  else if (m.type === 'junk-done') { w.terminate(); fs.rmSync(tmp, { recursive: true }); }
  else if (m.type === 'error') { console.error(m.message); w.terminate(); }
});
w.postMessage({ type: 'scanTree', root: path.join(tmp, 'U') });

// IBRA CLEAN UP — واجهة قسم Windows Installer Cleaner
'use strict';
S.msi = { res: null, filter: 'all', sel: new Map(), prog: null, tab: 'scan', backups: null, open: new Set(), dir: null };

const MSI_COL = { used: 'var(--safe)', orphan: '#ff9f43', unknown: '#9a9a9a', excluded: 'var(--system)' };
const stageText = (p) => p ? t('st_' + p.stage) + (p.total > 1 && !['enum', 'done'].includes(p.stage) ? ` (${p.done}/${p.total})` : '') + (p.file ? ` — ${p.file}` : '') : '';
api.onMsiProgress((p) => {
  S.msi.prog = p.stage === 'done' ? null : p;
  const el = $('#msiProg');
  if (el && S.msi.prog) { el.querySelector('.txt').textContent = stageText(p); el.querySelector('i').style.width = (p.total ? Math.max(4, p.done / p.total * 100) : 30) + '%'; }
  else if (S.view === 'installer' && !S.msi.prog) { /* سيعاد الرسم بعد انتهاء العملية */ }
  else if (S.view === 'installer' && !el) renderInstaller();
});

function msiReasonsHTML(r) {
  return `<ul style="margin:6px 0 0;padding-inline-start:20px">${r.reasons.map((x) => `<li>${esc(t('rs_' + x))}</li>`).join('')}${(r.errors || []).slice(0, 3).map((e) => `<li class="dim mono" style="font-size:11.5px">${esc(e)}</li>`).join('')}</ul>`;
}

async function renderInstaller() {
  const el = $('#v-installer');
  const m = S.msi;
  if (!m.dir) m.dir = await api.msiBackupDir();
  if (!m.res) { const l = await api.msiLast(); if (l) m.res = l; }
  const r = m.res;
  const head = `
    <div class="row wrap">
      <div class="grow"><h1>${t('msiT')}</h1><p class="lead" style="margin:4px 0 0;max-width:820px;line-height:1.8">${t('msiD')}</p></div>
    </div>
    <div class="row wrap" style="margin:14px 0">
      <div class="tabs" style="margin:0"><div class="tab ${m.tab === 'scan' ? 'on' : ''}" data-mtab="scan">${t('tabScan')}</div><div class="tab ${m.tab === 'backups' ? 'on' : ''}" data-mtab="backups">${icon('restore', 'style="width:14px;height:14px;vertical-align:-2px"')} ${t('tabBackups')}</div></div>
      <span class="grow"></span>
      ${!S.isAdmin ? `<button class="btn" data-act="admin">${icon('shield')}${t('runAdmin')}</button>` : ''}
      ${m.tab === 'scan' && r ? `<button class="btn ghost" data-mact="export-csv">${t('msiExportCsv')}</button><button class="btn ghost" data-mact="export-html">${t('msiExportHtml')}</button>` : ''}
      ${m.tab === 'scan' ? `<button class="btn primary" data-mact="scan" ${m.prog ? 'disabled' : ''}>${icon('scan')}${r ? t('msiRescan') : t('msiScan')}</button>` : ''}
    </div>
    ${!S.isAdmin ? `<div class="explain review row">${icon('shield', 'style="width:20px;height:20px;flex-shrink:0"')}<span>${t('msiAdminNeed')}</span></div>` : ''}
    ${m.prog ? `<div class="card" id="msiProg" style="margin:12px 0"><div class="row"><span class="spin"></span><span class="txt grow">${esc(stageText(m.prog))}</span>${m.prog.stage === 'enum' || m.prog.stage === 'files' || m.prog.stage === 'info' ? `<button class="btn sm danger" data-mact="cancel">${t('cancel')}</button>` : ''}</div><div class="pbar" style="margin-top:10px;height:8px"><i style="width:${m.prog.total ? Math.max(4, m.prog.done / m.prog.total * 100) : 30}%"></i></div></div>` : ''}`;

  if (m.tab === 'backups') { el.innerHTML = head + await backupsHTML(); return; }
  if (!r) { el.innerHTML = head + `<div class="empty">${icon('installer')}<p>${esc(t('msiD'))}</p></div>`; return; }

  const T = r.totals;
  const stat = (k, v, col, isCount) => `<div class="card stat" style="${col ? `border-color:${col}55` : ''}"><div class="v ltr" style="${col ? `color:${col}` : ''}">${isCount ? v.toLocaleString('en') : fmt(v)}</div><div class="l">${t('t_' + k)}</div></div>`;
  const cats = ['all', 'used', 'orphan', 'excluded', 'unknown'];
  const rows = r.items.filter((x) => m.filter === 'all' || x.cat === m.filter).sort((a, b) => b.size - a.size);
  const canClean = r.complete;
  el.innerHTML = head + `
    <div class="explain ${r.complete ? 'safe' : 'review'}" style="margin:12px 0">${r.complete ? t('msiComplete', r.products, r.patches, r.regEntries) : `<b>${t('msiIncomplete')}</b>${msiReasonsHTML(r)}`}</div>
    <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(128px,1fr))">
      ${stat('total', T.size)}${stat('files', T.files, null, true)}${stat('used', T.used, MSI_COL.used)}${stat('orphan', T.orphan, MSI_COL.orphan)}${stat('excluded', T.excluded, MSI_COL.excluded)}${stat('unknown', T.unknown, MSI_COL.unknown)}${stat('recoverable', T.recoverable, 'var(--gold)')}
    </div>
    <div class="row wrap" style="margin:16px 0 10px">${cats.map((c) => `<span class="chip f ${m.filter === c ? 'on' : ''}" data-mfilter="${c}">${c !== 'all' ? `<i style="width:9px;height:9px;border-radius:50%;background:${MSI_COL[c]};display:inline-block"></i>` : ''}${t('c_' + c)} (${c === 'all' ? r.items.length : (r.counts[c] || 0)})</span>`).join('')}</div>
    <div class="card" style="padding:6px"><div class="list">
      <div class="li head" style="grid-template-columns:22px 12px minmax(0,1.3fr) minmax(0,1fr) 64px 86px 92px minmax(0,1.3fr) auto"><span></span><span></span><span>${t('colFile')}</span><span>${t('colProduct')}</span><span>${t('colType')}</span><span style="text-align:end">${t('size')}</span><span>${t('colCreated')}</span><span>${t('colReason')}</span><span></span></div>
      ${rows.slice(0, 1500).map((x) => {
        const open = m.open.has(x.path);
        const selectable = canClean && x.cat === 'orphan';
        return `<div class="li" style="grid-template-columns:22px 12px minmax(0,1.3fr) minmax(0,1fr) 64px 86px 92px minmax(0,1.3fr) auto;cursor:default">
          ${selectable ? `<input type="checkbox" class="cb" data-msel="${esc(x.path)}" data-size="${x.size}" ${m.sel.has(x.path) ? 'checked' : ''}>` : '<span></span>'}
          <i style="width:10px;height:10px;border-radius:50%;background:${MSI_COL[x.cat]}" title="${t('c_' + x.cat)}"></i>
          <div class="nm ltr" style="text-align:start" title="${esc(x.path)}">${esc(x.name)}</div>
          <div class="pth" dir="auto" style="direction:auto;text-align:start;color:var(--muted)">${esc(x.product || (x.hint ? t('likely') + ' ' + x.hint : '—'))}</div>
          <div class="dim ltr">${x.isDir ? '📁' : esc(x.ext.slice(1).toUpperCase())}</div>
          <div class="sz">${fmt(x.size)}</div>
          <div class="dim" style="font-size:12px">${fmtDate(x.created)}</div>
          <div style="font-size:12px;color:${MSI_COL[x.cat]}">${esc(t('r_' + x.reason))}</div>
          <div class="row" style="gap:4px">
            <button class="btn sm icon" title="${t('viewDetails')}" data-mdetail="${esc(x.path)}">${icon('about')}</button>
            <button class="btn sm icon" title="${t('openLoc')}" data-mopen="${esc(x.path)}">${icon('open')}</button>
            ${x.cat === 'orphan' || x.cat === 'unknown' ? `<button class="btn sm" data-mexcl="${esc(x.path)}" data-on="1">${t('exclude')}</button>` : x.reason === 'exclUser' ? `<button class="btn sm" data-mexcl="${esc(x.path)}" data-on="0">${t('unexclude')}</button>` : ''}
          </div>
        </div>${open ? `<div class="explain" style="margin:0 10px 8px"><div class="pathbox" style="margin:0 0 8px">${esc(x.path)}</div>
          <dl class="kv" style="margin:0"><dt>${t('c_all')}</dt><dd style="text-align:start;direction:auto">${t('c_' + x.cat)}</dd>
          <dt>${t('colReason')}</dt><dd style="text-align:start;direction:auto">${esc(t('r_' + x.reason))}</dd>
          ${x.sources && x.sources.length ? `<dt>${t('sources')}</dt><dd>${x.sources.map((s) => s === 'api' ? 'Windows Installer API' : 'Registry').join(' + ')}</dd>` : ''}
          ${x.code ? `<dt>${t('code')}</dt><dd class="mono">${esc(x.code)}</dd>` : ''}
          ${x.product ? `<dt>${t('colProduct')}</dt><dd style="direction:auto">${esc(x.product)}</dd>` : ''}
          ${x.hint ? `<dt>${t('likely')}</dt><dd style="direction:auto">${esc(x.hint)}${x.author ? ' — ' + esc(x.author) : ''}</dd>` : ''}
          <dt>${t('modified')}</dt><dd>${fmtDate(x.modified)}</dd></dl></div>` : ''}`;
      }).join('') || '<div class="empty">—</div>'}
    </div></div>
    ${m.sel.size && canClean ? (() => { let tot = 0; for (const v of m.sel.values()) tot += v.size; return `<div class="sticky-bar"><b>${m.sel.size}</b> ${t('selected')}<span class="tot">${fmt(tot)}</span>
      <span class="dim" style="font-size:12px">${t('backupTo')} <span class="ltr">${esc(m.dir.dir)}</span></span><span class="grow"></span>
      <button class="btn ghost" data-mact="clear">${t('clearSel')}</button>
      <button class="btn danger" data-mact="delete">${icon('trash')}${t('deletePerm')}</button>
      <button class="btn primary" data-mact="move">${icon('archive')}${t('moveBackup')}</button></div>`; })() : ''}`;
}

async function backupsHTML() {
  const b = await api.msiBackups();
  S.msi.backups = b;
  const st = (s) => ({ moved: 'safe', restored: 'system', purged: 'admin', lost: 'keep', aborted: 'admin' }[s] || 'admin');
  return `<div class="card row wrap" style="margin-bottom:12px">${icon('archive', 'style="width:22px;height:22px;color:var(--gold)"')}
      <div class="grow"><b>${t('bkRoot')}</b><div class="pth" style="font-size:12.5px;text-align:start">${esc(b.root)}</div></div>
      ${b.free != null ? `<span class="muted">${t('freeOn')} <b class="ltr">${fmt(b.free)}</b></span>` : ''}
      <button class="btn" data-mact="pickdir">${t('change')}</button><button class="btn" data-mopen="${esc(b.root)}" data-dir="1">${icon('open')}${t('open')}</button></div>
    <div class="explain review">${t('bk90')}<br><span class="dim">${t('noRestorePoint')}</span></div>
    ${b.sessions.length ? b.sessions.map((s) => {
      const days = Math.floor((Date.now() - new Date(s.created).getTime()) / 864e5);
      return `<div class="card" style="margin-top:12px">
        <div class="row wrap"><div class="grow"><b class="ltr">${esc(s.name)}</b> <span class="muted">• ${t('daysOld', days)} • ${s.movedCount} ${t('files')} • <span class="ltr">${fmt(s.movedSize)}</span></span></div>
          ${s.movedCount ? `<button class="btn" data-mrestore="${esc(s.session)}">${icon('restore')}${t('restoreAll')}</button><button class="btn danger" data-mpurge="${esc(s.session)}" data-days="${days}">${icon('trash')}${t('purge')}</button>` : ''}</div>
        <div class="list" style="margin-top:8px;max-height:320px;overflow:auto">${s.entries.map((e) => `<div class="li" style="grid-template-columns:minmax(0,1fr) 86px 100px auto;cursor:default">
          <div><div class="nm ltr" style="text-align:start">${esc(e.original.split(/[\\/]/).pop())}</div><div class="pth mono" style="font-size:10.5px">SHA-256 ${esc((e.sha256 || '').slice(0, 24))}…</div></div>
          <div class="sz">${fmt(e.size)}</div><div><span class="chip ${st(e.state)}">${t('s_' + e.state)}</span></div>
          <div>${e.state === 'moved' ? `<button class="btn sm" data-mrestore="${esc(s.session)}" data-orig="${esc(e.original)}">${t('restore')}</button>` : ''}</div></div>`).join('')}</div></div>`;
    }).join('') : `<div class="empty">${t('bkNone')}</div>`}`;
}

// نافذة تأكيد عامة
function ask({ title, body, ok, danger, check }) {
  return new Promise((resolve) => {
    const box = $('#modalBox');
    box.innerHTML = `<h2>${title}</h2><div style="line-height:1.8">${body}</div>
      ${check ? `<label class="row" style="margin-top:14px;align-items:flex-start;cursor:pointer"><input type="checkbox" class="cb" id="askCheck" style="margin-top:3px"><span>${check}</span></label>` : ''}
      <div class="row" style="margin-top:18px;justify-content:flex-end"><button class="btn" data-a="no">${t('cancelBtn')}</button><button class="btn ${danger ? 'danger' : 'primary'}" data-a="yes" ${check ? 'disabled' : ''}>${ok}</button></div>`;
    const modal = $('#modal'); modal.classList.add('on');
    const chk = $('#askCheck'); if (chk) chk.addEventListener('change', () => { box.querySelector('[data-a=yes]').disabled = !chk.checked; });
    const onClick = (e) => {
      if (e.target.closest('#askCheck') || e.target.closest('label')) return;
      const b = e.target.closest('[data-a]');
      if (b || e.target === modal) { if (b && b.disabled) return; modal.classList.remove('on'); modal.removeEventListener('click', onClick); resolve(!!(b && b.dataset.a === 'yes')); }
    };
    modal.addEventListener('click', onClick);
  });
}
const msiErr = (r) => '⚠️ ' + t('e_' + (r.error || 'exception')) + (r.reasons ? '<br>' + r.reasons.map((x) => esc(t('rs_' + x))).join('<br>') : '') + (r.detail ? `<br><span class="dim mono" style="font-size:11px">${esc(r.detail)}</span>` : '');

async function msiAction(a, d) {
  const m = S.msi;
  if (a === 'scan') { m.sel.clear(); m.prog = { stage: 'enum', done: 0, total: 3 }; renderInstaller(); const r = await api.msiScan(); m.prog = null; if (r.ok) m.res = r; else if (!r.cancelled) toast(msiErr(r), 7000); return renderInstaller(); }
  if (a === 'cancel') { await api.msiCancel(); return; }
  if (a === 'clear') { m.sel.clear(); return renderInstaller(); }
  if (a === 'export-csv' || a === 'export-html') {
    const labels = { dir: document.documentElement.dir, title: t('msiT'), category: t('c_all'), file: t('colFile'), path: t('path'), size: t('size'), type: t('colType'), created: t('colCreated'), product: t('colProduct'), reason: t('colReason'), sources: t('sources') };
    for (const c of ['used', 'orphan', 'excluded', 'unknown']) labels['c_' + c] = t('c_' + c);
    for (const k of Object.keys(I18N.ar).filter((k) => k.startsWith('r_') || k.startsWith('t_'))) labels[k] = t(k);
    labels.t_total = t('t_total');
    const r = await api.msiExport({ format: a === 'export-html' ? 'html' : 'csv', labels });
    if (r.ok) { toast('✅ ' + esc(r.file)); api.openFolder(r.file); }
    return;
  }
  if (a === 'pickdir') { const r = await api.msiPickBackupDir(); if (r && r.error) toast(msiErr(r)); m.dir = await api.msiBackupDir(); return S.view === 'settings' ? renderSettings() : renderInstaller(); }
  const items = [...m.sel.values()];
  const tot = items.reduce((x, y) => x + y.size, 0);
  if (a === 'move') {
    const b = await api.msiBackups();
    const same = /^[a-z]:/i.test(b.root) && m.res && b.root.slice(0, 2).toLowerCase() === m.res.dir.slice(0, 2).toLowerCase();
    const okk = await ask({ title: `${icon('archive', 'style="width:20px;height:20px;vertical-align:-4px;color:var(--gold)"')} ${t('moveT')}`, ok: t('moveBackup'),
      body: `${t('moveD', items.length, `<b class="ltr gold">${fmt(tot)}</b>`)}<div class="pathbox">${esc(b.root)}</div>${b.free != null ? `<div class="muted" style="margin-top:6px">${t('freeOn')} <b class="ltr">${fmt(b.free)}</b></div>` : ''}${same ? `<div class="warn">${t('sameDrive')}</div>` : ''}` });
    if (!okk) return;
    m.prog = { stage: 'verify', done: 0, total: 1 }; renderInstaller();
    const r = await api.msiMove(items.map((i) => i.path));
    m.prog = null;
    if (!r.ok) { toast(msiErr(r), 8000); m.res = await api.msiLast(); return renderInstaller(); }
    let msg = t('movedOk', r.moved, fmt(r.freed));
    if (r.rejected && r.rejected.length) msg += '<br>⚠️ ' + t('rejectedN', r.rejected.length);
    if (r.failed) msg += '<br>⚠️ ' + t('failed', r.failed);
    if (r.sameDrive) msg += '<br>' + t('sameDrive');
    toast(msg, 9000);
    m.sel.clear(); m.res = await api.msiLast(); await refreshDrives(); return renderInstaller();
  }
  if (a === 'delete') {
    const okk = await ask({ title: `${icon('trash', 'style="width:20px;height:20px;vertical-align:-4px;color:var(--keep)"')} ${t('delT')}`, ok: t('deletePerm'), danger: true, check: t('delCheck'),
      body: `${t('delD', items.length, `<b class="ltr gold">${fmt(tot)}</b>`)}<div class="items" style="max-height:180px;overflow:auto;margin-top:10px;border:1px solid var(--line);border-radius:10px;padding:6px">${items.slice(0, 80).map((i) => `<div class="mono ltr" style="font-size:11.5px">${esc(i.path)}</div>`).join('')}</div>` });
    if (!okk) return;
    m.prog = { stage: 'verify', done: 0, total: 1 }; renderInstaller();
    const r = await api.msiDelete(items.map((i) => i.path));
    m.prog = null;
    if (!r.ok) { toast(msiErr(r), 8000); return renderInstaller(); }
    toast('✅ ' + t('doneDel', r.deleted, fmt(r.freed)) + (r.rejected.length ? '<br>⚠️ ' + t('rejectedN', r.rejected.length) : '') + (r.failed ? '<br>⚠️ ' + t('failed', r.failed) : ''), 9000);
    m.sel.clear(); m.res = await api.msiLast(); await refreshDrives(); return renderInstaller();
  }
}

async function msiRestore(session, orig) {
  const run = async (overwrite, originals) => { S.msi.prog = { stage: 'restore', done: 0, total: 1 }; renderInstaller(); const r = await api.msiRestore({ session, originals, overwrite }); S.msi.prog = null; return r; };
  let r = await run(false, orig ? [orig] : null);
  if (!r.ok) { toast(msiErr(r)); return renderInstaller(); }
  let restored = r.restored;
  if (r.conflicts && r.conflicts.length) {
    const ow = await ask({ title: t('conflictT'), ok: t('overwrite'), danger: true, body: t('conflictD', r.conflicts.length) + `<div class="pathbox">${r.conflicts.slice(0, 10).map(esc).join('<br>')}</div>` });
    if (ow) { const r2 = await run(true, r.conflicts); restored += r2.restored || 0; }
  }
  toast(t('restoredOk', restored) + (r.failed ? '<br>⚠️ ' + t('failed', r.failed) : ''), 6000);
  S.msi.res = null; await refreshDrives(); renderInstaller();
}

document.addEventListener('click', async (e) => {
  if (S.view !== 'installer' && S.view !== 'settings') return;
  const g = (sel) => e.target.closest(sel);
  let el;
  if ((el = g('[data-mtab]'))) { S.msi.tab = el.dataset.mtab; return renderInstaller(); }
  if ((el = g('[data-mfilter]'))) { S.msi.filter = el.dataset.mfilter; return renderInstaller(); }
  if ((el = g('[data-mact]'))) return msiAction(el.dataset.mact, el.dataset);
  if ((el = g('[data-msel]'))) { e.stopPropagation(); const p = el.dataset.msel; el.checked ? S.msi.sel.set(p, { path: p, size: +el.dataset.size }) : S.msi.sel.delete(p); return renderInstaller(); }
  if ((el = g('[data-mdetail]'))) { const p = el.dataset.mdetail; S.msi.open.has(p) ? S.msi.open.delete(p) : S.msi.open.add(p); return renderInstaller(); }
  if ((el = g('[data-mopen]'))) return el.dataset.dir ? api.openFolder(el.dataset.mopen) : api.msiOpenLocation(el.dataset.mopen);
  if ((el = g('[data-mexcl]'))) { const r = await api.msiExclude({ paths: [el.dataset.mexcl], on: el.dataset.on === '1' }); S.msi.sel.delete(el.dataset.mexcl); if (r.last) S.msi.res = r.last; return renderInstaller(); }
  if ((el = g('[data-mrestore]'))) return msiRestore(el.dataset.mrestore, el.dataset.orig);
  if ((el = g('[data-mpurge]'))) {
    const days = +el.dataset.days;
    const okk = await ask({ title: t('purgeT'), ok: t('purge'), danger: true, check: t('delCheck'), body: t('purgeD') + (days < 90 ? `<div class="warn">${t('purgeYoung', days)}</div>` : '') });
    if (!okk) return;
    const r = await api.msiPurge({ session: el.dataset.mpurge });
    if (r.ok) toast('✅ ' + t('doneDel', r.purged, fmt(r.bytes)));
    return renderInstaller();
  }
});

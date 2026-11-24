// للقطات النشر فقط: يحول مسارات جهاز الاختبار لمسارات ويندوز
(function (ROOT) {
  const fix = (t) => {
    let out = t.split(ROOT).join('C:').split('/root/IBRA Installer Backup').join('D:/IBRA Installer Backup');
    if (out.includes('C:') || out.includes('D:/')) out = out.replace(/([A-Z]:)?\/(?=[^\s])/g, (m, d) => (d || '') + '\\');
    return out;
  };
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) if (n.nodeValue.includes(ROOT) || n.nodeValue.includes('/root/IBRA')) n.nodeValue = fix(n.nodeValue);
  document.querySelectorAll('[title]').forEach((e) => { if (e.title.includes(ROOT)) e.title = fix(e.title); });
  const b = document.getElementById('adminBadge'); if (b) b.textContent = '🛡 مسؤول';
})

// IBRA CLEAN UP — الواجهة
// برمجة وتطوير ابراهيم الخزرجي — IBRAPROGRAM
'use strict';
const api = window.ibra;
const KB = window.IBRA_KB;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ═════════════ اللغات ═════════════
const I18N = {
  ar: {
    tagline: 'محلل المساحة ومنظف الكاش', admin: 'مسؤول', notAdmin: 'مستخدم عادي',
    home: 'الرئيسية', analyzer: 'محلل المساحة', clean: 'المؤقتة والكاش', large: 'الملفات الكبيرة', types: 'أنواع الملفات', smart: 'اقتراحات ذكية', history: 'سجل الحذف', about: 'حول',
    heroT: 'شنو اللي ماكل مساحة جهازك؟', heroD: 'افحص مجلد المستخدمين وشوف كل مجلد وملف بحجمه، مع شرح شنو هو وهل حذفه آمن — وأنت تختار شنو ينحذف بالتحديد.',
    scanUsers: 'فحص C:\\Users', scanMe: 'فحص حسابي فقط', scanPick: 'اختيار مجلد أو قرص', scanJunk: 'فحص المؤقتة والكاش',
    drives: 'الأقراص', free: 'فارغ', of: 'من', used: 'مستخدم',
    lastScan: 'نتيجة آخر فحص', biggest: 'أكبر المجلدات', files: 'ملف', folders: 'مجلد', took: 'استغرق', skipped: 'تعذر الوصول',
    scanning: 'جارِ الفحص...', cancel: 'إيقاف', deleting: 'جارِ الحذف...',
    noScan: 'ما سويت فحص بعد', noScanD: 'ابدأ بفحص مجلد المستخدمين حتى تشوف شنو ياخذ المساحة.', startScan: 'ابدأ الفحص',
    up: 'للأعلى', rescan: 'إعادة الفحص', open: 'فتح المجلد', enter: 'دخول', copy: 'نسخ المسار', copied: 'تم النسخ',
    dirsTab: 'المجلدات', filesTab: 'ملفات هذا المجلد', name: 'الاسم', size: 'الحجم', modified: 'آخر تعديل', share: 'النسبة',
    directFiles: 'ملفات داخل هذا المجلد مباشرة', details: 'التفاصيل', path: 'المسار', count: 'عدد الملفات', subdirs: 'مجلدات فرعية', ofParent: 'من المجلد الأب',
    whatIs: 'شنو هذا؟', unknown: 'ما عندي معلومة مؤكدة عن هذا المجلد. افتحه وشوف محتواه قبل الحذف.',
    delete: 'حذف', deleteSel: 'حذف المحدد', selected: 'محدد', clearSel: 'إلغاء التحديد', viewFiles: 'عرض الملفات',
    safe: 'آمن للحذف', review: 'راجعه قبل الحذف', keep: 'لا تحذفه', system: 'نظام',
    autoDl: 'يتحمل بدون علمك', needsAdmin: 'يحتاج مسؤول', runAdmin: 'تشغيل كمسؤول',
    scanAll: 'فحص الكل', selSafe: 'تحديد الآمن فقط', cleanSel: 'تنظيف المحدد', modePerm: 'حذف نهائي', modeTrash: 'إلى سلة المحذوفات',
    foundIn: 'المواقع', bigFiles: 'أكبر الملفات', items: 'المحتويات (اختر بالتحديد)', notFound: 'غير موجود بجهازك',
    preventDl: 'منع التحميل التلقائي', preventOn: 'التحميل التلقائي ممنوع ✓', preventUndo: 'إلغاء المنع', useCleanmgr: 'تنظيف عبر أداة ويندوز',
    total: 'المجموع', confirmT: 'تأكيد الحذف', confirmD: (n, s) => `راح ينحذف ${n} عنصر بحجم ${s}`, confirmBtn: 'نعم، احذف', cancelBtn: 'رجوع',
    trashD: 'تقدر ترجعها — بس المساحة ما تفرغ إلا لما تفرغ السلة', permD: 'تنحذف للأبد وتفرغ المساحة فوراً',
    warnKeep: '⚠️ بين العناصر شي مصنف "لا تحذفه" أو ملفات شخصية. تأكد قبل المتابعة.',
    doneDel: (n, s) => `تم حذف ${n} عنصر — تم تفريغ <b class="ltr gold">${s}</b>`, failed: (n) => `${n} عنصر ما انحذف (مستخدم حالياً أو محمي)`,
    allTypes: 'الكل', video: 'فيديو', image: 'صور وتصميم', audio: 'صوت', archive: 'مضغوط', installer: 'مثبتات', disk: 'أقراص ونسخ', model: 'نماذج AI', doc: 'مستندات', db: 'سجلات وبيانات', other: 'أخرى',
    minSize: 'أكبر من', anySize: 'أي حجم', olderThan: 'أقدم من', anyAge: 'أي وقت', m6: '6 أشهر', y1: 'سنة', y2: 'سنتين', search: 'بحث بالاسم...',
    largeLead: 'أكبر 1500 ملف بالمجلد اللي فحصته — رتبها وفلترها واحذف اللي ما تحتاجه.',
    typesLead: 'شنو نوع الملفات اللي تاكل المساحة؟', ext: 'الامتداد',
    smartLead: 'أشياء لكيناها بالفحص وغالباً ما تحتاجها.',
    kind_node_modules: 'مكتبات مشاريع جافاسكربت (node_modules)', kind_node_modulesD: 'كل مشروع برمجي فيه نسخة من مكتباته. تقدر ترجعها بأمر npm install — احذف للمشاريع القديمة.',
    kind_pycache: 'كاش بايثون (__pycache__)', kind_pycacheD: 'يتولد تلقائياً — آمن.',
    kind_venv: 'بيئات بايثون (venv)', kind_venvD: 'تنعاد بتثبيت المكتبات من جديد.',
    kind_next: 'ملفات بناء مواقع (.next / .nuxt)', kind_nextD: 'تنعاد بالبناء.', kind_dart_tool: 'ملفات أدوات Dart/Flutter', kind_dart_toolD: 'تنعاد بأمر flutter pub get.',
    bigArchives: 'ملفات ضخمة غالباً ما تحتاجها', bigArchivesD: 'مثبتات وأقراص ISO وملفات مضغوطة أكبر من 200 ميكا.',
    appdataBig: 'أكبر مجلدات AppData', appdataBigD: 'بيانات البرامج — إذا البرنامج محذوف فهذي بقايا.',
    histLead: 'كل عملية حذف سويتها بالبرنامج.', clearHist: 'مسح السجل', noHist: 'ما حذفت شي لحد الآن.',
    kindDelete: 'حذف ملفات', kindJunk: 'تنظيف كاش', kindItems: 'حذف عناصر محددة', kindPrevent: 'منع تحميل',
    aboutD: 'برنامج يكشف شنو ماكل مساحة القرص C وخصوصاً مجلد المستخدمين: محلل مساحة بخريطة مرئية، تنظيف الملفات المؤقتة وكاش المتصفحات والبرامج، كشف التحميلات التلقائية (نموذج الذكاء حق كروم، نسخ الآيفون، 3uTools، كاب كات، أدوبي)، الملفات الكبيرة، ومخلفات البرمجة — مع شرح لكل مجلد وحذف بالتحديد.',
    dev: 'برمجة وتطوير ابراهيم الخزرجي', site: 'موقع تطبيقاتي', tg: 'تيليكرام', tt: 'تيك توك', lang: 'English', version: 'الإصدار',
    adminNeedT: 'بعض الفئات تحتاج صلاحية مسؤول', ago: 'قبل',
    days: 'يوم', months: 'شهر', years: 'سنة', today: 'اليوم', hours: 'ساعة',
    filesN: (n) => `${n.toLocaleString('en')} ملف`, scanCounts: (f, d, e) => `${f.toLocaleString('en')} ملف • ${d.toLocaleString('en')} مجلد${e ? ' • ' + e + ' تعذر الوصول' : ''}`,
    junkTotal: 'مجموع اللي لكيناه', junkNone: 'اضغط "فحص الكل" حتى نحسب المساحة اللي تكدر تفرغها.',
    installer: 'مخلفات التثبيت', settings: 'الإعدادات',
    msiT: 'Windows Installer Cleaner — تنظيف مخلفات تثبيت البرامج',
    msiD: 'يفحص مجلد C:\\Windows\\Installer المحمي ويحدد ملفات MSI و MSP المرتبطة بالبرامج المثبتة والملفات اليتيمة من برامج وتحديثات قديمة. الأولوية سلامة النظام: أي ملف ما نكدر نتأكد منه يبقى محمي.',
    msiScan: 'فحص', msiRescan: 'إعادة الفحص', msiExportCsv: 'تصدير التقرير CSV', msiExportHtml: 'تصدير التقرير HTML', tabScan: 'نتائج الفحص', tabBackups: 'النسخ الاحتياطية',
    msiAdminNeed: 'هذا القسم يحتاج صلاحية مسؤول حتى يتحقق من كل البرامج لكل الحسابات. بدونها يكدر يعرض الملفات بس التنظيف يبقى موقوف.',
    st_enum: 'جارِ قراءة البرامج والتحديثات المثبتة من Windows Installer...', st_files: 'جارِ فحص الملفات...', st_info: 'جارِ قراءة معلومات الملفات...', st_verify: 'إعادة التحقق قبل التنفيذ...', st_move: 'نقل إلى النسخة الاحتياطية والتحقق من البصمة...', st_delete: 'جارِ الحذف...', st_restore: 'جارِ الاستعادة والتحقق...', st_done: '',
    msiComplete: (p, t, r) => `الفحص مكتمل ✓ — ${p} برنامج و ${t} تحديث من Windows Installer API، و ${r} مدخل من سجل الويندوز للتحقق الثاني.`,
    msiIncomplete: 'الفحص غير مكتمل — التنظيف موقوف حفاظاً على النظام. كل الملفات المرشحة تُعرض كـ"غير معروفة".',
    rs_notAdmin: 'البرنامج مو مشغّل كمسؤول', rs_apiFailed: 'فشل الاتصال بـ Windows Installer API', rs_regFailed: 'تعذرت قراءة سجل Windows Installer', rs_installRunning: 'توجد عملية تثبيت أو إزالة برامج جارية حالياً — انتظر تخلص', rs_cancelled: 'تم إيقاف الفحص',
    t_total: 'حجم المجلد الكلي', t_files: 'عدد الملفات', t_used: 'ملفات ضرورية', t_orphan: 'يتيمة محتملة', t_excluded: 'مستثناة', t_unknown: 'غير معروفة', t_recoverable: 'المساحة الممكن استرجاعها',
    c_all: 'الكل', c_used: 'مستخدمة', c_orphan: 'يتيمة محتملة', c_excluded: 'مستثناة', c_unknown: 'غير معروفة',
    r_usedApi: 'مرتبط ببرنامج أو تحديث مثبت (Windows Installer API) — يُمنع حذفه', r_usedReg: 'مرتبط ببرنامج مثبت حسب سجل الويندوز — يُمنع حذفه', r_orphan: 'ما يرتبط بأي برنامج أو تحديث مثبت بعد فحص مكتمل من مصدرين',
    r_exclUser: 'أنت استثنيته', r_exclDir: 'مجلد نظام داخل Installer — لا يُلمس أبداً', r_exclType: 'نوع ملف غير MSI/MSP — لا يُلمس', r_exclRecent: 'ملف حديث (أقل من يومين) — ممكن يكون من عملية تثبيت جارية', r_exclLink: 'رابط رمزي — لا نتبعه',
    r_unknownIncomplete: 'الفحص غير مكتمل فما نكدر نتأكد — يُمنع حذفه', r_unknownStat: 'تعذرت قراءة الملف — يُمنع حذفه',
    r_nowUsed: 'صار مرتبط ببرنامج عند إعادة التحقق', r_missing: 'الملف ما موجود', r_outside: 'خارج مجلد Installer',
    colFile: 'الملف', colProduct: 'البرنامج المرتبط', colType: 'النوع', colCreated: 'تاريخ الإنشاء', colReason: 'سبب التصنيف', likely: 'يبدو من:',
    viewDetails: 'عرض التفاصيل', openLoc: 'فتح موقع الملف', exclude: 'استثناء', unexclude: 'إلغاء الاستثناء', sources: 'مصادر التحقق', code: 'الرمز',
    moveBackup: 'نقل إلى النسخة الاحتياطية', deletePerm: 'حذف نهائي', backupTo: 'النسخة الاحتياطية في:', change: 'تغيير',
    moveT: 'نقل إلى النسخة الاحتياطية', moveD: (n, s) => `راح ينتقل ${n} ملف (${s}). كل ملف ينحسب له بصمة SHA-256 وينسخ ويتأكد من سلامته قبل ما ينشال الأصلي.`,
    sameDrive: '⚠️ مجلد النسخة الاحتياطية على نفس القرص C — الملفات راح تنتقل بس المساحة ما تفرغ. الأفضل تختار قرص ثاني (D مثلاً).',
    freeOn: 'المساحة الفارغة هناك:', delT: 'حذف نهائي', delD: (n, s) => `راح ينحذف ${n} ملف (${s}) نهائياً بدون نسخة احتياطية.`, delCheck: 'أفهم أن الحذف نهائي، ولا يمكن استرجاع الملفات، وأن النقل للنسخة الاحتياطية هو الخيار الأأمن.',
    movedOk: (n, s) => `✅ انتقل ${n} ملف — المساحة المسترجعة فعلياً: <b class="ltr gold">${s}</b>`, rejectedN: (n) => `${n} ملف ما انلمس لأن إعادة التحقق رفضته`,
    e_verifyFailed: 'إعادة التحقق فشلت — ما انلمس أي ملف', e_noSpace: 'المساحة بقرص النسخة الاحتياطية ما تكفي', e_badBackupDir: 'مجلد النسخة الاحتياطية غير مسموح (داخل ويندوز)', e_nothingAllowed: 'ولا ملف مسموح بعد إعادة التحقق', e_busy: 'توجد عملية جارية', e_exception: 'صار خطأ', e_listFailed: 'تعذر فتح مجلد Installer',
    bkRoot: 'مجلد النسخ الاحتياطية', bkNone: 'ما توجد نسخ احتياطية.', bk90: 'ننصح تخلي النسخة الاحتياطية 90 يوم على الأقل وتتأكد كل برامجك تشتغل وتتحدث وتنحذف طبيعي قبل ما تحذفها. البرنامج ما يحذفها تلقائياً.',
    restoreAll: 'استعادة الكل', restore: 'استعادة', purge: 'حذف النسخة نهائياً', daysOld: (d) => `عمرها ${d} يوم`,
    s_moved: 'محفوظ', s_restored: 'تمت استعادته', s_purged: 'محذوف', s_lost: 'مفقود', s_aborted: 'ملغي',
    conflictT: 'ملفات موجودة بنفس المكان', conflictD: (n) => `${n} ملف موجود حالياً بنفس المسار. تريد تكتب فوقها؟`, overwrite: 'نعم، اكتب فوقها',
    restoredOk: (n) => `✅ تمت استعادة ${n} ملف وتطابقت البصمة`, purgeT: 'حذف النسخة الاحتياطية', purgeD: 'الملفات بهاي النسخة تنحذف نهائياً ولا يمكن استعادتها بعدين.', purgeYoung: (d) => `⚠️ النسخة عمرها ${d} يوم بس — ننصح بالانتظار 90 يوم.`,
    noRestorePoint: 'ملاحظة: نقطة استعادة النظام ما تعتبر بديل عن هاي النسخة الاحتياطية.',
    themeT: 'الستايل', langT: 'اللغة', th_glassRed: 'زجاج أحمر وأسود', th_glassWhiteRed: 'زجاج أبيض وأحمر', th_glassWhite: 'زجاج أبيض', th_glassClear: 'زجاج شفاف', th_dark: 'ليلي', th_light: 'أبيض', th_system: 'حسب ويندوز',
    thd_glassClear: 'يبين خلفية سطح المكتب من وراه', thd_system: 'يتبدل مع وضع ويندوز الفاتح والداكن', glassNote: 'تأثير الزجاج الحقيقي يحتاج ويندوز 11 — على ويندوز 10 يطلع نفس الألوان بدون شفافية.',
    whole: 'الفئة كاملة', showMissing: 'عرض غير الموجودة بجهازك', hideMissing: 'إخفاء غير الموجودة', loading: 'جارِ التحميل...', more: (n) => `و ${n} أخرى`,
  },
  en: {
    tagline: 'Space analyzer & cache cleaner', admin: 'Administrator', notAdmin: 'Standard user',
    home: 'Home', analyzer: 'Space Analyzer', clean: 'Temp & Cache', large: 'Large Files', types: 'File Types', smart: 'Smart Suggestions', history: 'History', about: 'About',
    heroT: 'What is eating your disk?', heroD: 'Scan the Users folder and see every folder and file by size, with an explanation of what it is and whether it is safe to delete — you choose exactly what goes.',
    scanUsers: 'Scan C:\\Users', scanMe: 'Scan my profile', scanPick: 'Choose folder or drive', scanJunk: 'Scan temp & cache',
    drives: 'Drives', free: 'free', of: 'of', used: 'used',
    lastScan: 'Last scan', biggest: 'Biggest folders', files: 'files', folders: 'folders', took: 'took', skipped: 'inaccessible',
    scanning: 'Scanning...', cancel: 'Stop', deleting: 'Deleting...',
    noScan: 'No scan yet', noScanD: 'Start by scanning the Users folder to see what takes space.', startScan: 'Start scan',
    up: 'Up', rescan: 'Rescan', open: 'Open folder', enter: 'Open', copy: 'Copy path', copied: 'Copied',
    dirsTab: 'Folders', filesTab: 'Files here', name: 'Name', size: 'Size', modified: 'Modified', share: 'Share',
    directFiles: 'Files directly in this folder', details: 'Details', path: 'Path', count: 'Files', subdirs: 'Subfolders', ofParent: 'of parent',
    whatIs: 'What is this?', unknown: 'No confirmed info about this folder. Open it and check before deleting.',
    delete: 'Delete', deleteSel: 'Delete selected', selected: 'selected', clearSel: 'Clear', viewFiles: 'Show files',
    safe: 'Safe to delete', review: 'Review first', keep: 'Keep', system: 'System',
    autoDl: 'Downloads silently', needsAdmin: 'Needs admin', runAdmin: 'Run as admin',
    scanAll: 'Scan all', selSafe: 'Select safe only', cleanSel: 'Clean selected', modePerm: 'Delete permanently', modeTrash: 'To Recycle Bin',
    foundIn: 'Locations', bigFiles: 'Largest files', items: 'Contents (pick exactly)', notFound: 'Not found on this PC',
    preventDl: 'Block auto-download', preventOn: 'Auto-download blocked ✓', preventUndo: 'Undo block', useCleanmgr: 'Clean with Windows tool',
    total: 'Total', confirmT: 'Confirm delete', confirmD: (n, s) => `${n} item(s), ${s} will be deleted`, confirmBtn: 'Yes, delete', cancelBtn: 'Back',
    trashD: 'Recoverable — space is freed only after emptying the bin', permD: 'Gone forever, space freed immediately',
    warnKeep: '⚠️ Some items are marked "Keep" or are personal files. Make sure before continuing.',
    doneDel: (n, s) => `Deleted ${n} item(s) — freed <b class="ltr gold">${s}</b>`, failed: (n) => `${n} item(s) could not be deleted (in use or protected)`,
    allTypes: 'All', video: 'Video', image: 'Images & design', audio: 'Audio', archive: 'Archives', installer: 'Installers', disk: 'Disk images', model: 'AI models', doc: 'Documents', db: 'Logs & data', other: 'Other',
    minSize: 'Larger than', anySize: 'Any size', olderThan: 'Older than', anyAge: 'Any time', m6: '6 months', y1: '1 year', y2: '2 years', search: 'Search by name...',
    largeLead: 'The 1500 largest files in the scanned folder — sort, filter and delete what you don\'t need.',
    typesLead: 'Which file types eat the space?', ext: 'Extension',
    smartLead: 'Things we found that you probably don\'t need.',
    kind_node_modules: 'JavaScript project libraries (node_modules)', kind_node_modulesD: 'Restorable with npm install — delete for old projects.',
    kind_pycache: 'Python cache (__pycache__)', kind_pycacheD: 'Auto-generated — safe.',
    kind_venv: 'Python virtual environments', kind_venvD: 'Recreated by reinstalling packages.',
    kind_next: 'Web build output (.next / .nuxt)', kind_nextD: 'Rebuilt on build.', kind_dart_tool: 'Dart/Flutter tool files', kind_dart_toolD: 'Restored by flutter pub get.',
    bigArchives: 'Huge files you likely don\'t need', bigArchivesD: 'Installers, ISOs and archives over 200 MB.',
    appdataBig: 'Biggest AppData folders', appdataBigD: 'App data — leftovers if the app is uninstalled.',
    histLead: 'Every delete operation done with the app.', clearHist: 'Clear history', noHist: 'Nothing deleted yet.',
    kindDelete: 'Deleted files', kindJunk: 'Cache cleanup', kindItems: 'Deleted items', kindPrevent: 'Blocked download',
    aboutD: 'Finds what fills your C drive, especially the Users folder: visual space analyzer, temp/browser/app cache cleaning, silent auto-downloads (Chrome AI model, iPhone backups, 3uTools, CapCut, Adobe), large files and developer leftovers — with an explanation of every folder and precise deletion.',
    dev: 'Developed by Ibrahim Al-Khazraji', site: 'My apps site', tg: 'Telegram', tt: 'TikTok', lang: 'العربية', version: 'Version',
    adminNeedT: 'Some categories need admin rights', ago: 'ago',
    days: 'd', months: 'mo', years: 'y', today: 'today', hours: 'h',
    filesN: (n) => `${n.toLocaleString('en')} files`, scanCounts: (f, d, e) => `${f.toLocaleString('en')} files • ${d.toLocaleString('en')} folders${e ? ' • ' + e + ' inaccessible' : ''}`,
    junkTotal: 'Total found', junkNone: 'Press "Scan all" to calculate the space you can free.',
    installer: 'Installer Leftovers', settings: 'Settings',
    msiT: 'Windows Installer Cleaner',
    msiD: 'Scans the protected C:\\Windows\\Installer folder and tells MSI/MSP files used by installed programs apart from orphans left by old programs and updates. Safety first: anything that cannot be verified stays protected.',
    msiScan: 'Scan', msiRescan: 'Rescan', msiExportCsv: 'Export report CSV', msiExportHtml: 'Export report HTML', tabScan: 'Scan results', tabBackups: 'Backups',
    msiAdminNeed: 'This section needs administrator rights to verify every program for every account. Without them it can list files but cleaning stays disabled.',
    st_enum: 'Reading installed products and patches from Windows Installer...', st_files: 'Scanning files...', st_info: 'Reading file information...', st_verify: 'Re-verifying before acting...', st_move: 'Moving to backup and verifying hashes...', st_delete: 'Deleting...', st_restore: 'Restoring and verifying...', st_done: '',
    msiComplete: (p, t, r) => `Scan complete ✓ — ${p} products and ${t} patches from the Windows Installer API, plus ${r} registry entries as a second check.`,
    msiIncomplete: 'Scan incomplete — cleaning is disabled to protect the system. All candidates are shown as "Unknown".',
    rs_notAdmin: 'Not running as administrator', rs_apiFailed: 'Windows Installer API query failed', rs_regFailed: 'Could not read the Windows Installer registry', rs_installRunning: 'An installation or removal is running — wait for it to finish', rs_cancelled: 'Scan was cancelled',
    t_total: 'Folder total', t_files: 'Files', t_used: 'Required files', t_orphan: 'Possible orphans', t_excluded: 'Excluded', t_unknown: 'Unknown', t_recoverable: 'Recoverable space',
    c_all: 'All', c_used: 'Used', c_orphan: 'Orphaned', c_excluded: 'Excluded', c_unknown: 'Unknown',
    r_usedApi: 'Linked to an installed product/patch (Windows Installer API) — protected', r_usedReg: 'Linked to an installed product per the registry — protected', r_orphan: 'No link to any installed product or patch after a complete two-source scan',
    r_exclUser: 'Excluded by you', r_exclDir: 'System folder inside Installer — never touched', r_exclType: 'Not an MSI/MSP file — never touched', r_exclRecent: 'Recent file (under 2 days) — may belong to a running install', r_exclLink: 'Symbolic link — not followed',
    r_unknownIncomplete: 'Scan incomplete, cannot verify — protected', r_unknownStat: 'File could not be read — protected',
    r_nowUsed: 'Became linked to a product on re-check', r_missing: 'File missing', r_outside: 'Outside the Installer folder',
    colFile: 'File', colProduct: 'Linked program', colType: 'Type', colCreated: 'Created', colReason: 'Reason', likely: 'Looks like:',
    viewDetails: 'View details', openLoc: 'Open file location', exclude: 'Exclude', unexclude: 'Remove exclusion', sources: 'Verified by', code: 'Code',
    moveBackup: 'Move to backup', deletePerm: 'Delete permanently', backupTo: 'Backup in:', change: 'Change',
    moveT: 'Move to backup', moveD: (n, s) => `${n} file(s) (${s}) will be moved. Each file gets a SHA-256 hash, is copied and verified before the original is removed.`,
    sameDrive: '⚠️ The backup folder is on the same drive — files move but no space is freed. Pick another drive (e.g. D).',
    freeOn: 'Free space there:', delT: 'Delete permanently', delD: (n, s) => `${n} file(s) (${s}) will be deleted forever with no backup.`, delCheck: 'I understand deletion is permanent, files cannot be recovered, and moving to backup is the safer option.',
    movedOk: (n, s) => `✅ Moved ${n} file(s) — space actually freed: <b class="ltr gold">${s}</b>`, rejectedN: (n) => `${n} file(s) were left untouched because the re-check rejected them`,
    e_verifyFailed: 'Re-verification failed — nothing was touched', e_noSpace: 'Not enough space on the backup drive', e_badBackupDir: 'Backup folder not allowed (inside Windows)', e_nothingAllowed: 'No file allowed after re-check', e_busy: 'Another operation is running', e_exception: 'An error occurred', e_listFailed: 'Could not open the Installer folder',
    bkRoot: 'Backup folder', bkNone: 'No backups.', bk90: 'Keep backups at least 90 days and make sure your programs install, update, repair and uninstall normally before deleting them. Backups are never deleted automatically.',
    restoreAll: 'Restore all', restore: 'Restore', purge: 'Delete backup permanently', daysOld: (d) => `${d} days old`,
    s_moved: 'Stored', s_restored: 'Restored', s_purged: 'Deleted', s_lost: 'Missing', s_aborted: 'Cancelled',
    conflictT: 'Files already exist', conflictD: (n) => `${n} file(s) already exist at the original path. Overwrite them?`, overwrite: 'Yes, overwrite',
    restoredOk: (n) => `✅ Restored ${n} file(s), hashes match`, purgeT: 'Delete backup', purgeD: 'Files in this backup will be deleted forever and cannot be restored.', purgeYoung: (d) => `⚠️ This backup is only ${d} days old — waiting 90 days is recommended.`,
    noRestorePoint: 'Note: a system restore point is not a substitute for this backup.',
    themeT: 'Style', langT: 'Language', th_glassRed: 'Red & black glass', th_glassWhiteRed: 'White & red glass', th_glassWhite: 'White glass', th_glassClear: 'Clear glass', th_dark: 'Dark', th_light: 'White', th_system: 'Match Windows',
    thd_glassClear: 'Shows your desktop behind it', thd_system: 'Follows Windows light/dark mode', glassNote: 'Real glass effect needs Windows 11 — on Windows 10 you get the same colours without transparency.',
    whole: 'Whole category', showMissing: 'Show not found', hideMissing: 'Hide not found', loading: 'Loading...', more: (n) => `and ${n} more`,
  },
};

// ═════════════ الحالة ═════════════
const S = {
  lang: 'ar', env: {}, isAdmin: false, drives: [], view: 'home',
  scan: null, cur: 0, node: null, sel: null, aTab: 'dirs', dirFiles: null,
  checked: new Map(),
  defs: null, junk: {}, junkBusy: new Set(), junkChecked: new Set(), subChecked: new Map(), openCats: new Set(), cleanMode: 'permanent', prevent: {},
  large: { type: 'all', min: 0, age: 0, q: '' }, largeChecked: new Map(),
  smartChecked: new Map(), appdataBig: null,
};
const t = (k, ...a) => { const v = (I18N[S.lang][k] ?? I18N.ar[k] ?? k); return typeof v === 'function' ? v(...a) : v; };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function fmt(b) {
  if (!b || b < 0) return '0 B';
  const u = ['B', 'KB', 'MB', 'GB', 'TB']; let i = 0;
  while (b >= 1024 && i < u.length - 1) { b /= 1024; i++; }
  return (b >= 100 || i === 0 ? b.toFixed(0) : b >= 10 ? b.toFixed(1) : b.toFixed(2)) + ' ' + u[i];
}
function fmtDate(ms) { if (!ms) return '—'; const d = new Date(ms); return d.toLocaleDateString('en-GB'); }
function ago(ms) {
  if (!ms) return '—';
  const s = (Date.now() - ms) / 1000;
  if (s < 86400) return t('today');
  const d = s / 86400;
  const v = d < 30 ? [Math.floor(d), t('days')] : d < 365 ? [Math.floor(d / 30), t('months')] : [(d / 365).toFixed(1).replace('.0', ''), t('years')];
  return S.lang === 'ar' ? `${t('ago')} ${v[0]} ${v[1]}` : `${v[0]}${v[1]} ${t('ago')}`;
}
const base = (p) => String(p).split(/[\\/]/).filter(Boolean).pop() || p;
const extOf = (p) => { const m = /\.[^.\\/]+$/.exec(p); return m ? m[0].toLowerCase() : ''; };

function toast(msg, ms = 3500) {
  const el = $('#toast'); el.innerHTML = msg; el.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('on'), ms);
}

// ═════════════ أيقونات ═════════════
const IC = {
  home: '<path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  analyzer: '<path d="M3 3h8v10H3zM13 3h8v6h-8zM13 11h8v10h-8zM3 15h8v6H3z"/>',
  clean: '<path d="M14 3 9 13M7 13h8l1 8H6zM9 17v4M12 17v4"/><path d="M18 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/>',
  large: '<path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5M9 13h6M9 17h6"/>',
  types: '<path d="M12 2v10l8.5 5A10 10 0 1 1 12 2z"/><path d="M14 2.2A10 10 0 0 1 21.8 12H14z"/>',
  smart: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  about: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  installer: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  restore: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  folder: '<path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
  file: '<path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5"/>',
  video: '<rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5-9 8"/>',
  archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v11h14V9M10 13h4"/>',
  open: '<path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  scan: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  block: '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
  drive: '<rect x="3" y="12" width="18" height="8" rx="2"/><path d="M5 12 7 4h10l2 8M17 16h.01"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  link: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
};
const icon = (n, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${IC[n] || ''}</svg>`;
function fileIcon(p, isDir) {
  if (isDir) return `<div class="fico dir">${icon('folder')}</div>`;
  const ty = KB.extType(extOf(p));
  const ic = ty === 'video' ? 'video' : ty === 'image' ? 'image' : ['archive', 'installer', 'disk'].includes(ty) ? 'archive' : 'file';
  return `<div class="fico ${ty}">${icon(ic)}</div>`;
}
const riskChip = (r) => r ? `<span class="chip ${r}">${t(r)}</span>` : '';
const explainOf = (p) => KB.explain(p, S.env);

// ═════════════ الشريط الجانبي ═════════════
const NAV = ['home', 'analyzer', 'clean', 'installer', 'large', 'types', 'smart', 'history', 'settings', 'about'];
function renderSidebar() {
  const counts = { large: S.scan ? S.scan.top.length : 0, smart: S.scan ? S.scan.findings.length : 0 };
  $('#sidebar').innerHTML = NAV.map((v) => `<div class="nav ${S.view === v ? 'active' : ''}" data-nav="${v}">${icon(v)}<span>${t(v)}</span>${counts[v] ? `<span class="count">${counts[v]}</span>` : ''}</div>`).join('') +
    `<div class="side-foot">
      ${S.upd && S.upd.info && S.upd.info.available ? `<button class="btn sm primary" data-upd-banner="1">⬆ ${t('updBanner')} <span class="ltr">${esc(S.upd.info.version)}</span></button>` : ''}
      ${S.isAdmin ? '' : `<button class="btn sm" data-act="admin">${icon('shield')}${t('runAdmin')}</button>`}
      <button class="btn sm ghost" data-act="lang">🌐 ${t('lang')}</button>
      <div class="dim" style="font-size:11px;text-align:center">IBRAPROGRAM • v${esc(S.version || '')}</div>
    </div>`;
  $('#adminBadge').textContent = S.isAdmin ? '🛡 ' + t('admin') : t('notAdmin');
  $$('[data-i]').forEach((el) => { el.textContent = t(el.dataset.i); });
}
function go(v) {
  S.view = v;
  $$('.view').forEach((el) => el.classList.toggle('active', el.id === 'v-' + v));
  renderSidebar();
  ({ home: renderHome, analyzer: renderAnalyzer, clean: renderClean, installer: renderInstaller, large: renderLarge, types: renderTypes, smart: renderSmart, history: renderHistory, settings: renderSettings, about: renderAbout })[v]();
  $('#main').scrollTop = 0;
}

// ═════════════ الرئيسية ═════════════
async function renderHome() {
  const el = $('#v-home');
  const drives = S.drives.map((d) => {
    const pct = d.used / d.total * 100;
    return `<div class="card drive">
      <div class="row">${icon('drive', 'style="width:22px;height:22px;color:var(--gold)"')}<b class="ltr">${esc(d.drive)}</b><span class="grow"></span><span class="muted">${pct.toFixed(0)}% ${t('used')}</span></div>
      <div class="bar"><i class="${pct > 88 ? 'hot' : ''}" style="width:${pct}%"></i></div>
      <div class="row"><span class="big ltr">${fmt(d.free)}</span><span class="muted">${t('free')} ${t('of')} <span class="ltr">${fmt(d.total)}</span></span></div>
    </div>`;
  }).join('');

  let summary = '';
  if (S.scan) {
    const r = S.scan.rootNode;
    const res = await api.node(0);
    const kids = res ? res.children.slice(0, 8) : [];
    summary = `<div class="sp"></div><h2>${t('lastScan')} — <span class="ltr gold">${esc(S.scan.root)}</span></h2>
      <div class="grid g4">
        <div class="card stat"><div class="v ltr">${fmt(r.size)}</div><div class="l">${t('total')}</div></div>
        <div class="card stat"><div class="v ltr">${S.scan.stats.files.toLocaleString('en')}</div><div class="l">${t('files')}</div></div>
        <div class="card stat"><div class="v ltr">${S.scan.stats.dirs.toLocaleString('en')}</div><div class="l">${t('folders')}</div></div>
        <div class="card stat"><div class="v ltr">${(S.scan.elapsed / 1000).toFixed(1)}s</div><div class="l">${t('took')} • ${S.scan.stats.errors} ${t('skipped')}</div></div>
      </div>
      <div class="sp"></div>
      <div class="card"><h2>${t('biggest')}</h2><div class="list">${kids.map((k) => rowDir(k, r.size, false)).join('')}</div></div>`;
  }
  let junkSum = '';
  const jt = Object.values(S.junk).reduce((a, j) => a + (j.size || 0), 0);
  if (jt) junkSum = `<div class="card row" style="margin-top:14px">${icon('clean', 'style="width:26px;height:26px;color:var(--gold)"')}<div class="grow"><b>${t('junkTotal')}</b><div class="muted">${t('clean')}</div></div><span class="ltr" style="font-size:22px;font-weight:800;color:var(--gold2)">${fmt(jt)}</span><button class="btn" data-nav="clean">${t('clean')}</button></div>`;

  el.innerHTML = `
    <div class="card hero">
      <img class="ico" src="../../build/icon.png" alt="">
      <div class="grow">
        <h1>${t('heroT')}</h1>
        <p class="lead" style="margin:4px 0 14px">${t('heroD')}</p>
        <div class="row wrap">
          <button class="btn primary big" data-act="scan-users">${icon('scan')}${t('scanUsers')}</button>
          <button class="btn big" data-act="scan-me">${t('scanMe')}</button>
          <button class="btn big" data-act="scan-pick">${t('scanPick')}</button>
          <button class="btn purple big" data-act="scan-junk">${icon('clean')}${t('scanJunk')}</button>
        </div>
      </div>
    </div>
    <div id="storeSlot"></div>
    <div class="sp"></div>
    <h2>${t('drives')}</h2>
    <div class="grid g3">${drives}</div>
    ${junkSum}
    ${summary}`;
  if (typeof placeStoreSlider === 'function') placeStoreSlider();
}

// ═════════════ الفحص ═════════════
let unsubProgress = null;
async function startTreeScan(root) {
  if (!root) return;
  const ov = $('#scanOverlay');
  $('#scanTitle').textContent = t('scanning');
  $('#scanBytes').textContent = '0 B'; $('#scanCounts').textContent = ''; $('#scanCur').textContent = root;
  $('#scanCancel').textContent = t('cancel'); $('#scanCancel').style.display = '';
  ov.classList.add('on');
  unsubProgress = api.onScanProgress((p) => {
    $('#scanBytes').textContent = fmt(p.bytes);
    $('#scanCounts').textContent = t('scanCounts', p.files, p.dirs, p.errors) + ` • ${(p.elapsed / 1000).toFixed(0)}s`;
    $('#scanCur').textContent = p.current;
  });
  const res = await api.scanTree(root);
  unsubProgress && unsubProgress();
  ov.classList.remove('on');
  if (!res.ok) { toast('❌ ' + esc(res.error)); return; }
  S.scan = res; S.cur = 0; S.sel = null; S.checked.clear(); S.largeChecked.clear(); S.smartChecked.clear(); S.appdataBig = null;
  await refreshDrives();
  go('analyzer');
}
async function refreshDrives() { S.drives = await api.drives(); }

// ═════════════ المحلل ═════════════
function rowDir(n, parentSize, withCb = true) {
  const ex = explainOf(n.path);
  const pct = parentSize ? n.size / parentSize * 100 : 0;
  const ck = S.checked.has(n.path);
  return `<div class="li ${S.sel && S.sel.path === n.path ? 'sel' : ''}" style="grid-template-columns:${withCb ? '22px ' : ''}30px minmax(0,1fr) 110px 86px 82px 104px" data-dir="${n.id}" data-path="${esc(n.path)}">
    ${withCb ? `<input type="checkbox" class="cb" data-ck="${esc(n.path)}" data-size="${n.size}" data-isdir="1" ${ck ? 'checked' : ''}>` : ''}
    ${fileIcon(n.path, true)}
    <div class="grow"><div class="nm" dir="auto">${esc(n.name)}</div><div class="pth">${esc(n.path)}</div></div>
    <div><div class="pbar"><i style="width:${Math.max(1, pct)}%"></i></div><div class="dim" style="font-size:11px;margin-top:3px">${pct.toFixed(1)}%</div></div>
    <div class="sz">${fmt(n.size)}</div>
    <div class="dim" style="font-size:12px">${n.files.toLocaleString('en')} ${t('files')}</div>
    <div>${ex ? riskChip(ex.risk) : `<span class="dim" style="font-size:11.5px">${ago(n.mtime)}</span>`}</div>
  </div>`;
}
function rowFile(f, parentSize) {
  const pct = parentSize ? f.size / parentSize * 100 : 0;
  const ck = S.checked.has(f.path);
  return `<div class="li ${S.sel && S.sel.path === f.path ? 'sel' : ''}" style="grid-template-columns:22px 30px minmax(0,1fr) 110px 86px 104px" data-file="${esc(f.path)}" data-size="${f.size}" data-mtime="${f.mtime}">
    <input type="checkbox" class="cb" data-ck="${esc(f.path)}" data-size="${f.size}" ${ck ? 'checked' : ''}>
    ${fileIcon(f.path, false)}
    <div class="grow"><div class="nm" dir="auto">${esc(f.name || base(f.path))}</div><div class="pth">${esc(f.path)}</div></div>
    <div><div class="pbar"><i style="width:${Math.max(1, pct)}%"></i></div></div>
    <div class="sz">${fmt(f.size)}</div>
    <div class="dim" style="font-size:11.5px">${fmtDate(f.mtime)}</div>
  </div>`;
}

const TILE_COL = { safe: ['#1f6f52', '#2b9a72'], review: ['#7a5a17', '#a57a22'], keep: ['#7a2c3b', '#a03a50'], system: ['#2c3a7a', '#3e51a3'] };
function squarify(items, W, H) {
  const total = items.reduce((a, b) => a + b.v, 0) || 1;
  const list = items.map((it) => ({ ...it, a: it.v / total * W * H })).filter((x) => x.a > 0);
  const out = []; let r = { x: 0, y: 0, w: W, h: H }; let row = [];
  const worst = (row, w) => { if (!row.length) return Infinity; const s = row.reduce((a, b) => a + b.a, 0); const mx = Math.max(...row.map((x) => x.a)); const mn = Math.min(...row.map((x) => x.a)); return Math.max(w * w * mx / (s * s), (s * s) / (w * w * mn)); };
  const place = (row) => {
    const s = row.reduce((a, b) => a + b.a, 0);
    if (r.w >= r.h) { const cw = s / r.h; let y = r.y; for (const it of row) { const h = it.a / cw; out.push({ ...it, x: r.x, y, w: cw, h }); y += h; } r.x += cw; r.w -= cw; }
    else { const rh = s / r.w; let x = r.x; for (const it of row) { const w = it.a / rh; out.push({ ...it, x, y: r.y, w, h: rh }); x += w; } r.y += rh; r.h -= rh; }
  };
  while (list.length) {
    const side = Math.min(r.w, r.h);
    const it = list[0];
    if (worst([...row, it], side) <= worst(row, side)) { row.push(it); list.shift(); } else { place(row); row = []; }
  }
  if (row.length) place(row);
  return out;
}
function drawTreemap() {
  const box = $('#treemap'); if (!box || !S.node) return;
  const W = box.clientWidth, H = box.clientHeight;
  const kids = S.node.children.slice(0, 40).map((c) => ({ v: c.size, n: c }));
  if (S.node.node.direct > 0) kids.push({ v: S.node.node.direct, n: { id: -1, name: t('directFiles'), size: S.node.node.direct, path: S.node.node.path } });
  kids.sort((a, b) => b.v - a.v);
  const tiles = squarify(kids, W, H);
  box.innerHTML = tiles.map((tl, i) => {
    const ex = tl.n.id >= 0 ? explainOf(tl.n.path) : null;
    const c = ex ? TILE_COL[ex.risk] : [`hsl(${(350 + i * 17) % 360} 45% 28%)`, `hsl(${(350 + i * 17) % 360} 50% 38%)`];
    const small = tl.w < 60 || tl.h < 34;
    return `<div class="tile" title="${esc(tl.n.name)} — ${fmt(tl.n.size)}" style="left:${tl.x}px;top:${tl.y}px;width:${tl.w}px;height:${tl.h}px;background:linear-gradient(135deg,${c[1]},${c[0]})" ${tl.n.id >= 0 ? `data-dir="${tl.n.id}" data-path="${esc(tl.n.path)}"` : 'data-direct="1"'}>${small ? '' : `<b dir="auto">${esc(tl.n.name)}</b><span>${fmt(tl.n.size)}</span>`}</div>`;
  }).join('');
}

async function openNode(id) {
  const res = await api.node(id);
  if (!res) return;
  S.cur = id; S.node = res; S.dirFiles = null;
  if (S.aTab === 'files') await loadDirFiles();
  if (!S.sel || id !== S.cur) S.sel = { type: 'dir', ...res.node };
  renderAnalyzer();
}
async function loadDirFiles() {
  S.dirFiles = { loading: true };
  const r = await api.dirFiles(S.node.node.path);
  S.dirFiles = r.ok ? r : { files: [], total: 0, error: r.error };
}

async function renderAnalyzer() {
  const el = $('#v-analyzer');
  if (!S.scan) { el.innerHTML = emptyState(); return; }
  if (!S.node || S.node.node.id !== S.cur) { const r = await api.node(S.cur); if (!r) return; S.node = r; }
  const { node, crumbs, children } = S.node;
  if (!S.sel) S.sel = { type: 'dir', ...node };
  const list = S.aTab === 'dirs'
    ? (children.length || node.direct ? [
      `<div class="li head" style="grid-template-columns:22px 30px minmax(0,1fr) 110px 86px 82px 104px"><span></span><span></span><span>${t('name')}</span><span>${t('share')}</span><span style="text-align:end">${t('size')}</span><span>${t('files')}</span><span></span></div>`,
      ...children.map((c) => rowDir(c, node.size)),
      node.direct > 0 ? `<div class="li" style="grid-template-columns:22px 30px minmax(0,1fr) 110px 86px 82px 104px" data-direct="1"><span></span>${fileIcon('', false)}<div class="nm">${t('directFiles')}</div><div class="pbar"><i style="width:${node.direct / node.size * 100}%"></i></div><div class="sz">${fmt(node.direct)}</div><div></div><div></div></div>` : '',
    ].join('') : `<div class="empty">—</div>`)
    : (!S.dirFiles || S.dirFiles.loading ? `<div class="empty"><span class="spin"></span></div>`
      : S.dirFiles.files.length ? S.dirFiles.files.map((f) => rowFile(f, node.size)).join('') : `<div class="empty">—</div>`);

  el.innerHTML = `
    <div class="row wrap" style="margin-bottom:12px">
      <h1 class="grow">${t('analyzer')}</h1>
      <button class="btn" data-act="up" ${node.parent < 0 ? 'disabled' : ''}>${icon('up')}${t('up')}</button>
      <button class="btn" data-act="open" data-path="${esc(node.path)}">${icon('open')}${t('open')}</button>
      <button class="btn" data-act="rescan">${icon('refresh')}${t('rescan')}</button>
      <button class="btn" data-act="scan-pick">${t('scanPick')}</button>
    </div>
    <div class="crumbs">${crumbs.map((c, i) => `${i ? '<em>›</em>' : ''}<span data-crumb="${c.id}">${esc(c.name)}</span>`).join('')}</div>
    <div class="analyzer">
      <div>
        <div class="treemap" id="treemap"></div>
        <div class="tabs">
          <div class="tab ${S.aTab === 'dirs' ? 'on' : ''}" data-atab="dirs">${icon('folder', 'style="width:15px;height:15px;vertical-align:-3px"')} ${t('dirsTab')} (${children.length})</div>
          <div class="tab ${S.aTab === 'files' ? 'on' : ''}" data-atab="files">${icon('file', 'style="width:15px;height:15px;vertical-align:-3px"')} ${t('filesTab')}</div>
          <span class="grow"></span><span class="muted ltr" style="align-self:center">${fmt(node.size)}</span>
        </div>
        <div class="card" style="padding:6px"><div class="list">${list}</div></div>
      </div>
      <div class="details" id="details">${detailsHTML()}</div>
    </div>
    ${selBarHTML(S.checked, 'an')}`;
  requestAnimationFrame(drawTreemap);
}

function detailsHTML() {
  const s = S.sel; if (!s) return '';
  const ex = explainOf(s.path);
  const isDir = s.type === 'dir';
  const parentSize = S.node ? S.node.node.size : 0;
  return `<div class="card">
    <div class="row">${fileIcon(s.path, isDir)}<div class="title grow">${esc(s.name || base(s.path))}</div></div>
    <div class="pathbox">${esc(s.path)}</div>
    <dl class="kv">
      <dt>${t('size')}</dt><dd>${fmt(s.size)}</dd>
      ${isDir ? `<dt>${t('count')}</dt><dd>${(s.files || 0).toLocaleString('en')}</dd><dt>${t('subdirs')}</dt><dd>${(s.dirs || 0).toLocaleString('en')}</dd>` : ''}
      ${parentSize && s.id !== S.cur ? `<dt>${t('ofParent')}</dt><dd>${(s.size / parentSize * 100).toFixed(1)}%</dd>` : ''}
      <dt>${t('modified')}</dt><dd>${fmtDate(s.mtime)} • ${ago(s.mtime)}</dd>
    </dl>
    <div class="explain ${ex ? ex.risk : ''}"><b>${t('whatIs')}</b> ${ex ? riskChip(ex.risk) : ''}<br>${esc(ex ? ex[S.lang] : t('unknown'))}</div>
    <div class="actions">
      ${isDir && s.id !== S.cur ? `<button class="btn sm" data-act="enter" data-id="${s.id}">${icon('folder')}${t('enter')}</button>` : ''}
      <button class="btn sm" data-act="open" data-path="${esc(s.path)}">${icon('open')}${t('open')}</button>
      <button class="btn sm" data-act="copy" data-path="${esc(s.path)}">${icon('copy')}${t('copy')}</button>
      ${s.id === 0 || (ex && ex.risk === 'system') ? '' : `<button class="btn sm danger" data-act="del-one" data-path="${esc(s.path)}" data-size="${s.size}">${icon('trash')}${t('delete')}</button>`}
    </div>
  </div>`;
}

function selBarHTML(map, scope) {
  if (!map.size) return '';
  let tot = 0; for (const v of map.values()) tot += v.size || 0;
  return `<div class="sticky-bar"><b>${map.size}</b> ${t('selected')}<span class="tot">${fmt(tot)}</span><span class="grow"></span>
    <button class="btn ghost" data-act="clear-${scope}">${t('clearSel')}</button>
    <button class="btn danger" data-act="del-${scope}">${icon('trash')}${t('deleteSel')}</button></div>`;
}

function emptyState() {
  return `<div class="empty">${icon('scan')}<h2>${t('noScan')}</h2><p>${t('noScanD')}</p>
    <div class="row" style="justify-content:center"><button class="btn primary" data-act="scan-users">${t('scanUsers')}</button><button class="btn" data-act="scan-me">${t('scanMe')}</button></div></div>`;
}

// ═════════════ تأكيد الحذف ═════════════
function confirmDelete(items, { modes = ['trash', 'permanent'], def = 'trash', title } = {}) {
  return new Promise((resolve) => {
    const tot = items.reduce((a, b) => a + (b.size || 0), 0);
    const risky = items.some((i) => { const e = explainOf(i.path); return e && (e.risk === 'keep' || e.risk === 'system'); });
    let mode = def;
    const shown = items.slice(0, 150);
    const box = $('#modalBox');
    const draw = () => {
      box.innerHTML = `<h2>${icon('trash', 'style="width:20px;height:20px;vertical-align:-4px;color:var(--keep)"')} ${esc(title || t('confirmT'))}</h2>
        <div>${t('confirmD', items.length, `<b class="gold ltr">${fmt(tot)}</b>`)}</div>
        <div class="items">${shown.map((i) => `<div><span title="${esc(i.path)}">${esc(i.path)}</span><span class="ltr">${i.size ? fmt(i.size) : ''}</span></div>`).join('')}${items.length > shown.length ? `<div class="muted">${t('more', items.length - shown.length)}</div>` : ''}</div>
        ${risky ? `<div class="warn">${t('warnKeep')}</div>` : ''}
        ${modes.length > 1 ? `<div class="radio">${modes.map((m) => `<label class="${mode === m ? 'on' : ''}" data-mode="${m}"><b>${m === 'trash' ? '♻️ ' + t('modeTrash') : '🔥 ' + t('modePerm')}</b><small>${m === 'trash' ? t('trashD') : t('permD')}</small></label>`).join('')}</div>` : ''}
        <div class="row" style="margin-top:16px;justify-content:flex-end"><button class="btn" data-m="no">${t('cancelBtn')}</button><button class="btn danger" data-m="yes">${icon('trash')}${t('confirmBtn')}</button></div>`;
    };
    draw();
    const modal = $('#modal'); modal.classList.add('on');
    const onClick = (e) => {
      const lb = e.target.closest('[data-mode]'); if (lb) { mode = lb.dataset.mode; draw(); return; }
      const b = e.target.closest('[data-m]');
      if (b || e.target === modal) { modal.classList.remove('on'); modal.removeEventListener('click', onClick); resolve(b && b.dataset.m === 'yes' ? mode : null); }
    };
    modal.addEventListener('click', onClick);
  });
}
function busy(on, title) {
  const ov = $('#scanOverlay');
  if (on) { $('#scanTitle').textContent = title || t('deleting'); $('#scanBytes').textContent = ''; $('#scanCounts').textContent = ''; $('#scanCur').textContent = ''; $('#scanCancel').style.display = 'none'; ov.classList.add('on'); }
  else { ov.classList.remove('on'); $('#scanCancel').style.display = ''; }
}
function reportDelete(r) {
  let msg = '✅ ' + t('doneDel', r.deleted, fmt(r.freed));
  if (r.failed) msg += '<br><span style="color:var(--review)">⚠️ ' + t('failed', r.failed) + '</span>' + (r.failures && r.failures[0] ? `<br><span class="dim mono" style="font-size:11px">${esc(r.failures[0].path)} — ${esc(r.failures[0].error)}</span>` : '');
  toast(msg, 6000);
}
function forgetPaths(paths) {
  if (!S.scan) return;
  const gone = new Set(paths);
  const under = (p) => { for (const g of gone) if (p === g || p.startsWith(g + '\\') || p.startsWith(g + '/')) return true; return false; };
  S.scan.top = S.scan.top.filter((f) => !under(f.path));
  S.scan.findings = S.scan.findings.filter((f) => !under(f.path));
  if (S.appdataBig) S.appdataBig = S.appdataBig.filter((f) => !under(f.path));
  for (const m of [S.checked, S.largeChecked, S.smartChecked]) for (const k of [...m.keys()]) if (under(k)) m.delete(k);
}
async function deleteItems(items, opts) {
  if (!items.length) return null;
  const mode = await confirmDelete(items, opts);
  if (!mode) return null;
  busy(true);
  const r = await api.deletePaths({ items: items.map((i) => ({ path: i.path, size: i.size })), mode });
  busy(false);
  reportDelete(r);
  forgetPaths(r.done.map((d) => d.path));
  renderSidebar();
  await refreshDrives();
  return r;
}

// ═════════════ المؤقتة والكاش ═════════════
async function ensureDefs() { if (!S.defs) S.defs = await api.junkDefs(); }
async function scanJunk(ids) {
  await ensureDefs();
  const list = ids || S.defs.categories.map((c) => c.id);
  list.forEach((id) => S.junkBusy.add(id));
  if (S.view === 'clean') renderClean();
  const res = await api.junkScan(list);
  if (res && res.results) Object.assign(S.junk, res.results);
  list.forEach((id) => S.junkBusy.delete(id));
  if (S.view === 'clean') renderClean();
  else if (S.view === 'home') renderHome();
}
function catSelSize(c) {
  const sub = S.subChecked.get(c.id);
  if (sub && sub.size) { let s = 0; for (const v of sub.values()) s += v.size; return s; }
  return S.junkChecked.has(c.id) && S.junk[c.id] ? S.junk[c.id].size : 0;
}
async function renderClean() {
  await ensureDefs();
  const el = $('#v-clean');
  const scrollY = $('#main').scrollTop;
  const anyAdmin = !S.isAdmin && S.defs.categories.some((c) => c.admin);
  const grandTotal = Object.values(S.junk).reduce((a, j) => a + (j.size || 0), 0);
  let selTotal = 0, selCount = 0;
  for (const c of S.defs.categories) { const s = catSelSize(c); if (s || S.junkChecked.has(c.id) || (S.subChecked.get(c.id) || new Map()).size) { selTotal += s; selCount++; } }

  const groups = S.defs.groups.map((g) => {
    const cats = S.defs.categories.filter((c) => c.group === g.id && !(S.junk[c.id] && !S.junk[c.id].roots.length && !S.junkBusy.has(c.id) && !S.showMissing));
    if (!cats.length) return '';
    return `<div class="group-title">${g.id === 'auto' ? icon('bolt', 'style="width:18px;height:18px;color:#ff6b7a"') : ''}<span>${esc(g[S.lang])}</span><span class="line"></span><span class="ltr muted">${fmt(cats.reduce((a, c) => a + (S.junk[c.id] ? S.junk[c.id].size : 0), 0))}</span></div>` +
      cats.map(catHTML).join('');
  }).join('');

  el.innerHTML = `
    <div class="row wrap">
      <div class="grow"><h1>${t('clean')}</h1><p class="lead" style="margin:0">${grandTotal ? `${t('junkTotal')}: <b class="gold ltr">${fmt(grandTotal)}</b>` : t('junkNone')}</p></div>
      ${anyAdmin ? `<button class="btn" data-act="admin">${icon('shield')}${t('runAdmin')}</button>` : ''}
      ${Object.keys(S.junk).length ? `<button class="btn ghost" data-act="toggle-missing">${S.showMissing ? t('hideMissing') : t('showMissing')}</button>` : ''}
      <button class="btn" data-act="sel-safe">${t('selSafe')}</button>
      <button class="btn primary" data-act="scan-junk-all">${icon('scan')}${t('scanAll')}</button>
    </div>
    ${groups}
    <div class="sticky-bar">
      <span>${selCount} ${t('selected')}</span><span class="tot">${fmt(selTotal)}</span><span class="grow"></span>
      <select id="cleanMode"><option value="permanent" ${S.cleanMode === 'permanent' ? 'selected' : ''}>🔥 ${t('modePerm')}</option><option value="trash" ${S.cleanMode === 'trash' ? 'selected' : ''}>♻️ ${t('modeTrash')}</option></select>
      <button class="btn danger" data-act="clean-sel" ${selCount ? '' : 'disabled'}>${icon('clean')}${t('cleanSel')}</button>
    </div>`;
  $('#main').scrollTop = scrollY;
  for (const c of S.defs.categories) if (c.prevent && S.openCats.has(c.id) && S.prevent[c.id] === undefined) {
    api.preventState(c.id).then((v) => { S.prevent[c.id] = v; if (S.view === 'clean') renderClean(); });
  }
}
function catHTML(c) {
  const r = S.junk[c.id];
  const busyNow = S.junkBusy.has(c.id);
  const open = S.openCats.has(c.id);
  const sub = S.subChecked.get(c.id) || new Map();
  const disabled = (c.admin && !S.isAdmin && false) || c.special === 'windows-old';
  const sizeTxt = busyNow ? '<span class="spin"></span>' : r ? (r.size ? fmt(r.size) : (r.roots.length ? '0 B' : '—')) : '';
  const checked = S.junkChecked.has(c.id) || sub.size > 0;
  let body = '';
  if (open) {
    const roots = r ? r.roots : [];
    body = `<div class="cat-b">
      <div class="desc">${esc(c[S.lang === 'ar' ? 'dar' : 'den'])}</div>
      ${c.prevent ? `<div class="explain review row wrap">${icon('block', 'style="width:18px;height:18px"')}<span class="grow">${esc(c.prevent[S.lang])}</span>
        ${S.prevent[c.id] ? `<span class="chip safe">${t('preventOn')}</span><button class="btn sm" data-act="prevent-undo" data-cat="${c.id}">${t('preventUndo')}</button>` : `<button class="btn sm purple" data-act="prevent" data-cat="${c.id}">${icon('block')}${t('preventDl')}</button>`}</div>` : ''}
      ${c.special === 'windows-old' ? `<button class="btn" data-act="cleanmgr">${t('useCleanmgr')}</button>` : ''}
      ${roots.length ? `<div class="muted" style="margin:8px 0 6px;font-weight:700">${t('foundIn')}</div>
        <div class="list">${roots.map((p) => `<div class="li" style="grid-template-columns:minmax(0,1fr) auto"><div class="pth" style="font-size:12px">${esc(p)}</div><button class="btn sm" data-act="open" data-path="${esc(p)}">${icon('open')}${t('open')}</button></div>`).join('')}</div>`
        : r ? `<div class="dim">${t('notFound')}</div>` : ''}
      ${r && r.items && r.items.length ? `<div class="muted" style="margin:12px 0 6px;font-weight:700">${t('items')}</div>
        <div class="sub-list">${r.items.map((it) => `<div class="li" style="grid-template-columns:22px 30px minmax(0,1fr) 86px 96px auto">
          <input type="checkbox" class="cb" data-sub="${c.id}" data-path="${esc(it.path)}" data-size="${it.size}" ${sub.has(it.path) ? 'checked' : ''}>
          ${fileIcon(it.path, it.isDir)}
          <div class="grow"><div class="nm" dir="auto">${esc(it.name)}</div><div class="pth">${esc(it.path)}</div></div>
          <div class="sz">${fmt(it.size)}</div><div class="dim" style="font-size:11.5px">${fmtDate(it.mtime)}</div>
          <button class="btn sm icon" title="${t('open')}" data-act="open" data-path="${esc(it.path)}">${icon('open')}</button></div>`).join('')}</div>` : ''}
      ${r && r.top && r.top.length && !(r.items && r.items.length) ? `<div class="muted" style="margin:12px 0 6px;font-weight:700">${t('bigFiles')}</div>
        <div class="sub-list">${r.top.slice(0, 60).map((f) => `<div class="li" style="grid-template-columns:30px minmax(0,1fr) 86px 96px auto">
          ${fileIcon(f.path, false)}<div class="pth" style="font-size:12px">${esc(f.path)}</div><div class="sz">${fmt(f.size)}</div><div class="dim" style="font-size:11.5px">${fmtDate(f.mtime)}</div>
          <button class="btn sm icon" title="${t('open')}" data-act="open" data-path="${esc(f.path)}">${icon('open')}</button></div>`).join('')}</div>` : ''}
    </div>`;
  }
  return `<div class="card cat ${c.autoDownload ? 'auto' : ''} ${open ? 'open' : ''}">
    <div class="cat-h" data-cat-toggle="${c.id}">
      <input type="checkbox" class="cb" data-cat="${c.id}" ${checked ? 'checked' : ''} ${disabled || !r || !r.size ? 'disabled' : ''}>
      <div><span class="t">${esc(c[S.lang])}</span>
        <div class="row wrap" style="gap:5px;margin-top:4px">${riskChip(c.risk)}${c.autoDownload ? `<span class="chip auto">${icon('bolt', 'style="width:11px;height:11px"')}${t('autoDl')}</span>` : ''}${c.admin && !S.isAdmin ? `<span class="chip admin">${t('needsAdmin')}</span>` : ''}${sub.size ? `<span class="chip f on">${sub.size} ${t('selected')}</span>` : ''}${r && r.count ? `<span class="dim" style="font-size:11.5px">${t('filesN', r.count)}</span>` : ''}</div></div>
      <span></span>
      <div class="s ${r && !r.size ? 'zero' : ''}">${sizeTxt}</div>
      <span class="arrow">${icon('down', 'style="width:18px;height:18px"')}</span>
    </div>${body}</div>`;
}

async function cleanSelected() {
  await ensureDefs();
  const wholeIds = [], items = [];
  for (const c of S.defs.categories) {
    const sub = S.subChecked.get(c.id);
    if (sub && sub.size) for (const v of sub.values()) items.push(v);
    else if (S.junkChecked.has(c.id) && S.junk[c.id] && S.junk[c.id].size) wholeIds.push(c.id);
  }
  const preview = [
    ...wholeIds.map((id) => { const c = S.defs.categories.find((x) => x.id === id); return { path: '📁 ' + c[S.lang] + ' — ' + t('whole'), size: S.junk[id].size }; }),
    ...items,
  ];
  if (!preview.length) return;
  const mode = await confirmDelete(preview, { modes: [S.cleanMode], def: S.cleanMode });
  if (!mode) return;
  busy(true);
  let deleted = 0, failed = 0, failures = [];
  if (items.length) { const r = await api.junkClean({ items, mode }); deleted += r.deleted; failed += r.failed; failures = failures.concat(r.failures); }
  if (wholeIds.length) { const r = await api.junkClean({ ids: wholeIds, mode }); deleted += r.deleted; failed += r.failed; failures = failures.concat(r.failures); }
  const affected = [...new Set([...wholeIds, ...[...S.subChecked.entries()].filter(([, m]) => m.size).map(([k]) => k)])];
  const before = affected.reduce((a, id) => a + (S.junk[id] ? S.junk[id].size : 0), 0);
  S.junkChecked.clear(); S.subChecked.clear();
  busy(false);
  await scanJunk(affected);
  const after = affected.reduce((a, id) => a + (S.junk[id] ? S.junk[id].size : 0), 0);
  reportDelete({ deleted, failed, failures, freed: Math.max(0, before - after) });
  await refreshDrives();
}

// ═════════════ الملفات الكبيرة ═════════════
function filteredLarge() {
  const f = S.large; const now = Date.now();
  return S.scan.top.filter((x) => {
    if (f.type !== 'all' && KB.extType(extOf(x.path)) !== f.type) return false;
    if (f.min && x.size < f.min) return false;
    if (f.age && x.mtime > now - f.age) return false;
    if (f.q && !base(x.path).toLowerCase().includes(f.q.toLowerCase())) return false;
    return true;
  });
}
function renderLarge() {
  const el = $('#v-large');
  if (!S.scan) { el.innerHTML = emptyState(); return; }
  const types = ['all', 'video', 'image', 'audio', 'archive', 'installer', 'disk', 'model', 'doc', 'db', 'other'];
  const rows = filteredLarge();
  const tot = rows.reduce((a, b) => a + b.size, 0);
  const allCk = rows.length && rows.slice(0, 400).every((r) => S.largeChecked.has(r.path));
  el.innerHTML = `
    <h1>${t('large')}</h1><p class="lead">${t('largeLead')}</p>
    <div class="row wrap" style="margin-bottom:10px">${types.map((ty) => `<span class="chip f ${S.large.type === ty ? 'on' : ''}" data-ltype="${ty}">${t(ty === 'all' ? 'allTypes' : ty)}</span>`).join('')}</div>
    <div class="row wrap" style="margin-bottom:12px">
      <span class="muted">${t('minSize')}</span>
      <select id="lMin">${[[0, t('anySize')], [100 * 2 ** 20, '100 MB'], [500 * 2 ** 20, '500 MB'], [2 ** 30, '1 GB'], [5 * 2 ** 30, '5 GB']].map(([v, l]) => `<option value="${v}" ${S.large.min == v ? 'selected' : ''}>${l}</option>`).join('')}</select>
      <span class="muted">${t('olderThan')}</span>
      <select id="lAge">${[[0, t('anyAge')], [182 * 864e5, t('m6')], [365 * 864e5, t('y1')], [730 * 864e5, t('y2')]].map(([v, l]) => `<option value="${v}" ${S.large.age == v ? 'selected' : ''}>${l}</option>`).join('')}</select>
      <input type="text" id="lQ" placeholder="${t('search')}" value="${esc(S.large.q)}" style="width:220px">
      <span class="grow"></span><b class="ltr gold">${rows.length} • ${fmt(tot)}</b>
    </div>
    <div class="card" style="padding:6px"><div class="list">
      <div class="li head" style="grid-template-columns:22px 30px minmax(0,1fr) 90px 100px 116px auto"><input type="checkbox" class="cb" data-act="large-all" ${allCk ? 'checked' : ''}><span></span><span>${t('name')}</span><span style="text-align:end">${t('size')}</span><span>${t('modified')}</span><span></span><span></span></div>
      ${rows.slice(0, 400).map((f) => { const ex = explainOf(f.path.replace(/[\\/][^\\/]+$/, '')); return `<div class="li" style="grid-template-columns:22px 30px minmax(0,1fr) 90px 100px 116px auto">
        <input type="checkbox" class="cb" data-lck="${esc(f.path)}" data-size="${f.size}" ${S.largeChecked.has(f.path) ? 'checked' : ''}>
        ${fileIcon(f.path, false)}
        <div class="grow"><div class="nm" dir="auto">${esc(base(f.path))}</div><div class="pth">${esc(f.path)}</div></div>
        <div class="sz">${fmt(f.size)}</div><div class="dim" style="font-size:12px">${fmtDate(f.mtime)}<br>${ago(f.mtime)}</div>
        <div>${ex ? riskChip(ex.risk) : ''}</div>
        <div class="row" style="gap:4px"><button class="btn sm icon" title="${t('open')}" data-act="open" data-path="${esc(f.path)}">${icon('open')}</button><button class="btn sm icon" title="${t('copy')}" data-act="copy" data-path="${esc(f.path)}">${icon('copy')}</button></div>
      </div>`; }).join('') || `<div class="empty">—</div>`}
    </div></div>
    ${selBarHTML(S.largeChecked, 'large')}`;
}

// ═════════════ أنواع الملفات ═════════════
const TYPE_COL = { video: '#ff6b81', image: '#3ddc97', audio: '#4fc3f7', archive: '#b39ddb', installer: '#9575cd', disk: '#7c5cff', model: '#26c6da', doc: '#f5b942', db: '#90a4ae', other: '#d4af37' };
function renderTypes() {
  const el = $('#v-types');
  if (!S.scan) { el.innerHTML = emptyState(); return; }
  const agg = {};
  for (const e of S.scan.exts) { const ty = KB.extType(e.ext); agg[ty] = agg[ty] || { size: 0, count: 0 }; agg[ty].size += e.size; agg[ty].count += e.count; }
  const tot = Object.values(agg).reduce((a, b) => a + b.size, 0) || 1;
  const sorted = Object.entries(agg).sort((a, b) => b[1].size - a[1].size);
  el.innerHTML = `<h1>${t('types')}</h1><p class="lead">${t('typesLead')}</p>
    <div class="card">
      <div class="typebar">${sorted.map(([k, v]) => `<i title="${t(k)} ${fmt(v.size)}" style="width:${v.size / tot * 100}%;background:${TYPE_COL[k]}"></i>`).join('')}</div>
      <div class="legend">${sorted.map(([k, v]) => `<span><i style="background:${TYPE_COL[k]}"></i>${t(k)} <b class="ltr">${fmt(v.size)}</b> <span class="dim">(${(v.size / tot * 100).toFixed(1)}%)</span></span>`).join('')}</div>
    </div>
    <div class="sp"></div>
    <div class="card"><table class="t"><tr><th>${t('ext')}</th><th>${t('size')}</th><th>${t('count')}</th><th></th></tr>
      ${S.scan.exts.slice(0, 40).map((e) => `<tr><td class="ltr mono">${esc(e.ext || '(—)')}</td><td class="ltr"><b>${fmt(e.size)}</b></td><td class="ltr">${e.count.toLocaleString('en')}</td><td style="width:40%"><div class="pbar"><i style="width:${e.size / S.scan.exts[0].size * 100}%;background:${TYPE_COL[KB.extType(e.ext)]}"></i></div></td></tr>`).join('')}
    </table></div>`;
}

// ═════════════ اقتراحات ذكية ═════════════
async function renderSmart() {
  const el = $('#v-smart');
  if (!S.scan) { el.innerHTML = emptyState(); return; }
  if (!S.appdataBig) {
    S.appdataBig = [];
    for (const p of [S.env.L, S.env.R]) {
      const id = await api.findPath(p);
      if (id >= 0) { const r = await api.node(id); if (r) S.appdataBig.push(...r.children.filter((c) => c.size > 300 * 2 ** 20)); }
    }
    S.appdataBig.sort((a, b) => b.size - a.size);
  }
  const groups = {};
  for (const f of S.scan.findings) (groups[f.kind] = groups[f.kind] || []).push(f);
  const bigF = S.scan.top.filter((f) => f.size > 200 * 2 ** 20 && ['installer', 'disk', 'archive'].includes(KB.extType(extOf(f.path))));
  const block = (title, desc, items, isDir) => {
    if (!items.length) return '';
    const tot = items.reduce((a, b) => a + b.size, 0);
    return `<div class="card" style="margin-bottom:14px">
      <div class="row"><div class="grow"><h2 style="margin:0">${esc(title)}</h2><div class="muted" style="margin-top:2px">${esc(desc)}</div></div><b class="ltr gold" style="font-size:18px">${fmt(tot)}</b></div>
      <div class="list" style="margin-top:10px;max-height:380px;overflow:auto">${items.slice(0, 200).map((f) => { const ex = explainOf(f.path); return `<div class="li" style="grid-template-columns:22px 30px minmax(0,1fr) 86px 96px 116px auto">
        <input type="checkbox" class="cb" data-sck="${esc(f.path)}" data-size="${f.size}" ${S.smartChecked.has(f.path) ? 'checked' : ''}>
        ${fileIcon(f.path, isDir)}
        <div class="grow"><div class="nm" dir="auto">${esc(base(f.path))}</div><div class="pth">${esc(f.path)}</div></div>
        <div class="sz">${fmt(f.size)}</div><div class="dim" style="font-size:11.5px">${ago(f.mtime)}</div>
        <div>${ex ? riskChip(ex.risk) : ''}</div>
        <button class="btn sm icon" data-act="open" data-path="${esc(f.path)}">${icon('open')}</button></div>`; }).join('')}</div></div>`;
  };
  el.innerHTML = `<h1>${t('smart')}</h1><p class="lead">${t('smartLead')}</p>
    ${Object.entries(groups).map(([k, items]) => block(t('kind_' + k), t('kind_' + k + 'D'), items, true)).join('')}
    ${block(t('bigArchives'), t('bigArchivesD'), bigF, false)}
    ${block(t('appdataBig'), t('appdataBigD'), S.appdataBig, true)}
    ${!Object.keys(groups).length && !bigF.length && !S.appdataBig.length ? `<div class="empty">✨</div>` : ''}
    ${selBarHTML(S.smartChecked, 'smart')}`;
}

// ═════════════ السجل وحول ═════════════
async function renderHistory() {
  const h = await api.history();
  const kindName = { delete: t('kindDelete'), junk: t('kindJunk'), 'junk-items': t('kindItems'), prevent: t('kindPrevent'), 'msi-move': '📦 ' + t('moveBackup'), 'msi-delete': '🔥 ' + t('installer') + ' — ' + t('deletePerm'), 'msi-restore': '♻️ ' + t('restore'), 'msi-purge': t('purge') };
  $('#v-history').innerHTML = `<div class="row"><div class="grow"><h1>${t('history')}</h1><p class="lead">${t('histLead')}</p></div>${h.length ? `<button class="btn" data-act="clear-hist">${t('clearHist')}</button>` : ''}</div>
    ${h.length ? `<div class="card"><table class="t"><tr><th></th><th></th><th>${t('count')}</th><th>${t('size')}</th><th></th></tr>
    ${h.map((e) => `<tr><td class="ltr dim">${new Date(e.at).toLocaleString('en-GB')}</td><td><b>${kindName[e.kind] || e.kind}</b> ${e.mode ? `<span class="chip admin">${e.mode === 'trash' ? t('modeTrash') : t('modePerm')}</span>` : ''}<div class="pth mono" style="max-width:520px">${esc((e.sample || e.cats || [e.key || '']).join(' • '))}</div></td><td class="ltr">${e.count ?? ''}${e.failed ? ` <span style="color:var(--review)">(-${e.failed})</span>` : ''}</td><td class="ltr gold">${e.freed ? fmt(e.freed) : ''}</td><td></td></tr>`).join('')}</table></div>` : `<div class="empty">${t('noHist')}</div>`}`;
}
function renderAbout() {
  $('#v-about').innerHTML = `<div class="card" style="max-width:760px;margin:0 auto;text-align:center;padding:34px">
    <img class="about-logo" src="../../build/icon.png" alt="">
    <h1 style="margin-top:10px"><span class="gold">IBRA</span> CLEAN UP</h1>
    <div class="muted">${t('version')} <span class="ltr">${esc(S.version)}</span></div>
    <p style="line-height:1.9;margin:18px 0">${t('aboutD')}</p>
    <h2 style="margin-top:20px">${t('dev')}</h2>
    <div class="row wrap" style="justify-content:center;margin-top:12px">
      <button class="btn primary" data-url="https://ibraprogram.netlify.app/">${icon('link')}${t('site')}</button>
      <button class="btn" data-url="https://t.me/ibraprogram">${t('tg')} • ibraprogram</button>
      <button class="btn" data-url="https://www.tiktok.com/@ibraprogram">${t('tt')} • ibraprogram</button>
    </div>
    <p class="dim" style="margin-top:22px;font-size:12px">IBRAPROGRAM © ${new Date().getFullYear()} • Cairo font — SIL OFL</p>
  </div>`;
}

// ═════════════ الأحداث ═════════════
document.addEventListener('click', async (e) => {
  const tg = e.target;
  const nav = tg.closest('[data-nav]'); if (nav) return go(nav.dataset.nav);
  const url = tg.closest('[data-url]'); if (url) return api.external(url.dataset.url);

  // صناديق التحديد
  if (tg.matches('input.cb')) {
    e.stopPropagation();
    const d = tg.dataset;
    const item = (p) => ({ path: p, size: +d.size || 0, isDir: !!d.isdir });
    if (d.ck !== undefined) { tg.checked ? S.checked.set(d.ck, item(d.ck)) : S.checked.delete(d.ck); return renderAnalyzer(); }
    if (d.lck !== undefined) { tg.checked ? S.largeChecked.set(d.lck, item(d.lck)) : S.largeChecked.delete(d.lck); return renderLarge(); }
    if (d.sck !== undefined) { tg.checked ? S.smartChecked.set(d.sck, item(d.sck)) : S.smartChecked.delete(d.sck); return renderSmart(); }
    if (d.cat !== undefined) { if (tg.checked) S.junkChecked.add(d.cat); else { S.junkChecked.delete(d.cat); S.subChecked.delete(d.cat); } return renderClean(); }
    if (d.sub !== undefined) { const m = S.subChecked.get(d.sub) || new Map(); tg.checked ? m.set(d.path, { path: d.path, size: +d.size }) : m.delete(d.path); S.subChecked.set(d.sub, m); return renderClean(); }
    if (d.act === 'large-all') { const rows = filteredLarge().slice(0, 400); if (tg.checked) rows.forEach((r) => S.largeChecked.set(r.path, { path: r.path, size: r.size })); else rows.forEach((r) => S.largeChecked.delete(r.path)); return renderLarge(); }
    return;
  }

  const act = tg.closest('[data-act]');
  if (act) {
    const a = act.dataset.act, p = act.dataset.path;
    switch (a) {
      case 'scan-users': return startTreeScan(S.env.USERS);
      case 'scan-me': return startTreeScan(S.env.U);
      case 'scan-pick': { const f = await api.pickFolder(); return startTreeScan(f); }
      case 'rescan': return startTreeScan(S.scan.root);
      case 'scan-junk': go('clean'); return scanJunk();
      case 'scan-junk-all': return scanJunk();
      case 'open': return api.openFolder(p);
      case 'copy': await api.copy(p); return toast(t('copied'), 1500);
      case 'up': if (S.node && S.node.node.parent >= 0) { S.sel = null; return openNode(S.node.node.parent); } return;
      case 'enter': S.sel = null; return openNode(+act.dataset.id);
      case 'del-one': { const why = await api.checkDeletable(p); if (why) return toast('🛡 ' + esc(why), 5000); const r = await deleteItems([{ path: p, size: +act.dataset.size }]); if (r && r.deleted) { S.checked.delete(p); S.sel = null; S.node = null; if (S.aTab === 'files') await loadDirFiles(); renderAnalyzer(); } return; }
      case 'del-an': { const r = await deleteItems([...S.checked.values()]); if (r) { r.done.forEach((d) => S.checked.delete(d.path)); S.node = null; S.sel = null; if (S.aTab === 'files') { await api.node(S.cur).then((x) => { S.node = x; }); await loadDirFiles(); } renderAnalyzer(); } return; }
      case 'clear-an': S.checked.clear(); return renderAnalyzer();
      case 'del-large': { const r = await deleteItems([...S.largeChecked.values()]); if (r) { r.done.forEach((d) => { S.largeChecked.delete(d.path); S.scan.top = S.scan.top.filter((x) => x.path !== d.path); }); S.node = null; renderLarge(); renderSidebar(); } return; }
      case 'clear-large': S.largeChecked.clear(); return renderLarge();
      case 'del-smart': { const r = await deleteItems([...S.smartChecked.values()]); if (r) { const gone = new Set(r.done.map((d) => d.path)); gone.forEach((g) => S.smartChecked.delete(g)); S.scan.findings = S.scan.findings.filter((f) => !gone.has(f.path)); S.scan.top = S.scan.top.filter((f) => !gone.has(f.path)); S.appdataBig = (S.appdataBig || []).filter((f) => !gone.has(f.path)); S.node = null; renderSmart(); renderSidebar(); } return; }
      case 'clear-smart': S.smartChecked.clear(); return renderSmart();
      case 'sel-safe': await ensureDefs(); S.defs.categories.forEach((c) => { if (c.risk === 'safe' && S.junk[c.id] && S.junk[c.id].size) S.junkChecked.add(c.id); }); return renderClean();
      case 'clean-sel': return cleanSelected();
      case 'toggle-missing': S.showMissing = !S.showMissing; return renderClean();
      case 'prevent': { const r = await api.prevent(act.dataset.cat); S.prevent[act.dataset.cat] = r.ok; toast(r.ok ? '✅ ' + t('preventOn') : '⚠️ ' + esc(r.error || '') + ' — ' + t('runAdmin'), 5000); return renderClean(); }
      case 'prevent-undo': { await api.preventUndo(act.dataset.cat); S.prevent[act.dataset.cat] = false; return renderClean(); }
      case 'cleanmgr': return api.cleanmgr();
      case 'admin': return api.relaunchAdmin();
      case 'lang': S.lang = S.lang === 'ar' ? 'en' : 'ar'; applyLang(); if (typeof storeNode !== 'undefined' && storeNode) { storeNode.remove(); storeNode = null; } api.saveSettings({ lang: S.lang }); return go(S.view);
      case 'clear-hist': await api.clearHistory(); return renderHistory();
    }
    return;
  }

  const ct = tg.closest('[data-cat-toggle]');
  if (ct) { const id = ct.dataset.catToggle; S.openCats.has(id) ? S.openCats.delete(id) : S.openCats.add(id); return renderClean(); }
  const crumb = tg.closest('[data-crumb]'); if (crumb) { S.sel = null; return openNode(+crumb.dataset.crumb); }
  const at = tg.closest('[data-atab]'); if (at) { S.aTab = at.dataset.atab; if (S.aTab === 'files' && !S.dirFiles) { renderAnalyzer(); await loadDirFiles(); } return renderAnalyzer(); }
  const dr = tg.closest('[data-direct]'); if (dr) { S.aTab = 'files'; renderAnalyzer(); await loadDirFiles(); return renderAnalyzer(); }
  const dir = tg.closest('[data-dir]');
  if (dir && S.view === 'analyzer') {
    const id = +dir.dataset.dir;
    if (tg.closest('.tile')) { S.sel = null; return openNode(id); }
    const n = S.node.children.find((c) => c.id === id);
    if (n) { S.sel = { type: 'dir', ...n }; $('#details').innerHTML = detailsHTML(); $$('.li.sel').forEach((x) => x.classList.remove('sel')); dir.classList.add('sel'); }
    return;
  }
  if (dir && S.view === 'home') { S.sel = null; go('analyzer'); return openNode(+dir.dataset.dir); }
  const fl = tg.closest('[data-file]');
  if (fl) { S.sel = { type: 'file', path: fl.dataset.file, size: +fl.dataset.size, mtime: +fl.dataset.mtime, name: base(fl.dataset.file) }; $('#details').innerHTML = detailsHTML(); $$('.li.sel').forEach((x) => x.classList.remove('sel')); fl.classList.add('sel'); }
});
document.addEventListener('dblclick', (e) => {
  const dir = e.target.closest('.li[data-dir]');
  if (dir && S.view === 'analyzer') { S.sel = null; openNode(+dir.dataset.dir); }
  const fl = e.target.closest('.li[data-file]'); if (fl) api.openFolder(fl.dataset.file);
});
document.addEventListener('change', (e) => {
  if (e.target.id === 'cleanMode') S.cleanMode = e.target.value;
  if (e.target.id === 'lMin') { S.large.min = +e.target.value; renderLarge(); }
  if (e.target.id === 'lAge') { S.large.age = +e.target.value; renderLarge(); }
});
document.addEventListener('input', (e) => {
  if (e.target.id === 'lQ') { S.large.q = e.target.value; clearTimeout(S._q); S._q = setTimeout(() => { renderLarge(); const i = $('#lQ'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 250); }
});
document.addEventListener('click', (e) => { const lt = e.target.closest('[data-ltype]'); if (lt) { S.large.type = lt.dataset.ltype; renderLarge(); } });
$('#scanCancel').addEventListener('click', () => api.cancelScan());
window.addEventListener('resize', () => { if (S.view === 'analyzer') drawTreemap(); });
document.addEventListener('keydown', (e) => {
  if (S.view === 'analyzer' && e.key === 'Backspace' && !/input/i.test(e.target.tagName) && S.node && S.node.node.parent >= 0) { S.sel = null; openNode(S.node.node.parent); }
  if (e.key === 'Escape') $('#modal').classList.contains('on') && $('#modal').click();
});

api.onJunkResult((r) => { S.junk[r.id] = r; if (S.view === 'clean') renderCleanSoon(); });
let _rc = null;
function renderCleanSoon() { clearTimeout(_rc); _rc = setTimeout(renderClean, 120); }

function applyLang() {
  document.documentElement.lang = S.lang;
  document.documentElement.dir = S.lang === 'ar' ? 'rtl' : 'ltr';
}

// ═════════════ البداية ═════════════
async function init() {
  const info = await api.info();
  S.env = info.env; S.isAdmin = info.isAdmin; S.version = info.version;
  S.lang = (info.settings && info.settings.lang) || 'ar';
  S.themeName = (info.settings && info.settings.theme) || 'glass-red';
  if (typeof applyThemeUI === 'function') applyThemeUI(info.theme);
  applyLang();
  await refreshDrives();
  go('home');
}
document.addEventListener('DOMContentLoaded', init);


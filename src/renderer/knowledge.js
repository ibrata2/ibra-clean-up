// قاعدة معرفة: شنو هذا المجلد/الملف وهل حذفه آمن
// risk: safe = آمن | review = راجعه | keep = لا تحذفه | system = نظام (محمي)
(function () {
  const R = (re, risk, ar, en) => ({ re, risk, ar, en });
  // المسار يتحول لأحرف صغيرة و / ومجلد المستخدم يصير ~
  const RULES = [
    R(/^~$/, 'system', 'مجلد حسابك بالكامل — فيه كل ملفاتك وإعدادات برامجك. لا يُحذف، ادخل جواه وشوف شنو ياخذ مساحة.', 'Your whole user profile. Drill in to see what takes space.'),
    R(/^c:\/users$/, 'system', 'مجلد كل حسابات الجهاز.', 'All user accounts on this PC.'),
    R(/^c:\/users\/(public|default|all users|default user)$/, 'system', 'مجلد نظام مشترك بين الحسابات.', 'Shared system profile.'),
    R(/^~\/appdata$/, 'system', 'AppData: بيانات وإعدادات وكاش كل البرامج. مجلد مخفي وعادة هو سبب الحجم الخيالي — ادخل جواه.', 'AppData: settings and caches of every app. Usually the hidden space hog — drill in.'),
    R(/^~\/appdata\/local$/, 'system', 'Local: كاش البرامج وملفاتها الكبيرة (المتصفحات، كاب كات، النماذج...).', 'Local app data and caches.'),
    R(/^~\/appdata\/roaming$/, 'system', 'Roaming: إعدادات البرامج وبعض البيانات (تيليكرام، أدوبي، ايتونز...).', 'Roaming app settings and data.'),
    R(/^~\/appdata\/locallow$/, 'review', 'LocalLow: بيانات بعض الألعاب والبرامج المحمية.', 'Low-integrity app data (games, Java).'),
    R(/\/appdata\/local\/temp(\/|$)/, 'safe', 'ملفات مؤقتة — حذفها آمن.', 'Temporary files — safe to delete.'),
    R(/^~\/desktop$/, 'keep', 'سطح المكتب — ملفاتك الشخصية.', 'Your desktop files.'),
    R(/^~\/documents$/, 'keep', 'المستندات — ملفاتك، وبعض البرامج تحفظ مشاريعها هنا.', 'Your documents; some apps save projects here.'),
    R(/^~\/downloads$/, 'review', 'التنزيلات — غالباً فيها مثبتات وملفات قديمة ما تحتاجها. رتبها حسب الحجم.', 'Downloads — often old installers. Sort by size.'),
    R(/^~\/downloads\/telegram desktop/, 'review', 'ملفات نزلتها من تيليكرام.', 'Files saved from Telegram.'),
    R(/^~\/videos$/, 'keep', 'الفيديوهات — فيها أحياناً مجلدات كاب كات ومسجلات الشاشة.', 'Videos; may contain CapCut / screen recordings.'),
    R(/^~\/videos\/captures/, 'review', 'تسجيلات شاشة Xbox Game Bar.', 'Xbox Game Bar captures.'),
    R(/^~\/pictures$/, 'keep', 'الصور — ملفاتك الشخصية.', 'Your pictures.'),
    R(/^~\/music$/, 'keep', 'الموسيقى.', 'Your music.'),
    R(/^~\/onedrive/, 'review', 'ون درايف — الملفات المتزامنة مع السحابة. إذا حذفت من هنا تنحذف من السحابة هم!', 'OneDrive — deleting here deletes from the cloud too!'),
    R(/^~\/\.cache\/huggingface/, 'review', 'نماذج ذكاء اصطناعي من Hugging Face — ممكن عشرات الجيكات.', 'Hugging Face AI models — can be huge.'),
    R(/^~\/\.ollama/, 'review', 'نماذج Ollama المحلية.', 'Local Ollama models.'),
    R(/^~\/\.cache$/, 'review', 'كاش أدوات البرمجة والذكاء الاصطناعي.', 'Dev and AI tool caches.'),
    R(/^~\/\.gradle/, 'safe', 'كاش Gradle لتطبيقات أندرويد — يتحمل من جديد.', 'Gradle cache — re-downloaded.'),
    R(/^~\/\.android\/avd/, 'review', 'أجهزة أندرويد الوهمية — كل جهاز 5-15 جيكا.', 'Android emulators (5–15 GB each).'),
    R(/^~\/\.android$/, 'review', 'إعدادات وأجهزة Android Studio.', 'Android Studio data.'),
    R(/^~\/\.nuget/, 'review', 'حزم .NET المحملة.', 'NuGet packages.'),
    R(/^~\/\.vscode\/extensions/, 'keep', 'إضافات VS Code.', 'VS Code extensions.'),
    R(/^~\/\.claude/, 'review', 'بيانات Claude Code ومحادثاته.', 'Claude Code data.'),
    R(/^~\/apple\/mobilesync\/backup|\/apple computer\/mobilesync\/backup/, 'review', 'نسخ احتياطية للآيفون/الآيباد — ممكن ضخمة. لا تحذف النسخة الوحيدة لجهازك.', 'iPhone/iPad backups. Keep the only copy.'),
    R(/\/apple computer\/itunes\/(iphone|ipad|ipod) software updates/, 'safe', 'تحديثات iOS (IPSW) محملة — حذفها آمن.', 'Downloaded iOS firmware — safe.'),
    R(/3utools/, 'review', 'ملفات 3uTools — فيرموير، تطبيقات IPA، كاش.', '3uTools firmware, apps and cache.'),
    R(/\/google\/chrome\/user data\/optguideondevicemodel/, 'review', 'نموذج الذكاء الاصطناعي اللي نزله كروم بدون علمك (Gemini Nano).', 'Chrome on-device AI model.'),
    R(/\/google\/chrome\/user data$/, 'keep', 'بيانات كروم (الحسابات والإضافات والكاش). لا تحذفه كامل — نظف الكاش من قسم التنظيف.', 'Chrome profile. Clean only the cache.'),
    R(/\/microsoft\/edge\/user data$/, 'keep', 'بيانات متصفح Edge.', 'Edge profile.'),
    R(/\/capcut\/user data\/projects\/com\.lveditor\.draft/, 'review', 'مشاريع كاب كات — كل مجلد مشروع فيه نسخ الفيديوهات والمعاينات.', 'CapCut projects.'),
    R(/\/capcut\/user data\/cache/, 'safe', 'كاش كاب كات — مؤثرات وموسيقى ومعاينات تتحمل من جديد.', 'CapCut cache — safe.'),
    R(/\/capcut(\/|$)/, 'review', 'ملفات CapCut.', 'CapCut data.'),
    R(/\/adobe\/common\/media cache( files)?/, 'safe', 'كاش بريمير وأفتر — حذفه آمن.', 'Adobe media cache — safe.'),
    R(/\/adobe\/common\/peak files/, 'safe', 'ملفات موجات الصوت لأدوبي — تتولد من جديد.', 'Audio peak files — rebuilt.'),
    R(/adobe premiere pro auto-save/, 'review', 'نسخ الحفظ التلقائي لبريمير.', 'Premiere auto-saves.'),
    R(/adobe premiere pro preview files/, 'review', 'ملفات معاينة بريمير — تتولد عند الرندر.', 'Premiere previews.'),
    R(/\/telegram desktop\/tdata\/user_data/, 'safe', 'كاش تيليكرام — الصور والفيديوهات اللي شفتها.', 'Telegram media cache.'),
    R(/\/telegram desktop\/tdata$/, 'keep', 'جلسة تيليكرام — إذا حذفته يطلع حسابك.', 'Telegram session — keep.'),
    R(/\/packages\/5319275a\.whatsappdesktop/, 'review', 'بيانات واتساب ديسكتوب.', 'WhatsApp Desktop data.'),
    R(/\/claude\/vm_bundles/, 'review', 'ملفات الآلة الافتراضية لتطبيق Claude — تتحمل من جديد عند الحاجة.', 'Claude VM bundles — re-downloaded.'),
    R(/\/npm-cache/, 'safe', 'كاش npm — آمن.', 'npm cache — safe.'),
    R(/\/electron(-builder)?\/cache/, 'safe', 'كاش بناء إلكترون — آمن.', 'Electron build cache — safe.'),
    R(/\/ms-playwright/, 'safe', 'متصفحات الاختبارات الآلية.', 'Playwright browsers.'),
    R(/\/nvidia\/(dx|gl)cache|\/d3dscache/, 'safe', 'كاش كرت الشاشة — آمن.', 'GPU shader cache — safe.'),
    R(/\/crashdumps/, 'safe', 'تقارير أعطال البرامج — آمن.', 'Crash dumps — safe.'),
    R(/\/packages$/, 'system', 'بيانات تطبيقات متجر مايكروسوفت.', 'Microsoft Store app data.'),
    R(/\/programs$/, 'keep', 'برامج مثبتة لحسابك فقط — احذفها من إلغاء التثبيت.', 'Per-user installed apps — uninstall instead.'),
    R(/\/steam\/steamapps/, 'keep', 'ألعاب ستيم — احذفها من ستيم.', 'Steam games — uninstall from Steam.'),
  ];
  const NAME_RULES = [
    R(/^node_modules$/, 'safe', 'مكتبات مشروع جافاسكربت — تقدر ترجعها بأمر npm install. آمن إذا ما تشتغل على المشروع حالياً.', 'Project JS dependencies — restore with npm install.'),
    R(/^__pycache__$/, 'safe', 'كاش بايثون — آمن.', 'Python bytecode cache — safe.'),
    R(/^\.?venv$/, 'review', 'بيئة بايثون افتراضية لمشروع — تنعاد بتثبيت المكتبات.', 'Python virtual environment.'),
    R(/^\.git$/, 'keep', 'تاريخ مشروع Git — لا تحذفه.', 'Git history — keep.'),
    R(/^\.next$|^\.nuxt$|^dist$|^build$|^out$/, 'review', 'ملفات بناء مشروع — تنعاد بالبناء.', 'Build output — rebuilt.'),
    R(/^(cache|code cache|gpucache|cache_data|cache2|dawncache|grshadercache|shadercache)$/, 'safe', 'مجلد كاش — يتولد من جديد.', 'A cache folder — rebuilt automatically.'),
    R(/^(temp|tmp)$/, 'safe', 'مجلد مؤقت.', 'Temporary folder.'),
    R(/^(logs?|crashpad|crash reports)$/, 'safe', 'سجلات وتقارير — غالباً آمن.', 'Logs and reports — usually safe.'),
  ];
  const EXT = {
    video: ['.mp4', '.mkv', '.mov', '.avi', '.wmv', '.flv', '.webm', '.m4v', '.ts', '.mts', '.3gp'],
    image: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.heic', '.tif', '.tiff', '.raw', '.cr2', '.nef', '.arw', '.psd', '.ai', '.svg'],
    audio: ['.mp3', '.wav', '.flac', '.aac', '.m4a', '.ogg', '.wma', '.opus'],
    archive: ['.zip', '.rar', '.7z', '.tar', '.gz', '.xz', '.bz2', '.cab'],
    installer: ['.exe', '.msi', '.msix', '.appx', '.apk', '.ipa', '.ipsw', '.dmg'],
    disk: ['.iso', '.img', '.vhd', '.vhdx', '.vmdk', '.vdi', '.qcow2', '.wim', '.esd'],
    model: ['.gguf', '.safetensors', '.ckpt', '.pt', '.pth', '.bin', '.onnx'],
    doc: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'],
    db: ['.db', '.sqlite', '.ldb', '.log', '.dmp', '.tmp', '.etl', '.cache'],
  };
  const extType = (ext) => { for (const k in EXT) if (EXT[k].includes(ext)) return k; return 'other'; };

  function explain(fullPath, env) {
    let p = String(fullPath).replace(/\\/g, '/').toLowerCase().replace(/\/+$/, '');
    const u = String(env.U || '').replace(/\\/g, '/').toLowerCase();
    if (u && (p === u || p.startsWith(u + '/'))) p = '~' + p.slice(u.length);
    for (const r of RULES) if (r.re.test(p)) return r;
    const name = p.split('/').pop();
    for (const r of NAME_RULES) if (r.re.test(name)) return r;
    if (/\/appdata\/(local|roaming)\/[^/]+$/.test(p)) return { risk: 'review', ar: 'بيانات برنامج "' + fullPath.split(/[\\/]/).pop() + '". إذا البرنامج محذوف من جهازك، فهذا المجلد بقايا وتقدر تحذفه.', en: 'App data folder. If the app is uninstalled, these are leftovers.' };
    return null;
  }
  window.IBRA_KB = { explain, extType, EXT };
})();

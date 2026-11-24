// يضع أيقونة البرنامج ومعلومات الإصدار داخل ملف exe (بدون الحاجة لـ wine)
const path = require('path');
const fs = require('fs');

exports.default = async function afterPack(ctx) {
  if (ctx.electronPlatformName !== 'win32') return;
  const ResEdit = await import('resedit');
  const { NtExecutable, NtExecutableResource, Resource, Data } = ResEdit.default || ResEdit;
  const pkg = require('../package.json');
  const exePath = path.join(ctx.appOutDir, `${ctx.packager.appInfo.productFilename}.exe`);
  const exe = NtExecutable.from(fs.readFileSync(exePath), { ignoreCert: true });
  const res = NtExecutableResource.from(exe);

  const ico = Data.IconFile.from(fs.readFileSync(path.join(__dirname, '..', 'build', 'icon.ico')));
  const groups = Resource.IconGroupEntry.fromEntries(res.entries);
  const groupId = groups.length ? groups[0].id : 1;
  const lang = groups.length ? groups[0].lang : 1033;
  Resource.IconGroupEntry.replaceIconsForResource(res.entries, groupId, lang, ico.icons.map((i) => i.data));

  const vi = Resource.VersionInfo.fromEntries(res.entries)[0] || Resource.VersionInfo.createEmpty();
  const [a, b, c] = pkg.version.split('.').map(Number);
  vi.setFileVersion(a, b, c, 0, 1033);
  vi.setProductVersion(a, b, c, 0, 1033);
  vi.setStringValues({ lang: 1033, codepage: 1200 }, {
    FileDescription: 'IBRA CLEAN UP',
    ProductName: 'IBRA CLEAN UP',
    CompanyName: 'IBRAPROGRAM',
    LegalCopyright: '© IBRAPROGRAM - Ibrahim Al-Khazraji',
    OriginalFilename: 'IBRA CLEAN UP.exe',
    InternalName: 'ibra-clean-up',
  });
  vi.outputToResourceEntries(res.entries);
  res.outputResource(exe);
  fs.writeFileSync(exePath, Buffer.from(exe.generate()));
  console.log('  • IBRA: icon + version info set on', path.basename(exePath));
};

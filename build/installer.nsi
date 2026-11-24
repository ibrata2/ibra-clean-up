; IBRA CLEAN UP — ملف التثبيت
; برمجة وتطوير ابراهيم الخزرجي — IBRAPROGRAM
Unicode true
SetCompressor /SOLID lzma

!define APPNAME "IBRA CLEAN UP"
!define EXENAME "IBRA CLEAN UP.exe"
!ifndef VERSION
  !define VERSION "1.0.0"
!endif
!define PUBLISHER "IBRAPROGRAM - Ibrahim Al-Khazraji"
!define UNKEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\IbraCleanUp"

Name "${APPNAME}"
OutFile "..\dist\IBRA-CLEAN-UP-Setup-${VERSION}.exe"
InstallDir "$LOCALAPPDATA\Programs\IBRA CLEAN UP"
InstallDirRegKey HKCU "Software\IbraCleanUp" "InstallDir"
RequestExecutionLevel user
BrandingText "IBRAPROGRAM • ibraprogram.netlify.app"
VIProductVersion "${VERSION}.0"
VIAddVersionKey /LANG=1033 "ProductName" "${APPNAME}"
VIAddVersionKey /LANG=1033 "CompanyName" "IBRAPROGRAM"
VIAddVersionKey /LANG=1033 "FileDescription" "${APPNAME} Setup"
VIAddVersionKey /LANG=1033 "FileVersion" "${VERSION}"
VIAddVersionKey /LANG=1033 "LegalCopyright" "© IBRAPROGRAM"

!include "MUI2.nsh"
!define MUI_ICON "icon.ico"
!define MUI_UNICON "icon.ico"
!define MUI_ABORTWARNING
!define MUI_FINISHPAGE_RUN "$INSTDIR\${EXENAME}"
!define MUI_WELCOMEPAGE_TITLE "IBRA CLEAN UP ${VERSION}"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "Arabic"
!insertmacro MUI_LANGUAGE "English"

Function .onInit
  IfSilent skipLang
  !insertmacro MUI_LANGDLL_DISPLAY
  skipLang:
FunctionEnd

Section "Install"
  nsExec::Exec 'taskkill /F /IM "${EXENAME}"'
  SetOutPath "$INSTDIR"
  File /r "..\dist\win-unpacked\*.*"
  WriteUninstaller "$INSTDIR\Uninstall IBRA CLEAN UP.exe"
  CreateShortCut "$DESKTOP\${APPNAME}.lnk" "$INSTDIR\${EXENAME}"
  CreateDirectory "$SMPROGRAMS\IBRAPROGRAM"
  CreateShortCut "$SMPROGRAMS\IBRAPROGRAM\${APPNAME}.lnk" "$INSTDIR\${EXENAME}"
  CreateShortCut "$SMPROGRAMS\IBRAPROGRAM\Uninstall ${APPNAME}.lnk" "$INSTDIR\Uninstall IBRA CLEAN UP.exe"
  WriteRegStr HKCU "Software\IbraCleanUp" "InstallDir" "$INSTDIR"
  WriteRegStr HKCU "${UNKEY}" "DisplayName" "${APPNAME}"
  WriteRegStr HKCU "${UNKEY}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "${UNKEY}" "Publisher" "${PUBLISHER}"
  WriteRegStr HKCU "${UNKEY}" "DisplayIcon" "$INSTDIR\${EXENAME}"
  WriteRegStr HKCU "${UNKEY}" "UninstallString" '"$INSTDIR\Uninstall IBRA CLEAN UP.exe"'
  WriteRegStr HKCU "${UNKEY}" "URLInfoAbout" "https://ibraprogram.netlify.app/"
  WriteRegDWORD HKCU "${UNKEY}" "NoModify" 1
  WriteRegDWORD HKCU "${UNKEY}" "NoRepair" 1
  ; تحديث داخلي صامت: نعيد تشغيل البرنامج بعد التنصيب
  IfSilent 0 notSilent
    Exec '"$INSTDIR\${EXENAME}"'
  notSilent:
SectionEnd

Section "Uninstall"
  nsExec::Exec 'taskkill /F /IM "${EXENAME}"'
  Delete "$DESKTOP\${APPNAME}.lnk"
  Delete "$SMPROGRAMS\IBRAPROGRAM\${APPNAME}.lnk"
  Delete "$SMPROGRAMS\IBRAPROGRAM\Uninstall ${APPNAME}.lnk"
  RMDir "$SMPROGRAMS\IBRAPROGRAM"
  RMDir /r "$INSTDIR"
  DeleteRegKey HKCU "${UNKEY}"
  DeleteRegKey HKCU "Software\IbraCleanUp"
SectionEnd

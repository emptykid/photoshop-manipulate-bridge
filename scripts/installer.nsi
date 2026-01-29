; Photoshop Manipulate Bridge - NSIS Installer (Windows 64-bit)
; Target: $COMMONPROGRAMFILES\Adobe\Plug-Ins\CC\Generator\photoshop-manipulate-bridge
; Build (64-bit): makensis -Dx64 -DVERSION=1.0.0 -DSTAGEDIR=..\stage\win scripts\installer.nsi
; Run from project root.

!include "MUI2.nsh"
!include "x64.nsh"
!include "LogicLib.nsh"

; ---------------------------------------------------------------------------
; Defines (override via /DVERSION= and /DSTAGEDIR= when calling makensis)
!ifndef VERSION
  !define VERSION "1.0.0"
!endif
!ifndef STAGEDIR
  !define STAGEDIR "..\stage\win"
!endif

!define PRODUCT_NAME "Photoshop Manipulate Bridge"
!define PRODUCT_FOLDER "photoshop-manipulate-bridge"
!define INSTALLER_NAME "PhotoshopManipulateBridge-Setup-${VERSION}.exe"

; ---------------------------------------------------------------------------
; General
Name "${PRODUCT_NAME}"
OutFile "..\release\${INSTALLER_NAME}"
Unicode true
RequestExecutionLevel admin
; Prefer 64-bit build so install dir is C:\Program Files\Common Files\...
!ifdef x64
  !define INSTALLER_ARCH "x64"
!endif

; ---------------------------------------------------------------------------
; Install dir: Common Files (64-bit) \ Adobe \ Plug-Ins \ CC \ Generator
; $COMMONFILES64 is not in NSIS; we use env COMMONPROGRAMFILES (64-bit when process is 64-bit)
InstallDir "$COMMONFILES\Adobe\Plug-Ins\CC\Generator"
InstallDirRegKey HKLM "SOFTWARE\Adobe\Photoshop\Generator" "InstallPath"

; ---------------------------------------------------------------------------
; Set install dir to 64-bit Common Files before directory page
Function .onInit
  ${If} ${RunningX64}
    ReadEnvStr $0 COMMONPROGRAMFILES
    ${If} $0 != ""
      StrCpy $INSTDIR "$0\Adobe\Plug-Ins\CC\Generator"
    ${EndIf}
  ${EndIf}
FunctionEnd

; ---------------------------------------------------------------------------
; Pages
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "English"

; ---------------------------------------------------------------------------
; Installer Section
Section "Install" SecInstall
  ${If} ${RunningX64}
    ; 64-bit: use 64-bit Common Files (C:\Program Files\Common Files)
    SetRegView 64
    ReadEnvStr $0 COMMONPROGRAMFILES
    ${If} $0 == ""
      StrCpy $0 "$COMMONFILES"
    ${EndIf}
    StrCpy $INSTDIR "$0\Adobe\Plug-Ins\CC\Generator"
  ${Else}
    ; 32-bit fallback
    StrCpy $INSTDIR "$COMMONFILES\Adobe\Plug-Ins\CC\Generator"
  ${EndIf}

  SetOutPath "$INSTDIR\${PRODUCT_FOLDER}"
  File /r "${STAGEDIR}\${PRODUCT_FOLDER}\*.*"

  ; Save install path for uninstall
  WriteRegStr HKLM "SOFTWARE\Adobe\Photoshop\Generator" "InstallPath" "$INSTDIR"
  WriteUninstaller "$INSTDIR\${PRODUCT_FOLDER}\Uninstall.exe"
SectionEnd

; ---------------------------------------------------------------------------
; Uninstaller Section
Section "Uninstall" SecUninstall
  ReadRegStr $0 HKLM "SOFTWARE\Adobe\Photoshop\Generator" "InstallPath"
  ${If} $0 != ""
    StrCpy $INSTDIR "$0"
  ${EndIf}
  RMDir /r "$INSTDIR\${PRODUCT_FOLDER}"
  DeleteRegKey HKLM "SOFTWARE\Adobe\Photoshop\Generator"
SectionEnd

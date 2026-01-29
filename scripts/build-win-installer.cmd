@echo off
REM Build Windows NSIS installer for Photoshop Manipulate Bridge
REM Target: %COMMONPROGRAMFILES%\Adobe\Plug-Ins\CC\Generator\photoshop-manipulate-bridge
REM Requires: NSIS (makensis) in PATH. Run from project root.

setlocal
cd /d "%~dp0\.."

for /f "delims=" %%v in ('node -p "require('./package.json').version"') do set VERSION=%%v
set PRODUCT_FOLDER=photoshop-manipulate-bridge
set STAGE_DIR=%~dp0..\stage\win
set RELEASE_DIR=%~dp0..\release

echo Building Photoshop Manipulate Bridge v%VERSION% for Windows (NSIS)
echo.

echo Running npm run build...
call npm run build
if errorlevel 1 exit /b 1

echo Preparing stage...
if not exist "%STAGE_DIR%\%PRODUCT_FOLDER%" mkdir "%STAGE_DIR%\%PRODUCT_FOLDER%"
xcopy /E /Y /Q dist\* "%STAGE_DIR%\%PRODUCT_FOLDER%\" >nul

if not exist "%RELEASE_DIR%" mkdir "%RELEASE_DIR%"

where makensis >nul 2>nul
if errorlevel 1 (
  echo Error: makensis ^(NSIS^) not found. Install NSIS and add it to PATH.
  echo   https://nsis.sourceforge.io/Download
  exit /b 1
)

echo Running NSIS (64-bit)...
makensis -Dx64 -DVERSION=%VERSION% -DSTAGEDIR=..\stage\win "%~dp0installer.nsi"
if errorlevel 1 exit /b 1

echo.
echo Done. Installer: %RELEASE_DIR%\PhotoshopManipulateBridge-Setup-%VERSION%.exe
echo Install target: %%COMMONPROGRAMFILES%%\Adobe\Plug-Ins\CC\Generator\%PRODUCT_FOLDER%

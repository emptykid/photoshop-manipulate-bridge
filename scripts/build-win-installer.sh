#!/usr/bin/env bash
# Build Windows NSIS installer for Photoshop Manipulate Bridge
# Target: %COMMONPROGRAMFILES%\Adobe\Plug-Ins\CC\Generator\photoshop-manipulate-bridge
# Requires: NSIS (makensis). Run from project root.
# On Windows: use Git Bash or WSL; or run build-win-installer.cmd instead.

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

VERSION="$(node -p "require('./package.json').version")"
PRODUCT_FOLDER="photoshop-manipulate-bridge"
STAGE_DIR="$ROOT/stage/win"
RELEASE_DIR="$ROOT/release"

echo "Building Photoshop Manipulate Bridge v${VERSION} for Windows (NSIS)"
echo ""

# 1. Build dist
echo "Running npm run build..."
npm run build

# 2. Prepare stage: stage/win/photoshop-manipulate-bridge/
mkdir -p "$STAGE_DIR/$PRODUCT_FOLDER"
cp -R dist/. "$STAGE_DIR/$PRODUCT_FOLDER/"

# 3. Run NSIS (makensis). Paths relative to script dir for installer.nsi.
mkdir -p "$RELEASE_DIR"

if ! command -v makensis >/dev/null 2>&1; then
  echo "Error: makensis (NSIS) not found. Install NSIS and add it to PATH."
  echo "  - Windows: https://nsis.sourceforge.io/Download"
  echo "  - macOS (Homebrew): brew install nsis"
  exit 1
fi

# Run from project root; script is scripts/installer.nsi
# -Dx64: build 64-bit installer so install dir is C:\Program Files\Common Files\...
# STAGEDIR relative to script file = scripts/ -> ..\stage\win
makensis -Dx64 -DVERSION="$VERSION" -DSTAGEDIR="..\\stage\\win" "$ROOT/scripts/installer.nsi"

echo ""
echo "Done. Installer: $RELEASE_DIR/PhotoshopManipulateBridge-Setup-${VERSION}.exe"
echo "Install target: %COMMONPROGRAMFILES%\\Adobe\\Plug-Ins\\CC\\Generator\\$PRODUCT_FOLDER"

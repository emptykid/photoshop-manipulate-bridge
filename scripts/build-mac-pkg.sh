#!/usr/bin/env bash
# Build macOS .pkg installer for Photoshop Manipulate Bridge
# Target: /Library/Application Support/Adobe/Plug-Ins/CC/Generator/photoshop-manipulate-bridge
# Uses system pkgbuild. Run from project root.

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

VERSION="$(node -p "require('./package.json').version")"
IDENTIFIER="com.adobe.plugin.photoshop-manipulate-bridge"
PRODUCT_FOLDER="photoshop-manipulate-bridge"
STAGE_DIR="$ROOT/stage/mac"
SUPPORT_DIR="/Library/Application Support/Adobe/Plug-Ins/CC/Generator"
RELEASE_DIR="$ROOT/release"

echo "Building Photoshop Manipulate Bridge v${VERSION} for macOS"
echo ""

# 1. Build dist
echo "Running npm run build..."
npm run build

# 2. Prepare stage: only Generator path, no other Adobe dirs
rm -rf "$STAGE_DIR"
mkdir -p "$STAGE_DIR/$SUPPORT_DIR/$PRODUCT_FOLDER"
cp -R dist/. "$STAGE_DIR/$SUPPORT_DIR/$PRODUCT_FOLDER/"

# 3. Build .pkg with pkgbuild (install-location / so paths become /Library/...)
mkdir -p "$RELEASE_DIR"
PKG_PATH="$RELEASE_DIR/photoshop-manipulate-bridge-${VERSION}.pkg"

echo "Creating package..."
pkgbuild \
  --root "$STAGE_DIR" \
  --identifier "$IDENTIFIER" \
  --version "$VERSION" \
  --install-location "/" \
  "$PKG_PATH"

echo ""
echo "Done. Package: $PKG_PATH"
echo "Install target: $SUPPORT_DIR/$PRODUCT_FOLDER"

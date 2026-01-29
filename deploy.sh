#!/bin/bash

# Photoshop Manipulate Bridge Deployment Script

set -e

echo "🔨 Building plugin..."
npm run build

echo ""
echo "📦 Plugin built successfully!"
echo ""
echo "📍 Deployment options:"
echo ""
echo "1. Deploy to Photoshop Generator plugins folder"
echo "2. Show dist directory location (manual copy)"
echo "3. Exit"
echo ""
read -p "Choose an option (1-3): " choice

case $choice in
  1)
    # Find Photoshop installations
    PS_BASE="$HOME/Library/Application Support/Adobe"
    
    if [ ! -d "$PS_BASE" ]; then
      echo "❌ Adobe folder not found at: $PS_BASE"
      exit 1
    fi
    
    # List available Photoshop versions
    echo ""
    echo "Available Photoshop installations:"
    PS_DIRS=($(find "$PS_BASE" -maxdepth 1 -type d -name "Adobe Photoshop*" 2>/dev/null))
    
    if [ ${#PS_DIRS[@]} -eq 0 ]; then
      echo "❌ No Photoshop installations found"
      exit 1
    fi
    
    # Display options
    for i in "${!PS_DIRS[@]}"; do
      echo "$((i+1)). $(basename "${PS_DIRS[$i]}")"
    done
    
    echo ""
    read -p "Select Photoshop version (1-${#PS_DIRS[@]}): " ps_choice
    
    if [ "$ps_choice" -lt 1 ] || [ "$ps_choice" -gt ${#PS_DIRS[@]} ]; then
      echo "❌ Invalid selection"
      exit 1
    fi
    
    SELECTED_PS="${PS_DIRS[$((ps_choice-1))]}"
    PLUGIN_DIR="$SELECTED_PS/Plug-ins/Generator"
    TARGET_DIR="$PLUGIN_DIR/photoshop-manipulate-bridge"
    
    # Create Generator directory if it doesn't exist
    mkdir -p "$PLUGIN_DIR"
    
    # Remove existing installation
    if [ -L "$TARGET_DIR" ] || [ -d "$TARGET_DIR" ]; then
      echo "🗑️  Removing existing installation..."
      rm -rf "$TARGET_DIR"
    fi
    
    # Create symlink to dist directory
    echo "🔗 Creating symlink..."
    ln -s "$(pwd)/dist" "$TARGET_DIR"
    
    echo ""
    echo "✅ Plugin deployed successfully!"
    echo "📂 Location: $TARGET_DIR"
    echo ""
    echo "Next steps:"
    echo "1. Open Photoshop"
    echo "2. Enable Generator: File > Generate > Image Assets"
    echo "3. Check if plugin is loaded in the console"
    echo ""
    ;;
    
  2)
    echo ""
    echo "📂 Dist directory location:"
    echo "$(pwd)/dist"
    echo ""
    echo "Manually copy this folder to:"
    echo "$HOME/Library/Application Support/Adobe/Adobe Photoshop [Version]/Plug-ins/Generator/"
    echo ""
    ;;
    
  3)
    echo "Exiting..."
    exit 0
    ;;
    
  *)
    echo "❌ Invalid option"
    exit 1
    ;;
esac

#!/bin/bash
set -e

# ANSI Color formatting
BOLD="\033[1m"
GREEN="\033[32m"
BLUE="\033[34m"
PURPLE="\033[35m"
CYAN="\033[36m"
RESET="\033[0m"

APP_NAME="DevNotes"
BUNDLE_DIR="${APP_NAME}.app"
CONTENTS_DIR="${BUNDLE_DIR}/Contents"
MACOS_DIR="${CONTENTS_DIR}/MacOS"
RESOURCES_DIR="${CONTENTS_DIR}/Resources"

echo -e "${PURPLE}${BOLD}========================================${RESET}"
echo -e "${PURPLE}${BOLD}   🚀 DevNotes macOS App Builder       ${RESET}"
echo -e "${PURPLE}${BOLD}========================================${RESET}\n"

# Step 1: Build React/Vite Frontend
echo -e "${CYAN}[1/5] Building React Frontend with Vite...${RESET}"
npm run build

# Step 2: Create .app Bundle Directory Structure
echo -e "${CYAN}[2/5] Setting up macOS .app bundle directory structure...${RESET}"
rm -rf "${BUNDLE_DIR}"
mkdir -p "${MACOS_DIR}"
mkdir -p "${RESOURCES_DIR}"

# Copy built web dist into Resources
cp -R dist "${RESOURCES_DIR}/dist"

# Step 3: Generate and Copy App Icon
echo -e "${CYAN}[3/5] Generating High-Resolution macOS AppIcon...${RESET}"
if [ ! -f "scripts/AppIcon.icns" ]; then
    mkdir -p scripts
    swift scripts/generate_icon.swift scripts/app_icon.png
    mkdir -p scripts/AppIcon.iconset
    sips -z 16 16     scripts/app_icon.png --out scripts/AppIcon.iconset/icon_16x16.png > /dev/null
    sips -z 32 32     scripts/app_icon.png --out scripts/AppIcon.iconset/icon_16x16@2x.png > /dev/null
    sips -z 32 32     scripts/app_icon.png --out scripts/AppIcon.iconset/icon_32x32.png > /dev/null
    sips -z 64 64     scripts/app_icon.png --out scripts/AppIcon.iconset/icon_32x32@2x.png > /dev/null
    sips -z 128 128   scripts/app_icon.png --out scripts/AppIcon.iconset/icon_128x128.png > /dev/null
    sips -z 256 256   scripts/app_icon.png --out scripts/AppIcon.iconset/icon_128x128@2x.png > /dev/null
    sips -z 256 256   scripts/app_icon.png --out scripts/AppIcon.iconset/icon_256x256.png > /dev/null
    sips -z 512 512   scripts/app_icon.png --out scripts/AppIcon.iconset/icon_256x256@2x.png > /dev/null
    sips -z 512 512   scripts/app_icon.png --out scripts/AppIcon.iconset/icon_512x512.png > /dev/null
    sips -z 1024 1024 scripts/app_icon.png --out scripts/AppIcon.iconset/icon_512x512@2x.png > /dev/null
    iconutil -c icns scripts/AppIcon.iconset -o scripts/AppIcon.icns
fi
cp scripts/AppIcon.icns "${RESOURCES_DIR}/AppIcon.icns"

# Step 4: Generate Info.plist
echo -e "${CYAN}[4/5] Creating Info.plist metadata...${RESET}"
cat << 'EOF' > "${CONTENTS_DIR}/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>DevNotes</string>
    <key>CFBundleIdentifier</key>
    <string>com.monmon.devnotes</string>
    <key>CFBundleName</key>
    <string>DevNotes</string>
    <key>CFBundleDisplayName</key>
    <string>DevNotes</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>LSMinimumSystemVersion</key>
    <string>12.0</string>
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
    </dict>
</dict>
</plist>
EOF

# Step 5: Compile Native Swift Cocoa + WebKit Launcher
echo -e "${CYAN}[5/5] Compiling native Swift Cocoa/WebKit executable binary...${RESET}"
swiftc -O -framework Cocoa -framework WebKit scripts/main.swift -o "${MACOS_DIR}/DevNotes"

# Ad-hoc Code Sign for macOS Gatekeeper
codesign --force --deep --sign - "${BUNDLE_DIR}" > /dev/null 2>&1 || true

echo -e "\n${GREEN}${BOLD}🎉 Chúc mừng! Đã build thành công: ${BUNDLE_DIR}${RESET}"
echo -e "${BLUE}▶ Để khởi chạy ứng dụng ngay: ${BOLD}open ${BUNDLE_DIR}${RESET}"
echo -e "${BLUE}▶ Hoặc sao chép vào thư mục Applications: ${BOLD}cp -R ${BUNDLE_DIR} /Applications/${RESET}\n"

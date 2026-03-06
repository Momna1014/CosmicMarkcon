#!/bin/bash

# React Native Cache Cleanup Script
# Run this script after copying the project to a new location
# or when facing build issues due to cached paths

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     React Native Cache Cleanup & Reset Script         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to remove directory/file if exists
remove_if_exists() {
    local path=$1
    local description=$2
    
    if [ -e "$path" ]; then
        rm -rf "$path"
        echo -e "${GREEN}✓${NC} Removed: $description"
    else
        echo -e "${YELLOW}⊘${NC} Not found: $description (skipping)"
    fi
}

# 1. Clean npm/yarn cache
echo -e "\n${YELLOW}📦 Cleaning package manager cache...${NC}"
remove_if_exists "node_modules" "Node modules"
remove_if_exists "yarn.lock" "Yarn lock file"
remove_if_exists "package-lock.json" "NPM lock file"

# 2. Clean watchman cache
echo -e "\n${YELLOW}👁️  Cleaning Watchman cache...${NC}"
if command -v watchman &> /dev/null; then
    watchman watch-del-all 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Cleared Watchman cache"
else
    echo -e "${YELLOW}⊘${NC} Watchman not installed (skipping)"
fi

# 3. Clean Metro bundler cache
echo -e "\n${YELLOW}🚇 Cleaning Metro bundler cache...${NC}"
remove_if_exists "$TMPDIR/react-native-packager-cache-*" "Metro packager cache"
remove_if_exists "$TMPDIR/metro-*" "Metro cache"
remove_if_exists ".metro" "Local Metro cache"

# 4. Clean React Native cache
echo -e "\n${YELLOW}⚛️  Cleaning React Native cache...${NC}"
remove_if_exists "$TMPDIR/react-*" "React Native temp files"
if [ -d "$HOME/.rncache" ]; then
    rm -rf "$HOME/.rncache"
    echo -e "${GREEN}✓${NC} Removed React Native cache"
fi

# 5. Clean Android build cache
echo -e "\n${YELLOW}🤖 Cleaning Android cache...${NC}"
remove_if_exists "android/build" "Android build folder"
remove_if_exists "android/app/build" "Android app build folder"
remove_if_exists "android/.gradle" "Android Gradle cache"
remove_if_exists "android/app/.cxx" "Android C++ cache"
remove_if_exists "android/.cxx" "Android C++ cache (root)"

# Clean global Gradle cache (optional - only cached autolinking files)
if [ -d "$HOME/.gradle/caches" ]; then
    echo -e "${YELLOW}Cleaning Gradle autolinking cache...${NC}"
    find "$HOME/.gradle/caches" -name "autolinking.json" -delete 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Removed Gradle autolinking cache"
fi

# 6. Clean iOS build cache
echo -e "\n${YELLOW}🍎 Cleaning iOS cache...${NC}"
remove_if_exists "ios/build" "iOS build folder"
remove_if_exists "ios/Pods" "iOS Pods"
remove_if_exists "ios/Podfile.lock" "iOS Podfile lock"

# Clean derived data
if [ -d "$HOME/Library/Developer/Xcode/DerivedData" ]; then
    PROJECT_NAME=$(basename "$(pwd)")
    echo -e "${YELLOW}Searching for DerivedData for $PROJECT_NAME...${NC}"
    find "$HOME/Library/Developer/Xcode/DerivedData" -maxdepth 1 -name "*$PROJECT_NAME*" -exec rm -rf {} \; 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Cleaned Xcode DerivedData"
fi

# 7. Clean CocoaPods cache
echo -e "\n${YELLOW}🍫 Cleaning CocoaPods cache...${NC}"
if command -v pod &> /dev/null; then
    pod cache clean --all 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Cleaned CocoaPods cache"
else
    echo -e "${YELLOW}⊘${NC} CocoaPods not installed (skipping)"
fi

# 8. Clean React Native CLI cache
echo -e "\n${YELLOW}🔧 Cleaning React Native CLI cache...${NC}"
if [ -d "$HOME/.react-native-cli" ]; then
    rm -rf "$HOME/.react-native-cli"
    echo -e "${GREEN}✓${NC} Removed React Native CLI cache"
fi

# 9. Clean Jest cache
echo -e "\n${YELLOW}🃏 Cleaning Jest cache...${NC}"
remove_if_exists ".jest" "Jest cache"

# 10. Clean TypeScript build info
echo -e "\n${YELLOW}📘 Cleaning TypeScript cache...${NC}"
remove_if_exists "tsconfig.tsbuildinfo" "TypeScript build info"

# Summary
echo -e "\n${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            Cache Cleanup Complete! ✅                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Next steps
echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo -e "${YELLOW}1.${NC} Install dependencies:"
echo -e "   ${GREEN}yarn install${NC}"
echo ""
echo -e "${YELLOW}2.${NC} Install iOS pods:"
echo -e "   ${GREEN}cd ios && pod install && cd ..${NC}"
echo ""
echo -e "${YELLOW}3.${NC} Start Metro bundler:"
echo -e "   ${GREEN}yarn start --reset-cache${NC}"
echo ""
echo -e "${YELLOW}4.${NC} Run the app:"
echo -e "   Android: ${GREEN}yarn android${NC}"
echo -e "   iOS: ${GREEN}yarn ios${NC}"
echo ""
echo -e "${BLUE}💡 Tip:${NC} If you still face issues, try restarting your terminal and running the commands again."
echo ""

#!/bin/bash

# Quick Widget Status Checker
# This script checks if widgets are enabled in the current project

set -e

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "enabled" ]; then
        echo -e "${GREEN}✓ $message${NC}"
    elif [ "$status" = "disabled" ]; then
        echo -e "${RED}✗ $message${NC}"
    else
        echo -e "${YELLOW}⚠ $message${NC}"
    fi
}

echo -e "${BLUE}=== Widget Status Check ===${NC}"
echo ""

# Check widget.config.js
if [ -f "widget.config.js" ]; then
    if command -v node &> /dev/null; then
        CONFIG_ENABLED=$(node -e "try { const c = require('./widget.config.js'); console.log(c.ENABLE_WIDGETS ? 'true' : 'false'); } catch(e) { console.log('unknown'); }")
        if [ "$CONFIG_ENABLED" = "true" ]; then
            print_status "enabled" "widget.config.js: ENABLED"
        elif [ "$CONFIG_ENABLED" = "false" ]; then
            print_status "disabled" "widget.config.js: DISABLED"
        else
            print_status "warning" "widget.config.js: Could not read"
        fi
    else
        print_status "warning" "Node.js not found, cannot read widget.config.js"
    fi
else
    print_status "warning" "widget.config.js not found"
fi

# Detect package name
if [ -f "android/app/build.gradle" ]; then
    PACKAGE=$(grep -m 1 'namespace' android/app/build.gradle | sed 's/.*namespace "\(.*\)".*/\1/')
    PACKAGE_PATH=$(echo "$PACKAGE" | tr '.' '/')
else
    echo -e "${RED}Error: Cannot detect Android package${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Checking widget files:${NC}"

# Check widget source files
WIDGET_DIR="android/app/src/main/java/$PACKAGE_PATH/widget"
if [ -d "$WIDGET_DIR" ]; then
    print_status "enabled" "Widget directory exists: $WIDGET_DIR"
    
    [ -f "$WIDGET_DIR/TodoWidgetProvider.kt" ] && print_status "enabled" "  TodoWidgetProvider.kt" || print_status "disabled" "  TodoWidgetProvider.kt (missing)"
    [ -f "$WIDGET_DIR/WidgetBridge.kt" ] && print_status "enabled" "  WidgetBridge.kt" || print_status "disabled" "  WidgetBridge.kt (missing)"
    [ -f "$WIDGET_DIR/WidgetPackage.kt" ] && print_status "enabled" "  WidgetPackage.kt" || print_status "disabled" "  WidgetPackage.kt (missing)"
else
    print_status "disabled" "Widget directory not found"
fi

# Check widget resources
echo ""
echo -e "${BLUE}Checking widget resources:${NC}"

[ -f "android/app/src/main/res/layout/widget_todo_list.xml" ] && print_status "enabled" "widget_todo_list.xml" || print_status "disabled" "widget_todo_list.xml (missing)"
[ -f "android/app/src/main/res/xml/widget_todo_list_info.xml" ] && print_status "enabled" "widget_todo_list_info.xml" || print_status "disabled" "widget_todo_list_info.xml (missing)"
[ -f "android/app/src/main/res/drawable/widget_background.xml" ] && print_status "enabled" "widget_background.xml" || print_status "disabled" "widget_background.xml (missing)"

# Check TypeScript files
echo ""
echo -e "${BLUE}Checking TypeScript integration:${NC}"

[ -f "src/services/WidgetService.ts" ] && print_status "enabled" "WidgetService.ts" || print_status "disabled" "WidgetService.ts (missing)"
[ -f "src/screens/WidgetTestScreen.tsx" ] && print_status "enabled" "WidgetTestScreen.tsx" || print_status "disabled" "WidgetTestScreen.tsx (missing)"

# Check AndroidManifest
echo ""
echo -e "${BLUE}Checking AndroidManifest:${NC}"

if [ -f "android/app/src/main/AndroidManifest.xml" ]; then
    if grep -q "WIDGET_DISABLED" "android/app/src/main/AndroidManifest.xml"; then
        print_status "disabled" "Widget receiver DISABLED in AndroidManifest (commented)"
        MANIFEST_DISABLED=true
    elif grep -q "TodoWidgetProvider" "android/app/src/main/AndroidManifest.xml"; then
        print_status "enabled" "Widget receiver ENABLED in AndroidManifest"
        MANIFEST_DISABLED=false
    else
        print_status "warning" "Widget receiver NOT found in AndroidManifest"
        MANIFEST_DISABLED=true
    fi
fi

# Check MainApplication
echo ""
echo -e "${BLUE}Checking MainApplication:${NC}"

MAIN_APP="android/app/src/main/java/$PACKAGE_PATH/MainApplication.kt"
if [ -f "$MAIN_APP" ]; then
    if grep -q "WIDGET_DISABLED" "$MAIN_APP"; then
        print_status "disabled" "WidgetPackage DISABLED in MainApplication (commented)"
        MAIN_APP_DISABLED=true
    elif grep -q "add(WidgetPackage())" "$MAIN_APP" && ! grep -q "// WIDGET_DISABLED add(WidgetPackage())" "$MAIN_APP"; then
        print_status "enabled" "WidgetPackage ENABLED in MainApplication"
        MAIN_APP_DISABLED=false
    else
        print_status "disabled" "WidgetPackage NOT registered in MainApplication"
        MAIN_APP_DISABLED=true
    fi
fi

# Summary
echo ""
echo -e "${BLUE}=== Summary ===${NC}"

# Determine overall status
if [ "$CONFIG_ENABLED" = "false" ] && [ "$MANIFEST_DISABLED" = true ] && [ "$MAIN_APP_DISABLED" = true ]; then
    echo -e "${GREEN}✅ Widgets are FULLY DISABLED in this project${NC}"
    echo ""
    echo "Widget will NOT appear in launcher."
    echo ""
    echo "To enable widgets:"
    echo -e "  ${BLUE}npm run widget:enable${NC}"
    echo -e "  ${BLUE}yarn widget:enable${NC}"
elif [ "$CONFIG_ENABLED" = "true" ] && [ "$MANIFEST_DISABLED" = false ] && [ "$MAIN_APP_DISABLED" = false ]; then
    echo -e "${GREEN}✅ Widgets are FULLY ENABLED in this project${NC}"
    echo ""
    echo "Widget WILL appear in launcher."
    echo ""
    echo "To disable widgets:"
    echo -e "  ${BLUE}npm run widget:disable${NC}"
    echo -e "  ${BLUE}yarn widget:disable${NC}"
else
    echo -e "${YELLOW}⚠️  Widgets are PARTIALLY configured${NC}"
    echo ""
    echo "Some components are enabled, others disabled."
    echo "This may cause build errors."
    echo ""
    echo "To fix, run one of these commands:"
    echo -e "  ${BLUE}npm run widget:enable${NC}  - Enable all components"
    echo -e "  ${BLUE}npm run widget:disable${NC} - Disable all components"
fi

echo ""

#!/bin/bash

# Widget Toggle Script for React Native Project
# This script enables or disables widget functionality based on widget.config.js
# Usage: bash toggle-widget.sh [enable|disable]

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_color() {
    echo -e "${1}${2}${NC}"
}

print_header() {
    echo ""
    print_color "$BLUE" "============================================"
    print_color "$BLUE" "$1"
    print_color "$BLUE" "============================================"
    echo ""
}

print_success() {
    print_color "$GREEN" "✓ $1"
}

print_error() {
    print_color "$RED" "✗ $1"
}

print_warning() {
    print_color "$YELLOW" "⚠ $1"
}

print_info() {
    print_color "$BLUE" "ℹ $1"
}

# Check if we're in the project root
if [ ! -f "package.json" ] || [ ! -f "widget.config.js" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

# Function to update widget.config.js
update_widget_config() {
    local enable=$1
    sed -i.bak "s/ENABLE_WIDGETS: .*/ENABLE_WIDGETS: $enable,/" widget.config.js
    rm widget.config.js.bak 2>/dev/null || true
}

# Function to comment/uncomment widget receiver in AndroidManifest
toggle_manifest_receiver() {
    local action=$1  # "disable" or "enable"
    local manifest="android/app/src/main/AndroidManifest.xml"
    
    if [ ! -f "$manifest" ]; then
        print_warning "AndroidManifest.xml not found"
        return
    fi
    
    # Create a backup before ANY modification
    cp "$manifest" "${manifest}.toggle_backup"
    
    if [ "$action" = "disable" ]; then
        # Check if already disabled
        if grep -q "<!-- WIDGET_DISABLED" "$manifest"; then
            print_info "Widget receiver already disabled in AndroidManifest.xml"
            rm "${manifest}.toggle_backup"
            return
        fi
        
        # Use awk for precise line-by-line manipulation
        awk '
        /<!-- Todo Widget Provider -->/ {
            print $0
            print "    <!-- WIDGET_DISABLED"
            next
        }
        /android:name="\.widget\.TodoWidgetProvider"/,/<\/receiver>/ {
            print $0
            if (/<\/receiver>/) {
                print "    WIDGET_DISABLED -->"
            }
            next
        }
        { print $0 }
        ' "$manifest" > "${manifest}.tmp"
        
        mv "${manifest}.tmp" "$manifest"
        print_success "Widget receiver disabled in AndroidManifest.xml"
        
    else
        # Check if already enabled
        if ! grep -q "<!-- WIDGET_DISABLED" "$manifest"; then
            print_info "Widget receiver already enabled in AndroidManifest.xml"
            rm "${manifest}.toggle_backup"
            return
        fi
        
        # Remove the comment markers
        awk '
        /<!-- WIDGET_DISABLED/ { next }
        /WIDGET_DISABLED -->/ { next }
        { print $0 }
        ' "$manifest" > "${manifest}.tmp"
        
        mv "${manifest}.tmp" "$manifest"
        print_success "Widget receiver enabled in AndroidManifest.xml"
    fi
    
    # Validate the XML structure
    if command -v xmllint &> /dev/null; then
        if ! xmllint --noout "$manifest" 2>/dev/null; then
            print_error "❌ XML validation failed! Restoring backup..."
            mv "${manifest}.toggle_backup" "$manifest"
            print_error "AndroidManifest.xml has been restored to previous state"
            exit 1
        fi
    fi
    
    # Verify the receiver tag structure when enabled
    if [ "$action" = "enable" ]; then
        if ! grep -A 1 "<!-- Todo Widget Provider -->" "$manifest" | grep -q '<receiver'; then
            print_error "❌ Widget receiver structure is corrupted! Restoring backup..."
            mv "${manifest}.toggle_backup" "$manifest"
            print_error "AndroidManifest.xml has been restored to previous state"
            exit 1
        fi
    fi
    
    # All good, remove backup
    rm "${manifest}.toggle_backup"
}

# Function to toggle WidgetPackage in MainApplication
toggle_main_application() {
    local action=$1  # "disable" or "enable"
    
    # Find MainApplication.kt
    local main_app=$(find android/app/src/main/java -name "MainApplication.kt" | head -1)
    
    if [ -z "$main_app" ] || [ ! -f "$main_app" ]; then
        print_warning "MainApplication.kt not found"
        return
    fi
    
    # Get the actual package name from the file
    local actual_package=$(grep "^package " "$main_app" | head -1 | awk '{print $2}' | tr -d ';')
    
    if [ -z "$actual_package" ]; then
        print_warning "Could not detect package name from MainApplication.kt"
        actual_package="com.yourapp"
    fi
    
    if [ "$action" = "disable" ]; then
        # Check if already disabled
        if grep -q "WIDGET_DISABLED import" "$main_app"; then
            print_info "WidgetPackage already disabled in MainApplication.kt"
        else
            # Add WIDGET_DISABLED marker to import and add() lines (using actual package name)
            sed -i.bak "s|^import ${actual_package}\.widget\.WidgetPackage|// WIDGET_DISABLED import ${actual_package}.widget.WidgetPackage|" "$main_app"
            sed -i.bak 's|^\([[:space:]]*\)add(WidgetPackage())|\1// WIDGET_DISABLED add(WidgetPackage())|' "$main_app"
            print_success "WidgetPackage disabled in MainApplication.kt"
        fi
    else
        # Check if already enabled
        if ! grep -q "WIDGET_DISABLED import" "$main_app"; then
            print_info "WidgetPackage already enabled in MainApplication.kt"
        else
            # Remove WIDGET_DISABLED markers (using actual package name)
            sed -i.bak "s|// WIDGET_DISABLED import ${actual_package}\.widget\.WidgetPackage|import ${actual_package}.widget.WidgetPackage|" "$main_app"
            sed -i.bak 's|^\([[:space:]]*\)// WIDGET_DISABLED add(WidgetPackage())|\1add(WidgetPackage())|' "$main_app"
            print_success "WidgetPackage enabled in MainApplication.kt"
        fi
    fi
    
    rm "$main_app.bak" 2>/dev/null || true
}

# Function to create/remove widget disable marker
toggle_widget_marker() {
    local action=$1
    local package_path=$(grep -m 1 'namespace' android/app/build.gradle | sed 's/.*namespace "\(.*\)".*/\1/' | tr '.' '/')
    local widget_dir="android/app/src/main/java/$package_path/widget"
    
    if [ "$action" = "disable" ]; then
        if [ -d "$widget_dir" ]; then
            touch "$widget_dir/.WIDGET_DISABLED"
            print_success "Widget disabled marker created"
        fi
    else
        if [ -f "$widget_dir/.WIDGET_DISABLED" ]; then
            rm "$widget_dir/.WIDGET_DISABLED"
            print_success "Widget disabled marker removed"
        fi
    fi
}

# Main script
print_header "🔧 Widget Toggle Script"

# Determine action
ACTION=""
if [ "$1" = "enable" ] || [ "$1" = "on" ] || [ "$1" = "true" ]; then
    ACTION="enable"
elif [ "$1" = "disable" ] || [ "$1" = "off" ] || [ "$1" = "false" ]; then
    ACTION="disable"
else
    # Interactive mode
    echo "What would you like to do?"
    echo "  1) Enable widgets"
    echo "  2) Disable widgets"
    echo -n "Enter choice (1 or 2): "
    read choice
    
    if [ "$choice" = "1" ]; then
        ACTION="enable"
    elif [ "$choice" = "2" ]; then
        ACTION="disable"
    else
        print_error "Invalid choice"
        exit 1
    fi
fi

# Confirm action
print_header "📋 Action Summary"
if [ "$ACTION" = "enable" ]; then
    print_info "This will ENABLE widgets in your project"
    echo "  • Update widget.config.js (ENABLE_WIDGETS: true)"
    echo "  • Enable widget receiver in AndroidManifest.xml"
    echo "  • Enable WidgetPackage in MainApplication.kt"
    echo "  • Remove widget disabled marker"
else
    print_info "This will DISABLE widgets in your project"
    echo "  • Update widget.config.js (ENABLE_WIDGETS: false)"
    echo "  • Disable widget receiver in AndroidManifest.xml"
    echo "  • Disable WidgetPackage in MainApplication.kt"
    echo "  • Create widget disabled marker"
fi
echo ""

echo -n "Proceed? (y/n): "
read confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    print_warning "Operation cancelled"
    exit 0
fi

# Execute toggle
print_header "🔄 Toggling Widget State"

if [ "$ACTION" = "enable" ]; then
    update_widget_config "true"
    print_success "Updated widget.config.js (ENABLE_WIDGETS: true)"
    
    toggle_manifest_receiver "enable"
    toggle_main_application "enable"
    toggle_widget_marker "enable"
else
    update_widget_config "false"
    print_success "Updated widget.config.js (ENABLE_WIDGETS: false)"
    
    toggle_manifest_receiver "disable"
    toggle_main_application "disable"
    toggle_widget_marker "disable"
fi

# Clean build
print_header "🧹 Cleaning Build"
rm -rf android/build 2>/dev/null || true
rm -rf android/app/build 2>/dev/null || true
print_success "Build cache cleared"

# Success
print_header "✅ Widget ${ACTION}d Successfully!"

print_info "Next steps:"
echo ""
echo "1. Rebuild the app:"
echo "   npm run android"
echo "   # or"
echo "   yarn android"
echo ""

if [ "$ACTION" = "enable" ]; then
    echo "2. Test widget functionality:"
    echo "   - Add widget to home screen"
    echo "   - Open WidgetTestScreen in app"
    echo "   - Test dynamic updates"
else
    echo "2. Widget will be excluded from build"
    echo "   - Widget code remains in project but is inactive"
    echo "   - No widget will appear in launcher"
    echo "   - To re-enable, run: bash toggle-widget.sh enable"
fi

echo ""
print_success "Done! Widget is now ${ACTION}d."

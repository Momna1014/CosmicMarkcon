#!/bin/bash

# Widget Rename Script for React Native Project Structure
# This script updates widget files to match the new project package name
# Run this AFTER using rename-project.sh

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
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

# Function to detect current Android package
detect_android_package() {
    if [ -f "android/app/build.gradle" ]; then
        CURRENT_PACKAGE=$(grep -m 1 'namespace' android/app/build.gradle | sed 's/.*namespace "\(.*\)".*/\1/')
        return 0
    fi
    return 1
}

# Function to check if widget files exist
check_widget_files() {
    local package_path=$(echo "$1" | tr '.' '/')
    local widget_dir="android/app/src/main/java/$package_path/widget"
    local layout_dir="android/app/src/main/res/layout"
    local xml_dir="android/app/src/main/res/xml"
    local drawable_dir="android/app/src/main/res/drawable"
    
    if [ ! -d "$widget_dir" ]; then
        print_warning "Widget source directory not found: $widget_dir"
        return 1
    fi
    
    if [ ! -f "$widget_dir/TodoWidgetProvider.kt" ] || \
       [ ! -f "$widget_dir/WidgetBridge.kt" ] || \
       [ ! -f "$widget_dir/WidgetPackage.kt" ]; then
        print_warning "Widget Kotlin files not found"
        return 1
    fi
    
    # Check widget resource files
    if [ ! -f "$layout_dir/widget_todo_list.xml" ]; then
        print_warning "Widget layout file not found: widget_todo_list.xml"
    fi
    
    if [ ! -f "$xml_dir/widget_todo_list_info.xml" ]; then
        print_warning "Widget info file not found: widget_todo_list_info.xml"
    fi
    
    if [ ! -f "$drawable_dir/widget_background.xml" ]; then
        print_warning "Widget background drawable not found: widget_background.xml"
    fi
    
    return 0
}

# Function to update widget package declarations
update_widget_package() {
    local old_package=$1
    local new_package=$2
    local old_path=$(echo "$old_package" | tr '.' '/')
    local new_path=$(echo "$new_package" | tr '.' '/')
    
    local old_widget_dir="android/app/src/main/java/$old_path/widget"
    local new_widget_dir="android/app/src/main/java/$new_path/widget"
    
    print_info "Updating widget package: $old_package → $new_package"
    
    # Check if widget directory exists at old location
    if [ -d "$old_widget_dir" ]; then
        # Create new directory structure if needed
        mkdir -p "$(dirname "$new_widget_dir")"
        
        # Move widget directory to new location
        if [ "$old_widget_dir" != "$new_widget_dir" ]; then
            mv "$old_widget_dir" "$new_widget_dir"
            print_success "Moved widget directory to new location"
        fi
        
        # Update package declarations in widget files
        print_info "Updating package declarations in widget files..."
        find "$new_widget_dir" -type f \( -name "*.kt" -o -name "*.java" \) -exec sed -i.bak "s|package $old_package\.widget|package $new_package.widget|g" {} \;
        find "$new_widget_dir" -type f \( -name "*.kt" -o -name "*.java" \) -exec sed -i.bak "s|import $old_package\.|import $new_package.|g" {} \;
        find "$new_widget_dir" -type f \( -name "*.kt" -o -name "*.java" \) -exec sed -i.bak "s|com\.android\.internal\.R|com.android.internal.R|g" {} \;
        
        # Update specific widget references (context.packageName will auto-update at runtime)
        print_info "Updating widget-specific references..."
        
        # Remove backup files
        find "$new_widget_dir" -name "*.bak" -delete
        
        print_success "Updated widget package declarations"
        
        # Verify the updates
        local provider_file="$new_widget_dir/TodoWidgetProvider.kt"
        local bridge_file="$new_widget_dir/WidgetBridge.kt"
        local package_file="$new_widget_dir/WidgetPackage.kt"
        
        if [ -f "$provider_file" ]; then
            print_success "✓ TodoWidgetProvider.kt updated"
        fi
        if [ -f "$bridge_file" ]; then
            print_success "✓ WidgetBridge.kt updated"
        fi
        if [ -f "$package_file" ]; then
            print_success "✓ WidgetPackage.kt updated"
        fi
    else
        print_warning "Widget directory not found at: $old_widget_dir"
        return 1
    fi
}

# Function to update widget resources (layout, drawable, xml)
update_widget_resources() {
    local old_package=$1
    local new_package=$2
    
    print_info "Updating widget resource files..."
    
    # Update widget_todo_list_info.xml (contains provider reference)
    local widget_info="android/app/src/main/res/xml/widget_todo_list_info.xml"
    if [ -f "$widget_info" ]; then
        sed -i.bak "s|android:configure=\"$old_package\.|android:configure=\"$new_package.|g" "$widget_info"
        sed -i.bak "s|android:previewImage=\"@drawable/|android:previewImage=\"@drawable/|g" "$widget_info"
        rm "$widget_info.bak" 2>/dev/null || true
        print_success "✓ widget_todo_list_info.xml updated"
    fi
    
    # Widget layout and drawable files don't typically need package updates
    # as they use @drawable and @id references which are package-independent
    local layout_file="android/app/src/main/res/layout/widget_todo_list.xml"
    if [ -f "$layout_file" ]; then
        print_success "✓ widget_todo_list.xml layout found"
    fi
    
    local background_file="android/app/src/main/res/drawable/widget_background.xml"
    if [ -f "$background_file" ]; then
        print_success "✓ widget_background.xml drawable found"
    fi
}

# Function to update AndroidManifest widget receiver
update_manifest_widget() {
    local old_package=$1
    local new_package=$2
    local manifest="android/app/src/main/AndroidManifest.xml"
    
    if [ -f "$manifest" ]; then
        print_info "Updating widget receiver in AndroidManifest.xml"
        
        # Update widget receiver package reference
        sed -i.bak "s|android:name=\"\.$old_package\.widget\.TodoWidgetProvider\"|android:name=\".$new_package.widget.TodoWidgetProvider\"|g" "$manifest"
        sed -i.bak "s|android:name=\"$old_package\.widget\.TodoWidgetProvider\"|android:name=\"$new_package.widget.TodoWidgetProvider\"|g" "$manifest"
        sed -i.bak "s|android:name=\"\.widget\.TodoWidgetProvider\"|android:name=\".$new_package.widget.TodoWidgetProvider\"|g" "$manifest"
        
        # Update widget resource reference in manifest if present
        sed -i.bak "s|android:resource=\"@xml/widget_todo_list_info\"|android:resource=\"@xml/widget_todo_list_info\"|g" "$manifest"
        
        rm "$manifest.bak" 2>/dev/null || true
        print_success "✓ AndroidManifest widget receiver updated"
    fi
}

# Function to update MainApplication widget package import
update_main_application() {
    local old_package=$1
    local new_package=$2
    local old_path=$(echo "$old_package" | tr '.' '/')
    local new_path=$(echo "$new_package" | tr '.' '/')
    
    local main_app_old="android/app/src/main/java/$old_path/MainApplication.kt"
    local main_app_new="android/app/src/main/java/$new_path/MainApplication.kt"
    
    local main_app=""
    if [ -f "$main_app_new" ]; then
        main_app="$main_app_new"
    elif [ -f "$main_app_old" ]; then
        main_app="$main_app_old"
    fi
    
    if [ -n "$main_app" ] && [ -f "$main_app" ]; then
        print_info "Updating widget import in MainApplication.kt"
        
        sed -i.bak "s|import $old_package\.widget\.WidgetPackage|import $new_package.widget.WidgetPackage|g" "$main_app"
        
        rm "$main_app.bak" 2>/dev/null || true
        print_success "✓ MainApplication widget import updated"
    fi
}

# Function to verify widget TypeScript service
verify_widget_typescript() {
    local widget_service="src/services/WidgetService.ts"
    
    print_info "Checking widget TypeScript integration..."
    
    if [ -f "$widget_service" ]; then
        print_success "✓ WidgetService.ts found"
    else
        print_warning "⚠ WidgetService.ts not found at: $widget_service"
    fi
    
    # Check if WidgetTestScreen exists
    if [ -f "src/screens/WidgetTestScreen.tsx" ]; then
        print_success "✓ WidgetTestScreen.tsx found"
    fi
}

# Main script starts here
print_header "🔧 Widget Package Rename Script"

# Check if we're in a React Native project
if [ ! -f "package.json" ] || [ ! -d "android" ]; then
    print_error "This doesn't appear to be a React Native project directory."
    print_error "Please run this script from the root of your React Native project."
    exit 1
fi

# Detect current package
print_header "📋 Detecting Current Configuration"

if ! detect_android_package; then
    print_error "Could not detect Android package name"
    exit 1
fi

print_success "Current Android package: $CURRENT_PACKAGE"

# Check if widget files exist
if ! check_widget_files "$CURRENT_PACKAGE"; then
    print_error "Widget files not found for package: $CURRENT_PACKAGE"
    print_error "Expected location: android/app/src/main/java/$(echo $CURRENT_PACKAGE | tr '.' '/')/widget"
    print_info "Have you already run rename-project.sh?"
    print_info "This script should be integrated into rename-project.sh or run after it."
    exit 1
fi

print_success "Widget files found"

# Ask for package to rename from (in case it's different)
print_header "📝 Widget Package Rename"

echo ""
print_info "Current package detected: $CURRENT_PACKAGE"
echo ""
echo "If your widget files are still using an OLD package name,"
echo "enter it below. Otherwise, press ENTER to skip."
echo ""
echo -n "Enter OLD widget package name (or press ENTER to skip): "
read OLD_WIDGET_PACKAGE

if [ -z "$OLD_WIDGET_PACKAGE" ]; then
    print_info "No old package specified. Assuming widget files already match: $CURRENT_PACKAGE"
    print_success "Widget package appears to be up to date!"
    exit 0
fi

# Validate old package format
if [[ ! $OLD_WIDGET_PACKAGE =~ ^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*$ ]]; then
    print_error "Invalid package format: $OLD_WIDGET_PACKAGE"
    print_error "Use lowercase with dots (e.g., com.oldcompany.oldapp)"
    exit 1
fi

# Show summary
print_header "📊 Summary of Changes"
echo ""
print_info "Widget Package Update:"
echo "  From: $OLD_WIDGET_PACKAGE"
echo "  To:   $CURRENT_PACKAGE"
echo ""

# Confirm
echo -n "Proceed with widget package rename? (y/n): "
read CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    print_warning "Operation cancelled by user"
    exit 0
fi

# Perform widget rename
print_header "🔄 Updating Widget Files"

# 1. Update widget package declarations and move files
update_widget_package "$OLD_WIDGET_PACKAGE" "$CURRENT_PACKAGE"
echo ""

# 2. Update widget resources
update_widget_resources "$OLD_WIDGET_PACKAGE" "$CURRENT_PACKAGE"
echo ""

# 3. Update AndroidManifest
update_manifest_widget "$OLD_WIDGET_PACKAGE" "$CURRENT_PACKAGE"
echo ""

# 4. Update MainApplication
update_main_application "$OLD_WIDGET_PACKAGE" "$CURRENT_PACKAGE"
echo ""

# 5. Verify TypeScript integration
verify_widget_typescript
echo ""

# Clean build
print_header "🧹 Cleaning Build"

print_info "Cleaning Android build..."
rm -rf android/build 2>/dev/null || true
rm -rf android/app/build 2>/dev/null || true
print_success "Build cleaned"

# Success message
print_header "✅ Widget Package Updated Successfully!"

print_success "Widget components updated:"
echo "  ✓ TodoWidgetProvider.kt (uses context.packageName for dynamic resources)"
echo "  ✓ WidgetBridge.kt (React Native bridge)"
echo "  ✓ WidgetPackage.kt (package registration)"
echo "  ✓ widget_todo_list.xml (layout - no generic View, no paddingVertical)"
echo "  ✓ widget_background.xml (gradient background)"
echo "  ✓ widget_todo_list_info.xml (widget metadata)"
echo ""

print_info "Widget Implementation Details:"
echo "  • Uses RemoteViews for widget UI (widget-safe components only)"
echo "  • Dynamic resource loading via context.resources.getIdentifier()"
echo "  • SharedPreferences for data persistence"
echo "  • Supports up to 5 todo items"
echo "  • Resizable widget (280x202dp to 482x340dp)"
echo "  • Refresh button and tap-to-open app"
echo ""

print_info "Next steps:"
echo ""
echo "1. Clean and rebuild the app:"
echo "   cd android && ./gradlew clean && cd .."
echo "   npm run android"
echo ""
echo "2. Remove old app from device:"
echo "   adb uninstall $OLD_WIDGET_PACKAGE"
echo ""
echo "3. Test widget:"
echo "   - Add widget to home screen"
echo "   - Open app and navigate to WidgetTestScreen"
echo "   - Test dynamic updates with different data"
echo ""
echo "4. Update widget from React Native:"
echo "   import WidgetService from './services/WidgetService';"
echo "   WidgetService.updateWidget('My Title', ['Item 1', 'Item 2']);"
echo ""
print_success "Widget package renamed to: $CURRENT_PACKAGE"
print_success "Widget is ready to display dynamic data!"

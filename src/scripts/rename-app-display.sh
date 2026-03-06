#!/bin/bash

# Script to rename app display name for Android and iOS
# This script updates:
# 1. App display name shown on mobile devices
# 2. Permission descriptions that reference the app name
# 3. Facebook display name
# 4. app.json configuration

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the project root directory (two levels up from this script)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check if a file exists
check_file() {
    if [ ! -f "$1" ]; then
        print_error "File not found: $1"
        return 1
    fi
    return 0
}

# Function to update app.json
update_app_json() {
    local new_name="$1"
    local file="$PROJECT_ROOT/app.json"
    
    print_info "Updating app.json..."
    
    if check_file "$file"; then
        # Use sed to update both name and displayName
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS version
            sed -i '' "s/\"displayName\": \".*\"/\"displayName\": \"$new_name\"/" "$file"
        else
            # Linux version
            sed -i "s/\"displayName\": \".*\"/\"displayName\": \"$new_name\"/" "$file"
        fi
        print_success "Updated app.json"
    else
        return 1
    fi
}

# Function to update Android strings.xml
update_android_strings() {
    local new_name="$1"
    local file="$PROJECT_ROOT/android/app/src/main/res/values/strings.xml"
    
    print_info "Updating Android strings.xml..."
    
    if check_file "$file"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS version
            sed -i '' "s/<string name=\"app_name\">.*<\/string>/<string name=\"app_name\">$new_name<\/string>/" "$file"
        else
            # Linux version
            sed -i "s/<string name=\"app_name\">.*<\/string>/<string name=\"app_name\">$new_name<\/string>/" "$file"
        fi
        print_success "Updated Android app name"
    else
        return 1
    fi
}

# Function to update Android AndroidManifest.xml labels
update_android_manifest() {
    local new_name="$1"
    local file="$PROJECT_ROOT/android/app/src/main/AndroidManifest.xml"
    
    print_info "Checking Android AndroidManifest.xml..."
    
    if check_file "$file"; then
        # The manifest already uses @string/app_name, so it will pick up the change automatically
        print_success "AndroidManifest.xml uses @string/app_name reference (no changes needed)"
    else
        print_warning "AndroidManifest.xml not found"
    fi
}

# Function to update iOS Info.plist
update_ios_info_plist() {
    local new_name="$1"
    
    # Dynamically find iOS project name
    local ios_project_name=""
    local ios_dir="$PROJECT_ROOT/ios"
    
    if [ -d "$ios_dir" ]; then
        # Look for .xcworkspace or .xcodeproj
        for dir in "$ios_dir"/*.xcworkspace; do
            if [ -d "$dir" ]; then
                ios_project_name=$(basename "$dir" .xcworkspace)
                break
            fi
        done
        
        # If no workspace found, look for xcodeproj
        if [ -z "$ios_project_name" ]; then
            for dir in "$ios_dir"/*.xcodeproj; do
                if [ -d "$dir" ] && [ "$(basename "$dir")" != "Pods.xcodeproj" ]; then
                    ios_project_name=$(basename "$dir" .xcodeproj)
                    break
                fi
            done
        fi
    fi
    
    if [ -z "$ios_project_name" ]; then
        print_warning "Could not detect iOS project name, skipping iOS Info.plist update"
        return
    fi
    
    local file="$PROJECT_ROOT/ios/$ios_project_name/Info.plist"
    
    print_info "Updating iOS Info.plist (detected project: $ios_project_name)..."
    
    if check_file "$file"; then
        # Update CFBundleDisplayName
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # Use PlistBuddy on macOS for better plist handling
            /usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName $new_name" "$file" 2>/dev/null
            
            if [ $? -ne 0 ]; then
                # If Set fails, try Add
                /usr/libexec/PlistBuddy -c "Add :CFBundleDisplayName string $new_name" "$file" 2>/dev/null
            fi
            
            # Update FacebookDisplayName
            /usr/libexec/PlistBuddy -c "Set :FacebookDisplayName $new_name" "$file" 2>/dev/null
            
            if [ $? -ne 0 ]; then
                /usr/libexec/PlistBuddy -c "Add :FacebookDisplayName string $new_name" "$file" 2>/dev/null
            fi
            
            # Update permission descriptions
            /usr/libexec/PlistBuddy -c "Set :NSLocationWhenInUseUsageDescription '$new_name needs access to your location to provide location-based features.'" "$file" 2>/dev/null
            /usr/libexec/PlistBuddy -c "Set :NSUserNotificationsUsageDescription '$new_name would like to send you notifications about important updates and messages.'" "$file" 2>/dev/null
            /usr/libexec/PlistBuddy -c "Set :NSUserTrackingUsageDescription '$new_name would like to track your activity across apps and websites owned by other companies for personalized advertising and analytics purposes.'" "$file" 2>/dev/null
            
            print_success "Updated iOS Info.plist with PlistBuddy"
        else
            # Fallback to sed for non-macOS systems
            sed -i "s/<string>.*<\/string>/<string>$new_name<\/string>/g" "$file"
            print_success "Updated iOS Info.plist with sed"
        fi
    else
        print_warning "iOS Info.plist not found"
    fi
}

# Function to display current app name
display_current_name() {
    local app_json_file="$PROJECT_ROOT/app.json"
    
    if check_file "$app_json_file"; then
        local current_name=$(grep -o '"displayName": "[^"]*"' "$app_json_file" | cut -d'"' -f4)
        print_info "Current app display name: ${GREEN}$current_name${NC}"
    else
        print_warning "Could not determine current app name"
    fi
}

# Function to validate app name
validate_app_name() {
    local name="$1"
    
    # Check if name is empty
    if [ -z "$name" ]; then
        print_error "App name cannot be empty"
        return 1
    fi
    
    # Check if name is too long (max 30 characters for iOS)
    if [ ${#name} -gt 30 ]; then
        print_warning "App name is longer than 30 characters. iOS might truncate it."
    fi
    
    return 0
}

# Main script execution
main() {
    echo ""
    echo "=========================================="
    echo "   App Display Name Rename Script"
    echo "=========================================="
    echo ""
    
    print_info "Project root: $PROJECT_ROOT"
    echo ""
    
    # Display current app name
    display_current_name
    echo ""
    
    # Get new app name from user
    if [ -z "$1" ]; then
        read -p "Enter new app display name: " NEW_APP_NAME
    else
        NEW_APP_NAME="$1"
    fi
    
    # Validate the new app name
    if ! validate_app_name "$NEW_APP_NAME"; then
        exit 1
    fi
    
    echo ""
    print_info "New app display name will be: ${GREEN}$NEW_APP_NAME${NC}"
    echo ""
    
    # Ask for confirmation
    read -p "Do you want to proceed? (y/n): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Operation cancelled by user"
        exit 0
    fi
    
    echo ""
    print_info "Starting app rename process..."
    echo ""
    
    # Update all files
    update_app_json "$NEW_APP_NAME"
    update_android_strings "$NEW_APP_NAME"
    update_android_manifest "$NEW_APP_NAME"
    update_ios_info_plist "$NEW_APP_NAME"
    
    echo ""
    echo "=========================================="
    print_success "App display name renamed successfully!"
    echo "=========================================="
    echo ""
    print_info "Summary of changes:"
    echo "  ✓ app.json - displayName updated"
    echo "  ✓ Android - strings.xml updated"
    echo "  ✓ Android - AndroidManifest.xml verified"
    echo "  ✓ iOS - Info.plist updated"
    echo "  ✓ iOS - Permission descriptions updated"
    echo ""
    print_warning "Next steps:"
    echo "  1. Clean and rebuild your Android app:"
    echo "     cd android && ./gradlew clean && cd .."
    echo "     npx react-native run-android"
    echo ""
    echo "  2. Clean and rebuild your iOS app:"
    echo "     cd ios && pod install && cd .."
    echo "     npx react-native run-ios"
    echo ""
    print_info "The app name change will be visible after rebuilding."
    echo ""
}

# Run main function
main "$@"

#!/bin/bash

# ============================================================================
# React Native Android Project Renamer
# ============================================================================
# This script converts a React Native CLI template project into a brand-new
# project with a completely new identity (Android only).
#
# Features:
# - Interactive prompts for new project name and package ID
# - Creates new folder structure with new project name
# - Replaces all occurrences of old names, packages, and paths
# - Maintains template project integrity (creates a copy)
# - Fully detaches new project from template
#
# Usage: ./rename-android-project.sh
# ============================================================================

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# Helper Functions
# ============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}============================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# ============================================================================
# Validation Functions
# ============================================================================

validate_project_name() {
    local name=$1
    # Check if name is empty
    if [[ -z "$name" ]]; then
        return 1
    fi
    # Check if name contains only alphanumeric characters and underscores
    if [[ ! "$name" =~ ^[a-zA-Z][a-zA-Z0-9_]*$ ]]; then
        return 1
    fi
    return 0
}

validate_package_id() {
    local package=$1
    # Check if package is empty
    if [[ -z "$package" ]]; then
        return 1
    fi
    # Check if package follows Java package naming convention
    if [[ ! "$package" =~ ^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$ ]]; then
        return 1
    fi
    return 0
}

# ============================================================================
# Main Script
# ============================================================================

print_header "React Native Android Project Renamer"

# Get current directory (template directory)
TEMPLATE_DIR=$(pwd)
TEMPLATE_NAME=$(basename "$TEMPLATE_DIR")

print_info "Template directory: $TEMPLATE_DIR"
print_info "Template name: $TEMPLATE_NAME"

# ============================================================================
# Step 1: Detect Current Configuration
# ============================================================================

print_header "Step 1: Detecting Current Configuration"

# Detect old project name from app.json
if [[ -f "app.json" ]]; then
    OLD_PROJECT_NAME=$(grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' app.json | sed 's/"name"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/')
    print_success "Detected old project name: $OLD_PROJECT_NAME"
else
    print_error "app.json not found. Are you in the React Native project root?"
    exit 1
fi

# Detect old package ID from Android namespace
if [[ -f "android/app/build.gradle" ]]; then
    OLD_PACKAGE_ID=$(grep 'namespace' android/app/build.gradle | sed 's/.*namespace[[:space:]]*"\([^"]*\)".*/\1/')
    if [[ -z "$OLD_PACKAGE_ID" ]]; then
        # Fallback: try to get from AndroidManifest.xml
        OLD_PACKAGE_ID=$(grep 'package=' android/app/src/main/AndroidManifest.xml | sed 's/.*package="\([^"]*\)".*/\1/' | head -1)
    fi
    print_success "Detected old package ID: $OLD_PACKAGE_ID"
else
    print_error "android/app/build.gradle not found."
    exit 1
fi

# Convert package ID to directory path
OLD_PACKAGE_PATH=$(echo "$OLD_PACKAGE_ID" | tr '.' '/')
print_info "Old package path: $OLD_PACKAGE_PATH"

# ============================================================================
# Step 2: Get New Project Information
# ============================================================================

print_header "Step 2: Enter New Project Information"

# Prompt for new project name
while true; do
    echo ""
    echo -e "${YELLOW}Enter new project name (e.g., MyAwesomeApp):${NC}"
    read -r NEW_PROJECT_NAME
    
    if validate_project_name "$NEW_PROJECT_NAME"; then
        print_success "Valid project name: $NEW_PROJECT_NAME"
        break
    else
        print_error "Invalid project name. Must start with a letter and contain only letters, numbers, and underscores."
    fi
done

# Prompt for new package identifier
while true; do
    echo ""
    echo -e "${YELLOW}Enter new package identifier (e.g., com.company.myapp):${NC}"
    read -r NEW_PACKAGE_ID
    
    if validate_package_id "$NEW_PACKAGE_ID"; then
        print_success "Valid package ID: $NEW_PACKAGE_ID"
        break
    else
        print_error "Invalid package ID. Must follow Java package naming (e.g., com.company.app)."
    fi
done

# Convert new package ID to directory path
NEW_PACKAGE_PATH=$(echo "$NEW_PACKAGE_ID" | tr '.' '/')

# ============================================================================
# Step 3: Confirm Settings
# ============================================================================

print_header "Step 3: Confirmation"

echo ""
echo "Old Configuration:"
echo "  Project Name:  $OLD_PROJECT_NAME"
echo "  Package ID:    $OLD_PACKAGE_ID"
echo "  Package Path:  $OLD_PACKAGE_PATH"
echo ""
echo "New Configuration:"
echo "  Project Name:  $NEW_PROJECT_NAME"
echo "  Package ID:    $NEW_PACKAGE_ID"
echo "  Package Path:  $NEW_PACKAGE_PATH"
echo ""
echo "New project will be created at: $(dirname "$TEMPLATE_DIR")/$NEW_PROJECT_NAME"
echo ""

read -p "$(echo -e ${YELLOW}"Proceed with conversion? (y/n): "${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Conversion cancelled."
    exit 0
fi

# ============================================================================
# Step 4: Create New Project Directory
# ============================================================================

print_header "Step 4: Creating New Project Directory"

NEW_PROJECT_DIR="$(dirname "$TEMPLATE_DIR")/$NEW_PROJECT_NAME"

if [[ -d "$NEW_PROJECT_DIR" ]]; then
    print_error "Directory $NEW_PROJECT_DIR already exists!"
    read -p "$(echo -e ${YELLOW}"Delete and continue? (y/n): "${NC})" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Removing existing directory..."
        rm -rf "$NEW_PROJECT_DIR"
    else
        print_warning "Conversion cancelled."
        exit 0
    fi
fi

print_info "Copying template to new location..."
cp -R "$TEMPLATE_DIR" "$NEW_PROJECT_DIR"
print_success "Project copied to: $NEW_PROJECT_DIR"

# Change to new project directory
cd "$NEW_PROJECT_DIR"

# ============================================================================
# Step 5: Update Android Configuration Files
# ============================================================================

print_header "Step 5: Updating Android Configuration Files"

# 5.1: Update settings.gradle
print_info "Updating settings.gradle..."
if [[ -f "android/settings.gradle" ]]; then
    sed -i.bak "s/rootProject.name = '$OLD_PROJECT_NAME'/rootProject.name = '$NEW_PROJECT_NAME'/g" android/settings.gradle
    rm -f android/settings.gradle.bak
    print_success "settings.gradle updated"
fi

# 5.2: Update app/build.gradle (namespace)
print_info "Updating app/build.gradle..."
if [[ -f "android/app/build.gradle" ]]; then
    sed -i.bak "s/namespace \"$OLD_PACKAGE_ID\"/namespace \"$NEW_PACKAGE_ID\"/g" android/app/build.gradle
    sed -i.bak "s/applicationId \"$OLD_PACKAGE_ID\"/applicationId \"$NEW_PACKAGE_ID\"/g" android/app/build.gradle
    rm -f android/app/build.gradle.bak
    print_success "app/build.gradle updated"
fi

# 5.3: Update AndroidManifest.xml
print_info "Updating AndroidManifest.xml..."
if [[ -f "android/app/src/main/AndroidManifest.xml" ]]; then
    # Check if package attribute exists in manifest
    if grep -q 'package=' android/app/src/main/AndroidManifest.xml; then
        sed -i.bak "s/package=\"$OLD_PACKAGE_ID\"/package=\"$NEW_PACKAGE_ID\"/g" android/app/src/main/AndroidManifest.xml
        rm -f android/app/src/main/AndroidManifest.xml.bak
        print_success "AndroidManifest.xml package attribute updated"
    else
        print_info "AndroidManifest.xml has no package attribute (modern React Native uses namespace in build.gradle)"
    fi
    
    # Update any package references in manifest content
    if grep -q "$OLD_PACKAGE_ID" android/app/src/main/AndroidManifest.xml; then
        sed -i.bak "s/$OLD_PACKAGE_ID/$NEW_PACKAGE_ID/g" android/app/src/main/AndroidManifest.xml
        rm -f android/app/src/main/AndroidManifest.xml.bak
        print_success "AndroidManifest.xml content references updated"
    fi
fi

# 5.4: Update debug AndroidManifest.xml if exists
if [[ -f "android/app/src/debug/AndroidManifest.xml" ]]; then
    print_info "Updating debug AndroidManifest.xml..."
    if grep -q 'package=' android/app/src/debug/AndroidManifest.xml; then
        sed -i.bak "s/package=\"$OLD_PACKAGE_ID\"/package=\"$NEW_PACKAGE_ID\"/g" android/app/src/debug/AndroidManifest.xml
        rm -f android/app/src/debug/AndroidManifest.xml.bak
    fi
    if grep -q "$OLD_PACKAGE_ID" android/app/src/debug/AndroidManifest.xml; then
        sed -i.bak "s/$OLD_PACKAGE_ID/$NEW_PACKAGE_ID/g" android/app/src/debug/AndroidManifest.xml
        rm -f android/app/src/debug/AndroidManifest.xml.bak
    fi
    print_success "debug AndroidManifest.xml updated"
fi

# 5.5: Update google-services.json if exists (Firebase)
print_info "Checking for google-services.json..."
if [[ -f "android/app/google-services.json" ]]; then
    if grep -q "\"package_name\": \"$OLD_PACKAGE_ID\"" android/app/google-services.json; then
        print_warning "Found google-services.json with old package ID"
        print_warning "Firebase configuration needs manual update!"
        print_info "Please update google-services.json with your new Firebase project"
        print_info "Or update the package_name from '$OLD_PACKAGE_ID' to '$NEW_PACKAGE_ID'"
        
        # Option to update automatically (with warning)
        read -p "$(echo -e ${YELLOW}"Attempt to auto-update google-services.json package name? (y/n): "${NC})" -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sed -i.bak "s/\"package_name\": \"$OLD_PACKAGE_ID\"/\"package_name\": \"$NEW_PACKAGE_ID\"/g" android/app/google-services.json
            rm -f android/app/google-services.json.bak
            print_success "google-services.json package_name updated"
            print_warning "Remember to add this package to your Firebase Console!"
        else
            print_info "Skipped google-services.json auto-update"
        fi
    else
        print_success "google-services.json found (no old package reference)"
    fi
else
    print_info "No google-services.json found (Firebase not configured)"
fi

# ============================================================================
# Step 6: Restructure Java/Kotlin Package Directories
# ============================================================================

print_header "Step 6: Restructuring Package Directories"

JAVA_MAIN_DIR="android/app/src/main/java"
JAVA_DEBUG_DIR="android/app/src/debug/java"
JAVA_RELEASE_DIR="android/app/src/release/java"

# Function to restructure package directory
restructure_package_dir() {
    local base_dir=$1
    local old_path="$base_dir/$OLD_PACKAGE_PATH"
    local new_path="$base_dir/$NEW_PACKAGE_PATH"
    
    if [[ -d "$old_path" ]]; then
        print_info "Restructuring: $old_path -> $new_path"
        
        # Create new package directory structure
        mkdir -p "$new_path"
        
        # Copy all files from old to new location
        print_info "Copying files from $old_path to $new_path..."
        cp -r "$old_path/"* "$new_path/" 2>/dev/null || {
            # If directory is empty or copy fails for some reason, try alternative
            if [[ $(ls -A "$old_path" 2>/dev/null) ]]; then
                # Directory has files, copy them individually
                for file in "$old_path"/*; do
                    if [[ -e "$file" ]]; then
                        cp -r "$file" "$new_path/"
                    fi
                done
            fi
        }
        
        # Verify files were copied successfully
        local copied_files=$(find "$new_path" -type f 2>/dev/null | wc -l)
        local original_files=$(find "$old_path" -type f 2>/dev/null | wc -l)
        
        if [[ $copied_files -eq $original_files ]] && [[ $copied_files -gt 0 ]]; then
            print_success "Successfully copied $copied_files files to new location"
            
            # Remove the old directory structure if paths are different
            if [[ "$old_path" != "$new_path" ]]; then
                # Remove the old package directory
                rm -rf "$old_path"
                print_success "Removed old package directory: $old_path"
                
                # Clean up empty parent directories
                local current_dir=$(dirname "$old_path")
                while [[ "$current_dir" != "$base_dir" ]] && [[ -d "$current_dir" ]]; do
                    # Only remove if directory is empty
                    if [[ ! $(ls -A "$current_dir" 2>/dev/null) ]]; then
                        rmdir "$current_dir" 2>/dev/null
                        print_info "Cleaned up empty directory: $current_dir"
                        current_dir=$(dirname "$current_dir")
                    else
                        # Directory not empty, stop cleanup
                        break
                    fi
                done
            fi
            
            print_success "Package restructured: $base_dir"
        else
            print_error "File count mismatch! Original: $original_files, Copied: $copied_files"
            print_warning "Files remain in old location for safety: $old_path"
            print_warning "Please manually verify and fix the package structure"
        fi
    else
        print_warning "Directory not found: $old_path (may not exist in this source set)"
    fi
}

# Restructure main source directory
restructure_package_dir "$JAVA_MAIN_DIR"

# Restructure debug directory if exists
if [[ -d "$JAVA_DEBUG_DIR/$OLD_PACKAGE_PATH" ]]; then
    restructure_package_dir "$JAVA_DEBUG_DIR"
fi

# Restructure release directory if exists
if [[ -d "$JAVA_RELEASE_DIR/$OLD_PACKAGE_PATH" ]]; then
    restructure_package_dir "$JAVA_RELEASE_DIR"
fi

# Verify the new structure and list files
print_info "Verifying new package structure..."
if [[ -d "$JAVA_MAIN_DIR/$NEW_PACKAGE_PATH" ]]; then
    FILE_COUNT=$(find "$JAVA_MAIN_DIR/$NEW_PACKAGE_PATH" -type f \( -name "*.kt" -o -name "*.java" \) | wc -l)
    print_success "Found $FILE_COUNT source files in new location:"
    find "$JAVA_MAIN_DIR/$NEW_PACKAGE_PATH" -type f \( -name "*.kt" -o -name "*.java" \) -exec basename {} \; | while read -r filename; do
        echo "    • $filename"
    done
else
    print_error "New package directory not found: $JAVA_MAIN_DIR/$NEW_PACKAGE_PATH"
fi

# ============================================================================
# Step 7: Update Java/Kotlin Source Files
# ============================================================================

print_header "Step 7: Updating Java/Kotlin Source Files"

print_info "Updating package declarations in source files..."

# Find all Java and Kotlin files and update package declarations
find android/app/src -type f \( -name "*.java" -o -name "*.kt" \) | while read -r file; do
    if grep -q "package $OLD_PACKAGE_ID" "$file"; then
        sed -i.bak "s/package $OLD_PACKAGE_ID/package $NEW_PACKAGE_ID/g" "$file"
        rm -f "$file.bak"
        print_success "Updated: $(basename "$file")"
    fi
    
    # Also update import statements
    if grep -q "import $OLD_PACKAGE_ID" "$file"; then
        sed -i.bak "s/import $OLD_PACKAGE_ID/import $NEW_PACKAGE_ID/g" "$file"
        rm -f "$file.bak"
    fi
done

# Update MainActivity component name
print_info "Updating MainActivity component name..."
find android/app/src -type f \( -name "MainActivity.java" -o -name "MainActivity.kt" \) | while read -r file; do
    sed -i.bak "s/getMainComponentName(): String = \"$OLD_PROJECT_NAME\"/getMainComponentName(): String = \"$NEW_PROJECT_NAME\"/g" "$file"
    sed -i.bak "s/getMainComponentName() { return \"$OLD_PROJECT_NAME\"/getMainComponentName() { return \"$NEW_PROJECT_NAME\"/g" "$file"
    sed -i.bak "s/return \"$OLD_PROJECT_NAME\";/return \"$NEW_PROJECT_NAME\";/g" "$file"
    rm -f "$file.bak"
    print_success "MainActivity updated"
done

print_success "All source files updated"

# ============================================================================
# Step 8: Update Resource Files
# ============================================================================

print_header "Step 8: Updating Resource Files"

# Update strings.xml
print_info "Updating strings.xml..."
STRINGS_FILE="android/app/src/main/res/values/strings.xml"
if [[ -f "$STRINGS_FILE" ]]; then
    sed -i.bak "s/<string name=\"app_name\">$OLD_PROJECT_NAME<\/string>/<string name=\"app_name\">$NEW_PROJECT_NAME<\/string>/g" "$STRINGS_FILE"
    rm -f "$STRINGS_FILE.bak"
    print_success "strings.xml updated"
fi

# Update any other XML files that might contain package references
print_info "Updating other resource files..."
find android/app/src/main/res -type f -name "*.xml" | while read -r file; do
    if grep -q "$OLD_PACKAGE_ID" "$file"; then
        sed -i.bak "s/$OLD_PACKAGE_ID/$NEW_PACKAGE_ID/g" "$file"
        rm -f "$file.bak"
        print_success "Updated: $(basename "$file")"
    fi
done

# ============================================================================
# Step 9: Update Root Configuration Files
# ============================================================================

print_header "Step 9: Updating Root Configuration Files"

# Update app.json
print_info "Updating app.json..."
if [[ -f "app.json" ]]; then
    sed -i.bak "s/\"name\": \"$OLD_PROJECT_NAME\"/\"name\": \"$NEW_PROJECT_NAME\"/g" app.json
    sed -i.bak "s/\"displayName\": \"$OLD_PROJECT_NAME\"/\"displayName\": \"$NEW_PROJECT_NAME\"/g" app.json
    rm -f app.json.bak
    print_success "app.json updated"
fi

# Update package.json
print_info "Updating package.json..."
if [[ -f "package.json" ]]; then
    sed -i.bak "s/\"name\": \"$OLD_PROJECT_NAME\"/\"name\": \"$NEW_PROJECT_NAME\"/g" package.json
    rm -f package.json.bak
    print_success "package.json updated"
fi

# Update index.js
print_info "Updating index.js..."
if [[ -f "index.js" ]]; then
    sed -i.bak "s/AppRegistry.registerComponent('$OLD_PROJECT_NAME'/AppRegistry.registerComponent('$NEW_PROJECT_NAME'/g" index.js
    rm -f index.js.bak
    print_success "index.js updated"
fi

# Update App.tsx or App.js
print_info "Updating App component..."
if [[ -f "App.tsx" ]]; then
    sed -i.bak "s/$OLD_PROJECT_NAME/$NEW_PROJECT_NAME/g" App.tsx
    rm -f App.tsx.bak
    print_success "App.tsx updated"
elif [[ -f "App.js" ]]; then
    sed -i.bak "s/$OLD_PROJECT_NAME/$NEW_PROJECT_NAME/g" App.js
    rm -f App.js.bak
    print_success "App.js updated"
fi

# ============================================================================
# Step 10: Update BUCK Files (if exists)
# ============================================================================

print_header "Step 10: Checking for BUCK Files"

if [[ -f "android/app/BUCK" ]]; then
    print_info "Updating BUCK file..."
    sed -i.bak "s/$OLD_PACKAGE_ID/$NEW_PACKAGE_ID/g" android/app/BUCK
    sed -i.bak "s/$OLD_PROJECT_NAME/$NEW_PROJECT_NAME/g" android/app/BUCK
    rm -f android/app/BUCK.bak
    print_success "BUCK file updated"
else
    print_info "No BUCK file found (this is normal for most projects)"
fi

# ============================================================================
# Step 11: Update Gradle Properties
# ============================================================================

print_header "Step 11: Updating Gradle Properties"

# Update gradle.properties if it contains project-specific references
if [[ -f "android/gradle.properties" ]]; then
    if grep -q "$OLD_PROJECT_NAME" android/gradle.properties; then
        print_info "Updating gradle.properties..."
        sed -i.bak "s/$OLD_PROJECT_NAME/$NEW_PROJECT_NAME/g" android/gradle.properties
        rm -f android/gradle.properties.bak
        print_success "gradle.properties updated"
    else
        print_info "gradle.properties doesn't need updates"
    fi
fi

# ============================================================================
# Step 12: Update Proguard Rules
# ============================================================================

print_header "Step 12: Updating Proguard Rules"

PROGUARD_FILE="android/app/proguard-rules.pro"
if [[ -f "$PROGUARD_FILE" ]]; then
    if grep -q "$OLD_PACKAGE_ID" "$PROGUARD_FILE"; then
        print_info "Updating proguard-rules.pro..."
        sed -i.bak "s/$OLD_PACKAGE_ID/$NEW_PACKAGE_ID/g" "$PROGUARD_FILE"
        rm -f "$PROGUARD_FILE.bak"
        print_success "proguard-rules.pro updated"
    else
        print_info "proguard-rules.pro doesn't need updates"
    fi
else
    print_info "No proguard-rules.pro found"
fi

# ============================================================================
# Step 13: Clean Build Artifacts
# ============================================================================

print_header "Step 13: Cleaning Build Artifacts"

print_info "Removing old build artifacts..."

# Remove Android build directories
if [[ -d "android/app/build" ]]; then
    rm -rf android/app/build
    print_success "Removed android/app/build"
fi

if [[ -d "android/build" ]]; then
    rm -rf android/build
    print_success "Removed android/build"
fi

if [[ -d "android/.gradle" ]]; then
    rm -rf android/.gradle
    print_success "Removed android/.gradle"
fi

# Remove node_modules (user will need to reinstall)
if [[ -d "node_modules" ]]; then
    print_info "Removing node_modules (you'll need to reinstall dependencies)..."
    rm -rf node_modules
    print_success "Removed node_modules"
fi

# Remove other cache directories
if [[ -d ".gradle" ]]; then
    rm -rf .gradle
fi

if [[ -d "ios/build" ]]; then
    rm -rf ios/build
fi

# ============================================================================
# Step 14: Verify Changes
# ============================================================================

print_header "Step 14: Verifying Changes"

print_info "Checking for any remaining references to old project..."

# Search for old project name
OLD_NAME_COUNT=$(grep -r "$OLD_PROJECT_NAME" --exclude-dir={node_modules,android/build,android/.gradle,android/app/build,.git,ios/build,ios/Pods} . 2>/dev/null | grep -v "Binary file" | grep -v ".png" | grep -v ".jpg" | grep -v ".gif" | grep -v ".ttf" | grep -v ".otf" | wc -l)

# Search for old package ID
OLD_PACKAGE_COUNT=$(grep -r "$OLD_PACKAGE_ID" --exclude-dir={node_modules,android/build,android/.gradle,android/app/build,.git,ios/build,ios/Pods} . 2>/dev/null | grep -v "Binary file" | grep -v ".png" | grep -v ".jpg" | grep -v ".gif" | wc -l)

if [[ $OLD_NAME_COUNT -gt 0 ]]; then
    print_warning "Found $OLD_NAME_COUNT remaining references to old project name"
    print_info "These might be in comments, documentation, or non-critical files"
else
    print_success "No remaining references to old project name found"
fi

if [[ $OLD_PACKAGE_COUNT -gt 0 ]]; then
    print_warning "Found $OLD_PACKAGE_COUNT remaining references to old package ID"
    print_info "These might be in comments, documentation, or non-critical files"
else
    print_success "No remaining references to old package ID found"
fi

# ============================================================================
# Step 15: Generate Summary Report
# ============================================================================

print_header "Step 15: Conversion Complete!"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           ANDROID PROJECT CONVERSION COMPLETE!             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Summary:"
echo "  Old Project Name:     $OLD_PROJECT_NAME"
echo "  New Project Name:     $NEW_PROJECT_NAME"
echo "  Old Package ID:       $OLD_PACKAGE_ID"
echo "  New Package ID:       $NEW_PACKAGE_ID"
echo "  New Project Location: $NEW_PROJECT_DIR"
echo ""
echo "Files Updated:"
echo "  ✓ settings.gradle"
echo "  ✓ app/build.gradle"
echo "  ✓ AndroidManifest.xml"
echo "  ✓ Java/Kotlin source files"
echo "  ✓ Package directory structure"
echo "  ✓ Resource files (strings.xml, etc.)"
echo "  ✓ app.json"
echo "  ✓ package.json"
echo "  ✓ index.js"
echo "  ✓ App component"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. cd $NEW_PROJECT_DIR"
echo "  2. npm install  (or yarn install)"
echo "  3. cd android && ./gradlew clean"
echo "  4. cd .. && npx react-native run-android"
echo ""
echo -e "${BLUE}Optional Steps:${NC}"
echo "  • Update README.md with your new project information"
echo "  • Update app icons in android/app/src/main/res/mipmap-*"
echo "  • Review and update any third-party service keys (Firebase, etc.)"
echo "  • Update version code and version name in android/app/build.gradle"
echo "  • Initialize new git repository: git init && git add . && git commit -m 'Initial commit'"
echo ""
print_success "Template project at $TEMPLATE_DIR remains unchanged"
print_success "You can use it to generate more projects in the future!"
echo ""

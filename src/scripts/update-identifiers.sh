#!/bin/bash

# ============================================================================
# React Native Package Identifier Updater
# ============================================================================
# This script updates package identifiers in an EXISTING React Native project
# Works for both Android and iOS in a single run
#
# Features:
# - Detects current Android package name
# - Detects current iOS bundle identifier
# - Updates all references throughout the project
# - Handles Java/Kotlin package restructuring
# - Updates Xcode project configuration
# - Safe backup creation before changes
#
# Usage: Run in your React Native project root
#        ./update-identifiers.sh
# ============================================================================

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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
    echo -e "${CYAN}ℹ $1${NC}"
}

# ============================================================================
# Validation Functions
# ============================================================================

validate_android_package() {
    local package=$1
    if [[ -z "$package" ]]; then
        return 1
    fi
    # Android package: lowercase, dots, letters, numbers, underscores
    if [[ ! "$package" =~ ^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$ ]]; then
        return 1
    fi
    return 0
}

validate_ios_bundle() {
    local bundle=$1
    if [[ -z "$bundle" ]]; then
        return 1
    fi
    # iOS bundle: can include uppercase, dots, letters, numbers, hyphens, underscores
    if [[ ! "$bundle" =~ ^[a-zA-Z][a-zA-Z0-9_-]*(\.[a-zA-Z0-9_-]+)+$ ]]; then
        return 1
    fi
    return 0
}

# ============================================================================
# Main Script
# ============================================================================

print_header "React Native Package Identifier Updater"

# Check if we're in a React Native project
if [[ ! -f "app.json" ]] || [[ ! -f "package.json" ]]; then
    print_error "Not in a React Native project root!"
    print_error "Please run this script from your project root directory."
    exit 1
fi

PROJECT_DIR=$(pwd)
PROJECT_NAME=$(basename "$PROJECT_DIR")

print_info "Project Directory: $PROJECT_DIR"
print_info "Project Name: $PROJECT_NAME"

# ============================================================================
# Step 1: Detect Current Android Configuration
# ============================================================================

print_header "Step 1: Detecting Current Android Configuration"

OLD_ANDROID_PACKAGE=""
OLD_ANDROID_PATH=""

# Check android/app/build.gradle for namespace
if [[ -f "android/app/build.gradle" ]]; then
    # Try namespace first (modern Gradle)
    OLD_ANDROID_PACKAGE=$(grep 'namespace' android/app/build.gradle | sed 's/.*namespace[[:space:]]*"\([^"]*\)".*/\1/' | head -1)
    
    # If not found, try applicationId
    if [[ -z "$OLD_ANDROID_PACKAGE" ]]; then
        OLD_ANDROID_PACKAGE=$(grep 'applicationId' android/app/build.gradle | sed 's/.*applicationId[[:space:]]*"\([^"]*\)".*/\1/' | head -1)
    fi
    
    if [[ -n "$OLD_ANDROID_PACKAGE" ]]; then
        print_success "Android Package: $OLD_ANDROID_PACKAGE"
        OLD_ANDROID_PATH=$(echo "$OLD_ANDROID_PACKAGE" | tr '.' '/')
        print_info "Package Path: $OLD_ANDROID_PATH"
    else
        print_error "Could not detect Android package name from build.gradle"
        exit 1
    fi
else
    print_error "android/app/build.gradle not found!"
    exit 1
fi

# ============================================================================
# Step 2: Detect Current iOS Configuration
# ============================================================================

print_header "Step 2: Detecting Current iOS Configuration"

OLD_IOS_BUNDLE=""
OLD_IOS_TARGET=""

# Detect iOS target name from Podfile
if [[ -f "ios/Podfile" ]]; then
    OLD_IOS_TARGET=$(grep "^target '" ios/Podfile | sed "s/target '\([^']*\)'.*/\1/" | head -1)
    if [[ -z "$OLD_IOS_TARGET" ]]; then
        OLD_IOS_TARGET=$(grep '^target "' ios/Podfile | sed 's/target "\([^"]*\)".*/\1/' | head -1)
    fi
    
    if [[ -n "$OLD_IOS_TARGET" ]]; then
        print_success "iOS Target: $OLD_IOS_TARGET"
    else
        print_warning "Could not detect iOS target name"
    fi
fi

# Find Xcode project
XCODEPROJ=$(find ios -name "*.xcodeproj" -maxdepth 1 | head -1)
if [[ -n "$XCODEPROJ" ]]; then
    PBXPROJ="$XCODEPROJ/project.pbxproj"
    
    if [[ -f "$PBXPROJ" ]]; then
        # Extract bundle identifier
        OLD_IOS_BUNDLE=$(grep "PRODUCT_BUNDLE_IDENTIFIER" "$PBXPROJ" | grep -v "//" | head -1 | sed -E 's/.*PRODUCT_BUNDLE_IDENTIFIER[[:space:]]*=[[:space:]]*"?([^";]*).*$/\1/' | sed 's/[[:space:]]*$//')
        
        # Clean up if it contains variables
        if [[ "$OLD_IOS_BUNDLE" == *'$('* ]]; then
            OLD_IOS_BUNDLE=$(echo "$OLD_IOS_BUNDLE" | sed 's/\.\$(PRODUCT_NAME[^)]*)//g' | sed 's/\$([^)]*)//g')
        fi
        
        if [[ -n "$OLD_IOS_BUNDLE" ]]; then
            print_success "iOS Bundle ID: $OLD_IOS_BUNDLE"
        else
            print_warning "Could not detect iOS bundle identifier"
        fi
    fi
else
    print_warning "No Xcode project found in ios directory"
fi

# ============================================================================
# Step 3: Display Current Configuration
# ============================================================================

print_header "Step 3: Current Configuration Summary"

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              CURRENT PROJECT IDENTIFIERS                   ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Android:"
echo "  Package Name:  $OLD_ANDROID_PACKAGE"
echo "  Package Path:  android/app/src/main/java/$OLD_ANDROID_PATH"
echo ""
echo "iOS:"
if [[ -n "$OLD_IOS_TARGET" ]]; then
    echo "  Target Name:   $OLD_IOS_TARGET"
fi
if [[ -n "$OLD_IOS_BUNDLE" ]]; then
    echo "  Bundle ID:     $OLD_IOS_BUNDLE"
else
    echo "  Bundle ID:     (not detected)"
fi
echo ""

# ============================================================================
# Step 4: Get New Android Package Name
# ============================================================================

print_header "Step 4: Enter New Android Package Name"

echo ""
print_info "Current Android Package: $OLD_ANDROID_PACKAGE"
echo ""

NEW_ANDROID_PACKAGE=""
while true; do
    echo -e "${YELLOW}Enter new Android package name (e.g., com.company.myapp):${NC}"
    echo -e "${YELLOW}Or press ENTER to keep current: [$OLD_ANDROID_PACKAGE]${NC}"
    read -r input
    
    if [[ -z "$input" ]]; then
        NEW_ANDROID_PACKAGE="$OLD_ANDROID_PACKAGE"
        print_info "Keeping current Android package"
        break
    elif validate_android_package "$input"; then
        NEW_ANDROID_PACKAGE="$input"
        print_success "Valid Android package: $NEW_ANDROID_PACKAGE"
        break
    else
        print_error "Invalid Android package!"
        print_error "Must be lowercase with reverse domain notation (e.g., com.company.app)"
    fi
done

NEW_ANDROID_PATH=$(echo "$NEW_ANDROID_PACKAGE" | tr '.' '/')

# ============================================================================
# Step 5: Get New iOS Bundle Identifier
# ============================================================================

print_header "Step 5: Enter New iOS Bundle Identifier"

echo ""
if [[ -n "$OLD_IOS_BUNDLE" ]]; then
    print_info "Current iOS Bundle ID: $OLD_IOS_BUNDLE"
else
    print_info "iOS Bundle ID: (not currently set)"
fi
echo ""
print_info "You can use the same as Android or enter a different one"
echo ""

NEW_IOS_BUNDLE=""
while true; do
    if [[ -n "$OLD_IOS_BUNDLE" ]]; then
        echo -e "${YELLOW}Enter new iOS Bundle Identifier:${NC}"
        echo -e "${YELLOW}Press ENTER to keep current: [$OLD_IOS_BUNDLE]${NC}"
        echo -e "${YELLOW}Or type 'same' to use: $NEW_ANDROID_PACKAGE${NC}"
    else
        echo -e "${YELLOW}Enter new iOS Bundle Identifier:${NC}"
        echo -e "${YELLOW}Or type 'same' to use: $NEW_ANDROID_PACKAGE${NC}"
    fi
    
    read -r input
    
    if [[ -z "$input" ]] && [[ -n "$OLD_IOS_BUNDLE" ]]; then
        NEW_IOS_BUNDLE="$OLD_IOS_BUNDLE"
        print_info "Keeping current iOS bundle identifier"
        break
    elif [[ "$input" == "same" ]]; then
        NEW_IOS_BUNDLE="$NEW_ANDROID_PACKAGE"
        print_info "Using Android package for iOS: $NEW_IOS_BUNDLE"
        break
    elif [[ -n "$input" ]] && validate_ios_bundle "$input"; then
        NEW_IOS_BUNDLE="$input"
        print_success "Valid iOS bundle: $NEW_IOS_BUNDLE"
        break
    elif [[ -z "$input" ]]; then
        print_error "iOS Bundle Identifier is required!"
    else
        print_error "Invalid iOS Bundle Identifier!"
        print_error "Must use reverse domain notation (e.g., com.company.App)"
    fi
done

# ============================================================================
# Step 6: Confirmation
# ============================================================================

print_header "Step 6: Confirm Changes"

ANDROID_CHANGED=false
IOS_CHANGED=false

if [[ "$OLD_ANDROID_PACKAGE" != "$NEW_ANDROID_PACKAGE" ]]; then
    ANDROID_CHANGED=true
fi

if [[ "$OLD_IOS_BUNDLE" != "$NEW_IOS_BUNDLE" ]]; then
    IOS_CHANGED=true
fi

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    CHANGES SUMMARY                         ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [[ "$ANDROID_CHANGED" == true ]]; then
    echo -e "${YELLOW}Android:${NC}"
    echo "  Old: $OLD_ANDROID_PACKAGE"
    echo "  New: $NEW_ANDROID_PACKAGE"
    echo ""
else
    echo -e "${GREEN}Android: No changes${NC}"
    echo ""
fi

if [[ "$IOS_CHANGED" == true ]]; then
    echo -e "${YELLOW}iOS:${NC}"
    echo "  Old: $OLD_IOS_BUNDLE"
    echo "  New: $NEW_IOS_BUNDLE"
    echo ""
else
    echo -e "${GREEN}iOS: No changes${NC}"
    echo ""
fi

if [[ "$ANDROID_CHANGED" == false ]] && [[ "$IOS_CHANGED" == false ]]; then
    print_info "No changes to apply. Exiting."
    exit 0
fi

echo ""
read -p "$(echo -e ${YELLOW}"Proceed with these changes? (y/n): "${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Update cancelled."
    exit 0
fi

# ============================================================================
# Step 7: Create Backup
# ============================================================================

print_header "Step 7: Creating Backup"

BACKUP_DIR=".backup_$(date +%Y%m%d_%H%M%S)"
print_info "Creating backup at: $BACKUP_DIR"

mkdir -p "$BACKUP_DIR"

# Backup critical files
if [[ "$ANDROID_CHANGED" == true ]]; then
    cp -r android "$BACKUP_DIR/" 2>/dev/null || true
fi

if [[ "$IOS_CHANGED" == true ]]; then
    cp -r ios "$BACKUP_DIR/" 2>/dev/null || true
fi

cp app.json "$BACKUP_DIR/" 2>/dev/null || true

print_success "Backup created at: $BACKUP_DIR"

# ============================================================================
# ANDROID UPDATES
# ============================================================================

if [[ "$ANDROID_CHANGED" == true ]]; then
    print_header "Updating Android Configuration"
    
    # Update build.gradle
    print_info "Updating android/app/build.gradle..."
    if [[ -f "android/app/build.gradle" ]]; then
        sed -i.bak "s/namespace \"$OLD_ANDROID_PACKAGE\"/namespace \"$NEW_ANDROID_PACKAGE\"/g" android/app/build.gradle
        sed -i.bak "s/applicationId \"$OLD_ANDROID_PACKAGE\"/applicationId \"$NEW_ANDROID_PACKAGE\"/g" android/app/build.gradle
        rm -f android/app/build.gradle.bak
        print_success "build.gradle updated"
    fi
    
    # Update AndroidManifest.xml files
    print_info "Updating AndroidManifest.xml files..."
    find android/app/src -name "AndroidManifest.xml" | while read -r manifest; do
        if grep -q "$OLD_ANDROID_PACKAGE" "$manifest"; then
            sed -i.bak "s/$OLD_ANDROID_PACKAGE/$NEW_ANDROID_PACKAGE/g" "$manifest"
            rm -f "$manifest.bak"
            print_success "Updated: $manifest"
        fi
    done
    
    # Update Java/Kotlin source files
    print_info "Updating Java/Kotlin source files..."
    find android/app/src -type f \( -name "*.java" -o -name "*.kt" \) | while read -r file; do
        if grep -q "package $OLD_ANDROID_PACKAGE" "$file"; then
            sed -i.bak "s/package $OLD_ANDROID_PACKAGE/package $NEW_ANDROID_PACKAGE/g" "$file"
            rm -f "$file.bak"
        fi
        if grep -q "import $OLD_ANDROID_PACKAGE" "$file"; then
            sed -i.bak "s/import $OLD_ANDROID_PACKAGE/import $NEW_ANDROID_PACKAGE/g" "$file"
            rm -f "$file.bak"
        fi
    done
    print_success "Source files updated"
    
    # Restructure package directories
    print_info "Restructuring package directories..."
    JAVA_MAIN="android/app/src/main/java"
    OLD_PKG_DIR="$JAVA_MAIN/$OLD_ANDROID_PATH"
    NEW_PKG_DIR="$JAVA_MAIN/$NEW_ANDROID_PATH"
    
    if [[ -d "$OLD_PKG_DIR" ]] && [[ "$OLD_PKG_DIR" != "$NEW_PKG_DIR" ]]; then
        mkdir -p "$NEW_PKG_DIR"
        cp -r "$OLD_PKG_DIR/"* "$NEW_PKG_DIR/" 2>/dev/null || true
        
        # Verify copy
        if [[ -d "$NEW_PKG_DIR" ]] && [[ "$(ls -A "$NEW_PKG_DIR")" ]]; then
            rm -rf "$OLD_PKG_DIR"
            
            # Clean up empty parent directories
            current_dir=$(dirname "$OLD_PKG_DIR")
            while [[ "$current_dir" != "$JAVA_MAIN" ]] && [[ -d "$current_dir" ]]; do
                if [[ ! $(ls -A "$current_dir" 2>/dev/null) ]]; then
                    rmdir "$current_dir" 2>/dev/null || true
                    current_dir=$(dirname "$current_dir")
                else
                    break
                fi
            done
            
            print_success "Package directory restructured"
        fi
    fi
    
    # Update google-services.json if exists
    if [[ -f "android/app/google-services.json" ]]; then
        print_info "Updating google-services.json..."
        if grep -q "\"package_name\": \"$OLD_ANDROID_PACKAGE\"" android/app/google-services.json; then
            sed -i.bak "s/\"package_name\": \"$OLD_ANDROID_PACKAGE\"/\"package_name\": \"$NEW_ANDROID_PACKAGE\"/g" android/app/google-services.json
            rm -f android/app/google-services.json.bak
            print_success "google-services.json updated"
            print_warning "Remember to update Firebase Console with new package name!"
        fi
    fi
    
    # Update proguard-rules.pro
    if [[ -f "android/app/proguard-rules.pro" ]]; then
        if grep -q "$OLD_ANDROID_PACKAGE" android/app/proguard-rules.pro; then
            sed -i.bak "s/$OLD_ANDROID_PACKAGE/$NEW_ANDROID_PACKAGE/g" android/app/proguard-rules.pro
            rm -f android/app/proguard-rules.pro.bak
            print_success "proguard-rules.pro updated"
        fi
    fi
    
    # Clean build artifacts
    print_info "Cleaning Android build artifacts..."
    rm -rf android/app/build android/build android/.gradle 2>/dev/null || true
    print_success "Android build artifacts cleaned"
    
    print_success "Android configuration updated successfully!"
fi

# ============================================================================
# iOS UPDATES
# ============================================================================

if [[ "$IOS_CHANGED" == true ]]; then
    print_header "Updating iOS Configuration"
    
    # Update Info.plist
    if [[ -n "$OLD_IOS_TARGET" ]] && [[ -f "ios/$OLD_IOS_TARGET/Info.plist" ]]; then
        INFO_PLIST="ios/$OLD_IOS_TARGET/Info.plist"
        print_info "Updating Info.plist..."
        
        # Update hardcoded bundle identifiers (if any)
        if grep -q "<string>$OLD_IOS_BUNDLE</string>" "$INFO_PLIST"; then
            sed -i.bak "s/<string>$OLD_IOS_BUNDLE<\/string>/<string>$NEW_IOS_BUNDLE<\/string>/g" "$INFO_PLIST"
            rm -f "$INFO_PLIST.bak"
            print_success "Info.plist updated"
        fi
    fi
    
    # Update Xcode project (pbxproj)
    if [[ -f "$PBXPROJ" ]]; then
        print_info "Updating Xcode project configuration..."
        
        # Backup pbxproj
        cp "$PBXPROJ" "${PBXPROJ}.backup"
        
        # Update PRODUCT_BUNDLE_IDENTIFIER
        if grep -q "PRODUCT_BUNDLE_IDENTIFIER.*$OLD_IOS_BUNDLE" "$PBXPROJ"; then
            # Update all occurrences
            sed -i.bak "s/PRODUCT_BUNDLE_IDENTIFIER = $OLD_IOS_BUNDLE;/PRODUCT_BUNDLE_IDENTIFIER = \"$NEW_IOS_BUNDLE\";/g" "$PBXPROJ"
            sed -i.bak "s/PRODUCT_BUNDLE_IDENTIFIER = \"$OLD_IOS_BUNDLE\";/PRODUCT_BUNDLE_IDENTIFIER = \"$NEW_IOS_BUNDLE\";/g" "$PBXPROJ"
            rm -f "$PBXPROJ.bak"
            print_success "Xcode project.pbxproj updated"
        fi
        
        # Update default React Native pattern if present
        if grep -q 'org\.reactjs\.native\.example\.\$(PRODUCT_NAME:rfc1034identifier)' "$PBXPROJ"; then
            perl -i.bak -pe 's/PRODUCT_BUNDLE_IDENTIFIER = org\.reactjs\.native\.example\.\$\(PRODUCT_NAME:rfc1034identifier\);/PRODUCT_BUNDLE_IDENTIFIER = "'"$NEW_IOS_BUNDLE"'";/g' "$PBXPROJ"
            perl -i.bak -pe 's/PRODUCT_BUNDLE_IDENTIFIER = "org\.reactjs\.native\.example\.\$\(PRODUCT_NAME:rfc1034identifier\)";/PRODUCT_BUNDLE_IDENTIFIER = "'"$NEW_IOS_BUNDLE"'";/g' "$PBXPROJ"
            rm -f "$PBXPROJ.bak"
            print_success "Default React Native bundle pattern replaced"
        fi
    fi
    
    # Update GoogleService-Info.plist (Firebase iOS)
    if [[ -n "$OLD_IOS_TARGET" ]] && [[ -f "ios/$OLD_IOS_TARGET/GoogleService-Info.plist" ]]; then
        GOOGLE_PLIST="ios/$OLD_IOS_TARGET/GoogleService-Info.plist"
        print_info "Updating GoogleService-Info.plist..."
        
        CURRENT_FIREBASE_BUNDLE=$(grep -A1 "BUNDLE_ID" "$GOOGLE_PLIST" | grep "<string>" | sed 's/.*<string>\(.*\)<\/string>.*/\1/')
        
        if [[ -n "$CURRENT_FIREBASE_BUNDLE" ]] && [[ "$CURRENT_FIREBASE_BUNDLE" == "$OLD_IOS_BUNDLE" ]]; then
            sed -i.bak "s|<string>$CURRENT_FIREBASE_BUNDLE</string>|<string>$NEW_IOS_BUNDLE</string>|g" "$GOOGLE_PLIST"
            rm -f "${GOOGLE_PLIST}.bak"
            print_success "GoogleService-Info.plist updated"
            print_warning "Remember to update Firebase Console with new bundle ID!"
        fi
    fi
    
    # Clean iOS build artifacts
    print_info "Cleaning iOS build artifacts..."
    rm -rf ios/build ios/Pods ios/Podfile.lock 2>/dev/null || true
    print_success "iOS build artifacts cleaned"
    
    print_success "iOS configuration updated successfully!"
fi

# ============================================================================
# Verification
# ============================================================================

print_header "Verification"

if [[ "$ANDROID_CHANGED" == true ]]; then
    ANDROID_COUNT=$(grep -r "$NEW_ANDROID_PACKAGE" android/app/src --exclude-dir={build} 2>/dev/null | grep -v "Binary file" | wc -l)
    if [[ $ANDROID_COUNT -gt 0 ]]; then
        print_success "Android: Found $ANDROID_COUNT references to new package"
    else
        print_warning "Android: Could not verify new package references"
    fi
fi

if [[ "$IOS_CHANGED" == true ]]; then
    IOS_COUNT=$(grep -r "$NEW_IOS_BUNDLE" ios --exclude-dir={build,Pods} 2>/dev/null | grep -v "Binary file" | wc -l)
    if [[ $IOS_COUNT -gt 0 ]]; then
        print_success "iOS: Found $IOS_COUNT references to new bundle ID"
    else
        print_warning "iOS: Could not verify new bundle ID references"
    fi
fi

# ============================================================================
# Completion
# ============================================================================

print_header "Update Complete!"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          PACKAGE IDENTIFIERS UPDATED SUCCESSFULLY!         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [[ "$ANDROID_CHANGED" == true ]]; then
    echo -e "${CYAN}Android:${NC}"
    echo "  Old Package: $OLD_ANDROID_PACKAGE"
    echo "  New Package: $NEW_ANDROID_PACKAGE"
    echo ""
fi

if [[ "$IOS_CHANGED" == true ]]; then
    echo -e "${CYAN}iOS:${NC}"
    echo "  Old Bundle:  $OLD_IOS_BUNDLE"
    echo "  New Bundle:  $NEW_IOS_BUNDLE"
    echo ""
fi

echo -e "${YELLOW}Next Steps:${NC}"
echo ""

if [[ "$ANDROID_CHANGED" == true ]]; then
    echo "Android:"
    echo "  1. cd android && ./gradlew clean"
    echo "  2. cd .. && npx react-native run-android"
    echo ""
fi

if [[ "$IOS_CHANGED" == true ]]; then
    echo "iOS:"
    echo "  1. cd ios && pod install"
    echo "  2. cd .. && npx react-native run-ios"
    echo ""
fi

echo -e "${BLUE}Backup Location:${NC}"
echo "  $BACKUP_DIR"
echo ""

print_success "Update completed successfully!"
print_info "Your project identifiers have been updated!"
echo ""

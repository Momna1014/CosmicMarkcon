#!/bin/bash

# ============================================================================
# React Native iOS Project Renamer
# ============================================================================
# This script renames iOS-specific files and configurations in an existing
# React Native project (after running the Android rename script).
#
# Features:
# - Works in current directory (no new folder creation)
# - Updates Xcode project and workspace
# - Renames iOS target and scheme
# - Updates Info.plist and bundle identifier
# - Updates Podfile
# - Renames project directory
# - Updates all file references
#
# Usage: Run AFTER Android rename script in the new project directory
#        cd /path/to/NewProject
#        ./rename-ios-project.sh
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
# Main Script
# ============================================================================

print_header "React Native iOS Project Renamer"

# Get current directory (should be the new project directory)
PROJECT_DIR=$(pwd)
PROJECT_DIR_NAME=$(basename "$PROJECT_DIR")

print_info "Current directory: $PROJECT_DIR"
print_info "Project directory name: $PROJECT_DIR_NAME"

# ============================================================================
# Helper Function: Validate Bundle Identifier
# ============================================================================

validate_bundle_id() {
    local bundle=$1
    # Check if bundle is empty
    if [[ -z "$bundle" ]]; then
        return 1
    fi
    # Check if bundle follows iOS bundle naming convention (can include dots and underscores)
    if [[ ! "$bundle" =~ ^[a-zA-Z][a-zA-Z0-9_-]*(\.[a-zA-Z0-9_-]+)+$ ]]; then
        return 1
    fi
    return 0
}

# ============================================================================
# Step 1: Detect Current Configuration
# ============================================================================

print_header "Step 1: Detecting Current iOS Configuration"

# Check if we're in a React Native project
if [[ ! -f "app.json" ]]; then
    print_error "app.json not found. Are you in a React Native project root?"
    exit 1
fi

if [[ ! -d "ios" ]]; then
    print_error "ios directory not found. Are you in a React Native project root?"
    exit 1
fi

# Get project name from app.json
NEW_PROJECT_NAME=$(grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' app.json | sed 's/"name"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/')
print_success "Detected project name from app.json: $NEW_PROJECT_NAME"

# Detect old iOS project name from Podfile
cd ios
OLD_IOS_NAME=$(grep "^target '" Podfile | sed "s/target '\([^']*\)'.*/\1/" | head -1)
if [[ -z "$OLD_IOS_NAME" ]]; then
    # Try double quotes
    OLD_IOS_NAME=$(grep '^target "' Podfile | sed 's/target "\([^"]*\)".*/\1/' | head -1)
fi

if [[ -z "$OLD_IOS_NAME" ]]; then
    print_error "Could not detect old iOS target name from Podfile"
    exit 1
fi

print_success "Detected old iOS target name: $OLD_IOS_NAME"
cd ..

# Detect old bundle identifier from Info.plist or pbxproj
if [[ -f "ios/$OLD_IOS_NAME/Info.plist" ]]; then
    # Try to get CFBundleDisplayName
    OLD_DISPLAY_NAME=$(grep -A1 "CFBundleDisplayName" "ios/$OLD_IOS_NAME/Info.plist" | grep "<string>" | sed 's/.*<string>\(.*\)<\/string>.*/\1/')
    print_info "Current display name: $OLD_DISPLAY_NAME"
fi

# Find .xcodeproj
XCODEPROJ=$(find ios -name "*.xcodeproj" -maxdepth 1 | head -1)
if [[ -z "$XCODEPROJ" ]]; then
    print_error "No .xcodeproj found in ios directory"
    exit 1
fi

OLD_XCODEPROJ_NAME=$(basename "$XCODEPROJ")
print_success "Found Xcode project: $OLD_XCODEPROJ_NAME"

# Detect old bundle identifier from pbxproj
PBXPROJ="ios/$OLD_XCODEPROJ_NAME/project.pbxproj"
OLD_BUNDLE_ID=""

if [[ -f "$PBXPROJ" ]]; then
    # Try to extract the first PRODUCT_BUNDLE_IDENTIFIER value
    OLD_BUNDLE_ID=$(grep "PRODUCT_BUNDLE_IDENTIFIER" "$PBXPROJ" | grep -v "//" | head -1 | sed -E 's/.*PRODUCT_BUNDLE_IDENTIFIER[[:space:]]*=[[:space:]]*"?([^";]*).*$/\1/' | sed 's/[[:space:]]*$//')
    
    # Clean up if it's a variable reference
    if [[ "$OLD_BUNDLE_ID" == *"PRODUCT_NAME"* ]] || [[ "$OLD_BUNDLE_ID" == *'$('* ]]; then
        # Extract the base part before the variable
        OLD_BUNDLE_ID=$(echo "$OLD_BUNDLE_ID" | sed 's/\.\$(PRODUCT_NAME[^)]*)//g' | sed 's/\$([^)]*)//g')
    fi
    
    if [[ -n "$OLD_BUNDLE_ID" ]]; then
        print_success "Detected old bundle identifier: $OLD_BUNDLE_ID"
    else
        print_warning "Could not detect bundle identifier from pbxproj"
    fi
fi

# Try to get from GoogleService-Info.plist as fallback
if [[ -z "$OLD_BUNDLE_ID" ]] && [[ -f "ios/$OLD_IOS_NAME/GoogleService-Info.plist" ]]; then
    OLD_BUNDLE_ID=$(grep -A1 "BUNDLE_ID" "ios/$OLD_IOS_NAME/GoogleService-Info.plist" | grep "<string>" | sed 's/.*<string>\(.*\)<\/string>.*/\1/')
    if [[ -n "$OLD_BUNDLE_ID" ]]; then
        print_success "Detected bundle identifier from GoogleService-Info.plist: $OLD_BUNDLE_ID"
    fi
fi

# ============================================================================
# Step 2: Get New Bundle Identifier
# ============================================================================

print_header "Step 2: Enter New Bundle Identifier"

# Detect Android package name from build.gradle
ANDROID_BUILD_GRADLE="android/app/build.gradle"
DETECTED_ANDROID_PACKAGE=""

if [[ -f "$ANDROID_BUILD_GRADLE" ]]; then
    # Check for namespace first (modern Gradle)
    DETECTED_ANDROID_PACKAGE=$(grep "namespace" "$ANDROID_BUILD_GRADLE" | sed "s/.*namespace[[:space:]]*[\"']\(.*\)[\"'].*/\1/" | head -1)
    
    # If not found, check for applicationId
    if [[ -z "$DETECTED_ANDROID_PACKAGE" ]]; then
        DETECTED_ANDROID_PACKAGE=$(grep "applicationId" "$ANDROID_BUILD_GRADLE" | sed "s/.*applicationId[[:space:]]*[\"']\(.*\)[\"'].*/\1/" | head -1)
    fi
    
    if [[ -n "$DETECTED_ANDROID_PACKAGE" ]]; then
        print_success "Detected Android package: $DETECTED_ANDROID_PACKAGE"
    fi
fi

# Prompt for new bundle identifier
echo ""
print_info "Enter the new iOS Bundle Identifier for your app"
print_info "Format: com.company.appname (e.g., com.mycompany.myapp)"
print_info ""
if [[ -n "$OLD_BUNDLE_ID" ]]; then
    print_info "Current iOS Bundle ID: $OLD_BUNDLE_ID"
fi
if [[ -n "$DETECTED_ANDROID_PACKAGE" ]]; then
    print_info "Android Package Name:  $DETECTED_ANDROID_PACKAGE"
    print_info ""
    print_info "You can use the same as Android or enter a different one for iOS"
fi
echo ""

# Generate suggested bundle ID
PROJECT_NAME_LOWER=$(echo "$NEW_PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | tr '_' '.')
SUGGESTED_BUNDLE="com.example.$PROJECT_NAME_LOWER"

while true; do
    if [[ -n "$DETECTED_ANDROID_PACKAGE" ]]; then
        echo -e "${YELLOW}New iOS Bundle Identifier [$DETECTED_ANDROID_PACKAGE]:${NC} "
    else
        echo -e "${YELLOW}New iOS Bundle Identifier (e.g., $SUGGESTED_BUNDLE):${NC} "
    fi
    read -r NEW_BUNDLE_ID
    
    # Use detected Android package if user pressed enter
    if [[ -z "$NEW_BUNDLE_ID" ]] && [[ -n "$DETECTED_ANDROID_PACKAGE" ]]; then
        NEW_BUNDLE_ID="$DETECTED_ANDROID_PACKAGE"
        print_info "Using: $NEW_BUNDLE_ID"
    fi
    
    if validate_bundle_id "$NEW_BUNDLE_ID"; then
        print_success "Valid Bundle Identifier: $NEW_BUNDLE_ID"
        break
    else
        print_error "Invalid Bundle Identifier format!"
        print_error "Must be reverse domain notation (e.g., com.company.app)"
        print_error "Can contain letters, numbers, dots, hyphens, and underscores"
    fi
done

# ============================================================================
# Step 3: Confirmation
# ============================================================================

print_header "Step 3: Configuration Summary & Confirmation"

echo ""
echo "Current iOS Configuration:"
echo "  iOS Target Name:     $OLD_IOS_NAME"
echo "  Xcode Project:       $OLD_XCODEPROJ_NAME"
echo "  Display Name:        $OLD_DISPLAY_NAME"
if [[ -n "$OLD_BUNDLE_ID" ]]; then
    echo "  Bundle Identifier:   $OLD_BUNDLE_ID"
fi
echo ""
echo "New iOS Configuration:"
echo "  iOS Target Name:     $NEW_PROJECT_NAME"
echo "  Xcode Project:       ${NEW_PROJECT_NAME}.xcodeproj"
echo "  Display Name:        $NEW_PROJECT_NAME"
echo "  Bundle Identifier:   $NEW_BUNDLE_ID"
echo ""
echo "This will update the iOS configuration in: $PROJECT_DIR"
echo ""

read -p "$(echo -e ${YELLOW}"Proceed with iOS renaming? (y/n): "${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "iOS renaming cancelled."
    exit 0
fi

# ============================================================================
# Step 4: Verify Root Files (app.json, index.js)
# ============================================================================

print_header "Step 4: Verifying Root Configuration Files"

# Check and update app.json if needed
if [[ -f "app.json" ]]; then
    CURRENT_APP_NAME=$(grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' app.json | sed 's/"name"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/')
    if [[ "$CURRENT_APP_NAME" != "$NEW_PROJECT_NAME" ]]; then
        print_warning "app.json still has old name: $CURRENT_APP_NAME"
        print_info "Updating app.json to: $NEW_PROJECT_NAME"
        sed -i.bak "s/\"name\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"name\": \"$NEW_PROJECT_NAME\"/g" app.json
        sed -i.bak "s/\"displayName\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"displayName\": \"$NEW_PROJECT_NAME\"/g" app.json
        rm -f app.json.bak
        print_success "app.json updated"
    else
        print_success "app.json already correct"
    fi
fi

# Check and update index.js if needed
if [[ -f "index.js" ]]; then
    if grep -q "AppRegistry.registerComponent" index.js; then
        REGISTERED_NAME=$(grep "AppRegistry.registerComponent" index.js | sed "s/.*AppRegistry.registerComponent('\([^']*\)'.*/\1/")
        if [[ -n "$REGISTERED_NAME" ]] && [[ "$REGISTERED_NAME" != "$NEW_PROJECT_NAME" ]]; then
            print_warning "index.js still registering as: $REGISTERED_NAME"
            print_info "Updating index.js to register as: $NEW_PROJECT_NAME"
            sed -i.bak "s/AppRegistry.registerComponent('$REGISTERED_NAME'/AppRegistry.registerComponent('$NEW_PROJECT_NAME'/g" index.js
            sed -i.bak "s/AppRegistry.registerComponent(\"$REGISTERED_NAME\"/AppRegistry.registerComponent(\"$NEW_PROJECT_NAME\"/g" index.js
            rm -f index.js.bak
            print_success "index.js updated"
        else
            print_success "index.js already correct"
        fi
    fi
fi

# Check and update App.tsx/App.js if needed
for app_file in "App.tsx" "App.js"; do
    if [[ -f "$app_file" ]]; then
        if grep -q "$OLD_IOS_NAME" "$app_file"; then
            print_info "Updating references in $app_file..."
            sed -i.bak "s/$OLD_IOS_NAME/$NEW_PROJECT_NAME/g" "$app_file"
            rm -f "$app_file.bak"
            print_success "$app_file updated"
        fi
    fi
done

# ============================================================================
# Step 5: Update Podfile
# ============================================================================

print_header "Step 5: Updating Podfile"

cd ios

if [[ -f "Podfile" ]]; then
    print_info "Updating target name in Podfile..."
    
    # Update target name
    sed -i.bak "s/target '$OLD_IOS_NAME'/target '$NEW_PROJECT_NAME'/g" Podfile
    sed -i.bak "s/target \"$OLD_IOS_NAME\"/target \"$NEW_PROJECT_NAME\"/g" Podfile
    
    # Update any other references
    if grep -q "$OLD_IOS_NAME" Podfile; then
        sed -i.bak "s/$OLD_IOS_NAME/$NEW_PROJECT_NAME/g" Podfile
    fi
    
    rm -f Podfile.bak
    print_success "Podfile updated"
else
    print_warning "Podfile not found"
fi

cd ..

# ============================================================================
# Step 6: Rename iOS Project Directory
# ============================================================================

print_header "Step 6: Renaming iOS Project Directory"

if [[ -d "ios/$OLD_IOS_NAME" ]]; then
    print_info "Renaming ios/$OLD_IOS_NAME to ios/$NEW_PROJECT_NAME..."
    
    # Check if target directory already exists
    if [[ -d "ios/$NEW_PROJECT_NAME" ]] && [[ "$OLD_IOS_NAME" != "$NEW_PROJECT_NAME" ]]; then
        print_error "Directory ios/$NEW_PROJECT_NAME already exists!"
        exit 1
    fi
    
    if [[ "$OLD_IOS_NAME" != "$NEW_PROJECT_NAME" ]]; then
        mv "ios/$OLD_IOS_NAME" "ios/$NEW_PROJECT_NAME"
        print_success "Project directory renamed"
    else
        print_info "Project directory already has correct name"
    fi
else
    print_warning "iOS project directory ios/$OLD_IOS_NAME not found"
fi

# ============================================================================
# Step 7: Update Info.plist
# ============================================================================

print_header "Step 7: Updating Info.plist"

INFO_PLIST="ios/$NEW_PROJECT_NAME/Info.plist"

if [[ -f "$INFO_PLIST" ]]; then
    print_info "Updating Info.plist..."
    
    # Update display name
    if grep -q "CFBundleDisplayName" "$INFO_PLIST"; then
        sed -i.bak "s/<string>$OLD_DISPLAY_NAME<\/string>/<string>$NEW_PROJECT_NAME<\/string>/g" "$INFO_PLIST"
        sed -i.bak "s/<string>$OLD_IOS_NAME<\/string>/<string>$NEW_PROJECT_NAME<\/string>/g" "$INFO_PLIST"
    fi
    
    # Update CFBundleIdentifier if present and hardcoded
    if grep -q "CFBundleIdentifier" "$INFO_PLIST"; then
        # Extract current bundle identifier pattern
        CURRENT_BUNDLE=$(grep -A1 "CFBundleIdentifier" "$INFO_PLIST" | grep "<string>" | sed 's/.*<string>\(.*\)<\/string>.*/\1/')
        if [[ "$CURRENT_BUNDLE" != *"\$(PRODUCT_BUNDLE_IDENTIFIER)"* ]] && [[ "$CURRENT_BUNDLE" != *"\$("* ]]; then
            # Only update if it's a hardcoded value, not a variable
            if [[ -n "$OLD_BUNDLE_ID" ]] && [[ "$CURRENT_BUNDLE" == *"$OLD_BUNDLE_ID"* ]]; then
                sed -i.bak "s|<string>$OLD_BUNDLE_ID</string>|<string>$NEW_BUNDLE_ID</string>|g" "$INFO_PLIST"
                print_info "Updated hardcoded Bundle ID in Info.plist: $OLD_BUNDLE_ID → $NEW_BUNDLE_ID"
            fi
        fi
    fi
    
    # Update any other references to old name
    if grep -q "$OLD_IOS_NAME" "$INFO_PLIST"; then
        sed -i.bak "s/$OLD_IOS_NAME/$NEW_PROJECT_NAME/g" "$INFO_PLIST"
    fi
    
    # Update old bundle ID references if different from old iOS name
    if [[ -n "$OLD_BUNDLE_ID" ]] && [[ "$OLD_BUNDLE_ID" != "$OLD_IOS_NAME" ]]; then
        if grep -q "$OLD_BUNDLE_ID" "$INFO_PLIST"; then
            sed -i.bak "s/$OLD_BUNDLE_ID/$NEW_BUNDLE_ID/g" "$INFO_PLIST"
        fi
    fi
    
    rm -f "$INFO_PLIST.bak"
    print_success "Info.plist updated"
else
    print_warning "Info.plist not found at $INFO_PLIST"
fi

# ============================================================================
# Step 8: Update iOS Source Files (AppDelegate, etc.)
# ============================================================================

print_header "Step 8: Updating iOS Source Files"

print_info "Updating AppDelegate and other Swift/Objective-C files..."

# Update all Swift files in the project directory
find "ios/$NEW_PROJECT_NAME" -type f \( -name "*.swift" -o -name "*.m" -o -name "*.h" \) 2>/dev/null | while read -r file; do
    if [[ -f "$file" ]] && grep -q "$OLD_IOS_NAME" "$file"; then
        sed -i.bak "s/$OLD_IOS_NAME/$NEW_PROJECT_NAME/g" "$file"
        rm -f "$file.bak"
        print_success "Updated: $(basename "$file")"
    fi
done

# Specifically handle AppDelegate files for module name registration
APP_DELEGATE_SWIFT="ios/$NEW_PROJECT_NAME/AppDelegate.swift"
APP_DELEGATE_M="ios/$NEW_PROJECT_NAME/AppDelegate.m"
APP_DELEGATE_MM="ios/$NEW_PROJECT_NAME/AppDelegate.mm"

if [[ -f "$APP_DELEGATE_SWIFT" ]]; then
    # Update Swift AppDelegate - check for withModuleName parameter
    if grep -q "withModuleName:" "$APP_DELEGATE_SWIFT"; then
        sed -i.bak "s/withModuleName: \"$OLD_IOS_NAME\"/withModuleName: \"$NEW_PROJECT_NAME\"/g" "$APP_DELEGATE_SWIFT"
        rm -f "$APP_DELEGATE_SWIFT.bak"
        print_success "Updated module name in AppDelegate.swift"
    fi
fi

if [[ -f "$APP_DELEGATE_M" ]]; then
    # Update Objective-C AppDelegate - check for moduleName
    if grep -q "moduleName:@\"$OLD_IOS_NAME\"" "$APP_DELEGATE_M"; then
        sed -i.bak "s/moduleName:@\"$OLD_IOS_NAME\"/moduleName:@\"$NEW_PROJECT_NAME\"/g" "$APP_DELEGATE_M"
        rm -f "$APP_DELEGATE_M.bak"
        print_success "Updated module name in AppDelegate.m"
    fi
fi

if [[ -f "$APP_DELEGATE_MM" ]]; then
    # Update Objective-C++ AppDelegate
    if grep -q "moduleName:@\"$OLD_IOS_NAME\"" "$APP_DELEGATE_MM"; then
        sed -i.bak "s/moduleName:@\"$OLD_IOS_NAME\"/moduleName:@\"$NEW_PROJECT_NAME\"/g" "$APP_DELEGATE_MM"
        rm -f "$APP_DELEGATE_MM.bak"
        print_success "Updated module name in AppDelegate.mm"
    fi
fi

# Update Storyboard and XIB files
print_info "Updating Storyboard and XIB files..."
find "ios/$NEW_PROJECT_NAME" -type f \( -name "*.storyboard" -o -name "*.xib" \) 2>/dev/null | while read -r file; do
    if [[ -f "$file" ]] && grep -q "$OLD_IOS_NAME" "$file"; then
        sed -i.bak "s/$OLD_IOS_NAME/$NEW_PROJECT_NAME/g" "$file"
        rm -f "$file.bak"
        print_success "Updated: $(basename "$file")"
    fi
done

print_success "iOS source files updated"

# ============================================================================
# Step 9: Update Xcode Project File (.pbxproj)
# ============================================================================

print_header "Step 9: Updating Xcode Project Configuration"

PBXPROJ="ios/$OLD_XCODEPROJ_NAME/project.pbxproj"

if [[ -f "$PBXPROJ" ]]; then
    print_info "Updating project.pbxproj..."
    
    # Create backup
    cp "$PBXPROJ" "${PBXPROJ}.backup"
    print_info "Created backup: ${PBXPROJ}.backup"
    
    # Update ALL occurrences of old iOS name with new name
    sed -i.bak "s/$OLD_IOS_NAME/$NEW_PROJECT_NAME/g" "$PBXPROJ"
    
    # Update target names
    sed -i.bak "s/name = $OLD_IOS_NAME;/name = $NEW_PROJECT_NAME;/g" "$PBXPROJ"
    sed -i.bak "s/\"$OLD_IOS_NAME\"/\"$NEW_PROJECT_NAME\"/g" "$PBXPROJ"
    
    # Update product name
    sed -i.bak "s/PRODUCT_NAME = $OLD_IOS_NAME/PRODUCT_NAME = $NEW_PROJECT_NAME/g" "$PBXPROJ"
    sed -i.bak "s/PRODUCT_NAME = \"$OLD_IOS_NAME\"/PRODUCT_NAME = \"$NEW_PROJECT_NAME\"/g" "$PBXPROJ"
    
    # ========================================================================
    # Critical: Update Bundle Identifier in ALL build configurations
    # ========================================================================
    
    print_info "Updating PRODUCT_BUNDLE_IDENTIFIER..."
    
    # Check if using the default React Native pattern
    if grep -q 'org\.reactjs\.native\.example\.\$(PRODUCT_NAME:rfc1034identifier)' "$PBXPROJ"; then
        print_info "Replacing default React Native bundle identifier pattern..."
        
        # Replace ALL occurrences of the default pattern
        perl -i.bak -pe 's/PRODUCT_BUNDLE_IDENTIFIER = org\.reactjs\.native\.example\.\$\(PRODUCT_NAME:rfc1034identifier\);/PRODUCT_BUNDLE_IDENTIFIER = "'"$NEW_BUNDLE_ID"'";/g' "$PBXPROJ"
        perl -i.bak -pe 's/PRODUCT_BUNDLE_IDENTIFIER = "org\.reactjs\.native\.example\.\$\(PRODUCT_NAME:rfc1034identifier\)";/PRODUCT_BUNDLE_IDENTIFIER = "'"$NEW_BUNDLE_ID"'";/g' "$PBXPROJ"
        
        print_success "Replaced default pattern with: $NEW_BUNDLE_ID"
    fi
    
    # Update any hardcoded bundle identifiers (with or without quotes)
    if [[ -n "$OLD_BUNDLE_ID" ]]; then
        print_info "Updating existing bundle identifier: $OLD_BUNDLE_ID → $NEW_BUNDLE_ID"
        
        # Update all variations
        sed -i.bak "s/PRODUCT_BUNDLE_IDENTIFIER = $OLD_BUNDLE_ID;/PRODUCT_BUNDLE_IDENTIFIER = \"$NEW_BUNDLE_ID\";/g" "$PBXPROJ"
        sed -i.bak "s/PRODUCT_BUNDLE_IDENTIFIER = \"$OLD_BUNDLE_ID\";/PRODUCT_BUNDLE_IDENTIFIER = \"$NEW_BUNDLE_ID\";/g" "$PBXPROJ"
        
        # Update partial matches (e.g., old bundle with product name variable)
        sed -i.bak "s/PRODUCT_BUNDLE_IDENTIFIER = $OLD_BUNDLE_ID\.\$(PRODUCT_NAME/PRODUCT_BUNDLE_IDENTIFIER = \"$NEW_BUNDLE_ID\";/g" "$PBXPROJ"
        sed -i.bak "s/PRODUCT_BUNDLE_IDENTIFIER = \"$OLD_BUNDLE_ID\.\$(PRODUCT_NAME/PRODUCT_BUNDLE_IDENTIFIER = \"$NEW_BUNDLE_ID\";/g" "$PBXPROJ"
    fi
    
    # Update any bundle identifiers containing old iOS name
    if grep -q "PRODUCT_BUNDLE_IDENTIFIER.*$OLD_IOS_NAME" "$PBXPROJ"; then
        print_info "Updating bundle identifier references containing old project name..."
        sed -i.bak "s/\(PRODUCT_BUNDLE_IDENTIFIER = \"[^\"]*\)$OLD_IOS_NAME\([^\"]*\"\)/PRODUCT_BUNDLE_IDENTIFIER = \"$NEW_BUNDLE_ID\"/g" "$PBXPROJ"
        sed -i.bak "s/\(PRODUCT_BUNDLE_IDENTIFIER = [^;]*\)$OLD_IOS_NAME\([^;]*\);/PRODUCT_BUNDLE_IDENTIFIER = \"$NEW_BUNDLE_ID\";/g" "$PBXPROJ"
    fi
    
    # Update folder references
    sed -i.bak "s/path = $OLD_IOS_NAME;/path = $NEW_PROJECT_NAME;/g" "$PBXPROJ"
    sed -i.bak "s/$OLD_IOS_NAME\//$NEW_PROJECT_NAME\//g" "$PBXPROJ"
    
    # Update display name
    if [[ -n "$OLD_DISPLAY_NAME" ]]; then
        sed -i.bak "s/PRODUCT_BUNDLE_DISPLAY_NAME = $OLD_DISPLAY_NAME/PRODUCT_BUNDLE_DISPLAY_NAME = $NEW_PROJECT_NAME/g" "$PBXPROJ"
        sed -i.bak "s/PRODUCT_BUNDLE_DISPLAY_NAME = \"$OLD_DISPLAY_NAME\"/PRODUCT_BUNDLE_DISPLAY_NAME = \"$NEW_PROJECT_NAME\"/g" "$PBXPROJ"
    fi
    
    # Update INFOPLIST_KEY_CFBundleDisplayName if present
    sed -i.bak "s/INFOPLIST_KEY_CFBundleDisplayName = $OLD_IOS_NAME/INFOPLIST_KEY_CFBundleDisplayName = $NEW_PROJECT_NAME/g" "$PBXPROJ"
    sed -i.bak "s/INFOPLIST_KEY_CFBundleDisplayName = \"$OLD_IOS_NAME\"/INFOPLIST_KEY_CFBundleDisplayName = \"$NEW_PROJECT_NAME\"/g" "$PBXPROJ"
    
    # Clean up backup files
    rm -f "$PBXPROJ.bak"
    
    # Verify the changes
    BUNDLE_ID_COUNT=$(grep -c "PRODUCT_BUNDLE_IDENTIFIER.*$NEW_BUNDLE_ID" "$PBXPROJ" || true)
    if [[ $BUNDLE_ID_COUNT -gt 0 ]]; then
        print_success "Bundle identifier updated in $BUNDLE_ID_COUNT location(s)"
    else
        print_warning "Could not verify bundle identifier update"
        print_info "Please check manually in Xcode"
    fi
    
    print_success "project.pbxproj updated"
else
    print_error "project.pbxproj not found at $PBXPROJ"
fi

# ============================================================================
# Step 10: Rename Xcode Project
# ============================================================================

print_header "Step 10: Renaming Xcode Project"

if [[ "$OLD_XCODEPROJ_NAME" != "${NEW_PROJECT_NAME}.xcodeproj" ]]; then
    print_info "Renaming $OLD_XCODEPROJ_NAME to ${NEW_PROJECT_NAME}.xcodeproj..."
    
    if [[ -d "ios/${NEW_PROJECT_NAME}.xcodeproj" ]]; then
        print_warning "Target Xcode project already exists, removing old one..."
        rm -rf "ios/$OLD_XCODEPROJ_NAME"
    else
        mv "ios/$OLD_XCODEPROJ_NAME" "ios/${NEW_PROJECT_NAME}.xcodeproj"
    fi
    
    print_success "Xcode project renamed"
else
    print_info "Xcode project already has correct name"
fi

# ============================================================================
# Step 11: Update Xcode Workspace (if exists)
# ============================================================================

print_header "Step 11: Updating Xcode Workspace"

OLD_WORKSPACE="ios/${OLD_IOS_NAME}.xcworkspace"
NEW_WORKSPACE="ios/${NEW_PROJECT_NAME}.xcworkspace"

if [[ -d "$OLD_WORKSPACE" ]] && [[ "$OLD_IOS_NAME" != "$NEW_PROJECT_NAME" ]]; then
    print_info "Renaming workspace..."
    
    # Update workspace contents
    if [[ -f "$OLD_WORKSPACE/contents.xcworkspacedata" ]]; then
        sed -i.bak "s/$OLD_IOS_NAME/$NEW_PROJECT_NAME/g" "$OLD_WORKSPACE/contents.xcworkspacedata"
        rm -f "$OLD_WORKSPACE/contents.xcworkspacedata.bak"
    fi
    
    # Rename workspace
    if [[ -d "$NEW_WORKSPACE" ]]; then
        rm -rf "$OLD_WORKSPACE"
    else
        mv "$OLD_WORKSPACE" "$NEW_WORKSPACE"
    fi
    
    print_success "Workspace updated"
elif [[ -d "$NEW_WORKSPACE" ]]; then
    # Update existing workspace with correct name
    if [[ -f "$NEW_WORKSPACE/contents.xcworkspacedata" ]]; then
        sed -i.bak "s/$OLD_IOS_NAME/$NEW_PROJECT_NAME/g" "$NEW_WORKSPACE/contents.xcworkspacedata"
        rm -f "$NEW_WORKSPACE/contents.xcworkspacedata.bak"
        print_success "Workspace contents updated"
    fi
else
    print_info "No custom workspace found (using default)"
fi

# ============================================================================
# Step 12: Update Scheme Files
# ============================================================================

print_header "Step 12: Updating Xcode Schemes"

SCHEMES_DIR="ios/${NEW_PROJECT_NAME}.xcodeproj/xcshareddata/xcschemes"

if [[ -d "$SCHEMES_DIR" ]]; then
    print_info "Updating scheme files..."
    
    # Rename scheme files
    for scheme_file in "$SCHEMES_DIR"/*.xcscheme; do
        if [[ -f "$scheme_file" ]]; then
            filename=$(basename "$scheme_file")
            
            # Update content
            sed -i.bak "s/$OLD_IOS_NAME/$NEW_PROJECT_NAME/g" "$scheme_file"
            rm -f "$scheme_file.bak"
            
            # Rename file if needed
            if [[ "$filename" == "$OLD_IOS_NAME.xcscheme" ]]; then
                mv "$scheme_file" "$SCHEMES_DIR/${NEW_PROJECT_NAME}.xcscheme"
                print_success "Renamed scheme: $filename → ${NEW_PROJECT_NAME}.xcscheme"
            fi
        fi
    done
    
    print_success "Schemes updated"
else
    print_info "No shared schemes found"
fi

# ============================================================================
# Step 13: Update GoogleService-Info.plist (if exists)
# ============================================================================

print_header "Step 13: Updating Firebase Configuration"

GOOGLE_SERVICE_PLIST="ios/$NEW_PROJECT_NAME/GoogleService-Info.plist"

if [[ -f "$GOOGLE_SERVICE_PLIST" ]]; then
    print_info "Found GoogleService-Info.plist"
    
    # Create backup
    cp "$GOOGLE_SERVICE_PLIST" "${GOOGLE_SERVICE_PLIST}.backup"
    print_info "Created backup: ${GOOGLE_SERVICE_PLIST}.backup"
    
    # Extract current bundle ID from the plist file
    CURRENT_FIREBASE_BUNDLE=$(grep -A1 "BUNDLE_ID" "$GOOGLE_SERVICE_PLIST" | grep "<string>" | sed 's/.*<string>\(.*\)<\/string>.*/\1/')
    
    if [[ -n "$CURRENT_FIREBASE_BUNDLE" ]]; then
        print_info "Current Firebase Bundle ID: $CURRENT_FIREBASE_BUNDLE"
        print_info "Updating to: $NEW_BUNDLE_ID"
        
        # Update BUNDLE_ID in plist
        sed -i.bak "s|<string>$CURRENT_FIREBASE_BUNDLE</string>|<string>$NEW_BUNDLE_ID</string>|g" "$GOOGLE_SERVICE_PLIST"
        rm -f "${GOOGLE_SERVICE_PLIST}.bak"
        
        # Verify the update
        if grep -q "$NEW_BUNDLE_ID" "$GOOGLE_SERVICE_PLIST"; then
            print_success "Updated Bundle ID: $CURRENT_FIREBASE_BUNDLE → $NEW_BUNDLE_ID"
            print_warning "Important: Ensure this Bundle ID matches your Firebase iOS app configuration"
            print_info "If you haven't created a Firebase iOS app yet, do so at:"
            print_info "https://console.firebase.google.com"
        else
            print_error "Failed to update Bundle ID in GoogleService-Info.plist"
            print_info "Restoring backup..."
            mv "${GOOGLE_SERVICE_PLIST}.backup" "$GOOGLE_SERVICE_PLIST"
        fi
    else
        print_warning "Could not detect BUNDLE_ID in GoogleService-Info.plist"
        print_info "File exists but may need manual configuration"
    fi
else
    print_info "No GoogleService-Info.plist found (Firebase not configured for iOS)"
fi

# ============================================================================
# Step 14: Update Tests Target (if exists)
# ============================================================================

print_header "Step 14: Checking for Tests Target"

TESTS_DIR="ios/${NEW_PROJECT_NAME}Tests"
OLD_TESTS_DIR="ios/${OLD_IOS_NAME}Tests"

if [[ -d "$OLD_TESTS_DIR" ]] && [[ "$OLD_IOS_NAME" != "$NEW_PROJECT_NAME" ]]; then
    print_info "Renaming tests directory..."
    mv "$OLD_TESTS_DIR" "$TESTS_DIR"
    print_success "Tests directory renamed"
fi

if [[ -d "$TESTS_DIR" ]]; then
    # Update test files
    find "$TESTS_DIR" -type f \( -name "*.m" -o -name "*.swift" -o -name "*.h" \) | while read -r file; do
        if grep -q "$OLD_IOS_NAME" "$file"; then
            sed -i.bak "s/$OLD_IOS_NAME/$NEW_PROJECT_NAME/g" "$file"
            rm -f "$file.bak"
        fi
    done
    print_success "Tests updated"
else
    print_info "No tests directory found"
fi

# ============================================================================
# Step 15: Clean Build Artifacts
# ============================================================================

print_header "Step 15: Cleaning iOS Build Artifacts"

print_info "Removing old build artifacts..."

# Remove Pods and build directories
if [[ -d "ios/build" ]]; then
    rm -rf ios/build
    print_success "Removed ios/build"
fi

if [[ -d "ios/Pods" ]]; then
    print_info "Removing Pods directory (will need to reinstall)..."
    rm -rf ios/Pods
    print_success "Removed ios/Pods"
fi

if [[ -f "ios/Podfile.lock" ]]; then
    rm -f ios/Podfile.lock
    print_success "Removed Podfile.lock"
fi

# Remove derived data reference
if [[ -d "ios/DerivedData" ]]; then
    rm -rf ios/DerivedData
    print_success "Removed ios/DerivedData"
fi

# ============================================================================
# Step 16: Update Package.swift (if exists)
# ============================================================================

print_header "Step 16: Checking for Swift Package"

if [[ -f "ios/Package.swift" ]]; then
    print_info "Updating Package.swift..."
    sed -i.bak "s/$OLD_IOS_NAME/$NEW_PROJECT_NAME/g" ios/Package.swift
    rm -f ios/Package.swift.bak
    print_success "Package.swift updated"
else
    print_info "No Package.swift found"
fi

# ============================================================================
# Step 17: Verify Changes
# ============================================================================

print_header "Step 17: Verifying iOS Changes"

print_info "Checking for remaining references to old iOS name..."

# Search for old iOS name (excluding backup files)
OLD_NAME_COUNT=$(grep -r "$OLD_IOS_NAME" ios/ --exclude-dir={Pods,build,DerivedData} --exclude="*.backup" 2>/dev/null | grep -v "Binary file" | grep -v ".png" | grep -v ".jpg" | grep -v ".gif" | wc -l)

if [[ $OLD_NAME_COUNT -gt 0 ]]; then
    print_warning "Found $OLD_NAME_COUNT remaining references to old iOS name"
    print_info "These might be in comments or non-critical files"
else
    print_success "No remaining references to old iOS name found"
fi

# Search for old bundle identifier (excluding backup files)
if [[ -n "$OLD_BUNDLE_ID" ]]; then
    print_info "Checking for remaining references to old bundle identifier..."
    OLD_BUNDLE_COUNT=$(grep -r "$OLD_BUNDLE_ID" ios/ --exclude-dir={Pods,build,DerivedData} --exclude="*.backup" 2>/dev/null | grep -v "Binary file" | wc -l)
    
    if [[ $OLD_BUNDLE_COUNT -gt 0 ]]; then
        print_warning "Found $OLD_BUNDLE_COUNT remaining references to old bundle identifier"
        print_info "Review these files to ensure all references are updated:"
        grep -r "$OLD_BUNDLE_ID" ios/ --exclude-dir={Pods,build,DerivedData} --exclude="*.backup" 2>/dev/null | grep -v "Binary file" | head -5
    else
        print_success "No remaining references to old bundle identifier found"
    fi
fi

# Verify new bundle identifier is present
print_info "Verifying new bundle identifier is set..."
NEW_BUNDLE_COUNT=$(grep -r "$NEW_BUNDLE_ID" ios/ --exclude-dir={Pods,build,DerivedData} 2>/dev/null | grep -v "Binary file" | wc -l)

if [[ $NEW_BUNDLE_COUNT -gt 0 ]]; then
    print_success "Found $NEW_BUNDLE_COUNT references to new bundle identifier"
else
    print_error "Could not find new bundle identifier in project files!"
    print_warning "Please verify bundle identifier manually in Xcode"
fi

# ============================================================================
# Step 18: Generate Summary Report
# ============================================================================

print_header "Step 18: iOS Conversion Complete!"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           iOS PROJECT CONVERSION COMPLETE!                 ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Summary:"
echo "  Old iOS Name:         $OLD_IOS_NAME"
echo "  New iOS Name:         $NEW_PROJECT_NAME"
if [[ -n "$OLD_BUNDLE_ID" ]]; then
    echo "  Old Bundle ID:        $OLD_BUNDLE_ID"
fi
echo "  New Bundle ID:        $NEW_BUNDLE_ID"
echo "  Project Location:     $PROJECT_DIR"
echo ""
echo "Files Updated:"
echo "  ✓ app.json (name and displayName)"
echo "  ✓ index.js (AppRegistry component name)"
echo "  ✓ Podfile"
echo "  ✓ Info.plist (display name, bundle identifier)"
echo "  ✓ AppDelegate files (module name registration)"
echo "  ✓ Storyboard files (LaunchScreen, etc.)"
echo "  ✓ All Swift/Objective-C source files"
echo "  ✓ Xcode project (.xcodeproj) - ALL references"
echo "  ✓ Xcode project (.pbxproj) - Bundle identifier in ALL configurations"
echo "  ✓ Xcode workspace (.xcworkspace)"
echo "  ✓ Xcode schemes"
echo "  ✓ GoogleService-Info.plist (Bundle ID updated)"
echo "  ✓ Project directory structure"
echo "  ✓ Test files (if present)"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. cd ios"
echo "  2. pod install  (or bundle exec pod install)"
echo "  3. cd .."
echo "  4. npx react-native run-ios"
echo ""
echo -e "${BLUE}Optional Verification Steps:${NC}"
echo "  • Open ios/$NEW_PROJECT_NAME.xcworkspace in Xcode"
echo "  • Verify Bundle Identifier: Select target → General → Bundle Identifier"
echo "  • Should show: $NEW_BUNDLE_ID"
echo "  • Check all build configurations (Debug, Release)"
echo ""
echo -e "${BLUE}Other Optional Steps:${NC}"
echo "  • Update app icons in ios/$NEW_PROJECT_NAME/Images.xcassets"
echo "  • Verify Firebase iOS app matches Bundle ID at firebase.google.com"
echo "  • Update signing & capabilities in Xcode"
echo "  • Update version and build number in Xcode"
echo ""
print_success "iOS conversion completed successfully!"
print_info "Your project now has a unique iOS identity!"
echo ""

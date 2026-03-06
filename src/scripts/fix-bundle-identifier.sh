#!/bin/bash

# ============================================================================
# Fix iOS Bundle Identifier
# ============================================================================
# This script fixes the default React Native bundle identifier pattern
# in the Xcode project.pbxproj file
# ============================================================================

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if we're in a React Native project
if [[ ! -f "app.json" ]] || [[ ! -d "ios" ]]; then
    print_error "Not in a React Native project root directory!"
    exit 1
fi

# Get project name from app.json
PROJECT_NAME=$(grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' app.json | sed 's/"name"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/')

if [[ -z "$PROJECT_NAME" ]]; then
    print_error "Could not detect project name from app.json"
    exit 1
fi

print_info "Project Name: $PROJECT_NAME"

# Find .pbxproj file
PBXPROJ=$(find ios -name "project.pbxproj" -maxdepth 2 | head -1)

if [[ -z "$PBXPROJ" ]] || [[ ! -f "$PBXPROJ" ]]; then
    print_error "Could not find project.pbxproj file"
    exit 1
fi

print_info "Found: $PBXPROJ"

# Check if the default pattern exists
if ! grep -q 'org\.reactjs\.native\.example\.\$(PRODUCT_NAME:rfc1034identifier)' "$PBXPROJ"; then
    print_warning "Default React Native bundle identifier pattern not found"
    
    # Check what's currently there
    CURRENT_BUNDLE=$(grep "PRODUCT_BUNDLE_IDENTIFIER" "$PBXPROJ" | head -1 | sed 's/.*PRODUCT_BUNDLE_IDENTIFIER = "\([^"]*\)".*/\1/')
    
    if [[ -n "$CURRENT_BUNDLE" ]]; then
        print_info "Current Bundle Identifier: $CURRENT_BUNDLE"
    fi
    
    exit 0
fi

print_warning "Found default React Native bundle identifier pattern:"
print_info "  org.reactjs.native.example.\$(PRODUCT_NAME:rfc1034identifier)"
echo ""

# Get bundle ID from GoogleService-Info.plist if it exists
SUGGESTED_BUNDLE=""
GOOGLE_SERVICE_PLIST="ios/$PROJECT_NAME/GoogleService-Info.plist"

if [[ -f "$GOOGLE_SERVICE_PLIST" ]]; then
    SUGGESTED_BUNDLE=$(grep -A1 "BUNDLE_ID" "$GOOGLE_SERVICE_PLIST" | grep "<string>" | sed 's/.*<string>\(.*\)<\/string>.*/\1/')
    if [[ -n "$SUGGESTED_BUNDLE" ]] && [[ "$SUGGESTED_BUNDLE" != "org.reactjs.native.example."* ]]; then
        print_info "Found Bundle ID in GoogleService-Info.plist: $SUGGESTED_BUNDLE"
        echo ""
    fi
fi

# Prompt for new bundle identifier
print_info "Enter your desired Bundle Identifier"
print_info "Format: com.company.appname (lowercase, no spaces)"
PROJECT_NAME_LOWER=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]')
print_info "Example: com.mycompany.$PROJECT_NAME_LOWER"

if [[ -n "$SUGGESTED_BUNDLE" ]]; then
    echo -n "Bundle Identifier [$SUGGESTED_BUNDLE]: "
else
    echo -n "Bundle Identifier: "
fi

read NEW_BUNDLE_ID

# Use suggested if empty
if [[ -z "$NEW_BUNDLE_ID" ]] && [[ -n "$SUGGESTED_BUNDLE" ]]; then
    NEW_BUNDLE_ID="$SUGGESTED_BUNDLE"
fi

# Validate
if [[ -z "$NEW_BUNDLE_ID" ]]; then
    print_error "Bundle Identifier cannot be empty!"
    exit 1
fi

if [[ ! "$NEW_BUNDLE_ID" =~ ^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$ ]]; then
    print_error "Invalid Bundle Identifier format!"
    print_info "Must be reverse domain notation (e.g., com.company.app)"
    exit 1
fi

echo ""
print_info "Updating Bundle Identifier to: $NEW_BUNDLE_ID"

# Create backup
cp "$PBXPROJ" "${PBXPROJ}.backup"
print_info "Created backup: ${PBXPROJ}.backup"

# Use perl for more reliable regex replacement (works better than sed with special chars)
perl -i -pe 's/org\.reactjs\.native\.example\.\$\(PRODUCT_NAME:rfc1034identifier\)/"'"$NEW_BUNDLE_ID"'"/g' "$PBXPROJ"

# Verify the change
if grep -q "$NEW_BUNDLE_ID" "$PBXPROJ"; then
    print_success "Bundle Identifier updated successfully!"
    
    # Show the changes
    echo ""
    print_info "Updated lines:"
    grep -n "PRODUCT_BUNDLE_IDENTIFIER.*$NEW_BUNDLE_ID" "$PBXPROJ" | head -5
    
    echo ""
    print_success "Done! Open Xcode to verify the changes."
    print_info "You may need to:"
    print_info "  1. Clean build folder (Cmd+Shift+K)"
    print_info "  2. Rebuild the project"
else
    print_error "Failed to update Bundle Identifier"
    print_info "Restoring backup..."
    mv "${PBXPROJ}.backup" "$PBXPROJ"
    exit 1
fi

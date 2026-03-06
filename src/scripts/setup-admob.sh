#!/bin/bash

# ============================================================================
# Google AdMob Application ID Configuration Script
# ============================================================================
# This script configures Google AdMob Application IDs for both iOS and Android.
# AdMob Application IDs are required when using AdMob as a mediation adapter
# in AppLovin MAX SDK.
#
# Features:
# - Prompts for AdMob Application IDs (iOS and Android)
# - Updates .env file with Application IDs
# - Updates AndroidManifest.xml with Application ID
# - Updates iOS Info.plist with Application ID
# - Validates Application ID format
# - Supports test IDs for development
# - Verifies configuration
# ============================================================================

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project paths (relative to script location in src/scripts/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"
ENV_EXAMPLE_FILE="$PROJECT_ROOT/.env.example"
ANDROID_MANIFEST="$PROJECT_ROOT/android/app/src/main/AndroidManifest.xml"

# Dynamically find iOS project name and Info.plist
IOS_PROJECT_NAME=""
IOS_INFO_PLIST=""

# Function to detect iOS project
detect_ios_project() {
    # Look for .xcodeproj directories in ios folder
    local ios_dir="$PROJECT_ROOT/ios"
    
    if [ -d "$ios_dir" ]; then
        # Find first .xcodeproj directory (excluding Pods)
        for proj in "$ios_dir"/*.xcodeproj; do
            if [ -d "$proj" ] && [[ ! "$proj" =~ Pods ]]; then
                IOS_PROJECT_NAME=$(basename "$proj" .xcodeproj)
                break
            fi
        done
        
        # Try to find Info.plist in the project directory
        if [ -n "$IOS_PROJECT_NAME" ]; then
            if [ -f "$ios_dir/$IOS_PROJECT_NAME/Info.plist" ]; then
                IOS_INFO_PLIST="$ios_dir/$IOS_PROJECT_NAME/Info.plist"
            fi
        fi
    fi
}

# Detect iOS project on script load
detect_ios_project

# Test AdMob Application IDs (Google's official test IDs)
TEST_ADMOB_APP_ID_IOS="ca-app-pub-3940256099942544~1458002511"
TEST_ADMOB_APP_ID_ANDROID="ca-app-pub-3940256099942544~3347511713"

# Variables
ADMOB_APP_ID_IOS=""
ADMOB_APP_ID_ANDROID=""
USE_TEST_IDS=false

# ============================================================================
# Helper Functions
# ============================================================================

print_header() {
    echo ""
    echo -e "${CYAN}============================================================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}============================================================================${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${MAGENTA}ℹ️  $1${NC}"
}

# ============================================================================
# Validation Functions
# ============================================================================

validate_admob_app_id() {
    local app_id=$1
    local platform=$2
    
    if [ -z "$app_id" ]; then
        return 1
    fi
    
    # AdMob App ID format: ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY
    if [[ ! $app_id =~ ^ca-app-pub-[0-9]{16}~[0-9]{10}$ ]]; then
        print_warning "$platform AdMob Application ID format seems incorrect."
        print_info "Expected format: ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"
        print_info "Example: ca-app-pub-3940256099942544~1458002511"
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
    fi
    
    return 0
}

check_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        print_warning ".env file not found!"
        if [ -f "$ENV_EXAMPLE_FILE" ]; then
            print_step "Creating .env from .env.example..."
            cp "$ENV_EXAMPLE_FILE" "$ENV_FILE"
            print_success ".env file created"
        else
            print_error ".env.example not found. Cannot create .env file."
            exit 1
        fi
    fi
}

# ============================================================================
# Main Setup Functions
# ============================================================================

show_welcome() {
    clear
    print_header "Google AdMob Application ID Setup"
    
    echo -e "${CYAN}📱 This script will configure Google AdMob Application IDs${NC}"
    echo ""
    echo "   AdMob Application IDs are required when using Google AdMob"
    echo "   as a mediation adapter in AppLovin MAX SDK."
    echo ""
    echo -e "${YELLOW}What you'll need:${NC}"
    echo "   • iOS AdMob Application ID"
    echo "   • Android AdMob Application ID"
    echo ""
    echo -e "${CYAN}Where to get them:${NC}"
    echo "   1. Go to: https://apps.admob.com/"
    echo "   2. Click 'Apps' in the sidebar"
    echo "   3. Select your app (or create new)"
    echo "   4. Copy the Application ID (format: ca-app-pub-XXX~YYY)"
    echo ""
    echo -e "${MAGENTA}Note: You can use test IDs for development${NC}"
    echo ""
    
    read -p "Press Enter to continue..."
}

prompt_for_test_ids() {
    print_header "Step 1: Choose Configuration Mode"
    
    echo -e "${CYAN}Would you like to use test AdMob Application IDs?${NC}"
    echo ""
    echo "   Test IDs are Google's official test Application IDs that work"
    echo "   for development and testing. You can switch to real IDs later."
    echo ""
    echo -e "${YELLOW}Test IDs:${NC}"
    echo "   iOS:     $TEST_ADMOB_APP_ID_IOS"
    echo "   Android: $TEST_ADMOB_APP_ID_ANDROID"
    echo ""
    
    read -p "Use test IDs? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        USE_TEST_IDS=true
        ADMOB_APP_ID_IOS="$TEST_ADMOB_APP_ID_IOS"
        ADMOB_APP_ID_ANDROID="$TEST_ADMOB_APP_ID_ANDROID"
        print_success "Using test Application IDs for development"
    else
        USE_TEST_IDS=false
    fi
}

collect_admob_credentials() {
    if [ "$USE_TEST_IDS" = true ]; then
        return
    fi
    
    print_header "Step 2: Enter AdMob Application IDs"
    
    # Prompt for iOS AdMob App ID
    while true; do
        echo ""
        echo -e "${YELLOW}Enter your iOS AdMob Application ID:${NC}"
        echo -e "${MAGENTA}Format: ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY${NC}"
        read -r ADMOB_APP_ID_IOS
        
        if validate_admob_app_id "$ADMOB_APP_ID_IOS" "iOS"; then
            print_success "iOS Application ID accepted"
            break
        fi
        
        print_error "Invalid iOS AdMob Application ID. Please try again."
    done
    
    # Prompt for Android AdMob App ID
    while true; do
        echo ""
        echo -e "${YELLOW}Enter your Android AdMob Application ID:${NC}"
        echo -e "${MAGENTA}Format: ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY${NC}"
        read -r ADMOB_APP_ID_ANDROID
        
        if validate_admob_app_id "$ADMOB_APP_ID_ANDROID" "Android"; then
            print_success "Android Application ID accepted"
            break
        fi
        
        print_error "Invalid Android AdMob Application ID. Please try again."
    done
}

update_env_file() {
    print_header "Step 3: Update .env File"
    
    check_env_file
    
    print_step "Updating .env file with AdMob Application IDs..."
    
    # Check if AdMob IDs already exist in .env
    if grep -q "ADMOB_APP_ID_IOS=" "$ENV_FILE"; then
        # Update existing iOS ID
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|ADMOB_APP_ID_IOS=.*|ADMOB_APP_ID_IOS=$ADMOB_APP_ID_IOS|" "$ENV_FILE"
        else
            sed -i "s|ADMOB_APP_ID_IOS=.*|ADMOB_APP_ID_IOS=$ADMOB_APP_ID_IOS|" "$ENV_FILE"
        fi
    else
        # Add new iOS ID
        echo "ADMOB_APP_ID_IOS=$ADMOB_APP_ID_IOS" >> "$ENV_FILE"
    fi
    
    if grep -q "ADMOB_APP_ID_ANDROID=" "$ENV_FILE"; then
        # Update existing Android ID
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|ADMOB_APP_ID_ANDROID=.*|ADMOB_APP_ID_ANDROID=$ADMOB_APP_ID_ANDROID|" "$ENV_FILE"
        else
            sed -i "s|ADMOB_APP_ID_ANDROID=.*|ADMOB_APP_ID_ANDROID=$ADMOB_APP_ID_ANDROID|" "$ENV_FILE"
        fi
    else
        # Add new Android ID
        echo "ADMOB_APP_ID_ANDROID=$ADMOB_APP_ID_ANDROID" >> "$ENV_FILE"
    fi
    
    print_success ".env file updated with AdMob Application IDs"
}

update_android_manifest() {
    print_header "Step 4: Update Android Configuration"
    
    if [ ! -f "$ANDROID_MANIFEST" ]; then
        print_error "AndroidManifest.xml not found at: $ANDROID_MANIFEST"
        return 1
    fi
    
    print_step "Updating AndroidManifest.xml..."
    
    # Check if AdMob meta-data already exists
    if grep -q "com.google.android.gms.ads.APPLICATION_ID" "$ANDROID_MANIFEST"; then
        # Update existing meta-data
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|android:name=\"com.google.android.gms.ads.APPLICATION_ID\"[[:space:]]*android:value=\"[^\"]*\"|android:name=\"com.google.android.gms.ads.APPLICATION_ID\" android:value=\"$ADMOB_APP_ID_ANDROID\"|" "$ANDROID_MANIFEST"
        else
            sed -i "s|android:name=\"com.google.android.gms.ads.APPLICATION_ID\"[[:space:]]*android:value=\"[^\"]*\"|android:name=\"com.google.android.gms.ads.APPLICATION_ID\" android:value=\"$ADMOB_APP_ID_ANDROID\"|" "$ANDROID_MANIFEST"
        fi
        print_success "Updated existing AdMob Application ID in AndroidManifest.xml"
    else
        print_warning "AdMob meta-data not found in AndroidManifest.xml"
        print_info "Please add the following to your AndroidManifest.xml <application> tag:"
        echo ""
        echo "    <meta-data"
        echo "        android:name=\"com.google.android.gms.ads.APPLICATION_ID\""
        echo "        android:value=\"$ADMOB_APP_ID_ANDROID\"/>"
        echo ""
    fi
    
    print_info "Android AdMob App ID: $ADMOB_APP_ID_ANDROID"
}

update_ios_info_plist() {
    print_header "Step 5: Update iOS Configuration"
    
    if [ -z "$IOS_PROJECT_NAME" ]; then
        print_error "Could not detect iOS project name"
        print_info "Please manually add the following to your Info.plist:"
        echo ""
        echo "    <key>GADApplicationIdentifier</key>"
        echo "    <string>$ADMOB_APP_ID_IOS</string>"
        echo ""
        return 1
    fi
    
    print_info "Detected iOS project: $IOS_PROJECT_NAME"
    
    if [ ! -f "$IOS_INFO_PLIST" ]; then
        print_error "Info.plist not found at: $IOS_INFO_PLIST"
        print_info "Please manually add the following to your Info.plist:"
        echo ""
        echo "    <key>GADApplicationIdentifier</key>"
        echo "    <string>$ADMOB_APP_ID_IOS</string>"
        echo ""
        return 1
    fi
    
    print_step "Updating Info.plist..."
    
    # Use PlistBuddy to update iOS plist
    if command -v /usr/libexec/PlistBuddy &> /dev/null; then
        # Check if GADApplicationIdentifier exists
        if /usr/libexec/PlistBuddy -c "Print :GADApplicationIdentifier" "$IOS_INFO_PLIST" &> /dev/null; then
            # Update existing key
            /usr/libexec/PlistBuddy -c "Set :GADApplicationIdentifier $ADMOB_APP_ID_IOS" "$IOS_INFO_PLIST"
            print_success "Updated existing GADApplicationIdentifier in Info.plist"
        else
            # Add new key
            /usr/libexec/PlistBuddy -c "Add :GADApplicationIdentifier string $ADMOB_APP_ID_IOS" "$IOS_INFO_PLIST"
            print_success "Added GADApplicationIdentifier to Info.plist"
        fi
    else
        # Fallback to sed (less reliable for plist files)
        if grep -q "<key>GADApplicationIdentifier</key>" "$IOS_INFO_PLIST"; then
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "/<key>GADApplicationIdentifier<\/key>/!b;n;c\\
\t<string>$ADMOB_APP_ID_IOS</string>" "$IOS_INFO_PLIST"
            else
                sed -i "/<key>GADApplicationIdentifier<\/key>/!b;n;c\\
\t<string>$ADMOB_APP_ID_IOS</string>" "$IOS_INFO_PLIST"
            fi
            print_success "Updated existing GADApplicationIdentifier in Info.plist"
        else
            print_warning "GADApplicationIdentifier not found in Info.plist"
            print_info "Please add the following to your Info.plist:"
            echo ""
            echo "    <key>GADApplicationIdentifier</key>"
            echo "    <string>$ADMOB_APP_ID_IOS</string>"
            echo ""
        fi
    fi
    
    print_info "iOS AdMob App ID: $ADMOB_APP_ID_IOS"
}

verify_configuration() {
    print_header "Step 6: Verify Configuration"
    
    echo -e "${CYAN}📋 Configuration Summary:${NC}"
    echo ""
    echo "   ✓ .env file updated"
    echo "   ✓ iOS App ID:     $ADMOB_APP_ID_IOS"
    echo "   ✓ Android App ID: $ADMOB_APP_ID_ANDROID"
    echo ""
    
    if [ "$USE_TEST_IDS" = true ]; then
        echo -e "${YELLOW}⚠️  You are using TEST Application IDs${NC}"
        echo ""
        echo "   These are Google's official test IDs for development."
        echo "   Remember to replace them with real IDs before production!"
        echo ""
    fi
    
    print_success "AdMob Application IDs configured successfully!"
}

show_next_steps() {
    print_header "Next Steps"
    
    echo -e "${CYAN}🚀 What to do next:${NC}"
    echo ""
    echo "   1. Rebuild your app:"
    echo "      ${GREEN}yarn android${NC}  # for Android"
    echo "      ${GREEN}yarn ios${NC}      # for iOS"
    echo ""
    echo "   2. Test ads in your app:"
    echo "      • Navigate to the Ads Test screen"
    echo "      • Test banner, interstitial, and rewarded ads"
    echo "      • Open Mediation Debugger to verify AdMob adapter"
    echo ""
    
    if [ "$USE_TEST_IDS" = true ]; then
        echo "   3. For production deployment:"
        echo "      • Get real AdMob Application IDs from https://apps.admob.com/"
        echo "      • Run this script again with real IDs"
        echo "      • Or manually update .env file and run: ${GREEN}yarn configure:admob${NC}"
        echo ""
    fi
    
    echo -e "${MAGENTA}📚 Documentation:${NC}"
    echo "   • AdMob Configuration Guide: ADMOB_CONFIGURATION_GUIDE.md"
    echo "   • AppLovin Implementation: APPLOVIN_IMPLEMENTATION_GUIDE.md"
    echo ""
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    show_welcome
    prompt_for_test_ids
    collect_admob_credentials
    update_env_file
    update_android_manifest
    update_ios_info_plist
    verify_configuration
    show_next_steps
    
    echo ""
    print_success "Setup complete! 🎉"
    echo ""
}

# Run main function
main

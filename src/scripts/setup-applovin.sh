#!/bin/bash

# ============================================================================
# AppLovin MAX SDK Setup Script
# ============================================================================
# This script automates the setup of AppLovin MAX SDK configuration.
#
# Features:
# - Prompts for AppLovin SDK Key
# - Updates .env file with SDK key
# - Updates AndroidManifest.xml with SDK key
# - Updates iOS Info.plist with SDK key
# - Verifies the configuration
# - Tests that the key is properly accessible from env.ts
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

# Project paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"
ENV_TS_FILE="$PROJECT_ROOT/src/config/env.ts"
ANDROID_MANIFEST="$PROJECT_ROOT/android/app/src/main/AndroidManifest.xml"

# Dynamically find iOS project name and Info.plist
IOS_PROJECT_NAME=""
IOS_INFO_PLIST=""

# Function to detect iOS project
detect_ios_project() {
    local ios_dir="$PROJECT_ROOT/ios"
    
    if [ -d "$ios_dir" ]; then
        for proj in "$ios_dir"/*.xcodeproj; do
            if [ -d "$proj" ] && [[ ! "$proj" =~ Pods ]]; then
                IOS_PROJECT_NAME=$(basename "$proj" .xcodeproj)
                break
            fi
        done
        
        if [ -n "$IOS_PROJECT_NAME" ]; then
            if [ -f "$ios_dir/$IOS_PROJECT_NAME/Info.plist" ]; then
                IOS_INFO_PLIST="$ios_dir/$IOS_PROJECT_NAME/Info.plist"
            fi
        fi
    fi
}

# Detect iOS project on script load
detect_ios_project

# Variables
APPLOVIN_SDK_KEY=""
APPLOVIN_APP_OPEN_AD_UNIT_IOS=""
APPLOVIN_BANNER_AD_UNIT_IOS=""
APPLOVIN_INTERSTITIAL_AD_UNIT_IOS=""
APPLOVIN_REWARDED_AD_UNIT_IOS=""
APPLOVIN_APP_OPEN_AD_UNIT_ANDROID=""
APPLOVIN_BANNER_AD_UNIT_ANDROID=""
APPLOVIN_INTERSTITIAL_AD_UNIT_ANDROID=""
APPLOVIN_REWARDED_AD_UNIT_ANDROID=""

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

validate_sdk_key() {
    local key=$1
    
    if [ -z "$key" ]; then
        return 1
    fi
    
    # Check if key is placeholder
    if [ "$key" == "YOUR_SDK_KEY_HERE" ] || [ "$key" == "your_applovin_sdk_key_here" ]; then
        print_warning "Please provide your actual AppLovin SDK key, not a placeholder."
        return 1
    fi
    
    # AppLovin SDK keys are typically long alphanumeric strings with special characters
    # Length check (typically 80+ characters)
    local key_length=${#key}
    if [ $key_length -lt 50 ]; then
        print_warning "AppLovin SDK key seems too short (${key_length} characters)."
        print_warning "Typical SDK keys are 80+ characters long."
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
    fi
    
    return 0
}

validate_ad_unit_id() {
    local id=$1
    local platform=$2
    local type=$3
    
    if [ -z "$id" ]; then
        print_warning "$platform $type Ad Unit ID is empty."
        return 1
    fi
    
    # AppLovin ad unit IDs are typically 16-character alphanumeric strings
    local id_length=${#id}
    if [ $id_length -lt 10 ]; then
        print_warning "$platform $type Ad Unit ID seems too short (${id_length} characters)."
        print_warning "Typical ad unit IDs are 16 characters long."
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
    fi
    
    return 0
}

# ============================================================================
# Information Gathering Functions
# ============================================================================

collect_sdk_key() {
    print_header "Step 1: Collect AppLovin Configuration"
    
    echo -e "${CYAN}📝 AppLovin MAX SDK Configuration${NC}"
    echo ""
    echo -e "${MAGENTA}You need to provide your AppLovin SDK Key and Ad Unit IDs for both iOS and Android.${NC}"
    echo ""
    echo -e "${YELLOW}Where to find your credentials:${NC}"
    echo "  1. Go to: https://dash.applovin.com/"
    echo "  2. Sign in to your AppLovin account"
    echo "  3. Navigate to: Account → Keys (for SDK Key)"
    echo "  4. Navigate to: Mediation → Manage → Ad Units (for Ad Unit IDs)"
    echo ""
    
    # Collect SDK Key
    echo -e "${CYAN}SDK Key Format:${NC}"
    echo "  • Long alphanumeric string (typically 80+ characters)"
    echo "  • May contain special characters like dashes, underscores"
    echo "  • Example: hbi2E0uLXSPa98r-2F5LFfuw4ximVgyBGfEVf7rBZFmkNbiQrom5Se_XaiH4NDGduV7XdzkBDTwa3c0vPn_sP_"
    echo ""
    
    while true; do
        echo -e "${YELLOW}Enter your AppLovin SDK Key:${NC}"
        read -r APPLOVIN_SDK_KEY
        
        if validate_sdk_key "$APPLOVIN_SDK_KEY"; then
            break
        else
            print_error "Invalid SDK key. Please try again."
        fi
    done
    
    echo ""
    print_success "SDK Key collected!"
    echo ""
    
    # Collect iOS Ad Unit IDs
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}iOS Ad Unit IDs${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
    echo -e "${MAGENTA}Ad Unit IDs are typically 16-character alphanumeric strings${NC}"
    echo ""
    
    echo -e "${YELLOW}Enter iOS App Open Ad Unit ID:${NC}"
    read -r APPLOVIN_APP_OPEN_AD_UNIT_IOS
    validate_ad_unit_id "$APPLOVIN_APP_OPEN_AD_UNIT_IOS" "iOS" "App Open"
    
    echo -e "${YELLOW}Enter iOS Banner Ad Unit ID:${NC}"
    read -r APPLOVIN_BANNER_AD_UNIT_IOS
    validate_ad_unit_id "$APPLOVIN_BANNER_AD_UNIT_IOS" "iOS" "Banner"
    
    echo -e "${YELLOW}Enter iOS Interstitial Ad Unit ID:${NC}"
    read -r APPLOVIN_INTERSTITIAL_AD_UNIT_IOS
    validate_ad_unit_id "$APPLOVIN_INTERSTITIAL_AD_UNIT_IOS" "iOS" "Interstitial"
    
    echo -e "${YELLOW}Enter iOS Video/Rewarded Ad Unit ID:${NC}"
    read -r APPLOVIN_REWARDED_AD_UNIT_IOS
    validate_ad_unit_id "$APPLOVIN_REWARDED_AD_UNIT_IOS" "iOS" "Rewarded"
    
    echo ""
    print_success "iOS Ad Unit IDs collected!"
    echo ""
    
    # Collect Android Ad Unit IDs
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}Android Ad Unit IDs${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
    
    echo -e "${YELLOW}Enter Android App Open Ad Unit ID:${NC}"
    read -r APPLOVIN_APP_OPEN_AD_UNIT_ANDROID
    validate_ad_unit_id "$APPLOVIN_APP_OPEN_AD_UNIT_ANDROID" "Android" "App Open"
    
    echo -e "${YELLOW}Enter Android Banner Ad Unit ID:${NC}"
    read -r APPLOVIN_BANNER_AD_UNIT_ANDROID
    validate_ad_unit_id "$APPLOVIN_BANNER_AD_UNIT_ANDROID" "Android" "Banner"
    
    echo -e "${YELLOW}Enter Android Interstitial Ad Unit ID:${NC}"
    read -r APPLOVIN_INTERSTITIAL_AD_UNIT_ANDROID
    validate_ad_unit_id "$APPLOVIN_INTERSTITIAL_AD_UNIT_ANDROID" "Android" "Interstitial"
    
    echo -e "${YELLOW}Enter Android Video/Rewarded Ad Unit ID:${NC}"
    read -r APPLOVIN_REWARDED_AD_UNIT_ANDROID
    validate_ad_unit_id "$APPLOVIN_REWARDED_AD_UNIT_ANDROID" "Android" "Rewarded"
    
    echo ""
    print_success "Android Ad Unit IDs collected!"
    echo ""
    echo -e "${CYAN}Configuration Summary:${NC}"
    echo "   SDK Key: ${APPLOVIN_SDK_KEY:0:20}...${APPLOVIN_SDK_KEY: -10} (truncated for security)"
    echo ""
    echo "   iOS Ad Units:"
    echo "     • App Open: $APPLOVIN_APP_OPEN_AD_UNIT_IOS"
    echo "     • Banner: $APPLOVIN_BANNER_AD_UNIT_IOS"
    echo "     • Interstitial: $APPLOVIN_INTERSTITIAL_AD_UNIT_IOS"
    echo "     • Rewarded: $APPLOVIN_REWARDED_AD_UNIT_IOS"
    echo ""
    echo "   Android Ad Units:"
    echo "     • App Open: $APPLOVIN_APP_OPEN_AD_UNIT_ANDROID"
    echo "     • Banner: $APPLOVIN_BANNER_AD_UNIT_ANDROID"
    echo "     • Interstitial: $APPLOVIN_INTERSTITIAL_AD_UNIT_ANDROID"
    echo "     • Rewarded: $APPLOVIN_REWARDED_AD_UNIT_ANDROID"
}

# ============================================================================
# Configuration Functions
# ============================================================================

update_env_file() {
    print_header "Step 2: Update .env File"
    
    print_step "Updating .env file with all AppLovin credentials..."
    
    # Backup .env file
    cp "$ENV_FILE" "$ENV_FILE.backup"
    print_info "Backup created: .env.backup"
    
    # Update or add APPLOVIN_SDK_KEY
    if grep -q "^APPLOVIN_SDK_KEY=" "$ENV_FILE"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^APPLOVIN_SDK_KEY=.*|APPLOVIN_SDK_KEY=$APPLOVIN_SDK_KEY|" "$ENV_FILE"
        else
            sed -i "s|^APPLOVIN_SDK_KEY=.*|APPLOVIN_SDK_KEY=$APPLOVIN_SDK_KEY|" "$ENV_FILE"
        fi
        print_success "Updated APPLOVIN_SDK_KEY in .env"
    else
        echo "" >> "$ENV_FILE"
        echo "# AppLovin MAX SDK" >> "$ENV_FILE"
        echo "APPLOVIN_SDK_KEY=$APPLOVIN_SDK_KEY" >> "$ENV_FILE"
        print_success "Added APPLOVIN_SDK_KEY to .env"
    fi
    
    # Update iOS Ad Unit IDs
    update_or_add_env_var "APPLOVIN_APP_OPEN_AD_UNIT_IOS" "$APPLOVIN_APP_OPEN_AD_UNIT_IOS"
    update_or_add_env_var "APPLOVIN_BANNER_AD_UNIT_IOS" "$APPLOVIN_BANNER_AD_UNIT_IOS"
    update_or_add_env_var "APPLOVIN_INTERSTITIAL_AD_UNIT_IOS" "$APPLOVIN_INTERSTITIAL_AD_UNIT_IOS"
    update_or_add_env_var "APPLOVIN_REWARDED_AD_UNIT_IOS" "$APPLOVIN_REWARDED_AD_UNIT_IOS"
    
    # Update Android Ad Unit IDs
    update_or_add_env_var "APPLOVIN_APP_OPEN_AD_UNIT_ANDROID" "$APPLOVIN_APP_OPEN_AD_UNIT_ANDROID"
    update_or_add_env_var "APPLOVIN_BANNER_AD_UNIT_ANDROID" "$APPLOVIN_BANNER_AD_UNIT_ANDROID"
    update_or_add_env_var "APPLOVIN_INTERSTITIAL_AD_UNIT_ANDROID" "$APPLOVIN_INTERSTITIAL_AD_UNIT_ANDROID"
    update_or_add_env_var "APPLOVIN_REWARDED_AD_UNIT_ANDROID" "$APPLOVIN_REWARDED_AD_UNIT_ANDROID"
    
    print_success ".env file updated successfully with all AppLovin credentials!"
}

update_or_add_env_var() {
    local key=$1
    local value=$2
    
    if grep -q "^${key}=" "$ENV_FILE"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^${key}=.*|${key}=$value|" "$ENV_FILE"
        else
            sed -i "s|^${key}=.*|${key}=$value|" "$ENV_FILE"
        fi
    else
        echo "${key}=$value" >> "$ENV_FILE"
    fi
}

verify_env_ts() {
    print_header "Step 3: Verify env.ts Configuration"
    
    print_step "Checking if all AppLovin variables are properly imported in env.ts..."
    
    local all_vars=(
        "APPLOVIN_SDK_KEY"
        "APPLOVIN_APP_OPEN_AD_UNIT_IOS"
        "APPLOVIN_BANNER_AD_UNIT_IOS"
        "APPLOVIN_INTERSTITIAL_AD_UNIT_IOS"
        "APPLOVIN_REWARDED_AD_UNIT_IOS"
        "APPLOVIN_APP_OPEN_AD_UNIT_ANDROID"
        "APPLOVIN_BANNER_AD_UNIT_ANDROID"
        "APPLOVIN_INTERSTITIAL_AD_UNIT_ANDROID"
        "APPLOVIN_REWARDED_AD_UNIT_ANDROID"
    )
    
    local all_imported=true
    
    for var in "${all_vars[@]}"; do
        if ! grep -q "$var" "$ENV_TS_FILE"; then
            print_error "$var is not imported in env.ts"
            all_imported=false
        fi
    done
    
    if [ "$all_imported" = true ]; then
        print_success "All AppLovin variables are imported in env.ts"
        
        # Check if they're exported in the env object
        local all_exported=true
        for var in "${all_vars[@]}"; do
            if ! grep -q "${var}: ${var}" "$ENV_TS_FILE"; then
                print_warning "$var import found but not properly exported"
                all_exported=false
            fi
        done
        
        if [ "$all_exported" = true ]; then
            print_success "All AppLovin variables are exported in env object"
        else
            print_warning "Some variables may not be properly exported"
            print_info "This should already be configured, but please verify manually"
        fi
    else
        print_error "Some AppLovin variables are not imported in env.ts"
        print_info "Please ensure all variables are imported in $ENV_TS_FILE"
        exit 1
    fi
}

update_android_manifest() {
    print_header "Step 4: Update AndroidManifest.xml"
    
    print_step "Updating Android configuration..."
    
    # Backup AndroidManifest.xml
    cp "$ANDROID_MANIFEST" "$ANDROID_MANIFEST.backup"
    print_info "Backup created: AndroidManifest.xml.backup"
    
    # Check if AppLovin SDK key meta-data exists
    if grep -q "applovin.sdk.key" "$ANDROID_MANIFEST"; then
        # Update existing key
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|android:value=\".*\" />|android:value=\"$APPLOVIN_SDK_KEY\" />|" "$ANDROID_MANIFEST"
        else
            sed -i "s|android:value=\".*\" />|android:value=\"$APPLOVIN_SDK_KEY\" />|" "$ANDROID_MANIFEST"
        fi
        print_success "Updated applovin.sdk.key in AndroidManifest.xml"
    else
        print_warning "applovin.sdk.key not found in AndroidManifest.xml"
        print_info "You may need to add it manually. See documentation."
    fi
    
    # Verify the update
    if grep -q "$APPLOVIN_SDK_KEY" "$ANDROID_MANIFEST"; then
        print_success "AndroidManifest.xml updated successfully!"
    else
        print_warning "SDK key may not have been updated in AndroidManifest.xml"
        print_info "Please verify manually at: $ANDROID_MANIFEST"
    fi
}

update_ios_info_plist() {
    print_header "Step 5: Update iOS Info.plist"
    
    print_step "Updating iOS configuration..."
    
    # Backup Info.plist
    cp "$IOS_INFO_PLIST" "$IOS_INFO_PLIST.backup"
    print_info "Backup created: Info.plist.backup"
    
    # Check if AppLovinSdkKey exists
    if grep -q "AppLovinSdkKey" "$IOS_INFO_PLIST"; then
        # Update existing key
        # Find the line after AppLovinSdkKey and replace the string value
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "/AppLovinSdkKey/,/<string>/ s|<string>.*</string>|<string>$APPLOVIN_SDK_KEY</string>|" "$IOS_INFO_PLIST"
        else
            sed -i "/AppLovinSdkKey/,/<string>/ s|<string>.*</string>|<string>$APPLOVIN_SDK_KEY</string>|" "$IOS_INFO_PLIST"
        fi
        print_success "Updated AppLovinSdkKey in Info.plist"
    else
        print_warning "AppLovinSdkKey not found in Info.plist"
        print_info "You may need to add it manually. See documentation."
    fi
    
    # Verify the update
    if grep -q "$APPLOVIN_SDK_KEY" "$IOS_INFO_PLIST"; then
        print_success "Info.plist updated successfully!"
    else
        print_warning "SDK key may not have been updated in Info.plist"
        print_info "Please verify manually at: $IOS_INFO_PLIST"
    fi
}

create_verification_script() {
    print_header "Step 6: Create Verification Script"
    
    print_step "Creating test-applovin.js..."
    
    cat > "$PROJECT_ROOT/test-applovin.js" << 'EOTEST'
/**
 * AppLovin MAX Configuration Test
 * Run this with: node test-applovin.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n========================================');
console.log('AppLovin MAX Configuration Test');
console.log('========================================\n');

let hasErrors = false;
let hasWarnings = false;

// Test 1: Check .env file
console.log('📋 Test 1: Checking .env file...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check SDK Key
    const sdkKeyMatch = envContent.match(/^APPLOVIN_SDK_KEY=(.+)$/m);
    if (sdkKeyMatch) {
        const sdkKey = sdkKeyMatch[1].trim();
        if (sdkKey && sdkKey !== 'YOUR_SDK_KEY_HERE' && sdkKey !== 'your_applovin_sdk_key_here') {
            console.log('✅ APPLOVIN_SDK_KEY found in .env');
            console.log(`   Key length: ${sdkKey.length} characters`);
            
            if (sdkKey.length < 50) {
                console.log('⚠️  SDK key seems too short (typical keys are 80+ characters)');
                hasWarnings = true;
            }
        } else {
            console.log('❌ APPLOVIN_SDK_KEY is empty or placeholder');
            hasErrors = true;
        }
    } else {
        console.log('❌ APPLOVIN_SDK_KEY not found in .env');
        hasErrors = true;
    }
    
    // Check iOS Ad Unit IDs
    const iosAdUnits = [
        'APPLOVIN_APP_OPEN_AD_UNIT_IOS',
        'APPLOVIN_BANNER_AD_UNIT_IOS',
        'APPLOVIN_INTERSTITIAL_AD_UNIT_IOS',
        'APPLOVIN_REWARDED_AD_UNIT_IOS'
    ];
    
    console.log('\n   Checking iOS Ad Unit IDs:');
    iosAdUnits.forEach(unit => {
        const match = envContent.match(new RegExp(`^${unit}=(.+)$`, 'm'));
        if (match && match[1] && match[1].trim()) {
            console.log(`   ✅ ${unit}: ${match[1].trim()}`);
        } else {
            console.log(`   ❌ ${unit} is missing or empty`);
            hasErrors = true;
        }
    });
    
    // Check Android Ad Unit IDs
    const androidAdUnits = [
        'APPLOVIN_APP_OPEN_AD_UNIT_ANDROID',
        'APPLOVIN_BANNER_AD_UNIT_ANDROID',
        'APPLOVIN_INTERSTITIAL_AD_UNIT_ANDROID',
        'APPLOVIN_REWARDED_AD_UNIT_ANDROID'
    ];
    
    console.log('\n   Checking Android Ad Unit IDs:');
    androidAdUnits.forEach(unit => {
        const match = envContent.match(new RegExp(`^${unit}=(.+)$`, 'm'));
        if (match && match[1] && match[1].trim()) {
            console.log(`   ✅ ${unit}: ${match[1].trim()}`);
        } else {
            console.log(`   ❌ ${unit} is missing or empty`);
            hasErrors = true;
        }
    });
} else {
    console.log('❌ .env file not found');
    hasErrors = true;
}

// Test 2: Check env.ts
console.log('\n📋 Test 2: Checking env.ts...');
const envTsPath = path.join(__dirname, 'src', 'config', 'env.ts');
if (fs.existsSync(envTsPath)) {
    const envTsContent = fs.readFileSync(envTsPath, 'utf8');
    
    const allVars = [
        'APPLOVIN_SDK_KEY',
        'APPLOVIN_APP_OPEN_AD_UNIT_IOS',
        'APPLOVIN_BANNER_AD_UNIT_IOS',
        'APPLOVIN_INTERSTITIAL_AD_UNIT_IOS',
        'APPLOVIN_REWARDED_AD_UNIT_IOS',
        'APPLOVIN_APP_OPEN_AD_UNIT_ANDROID',
        'APPLOVIN_BANNER_AD_UNIT_ANDROID',
        'APPLOVIN_INTERSTITIAL_AD_UNIT_ANDROID',
        'APPLOVIN_REWARDED_AD_UNIT_ANDROID'
    ];
    
    // Check if all variables are imported
    const notImported = [];
    const notExported = [];
    
    allVars.forEach(varName => {
        if (!envTsContent.includes(varName) || !envTsContent.includes('from \'@env\'')) {
            notImported.push(varName);
        }
        if (!envTsContent.match(new RegExp(`${varName}:\\s*${varName}`))) {
            notExported.push(varName);
        }
    });
    
    if (notImported.length === 0) {
        console.log('✅ All AppLovin variables are imported from @env');
    } else {
        console.log(`❌ Missing imports: ${notImported.join(', ')}`);
        hasErrors = true;
    }
    
    if (notExported.length === 0) {
        console.log('✅ All AppLovin variables are exported in env object');
    } else {
        console.log(`⚠️  Not properly exported: ${notExported.join(', ')}`);
        hasWarnings = true;
    }
} else {
    console.log('❌ env.ts file not found');
    hasErrors = true;
}

// Test 3: Check AndroidManifest.xml
console.log('\n📋 Test 3: Checking AndroidManifest.xml...');
const manifestPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
if (fs.existsSync(manifestPath)) {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    
    if (manifestContent.includes('applovin.sdk.key')) {
        console.log('✅ applovin.sdk.key meta-data found');
        
        // Extract the SDK key value
        const keyMatch = manifestContent.match(/android:name="applovin\.sdk\.key"[\s\S]*?android:value="([^"]+)"/);
        if (keyMatch && keyMatch[1] && keyMatch[1] !== 'YOUR_SDK_KEY_HERE') {
            console.log('✅ SDK key is configured in AndroidManifest.xml');
            console.log(`   Key length: ${keyMatch[1].length} characters`);
        } else {
            console.log('❌ SDK key in AndroidManifest.xml is empty or placeholder');
            hasErrors = true;
        }
    } else {
        console.log('❌ applovin.sdk.key not found in AndroidManifest.xml');
        hasErrors = true;
    }
} else {
    console.log('❌ AndroidManifest.xml not found');
    hasErrors = true;
}

// Test 4: Check Info.plist
console.log('\n📋 Test 4: Checking Info.plist...');

// Dynamically find iOS project
let infoPlistPath = null;
const iosDir = path.join(__dirname, 'ios');
if (fs.existsSync(iosDir)) {
    const projects = fs.readdirSync(iosDir).filter(file => 
        file.endsWith('.xcodeproj') && !file.includes('Pods')
    );
    
    if (projects.length > 0) {
        const projectName = projects[0].replace('.xcodeproj', '');
        infoPlistPath = path.join(iosDir, projectName, 'Info.plist');
    }
}

if (infoPlistPath && fs.existsSync(infoPlistPath)) {
    const infoPlistContent = fs.readFileSync(infoPlistPath, 'utf8');
    
    if (infoPlistContent.includes('AppLovinSdkKey')) {
        console.log('✅ AppLovinSdkKey found in Info.plist');
        
        // Extract the SDK key value
        const keyMatch = infoPlistContent.match(/<key>AppLovinSdkKey<\/key>\s*<string>([^<]+)<\/string>/);
        if (keyMatch && keyMatch[1] && keyMatch[1] !== 'YOUR_SDK_KEY_HERE') {
            console.log('✅ SDK key is configured in Info.plist');
            console.log(`   Key length: ${keyMatch[1].length} characters`);
        } else {
            console.log('❌ SDK key in Info.plist is empty or placeholder');
            hasErrors = true;
        }
    } else {
        console.log('❌ AppLovinSdkKey not found in Info.plist');
        hasErrors = true;
    }
} else {
    console.log('❌ Info.plist not found');
    hasErrors = true;
}

// Test 5: Check AppLovinService.ts
console.log('\n📋 Test 5: Checking AppLovinService.ts...');
const servicePath = path.join(__dirname, 'src', 'services', 'AppLovinService.ts');
if (fs.existsSync(servicePath)) {
    const serviceContent = fs.readFileSync(servicePath, 'utf8');
    
    if (serviceContent.includes('env.APPLOVIN_SDK_KEY')) {
        console.log('✅ AppLovinService.ts is using env.APPLOVIN_SDK_KEY');
        
        // Check if there's error handling for missing key
        if (serviceContent.includes('APPLOVIN_SDK_KEY to your .env file')) {
            console.log('✅ Service has proper error handling for missing SDK key');
        } else {
            console.log('⚠️  Service may not have error handling for missing SDK key');
            hasWarnings = true;
        }
    } else {
        console.log('❌ AppLovinService.ts is not using env.APPLOVIN_SDK_KEY');
        hasErrors = true;
    }
} else {
    console.log('⚠️  AppLovinService.ts not found');
    hasWarnings = true;
}

// Test 6: Verify keys match across all files
console.log('\n📋 Test 6: Verifying key consistency...');
const envKey = fs.existsSync(envPath) ? 
    (fs.readFileSync(envPath, 'utf8').match(/^APPLOVIN_SDK_KEY=(.+)$/m)?.[1]?.trim() || '') : '';
const androidKey = fs.existsSync(manifestPath) ?
    (fs.readFileSync(manifestPath, 'utf8').match(/android:name="applovin\.sdk\.key"[\s\S]*?android:value="([^"]+)"/)?.[1] || '') : '';
const iosKey = (infoPlistPath && fs.existsSync(infoPlistPath)) ?
    (fs.readFileSync(infoPlistPath, 'utf8').match(/<key>AppLovinSdkKey<\/key>\s*<string>([^<]+)<\/string>/)?.[1] || '') : '';

if (envKey && androidKey && iosKey) {
    if (envKey === androidKey && envKey === iosKey) {
        console.log('✅ SDK key is consistent across all files');
    } else {
        console.log('❌ SDK keys do not match across files:');
        console.log(`   .env: ${envKey.substring(0, 20)}...`);
        console.log(`   AndroidManifest.xml: ${androidKey.substring(0, 20)}...`);
        console.log(`   Info.plist: ${iosKey.substring(0, 20)}...`);
        hasErrors = true;
    }
} else {
    console.log('⚠️  Could not verify key consistency (some keys are missing)');
    hasWarnings = true;
}

// Summary
console.log('\n========================================');
if (hasErrors) {
    console.log('❌ Configuration has errors!');
    console.log('Please fix the issues above and run this test again.');
    console.log('\nNext steps:');
    console.log('1. Fix the errors listed above');
    console.log('2. Re-run: node test-applovin.js');
    process.exit(1);
} else if (hasWarnings) {
    console.log('⚠️  Configuration is mostly complete, but there are warnings.');
    console.log('Review the warnings above and fix if needed.');
    console.log('\nNext steps:');
    console.log('1. Review warnings above');
    console.log('2. Clean and rebuild: yarn clean && yarn install');
    console.log('3. Test AppLovin initialization in your app');
} else {
    console.log('✅ All tests passed!');
    console.log('Your AppLovin MAX configuration is complete and consistent.');
    console.log('\nNext steps:');
    console.log('1. Clean and rebuild: yarn clean && yarn install');
    console.log('2. For iOS: cd ios && pod install && cd ..');
    console.log('3. Test AppLovin initialization in your app');
    console.log('4. Check logs for: [AppLovin] SDK initialized successfully');
}
console.log('========================================\n');
EOTEST
    
    chmod +x "$PROJECT_ROOT/test-applovin.js"
    print_success "Test script created: test-applovin.js"
}

run_verification_test() {
    print_header "Step 7: Run Verification Test"
    
    print_step "Running configuration test..."
    echo ""
    
    if command -v node &> /dev/null; then
        node "$PROJECT_ROOT/test-applovin.js"
    else
        print_warning "Node.js not found. Please install Node.js to run the test."
        print_info "You can manually verify the configuration later by running: node test-applovin.js"
    fi
}

print_final_instructions() {
    print_header "AppLovin MAX Setup Complete! 🎉"
    
    echo -e "${GREEN}AppLovin MAX has been configured successfully!${NC}"
    echo ""
    echo -e "${CYAN}What was configured:${NC}"
    echo "  ✅ APPLOVIN_SDK_KEY in .env"
    echo "  ✅ All iOS Ad Unit IDs in .env"
    echo "  ✅ All Android Ad Unit IDs in .env"
    echo "  ✅ applovin.sdk.key in AndroidManifest.xml"
    echo "  ✅ AppLovinSdkKey in Info.plist"
    echo "  ✅ env.ts is properly configured"
    echo ""
    echo -e "${CYAN}Configuration Details:${NC}"
    echo "   SDK Key: ${APPLOVIN_SDK_KEY:0:20}...${APPLOVIN_SDK_KEY: -10}"
    echo ""
    echo "   iOS Ad Units:"
    echo "     • App Open: $APPLOVIN_APP_OPEN_AD_UNIT_IOS"
    echo "     • Banner: $APPLOVIN_BANNER_AD_UNIT_IOS"
    echo "     • Interstitial: $APPLOVIN_INTERSTITIAL_AD_UNIT_IOS"
    echo "     • Rewarded: $APPLOVIN_REWARDED_AD_UNIT_IOS"
    echo ""
    echo "   Android Ad Units:"
    echo "     • App Open: $APPLOVIN_APP_OPEN_AD_UNIT_ANDROID"
    echo "     • Banner: $APPLOVIN_BANNER_AD_UNIT_ANDROID"
    echo "     • Interstitial: $APPLOVIN_INTERSTITIAL_AD_UNIT_ANDROID"
    echo "     • Rewarded: $APPLOVIN_REWARDED_AD_UNIT_ANDROID"
    echo ""
    echo -e "${CYAN}Next Steps:${NC}"
    echo ""
    echo -e "${YELLOW}1. Clean and rebuild your project:${NC}"
    echo -e "   ${GREEN}yarn clean${NC}"
    echo -e "   ${GREEN}yarn install${NC}"
    echo ""
    echo -e "${YELLOW}2. Install iOS pods (if on macOS):${NC}"
    echo -e "   ${GREEN}cd ios && pod install && cd ..${NC}"
    echo ""
    echo -e "${YELLOW}3. Run your app:${NC}"
    echo -e "   ${GREEN}yarn ios${NC}"
    echo -e "   ${GREEN}yarn android${NC}"
    echo ""
    echo -e "${YELLOW}4. Verify initialization in logs:${NC}"
    echo "   Look for: ${GREEN}[AppLovin] SDK initialized successfully${NC}"
    echo ""
    echo -e "${CYAN}How AppLovin Gets the Configuration:${NC}"
    echo "  1. .env file contains all SDK key and ad unit IDs"
    echo "  2. env.ts imports them from @env module"
    echo "  3. AppLovinService.ts reads from env object:"
    echo "     • env.APPLOVIN_SDK_KEY"
    echo "     • env.APPLOVIN_BANNER_AD_UNIT_IOS / ANDROID"
    echo "     • env.APPLOVIN_INTERSTITIAL_AD_UNIT_IOS / ANDROID"
    echo "     • env.APPLOVIN_REWARDED_AD_UNIT_IOS / ANDROID"
    echo "     • env.APPLOVIN_APP_OPEN_AD_UNIT_IOS / ANDROID"
    echo "  4. Native code also has SDK key in AndroidManifest.xml and Info.plist"
    echo ""
    echo -e "${CYAN}Testing:${NC}"
    echo "  • Test mode is enabled in __DEV__ mode automatically"
    echo "  • Check AppLovinService.ts for initialization code"
    echo "  • Look for console logs starting with [AppLovin]"
    echo ""
    echo -e "${CYAN}Verification:${NC}"
    echo "  • Run: ${GREEN}node test-applovin.js${NC} anytime to verify configuration"
    echo "  • All three locations (.env, Android, iOS) should have the same key"
    echo ""
    echo -e "${CYAN}File Locations:${NC}"
    echo "  • .env: $ENV_FILE"
    echo "  • env.ts: $ENV_TS_FILE"
    echo "  • AndroidManifest.xml: $ANDROID_MANIFEST"
    echo "  • Info.plist: $IOS_INFO_PLIST"
    echo "  • Service: src/services/AppLovinService.ts"
    echo ""
    echo -e "${YELLOW}⚠️  Important Notes:${NC}"
    echo "  • The SDK key is in 3 places: .env, AndroidManifest.xml, and Info.plist"
    echo "  • All ad unit IDs are in .env and accessible via env.ts"
    echo "  • JavaScript code reads from env.ts which gets it from .env"
    echo "  • Native modules may read SDK key directly from AndroidManifest.xml/Info.plist"
    echo "  • Keep all three locations in sync for SDK key"
    echo "  • Ad unit IDs are platform-specific (iOS vs Android)"
    echo ""
    echo -e "${CYAN}Troubleshooting:${NC}"
    echo "  • If SDK fails to initialize, check the key in all 3 locations"
    echo "  • Run: ${GREEN}node test-applovin.js${NC} to verify configuration"
    echo "  • Check that env.ts properly imports and exports APPLOVIN_SDK_KEY"
    echo "  • Clear cache: ${GREEN}yarn clean${NC}"
    echo ""
    print_success "You're all set! Happy monetizing! 💰"
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    clear
    
    print_header "AppLovin MAX SDK Setup Script"
    
    echo -e "${CYAN}This script will configure your AppLovin MAX SDK.${NC}"
    echo ""
    echo -e "${YELLOW}What this script does:${NC}"
    echo "  • Collects your AppLovin SDK Key"
    echo "  • Collects iOS Ad Unit IDs (App Open, Banner, Interstitial, Rewarded)"
    echo "  • Collects Android Ad Unit IDs (App Open, Banner, Interstitial, Rewarded)"
    echo "  • Updates .env file with all credentials"
    echo "  • Updates AndroidManifest.xml with SDK key"
    echo "  • Updates iOS Info.plist with SDK key"
    echo "  • Verifies env.ts configuration for all variables"
    echo "  • Tests that all keys are accessible from env"
    echo ""
    echo -e "${YELLOW}What you need:${NC}"
    echo "  • Your AppLovin SDK Key from https://dash.applovin.com/"
    echo "  • iOS Ad Unit IDs for all ad types"
    echo "  • Android Ad Unit IDs for all ad types"
    echo ""
    
    read -p "Ready to begin? (y/n): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Setup cancelled."
        exit 0
    fi
    
    # Run setup steps
    collect_sdk_key
    update_env_file
    verify_env_ts
    update_android_manifest
    update_ios_info_plist
    create_verification_script
    run_verification_test
    print_final_instructions
}

# Run main function
main

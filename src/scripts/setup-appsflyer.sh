#!/bin/bash

# ============================================================================
# AppsFlyer Setup Script
# ============================================================================
# This script helps developers set up AppsFlyer attribution in their React Native project
# 
# Features:
# - Prompts for AppsFlyer Dev Key (required)
# - Prompts for AppsFlyer Production Key (optional, for production builds)
# - Prompts for AppsFlyer App ID (iOS only)
# - Updates .env file automatically
# - Verifies the keys are properly configured in env.ts
# - Validates the keys are properly passed to AppsFlyer SDK
# - Creates a test script to verify the integration
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
ENV_EXAMPLE_FILE="$PROJECT_ROOT/.env.example"
ENV_CONFIG_PATH="$PROJECT_ROOT/src/config/env.ts"
APPSFLYER_SERVICE="$PROJECT_ROOT/src/services/AppsFlyerService.ts"
APPSFLYER_INITIALIZER="$PROJECT_ROOT/src/config/initializers/appsFlyerInitializer.ts"

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

validate_dev_key() {
    local dev_key=$1
    
    if [ -z "$dev_key" ]; then
        return 1
    fi
    
    # AppsFlyer Dev Key is typically a long alphanumeric string
    if [ ${#dev_key} -lt 10 ]; then
        print_warning "Dev Key seems too short (expected 20+ characters)"
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
    fi
    
    return 0
}

validate_app_id() {
    local app_id=$1
    
    if [ -z "$app_id" ]; then
        return 1
    fi
    
    # iOS App ID should be numeric
    if ! [[ "$app_id" =~ ^[0-9]+$ ]]; then
        print_warning "iOS App ID should be numeric (e.g., 1234567890)"
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
    fi
    
    if [ ${#app_id} -lt 9 ]; then
        print_warning "iOS App ID seems too short (expected 10 digits)"
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
    fi
    
    return 0
}

validate_android_package() {
    local package=$1
    
    if [ -z "$package" ]; then
        return 1
    fi
    
    # Android package name should follow format: com.company.app
    if ! [[ "$package" =~ ^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$ ]]; then
        print_warning "Android package name should follow format: com.company.app"
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

collect_appsflyer_keys() {
    print_header "Step 1: Collect AppsFlyer Configuration"
    
    echo -e "${CYAN}📝 You need to get your AppsFlyer keys from the AppsFlyer Dashboard:${NC}"
    echo "   1. Go to: https://hq1.appsflyer.com/"
    echo "   2. Log in to your AppsFlyer account"
    echo "   3. Navigate to: Configuration → SDK → Integration"
    echo "   4. Find your Dev Key (required for all platforms)"
    echo "   5. For iOS: Get your Apple App ID (numeric ID from App Store Connect)"
    echo ""
    echo -e "${MAGENTA}Key Information:${NC}"
    echo "   • Dev Key: Used for both development AND production"
    echo "   • Production Key: (Optional) Separate key for production builds"
    echo "   • iOS App ID: Your Apple App ID (e.g., 1234567890)"
    echo "   • Android Package Name: Your Android package (e.g., com.company.app)"
    echo ""
    
    # Prompt for Dev Key
    while true; do
        echo -e "${YELLOW}Enter your AppsFlyer Dev Key (required):${NC}"
        read -r APPSFLYER_DEV_KEY
        
        if validate_dev_key "$APPSFLYER_DEV_KEY"; then
            break
        else
            print_error "Invalid Dev Key. Please try again."
        fi
    done
    
    echo ""
    
    # Prompt for Production Key (optional)
    echo -e "${CYAN}Production Key Setup:${NC}"
    echo "Most apps use the same Dev Key for both development and production."
    echo "Only use a separate Production Key if you have multiple AppsFlyer apps."
    echo ""
    read -p "Do you want to set up a separate Production Key? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        while true; do
            echo -e "${YELLOW}Enter your AppsFlyer Production Key:${NC}"
            read -r APPSFLYER_PROD_KEY
            
            if validate_dev_key "$APPSFLYER_PROD_KEY"; then
                if [ "$APPSFLYER_PROD_KEY" == "$APPSFLYER_DEV_KEY" ]; then
                    print_warning "Production Key is the same as Dev Key!"
                    read -p "Continue anyway? (y/n): " -n 1 -r
                    echo
                    if [[ $REPLY =~ ^[Yy]$ ]]; then
                        break
                    fi
                else
                    break
                fi
            else
                print_error "Invalid Production Key. Please try again."
            fi
        done
    else
        APPSFLYER_PROD_KEY="$APPSFLYER_DEV_KEY"
        print_info "Using Dev Key for production builds as well"
    fi
    
    echo ""
    
    # Prompt for iOS App ID
    while true; do
        echo -e "${YELLOW}Enter your iOS App ID (Apple App ID):${NC}"
        echo -e "${MAGENTA}(Find this in App Store Connect → App Information → Apple ID)${NC}"
        read -r APPSFLYER_APP_ID
        
        if validate_app_id "$APPSFLYER_APP_ID"; then
            break
        else
            print_error "Invalid iOS App ID. Please try again."
        fi
    done
    
    echo ""
    
    # Prompt for Android Package Name
    while true; do
        echo -e "${YELLOW}Enter your Android Package Name:${NC}"
        echo -e "${MAGENTA}(Find this in android/app/build.gradle → applicationId)${NC}"
        echo -e "${MAGENTA}(Format: com.company.app)${NC}"
        read -r APPSFLYER_ANDROID_PACKAGE
        
        if validate_android_package "$APPSFLYER_ANDROID_PACKAGE"; then
            break
        else
            print_error "Invalid Android Package Name. Please try again."
        fi
    done
    
    echo ""
    print_success "AppsFlyer keys collected successfully!"
    echo ""
    echo -e "${CYAN}Configuration Summary:${NC}"
    echo "   Dev Key: $APPSFLYER_DEV_KEY"
    echo "   Production Key: $APPSFLYER_PROD_KEY"
    echo "   iOS App ID: $APPSFLYER_APP_ID"
    echo "   Android Package: $APPSFLYER_ANDROID_PACKAGE"
}

update_env_file() {
    print_header "Step 2: Update .env File"
    
    check_env_file
    
    print_step "Updating AppsFlyer keys in .env file..."
    
    # Backup existing .env
    cp "$ENV_FILE" "$ENV_FILE.backup"
    print_info "Backup created: .env.backup"
    
    # Update or add APPSFLYER_DEV_KEY
    if grep -q "^APPSFLYER_DEV_KEY=" "$ENV_FILE"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^APPSFLYER_DEV_KEY=.*|APPSFLYER_DEV_KEY=$APPSFLYER_DEV_KEY|" "$ENV_FILE"
        else
            sed -i "s|^APPSFLYER_DEV_KEY=.*|APPSFLYER_DEV_KEY=$APPSFLYER_DEV_KEY|" "$ENV_FILE"
        fi
        print_success "Updated APPSFLYER_DEV_KEY in .env"
    else
        echo "APPSFLYER_DEV_KEY=$APPSFLYER_DEV_KEY" >> "$ENV_FILE"
        print_success "Added APPSFLYER_DEV_KEY to .env"
    fi
    
    # Update or add APPSFLYER_PROD_KEY
    if grep -q "^APPSFLYER_PROD_KEY=" "$ENV_FILE"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^APPSFLYER_PROD_KEY=.*|APPSFLYER_PROD_KEY=$APPSFLYER_PROD_KEY|" "$ENV_FILE"
        else
            sed -i "s|^APPSFLYER_PROD_KEY=.*|APPSFLYER_PROD_KEY=$APPSFLYER_PROD_KEY|" "$ENV_FILE"
        fi
        print_success "Updated APPSFLYER_PROD_KEY in .env"
    else
        # Add APPSFLYER_PROD_KEY after APPSFLYER_DEV_KEY
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "/^APPSFLYER_DEV_KEY=/a\\
APPSFLYER_PROD_KEY=$APPSFLYER_PROD_KEY
" "$ENV_FILE"
        else
            sed -i "/^APPSFLYER_DEV_KEY=/a\\APPSFLYER_PROD_KEY=$APPSFLYER_PROD_KEY" "$ENV_FILE"
        fi
        print_success "Added APPSFLYER_PROD_KEY to .env"
    fi
    
    # Update or add APPSFLYER_APP_ID
    if grep -q "^APPSFLYER_APP_ID=" "$ENV_FILE"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^APPSFLYER_APP_ID=.*|APPSFLYER_APP_ID=$APPSFLYER_APP_ID|" "$ENV_FILE"
        else
            sed -i "s|^APPSFLYER_APP_ID=.*|APPSFLYER_APP_ID=$APPSFLYER_APP_ID|" "$ENV_FILE"
        fi
        print_success "Updated APPSFLYER_APP_ID in .env"
    else
        echo "APPSFLYER_APP_ID=$APPSFLYER_APP_ID" >> "$ENV_FILE"
        print_success "Added APPSFLYER_APP_ID to .env"
    fi
    
    # Update or add APPSFLYER_ANDROID_PACKAGE
    if grep -q "^APPSFLYER_ANDROID_PACKAGE=" "$ENV_FILE"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^APPSFLYER_ANDROID_PACKAGE=.*|APPSFLYER_ANDROID_PACKAGE=$APPSFLYER_ANDROID_PACKAGE|" "$ENV_FILE"
        else
            sed -i "s|^APPSFLYER_ANDROID_PACKAGE=.*|APPSFLYER_ANDROID_PACKAGE=$APPSFLYER_ANDROID_PACKAGE|" "$ENV_FILE"
        fi
        print_success "Updated APPSFLYER_ANDROID_PACKAGE in .env"
    else
        echo "APPSFLYER_ANDROID_PACKAGE=$APPSFLYER_ANDROID_PACKAGE" >> "$ENV_FILE"
        print_success "Added APPSFLYER_ANDROID_PACKAGE to .env"
    fi
}

update_env_config() {
    print_header "Step 3: Update env.ts Configuration"
    
    if [ ! -f "$ENV_CONFIG_PATH" ]; then
        print_error "env.ts not found at: $ENV_CONFIG_PATH"
        exit 1
    fi
    
    print_step "Checking if APPSFLYER_PROD_KEY is in env.ts..."
    
    # Backup env.ts
    cp "$ENV_CONFIG_PATH" "$ENV_CONFIG_PATH.backup"
    print_info "Backup created: env.ts.backup"
    
    # Check if APPSFLYER_PROD_KEY is imported
    if grep -q "APPSFLYER_PROD_KEY" "$ENV_CONFIG_PATH"; then
        print_success "APPSFLYER_PROD_KEY is already imported in env.ts"
    else
        print_step "Adding APPSFLYER_PROD_KEY to imports..."
        
        # Add to imports (after APPSFLYER_DEV_KEY)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "/APPSFLYER_DEV_KEY,/a\\
  APPSFLYER_PROD_KEY,
" "$ENV_CONFIG_PATH"
        else
            sed -i "/APPSFLYER_DEV_KEY,/a\\  APPSFLYER_PROD_KEY," "$ENV_CONFIG_PATH"
        fi
        
        # Add to type definition (after APPSFLYER_DEV_KEY: string)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "/APPSFLYER_DEV_KEY: string/a\\
  APPSFLYER_PROD_KEY: string
" "$ENV_CONFIG_PATH"
        else
            sed -i "/APPSFLYER_DEV_KEY: string/a\\  APPSFLYER_PROD_KEY: string" "$ENV_CONFIG_PATH"
        fi
        
        # Add to env object (after APPSFLYER_DEV_KEY:)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "/APPSFLYER_DEV_KEY: APPSFLYER_DEV_KEY/a\\
  APPSFLYER_PROD_KEY: APPSFLYER_PROD_KEY ?? '',
" "$ENV_CONFIG_PATH"
        else
            sed -i "/APPSFLYER_DEV_KEY: APPSFLYER_DEV_KEY/a\\  APPSFLYER_PROD_KEY: APPSFLYER_PROD_KEY ?? ''," "$ENV_CONFIG_PATH"
        fi
        
        print_success "Added APPSFLYER_PROD_KEY to env.ts"
    fi
    
    # Check if APPSFLYER_ANDROID_PACKAGE is imported
    if grep -q "APPSFLYER_ANDROID_PACKAGE" "$ENV_CONFIG_PATH"; then
        print_success "APPSFLYER_ANDROID_PACKAGE is already imported in env.ts"
    else
        print_step "Adding APPSFLYER_ANDROID_PACKAGE to imports..."
        
        # Add to imports (after APPSFLYER_APP_ID)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "/APPSFLYER_APP_ID,/a\\
  APPSFLYER_ANDROID_PACKAGE,
" "$ENV_CONFIG_PATH"
        else
            sed -i "/APPSFLYER_APP_ID,/a\\  APPSFLYER_ANDROID_PACKAGE," "$ENV_CONFIG_PATH"
        fi
        
        # Add to type definition (after APPSFLYER_APP_ID: string)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "/APPSFLYER_APP_ID: string/a\\
  APPSFLYER_ANDROID_PACKAGE: string
" "$ENV_CONFIG_PATH"
        else
            sed -i "/APPSFLYER_APP_ID: string/a\\  APPSFLYER_ANDROID_PACKAGE: string" "$ENV_CONFIG_PATH"
        fi
        
        # Add to env object (after APPSFLYER_APP_ID:)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "/APPSFLYER_APP_ID: APPSFLYER_APP_ID/a\\
  APPSFLYER_ANDROID_PACKAGE: APPSFLYER_ANDROID_PACKAGE ?? '',
" "$ENV_CONFIG_PATH"
        else
            sed -i "/APPSFLYER_APP_ID: APPSFLYER_APP_ID/a\\  APPSFLYER_ANDROID_PACKAGE: APPSFLYER_ANDROID_PACKAGE ?? ''," "$ENV_CONFIG_PATH"
        fi
        
        print_success "Added APPSFLYER_ANDROID_PACKAGE to env.ts"
    fi
}

verify_configuration() {
    print_header "Step 4: Verify Configuration"
    
    print_step "Checking .env file..."
    
    # Check if keys exist in .env
    if grep -q "^APPSFLYER_DEV_KEY=$APPSFLYER_DEV_KEY" "$ENV_FILE"; then
        print_success "APPSFLYER_DEV_KEY is set correctly in .env"
    else
        print_error "APPSFLYER_DEV_KEY is NOT set correctly in .env"
        exit 1
    fi
    
    if grep -q "^APPSFLYER_PROD_KEY=" "$ENV_FILE"; then
        print_success "APPSFLYER_PROD_KEY is set in .env"
    else
        print_warning "APPSFLYER_PROD_KEY is NOT set in .env"
    fi
    
    if grep -q "^APPSFLYER_APP_ID=$APPSFLYER_APP_ID" "$ENV_FILE"; then
        print_success "APPSFLYER_APP_ID is set correctly in .env"
    else
        print_error "APPSFLYER_APP_ID is NOT set correctly in .env"
        exit 1
    fi
    
    if grep -q "^APPSFLYER_ANDROID_PACKAGE=$APPSFLYER_ANDROID_PACKAGE" "$ENV_FILE"; then
        print_success "APPSFLYER_ANDROID_PACKAGE is set correctly in .env"
    else
        print_error "APPSFLYER_ANDROID_PACKAGE is NOT set correctly in .env"
        exit 1
    fi
    
    print_step "Checking env.ts configuration..."
    
    # Check imports
    if grep -q "APPSFLYER_DEV_KEY" "$ENV_CONFIG_PATH" && grep -q "from '@env'" "$ENV_CONFIG_PATH"; then
        print_success "APPSFLYER_DEV_KEY is imported from @env"
    else
        print_error "APPSFLYER_DEV_KEY is NOT properly imported"
        exit 1
    fi
    
    if grep -q "APPSFLYER_APP_ID" "$ENV_CONFIG_PATH"; then
        print_success "APPSFLYER_APP_ID is imported from @env"
    else
        print_error "APPSFLYER_APP_ID is NOT properly imported"
        exit 1
    fi
    
    if grep -q "APPSFLYER_PROD_KEY" "$ENV_CONFIG_PATH"; then
        print_success "APPSFLYER_PROD_KEY is imported from @env"
    else
        print_warning "APPSFLYER_PROD_KEY is NOT imported (you may add it manually if needed)"
    fi
    
    # Check type definition
    if grep -q "APPSFLYER_DEV_KEY: string" "$ENV_CONFIG_PATH"; then
        print_success "APPSFLYER_DEV_KEY is in type definition"
    else
        print_error "APPSFLYER_DEV_KEY is NOT in type definition"
        exit 1
    fi
    
    if grep -q "APPSFLYER_APP_ID: string" "$ENV_CONFIG_PATH"; then
        print_success "APPSFLYER_APP_ID is in type definition"
    else
        print_error "APPSFLYER_APP_ID is NOT in type definition"
        exit 1
    fi
    
    print_step "Checking AppsFlyer initializer..."
    
    if [ -f "$APPSFLYER_INITIALIZER" ]; then
        print_success "AppsFlyer initializer exists"
        
        if grep -q "env.APPSFLYER_DEV_KEY" "$APPSFLYER_INITIALIZER"; then
            print_success "Initializer uses env.APPSFLYER_DEV_KEY"
        else
            print_warning "Initializer may not use env.APPSFLYER_DEV_KEY"
        fi
        
        if grep -q "env.APPSFLYER_APP_ID" "$APPSFLYER_INITIALIZER"; then
            print_success "Initializer uses env.APPSFLYER_APP_ID"
        else
            print_warning "Initializer may not use env.APPSFLYER_APP_ID"
        fi
    else
        print_error "AppsFlyer initializer not found"
        exit 1
    fi
    
    print_step "Checking AppsFlyer service..."
    
    if [ -f "$APPSFLYER_SERVICE" ]; then
        print_success "AppsFlyer service exists"
        
        if grep -q "react-native-appsflyer" "$APPSFLYER_SERVICE"; then
            print_success "AppsFlyer SDK is imported"
        else
            print_error "AppsFlyer SDK is NOT imported"
            exit 1
        fi
    else
        print_error "AppsFlyer service not found"
        exit 1
    fi
}

create_test_script() {
    print_header "Step 5: Create Verification Test Script"
    
    print_step "Creating test-appsflyer.js..."
    
    cat > "$PROJECT_ROOT/test-appsflyer.js" << 'EOF'
/**
 * AppsFlyer Configuration Test
 * Run this with: node test-appsflyer.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('\n========================================');
console.log('AppsFlyer Configuration Test');
console.log('========================================\n');

let hasErrors = false;
let hasWarnings = false;

// Test 1: Check if .env file has the keys
console.log('📋 Test 1: Checking .env file...');
const devKey = process.env.APPSFLYER_DEV_KEY;
const prodKey = process.env.APPSFLYER_PROD_KEY;
const appId = process.env.APPSFLYER_APP_ID;
const androidPackage = process.env.APPSFLYER_ANDROID_PACKAGE;

if (!devKey || devKey.trim() === '') {
    console.log('❌ APPSFLYER_DEV_KEY is missing or empty in .env');
    hasErrors = true;
} else {
    console.log('✅ APPSFLYER_DEV_KEY is set:', devKey);
}

if (!prodKey || prodKey.trim() === '') {
    console.log('⚠️  APPSFLYER_PROD_KEY is missing or empty in .env');
    console.log('   (This is optional - most apps use the same Dev Key for production)');
    hasWarnings = true;
} else {
    console.log('✅ APPSFLYER_PROD_KEY is set:', prodKey);
}

if (!appId || appId.trim() === '') {
    console.log('❌ APPSFLYER_APP_ID is missing or empty in .env');
    hasErrors = true;
} else {
    console.log('✅ APPSFLYER_APP_ID is set:', appId);
}

if (!androidPackage || androidPackage.trim() === '') {
    console.log('❌ APPSFLYER_ANDROID_PACKAGE is missing or empty in .env');
    hasErrors = true;
} else {
    console.log('✅ APPSFLYER_ANDROID_PACKAGE is set:', androidPackage);
}

// Test 2: Validate key formats
console.log('\n📋 Test 2: Validating key formats...');
if (devKey && devKey.length < 10) {
    console.log('⚠️  Dev Key seems too short (expected 20+ characters)');
    hasWarnings = true;
} else if (devKey) {
    console.log('✅ Dev Key length looks good');
}

if (prodKey && prodKey !== devKey && prodKey.length < 10) {
    console.log('⚠️  Production Key seems too short (expected 20+ characters)');
    hasWarnings = true;
} else if (prodKey && prodKey !== devKey) {
    console.log('✅ Production Key length looks good');
}

if (appId && !/^\d+$/.test(appId)) {
    console.log('⚠️  iOS App ID should be numeric (e.g., 1234567890)');
    hasWarnings = true;
} else if (appId) {
    console.log('✅ iOS App ID format looks correct');
}

if (appId && appId.length < 9) {
    console.log('⚠️  iOS App ID seems too short (expected 10 digits)');
    hasWarnings = true;
} else if (appId) {
    console.log('✅ iOS App ID length looks good');
}

if (androidPackage && !/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(androidPackage)) {
    console.log('⚠️  Android Package Name should follow format: com.company.app');
    hasWarnings = true;
} else if (androidPackage) {
    console.log('✅ Android Package Name format looks correct');
}

// Test 3: Check if Dev Key and Prod Key are different
console.log('\n📋 Test 3: Checking Dev vs Prod keys...');
if (devKey && prodKey && devKey === prodKey) {
    console.log('ℹ️  Dev Key and Production Key are the same');
    console.log('   (This is normal - most apps use one key for all environments)');
} else if (devKey && prodKey) {
    console.log('✅ Dev Key and Production Key are different');
    console.log('   (Make sure this is intentional for your setup)');
}

// Test 4: Check env.ts imports
console.log('\n📋 Test 4: Checking env.ts configuration...');
const envTsPath = path.join(__dirname, 'src', 'config', 'env.ts');
if (fs.existsSync(envTsPath)) {
    const envTsContent = fs.readFileSync(envTsPath, 'utf8');
    
    if (envTsContent.includes('APPSFLYER_DEV_KEY') && envTsContent.includes("from '@env'")) {
        console.log('✅ APPSFLYER_DEV_KEY is imported in env.ts');
    } else {
        console.log('❌ APPSFLYER_DEV_KEY is NOT imported in env.ts');
        hasErrors = true;
    }
    
    if (envTsContent.includes('APPSFLYER_APP_ID') && envTsContent.includes("from '@env'")) {
        console.log('✅ APPSFLYER_APP_ID is imported in env.ts');
    } else {
        console.log('❌ APPSFLYER_APP_ID is NOT imported in env.ts');
        hasErrors = true;
    }
    
    if (envTsContent.includes('APPSFLYER_PROD_KEY')) {
        console.log('✅ APPSFLYER_PROD_KEY is imported in env.ts');
    } else {
        console.log('⚠️  APPSFLYER_PROD_KEY is NOT imported in env.ts');
        console.log('   (Add it manually if you need separate production keys)');
        hasWarnings = true;
    }
    
    if (envTsContent.includes('APPSFLYER_DEV_KEY: string')) {
        console.log('✅ APPSFLYER_DEV_KEY is in type definition');
    } else {
        console.log('❌ APPSFLYER_DEV_KEY is NOT in type definition');
        hasErrors = true;
    }
    
    if (envTsContent.includes('APPSFLYER_APP_ID: string')) {
        console.log('✅ APPSFLYER_APP_ID is in type definition');
    } else {
        console.log('❌ APPSFLYER_APP_ID is NOT in type definition');
        hasErrors = true;
    }
    
    if (envTsContent.includes('APPSFLYER_DEV_KEY: APPSFLYER_DEV_KEY')) {
        console.log('✅ APPSFLYER_DEV_KEY is exported in env object');
    } else {
        console.log('❌ APPSFLYER_DEV_KEY is NOT properly exported');
        hasErrors = true;
    }
    
    if (envTsContent.includes('APPSFLYER_APP_ID: APPSFLYER_APP_ID')) {
        console.log('✅ APPSFLYER_APP_ID is exported in env object');
    } else {
        console.log('❌ APPSFLYER_APP_ID is NOT properly exported');
        hasErrors = true;
    }
} else {
    console.log('❌ env.ts not found');
    hasErrors = true;
}

// Test 5: Check AppsFlyer initializer
console.log('\n📋 Test 5: Checking AppsFlyer initializer...');
const initializerPath = path.join(__dirname, 'src', 'config', 'initializers', 'appsFlyerInitializer.ts');
if (fs.existsSync(initializerPath)) {
    const initializerContent = fs.readFileSync(initializerPath, 'utf8');
    
    console.log('✅ AppsFlyer initializer exists');
    
    if (initializerContent.includes('env.APPSFLYER_DEV_KEY')) {
        console.log('✅ Initializer uses env.APPSFLYER_DEV_KEY');
    } else {
        console.log('⚠️  Initializer may not use env.APPSFLYER_DEV_KEY');
        hasWarnings = true;
    }
    
    if (initializerContent.includes('env.APPSFLYER_APP_ID')) {
        console.log('✅ Initializer uses env.APPSFLYER_APP_ID');
    } else {
        console.log('⚠️  Initializer may not use env.APPSFLYER_APP_ID');
        hasWarnings = true;
    }
    
    if (initializerContent.includes('appsFlyerService.initialize')) {
        console.log('✅ Initializer calls appsFlyerService.initialize()');
    } else {
        console.log('❌ Initializer does NOT call appsFlyerService.initialize()');
        hasErrors = true;
    }
} else {
    console.log('❌ AppsFlyer initializer not found');
    hasErrors = true;
}

// Test 6: Check AppsFlyer service
console.log('\n📋 Test 6: Checking AppsFlyer service...');
const servicePath = path.join(__dirname, 'src', 'services', 'AppsFlyerService.ts');
if (fs.existsSync(servicePath)) {
    const serviceContent = fs.readFileSync(servicePath, 'utf8');
    
    console.log('✅ AppsFlyer service exists');
    
    if (serviceContent.includes('react-native-appsflyer')) {
        console.log('✅ AppsFlyer SDK is imported');
    } else {
        console.log('❌ AppsFlyer SDK is NOT imported');
        hasErrors = true;
    }
    
    if (serviceContent.includes('initSdk')) {
        console.log('✅ Service calls appsflyer.initSdk()');
    } else {
        console.log('❌ Service does NOT call appsflyer.initSdk()');
        hasErrors = true;
    }
} else {
    console.log('❌ AppsFlyer service not found');
    hasErrors = true;
}

// Summary
console.log('\n========================================');
if (hasErrors) {
    console.log('❌ Configuration has errors!');
    console.log('Please fix the issues above and run this test again.');
    process.exit(1);
} else if (hasWarnings) {
    console.log('⚠️  All critical tests passed, but there are warnings.');
    console.log('Your AppsFlyer configuration should work, but review the warnings above.');
    console.log('\nNext steps:');
    console.log('1. Review warnings and consider fixing them');
    console.log('2. Clean and rebuild your project');
    console.log('3. Run on a simulator/device');
    console.log('4. Check console logs for: [AppsFlyer] Initialized successfully');
    console.log('5. Test attribution and events in AppsFlyer dashboard');
} else {
    console.log('✅ All tests passed!');
    console.log('Your AppsFlyer configuration looks perfect.');
    console.log('\nNext steps:');
    console.log('1. Clean and rebuild your project');
    console.log('2. Run on a simulator/device');
    console.log('3. Check console logs for: [AppsFlyer] Initialized successfully');
    console.log('4. Test attribution and events in AppsFlyer dashboard');
    console.log('5. Verify deep linking works correctly');
}
console.log('========================================\n');
EOF
    
    chmod +x "$PROJECT_ROOT/test-appsflyer.js"
    print_success "Test script created: test-appsflyer.js"
}

run_verification_test() {
    print_header "Step 6: Run Verification Test"
    
    print_step "Running configuration test..."
    echo ""
    
    if command -v node &> /dev/null; then
        node "$PROJECT_ROOT/test-appsflyer.js"
    else
        print_warning "Node.js not found. Please install Node.js to run the test."
    fi
}

print_final_instructions() {
    print_header "Setup Complete! 🎉"
    
    echo -e "${GREEN}AppsFlyer has been configured successfully!${NC}"
    echo ""
    echo -e "${CYAN}What was configured:${NC}"
    echo "  ✅ AppsFlyer Dev Key added to .env"
    echo "  ✅ AppsFlyer Production Key added to .env"
    echo "  ✅ AppsFlyer iOS App ID added to .env"
    echo "  ✅ AppsFlyer Android Package added to .env"
    echo "  ✅ env.ts updated to import and export keys"
    echo "  ✅ Configuration verified"
    echo "  ✅ Verification test script created"
    echo ""
    echo -e "${CYAN}Next Steps:${NC}"
    echo ""
    echo "  1. Clean and rebuild your project:"
    echo -e "     ${GREEN}yarn clean${NC}"
    echo -e "     ${GREEN}yarn install${NC}"
    echo ""
    echo "  2. For iOS, install pods:"
    echo -e "     ${GREEN}cd ios && pod install && cd ..${NC}"
    echo ""
    echo "  3. Run the app and check logs:"
    echo -e "     ${GREEN}yarn ios${NC} or ${GREEN}yarn android${NC}"
    echo "     Look for: ${CYAN}[AppsFlyer] Initialized successfully${NC}"
    echo ""
    echo "  4. Test the configuration:"
    echo -e "     ${GREEN}node test-appsflyer.js${NC}"
    echo ""
    echo -e "${CYAN}AppsFlyer Dashboard:${NC}"
    echo "  • Dashboard: https://hq1.appsflyer.com/"
    echo "  • Check attribution data"
    echo "  • Monitor conversion events"
    echo "  • Set up deep links"
    echo "  • Configure postbacks"
    echo ""
    echo -e "${CYAN}Testing Attribution:${NC}"
    echo "  • Install the app on a test device"
    echo "  • Check AppsFlyer dashboard for install event"
    echo "  • Test custom event logging"
    echo "  • Verify deep link handling"
    echo "  • Test conversion data callbacks"
    echo ""
    echo -e "${CYAN}Using Production Key:${NC}"
    if [ "$APPSFLYER_PROD_KEY" != "$APPSFLYER_DEV_KEY" ]; then
        echo "  • You set up a separate production key"
        echo "  • Update your build config to use APPSFLYER_PROD_KEY in production"
        echo "  • Example: Use Platform.select() or __DEV__ to switch keys"
    else
        echo "  • You're using the same key for dev and production"
        echo "  • This is the standard setup for most apps"
    fi
    echo ""
    echo -e "${CYAN}Helpful Resources:${NC}"
    echo "  • AppsFlyer Dashboard: https://hq1.appsflyer.com/"
    echo "  • Documentation: https://dev.appsflyer.com/"
    echo "  • React Native SDK: https://dev.appsflyer.com/hc/docs/react-native"
    echo "  • Deep Linking: https://dev.appsflyer.com/hc/docs/dl_react_native_init_sdk"
    echo ""
    echo -e "${YELLOW}⚠️  Important Reminders:${NC}"
    echo "  • Never commit .env file to version control"
    echo "  • Keep your Dev Key secure"
    echo "  • Test attribution on real devices (simulators may not work)"
    echo "  • Configure deep link schemes in iOS/Android"
    echo "  • Set up postbacks for ad networks if needed"
    echo "  • Request App Tracking Transparency (ATT) on iOS 14.5+"
    echo ""
    print_success "You're all set! Happy coding! 🚀"
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    clear
    
    print_header "AppsFlyer Setup Script"
    
    echo -e "${CYAN}This script will help you configure AppsFlyer attribution for your React Native app.${NC}"
    echo ""
    echo -e "${YELLOW}What this script does:${NC}"
    echo "  • Collects your AppsFlyer Dev Key"
    echo "  • Optionally collects separate Production Key"
    echo "  • Collects your iOS App ID"
    echo "  • Collects your Android Package Name"
    echo "  • Updates .env file automatically"
    echo "  • Updates env.ts to import and export the keys"
    echo "  • Verifies the configuration is correct"
    echo "  • Creates a test script to verify everything works"
    echo ""
    
    read -p "Ready to begin? (y/n): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Setup cancelled."
        exit 0
    fi
    
    # Run setup steps
    collect_appsflyer_keys
    update_env_file
    update_env_config
    verify_configuration
    create_test_script
    run_verification_test
    print_final_instructions
}

# Run main function
main

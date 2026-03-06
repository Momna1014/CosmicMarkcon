#!/bin/bash

# ============================================================================
# RevenueCat Setup Script
# ============================================================================
# This script helps developers set up RevenueCat in their React Native project
# 
# Features:
# - Prompts for iOS and Android RevenueCat API keys
# - Updates .env file automatically
# - Validates keys are properly configured
# - Enables In-App Purchase capability in Xcode
# - Verifies the integration is working
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
RC_SERVICE_PATH="$PROJECT_ROOT/src/services/RevenueCatService.ts"
ENV_CONFIG_PATH="$PROJECT_ROOT/src/config/env.ts"

# Dynamically find iOS project name
IOS_PROJECT_NAME=""
XCODE_PROJECT_PATH=""

# Function to detect iOS project
detect_ios_project() {
    local ios_dir="$PROJECT_ROOT/ios"
    
    if [ -d "$ios_dir" ]; then
        for proj in "$ios_dir"/*.xcodeproj; do
            if [ -d "$proj" ] && [[ ! "$proj" =~ Pods ]]; then
                IOS_PROJECT_NAME=$(basename "$proj" .xcodeproj)
                XCODE_PROJECT_PATH="$proj/project.pbxproj"
                break
            fi
        done
    fi
}

# Detect iOS project on script load
detect_ios_project

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

validate_revenuecat_key() {
    local key=$1
    local platform=$2
    
    # RevenueCat keys typically start with specific prefixes
    # iOS: starts with "appl_" 
    # Android: starts with "goog_"
    
    if [ -z "$key" ]; then
        return 1
    fi
    
    if [ "$platform" = "ios" ]; then
        if [[ ! $key =~ ^appl_ ]]; then
            print_warning "iOS key should typically start with 'appl_'"
            read -p "Continue anyway? (y/n): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                return 1
            fi
        fi
    elif [ "$platform" = "android" ]; then
        if [[ ! $key =~ ^goog_ ]]; then
            print_warning "Android key should typically start with 'goog_'"
            read -p "Continue anyway? (y/n): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                return 1
            fi
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

collect_api_keys() {
    print_header "Step 1: Collect RevenueCat API Keys"
    
    echo -e "${CYAN}📝 You need to get your API keys from RevenueCat Dashboard:${NC}"
    echo "   1. Go to: https://app.revenuecat.com/"
    echo "   2. Select your project"
    echo "   3. Navigate to: Project Settings → API Keys"
    echo "   4. Copy the keys for iOS and Android"
    echo ""
    echo -e "${MAGENTA}Note: You can set up both Production and Test/Sandbox keys${NC}"
    echo ""
    
    # Ask if user wants to set up test keys
    echo -e "${YELLOW}Do you want to set up TEST/SANDBOX keys? (y/n)${NC}"
    echo -e "${CYAN}(Test keys are used for testing in development/staging environments)${NC}"
    read -p "> " -n 1 -r
    echo ""
    SETUP_TEST_KEYS=$REPLY
    echo ""
    
    # Prompt for Production iOS key
    while true; do
        echo -e "${YELLOW}Enter your RevenueCat PRODUCTION iOS API Key:${NC}"
        read -r REVENUECAT_IOS_KEY
        
        if validate_revenuecat_key "$REVENUECAT_IOS_KEY" "ios"; then
            break
        else
            print_error "Invalid iOS key. Please try again."
        fi
    done
    
    echo ""
    
    # Prompt for Production Android key
    while true; do
        echo -e "${YELLOW}Enter your RevenueCat PRODUCTION Android API Key:${NC}"
        read -r REVENUECAT_ANDROID_KEY
        
        if validate_revenuecat_key "$REVENUECAT_ANDROID_KEY" "android"; then
            break
        else
            print_error "Invalid Android key. Please try again."
        fi
    done
    
    echo ""
    
    # Collect test keys if requested
    if [[ $SETUP_TEST_KEYS =~ ^[Yy]$ ]]; then
        print_info "Setting up TEST/SANDBOX keys..."
        echo ""
        
        # Prompt for Test iOS key
        while true; do
            echo -e "${YELLOW}Enter your RevenueCat TEST/SANDBOX iOS API Key:${NC}"
            read -r REVENUECAT_IOS_KEY_TEST
            
            if validate_revenuecat_key "$REVENUECAT_IOS_KEY_TEST" "ios"; then
                break
            else
                print_error "Invalid iOS test key. Please try again."
            fi
        done
        
        echo ""
        
        # Prompt for Test Android key
        while true; do
            echo -e "${YELLOW}Enter your RevenueCat TEST/SANDBOX Android API Key:${NC}"
            read -r REVENUECAT_ANDROID_KEY_TEST
            
            if validate_revenuecat_key "$REVENUECAT_ANDROID_KEY_TEST" "android"; then
                break
            else
                print_error "Invalid Android test key. Please try again."
            fi
        done
        
        echo ""
    fi
    
    print_success "API keys collected successfully!"
}

update_env_file() {
    print_header "Step 2: Update .env File"
    
    check_env_file
    
    print_step "Updating RevenueCat keys in .env file..."
    
    # Backup existing .env
    cp "$ENV_FILE" "$ENV_FILE.backup"
    print_info "Backup created: .env.backup"
    
    # Update Production iOS key
    if grep -q "^REVENUECAT_IOS_KEY=" "$ENV_FILE"; then
        # Key exists, update it
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|^REVENUECAT_IOS_KEY=.*|REVENUECAT_IOS_KEY=$REVENUECAT_IOS_KEY|" "$ENV_FILE"
        else
            # Linux
            sed -i "s|^REVENUECAT_IOS_KEY=.*|REVENUECAT_IOS_KEY=$REVENUECAT_IOS_KEY|" "$ENV_FILE"
        fi
    else
        # Key doesn't exist, add it
        echo "REVENUECAT_IOS_KEY=$REVENUECAT_IOS_KEY" >> "$ENV_FILE"
    fi
    
    # Update Production Android key
    if grep -q "^REVENUECAT_ANDROID_KEY=" "$ENV_FILE"; then
        # Key exists, update it
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|^REVENUECAT_ANDROID_KEY=.*|REVENUECAT_ANDROID_KEY=$REVENUECAT_ANDROID_KEY|" "$ENV_FILE"
        else
            # Linux
            sed -i "s|^REVENUECAT_ANDROID_KEY=.*|REVENUECAT_ANDROID_KEY=$REVENUECAT_ANDROID_KEY|" "$ENV_FILE"
        fi
    else
        # Key doesn't exist, add it
        echo "REVENUECAT_ANDROID_KEY=$REVENUECAT_ANDROID_KEY" >> "$ENV_FILE"
    fi
    
    # Update Test keys if they were provided
    if [[ $SETUP_TEST_KEYS =~ ^[Yy]$ ]]; then
        print_step "Adding TEST/SANDBOX keys..."
        
        # Update Test iOS key
        if grep -q "^REVENUECAT_IOS_KEY_TEST=" "$ENV_FILE"; then
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s|^REVENUECAT_IOS_KEY_TEST=.*|REVENUECAT_IOS_KEY_TEST=$REVENUECAT_IOS_KEY_TEST|" "$ENV_FILE"
            else
                sed -i "s|^REVENUECAT_IOS_KEY_TEST=.*|REVENUECAT_IOS_KEY_TEST=$REVENUECAT_IOS_KEY_TEST|" "$ENV_FILE"
            fi
        else
            # Add after production keys
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "/^REVENUECAT_ANDROID_KEY=/a\\
REVENUECAT_IOS_KEY_TEST=$REVENUECAT_IOS_KEY_TEST
" "$ENV_FILE"
            else
                sed -i "/^REVENUECAT_ANDROID_KEY=/a\\REVENUECAT_IOS_KEY_TEST=$REVENUECAT_IOS_KEY_TEST" "$ENV_FILE"
            fi
        fi
        
        # Update Test Android key
        if grep -q "^REVENUECAT_ANDROID_KEY_TEST=" "$ENV_FILE"; then
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s|^REVENUECAT_ANDROID_KEY_TEST=.*|REVENUECAT_ANDROID_KEY_TEST=$REVENUECAT_ANDROID_KEY_TEST|" "$ENV_FILE"
            else
                sed -i "s|^REVENUECAT_ANDROID_KEY_TEST=.*|REVENUECAT_ANDROID_KEY_TEST=$REVENUECAT_ANDROID_KEY_TEST|" "$ENV_FILE"
            fi
        else
            # Add after test iOS key
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "/^REVENUECAT_IOS_KEY_TEST=/a\\
REVENUECAT_ANDROID_KEY_TEST=$REVENUECAT_ANDROID_KEY_TEST
" "$ENV_FILE"
            else
                sed -i "/^REVENUECAT_IOS_KEY_TEST=/a\\REVENUECAT_ANDROID_KEY_TEST=$REVENUECAT_ANDROID_KEY_TEST" "$ENV_FILE"
            fi
        fi
        
        print_success "Test keys added to .env"
    fi
    
    print_success ".env file updated successfully!"
}

verify_env_config() {
    print_header "Step 3: Verify Environment Configuration"
    
    print_step "Checking env.ts configuration..."
    
    if [ ! -f "$ENV_CONFIG_PATH" ]; then
        print_error "env.ts not found at: $ENV_CONFIG_PATH"
        exit 1
    fi
    
    # Check if REVENUECAT_IOS_KEY is imported
    if grep -q "REVENUECAT_IOS_KEY" "$ENV_CONFIG_PATH"; then
        print_success "REVENUECAT_IOS_KEY is imported in env.ts"
    else
        print_error "REVENUECAT_IOS_KEY is NOT imported in env.ts"
        exit 1
    fi
    
    # Check if REVENUECAT_ANDROID_KEY is imported
    if grep -q "REVENUECAT_ANDROID_KEY" "$ENV_CONFIG_PATH"; then
        print_success "REVENUECAT_ANDROID_KEY is imported in env.ts"
    else
        print_error "REVENUECAT_ANDROID_KEY is NOT imported in env.ts"
        exit 1
    fi
    
    # Check if keys are exported
    if grep -q "REVENUECAT_IOS_KEY: REVENUECAT_IOS_KEY" "$ENV_CONFIG_PATH"; then
        print_success "REVENUECAT_IOS_KEY is exported in env object"
    else
        print_error "REVENUECAT_IOS_KEY is NOT properly exported"
        exit 1
    fi
    
    if grep -q "REVENUECAT_ANDROID_KEY: REVENUECAT_ANDROID_KEY" "$ENV_CONFIG_PATH"; then
        print_success "REVENUECAT_ANDROID_KEY is exported in env object"
    else
        print_error "REVENUECAT_ANDROID_KEY is NOT properly exported"
        exit 1
    fi
}

verify_service_integration() {
    print_header "Step 4: Verify RevenueCat Service Integration"
    
    print_step "Checking RevenueCatService.ts..."
    
    if [ ! -f "$RC_SERVICE_PATH" ]; then
        print_error "RevenueCatService.ts not found at: $RC_SERVICE_PATH"
        exit 1
    fi
    
    # Check if service imports env
    if grep -q "from.*config/env" "$RC_SERVICE_PATH"; then
        print_success "Service imports env configuration"
    else
        print_error "Service does NOT import env configuration"
        exit 1
    fi
    
    # Check if service uses the keys
    if grep -q "env.REVENUECAT_IOS_KEY" "$RC_SERVICE_PATH"; then
        print_success "Service uses REVENUECAT_IOS_KEY from env"
    else
        print_error "Service does NOT use REVENUECAT_IOS_KEY"
        exit 1
    fi
    
    if grep -q "env.REVENUECAT_ANDROID_KEY" "$RC_SERVICE_PATH"; then
        print_success "Service uses REVENUECAT_ANDROID_KEY from env"
    else
        print_error "Service does NOT use REVENUECAT_ANDROID_KEY"
        exit 1
    fi
    
    # Check if service is properly initialized
    if grep -q "Purchases.configure" "$RC_SERVICE_PATH"; then
        print_success "Service has configure method"
    else
        print_error "Service does NOT have configure method"
        exit 1
    fi
}

enable_iap_capability() {
    print_header "Step 5: Enable In-App Purchase Capability in Xcode"
    
    print_step "Checking Xcode project configuration..."
    
    if [ ! -f "$XCODE_PROJECT_PATH" ]; then
        print_error "Xcode project file not found at: $XCODE_PROJECT_PATH"
        print_info "Please enable In-App Purchase capability manually in Xcode"
        return
    fi
    
    # Check if In-App Purchase capability is already enabled
    if grep -q "com.apple.InAppPurchase" "$XCODE_PROJECT_PATH"; then
        print_success "In-App Purchase capability is already enabled"
        return
    fi
    
    print_warning "In-App Purchase capability is NOT enabled in Xcode"
    echo ""
    echo -e "${CYAN}To enable In-App Purchase capability:${NC}"
    echo ""
    echo "   1. Open Xcode project:"
    if [ -n "$IOS_PROJECT_NAME" ]; then
        echo -e "      ${GREEN}open ios/$IOS_PROJECT_NAME.xcworkspace${NC}"
    else
        echo -e "      ${GREEN}open ios/YourProject.xcworkspace${NC}"
    fi
    echo ""
    echo "   2. Select your project in the navigator (left sidebar)"
    echo "   3. Select your app target"
    echo "   4. Go to 'Signing & Capabilities' tab"
    echo "   5. Click '+ Capability' button"
    echo "   6. Search for and add 'In-App Purchase'"
    echo "   7. Save the project (Cmd+S)"
    echo ""
    
    read -p "Press ENTER after you've enabled the capability in Xcode..." -r
    echo ""
    
    # Verify again
    if grep -q "com.apple.InAppPurchase" "$XCODE_PROJECT_PATH"; then
        print_success "In-App Purchase capability is now enabled!"
    else
        print_warning "Could not verify if capability was enabled. Please check manually."
        print_info "The capability must be enabled for iOS in-app purchases to work."
    fi
}

create_test_script() {
    print_header "Step 6: Create Verification Test Script"
    
    print_step "Creating test-revenuecat.js..."
    
    cat > "$PROJECT_ROOT/test-revenuecat.js" << 'EOF'
/**
 * RevenueCat Configuration Test
 * Run this with: node test-revenuecat.js
 */

require('dotenv').config();

console.log('\n========================================');
console.log('RevenueCat Configuration Test');
console.log('========================================\n');

let hasErrors = false;
let hasWarnings = false;

// Test 1: Check if .env file has the production keys
console.log('📋 Test 1: Checking production keys in .env...');
const iosKey = process.env.REVENUECAT_IOS_KEY;
const androidKey = process.env.REVENUECAT_ANDROID_KEY;

if (!iosKey || iosKey.trim() === '') {
    console.log('❌ REVENUECAT_IOS_KEY is missing or empty in .env');
    hasErrors = true;
} else {
    console.log('✅ REVENUECAT_IOS_KEY is set:', iosKey.substring(0, 10) + '...');
}

if (!androidKey || androidKey.trim() === '') {
    console.log('❌ REVENUECAT_ANDROID_KEY is missing or empty in .env');
    hasErrors = true;
} else {
    console.log('✅ REVENUECAT_ANDROID_KEY is set:', androidKey.substring(0, 10) + '...');
}

// Test 1b: Check test/sandbox keys (optional)
console.log('\n📋 Test 1b: Checking test/sandbox keys (optional)...');
const iosTestKey = process.env.REVENUECAT_IOS_KEY_TEST;
const androidTestKey = process.env.REVENUECAT_ANDROID_KEY_TEST;

if (!iosTestKey || iosTestKey.trim() === '') {
    console.log('⚠️  REVENUECAT_IOS_KEY_TEST is not set (optional for development)');
    hasWarnings = true;
} else {
    console.log('✅ REVENUECAT_IOS_KEY_TEST is set:', iosTestKey.substring(0, 10) + '...');
}

if (!androidTestKey || androidTestKey.trim() === '') {
    console.log('⚠️  REVENUECAT_ANDROID_KEY_TEST is not set (optional for development)');
    hasWarnings = true;
} else {
    console.log('✅ REVENUECAT_ANDROID_KEY_TEST is set:', androidTestKey.substring(0, 10) + '...');
}

// Test 2: Validate key formats
console.log('\n📋 Test 2: Validating production key formats...');
if (iosKey && !iosKey.startsWith('appl_')) {
    console.log('⚠️  iOS key should typically start with "appl_"');
    hasWarnings = true;
} else if (iosKey) {
    console.log('✅ iOS key format looks correct');
}

if (androidKey && !androidKey.startsWith('goog_')) {
    console.log('⚠️  Android key should typically start with "goog_"');
    hasWarnings = true;
} else if (androidKey) {
    console.log('✅ Android key format looks correct');
}

// Test 2b: Validate test key formats
if (iosTestKey || androidTestKey) {
    console.log('\n📋 Test 2b: Validating test key formats...');
    if (iosTestKey && !iosTestKey.startsWith('appl_')) {
        console.log('⚠️  iOS test key should typically start with "appl_"');
        hasWarnings = true;
    } else if (iosTestKey) {
        console.log('✅ iOS test key format looks correct');
    }

    if (androidTestKey && !androidTestKey.startsWith('goog_')) {
        console.log('⚠️  Android test key should typically start with "goog_"');
        hasWarnings = true;
    } else if (androidTestKey) {
        console.log('✅ Android test key format looks correct');
    }
}

// Test 3: Check if keys are different
console.log('\n📋 Test 3: Checking if keys are unique...');
if (iosKey === androidKey) {
    console.log('❌ iOS and Android production keys are the same! They should be different.');
    hasErrors = true;
} else {
    console.log('✅ iOS and Android production keys are different');
}

if (iosTestKey && androidTestKey && iosTestKey === androidTestKey) {
    console.log('⚠️  iOS and Android test keys are the same! They should be different.');
    hasWarnings = true;
} else if (iosTestKey && androidTestKey) {
    console.log('✅ iOS and Android test keys are different');
}

// Test 4: Check production and test keys are different
if (iosKey && iosTestKey && iosKey === iosTestKey) {
    console.log('⚠️  iOS production and test keys are the same! Consider using different keys.');
    hasWarnings = true;
} else if (iosKey && iosTestKey) {
    console.log('✅ iOS production and test keys are different');
}

if (androidKey && androidTestKey && androidKey === androidTestKey) {
    console.log('⚠️  Android production and test keys are the same! Consider using different keys.');
    hasWarnings = true;
} else if (androidKey && androidTestKey) {
    console.log('✅ Android production and test keys are different');
}

// Test 5: Check key length
console.log('\n📋 Test 5: Checking key lengths...');
if (iosKey && iosKey.length < 20) {
    console.log('⚠️  iOS production key seems too short');
    hasWarnings = true;
} else if (iosKey) {
    console.log('✅ iOS production key length looks good');
}

if (androidKey && androidKey.length < 20) {
    console.log('⚠️  Android production key seems too short');
    hasWarnings = true;
} else if (androidKey) {
    console.log('✅ Android production key length looks good');
}

if (iosTestKey && iosTestKey.length < 20) {
    console.log('⚠️  iOS test key seems too short');
    hasWarnings = true;
} else if (iosTestKey) {
    console.log('✅ iOS test key length looks good');
}

if (androidTestKey && androidTestKey.length < 20) {
    console.log('⚠️  Android test key seems too short');
    hasWarnings = true;
} else if (androidTestKey) {
    console.log('✅ Android test key length looks good');
}

// Summary
console.log('\n========================================');
if (hasErrors) {
    console.log('❌ Configuration has errors!');
    console.log('Please fix the issues above and run this test again.');
    process.exit(1);
} else if (hasWarnings) {
    console.log('⚠️  All critical tests passed, but there are warnings.');
    console.log('Your RevenueCat configuration should work, but review the warnings above.');
    console.log('\nNext steps:');
    console.log('1. Review warnings and consider fixing them');
    console.log('2. Clean and rebuild your project');
    console.log('3. Run on a simulator/device');
    console.log('4. Check console logs for: [RevenueCat] Initialized successfully');
} else {
    console.log('✅ All tests passed!');
    console.log('Your RevenueCat configuration looks perfect.');
    console.log('\nNext steps:');
    console.log('1. Clean and rebuild your project');
    console.log('2. Run on a simulator/device');
    console.log('3. Check console logs for: [RevenueCat] Initialized successfully');
}
console.log('========================================\n');
EOF
    
    chmod +x "$PROJECT_ROOT/test-revenuecat.js"
    print_success "Test script created: test-revenuecat.js"
}

run_verification_test() {
    print_header "Step 7: Run Verification Test"
    
    print_step "Running configuration test..."
    echo ""
    
    if command -v node &> /dev/null; then
        node "$PROJECT_ROOT/test-revenuecat.js"
    else
        print_warning "Node.js not found. Please install Node.js to run the test."
    fi
}

print_final_instructions() {
    print_header "Setup Complete! 🎉"
    
    echo -e "${GREEN}RevenueCat has been configured successfully!${NC}"
    echo ""
    echo -e "${CYAN}What was configured:${NC}"
    echo "  ✅ RevenueCat production API keys added to .env"
    if [[ $SETUP_TEST_KEYS =~ ^[Yy]$ ]]; then
        echo "  ✅ RevenueCat test/sandbox API keys added to .env"
    fi
    echo "  ✅ Environment configuration verified"
    echo "  ✅ Service integration verified"
    echo "  ✅ In-App Purchase capability check performed"
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
    echo "  3. Verify In-App Purchase capability is enabled:"
    if [ -n "$IOS_PROJECT_NAME" ]; then
        echo -e "     ${GREEN}open ios/$IOS_PROJECT_NAME.xcworkspace${NC}"
    else
        echo -e "     ${GREEN}open ios/YourProject.xcworkspace${NC}"
    fi
    echo "     (Check Signing & Capabilities tab)"
    echo ""
    echo "  4. Run the app and check logs:"
    echo -e "     ${GREEN}yarn ios${NC} or ${GREEN}yarn android${NC}"
    echo "     Look for: ${CYAN}[RevenueCat] Initialized successfully${NC}"
    echo ""
    echo "  5. Test the configuration:"
    echo -e "     ${GREEN}node test-revenuecat.js${NC}"
    echo ""
    if [[ $SETUP_TEST_KEYS =~ ^[Yy]$ ]]; then
        echo -e "${CYAN}Using Test Keys in Development:${NC}"
        echo "  • Use REVENUECAT_IOS_KEY_TEST and REVENUECAT_ANDROID_KEY_TEST"
        echo "  • Update your code to switch keys based on environment"
        echo "  • Example: __DEV__ ? env.REVENUECAT_IOS_KEY_TEST : env.REVENUECAT_IOS_KEY"
        echo ""
    fi
    echo -e "${CYAN}Testing In-App Purchases:${NC}"
    echo "  • iOS: Use TestFlight or Sandbox tester account"
    echo "  • Android: Use Internal Testing track or License Testing"
    if [[ $SETUP_TEST_KEYS =~ ^[Yy]$ ]]; then
        echo "  • Test keys are useful for separate sandbox environments"
    fi
    echo ""
    echo -e "${CYAN}Helpful Resources:${NC}"
    echo "  • RevenueCat Dashboard: https://app.revenuecat.com/"
    echo "  • Documentation: https://docs.revenuecat.com/"
    echo "  • Testing Guide: ./REVENUECAT_SIMULATOR_TESTING.md"
    echo ""
    echo -e "${YELLOW}⚠️  Important Reminders:${NC}"
    echo "  • Never commit .env file to version control"
    echo "  • Keep your API keys secret"
    echo "  • Set up products in RevenueCat Dashboard"
    echo "  • Configure App Store Connect / Google Play Console"
    if [[ $SETUP_TEST_KEYS =~ ^[Yy]$ ]]; then
        echo "  • Use test keys in development, production keys in release builds"
    fi
    echo ""
    print_success "You're all set! Happy coding! 🚀"
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    clear
    
    print_header "RevenueCat Setup Script"
    
    echo -e "${CYAN}This script will help you configure RevenueCat for your React Native app.${NC}"
    echo ""
    echo -e "${YELLOW}What this script does:${NC}"
    echo "  • Collects your RevenueCat API keys"
    echo "  • Updates .env file automatically"
    echo "  • Verifies the configuration is correct"
    echo "  • Helps enable In-App Purchase capability in Xcode"
    echo "  • Creates a test script to verify everything works"
    echo ""
    
    read -p "Ready to begin? (y/n): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Setup cancelled."
        exit 0
    fi
    
    # Run setup steps
    collect_api_keys
    update_env_file
    verify_env_config
    verify_service_integration
    enable_iap_capability
    create_test_script
    run_verification_test
    print_final_instructions
}

# Run main function
main

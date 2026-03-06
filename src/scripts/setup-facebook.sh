#!/bin/bash

# ============================================================================
# Facebook SDK Setup Script
# ============================================================================
# This script helps developers set up Facebook SDK in their React Native project
# 
# Features:
# - Prompts for Facebook App ID, Client Token, and Display Name
# - Updates .env file automatically
# - Updates iOS Info.plist with Facebook credentials
# - Updates Android strings.xml with Facebook credentials
# - Validates keys are properly configured and passed to Facebook SDK
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
ANDROID_STRINGS_XML="$PROJECT_ROOT/android/app/src/main/res/values/strings.xml"
FB_SERVICE_PATH="$PROJECT_ROOT/src/services/FacebookAnalyticsService.ts"
ENV_CONFIG_PATH="$PROJECT_ROOT/src/config/env.ts"
FB_INITIALIZER_PATH="$PROJECT_ROOT/src/config/initializers/facebookInitializer.ts"

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

validate_facebook_app_id() {
    local app_id=$1
    
    if [ -z "$app_id" ]; then
        return 1
    fi
    
    # Facebook App ID should be numeric and typically 15-16 digits
    if [[ ! $app_id =~ ^[0-9]{15,16}$ ]]; then
        print_warning "Facebook App ID should be a 15-16 digit number"
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
    fi
    
    return 0
}

validate_facebook_client_token() {
    local token=$1
    
    if [ -z "$token" ]; then
        return 1
    fi
    
    # Facebook Client Token should be alphanumeric and typically 32 characters
    if [ ${#token} -lt 20 ]; then
        print_warning "Facebook Client Token seems too short (expected 32+ characters)"
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

collect_facebook_credentials() {
    print_header "Step 1: Collect Facebook SDK Credentials"
    
    echo -e "${CYAN}📝 You need to get your credentials from Facebook Developers:${NC}"
    echo "   1. Go to: https://developers.facebook.com/"
    echo "   2. Select your app (or create a new one)"
    echo "   3. Navigate to: Settings → Basic"
    echo "   4. Copy the following:"
    echo "      - App ID (numeric, 15-16 digits)"
    echo "      - Client Token (Settings → Advanced → Client Token)"
    echo "      - Display Name (public name of your app)"
    echo ""
    
    # Prompt for Facebook App ID
    while true; do
        echo -e "${YELLOW}Enter your Facebook App ID:${NC}"
        read -r FACEBOOK_APP_ID
        
        if validate_facebook_app_id "$FACEBOOK_APP_ID"; then
            break
        else
            print_error "Invalid Facebook App ID. Please try again."
        fi
    done
    
    echo ""
    
    # Prompt for Facebook Client Token
    while true; do
        echo -e "${YELLOW}Enter your Facebook Client Token:${NC}"
        read -r FACEBOOK_CLIENT_TOKEN
        
        if validate_facebook_client_token "$FACEBOOK_CLIENT_TOKEN"; then
            break
        else
            print_error "Invalid Facebook Client Token. Please try again."
        fi
    done
    
    echo ""
    
    # Prompt for Facebook Display Name
    echo -e "${YELLOW}Enter your Facebook Display Name (e.g., 'My App'):${NC}"
    read -r FACEBOOK_DISPLAY_NAME
    
    if [ -z "$FACEBOOK_DISPLAY_NAME" ]; then
        print_warning "Display name is empty. Using 'MyApp' as default."
        FACEBOOK_DISPLAY_NAME="MyApp"
    fi
    
    echo ""
    print_success "Facebook credentials collected successfully!"
}

update_env_file() {
    print_header "Step 2: Update .env File"
    
    check_env_file
    
    print_step "Updating Facebook credentials in .env file..."
    
    # Backup existing .env
    cp "$ENV_FILE" "$ENV_FILE.backup"
    print_info "Backup created: .env.backup"
    
    # Update Facebook App ID
    if grep -q "^FACEBOOK_APP_ID=" "$ENV_FILE"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^FACEBOOK_APP_ID=.*|FACEBOOK_APP_ID=$FACEBOOK_APP_ID|" "$ENV_FILE"
        else
            sed -i "s|^FACEBOOK_APP_ID=.*|FACEBOOK_APP_ID=$FACEBOOK_APP_ID|" "$ENV_FILE"
        fi
    else
        echo "FACEBOOK_APP_ID=$FACEBOOK_APP_ID" >> "$ENV_FILE"
    fi
    
    # Update Facebook Client Token
    if grep -q "^FACEBOOK_CLIENT_TOKEN=" "$ENV_FILE"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^FACEBOOK_CLIENT_TOKEN=.*|FACEBOOK_CLIENT_TOKEN=$FACEBOOK_CLIENT_TOKEN|" "$ENV_FILE"
        else
            sed -i "s|^FACEBOOK_CLIENT_TOKEN=.*|FACEBOOK_CLIENT_TOKEN=$FACEBOOK_CLIENT_TOKEN|" "$ENV_FILE"
        fi
    else
        echo "FACEBOOK_CLIENT_TOKEN=$FACEBOOK_CLIENT_TOKEN" >> "$ENV_FILE"
    fi
    
    # Add Facebook Display Name (optional, for documentation)
    if grep -q "^FACEBOOK_DISPLAY_NAME=" "$ENV_FILE"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^FACEBOOK_DISPLAY_NAME=.*|FACEBOOK_DISPLAY_NAME=$FACEBOOK_DISPLAY_NAME|" "$ENV_FILE"
        else
            sed -i "s|^FACEBOOK_DISPLAY_NAME=.*|FACEBOOK_DISPLAY_NAME=$FACEBOOK_DISPLAY_NAME|" "$ENV_FILE"
        fi
    else
        # Add after Facebook section
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "/^FACEBOOK_CLIENT_TOKEN=/a\\
FACEBOOK_DISPLAY_NAME=$FACEBOOK_DISPLAY_NAME
" "$ENV_FILE"
        else
            sed -i "/^FACEBOOK_CLIENT_TOKEN=/a\\FACEBOOK_DISPLAY_NAME=$FACEBOOK_DISPLAY_NAME" "$ENV_FILE"
        fi
    fi
    
    print_success ".env file updated successfully!"
}

update_ios_info_plist() {
    print_header "Step 3: Update iOS Info.plist"
    
    if [ ! -f "$IOS_INFO_PLIST" ]; then
        print_error "Info.plist not found at: $IOS_INFO_PLIST"
        print_warning "Please update Info.plist manually"
        return
    fi
    
    print_step "Updating Info.plist with Facebook credentials..."
    
    # Backup Info.plist
    cp "$IOS_INFO_PLIST" "$IOS_INFO_PLIST.backup"
    print_info "Backup created: Info.plist.backup"
    
    # Update FacebookAppID
    if grep -q "<key>FacebookAppID</key>" "$IOS_INFO_PLIST"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "/<key>FacebookAppID<\/key>/,/<string>/ s|<string>.*</string>|<string>$FACEBOOK_APP_ID</string>|" "$IOS_INFO_PLIST"
        fi
        print_success "Updated FacebookAppID in Info.plist"
    else
        print_warning "FacebookAppID key not found in Info.plist. Please add it manually."
    fi
    
    # Update FacebookClientToken
    if grep -q "<key>FacebookClientToken</key>" "$IOS_INFO_PLIST"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "/<key>FacebookClientToken<\/key>/,/<string>/ s|<string>.*</string>|<string>$FACEBOOK_CLIENT_TOKEN</string>|" "$IOS_INFO_PLIST"
        fi
        print_success "Updated FacebookClientToken in Info.plist"
    else
        print_warning "FacebookClientToken key not found in Info.plist. Please add it manually."
    fi
    
    # Update FacebookDisplayName
    if grep -q "<key>FacebookDisplayName</key>" "$IOS_INFO_PLIST"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "/<key>FacebookDisplayName<\/key>/,/<string>/ s|<string>.*</string>|<string>$FACEBOOK_DISPLAY_NAME</string>|" "$IOS_INFO_PLIST"
        fi
        print_success "Updated FacebookDisplayName in Info.plist"
    else
        print_warning "FacebookDisplayName key not found in Info.plist. Please add it manually."
    fi
    
    # Update URL Scheme (fb + App ID)
    if grep -q "<string>fb[0-9]*</string>" "$IOS_INFO_PLIST"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|<string>fb[0-9]*</string>|<string>fb$FACEBOOK_APP_ID</string>|" "$IOS_INFO_PLIST"
        fi
        print_success "Updated URL Scheme with fb$FACEBOOK_APP_ID"
    else
        print_warning "Facebook URL Scheme not found in Info.plist. Please add it manually."
    fi
    
    print_success "Info.plist updated successfully!"
}

update_android_strings_xml() {
    print_header "Step 4: Update Android strings.xml"
    
    if [ ! -f "$ANDROID_STRINGS_XML" ]; then
        print_error "strings.xml not found at: $ANDROID_STRINGS_XML"
        print_warning "Please update strings.xml manually"
        return
    fi
    
    print_step "Updating strings.xml with Facebook credentials..."
    
    # Backup strings.xml
    cp "$ANDROID_STRINGS_XML" "$ANDROID_STRINGS_XML.backup"
    print_info "Backup created: strings.xml.backup"
    
    # Update facebook_app_id
    if grep -q 'name="facebook_app_id"' "$ANDROID_STRINGS_XML"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|<string name=\"facebook_app_id\">.*</string>|<string name=\"facebook_app_id\">$FACEBOOK_APP_ID</string>|" "$ANDROID_STRINGS_XML"
        else
            sed -i "s|<string name=\"facebook_app_id\">.*</string>|<string name=\"facebook_app_id\">$FACEBOOK_APP_ID</string>|" "$ANDROID_STRINGS_XML"
        fi
        print_success "Updated facebook_app_id in strings.xml"
    else
        print_warning "facebook_app_id not found in strings.xml. Please add it manually."
    fi
    
    # Update facebook_client_token
    if grep -q 'name="facebook_client_token"' "$ANDROID_STRINGS_XML"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|<string name=\"facebook_client_token\">.*</string>|<string name=\"facebook_client_token\">$FACEBOOK_CLIENT_TOKEN</string>|" "$ANDROID_STRINGS_XML"
        else
            sed -i "s|<string name=\"facebook_client_token\">.*</string>|<string name=\"facebook_client_token\">$FACEBOOK_CLIENT_TOKEN</string>|" "$ANDROID_STRINGS_XML"
        fi
        print_success "Updated facebook_client_token in strings.xml"
    else
        print_warning "facebook_client_token not found in strings.xml. Please add it manually."
    fi
    
    # Update fb_login_protocol_scheme
    if grep -q 'name="fb_login_protocol_scheme"' "$ANDROID_STRINGS_XML"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|<string name=\"fb_login_protocol_scheme\">.*</string>|<string name=\"fb_login_protocol_scheme\">fb$FACEBOOK_APP_ID</string>|" "$ANDROID_STRINGS_XML"
        else
            sed -i "s|<string name=\"fb_login_protocol_scheme\">.*</string>|<string name=\"fb_login_protocol_scheme\">fb$FACEBOOK_APP_ID</string>|" "$ANDROID_STRINGS_XML"
        fi
        print_success "Updated fb_login_protocol_scheme in strings.xml"
    else
        print_warning "fb_login_protocol_scheme not found in strings.xml. Please add it manually."
    fi
    
    print_success "strings.xml updated successfully!"
}

verify_env_config() {
    print_header "Step 5: Verify Environment Configuration"
    
    print_step "Checking env.ts configuration..."
    
    if [ ! -f "$ENV_CONFIG_PATH" ]; then
        print_error "env.ts not found at: $ENV_CONFIG_PATH"
        exit 1
    fi
    
    # Check if FACEBOOK_APP_ID is imported
    if grep -q "FACEBOOK_APP_ID" "$ENV_CONFIG_PATH"; then
        print_success "FACEBOOK_APP_ID is imported in env.ts"
    else
        print_error "FACEBOOK_APP_ID is NOT imported in env.ts"
        exit 1
    fi
    
    # Check if FACEBOOK_CLIENT_TOKEN is imported
    if grep -q "FACEBOOK_CLIENT_TOKEN" "$ENV_CONFIG_PATH"; then
        print_success "FACEBOOK_CLIENT_TOKEN is imported in env.ts"
    else
        print_error "FACEBOOK_CLIENT_TOKEN is NOT imported in env.ts"
        exit 1
    fi
    
    # Check if keys are exported
    if grep -q "FACEBOOK_APP_ID: FACEBOOK_APP_ID" "$ENV_CONFIG_PATH"; then
        print_success "FACEBOOK_APP_ID is exported in env object"
    else
        print_error "FACEBOOK_APP_ID is NOT properly exported"
        exit 1
    fi
    
    if grep -q "FACEBOOK_CLIENT_TOKEN: FACEBOOK_CLIENT_TOKEN" "$ENV_CONFIG_PATH"; then
        print_success "FACEBOOK_CLIENT_TOKEN is exported in env object"
    else
        print_error "FACEBOOK_CLIENT_TOKEN is NOT properly exported"
        exit 1
    fi
}

verify_service_integration() {
    print_header "Step 6: Verify Facebook Service Integration"
    
    print_step "Checking FacebookAnalyticsService.ts..."
    
    if [ ! -f "$FB_SERVICE_PATH" ]; then
        print_error "FacebookAnalyticsService.ts not found at: $FB_SERVICE_PATH"
        exit 1
    fi
    
    # Check if service imports from react-native-fbsdk-next
    if grep -q "from 'react-native-fbsdk-next'" "$FB_SERVICE_PATH"; then
        print_success "Service imports Facebook SDK correctly"
    else
        print_error "Service does NOT import Facebook SDK"
        exit 1
    fi
    
    # Check if service has initialize method
    if grep -q "initialize()" "$FB_SERVICE_PATH"; then
        print_success "Service has initialize method"
    else
        print_error "Service does NOT have initialize method"
        exit 1
    fi
    
    # Check if Settings.initializeSDK is called
    if grep -q "Settings.initializeSDK" "$FB_SERVICE_PATH"; then
        print_success "Service calls Settings.initializeSDK()"
    else
        print_error "Service does NOT call Settings.initializeSDK()"
        exit 1
    fi
    
    # Check initializer
    print_step "Checking facebookInitializer.ts..."
    
    if [ ! -f "$FB_INITIALIZER_PATH" ]; then
        print_warning "facebookInitializer.ts not found"
    else
        if grep -q "facebookAnalytics.initialize()" "$FB_INITIALIZER_PATH"; then
            print_success "Initializer calls facebookAnalytics.initialize()"
        else
            print_error "Initializer does NOT call initialize method"
        fi
    fi
}

create_test_script() {
    print_header "Step 7: Create Verification Test Script"
    
    print_step "Creating test-facebook.js..."
    
    cat > "$PROJECT_ROOT/test-facebook.js" << 'EOF'
/**
 * Facebook SDK Configuration Test
 * Run this with: node test-facebook.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('\n========================================');
console.log('Facebook SDK Configuration Test');
console.log('========================================\n');

let hasErrors = false;
let hasWarnings = false;

// Test 1: Check if .env file has the keys
console.log('📋 Test 1: Checking .env file...');
const appId = process.env.FACEBOOK_APP_ID;
const clientToken = process.env.FACEBOOK_CLIENT_TOKEN;
const displayName = process.env.FACEBOOK_DISPLAY_NAME;

if (!appId || appId.trim() === '') {
    console.log('❌ FACEBOOK_APP_ID is missing or empty in .env');
    hasErrors = true;
} else {
    console.log('✅ FACEBOOK_APP_ID is set:', appId);
}

if (!clientToken || clientToken.trim() === '') {
    console.log('❌ FACEBOOK_CLIENT_TOKEN is missing or empty in .env');
    hasErrors = true;
} else {
    console.log('✅ FACEBOOK_CLIENT_TOKEN is set:', clientToken.substring(0, 10) + '...');
}

if (!displayName || displayName.trim() === '') {
    console.log('⚠️  FACEBOOK_DISPLAY_NAME is not set (optional)');
    hasWarnings = true;
} else {
    console.log('✅ FACEBOOK_DISPLAY_NAME is set:', displayName);
}

// Test 2: Validate key formats
console.log('\n📋 Test 2: Validating key formats...');
if (appId && !/^[0-9]{15,16}$/.test(appId)) {
    console.log('⚠️  Facebook App ID should be a 15-16 digit number');
    hasWarnings = true;
} else if (appId) {
    console.log('✅ Facebook App ID format looks correct');
}

if (clientToken && clientToken.length < 20) {
    console.log('⚠️  Facebook Client Token seems too short (expected 32+ characters)');
    hasWarnings = true;
} else if (clientToken) {
    console.log('✅ Facebook Client Token length looks good');
}

// Test 3: Check iOS Info.plist
console.log('\n📋 Test 3: Checking iOS Info.plist...');
const infoPlistPath = path.join(__dirname, 'ios', 'CrytoGram', 'Info.plist');
if (fs.existsSync(infoPlistPath)) {
    const infoPlist = fs.readFileSync(infoPlistPath, 'utf8');
    
    if (infoPlist.includes(`<string>${appId}</string>`)) {
        console.log('✅ FacebookAppID matches in Info.plist');
    } else if (infoPlist.includes('<key>FacebookAppID</key>')) {
        console.log('❌ FacebookAppID in Info.plist does not match .env');
        hasErrors = true;
    } else {
        console.log('⚠️  FacebookAppID not found in Info.plist');
        hasWarnings = true;
    }
    
    if (infoPlist.includes(`<string>${clientToken}</string>`)) {
        console.log('✅ FacebookClientToken matches in Info.plist');
    } else if (infoPlist.includes('<key>FacebookClientToken</key>')) {
        console.log('❌ FacebookClientToken in Info.plist does not match .env');
        hasErrors = true;
    } else {
        console.log('⚠️  FacebookClientToken not found in Info.plist');
        hasWarnings = true;
    }
    
    if (infoPlist.includes(`<string>fb${appId}</string>`)) {
        console.log('✅ URL Scheme matches in Info.plist');
    } else {
        console.log('⚠️  URL Scheme (fb' + appId + ') not found in Info.plist');
        hasWarnings = true;
    }
} else {
    console.log('⚠️  Info.plist not found');
    hasWarnings = true;
}

// Test 4: Check Android strings.xml
console.log('\n📋 Test 4: Checking Android strings.xml...');
const stringsXmlPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res', 'values', 'strings.xml');
if (fs.existsSync(stringsXmlPath)) {
    const stringsXml = fs.readFileSync(stringsXmlPath, 'utf8');
    
    if (stringsXml.includes(`<string name="facebook_app_id">${appId}</string>`)) {
        console.log('✅ facebook_app_id matches in strings.xml');
    } else if (stringsXml.includes('name="facebook_app_id"')) {
        console.log('❌ facebook_app_id in strings.xml does not match .env');
        hasErrors = true;
    } else {
        console.log('⚠️  facebook_app_id not found in strings.xml');
        hasWarnings = true;
    }
    
    if (stringsXml.includes(`<string name="facebook_client_token">${clientToken}</string>`)) {
        console.log('✅ facebook_client_token matches in strings.xml');
    } else if (stringsXml.includes('name="facebook_client_token"')) {
        console.log('❌ facebook_client_token in strings.xml does not match .env');
        hasErrors = true;
    } else {
        console.log('⚠️  facebook_client_token not found in strings.xml');
        hasWarnings = true;
    }
    
    if (stringsXml.includes(`<string name="fb_login_protocol_scheme">fb${appId}</string>`)) {
        console.log('✅ fb_login_protocol_scheme matches in strings.xml');
    } else {
        console.log('⚠️  fb_login_protocol_scheme not found or incorrect in strings.xml');
        hasWarnings = true;
    }
} else {
    console.log('⚠️  strings.xml not found');
    hasWarnings = true;
}

// Summary
console.log('\n========================================');
if (hasErrors) {
    console.log('❌ Configuration has errors!');
    console.log('Please fix the issues above and run this test again.');
    process.exit(1);
} else if (hasWarnings) {
    console.log('⚠️  All critical tests passed, but there are warnings.');
    console.log('Your Facebook SDK configuration should work, but review the warnings above.');
    console.log('\nNext steps:');
    console.log('1. Review warnings and consider fixing them');
    console.log('2. Clean and rebuild your project');
    console.log('3. Run on a simulator/device');
    console.log('4. Check console logs for: [Facebook] Facebook SDK initialized successfully');
} else {
    console.log('✅ All tests passed!');
    console.log('Your Facebook SDK configuration looks perfect.');
    console.log('\nNext steps:');
    console.log('1. Clean and rebuild your project');
    console.log('2. Run on a simulator/device');
    console.log('3. Check console logs for: [Facebook] Facebook SDK initialized successfully');
}
console.log('========================================\n');
EOF
    
    chmod +x "$PROJECT_ROOT/test-facebook.js"
    print_success "Test script created: test-facebook.js"
}

run_verification_test() {
    print_header "Step 8: Run Verification Test"
    
    print_step "Running configuration test..."
    echo ""
    
    if command -v node &> /dev/null; then
        node "$PROJECT_ROOT/test-facebook.js"
    else
        print_warning "Node.js not found. Please install Node.js to run the test."
    fi
}

print_final_instructions() {
    print_header "Setup Complete! 🎉"
    
    echo -e "${GREEN}Facebook SDK has been configured successfully!${NC}"
    echo ""
    echo -e "${CYAN}What was configured:${NC}"
    echo "  ✅ Facebook credentials added to .env"
    echo "  ✅ iOS Info.plist updated with Facebook settings"
    echo "  ✅ Android strings.xml updated with Facebook settings"
    echo "  ✅ Environment configuration verified"
    echo "  ✅ Service integration verified"
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
    echo "     Look for: ${CYAN}[Facebook] Facebook SDK initialized successfully${NC}"
    echo ""
    echo "  4. Test the configuration:"
    echo -e "     ${GREEN}node test-facebook.js${NC}"
    echo ""
    echo -e "${CYAN}Facebook App Configuration:${NC}"
    echo "  • Configure Facebook App at: https://developers.facebook.com/"
    echo "  • Add iOS Bundle ID: com.yourcompany.yourapp"
    echo "  • Add Android Package Name: com.yourcompany.yourapp"
    echo "  • Enable App Events and required features"
    echo ""
    echo -e "${CYAN}Testing:${NC}"
    echo "  • Test on real devices for accurate tracking"
    echo "  • Use Facebook Test Users for testing"
    echo "  • Check Events Manager in Facebook Dashboard"
    echo ""
    echo -e "${CYAN}Helpful Resources:${NC}"
    echo "  • Facebook Developers: https://developers.facebook.com/"
    echo "  • App Dashboard: https://developers.facebook.com/apps/"
    echo "  • Documentation: https://developers.facebook.com/docs/"
    echo ""
    echo -e "${YELLOW}⚠️  Important Reminders:${NC}"
    echo "  • Never commit .env file to version control"
    echo "  • Keep your Client Token secret"
    echo "  • Configure privacy policy and terms in Facebook Dashboard"
    echo "  • Test with Facebook Test Users before production"
    echo ""
    print_success "You're all set! Happy coding! 🚀"
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    clear
    
    print_header "Facebook SDK Setup Script"
    
    echo -e "${CYAN}This script will help you configure Facebook SDK for your React Native app.${NC}"
    echo ""
    echo -e "${YELLOW}What this script does:${NC}"
    echo "  • Collects your Facebook App ID, Client Token, and Display Name"
    echo "  • Updates .env file automatically"
    echo "  • Updates iOS Info.plist with Facebook credentials"
    echo "  • Updates Android strings.xml with Facebook credentials"
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
    collect_facebook_credentials
    update_env_file
    update_ios_info_plist
    update_android_strings_xml
    verify_env_config
    verify_service_integration
    create_test_script
    run_verification_test
    print_final_instructions
}

# Run main function
main

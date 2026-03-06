#!/bin/bash

# ============================================================================
# Usercentrics (User-Centric) Setup Script
# ============================================================================
# This script helps developers set up Usercentrics CMP in their React Native project
# 
# Features:
# - Prompts for Usercentrics Settings ID (ruleSetId)
# - Updates .env file automatically
# - Updates env.ts to import and export the Settings ID
# - Updates App.tsx to use the Settings ID from env
# - Validates the Settings ID is properly configured
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
ENV_CONFIG_PATH="$PROJECT_ROOT/src/config/env.ts"
USER_CENTRIC_UTIL="$PROJECT_ROOT/src/utils/userCentric.tsx"
APP_TSX="$PROJECT_ROOT/App.tsx"

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

validate_settings_id() {
    local settings_id=$1
    
    if [ -z "$settings_id" ]; then
        return 1
    fi
    
    # Usercentrics Settings ID is typically alphanumeric, 14+ characters
    if [ ${#settings_id} -lt 10 ]; then
        print_warning "Settings ID seems too short (expected 14+ characters)"
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

collect_settings_id() {
    print_header "Step 1: Collect Usercentrics Settings ID"
    
    echo -e "${CYAN}📝 You need to get your Settings ID from Usercentrics Admin Interface:${NC}"
    echo "   1. Go to: https://admin.usercentrics.com/"
    echo "   2. Log in to your account"
    echo "   3. Select your configuration"
    echo "   4. Navigate to: Implementation → Settings"
    echo "   5. Copy your Settings ID (also called ruleSetId)"
    echo "      Format: alphanumeric string, typically 14-16 characters"
    echo ""
    echo -e "${MAGENTA}Example: 8IUuz2vdeMsjUu${NC}"
    echo ""
    
    # Prompt for Settings ID
    while true; do
        echo -e "${YELLOW}Enter your Usercentrics Settings ID (ruleSetId):${NC}"
        read -r USERCENTRICS_SETTINGS_ID
        
        if validate_settings_id "$USERCENTRICS_SETTINGS_ID"; then
            break
        else
            print_error "Invalid Settings ID. Please try again."
        fi
    done
    
    echo ""
    print_success "Settings ID collected successfully!"
}

update_env_file() {
    print_header "Step 2: Update .env File"
    
    check_env_file
    
    print_step "Updating Usercentrics Settings ID in .env file..."
    
    # Backup existing .env
    cp "$ENV_FILE" "$ENV_FILE.backup"
    print_info "Backup created: .env.backup"
    
    # Update or add USER_CENTRIC
    if grep -q "^USER_CENTRIC=" "$ENV_FILE"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^USER_CENTRIC=.*|USER_CENTRIC=$USERCENTRICS_SETTINGS_ID|" "$ENV_FILE"
        else
            sed -i "s|^USER_CENTRIC=.*|USER_CENTRIC=$USERCENTRICS_SETTINGS_ID|" "$ENV_FILE"
        fi
        print_success "Updated USER_CENTRIC in .env"
    else
        echo "USER_CENTRIC=$USERCENTRICS_SETTINGS_ID" >> "$ENV_FILE"
        print_success "Added USER_CENTRIC to .env"
    fi
}

update_env_config() {
    print_header "Step 3: Update env.ts Configuration"
    
    if [ ! -f "$ENV_CONFIG_PATH" ]; then
        print_error "env.ts not found at: $ENV_CONFIG_PATH"
        exit 1
    fi
    
    print_step "Checking if USER_CENTRIC is already in env.ts..."
    
    # Backup env.ts
    cp "$ENV_CONFIG_PATH" "$ENV_CONFIG_PATH.backup"
    print_info "Backup created: env.ts.backup"
    
    # Check if USER_CENTRIC is imported
    if grep -q "USER_CENTRIC" "$ENV_CONFIG_PATH"; then
        print_success "USER_CENTRIC is already imported in env.ts"
    else
        print_step "Adding USER_CENTRIC to imports..."
        
        # Add to imports (after APPSFLYER_APP_ID)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "/APPSFLYER_APP_ID,/a\\
  USER_CENTRIC,
" "$ENV_CONFIG_PATH"
        else
            sed -i "/APPSFLYER_APP_ID,/a\\  USER_CENTRIC," "$ENV_CONFIG_PATH"
        fi
        
        # Add to type definition (after APPSFLYER_APP_ID)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "/APPSFLYER_APP_ID: string/a\\
  USER_CENTRIC: string
" "$ENV_CONFIG_PATH"
        else
            sed -i "/APPSFLYER_APP_ID: string/a\\  USER_CENTRIC: string" "$ENV_CONFIG_PATH"
        fi
        
        # Add to env object (after APPSFLYER_APP_ID)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "/APPSFLYER_APP_ID: APPSFLYER_APP_ID/a\\
  USER_CENTRIC: USER_CENTRIC ?? '',
" "$ENV_CONFIG_PATH"
        else
            sed -i "/APPSFLYER_APP_ID: APPSFLYER_APP_ID/a\\  USER_CENTRIC: USER_CENTRIC ?? ''," "$ENV_CONFIG_PATH"
        fi
        
        print_success "Added USER_CENTRIC to env.ts"
    fi
}

update_app_tsx() {
    print_header "Step 4: Update App.tsx to Use Environment Variable"
    
    if [ ! -f "$APP_TSX" ]; then
        print_error "App.tsx not found at: $APP_TSX"
        exit 1
    fi
    
    print_step "Updating App.tsx to use USER_CENTRIC from env..."
    
    # Backup App.tsx
    cp "$APP_TSX" "$APP_TSX.backup"
    print_info "Backup created: App.tsx.backup"
    
    # Check if already using env
    if grep -q "env.USER_CENTRIC" "$APP_TSX"; then
        print_success "App.tsx already uses env.USER_CENTRIC"
    else
        # Check if env is imported
        if ! grep -q "import env from" "$APP_TSX"; then
            print_step "Adding env import to App.tsx..."
            
            # Add import after other imports (before the App component)
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "/from '\.\/src\/config\/initializers';/a\\
import env from './src/config/env';
" "$APP_TSX"
            else
                sed -i "/from '\.\/src\/config\/initializers';/a\\import env from './src/config/env';" "$APP_TSX"
            fi
            
            print_success "Added env import"
        fi
        
        # Replace hardcoded ruleSetId with env variable
        if grep -q "userCentric({ ruleSetId:" "$APP_TSX"; then
            print_step "Replacing hardcoded ruleSetId with env.USER_CENTRIC..."
            
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s|userCentric({ ruleSetId: '[^']*' })|userCentric({ ruleSetId: env.USER_CENTRIC })|" "$APP_TSX"
            else
                sed -i "s|userCentric({ ruleSetId: '[^']*' })|userCentric({ ruleSetId: env.USER_CENTRIC })|" "$APP_TSX"
            fi
            
            print_success "Updated App.tsx to use env.USER_CENTRIC"
        else
            print_warning "Could not find userCentric call with ruleSetId in App.tsx"
            print_info "Please manually update App.tsx to use: userCentric({ ruleSetId: env.USER_CENTRIC })"
        fi
    fi
}

verify_configuration() {
    print_header "Step 5: Verify Configuration"
    
    print_step "Checking env.ts configuration..."
    
    # Check imports
    if grep -q "USER_CENTRIC" "$ENV_CONFIG_PATH" && grep -q "from '@env'" "$ENV_CONFIG_PATH"; then
        print_success "USER_CENTRIC is imported from @env"
    else
        print_error "USER_CENTRIC is NOT properly imported"
        exit 1
    fi
    
    # Check type definition
    if grep -q "USER_CENTRIC: string" "$ENV_CONFIG_PATH"; then
        print_success "USER_CENTRIC is in type definition"
    else
        print_error "USER_CENTRIC is NOT in type definition"
        exit 1
    fi
    
    # Check env object
    if grep -q "USER_CENTRIC: USER_CENTRIC" "$ENV_CONFIG_PATH"; then
        print_success "USER_CENTRIC is exported in env object"
    else
        print_error "USER_CENTRIC is NOT properly exported"
        exit 1
    fi
    
    print_step "Checking App.tsx integration..."
    
    # Check if App.tsx uses env
    if grep -q "env.USER_CENTRIC" "$APP_TSX"; then
        print_success "App.tsx uses env.USER_CENTRIC"
    else
        print_warning "App.tsx does NOT use env.USER_CENTRIC"
        print_info "You may need to manually update App.tsx"
    fi
    
    print_step "Checking userCentric utility..."
    
    if [ -f "$USER_CENTRIC_UTIL" ]; then
        print_success "userCentric utility exists"
        
        if grep -q "Usercentrics.configure" "$USER_CENTRIC_UTIL"; then
            print_success "userCentric calls Usercentrics.configure()"
        else
            print_warning "userCentric may not be properly configured"
        fi
    else
        print_error "userCentric utility not found"
        exit 1
    fi
}

create_test_script() {
    print_header "Step 6: Create Verification Test Script"
    
    print_step "Creating test-usercentrics.js..."
    
    cat > "$PROJECT_ROOT/test-usercentrics.js" << 'EOF'
/**
 * Usercentrics Configuration Test
 * Run this with: node test-usercentrics.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('\n========================================');
console.log('Usercentrics Configuration Test');
console.log('========================================\n');

let hasErrors = false;
let hasWarnings = false;

// Test 1: Check if .env file has the Settings ID
console.log('📋 Test 1: Checking .env file...');
const settingsId = process.env.USER_CENTRIC;

if (!settingsId || settingsId.trim() === '') {
    console.log('❌ USER_CENTRIC is missing or empty in .env');
    hasErrors = true;
} else {
    console.log('✅ USER_CENTRIC is set:', settingsId);
}

// Test 2: Validate Settings ID format
console.log('\n📋 Test 2: Validating Settings ID format...');
if (settingsId && settingsId.length < 10) {
    console.log('⚠️  Settings ID seems too short (expected 14+ characters)');
    hasWarnings = true;
} else if (settingsId) {
    console.log('✅ Settings ID length looks good');
}

if (settingsId && !/^[a-zA-Z0-9]+$/.test(settingsId)) {
    console.log('⚠️  Settings ID should be alphanumeric');
    hasWarnings = true;
} else if (settingsId) {
    console.log('✅ Settings ID format looks correct');
}

// Test 3: Check env.ts imports USER_CENTRIC
console.log('\n📋 Test 3: Checking env.ts configuration...');
const envTsPath = path.join(__dirname, 'src', 'config', 'env.ts');
if (fs.existsSync(envTsPath)) {
    const envTsContent = fs.readFileSync(envTsPath, 'utf8');
    
    if (envTsContent.includes('USER_CENTRIC') && envTsContent.includes("from '@env'")) {
        console.log('✅ USER_CENTRIC is imported in env.ts');
    } else {
        console.log('❌ USER_CENTRIC is NOT imported in env.ts');
        hasErrors = true;
    }
    
    if (envTsContent.includes('USER_CENTRIC: string')) {
        console.log('✅ USER_CENTRIC is in type definition');
    } else {
        console.log('❌ USER_CENTRIC is NOT in type definition');
        hasErrors = true;
    }
    
    if (envTsContent.includes('USER_CENTRIC: USER_CENTRIC')) {
        console.log('✅ USER_CENTRIC is exported in env object');
    } else {
        console.log('❌ USER_CENTRIC is NOT properly exported');
        hasErrors = true;
    }
} else {
    console.log('❌ env.ts not found');
    hasErrors = true;
}

// Test 4: Check App.tsx uses env.USER_CENTRIC
console.log('\n📋 Test 4: Checking App.tsx integration...');
const appTsxPath = path.join(__dirname, 'App.tsx');
if (fs.existsSync(appTsxPath)) {
    const appTsxContent = fs.readFileSync(appTsxPath, 'utf8');
    
    if (appTsxContent.includes("import env from")) {
        console.log('✅ env is imported in App.tsx');
    } else {
        console.log('⚠️  env is NOT imported in App.tsx');
        hasWarnings = true;
    }
    
    if (appTsxContent.includes('env.USER_CENTRIC')) {
        console.log('✅ App.tsx uses env.USER_CENTRIC');
    } else if (appTsxContent.includes('ruleSetId:')) {
        console.log('⚠️  App.tsx may be using hardcoded ruleSetId');
        hasWarnings = true;
    } else {
        console.log('⚠️  Could not find userCentric configuration in App.tsx');
        hasWarnings = true;
    }
    
    if (appTsxContent.includes('userCentric({')) {
        console.log('✅ userCentric is called in App.tsx');
    } else {
        console.log('❌ userCentric is NOT called in App.tsx');
        hasErrors = true;
    }
} else {
    console.log('❌ App.tsx not found');
    hasErrors = true;
}

// Test 5: Check userCentric utility exists
console.log('\n📋 Test 5: Checking userCentric utility...');
const userCentricPath = path.join(__dirname, 'src', 'utils', 'userCentric.tsx');
if (fs.existsSync(userCentricPath)) {
    const userCentricContent = fs.readFileSync(userCentricPath, 'utf8');
    
    console.log('✅ userCentric utility exists');
    
    if (userCentricContent.includes('@usercentrics/react-native-sdk')) {
        console.log('✅ Usercentrics SDK is imported');
    } else {
        console.log('❌ Usercentrics SDK is NOT imported');
        hasErrors = true;
    }
    
    if (userCentricContent.includes('Usercentrics.configure')) {
        console.log('✅ Utility calls Usercentrics.configure()');
    } else {
        console.log('⚠️  Utility may not call Usercentrics.configure()');
        hasWarnings = true;
    }
} else {
    console.log('❌ userCentric utility not found');
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
    console.log('Your Usercentrics configuration should work, but review the warnings above.');
    console.log('\nNext steps:');
    console.log('1. Review warnings and consider fixing them');
    console.log('2. Clean and rebuild your project');
    console.log('3. Run on a simulator/device');
    console.log('4. Check console logs for: Usercentrics configured with { ruleSetId: ... }');
} else {
    console.log('✅ All tests passed!');
    console.log('Your Usercentrics configuration looks perfect.');
    console.log('\nNext steps:');
    console.log('1. Clean and rebuild your project');
    console.log('2. Run on a simulator/device');
    console.log('3. Check console logs for: Usercentrics configured with { ruleSetId: ... }');
    console.log('4. Test consent management flow');
}
console.log('========================================\n');
EOF
    
    chmod +x "$PROJECT_ROOT/test-usercentrics.js"
    print_success "Test script created: test-usercentrics.js"
}

run_verification_test() {
    print_header "Step 7: Run Verification Test"
    
    print_step "Running configuration test..."
    echo ""
    
    if command -v node &> /dev/null; then
        node "$PROJECT_ROOT/test-usercentrics.js"
    else
        print_warning "Node.js not found. Please install Node.js to run the test."
    fi
}

print_final_instructions() {
    print_header "Setup Complete! 🎉"
    
    echo -e "${GREEN}Usercentrics has been configured successfully!${NC}"
    echo ""
    echo -e "${CYAN}What was configured:${NC}"
    echo "  ✅ Usercentrics Settings ID added to .env"
    echo "  ✅ env.ts updated to import and export USER_CENTRIC"
    echo "  ✅ App.tsx updated to use Settings ID from environment"
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
    echo "     Look for: ${CYAN}Usercentrics configured with { ruleSetId: ... }${NC}"
    echo ""
    echo "  4. Test the configuration:"
    echo -e "     ${GREEN}node test-usercentrics.js${NC}"
    echo ""
    echo -e "${CYAN}Usercentrics Admin:${NC}"
    echo "  • Admin Interface: https://admin.usercentrics.com/"
    echo "  • Configure your consent settings"
    echo "  • Set up data processing services"
    echo "  • Customize consent UI"
    echo ""
    echo -e "${CYAN}Testing Consent Flow:${NC}"
    echo "  • First app launch should show consent dialog"
    echo "  • Test accepting/rejecting consent"
    echo "  • Verify consent is persisted"
    echo "  • Check Data Processing Services are respected"
    echo ""
    echo -e "${CYAN}Helpful Resources:${NC}"
    echo "  • Usercentrics Admin: https://admin.usercentrics.com/"
    echo "  • Documentation: https://docs.usercentrics.com/"
    echo "  • SDK Reference: https://usercentrics.com/docs/mobile/"
    echo ""
    echo -e "${YELLOW}⚠️  Important Reminders:${NC}"
    echo "  • Never commit .env file to version control"
    echo "  • Keep your Settings ID accessible for team members"
    echo "  • Configure all data processing services in Usercentrics Admin"
    echo "  • Test consent flow thoroughly before production"
    echo "  • Ensure privacy policy and terms are properly linked"
    echo ""
    print_success "You're all set! Happy coding! 🚀"
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    clear
    
    print_header "Usercentrics Setup Script"
    
    echo -e "${CYAN}This script will help you configure Usercentrics CMP for your React Native app.${NC}"
    echo ""
    echo -e "${YELLOW}What this script does:${NC}"
    echo "  • Collects your Usercentrics Settings ID (ruleSetId)"
    echo "  • Updates .env file automatically"
    echo "  • Updates env.ts to import and export the Settings ID"
    echo "  • Updates App.tsx to use the Settings ID from environment"
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
    collect_settings_id
    update_env_file
    update_env_config
    update_app_tsx
    verify_configuration
    create_test_script
    run_verification_test
    print_final_instructions
}

# Run main function
main

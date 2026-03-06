#!/bin/bash

# ============================================================================
# Sentry Setup Script
# ============================================================================
# This script helps developers set up Sentry error tracking in their React Native project
# 
# Features:
# - Prompts for Sentry DSN (Data Source Name)
# - Prompts for Sentry Organization slug
# - Prompts for Sentry Project slug
# - Prompts for Sentry Auth Token
# - Updates .env file automatically
# - Updates android/sentry.properties
# - Updates ios/sentry.properties
# - Verifies the configuration is correctly passed to Sentry SDK
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
SENTRY_INITIALIZER="$PROJECT_ROOT/src/config/initializers/sentryInitializer.ts"
SENTRY_SERVICE="$PROJECT_ROOT/src/services/SentryService.ts"
ANDROID_SENTRY_PROPS="$PROJECT_ROOT/android/sentry.properties"
IOS_SENTRY_PROPS="$PROJECT_ROOT/ios/sentry.properties"

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

validate_dsn() {
    local dsn=$1
    
    if [ -z "$dsn" ]; then
        return 1
    fi
    
    # Sentry DSN format: https://[key]@[org].ingest.sentry.io/[project_id]
    if ! [[ "$dsn" =~ ^https://[a-zA-Z0-9]+@[a-zA-Z0-9.-]+\.ingest\.sentry\.io/[0-9]+$ ]]; then
        print_warning "DSN format looks unusual. Expected format:"
        print_warning "https://[key]@[org].ingest.sentry.io/[project_id]"
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
    fi
    
    return 0
}

validate_org_slug() {
    local org=$1
    
    if [ -z "$org" ]; then
        return 1
    fi
    
    # Organization slug should be lowercase alphanumeric with hyphens
    if ! [[ "$org" =~ ^[a-z0-9-]+$ ]]; then
        print_warning "Organization slug should be lowercase alphanumeric with hyphens"
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
    fi
    
    return 0
}

validate_project_slug() {
    local project=$1
    
    if [ -z "$project" ]; then
        return 1
    fi
    
    # Project slug should be lowercase alphanumeric with hyphens
    if ! [[ "$project" =~ ^[a-z0-9-]+$ ]]; then
        print_warning "Project slug should be lowercase alphanumeric with hyphens"
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
    fi
    
    return 0
}

validate_auth_token() {
    local token=$1
    
    if [ -z "$token" ]; then
        return 1
    fi
    
    # Sentry auth tokens are 64 characters hex
    if [ ${#token} -lt 32 ]; then
        print_warning "Auth token seems too short (expected 64 characters)"
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

collect_sentry_credentials() {
    print_header "Step 1: Collect Sentry Configuration"
    
    echo -e "${CYAN}📝 You need to get your Sentry credentials from the Sentry Dashboard:${NC}"
    echo "   1. Go to: https://sentry.io/"
    echo "   2. Log in or create an account"
    echo "   3. Create a project (or select existing)"
    echo "   4. Get your configuration from the setup page"
    echo ""
    echo -e "${MAGENTA}What you'll need:${NC}"
    echo "   • DSN (Data Source Name) - Required for error tracking"
    echo "   • Organization Slug - Your organization name in Sentry"
    echo "   • Project Slug - Your project name in Sentry"
    echo "   • Auth Token - For source map uploads and releases"
    echo ""
    
    # Prompt for DSN
    while true; do
        echo -e "${YELLOW}Enter your Sentry DSN:${NC}"
        echo -e "${MAGENTA}(Found in: Settings → Projects → [Your Project] → Client Keys (DSN))${NC}"
        echo -e "${MAGENTA}Format: https://[key]@[org].ingest.sentry.io/[project_id]${NC}"
        read -r SENTRY_DSN
        
        if validate_dsn "$SENTRY_DSN"; then
            break
        else
            print_error "Invalid DSN. Please try again."
        fi
    done
    
    echo ""
    
    # Prompt for Organization slug
    while true; do
        echo -e "${YELLOW}Enter your Sentry Organization slug:${NC}"
        echo -e "${MAGENTA}(Found in: Settings → Organization Settings → General Settings)${NC}"
        echo -e "${MAGENTA}Format: lowercase-with-hyphens (e.g., my-organization)${NC}"
        read -r SENTRY_ORG
        
        if validate_org_slug "$SENTRY_ORG"; then
            break
        else
            print_error "Invalid organization slug. Please try again."
        fi
    done
    
    echo ""
    
    # Prompt for Project slug
    while true; do
        echo -e "${YELLOW}Enter your Sentry Project slug:${NC}"
        echo -e "${MAGENTA}(Found in: Settings → Projects → [Your Project] → General Settings)${NC}"
        echo -e "${MAGENTA}Format: lowercase-with-hyphens (e.g., react-native)${NC}"
        read -r SENTRY_PROJECT
        
        if validate_project_slug "$SENTRY_PROJECT"; then
            break
        else
            print_error "Invalid project slug. Please try again."
        fi
    done
    
    echo ""
    
    # Prompt for Auth Token
    echo -e "${CYAN}Auth Token Setup:${NC}"
    echo "The Auth Token is used for uploading source maps and creating releases."
    echo "This helps Sentry show you the original code in error stack traces."
    echo ""
    echo -e "${MAGENTA}To create an Auth Token:${NC}"
    echo "   1. Go to: https://sentry.io/settings/account/api/auth-tokens/"
    echo "   2. Click 'Create New Token'"
    echo "   3. Name it: 'React Native Release Upload'"
    echo "   4. Required scopes: project:read, project:releases, org:read"
    echo "   5. Copy the token"
    echo ""
    
    while true; do
        echo -e "${YELLOW}Enter your Sentry Auth Token:${NC}"
        read -r SENTRY_AUTH_TOKEN
        
        if validate_auth_token "$SENTRY_AUTH_TOKEN"; then
            break
        else
            print_error "Invalid auth token. Please try again."
        fi
    done
    
    # Sentry URL is always the same
    SENTRY_URL="https://sentry.io/"
    
    echo ""
    print_success "Sentry credentials collected successfully!"
    echo ""
    echo -e "${CYAN}Configuration Summary:${NC}"
    echo "   DSN: $SENTRY_DSN"
    echo "   URL: $SENTRY_URL"
    echo "   Organization: $SENTRY_ORG"
    echo "   Project: $SENTRY_PROJECT"
    echo "   Auth Token: ${SENTRY_AUTH_TOKEN:0:8}... (hidden for security)"
}

update_env_file() {
    print_header "Step 2: Update .env File"
    
    check_env_file
    
    print_step "Updating Sentry configuration in .env file..."
    
    # Backup existing .env
    cp "$ENV_FILE" "$ENV_FILE.backup"
    print_info "Backup created: .env.backup"
    
    # Update or add SENTRY_DSN
    if grep -q "^SENTRY_DSN=" "$ENV_FILE"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^SENTRY_DSN=.*|SENTRY_DSN=$SENTRY_DSN|" "$ENV_FILE"
        else
            sed -i "s|^SENTRY_DSN=.*|SENTRY_DSN=$SENTRY_DSN|" "$ENV_FILE"
        fi
        print_success "Updated SENTRY_DSN in .env"
    else
        echo "SENTRY_DSN=$SENTRY_DSN" >> "$ENV_FILE"
        print_success "Added SENTRY_DSN to .env"
    fi
    
    # Update or add SENTRY_URL
    if grep -q "^SENTRY_URL=" "$ENV_FILE"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^SENTRY_URL=.*|SENTRY_URL=$SENTRY_URL|" "$ENV_FILE"
        else
            sed -i "s|^SENTRY_URL=.*|SENTRY_URL=$SENTRY_URL|" "$ENV_FILE"
        fi
        print_success "Updated SENTRY_URL in .env"
    else
        echo "SENTRY_URL=$SENTRY_URL" >> "$ENV_FILE"
        print_success "Added SENTRY_URL to .env"
    fi
    
    # Update or add SENTRY_ORG
    if grep -q "^SENTRY_ORG=" "$ENV_FILE"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^SENTRY_ORG=.*|SENTRY_ORG=$SENTRY_ORG|" "$ENV_FILE"
        else
            sed -i "s|^SENTRY_ORG=.*|SENTRY_ORG=$SENTRY_ORG|" "$ENV_FILE"
        fi
        print_success "Updated SENTRY_ORG in .env"
    else
        echo "SENTRY_ORG=$SENTRY_ORG" >> "$ENV_FILE"
        print_success "Added SENTRY_ORG to .env"
    fi
    
    # Update or add SENTRY_PROJECT
    if grep -q "^SENTRY_PROJECT=" "$ENV_FILE"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^SENTRY_PROJECT=.*|SENTRY_PROJECT=$SENTRY_PROJECT|" "$ENV_FILE"
        else
            sed -i "s|^SENTRY_PROJECT=.*|SENTRY_PROJECT=$SENTRY_PROJECT|" "$ENV_FILE"
        fi
        print_success "Updated SENTRY_PROJECT in .env"
    else
        echo "SENTRY_PROJECT=$SENTRY_PROJECT" >> "$ENV_FILE"
        print_success "Added SENTRY_PROJECT to .env"
    fi
    
    # Update or add SENTRY_AUTH_TOKEN
    if grep -q "^SENTRY_AUTH_TOKEN=" "$ENV_FILE"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^SENTRY_AUTH_TOKEN=.*|SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN|" "$ENV_FILE"
        else
            sed -i "s|^SENTRY_AUTH_TOKEN=.*|SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN|" "$ENV_FILE"
        fi
        print_success "Updated SENTRY_AUTH_TOKEN in .env"
    else
        echo "SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN" >> "$ENV_FILE"
        print_success "Added SENTRY_AUTH_TOKEN to .env"
    fi
}

update_sentry_properties() {
    print_header "Step 3: Update sentry.properties Files"
    
    # Update Android sentry.properties
    print_step "Updating android/sentry.properties..."
    
    if [ -f "$ANDROID_SENTRY_PROPS" ]; then
        # Backup existing file
        cp "$ANDROID_SENTRY_PROPS" "$ANDROID_SENTRY_PROPS.backup"
        print_info "Backup created: android/sentry.properties.backup"
        
        # Create new file with environment variable references
        cat > "$ANDROID_SENTRY_PROPS" << EOF
# Sentry Configuration (Android)
# Uses environment variables from .env file
# To use hardcoded values instead, replace \${VAR} with actual values

defaults.url=\${SENTRY_URL:-https://sentry.io/}
defaults.org=\${SENTRY_ORG}
defaults.project=\${SENTRY_PROJECT}
auth.token=\${SENTRY_AUTH_TOKEN}

# Note: Make sure to set these values in your .env file:
# SENTRY_URL=$SENTRY_URL
# SENTRY_ORG=$SENTRY_ORG
# SENTRY_PROJECT=$SENTRY_PROJECT
# SENTRY_AUTH_TOKEN=your-auth-token
EOF
        print_success "Updated android/sentry.properties"
    else
        print_warning "android/sentry.properties not found, creating it..."
        mkdir -p "$(dirname "$ANDROID_SENTRY_PROPS")"
        cat > "$ANDROID_SENTRY_PROPS" << EOF
# Sentry Configuration (Android)
# Uses environment variables from .env file

defaults.url=\${SENTRY_URL:-https://sentry.io/}
defaults.org=\${SENTRY_ORG}
defaults.project=\${SENTRY_PROJECT}
auth.token=\${SENTRY_AUTH_TOKEN}
EOF
        print_success "Created android/sentry.properties"
    fi
    
    # Update iOS sentry.properties
    print_step "Updating ios/sentry.properties..."
    
    if [ -f "$IOS_SENTRY_PROPS" ]; then
        # Backup existing file
        cp "$IOS_SENTRY_PROPS" "$IOS_SENTRY_PROPS.backup"
        print_info "Backup created: ios/sentry.properties.backup"
        
        # Create new file with environment variable references
        cat > "$IOS_SENTRY_PROPS" << EOF
# Sentry Configuration (iOS)
# Uses environment variables from .env file
# To use hardcoded values instead, replace \${VAR} with actual values

defaults.url=\${SENTRY_URL:-https://sentry.io/}
defaults.org=\${SENTRY_ORG}
defaults.project=\${SENTRY_PROJECT}
auth.token=\${SENTRY_AUTH_TOKEN}

# Note: Make sure to set these values in your .env file:
# SENTRY_URL=$SENTRY_URL
# SENTRY_ORG=$SENTRY_ORG
# SENTRY_PROJECT=$SENTRY_PROJECT
# SENTRY_AUTH_TOKEN=your-auth-token
EOF
        print_success "Updated ios/sentry.properties"
    else
        print_warning "ios/sentry.properties not found, creating it..."
        mkdir -p "$(dirname "$IOS_SENTRY_PROPS")"
        cat > "$IOS_SENTRY_PROPS" << EOF
# Sentry Configuration (iOS)
# Uses environment variables from .env file

defaults.url=\${SENTRY_URL:-https://sentry.io/}
defaults.org=\${SENTRY_ORG}
defaults.project=\${SENTRY_PROJECT}
auth.token=\${SENTRY_AUTH_TOKEN}
EOF
        print_success "Created ios/sentry.properties"
    fi
    
    print_info "sentry.properties files use environment variables for security"
    print_info "The actual values are read from your .env file during build"
}

verify_configuration() {
    print_header "Step 4: Verify Configuration"
    
    print_step "Checking .env file..."
    
    # Check if keys exist in .env
    if grep -q "^SENTRY_DSN=$SENTRY_DSN" "$ENV_FILE"; then
        print_success "SENTRY_DSN is set correctly in .env"
    else
        print_error "SENTRY_DSN is NOT set correctly in .env"
        exit 1
    fi
    
    if grep -q "^SENTRY_URL=" "$ENV_FILE"; then
        print_success "SENTRY_URL is set in .env"
    else
        print_warning "SENTRY_URL is NOT set in .env"
    fi
    
    if grep -q "^SENTRY_ORG=$SENTRY_ORG" "$ENV_FILE"; then
        print_success "SENTRY_ORG is set correctly in .env"
    else
        print_error "SENTRY_ORG is NOT set correctly in .env"
        exit 1
    fi
    
    if grep -q "^SENTRY_PROJECT=$SENTRY_PROJECT" "$ENV_FILE"; then
        print_success "SENTRY_PROJECT is set correctly in .env"
    else
        print_error "SENTRY_PROJECT is NOT set correctly in .env"
        exit 1
    fi
    
    if grep -q "^SENTRY_AUTH_TOKEN=" "$ENV_FILE"; then
        print_success "SENTRY_AUTH_TOKEN is set in .env"
    else
        print_warning "SENTRY_AUTH_TOKEN is NOT set in .env"
    fi
    
    print_step "Checking env.ts configuration..."
    
    # Check imports
    if grep -q "SENTRY_DSN" "$ENV_CONFIG_PATH" && grep -q "from '@env'" "$ENV_CONFIG_PATH"; then
        print_success "SENTRY_DSN is imported from @env"
    else
        print_error "SENTRY_DSN is NOT properly imported"
        exit 1
    fi
    
    if grep -q "SENTRY_URL" "$ENV_CONFIG_PATH"; then
        print_success "SENTRY_URL is imported from @env"
    else
        print_error "SENTRY_URL is NOT properly imported"
        exit 1
    fi
    
    if grep -q "SENTRY_ORG" "$ENV_CONFIG_PATH"; then
        print_success "SENTRY_ORG is imported from @env"
    else
        print_error "SENTRY_ORG is NOT properly imported"
        exit 1
    fi
    
    if grep -q "SENTRY_PROJECT" "$ENV_CONFIG_PATH"; then
        print_success "SENTRY_PROJECT is imported from @env"
    else
        print_error "SENTRY_PROJECT is NOT properly imported"
        exit 1
    fi
    
    if grep -q "SENTRY_AUTH_TOKEN" "$ENV_CONFIG_PATH"; then
        print_success "SENTRY_AUTH_TOKEN is imported from @env"
    else
        print_error "SENTRY_AUTH_TOKEN is NOT properly imported"
        exit 1
    fi
    
    # Check type definition
    if grep -q "SENTRY_DSN: string" "$ENV_CONFIG_PATH"; then
        print_success "SENTRY_DSN is in type definition"
    else
        print_error "SENTRY_DSN is NOT in type definition"
        exit 1
    fi
    
    # Check env object
    if grep -q "SENTRY_DSN: SENTRY_DSN" "$ENV_CONFIG_PATH"; then
        print_success "SENTRY_DSN is exported in env object"
    else
        print_error "SENTRY_DSN is NOT properly exported"
        exit 1
    fi
    
    print_step "Checking Sentry initializer..."
    
    if [ -f "$SENTRY_INITIALIZER" ]; then
        print_success "Sentry initializer exists"
        
        if grep -q "env.SENTRY_DSN" "$SENTRY_INITIALIZER"; then
            print_success "Initializer uses env.SENTRY_DSN"
        else
            print_warning "Initializer may not use env.SENTRY_DSN"
        fi
        
        if grep -q "sentryService.initialize" "$SENTRY_INITIALIZER"; then
            print_success "Initializer calls sentryService.initialize()"
        else
            print_error "Initializer does NOT call sentryService.initialize()"
            exit 1
        fi
    else
        print_error "Sentry initializer not found"
        exit 1
    fi
    
    print_step "Checking Sentry service..."
    
    if [ -f "$SENTRY_SERVICE" ]; then
        print_success "Sentry service exists"
        
        if grep -q "@sentry/react-native" "$SENTRY_SERVICE"; then
            print_success "Sentry SDK is imported"
        else
            print_error "Sentry SDK is NOT imported"
            exit 1
        fi
    else
        print_error "Sentry service not found"
        exit 1
    fi
    
    print_step "Checking sentry.properties files..."
    
    if [ -f "$ANDROID_SENTRY_PROPS" ]; then
        print_success "android/sentry.properties exists"
        
        if grep -q "defaults.org=\${SENTRY_ORG}" "$ANDROID_SENTRY_PROPS"; then
            print_success "android/sentry.properties uses environment variables"
        else
            print_warning "android/sentry.properties may not use environment variables"
        fi
    else
        print_warning "android/sentry.properties not found"
    fi
    
    if [ -f "$IOS_SENTRY_PROPS" ]; then
        print_success "ios/sentry.properties exists"
        
        if grep -q "defaults.org=\${SENTRY_ORG}" "$IOS_SENTRY_PROPS"; then
            print_success "ios/sentry.properties uses environment variables"
        else
            print_warning "ios/sentry.properties may not use environment variables"
        fi
    else
        print_warning "ios/sentry.properties not found"
    fi
}

create_test_script() {
    print_header "Step 5: Create Verification Test Script"
    
    print_step "Creating test-sentry.js..."
    
    cat > "$PROJECT_ROOT/test-sentry.js" << 'EOF'
/**
 * Sentry Configuration Test
 * Run this with: node test-sentry.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('\n========================================');
console.log('Sentry Configuration Test');
console.log('========================================\n');

let hasErrors = false;
let hasWarnings = false;

// Test 1: Check if .env file has all Sentry variables
console.log('📋 Test 1: Checking .env file...');
const dsn = process.env.SENTRY_DSN;
const url = process.env.SENTRY_URL;
const org = process.env.SENTRY_ORG;
const project = process.env.SENTRY_PROJECT;
const authToken = process.env.SENTRY_AUTH_TOKEN;

if (!dsn || dsn.trim() === '') {
    console.log('❌ SENTRY_DSN is missing or empty in .env');
    hasErrors = true;
} else {
    console.log('✅ SENTRY_DSN is set');
}

if (!url || url.trim() === '') {
    console.log('⚠️  SENTRY_URL is missing or empty (will use default: https://sentry.io/)');
    hasWarnings = true;
} else {
    console.log('✅ SENTRY_URL is set:', url);
}

if (!org || org.trim() === '') {
    console.log('❌ SENTRY_ORG is missing or empty in .env');
    hasErrors = true;
} else {
    console.log('✅ SENTRY_ORG is set:', org);
}

if (!project || project.trim() === '') {
    console.log('❌ SENTRY_PROJECT is missing or empty in .env');
    hasErrors = true;
} else {
    console.log('✅ SENTRY_PROJECT is set:', project);
}

if (!authToken || authToken.trim() === '') {
    console.log('⚠️  SENTRY_AUTH_TOKEN is missing or empty (needed for source map uploads)');
    hasWarnings = true;
} else {
    console.log('✅ SENTRY_AUTH_TOKEN is set');
}

// Test 2: Validate DSN format
console.log('\n📋 Test 2: Validating DSN format...');
if (dsn) {
    const dsnRegex = /^https:\/\/[a-zA-Z0-9]+@[a-zA-Z0-9.-]+\.ingest\.sentry\.io\/[0-9]+$/;
    if (dsnRegex.test(dsn)) {
        console.log('✅ DSN format is correct');
        
        // Extract project ID from DSN
        const projectIdMatch = dsn.match(/\/(\d+)$/);
        if (projectIdMatch) {
            console.log('   Project ID from DSN:', projectIdMatch[1]);
        }
    } else {
        console.log('⚠️  DSN format looks unusual');
        console.log('   Expected: https://[key]@[org].ingest.sentry.io/[project_id]');
        console.log('   Got:', dsn);
        hasWarnings = true;
    }
}

// Test 3: Validate organization and project slugs
console.log('\n📋 Test 3: Validating organization and project slugs...');
if (org) {
    if (/^[a-z0-9-]+$/.test(org)) {
        console.log('✅ Organization slug format is correct');
    } else {
        console.log('⚠️  Organization slug should be lowercase alphanumeric with hyphens');
        hasWarnings = true;
    }
}

if (project) {
    if (/^[a-z0-9-]+$/.test(project)) {
        console.log('✅ Project slug format is correct');
    } else {
        console.log('⚠️  Project slug should be lowercase alphanumeric with hyphens');
        hasWarnings = true;
    }
}

// Test 4: Check env.ts imports
console.log('\n📋 Test 4: Checking env.ts configuration...');
const envTsPath = path.join(__dirname, 'src', 'config', 'env.ts');
if (fs.existsSync(envTsPath)) {
    const envTsContent = fs.readFileSync(envTsPath, 'utf8');
    
    const requiredVars = ['SENTRY_DSN', 'SENTRY_URL', 'SENTRY_ORG', 'SENTRY_PROJECT', 'SENTRY_AUTH_TOKEN'];
    
    requiredVars.forEach(varName => {
        if (envTsContent.includes(varName) && envTsContent.includes("from '@env'")) {
            console.log(`✅ ${varName} is imported in env.ts`);
        } else {
            console.log(`❌ ${varName} is NOT imported in env.ts`);
            hasErrors = true;
        }
        
        if (envTsContent.includes(`${varName}: string`)) {
            console.log(`✅ ${varName} is in type definition`);
        } else {
            console.log(`❌ ${varName} is NOT in type definition`);
            hasErrors = true;
        }
        
        if (envTsContent.includes(`${varName}: ${varName}`)) {
            console.log(`✅ ${varName} is exported in env object`);
        } else {
            console.log(`❌ ${varName} is NOT properly exported`);
            hasErrors = true;
        }
    });
} else {
    console.log('❌ env.ts not found');
    hasErrors = true;
}

// Test 5: Check Sentry initializer
console.log('\n📋 Test 5: Checking Sentry initializer...');
const initializerPath = path.join(__dirname, 'src', 'config', 'initializers', 'sentryInitializer.ts');
if (fs.existsSync(initializerPath)) {
    const initializerContent = fs.readFileSync(initializerPath, 'utf8');
    
    console.log('✅ Sentry initializer exists');
    
    if (initializerContent.includes('env.SENTRY_DSN')) {
        console.log('✅ Initializer uses env.SENTRY_DSN');
    } else {
        console.log('❌ Initializer does NOT use env.SENTRY_DSN');
        hasErrors = true;
    }
    
    if (initializerContent.includes('sentryService.initialize')) {
        console.log('✅ Initializer calls sentryService.initialize()');
    } else {
        console.log('❌ Initializer does NOT call sentryService.initialize()');
        hasErrors = true;
    }
} else {
    console.log('❌ Sentry initializer not found');
    hasErrors = true;
}

// Test 6: Check Sentry service
console.log('\n📋 Test 6: Checking Sentry service...');
const servicePath = path.join(__dirname, 'src', 'services', 'SentryService.ts');
if (fs.existsSync(servicePath)) {
    const serviceContent = fs.readFileSync(servicePath, 'utf8');
    
    console.log('✅ Sentry service exists');
    
    if (serviceContent.includes('@sentry/react-native')) {
        console.log('✅ Sentry SDK is imported');
    } else {
        console.log('❌ Sentry SDK is NOT imported');
        hasErrors = true;
    }
    
    if (serviceContent.includes('Sentry.init')) {
        console.log('✅ Service calls Sentry.init()');
    } else {
        console.log('❌ Service does NOT call Sentry.init()');
        hasErrors = true;
    }
} else {
    console.log('❌ Sentry service not found');
    hasErrors = true;
}

// Test 7: Check sentry.properties files
console.log('\n📋 Test 7: Checking sentry.properties files...');
const androidPropsPath = path.join(__dirname, 'android', 'sentry.properties');
if (fs.existsSync(androidPropsPath)) {
    const androidPropsContent = fs.readFileSync(androidPropsPath, 'utf8');
    
    console.log('✅ android/sentry.properties exists');
    
    if (androidPropsContent.includes('${SENTRY_ORG}')) {
        console.log('✅ android/sentry.properties uses environment variables');
    } else {
        console.log('⚠️  android/sentry.properties may not use environment variables');
        hasWarnings = true;
    }
} else {
    console.log('⚠️  android/sentry.properties not found');
    hasWarnings = true;
}

const iosPropsPath = path.join(__dirname, 'ios', 'sentry.properties');
if (fs.existsSync(iosPropsPath)) {
    const iosPropsContent = fs.readFileSync(iosPropsPath, 'utf8');
    
    console.log('✅ ios/sentry.properties exists');
    
    if (iosPropsContent.includes('${SENTRY_ORG}')) {
        console.log('✅ ios/sentry.properties uses environment variables');
    } else {
        console.log('⚠️  ios/sentry.properties may not use environment variables');
        hasWarnings = true;
    }
} else {
    console.log('⚠️  ios/sentry.properties not found');
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
    console.log('Your Sentry configuration should work, but review the warnings above.');
    console.log('\nNext steps:');
    console.log('1. Review warnings and consider fixing them');
    console.log('2. Clean and rebuild your project');
    console.log('3. Run on a simulator/device');
    console.log('4. Trigger a test error to verify Sentry catches it');
    console.log('5. Check Sentry dashboard for the error event');
} else {
    console.log('✅ All tests passed!');
    console.log('Your Sentry configuration looks perfect.');
    console.log('\nNext steps:');
    console.log('1. Clean and rebuild your project');
    console.log('2. Run on a simulator/device');
    console.log('3. Check console logs for: [Sentry] Initialized successfully');
    console.log('4. Trigger a test error to verify Sentry catches it');
    console.log('5. Check Sentry dashboard for the error event');
    console.log('6. Upload source maps for production builds');
}
console.log('========================================\n');
EOF
    
    chmod +x "$PROJECT_ROOT/test-sentry.js"
    print_success "Test script created: test-sentry.js"
}

run_verification_test() {
    print_header "Step 6: Run Verification Test"
    
    print_step "Running configuration test..."
    echo ""
    
    if command -v node &> /dev/null; then
        node "$PROJECT_ROOT/test-sentry.js"
    else
        print_warning "Node.js not found. Please install Node.js to run the test."
    fi
}

print_final_instructions() {
    print_header "Setup Complete! 🎉"
    
    echo -e "${GREEN}Sentry has been configured successfully!${NC}"
    echo ""
    echo -e "${CYAN}What was configured:${NC}"
    echo "  ✅ Sentry DSN added to .env"
    echo "  ✅ Sentry organization and project added to .env"
    echo "  ✅ Sentry auth token added to .env"
    echo "  ✅ android/sentry.properties updated"
    echo "  ✅ ios/sentry.properties updated"
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
    echo "     Look for: ${CYAN}[Sentry] Initialized successfully${NC}"
    echo ""
    echo "  4. Test the configuration:"
    echo -e "     ${GREEN}node test-sentry.js${NC}"
    echo ""
    echo "  5. Trigger a test error to verify Sentry catches it:"
    echo -e "     ${GREEN}// Add this somewhere in your app to test${NC}"
    echo -e "     ${CYAN}throw new Error('Test error for Sentry');${NC}"
    echo ""
    echo -e "${CYAN}Sentry Dashboard:${NC}"
    echo "  • Dashboard: https://sentry.io/organizations/$SENTRY_ORG/projects/$SENTRY_PROJECT/"
    echo "  • Monitor errors and crashes"
    echo "  • View performance metrics"
    echo "  • Set up alerts and notifications"
    echo "  • Review stack traces with source maps"
    echo ""
    echo -e "${CYAN}Source Maps (Production):${NC}"
    echo "  Source maps are automatically uploaded during release builds using:"
    echo "  • android/sentry.properties (Android)"
    echo "  • ios/sentry.properties (iOS)"
    echo "  • Your SENTRY_AUTH_TOKEN for authentication"
    echo ""
    echo "  This allows Sentry to show you the original code in error stack traces!"
    echo ""
    echo -e "${CYAN}Testing Error Tracking:${NC}"
    echo "  1. Run your app in dev mode"
    echo "  2. Trigger a test error"
    echo "  3. Check Sentry dashboard for the error"
    echo "  4. Verify stack trace is readable"
    echo "  5. Check breadcrumbs and context data"
    echo ""
    echo -e "${CYAN}Helpful Resources:${NC}"
    echo "  • Sentry Dashboard: https://sentry.io/"
    echo "  • Documentation: https://docs.sentry.io/platforms/react-native/"
    echo "  • Source Maps: https://docs.sentry.io/platforms/react-native/sourcemaps/"
    echo "  • Performance: https://docs.sentry.io/platforms/react-native/performance/"
    echo ""
    echo -e "${YELLOW}⚠️  Important Reminders:${NC}"
    echo "  • Never commit .env file to version control"
    echo "  • Keep your Auth Token secure (treat it like a password)"
    echo "  • Verify source maps are uploaded for production builds"
    echo "  • Set up alerts for critical errors"
    echo "  • Monitor your error budget and quotas"
    echo "  • Test error tracking before deploying to production"
    echo ""
    echo -e "${YELLOW}⚠️  Configuration Notes:${NC}"
    echo "  • sentry.properties files use environment variable references (\${VAR})"
    echo "  • Values are read from .env during build time"
    echo "  • This keeps sensitive tokens out of your repository"
    echo "  • Make sure .env is in your .gitignore file"
    echo ""
    print_success "You're all set! Happy coding! 🚀"
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    clear
    
    print_header "Sentry Setup Script"
    
    echo -e "${CYAN}This script will help you configure Sentry error tracking for your React Native app.${NC}"
    echo ""
    echo -e "${YELLOW}What this script does:${NC}"
    echo "  • Collects your Sentry DSN (Data Source Name)"
    echo "  • Collects your Sentry organization and project slugs"
    echo "  • Collects your Sentry auth token"
    echo "  • Updates .env file automatically"
    echo "  • Updates android/sentry.properties"
    echo "  • Updates ios/sentry.properties"
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
    collect_sentry_credentials
    update_env_file
    update_sentry_properties
    verify_configuration
    create_test_script
    run_verification_test
    print_final_instructions
}

# Run main function
main

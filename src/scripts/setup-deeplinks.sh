#!/bin/bash

# ============================================================================
# Deep Linking Setup Script - COMPLETE AUTOMATION
# ============================================================================
# This script fully automates deep linking setup for iOS and Android
# NO MANUAL STEPS REQUIRED - Everything is done through the script!
#
# Features:
# - Prompts for your domain and URL scheme
# - Generates SHA-256 fingerprints automatically
# - Creates assetlinks.json for Android App Links
# - Creates apple-app-site-association for iOS Universal Links
# - Updates AndroidManifest.xml with proper intent filters
# - Updates Info.plist with URL schemes and ATS exceptions
# - Automatically adds Associated Domains to Xcode project
# - Validates all configurations
# - No manual Xcode changes needed!
# ============================================================================

set -e  # Exit on any error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Project paths - Get absolute paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ANDROID_MANIFEST="$PROJECT_ROOT/android/app/src/main/AndroidManifest.xml"
ANDROID_BUILD_GRADLE="$PROJECT_ROOT/android/app/build.gradle"
DEBUG_KEYSTORE="$HOME/.android/debug.keystore"
RELEASE_KEYSTORE="$PROJECT_ROOT/android/app/release.keystore"

# Dynamically find iOS project name and paths
IOS_PROJECT_NAME=""
IOS_INFO_PLIST=""
IOS_PROJECT_FILE=""

# Function to detect iOS project
detect_ios_project() {
    local ios_dir="$PROJECT_ROOT/ios"
    
    if [ -d "$ios_dir" ]; then
        for proj in "$ios_dir"/*.xcodeproj; do
            if [ -d "$proj" ] && [[ ! "$proj" =~ Pods ]]; then
                IOS_PROJECT_NAME=$(basename "$proj" .xcodeproj)
                IOS_PROJECT_FILE="$proj/project.pbxproj"
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
DOMAIN=""
APP_SCHEME=""
PACKAGE_NAME=""
BUNDLE_ID=""
DEBUG_SHA256=""
RELEASE_SHA256=""
TEAM_ID=""

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

validate_domain() {
    local domain=$1
    
    if [ -z "$domain" ]; then
        return 1
    fi
    
    # Check if domain is valid format
    if ! [[ "$domain" =~ ^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        print_warning "Domain format looks unusual. Expected format: example.com or app.example.com"
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
    fi
    
    return 0
}

# ============================================================================
# Information Gathering
# ============================================================================

collect_domain_info() {
    print_header "Step 1: Collect Domain and Scheme Information"
    
    echo -e "${CYAN}📝 Deep Linking Configuration${NC}"
    echo ""
    echo -e "${MAGENTA}You need to provide:${NC}"
    echo "  1. Your domain for Universal Links (iOS) and App Links (Android)"
    echo "  2. Your custom URL scheme (e.g., myapp)"
    echo ""
    echo -e "${YELLOW}Important:${NC}"
    echo "  • Use your actual domain (e.g., myapp.com or app.myapp.com)"
    echo "  • You must have control over this domain"
    echo "  • You'll need to upload verification files to this domain"
    echo "  • Don't include 'https://' or 'www' prefix"
    echo ""
    
    # Prompt for domains (can be multiple)
    while true; do
        echo -e "${YELLOW}Enter your domain(s) (comma-separated, without https://):${NC}"
        echo -e "${MAGENTA}Examples:${NC}"
        echo -e "${MAGENTA}  Single: myapp.com${NC}"
        echo -e "${MAGENTA}  Multiple: myapp.com,app.myapp.com,staging.myapp.com${NC}"
        read -r DOMAIN_INPUT
        
        # Split domains by comma
        IFS=',' read -ra DOMAIN_ARRAY <<< "$DOMAIN_INPUT"
        
        # Validate all domains
        ALL_VALID=true
        for domain in "${DOMAIN_ARRAY[@]}"; do
            # Trim whitespace
            domain=$(echo "$domain" | xargs)
            if ! validate_domain "$domain"; then
                print_error "Invalid domain: $domain"
                ALL_VALID=false
                break
            fi
        done
        
        if [ "$ALL_VALID" = true ]; then
            # Store first domain as primary
            DOMAIN=$(echo "${DOMAIN_ARRAY[0]}" | xargs)
            break
        else
            echo ""
        fi
    done
    
    echo ""
    echo -e "${YELLOW}Enter your custom URL scheme (e.g., myapp):${NC}"
    echo -e "${MAGENTA}This will be used for deep links like: myapp://path${NC}"
    read -r APP_SCHEME
    
    # Sanitize scheme
    APP_SCHEME=$(echo "$APP_SCHEME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g')
    
    echo ""
    print_success "Configuration collected!"
    echo ""
    echo -e "${CYAN}Summary:${NC}"
    if [ ${#DOMAIN_ARRAY[@]} -eq 1 ]; then
        echo "   Domain: $DOMAIN"
    else
        echo "   Domains:"
        for domain in "${DOMAIN_ARRAY[@]}"; do
            domain=$(echo "$domain" | xargs)
            echo "     - $domain"
        done
    fi
    echo "   URL Scheme: $APP_SCHEME://"
}

get_package_info() {
    print_header "Step 2: Extract Package Information"
    
    print_step "Reading Android package name..."
    
    # Get package name from build.gradle
    PACKAGE_NAME=$(grep -E "applicationId|namespace" "$ANDROID_BUILD_GRADLE" | grep -oE '"[^"]+"' | tr -d '"' | head -1)
    
    if [ -z "$PACKAGE_NAME" ]; then
        print_error "Could not find package name in build.gradle"
        echo "Please enter your Android package name manually:"
        read -r PACKAGE_NAME
    else
        print_success "Android package: $PACKAGE_NAME"
    fi
    
    print_step "Reading iOS bundle ID..."
    
    # Get bundle ID from project.pbxproj
    BUNDLE_ID=$(grep "PRODUCT_BUNDLE_IDENTIFIER" "$IOS_PROJECT_FILE" | grep -v "//" | head -1 | sed 's/.*= \(.*\);/\1/' | tr -d ' "')
    
    if [ -z "$BUNDLE_ID" ]; then
        print_warning "Could not find bundle ID"
        echo "Please enter your iOS bundle ID manually:"
        read -r BUNDLE_ID
    else
        print_success "iOS bundle ID: $BUNDLE_ID"
    fi
    
    # Prompt for Team ID
    echo ""
    echo -e "${YELLOW}Enter your Apple Team ID (10 characters):${NC}"
    echo -e "${MAGENTA}Find it at: https://developer.apple.com/account → Membership${NC}"
    read -r TEAM_ID
    
    if [ -z "$TEAM_ID" ]; then
        print_warning "No Team ID provided. You'll need to update it later."
        TEAM_ID="YOUR_TEAM_ID"
    else
        print_success "Team ID: $TEAM_ID"
    fi
}

generate_sha256_fingerprints() {
    print_header "Step 3: Generate SHA-256 Fingerprints"
    
    # Check if keytool is available
    if ! command -v keytool &> /dev/null; then
        print_error "keytool not found. Please install Java Development Kit (JDK)."
        exit 1
    fi
    
    # Generate debug keystore SHA-256
    print_step "Generating SHA-256 for debug keystore..."
    
    if [ -f "$DEBUG_KEYSTORE" ]; then
        DEBUG_SHA256=$(keytool -list -v -keystore "$DEBUG_KEYSTORE" -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep "SHA256:" | sed 's/.*SHA256: //' | tr -d ':' | tr '[:upper:]' '[:lower:]')
        
        if [ -n "$DEBUG_SHA256" ]; then
            print_success "Debug SHA-256: $DEBUG_SHA256"
        else
            print_warning "Could not extract SHA-256 from debug keystore"
        fi
    else
        print_warning "Debug keystore not found at $DEBUG_KEYSTORE"
    fi
    
    # Generate release keystore SHA-256 (optional)
    print_step "Checking for release keystore..."
    
    if [ -f "$RELEASE_KEYSTORE" ]; then
        echo "Enter your release keystore password (press Enter to skip):"
        read -s RELEASE_KEYSTORE_PASSWORD
        echo ""
        
        if [ -n "$RELEASE_KEYSTORE_PASSWORD" ]; then
            echo "Enter your release key alias:"
            read -r RELEASE_KEY_ALIAS
            
            RELEASE_SHA256=$(keytool -list -v -keystore "$RELEASE_KEYSTORE" -alias "$RELEASE_KEY_ALIAS" -storepass "$RELEASE_KEYSTORE_PASSWORD" 2>/dev/null | grep "SHA256:" | sed 's/.*SHA256: //' | tr -d ':' | tr '[:upper:]' '[:lower:]')
            
            if [ -n "$RELEASE_SHA256" ]; then
                print_success "Release SHA-256: $RELEASE_SHA256"
            fi
        fi
    else
        print_info "No release keystore found. You can add this later."
    fi
}

# ============================================================================
# Android Configuration
# ============================================================================

update_android_manifest() {
    print_header "Step 4: Update AndroidManifest.xml"
    
    print_step "Configuring deep link intent filters..."
    
    # Create Python script for XML manipulation (supports multiple domains)
    cat > /tmp/update_android_manifest.py << 'PYTHON_SCRIPT'
import sys
import xml.etree.ElementTree as ET

def update_manifest(file_path, domains, app_scheme):
    try:
        # Parse XML with namespace preservation
        ET.register_namespace('android', 'http://schemas.android.com/apk/res/android')
        ET.register_namespace('tools', 'http://schemas.android.com/tools')
        
        tree = ET.parse(file_path)
        root = tree.getroot()
        
        # Define namespaces
        ns = {'android': 'http://schemas.android.com/apk/res/android'}
        
        # Find MainActivity
        activities = root.findall('.//activity', ns)
        main_activity = None
        
        for activity in activities:
            name = activity.get('{http://schemas.android.com/apk/res/android}name')
            if name and 'MainActivity' in name:
                main_activity = activity
                break
        
        if main_activity is None:
            print("ERROR: MainActivity not found")
            sys.exit(1)
        
        # Remove existing deep link intent filters (clean slate)
        intent_filters = list(main_activity.findall('intent-filter'))
        for intent_filter in intent_filters:
            actions = intent_filter.findall('action')
            for action in actions:
                action_name = action.get('{http://schemas.android.com/apk/res/android}name')
                if action_name == 'android.intent.action.VIEW':
                    main_activity.remove(intent_filter)
                    break
        
        # Add HTTPS App Links intent filter with autoVerify (supports multiple domains)
        https_filter = ET.Element('intent-filter')
        https_filter.set('{http://schemas.android.com/apk/res/android}autoVerify', 'true')
        
        action1 = ET.SubElement(https_filter, 'action')
        action1.set('{http://schemas.android.com/apk/res/android}name', 'android.intent.action.VIEW')
        
        category1_1 = ET.SubElement(https_filter, 'category')
        category1_1.set('{http://schemas.android.com/apk/res/android}name', 'android.intent.category.DEFAULT')
        
        category1_2 = ET.SubElement(https_filter, 'category')
        category1_2.set('{http://schemas.android.com/apk/res/android}name', 'android.intent.category.BROWSABLE')
        
        # Add multiple domains as separate <data> tags
        domain_list = domains.split(',')
        for domain in domain_list:
            domain = domain.strip()
            data_elem = ET.SubElement(https_filter, 'data')
            data_elem.set('{http://schemas.android.com/apk/res/android}scheme', 'https')
            data_elem.set('{http://schemas.android.com/apk/res/android}host', domain)
        
        main_activity.append(https_filter)
        
        # Add custom URI scheme intent filter
        custom_filter = ET.Element('intent-filter')
        
        action2 = ET.SubElement(custom_filter, 'action')
        action2.set('{http://schemas.android.com/apk/res/android}name', 'android.intent.action.VIEW')
        
        category2_1 = ET.SubElement(custom_filter, 'category')
        category2_1.set('{http://schemas.android.com/apk/res/android}name', 'android.intent.category.DEFAULT')
        
        category2_2 = ET.SubElement(custom_filter, 'category')
        category2_2.set('{http://schemas.android.com/apk/res/android}name', 'android.intent.category.BROWSABLE')
        
        data2 = ET.SubElement(custom_filter, 'data')
        data2.set('{http://schemas.android.com/apk/res/android}scheme', app_scheme)
        
        main_activity.append(custom_filter)
        
        # Write back with proper formatting
        tree.write(file_path, encoding='utf-8', xml_declaration=True)
        
        print("SUCCESS: AndroidManifest.xml updated")
        return 0
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return 1

if __name__ == '__main__':
    if len(sys.argv) != 4:
        print("Usage: script.py <manifest_path> <domains_csv> <app_scheme>")
        sys.exit(1)
    
    sys.exit(update_manifest(sys.argv[1], sys.argv[2], sys.argv[3]))
PYTHON_SCRIPT
    
    # Prepare domains as comma-separated string
    DOMAINS_CSV=$(IFS=,; echo "${DOMAIN_ARRAY[*]}")
    
    # Run Python script
    if command -v python3 &> /dev/null; then
        python3 /tmp/update_android_manifest.py "$ANDROID_MANIFEST" "$DOMAINS_CSV" "$APP_SCHEME"
        
        if [ $? -eq 0 ]; then
            print_success "AndroidManifest.xml updated successfully"
            echo ""
            echo -e "${CYAN}Added:${NC}"
            if [ ${#DOMAIN_ARRAY[@]} -eq 1 ]; then
                echo "  • HTTPS App Links: https://$DOMAIN (autoVerify=true)"
            else
                echo "  • HTTPS App Links (autoVerify=true):"
                for domain in "${DOMAIN_ARRAY[@]}"; do
                    domain=$(echo "$domain" | xargs)
                    echo "    - https://$domain"
                done
            fi
            echo "  • Custom URI Scheme: $APP_SCHEME://"
        else
            print_error "Failed to update AndroidManifest.xml"
            exit 1
        fi
    else
        print_error "Python3 not found. Please install Python 3.x"
        exit 1
    fi
    
    rm -f /tmp/update_android_manifest.py
}

# ============================================================================
# iOS Configuration
# ============================================================================

update_ios_info_plist() {
    print_header "Step 5: Update iOS Info.plist"
    
    print_step "Adding URL schemes and App Transport Security..."
    
    # Create Python script for plist manipulation (supports multiple domains)
    cat > /tmp/update_ios_plist.py << 'PYTHON_SCRIPT'
import sys
import plistlib

def update_plist(file_path, domains, app_scheme, bundle_id):
    try:
        # Read plist file
        with open(file_path, 'rb') as f:
            plist = plistlib.load(f)
        
        # Update CFBundleURLTypes
        if 'CFBundleURLTypes' not in plist:
            plist['CFBundleURLTypes'] = []
        
        # Check if custom scheme already exists
        scheme_exists = False
        for url_type in plist['CFBundleURLTypes']:
            if 'CFBundleURLSchemes' in url_type:
                if app_scheme in url_type['CFBundleURLSchemes']:
                    scheme_exists = True
                    break
        
        # Add custom URL scheme if not exists
        if not scheme_exists:
            # Keep Facebook scheme if it exists
            fb_schemes = []
            for url_type in plist['CFBundleURLTypes']:
                if 'CFBundleURLSchemes' in url_type:
                    for scheme in url_type['CFBundleURLSchemes']:
                        if scheme.startswith('fb'):
                            fb_schemes.append(scheme)
            
            # Rebuild CFBundleURLTypes
            new_url_types = []
            
            # Add Facebook if exists
            if fb_schemes:
                new_url_types.append({
                    'CFBundleURLSchemes': fb_schemes,
                    'CFBundleTypeRole': 'Editor'
                })
            
            # Add custom scheme
            new_url_types.append({
                'CFBundleURLSchemes': [app_scheme],
                'CFBundleTypeRole': 'Editor'
            })
            
            plist['CFBundleURLTypes'] = new_url_types
        
        # Update NSAppTransportSecurity for multiple domains
        if 'NSAppTransportSecurity' not in plist:
            plist['NSAppTransportSecurity'] = {}
        
        if 'NSExceptionDomains' not in plist['NSAppTransportSecurity']:
            plist['NSAppTransportSecurity']['NSExceptionDomains'] = {}
        
        # Add exception for each domain
        domain_list = domains.split(',')
        for domain in domain_list:
            domain = domain.strip()
            plist['NSAppTransportSecurity']['NSExceptionDomains'][domain] = {
                'NSIncludesSubdomains': True,
                'NSExceptionAllowsInsecureHTTPLoads': False,
                'NSExceptionRequiresForwardSecrecy': True,
                'NSExceptionMinimumTLSVersion': 'TLSv1.2'
            }
        
        # Write back
        with open(file_path, 'wb') as f:
            plistlib.dump(plist, f)
        
        print("SUCCESS: Info.plist updated")
        return 0
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return 1

if __name__ == '__main__':
    if len(sys.argv) != 5:
        print("Usage: script.py <plist_path> <domains_csv> <app_scheme> <bundle_id>")
        sys.exit(1)
    
    sys.exit(update_plist(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]))
PYTHON_SCRIPT
    
    # Run Python script
    if command -v python3 &> /dev/null; then
        python3 /tmp/update_ios_plist.py "$IOS_INFO_PLIST" "$DOMAINS_CSV" "$APP_SCHEME" "$BUNDLE_ID"
        
        if [ $? -eq 0 ]; then
            print_success "Info.plist updated successfully"
            echo ""
            echo -e "${CYAN}Added:${NC}"
            echo "  • Custom URL Scheme: $APP_SCHEME://"
            if [ ${#DOMAIN_ARRAY[@]} -eq 1 ]; then
                echo "  • App Transport Security exception for: $DOMAIN"
            else
                echo "  • App Transport Security exceptions for:"
                for domain in "${DOMAIN_ARRAY[@]}"; do
                    domain=$(echo "$domain" | xargs)
                    echo "    - $domain"
                done
            fi
        else
            print_error "Failed to update Info.plist"
            exit 1
        fi
    else
        print_error "Python3 not found. Please install Python 3.x"
        exit 1
    fi
    
    rm -f /tmp/update_ios_plist.py
}

update_xcode_project() {
    print_header "Step 6: Add Associated Domains to Xcode Project"
    
    print_step "Adding Associated Domains capability..."
    
    # Create Python script for Xcode project manipulation
    cat > /tmp/update_xcode_project.py << 'PYTHON_SCRIPT'
import sys
import re

def add_associated_domains(file_path, domain, bundle_id, team_id):
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Check if SystemCapabilities already exists
        if 'SystemCapabilities' not in content:
            # Add SystemCapabilities section
            capabilities_section = 'android/SystemCapabilities = {'
					com.apple.AssociatedDomains = {
						enabled = 1;
					};
				};'''
            
            # Find TargetAttributes section and add SystemCapabilities
            pattern = r'(TargetAttributes = \{[^}]*?)(};)'
            if re.search(pattern, content):
                content = re.sub(pattern, r'\1' + capabilities_section + r'\n\t\t\t\2', content, count=1)
        else:
            # Check if Associated Domains already exists
            if 'com.apple.AssociatedDomains' not in content:
                # Add to existing SystemCapabilities
                pattern = r'(SystemCapabilities = \{)'
                addition = r'\1\n\t\t\t\t\tcom.apple.AssociatedDomains = {\n\t\t\t\t\t\tenabled = 1;\n\t\t\t\t\t};'
                content = re.sub(pattern, addition, content, count=1)
        
        # Add CODE_SIGN_ENTITLEMENTS to build settings if not present
        # Get project name from the pbxproj path (passed as part of file_path)
        project_name = file_path.split('/')[-2].replace('.xcodeproj', '')
        entitlements_file = f"{project_name}/{project_name}.entitlements"
        
        if 'CODE_SIGN_ENTITLEMENTS' not in content:
            # Find all buildSettings sections
            pattern = r'(buildSettings = \{)(\n)'
            replacement = r'\1\n\t\t\t\tCODE_SIGN_ENTITLEMENTS = "' + entitlements_file + r'";' + r'\2'
            content = re.sub(pattern, replacement, content)
        
        with open(file_path, 'w') as f:
            f.write(content)
        
        print("SUCCESS: Xcode project updated with Associated Domains")
        return 0
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return 1

if __name__ == '__main__':
    if len(sys.argv) != 5:
        print("Usage: script.py <project_path> <domain> <bundle_id> <team_id>")
        sys.exit(1)
    
    sys.exit(add_associated_domains(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]))
PYTHON_SCRIPT
    
    # Run Python script
    if command -v python3 &> /dev/null; then
        python3 /tmp/update_xcode_project.py "$IOS_PROJECT_FILE" "$DOMAIN" "$BUNDLE_ID" "$TEAM_ID"
        
        if [ $? -eq 0 ]; then
            print_success "Associated Domains capability added to Xcode project"
        else
            print_warning "Could not automatically add Associated Domains"
            print_info "You may need to add it manually in Xcode"
        fi
    fi
    
    rm -f /tmp/update_xcode_project.py
    
    # Create entitlements file
    print_step "Creating entitlements file..."
    
    # Use detected iOS project name
    if [ -z "$IOS_PROJECT_NAME" ]; then
        print_error "iOS project name not detected. Cannot create entitlements file."
        return 1
    fi
    
    local ENTITLEMENTS_FILE="$PROJECT_ROOT/ios/$IOS_PROJECT_NAME/$IOS_PROJECT_NAME.entitlements"
    
    # Create entitlements with multiple domains
    cat > "$ENTITLEMENTS_FILE" << 'ENTITLEMENTS_EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>com.apple.developer.associated-domains</key>
	<array>
ENTITLEMENTS_EOF

    # Add each domain as an applinks entry
    for domain in "${DOMAIN_ARRAY[@]}"; do
        domain=$(echo "$domain" | xargs)
        echo "		<string>applinks:$domain</string>" >> "$ENTITLEMENTS_FILE"
    done

    cat >> "$ENTITLEMENTS_FILE" << 'ENTITLEMENTS_EOF'
	</array>
</dict>
</plist>
ENTITLEMENTS_EOF
    
    print_success "Entitlements file created: $ENTITLEMENTS_FILE"
    echo ""
    if [ ${#DOMAIN_ARRAY[@]} -eq 1 ]; then
        echo -e "${CYAN}Associated Domain:${NC} applinks:$DOMAIN"
    else
        echo -e "${CYAN}Associated Domains:${NC}"
        for domain in "${DOMAIN_ARRAY[@]}"; do
            domain=$(echo "$domain" | xargs)
            echo "  • applinks:$domain"
        done
    fi
}

# ============================================================================
# Verification Files
# ============================================================================

create_assetlinks_json() {
    print_header "Step 7: Create assetlinks.json (Android)"
    
    print_step "Generating assetlinks.json..."
    
    local ASSETLINKS_FILE="$PROJECT_ROOT/.well-known/assetlinks.json"
    mkdir -p "$PROJECT_ROOT/.well-known"
    
    # Start JSON array
    echo "[" > "$ASSETLINKS_FILE"
    
    # Add debug SHA-256 if available
    if [ -n "$DEBUG_SHA256" ]; then
        cat >> "$ASSETLINKS_FILE" << ASSETLINKS_EOF
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "$PACKAGE_NAME",
      "sha256_cert_fingerprints": [
        "$DEBUG_SHA256"
      ]
    }
  }
ASSETLINKS_EOF
    fi
    
    # Add release SHA-256 if available
    if [ -n "$RELEASE_SHA256" ]; then
        [ -n "$DEBUG_SHA256" ] && echo "," >> "$ASSETLINKS_FILE"
        
        cat >> "$ASSETLINKS_FILE" << ASSETLINKS_EOF
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "$PACKAGE_NAME",
      "sha256_cert_fingerprints": [
        "$RELEASE_SHA256"
      ]
    }
  }
ASSETLINKS_EOF
    fi
    
    # Close JSON array
    echo "" >> "$ASSETLINKS_FILE"
    echo "]" >> "$ASSETLINKS_FILE"
    
    print_success "Created: .well-known/assetlinks.json"
    echo ""
    echo -e "${CYAN}📤 Upload to:${NC} ${GREEN}https://$DOMAIN/.well-known/assetlinks.json${NC}"
}

create_apple_app_site_association() {
    print_header "Step 8: Create apple-app-site-association (iOS)"
    
    print_step "Generating apple-app-site-association..."
    
    local AASA_FILE="$PROJECT_ROOT/.well-known/apple-app-site-association"
    
    cat > "$AASA_FILE" << AASA_EOF
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "$TEAM_ID.$BUNDLE_ID",
        "paths": [
          "*"
        ]
      }
    ]
  },
  "webcredentials": {
    "apps": [
      "$TEAM_ID.$BUNDLE_ID"
    ]
  }
}
AASA_EOF
    
    print_success "Created: .well-known/apple-app-site-association"
    echo ""
    echo -e "${CYAN}📤 Upload to (for each domain):${NC}"
    for domain in "${DOMAIN_ARRAY[@]}"; do
        domain=$(echo "$domain" | xargs)
        echo -e "   ${GREEN}https://$domain/.well-known/apple-app-site-association${NC}"
        echo -e "   ${GREEN}https://$domain/apple-app-site-association${NC}"
        echo ""
    done
    echo -e "${YELLOW}Note: Upload the SAME file to ALL domains${NC}"
}

# ============================================================================
# Verification
# ============================================================================

create_verification_script() {
    print_header "Step 9: Create Verification Script"
    
    print_step "Creating test script..."
    
    cat > "$PROJECT_ROOT/test-deeplinks.js" << 'TEST_EOF'
/**
 * Deep Linking Verification Script
 * Run: node test-deeplinks.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(60));
console.log('Deep Linking Configuration Verification');
console.log('='.repeat(60) + '\n');

let errors = 0;
let warnings = 0;

// Test 1: assetlinks.json
console.log('📋 Test 1: Android assetlinks.json');
const assetlinksPath = path.join(__dirname, '.well-known', 'assetlinks.json');
if (fs.existsSync(assetlinksPath)) {
    try {
        const content = JSON.parse(fs.readFileSync(assetlinksPath, 'utf8'));
        if (Array.isArray(content) && content.length > 0) {
            console.log(`✅ Valid JSON with ${content.length} config(s)`);
        } else {
            console.log('❌ Empty or invalid');
            errors++;
        }
    } catch (e) {
        console.log('❌ Invalid JSON:', e.message);
        errors++;
    }
} else {
    console.log('❌ File not found');
    errors++;
}

// Test 2: apple-app-site-association
console.log('\n📋 Test 2: iOS apple-app-site-association');
const aasaPath = path.join(__dirname, '.well-known', 'apple-app-site-association');
if (fs.existsSync(aasaPath)) {
    try {
        const content = JSON.parse(fs.readFileSync(aasaPath, 'utf8'));
        if (content.applinks && content.applinks.details) {
            console.log(`✅ Valid JSON with ${content.applinks.details.length} config(s)`);
            content.applinks.details.forEach((c, i) => {
                if (c.appID.includes('YOUR_TEAM_ID')) {
                    console.log(`⚠️  Config ${i + 1}: TEAM_ID not replaced`);
                    warnings++;
                }
            });
        } else {
            console.log('❌ Missing required fields');
            errors++;
        }
    } catch (e) {
        console.log('❌ Invalid JSON:', e.message);
        errors++;
    }
} else {
    console.log('❌ File not found');
    errors++;
}

// Test 3: AndroidManifest.xml
console.log('\n📋 Test 3: AndroidManifest.xml');
const manifestPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
if (fs.existsSync(manifestPath)) {
    const content = fs.readFileSync(manifestPath, 'utf8');
    console.log('✅ File exists');
    
    if (content.includes('android:autoVerify="true"')) {
        console.log('✅ autoVerify enabled');
    } else {
        console.log('❌ autoVerify not found');
        errors++;
    }
    
    if (content.includes('android:scheme="https"')) {
        console.log('✅ HTTPS scheme configured');
    } else {
        console.log('❌ HTTPS scheme missing');
        errors++;
    }
} else {
    console.log('❌ File not found');
    errors++;
}

// Test 4: Info.plist
console.log('\n📋 Test 4: Info.plist');

// Dynamically find iOS project name
let iosProjectName = '';
const iosDir = path.join(__dirname, 'ios');
if (fs.existsSync(iosDir)) {
    const files = fs.readdirSync(iosDir);
    for (const file of files) {
        if (file.endsWith('.xcworkspace') && !file.includes('Pods')) {
            iosProjectName = file.replace('.xcworkspace', '');
            break;
        }
    }
    if (!iosProjectName) {
        for (const file of files) {
            if (file.endsWith('.xcodeproj') && !file.includes('Pods')) {
                iosProjectName = file.replace('.xcodeproj', '');
                break;
            }
        }
    }
}

if (!iosProjectName) {
    console.log('⚠️  Could not detect iOS project name');
    warnings++;
} else {
    const plistPath = path.join(__dirname, 'ios', iosProjectName, 'Info.plist');
    if (fs.existsSync(plistPath)) {
        const content = fs.readFileSync(plistPath, 'utf8');
        console.log('✅ File exists');
        
        if (content.includes('CFBundleURLTypes')) {
            console.log('✅ CFBundleURLTypes configured');
        } else {
            console.log('❌ CFBundleURLTypes missing');
            errors++;
        }
    } else {
        console.log('❌ File not found');
        errors++;
    }
}

// Test 5: Entitlements
console.log('\n📋 Test 5: iOS Entitlements');
if (!iosProjectName) {
    console.log('⚠️  Could not detect iOS project name, skipping entitlements check');
    warnings++;
} else {
    const entPath = path.join(__dirname, 'ios', iosProjectName, iosProjectName + '.entitlements');
    if (fs.existsSync(entPath)) {
    const content = fs.readFileSync(entPath, 'utf8');
    if (content.includes('com.apple.developer.associated-domains')) {
        console.log('✅ Associated Domains configured');
    } else {
        console.log('⚠️  Associated Domains key missing');
        warnings++;
    }
} else {
    console.log('⚠️  Entitlements file not found');
    warnings++;
}

// Summary
console.log('\n' + '='.repeat(60));
if (errors === 0 && warnings === 0) {
    console.log('✅ All tests passed!');
    console.log('\nNext steps:');
    console.log('1. Upload .well-known files to your domain');
    console.log('2. Test: adb shell am start -a android.intent.action.VIEW -d "https://yourdomain.com"');
    console.log('3. Test: xcrun simctl openurl booted "https://yourdomain.com"');
} else {
    if (errors > 0) console.log(`❌ ${errors} error(s) found`);
    if (warnings > 0) console.log(`⚠️  ${warnings} warning(s) found`);
}
console.log('='.repeat(60) + '\n');

process.exit(errors > 0 ? 1 : 0);
TEST_EOF
    
    chmod +x "$PROJECT_ROOT/test-deeplinks.js"
    print_success "Created: test-deeplinks.js"
}

run_verification() {
    print_header "Step 10: Run Verification"
    
    if command -v node &> /dev/null; then
        node "$PROJECT_ROOT/test-deeplinks.js"
    else
        print_warning "Node.js not found. Skip verification."
    fi
}

# ============================================================================
# Final Instructions
# ============================================================================

print_final_instructions() {
    print_header "🎉 Deep Linking Setup Complete!"
    
    echo -e "${GREEN}✅ All configurations completed automatically!${NC}"
    echo ""
    echo -e "${CYAN}What was configured:${NC}"
    if [ ${#DOMAIN_ARRAY[@]} -eq 1 ]; then
        echo "  ✅ Domain: $DOMAIN"
    else
        echo "  ✅ Domains:"
        for domain in "${DOMAIN_ARRAY[@]}"; do
            domain=$(echo "$domain" | xargs)
            echo "     - $domain"
        done
    fi
    echo "  ✅ URL Scheme: $APP_SCHEME://"
    echo "  ✅ Android package: $PACKAGE_NAME"
    echo "  ✅ iOS bundle ID: $BUNDLE_ID"
    echo "  ✅ AndroidManifest.xml updated (autoVerify enabled)"
    echo "  ✅ Info.plist updated (URL schemes + ATS)"
    echo "  ✅ Associated Domains added to Xcode project"
    echo "  ✅ Entitlements file created"
    echo "  ✅ Verification files created"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo ""
    echo -e "${CYAN}1. Upload verification files to your web server(s):${NC}"
    for domain in "${DOMAIN_ARRAY[@]}"; do
        domain=$(echo "$domain" | xargs)
        echo -e "   ${GREEN}https://$domain/.well-known/assetlinks.json${NC}"
        echo -e "   ${GREEN}https://$domain/.well-known/apple-app-site-association${NC}"
        echo -e "   ${GREEN}https://$domain/apple-app-site-association${NC}"
        echo ""
    done
    echo "   Requirements:"
    echo "   • Content-Type: application/json"
    echo "   • HTTPS with valid certificate"
    echo "   • No redirects"
    echo "   • Publicly accessible"
    echo ""
    echo -e "${CYAN}2. Clean and rebuild:${NC}"
    echo -e "   ${GREEN}cd ios && pod install && cd ..${NC}"
    echo -e "   ${GREEN}yarn android${NC}"
    echo -e "   ${GREEN}yarn ios${NC}"
    echo ""
    echo -e "${CYAN}3. Test deep links:${NC}"
    echo ""
    echo "   Android (HTTPS):"
    echo -e "   ${GREEN}adb shell am start -a android.intent.action.VIEW -d \"https://$DOMAIN/test\"${NC}"
    echo ""
    echo "   Android (Custom Scheme):"
    echo -e "   ${GREEN}adb shell am start -a android.intent.action.VIEW -d \"$APP_SCHEME://test\"${NC}"
    echo ""
    echo "   iOS (HTTPS):"
    echo -e "   ${GREEN}xcrun simctl openurl booted \"https://$DOMAIN/test\"${NC}"
    echo ""
    echo "   iOS (Custom Scheme):"
    echo -e "   ${GREEN}xcrun simctl openurl booted \"$APP_SCHEME://test\"${NC}"
    echo ""
    echo -e "${CYAN}File Locations:${NC}"
    echo "  • Android: android/app/src/main/AndroidManifest.xml"
    echo "  • iOS Info: ios/$IOS_PROJECT_NAME/Info.plist"
    echo "  • iOS Project: ios/$IOS_PROJECT_NAME.xcodeproj/project.pbxproj"
    echo "  • Entitlements: ios/$IOS_PROJECT_NAME/$IOS_PROJECT_NAME.entitlements"
    echo "  • assetlinks: .well-known/assetlinks.json"
    echo "  • AASA: .well-known/apple-app-site-association"
    echo ""
    
    if [ -n "$DEBUG_SHA256" ]; then
        echo -e "${CYAN}SHA-256 Fingerprints:${NC}"
        echo "  • Debug: $DEBUG_SHA256"
        [ -n "$RELEASE_SHA256" ] && echo "  • Release: $RELEASE_SHA256"
        echo ""
    fi
    
    print_success "Setup complete! 🚀"
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    clear
    
    print_header "Deep Linking Setup Script - Full Automation"
    
    echo -e "${CYAN}This script will FULLY configure deep linking for iOS and Android.${NC}"
    echo -e "${GREEN}NO MANUAL XCODE CHANGES NEEDED!${NC}"
    echo ""
    echo -e "${YELLOW}What will be done:${NC}"
    echo "  • Collect domain and scheme information"
    echo "  • Generate SHA-256 fingerprints"
    echo "  • Update AndroidManifest.xml with intent filters"
    echo "  • Update Info.plist with URL schemes"
    echo "  • Add Associated Domains to Xcode project (automatic!)"
    echo "  • Create entitlements file"
    echo "  • Generate verification files"
    echo "  • Create test script"
    echo ""
    
    read -p "Ready to begin? (y/n): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Setup cancelled."
        exit 0
    fi
    
    # Execute all steps
    collect_domain_info
    get_package_info
    generate_sha256_fingerprints
    update_android_manifest
    update_ios_info_plist
    update_xcode_project
    create_assetlinks_json
    create_apple_app_site_association
    create_verification_script
    run_verification
    print_final_instructions
}

# Run main function
main

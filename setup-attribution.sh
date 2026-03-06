#!/bin/bash

# ============================================================================
# RevenueCat IDFA Attribution Setup Script
# ============================================================================
# This script installs the required dependency for IDFA attribution
# Run this script from the project root directory
# ============================================================================

set -e  # Exit on error

echo "🚀 Starting RevenueCat IDFA Attribution Setup..."
echo ""

# Check if we're in the project root
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found!"
  echo "   Please run this script from the project root directory"
  exit 1
fi

echo "✅ Found package.json"
echo ""

# ============================================================================
# Step 1: Install react-native-device-info
# ============================================================================

echo "📦 Step 1: Installing react-native-device-info..."
echo ""

if command -v yarn &> /dev/null; then
  echo "   Using yarn..."
  yarn add react-native-device-info
else
  echo "   Using npm..."
  npm install react-native-device-info
fi

echo ""
echo "✅ react-native-device-info installed"
echo ""

# ============================================================================
# Step 2: iOS - Install CocoaPods
# ============================================================================

if [ -d "ios" ]; then
  echo "📱 Step 2: Installing iOS pods..."
  echo ""
  
  cd ios
  
  if command -v pod &> /dev/null; then
    echo "   Running pod install..."
    pod install
    echo ""
    echo "✅ iOS pods installed"
  else
    echo "⚠️  CocoaPods not found. Please install it first:"
    echo "   sudo gem install cocoapods"
    echo "   Then run: cd ios && pod install && cd .."
  fi
  
  cd ..
  echo ""
else
  echo "⚠️  ios/ directory not found, skipping pod install"
  echo ""
fi

# ============================================================================
# Step 3: Verify Installation
# ============================================================================

echo "🔍 Step 3: Verifying installation..."
echo ""

# Check if dependency is in package.json
if grep -q "react-native-device-info" package.json; then
  echo "✅ react-native-device-info is in package.json"
else
  echo "❌ react-native-device-info NOT found in package.json"
fi

# Check if iOS pod is installed
if [ -f "ios/Podfile.lock" ] && grep -q "RNDeviceInfo" ios/Podfile.lock; then
  echo "✅ RNDeviceInfo pod is installed"
elif [ -d "ios" ]; then
  echo "⚠️  RNDeviceInfo pod NOT found in Podfile.lock"
fi

echo ""

# ============================================================================
# Summary
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Installation Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Build and run your app:"
echo "   iOS:     npm run ios"
echo "   Android: npm run android"
echo ""
echo "2. Grant ATT permission when prompted (iOS)"
echo ""
echo "3. Make a test purchase"
echo ""
echo "4. Verify in RevenueCat Dashboard:"
echo "   https://app.revenuecat.com/"
echo "   → Customers → Select customer → Subscriber Attributes"
echo ""
echo "5. Check console logs for:"
echo "   ✅ [RevenueCat Attribution] Device identifiers collected"
echo "   ✅ [RevenueCat Attribution] AppsFlyer ID set"
echo "   ✅ [RevenueCat Attribution] Attribution setup completed"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start:  ATTRIBUTION_QUICK_START.md"
echo "   - Full Docs:    REVENUECAT_ATTRIBUTION.md"
echo "   - Checklist:    IMPLEMENTATION_CHECKLIST.md"
echo "   - Summary:      IMPLEMENTATION_SUMMARY.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Setup complete! Happy coding!"
echo ""

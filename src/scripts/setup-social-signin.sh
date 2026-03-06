#!/bin/bash

# Social Sign-In Quick Setup Script
# Run: chmod +x setup-social-signin.sh && ./setup-social-signin.sh

echo "🔐 Social Sign-In Quick Setup"
echo "=============================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
fi

echo "📝 Please provide the following credentials:"
echo ""

# Get Google Web Client ID
read -p "Enter GOOGLE_WEB_CLIENT_ID (from Google Cloud Console): " GOOGLE_CLIENT_ID
if [ ! -z "$GOOGLE_CLIENT_ID" ]; then
    if grep -q "GOOGLE_WEB_CLIENT_ID" .env; then
        # Update existing
        sed -i.bak "s|GOOGLE_WEB_CLIENT_ID=.*|GOOGLE_WEB_CLIENT_ID=$GOOGLE_CLIENT_ID|" .env
    else
        # Add new
        echo "GOOGLE_WEB_CLIENT_ID=$GOOGLE_CLIENT_ID" >> .env
    fi
    echo "✅ Google Web Client ID added to .env"
fi

# Get Apple Service ID (optional)
read -p "Enter APPLE_SERVICE_ID (optional, for Android): " APPLE_SERVICE_ID
if [ ! -z "$APPLE_SERVICE_ID" ]; then
    if grep -q "APPLE_SERVICE_ID" .env; then
        sed -i.bak "s|APPLE_SERVICE_ID=.*|APPLE_SERVICE_ID=$APPLE_SERVICE_ID|" .env
    else
        echo "APPLE_SERVICE_ID=$APPLE_SERVICE_ID" >> .env
    fi
    echo "✅ Apple Service ID added to .env"
fi

echo ""
echo "🔍 Checking Android SHA-1 fingerprint..."
echo ""

# Get Android SHA-1
cd android
./gradlew signingReport | grep "SHA1:" | head -1
cd ..

echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Android Configuration:"
echo "   - Copy the SHA-1 fingerprint above"
echo "   - Add to Google Cloud Console → Credentials → Android OAuth Client"
echo ""
echo "2. iOS Configuration:"
echo "   - Open: ios/Template.xcworkspace"
echo "   - Add 'Sign in with Apple' capability"
echo "   - Add URL scheme to Info.plist (see SOCIAL_SIGNIN_GUIDE.md)"
echo ""
echo "3. Add Logo Icons:"
echo "   - Download Google logo → src/assets/icons/google-logo.png"
echo "   - Download Apple logo → src/assets/icons/apple-logo.png"
echo ""
echo "4. Install Pods (iOS):"
echo "   cd ios && pod install && cd .."
echo ""
echo "5. Backend Setup:"
echo "   - Implement /auth/google endpoint"
echo "   - Implement /auth/apple endpoint"
echo "   - Validate tokens server-side"
echo ""
echo "📖 For detailed instructions, see: SOCIAL_SIGNIN_GUIDE.md"
echo ""
echo "✨ Configuration updated! Run 'yarn android' or 'yarn ios' to test."

#!/bin/bash
# Toggle the active Ads SDK between AdMob and AppLovin MAX.
# Comments out (does not delete) all integration points of the inactive vendor:
# imports, calls, services, components, native config (Podfile, build.gradle,
# AndroidManifest.xml, Info.plist), .env keys, and JSON deps (package.json, app.json).
#
# Usage:
#   bash src/scripts/toggle-ads-sdk.sh admob       # enable AdMob, disable AppLovin
#   bash src/scripts/toggle-ads-sdk.sh applovin    # enable AppLovin, disable AdMob
#   bash src/scripts/toggle-ads-sdk.sh status      # show current active vendor
#   bash src/scripts/toggle-ads-sdk.sh admob --no-cleanup    # skip pod/gradle/npm

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./_toggle-lib.sh
source "$SCRIPT_DIR/_toggle-lib.sh"

if [ ! -f "package.json" ]; then
    print_error "Run this script from the project root."
    exit 1
fi

ACTION="${1:-}"
if [ "${2:-}" = "--no-cleanup" ]; then export NO_CLEANUP=1; fi

# --- file manifests (lines wrapped in @feature:<name>:start/end markers) ---

ADMOB_FILES=(
    "src/InitializationFlow/types.ts"
    "src/InitializationFlow/sdks/index.ts"
    "src/InitializationFlow/parallel/deferredSDKs.ts"
    "src/InitializationFlow/consent/showConsent.ts"
    "src/InitializationFlow/sdks/setupAdMob.ts"
    "src/services/AdMob/AdMobService.ts"
    "src/services/AdMob/BannerAds.tsx"
    "src/services/AdMob/InterstitialAds.ts"
    "src/services/AdMob/AppOpenAds.ts"
    "src/services/AdMob/RewardedAds.ts"
    "src/services/AdMob/interstitial.ts"
    "src/components/ads/BannerAdComponent.tsx"
    "src/components/ads/NativeAdComponent.tsx"
    "src/components/ads/DetailNativeAd.tsx"
    "src/components/ads/ListNativeAd.tsx"
    "src/components/ads/QaidaListNativeAd.tsx"
    "src/components/ads/QuranListNativeAd.tsx"
    "src/components/ads/SurahListNativeAd.tsx"
    "src/navigation/TabNavigator.tsx"
    "src/navigation/RootNavigator.tsx"
    "src/contexts/AppContext.tsx"
    "src/screens/PaywallScreen/index.tsx"
    "src/components/PaywallModal/PaywallModal.tsx"
    "src/config/env.ts"
    ".env"
    "android/app/src/main/AndroidManifest.xml"
    "ios/Project_Structure/Info.plist"
)

APPLOVIN_FILES=(
    "src/InitializationFlow/types.ts"
    "src/InitializationFlow/sdks/index.ts"
    "src/InitializationFlow/parallel/deferredSDKs.ts"
    "src/InitializationFlow/consent/showConsent.ts"
    "src/InitializationFlow/sdks/setupAppLovin.ts"
    "src/services/AppLovinService.ts"
    "src/navigation/TabNavigator.tsx"
    "src/config/env.ts"
    ".env"
    "ios/Podfile"
    "android/build.gradle"
    "android/app/build.gradle"
)

# JSON deps (no comment syntax -> key-rename approach)
ADMOB_JSON_DEPS=(
    "package.json:react-native-google-mobile-ads"
    "app.json:react-native-google-mobile-ads"
)
APPLOVIN_JSON_DEPS=(
    "package.json:react-native-applovin-max"
)

apply_admob() {
    print_header "Enabling AdMob, disabling AppLovin MAX"
    walk_files "admob"        "uncomment" "${ADMOB_FILES[@]}"
    walk_files "applovin-max" "comment"   "${APPLOVIN_FILES[@]}"
    for entry in "${ADMOB_JSON_DEPS[@]}";    do uncomment_json_dep "${entry%%:*}" "${entry#*:}"; done
    for entry in "${APPLOVIN_JSON_DEPS[@]}"; do comment_json_dep   "${entry%%:*}" "${entry#*:}"; done
    write_state "ads" "admob"
}

apply_applovin() {
    print_header "Enabling AppLovin MAX, disabling AdMob"
    walk_files "applovin-max" "uncomment" "${APPLOVIN_FILES[@]}"
    walk_files "admob"        "comment"   "${ADMOB_FILES[@]}"
    for entry in "${APPLOVIN_JSON_DEPS[@]}"; do uncomment_json_dep "${entry%%:*}" "${entry#*:}"; done
    for entry in "${ADMOB_JSON_DEPS[@]}";    do comment_json_dep   "${entry%%:*}" "${entry#*:}"; done
    write_state "ads" "applovin"
}

show_status() {
    ensure_state_file
    local current
    current="$(read_state ads)"
    print_info "Active Ads SDK: ${current:-unknown}"
}

case "$ACTION" in
    admob)
        apply_admob
        run_yarn_install
        run_pod_install
        run_gradle_clean
        print_success "Ads SDK is now: AdMob"
        ;;
    applovin|applovin-max)
        apply_applovin
        run_yarn_install
        run_pod_install
        run_gradle_clean
        print_success "Ads SDK is now: AppLovin MAX"
        ;;
    status)
        show_status
        ;;
    *)
        print_error "Usage: bash $0 [admob|applovin|status] [--no-cleanup]"
        exit 1
        ;;
esac

#!/bin/bash
# Toggle the active Attribution SDK between Adjust and AppsFlyer.
# Comments out (does not delete) all integration points of the inactive vendor:
# imports, calls, services, native config (build.gradle, Info.plist,
# PrivacyInfo.xcprivacy), .env keys, and JSON deps (package.json).
#
# Usage:
#   bash src/scripts/toggle-attribution-sdk.sh adjust       # enable Adjust, disable AppsFlyer
#   bash src/scripts/toggle-attribution-sdk.sh appsflyer    # enable AppsFlyer, disable Adjust
#   bash src/scripts/toggle-attribution-sdk.sh status
#   bash src/scripts/toggle-attribution-sdk.sh adjust --no-cleanup

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

ADJUST_FILES=(
    "src/InitializationFlow/types.ts"
    "src/InitializationFlow/sdks/index.ts"
    "src/InitializationFlow/parallel/deferredSDKs.ts"
    "src/InitializationFlow/consent/showConsent.ts"
    "src/InitializationFlow/sdks/setupAdjust.ts"
    "src/services/RevenueCatAttribution.ts"
    "src/config/env.ts"
    ".env"
    "android/app/build.gradle"
    "ios/Project_Structure/Info.plist"
)

APPSFLYER_FILES=(
    "src/InitializationFlow/types.ts"
    "src/InitializationFlow/sdks/index.ts"
    "src/InitializationFlow/parallel/deferredSDKs.ts"
    "src/InitializationFlow/consent/showConsent.ts"
    "src/InitializationFlow/sdks/setupAppsFlyer.ts"
    "src/services/AppsFlyerService.ts"
    "src/services/RevenueCatAttribution.ts"
    "src/config/env.ts"
    ".env"
    "ios/Project_Structure/PrivacyInfo.xcprivacy"
)

ADJUST_JSON_DEPS=(
    "package.json:react-native-adjust"
)
APPSFLYER_JSON_DEPS=(
    "package.json:react-native-appsflyer"
)

apply_adjust() {
    print_header "Enabling Adjust, disabling AppsFlyer"
    walk_files "adjust"    "uncomment" "${ADJUST_FILES[@]}"
    walk_files "appsflyer" "comment"   "${APPSFLYER_FILES[@]}"
    for entry in "${ADJUST_JSON_DEPS[@]}";    do uncomment_json_dep "${entry%%:*}" "${entry#*:}"; done
    for entry in "${APPSFLYER_JSON_DEPS[@]}"; do comment_json_dep   "${entry%%:*}" "${entry#*:}"; done
    write_state "attribution" "adjust"
}

apply_appsflyer() {
    print_header "Enabling AppsFlyer, disabling Adjust"
    walk_files "appsflyer" "uncomment" "${APPSFLYER_FILES[@]}"
    walk_files "adjust"    "comment"   "${ADJUST_FILES[@]}"
    for entry in "${APPSFLYER_JSON_DEPS[@]}"; do uncomment_json_dep "${entry%%:*}" "${entry#*:}"; done
    for entry in "${ADJUST_JSON_DEPS[@]}";    do comment_json_dep   "${entry%%:*}" "${entry#*:}"; done
    write_state "attribution" "appsflyer"
}

show_status() {
    ensure_state_file
    local current
    current="$(read_state attribution)"
    print_info "Active Attribution SDK: ${current:-unknown}"
}

case "$ACTION" in
    adjust)
        apply_adjust
        run_yarn_install
        run_pod_install
        run_gradle_clean
        print_success "Attribution SDK is now: Adjust"
        ;;
    appsflyer)
        apply_appsflyer
        run_yarn_install
        run_pod_install
        run_gradle_clean
        print_success "Attribution SDK is now: AppsFlyer"
        ;;
    status)
        show_status
        ;;
    *)
        print_error "Usage: bash $0 [adjust|appsflyer|status] [--no-cleanup]"
        exit 1
        ;;
esac

#!/bin/bash
# Shared helpers for vendor-toggle scripts (admob/applovin).
# Strategy: every togglable region is bracketed by paired markers like:
#     // @feature:<name>:start   ...   // @feature:<name>:end
# Comment style is auto-detected from the START marker line. Supported styles:
#     "// "         (TS/JS/Gradle/Swift/Kotlin)
#     "# "          (sh / .env / Ruby)
#     "<!-- -->"    (XML / plist / xcprivacy)  -> per-line wrap
#     "{/* */}"     (TSX/JSX inside JSX bodies) -> per-line wrap
#
# Disabled state is recorded by appending " [disabled]" to the start marker line.
# Idempotent: re-running the same action is a no-op.
#
# For JSON files (package.json / app.json) we cannot use comments, so we toggle
# top-level keys by renaming "<key>" <-> "_disabled_<key>" via comment_json_dep
# / uncomment_json_dep helpers.

set -e

# ---------- color helpers ----------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_color() { echo -e "${1}${2}${NC}"; }
print_header() { echo; print_color "$BLUE" "============================================"; print_color "$BLUE" "$1"; print_color "$BLUE" "============================================"; echo; }
print_success() { print_color "$GREEN" "✓ $1"; }
print_error()   { print_color "$RED"   "✗ $1"; }
print_warning() { print_color "$YELLOW" "⚠ $1"; }
print_info()    { print_color "$BLUE"  "ℹ $1"; }

# ---------- core block toggler ----------
# toggle_block <file> <feature> <action: comment|uncomment>
toggle_block() {
    local file="$1" feature="$2" action="$3"

    if [ ! -f "$file" ]; then
        print_warning "skip (missing): $file"
        return 0
    fi

    # Quick check: does this file contain the marker?
    if ! grep -q "@feature:${feature}:start" "$file" 2>/dev/null; then
        return 0
    fi

    local tmp
    tmp="$(mktemp)"

    awk -v feature="$feature" -v action="$action" '
        function detect_style(line,    s) {
            # Returns one of: "slash", "hash", "xml", "jsx"
            # Uses indentation-stripped leading characters.
            s = line
            sub(/^[ \t]+/, "", s)
            if (s ~ /^\/\//) return "slash"
            if (s ~ /^#/)    return "hash"
            if (s ~ /^\{\/\*/) return "jsx"
            if (s ~ /^<!--/) return "xml"
            return "slash"  # fallback
        }
        function is_disabled(line) {
            return (line ~ /\[disabled\][ \t]*(\*\/}|-->)?[ \t]*$/) || (line ~ /\[disabled\][ \t]*$/)
        }
        function comment_line(line, style,    indent, body) {
            if (line ~ /^[ \t]*$/) return line  # leave blank lines alone
            # Capture leading whitespace
            indent = ""
            if (match(line, /^[ \t]+/)) {
                indent = substr(line, 1, RLENGTH)
                body   = substr(line, RLENGTH+1)
            } else {
                body = line
            }
            if (style == "slash") return indent "// " body
            if (style == "hash")  return indent "# " body
            if (style == "xml") {
                if (body ~ /^<!--/ && body ~ /-->[ \t]*$/) return line
                return indent "<!-- " body " -->"
            }
            if (style == "jsx") {
                if (body ~ /^\{\/\*/ && body ~ /\*\/\}[ \t]*$/) return line
                return indent "{/* " body " */}"
            }
            return line
        }
        function uncomment_line(line, style,    indent, body, rest) {
            if (line ~ /^[ \t]*$/) return line
            indent = ""
            if (match(line, /^[ \t]+/)) {
                indent = substr(line, 1, RLENGTH)
                body   = substr(line, RLENGTH+1)
            } else {
                body = line
            }
            if (style == "slash") {
                if (body ~ /^\/\/ /)      return indent substr(body, 4)
                if (body ~ /^\/\//)       return indent substr(body, 3)
                return line
            }
            if (style == "hash") {
                if (body ~ /^# /) return indent substr(body, 3)
                if (body ~ /^#/)  return indent substr(body, 2)
                return line
            }
            if (style == "xml") {
                if (body ~ /^<!-- / && body ~ / -->[ \t]*$/) {
                    rest = substr(body, 6)
                    sub(/ -->[ \t]*$/, "", rest)
                    return indent rest
                }
                if (body ~ /^<!--/ && body ~ /-->[ \t]*$/) {
                    rest = substr(body, 5)
                    sub(/-->[ \t]*$/, "", rest)
                    return indent rest
                }
                return line
            }
            if (style == "jsx") {
                if (body ~ /^\{\/\* / && body ~ / \*\/\}[ \t]*$/) {
                    rest = substr(body, 5)
                    sub(/ \*\/\}[ \t]*$/, "", rest)
                    return indent rest
                }
                if (body ~ /^\{\/\*/ && body ~ /\*\/\}[ \t]*$/) {
                    rest = substr(body, 4)
                    sub(/\*\/\}[ \t]*$/, "", rest)
                    return indent rest
                }
                return line
            }
            return line
        }
        BEGIN {
            inside = 0
            xml_open = 0   # tracks unclosed multi-line XML comment inside the block
            startpat = "@feature:" feature ":start"
            endpat   = "@feature:" feature ":end"
        }
        {
            line = $0
            if (!inside && index(line, startpat) > 0) {
                inside = 1
                xml_open = 0
                style = detect_style(line)
                disabled = is_disabled(line)
                if (action == "comment") {
                    if (!disabled) {
                        # Append " [disabled]" before any trailing close (--> or */})
                        if (line ~ /-->[ \t]*$/) {
                            sub(/[ \t]*-->[ \t]*$/, " [disabled] -->", line)
                        } else if (line ~ /\*\/\}[ \t]*$/) {
                            sub(/[ \t]*\*\/\}[ \t]*$/, " [disabled] */}", line)
                        } else {
                            line = line " [disabled]"
                        }
                    }
                } else if (action == "uncomment") {
                    if (disabled) {
                        sub(/[ \t]*\[disabled\]/, "", line)
                    }
                }
                print line
                next
            }
            if (inside && index(line, endpat) > 0) {
                inside = 0
                xml_open = 0
                print line
                next
            }
            if (inside) {
                # For XML style, never modify lines that are part of an
                # unclosed multi-line <!-- ... --> block (they are already
                # inert XML comments and re-wrapping would produce invalid
                # nested comments).
                skip = 0
                if (style == "xml") {
                    # If currently inside a multi-line comment, skip until it closes.
                    if (xml_open) {
                        skip = 1
                        if (index(line, "-->") > 0) xml_open = 0
                    } else {
                        # Detect a fresh "<!--" with no matching "-->" on the same line.
                        if (index(line, "<!--") > 0 && index(line, "-->") == 0) {
                            xml_open = 1
                            skip = 1
                        }
                    }
                }
                if (!skip) {
                    if (action == "comment") {
                        if (!disabled) line = comment_line(line, style)
                    } else if (action == "uncomment") {
                        if (disabled) line = uncomment_line(line, style)
                    }
                }
                print line
                next
            }
            print line
        }
    ' "$file" > "$tmp"

    if ! cmp -s "$file" "$tmp"; then
        mv "$tmp" "$file"
        print_success "$action @feature:$feature in $file"
    else
        rm -f "$tmp"
    fi
}

# Walk many files for one feature.
# walk_files <feature> <action> <file1> <file2> ...
walk_files() {
    local feature="$1" action="$2"
    shift 2
    for f in "$@"; do
        toggle_block "$f" "$feature" "$action"
    done
}

# ---------- JSON dependency / config key toggling ----------
# For package.json: move "<key>": "<version>" between "dependencies" and a
# top-level "disabledDependencies" object. Package managers (npm/yarn) ignore
# unknown top-level fields, so disabled deps are preserved without name mangling.
# For other JSON files (e.g. app.json) we fall back to renaming the key to
# "_disabled_<key>" since they have no "dependencies" object.
comment_json_dep() {
    local file="$1" key="$2"
    [ -f "$file" ] || { print_warning "skip (missing): $file"; return 0; }
    if [ "$(basename "$file")" = "package.json" ]; then
        node - "$file" "$key" disable <<'NODE_EOF' && print_success "disabled $key in $file"
const fs = require('fs');
const [,, file, key, action] = process.argv;
const j = JSON.parse(fs.readFileSync(file, 'utf8'));
j.disabledDependencies = j.disabledDependencies || {};
if (action === 'disable') {
  if (j.dependencies && key in j.dependencies) {
    j.disabledDependencies[key] = j.dependencies[key];
    delete j.dependencies[key];
  } else { process.exit(0); }
} else {
  if (j.disabledDependencies && key in j.disabledDependencies) {
    j.dependencies = j.dependencies || {};
    j.dependencies[key] = j.disabledDependencies[key];
    delete j.disabledDependencies[key];
  } else { process.exit(0); }
}
if (Object.keys(j.disabledDependencies).length === 0) delete j.disabledDependencies;
fs.writeFileSync(file, JSON.stringify(j, null, 2) + '\n');
NODE_EOF
    else
        if grep -q "\"_disabled_${key}\"" "$file"; then return 0; fi
        if ! grep -q "\"${key}\"" "$file"; then return 0; fi
        perl -i -pe "s/\"\Q${key}\E\"/\"_disabled_${key}\"/g" "$file"
        print_success "disabled $key in $file"
    fi
}

uncomment_json_dep() {
    local file="$1" key="$2"
    [ -f "$file" ] || { print_warning "skip (missing): $file"; return 0; }
    if [ "$(basename "$file")" = "package.json" ]; then
        node - "$file" "$key" enable <<'NODE_EOF' && print_success "enabled $key in $file"
const fs = require('fs');
const [,, file, key] = process.argv;
const j = JSON.parse(fs.readFileSync(file, 'utf8'));
if (j.disabledDependencies && key in j.disabledDependencies) {
  j.dependencies = j.dependencies || {};
  j.dependencies[key] = j.disabledDependencies[key];
  delete j.disabledDependencies[key];
  if (Object.keys(j.disabledDependencies).length === 0) delete j.disabledDependencies;
  fs.writeFileSync(file, JSON.stringify(j, null, 2) + '\n');
} else { process.exit(0); }
NODE_EOF
    else
        if ! grep -q "\"_disabled_${key}\"" "$file"; then return 0; fi
        perl -i -pe "s/\"_disabled_\Q${key}\E\"/\"${key}\"/g" "$file"
        print_success "enabled $key in $file"
    fi
}

# ---------- state file ----------
STATE_FILE="src/scripts/.toggle-state.json"

ensure_state_file() {
    if [ ! -f "$STATE_FILE" ]; then
        mkdir -p "$(dirname "$STATE_FILE")"
        echo '{ "ads": "admob", "attribution": "adjust" }' > "$STATE_FILE"
    fi
}

read_state() {
    # read_state <pair-key>  -> echoes value
    local key="$1"
    ensure_state_file
    perl -ne 'if(/"'"$key"'"\s*:\s*"([^"]+)"/){print $1; exit}' "$STATE_FILE"
}

write_state() {
    # write_state <pair-key> <value>
    local key="$1" value="$2"
    ensure_state_file
    perl -i -pe "s/\"$key\"\s*:\s*\"[^\"]+\"/\"$key\": \"$value\"/" "$STATE_FILE"
}

# ---------- side-effects ----------
run_pod_install() {
    if [ "$NO_CLEANUP" = "1" ]; then print_info "skip pod install (--no-cleanup)"; return 0; fi
    if [ ! -d "ios" ]; then return 0; fi
    print_header "Running pod install"
    ( cd ios && pod install ) || print_warning "pod install failed (continuing)"
}

run_gradle_clean() {
    if [ "$NO_CLEANUP" = "1" ]; then print_info "skip gradle clean (--no-cleanup)"; return 0; fi
    if [ ! -f "android/gradlew" ]; then return 0; fi
    # Nuke stale C++/codegen caches BEFORE gradle clean. After yarn install, paths
    # under node_modules/*/android/build/generated/source/codegen/jni may have moved
    # or been deleted, but Android-autolinking.cmake still references the old paths.
    # Removing these folders forces Gradle to re-run codegen + autolinking.
    print_header "Cleaning stale Android build caches"
    rm -rf android/app/.cxx android/app/build android/build android/.gradle 2>/dev/null
    print_success "Removed .cxx, app/build, build, .gradle"
    print_header "Running gradle clean"
    ( cd android && ./gradlew clean ) || print_warning "gradle clean failed (continuing)"
}

run_npm_install() {
    if [ "$NO_CLEANUP" = "1" ]; then print_info "skip npm install (--no-cleanup)"; return 0; fi
    print_header "Running npm install"
    npm install || print_warning "npm install failed (continuing)"
}

run_yarn_install() {
    if [ "$NO_CLEANUP" = "1" ]; then print_info "skip yarn install (--no-cleanup)"; return 0; fi
    print_header "Running yarn install"
    yarn install || print_warning "yarn install failed (continuing)"
}

#!/bin/bash

# ============================================================================
# Git Reset Script - Completely Remove and Reinitialize Git Repository
# ============================================================================
# This script removes the existing git repository and creates a fresh one
# Usage: bash reset-git.sh
# ============================================================================

set -e  # Exit on any error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

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

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ============================================================================
# Main Script
# ============================================================================

print_header "Git Repository Reset Script"

echo -e "${CYAN}This script will:${NC}"
echo "  1. Remove the existing .git directory (all history will be lost)"
echo "  2. Initialize a fresh git repository"
echo "  3. Create an initial commit with all current files"
echo ""
print_warning "This action cannot be undone!"
echo ""
echo -n "Are you sure you want to continue? (yes/no): "
read -r confirmation

if [ "$confirmation" != "yes" ]; then
    print_info "Operation cancelled by user"
    exit 0
fi

echo ""
print_header "Step 1: Checking Current Git Status"

if [ -d "$PROJECT_ROOT/.git" ]; then
    print_info "Found existing .git directory"
    
    # Show current remotes if any
    if git remote -v 2>/dev/null | grep -q .; then
        echo ""
        echo -e "${YELLOW}Current remotes:${NC}"
        git remote -v
        echo ""
    fi
    
    # Show last few commits
    if git log --oneline -5 2>/dev/null; then
        echo ""
        print_info "Showing last 5 commits (these will be deleted)"
        echo ""
    fi
else
    print_info "No existing .git directory found"
fi

echo ""
print_header "Step 2: Removing Existing Git Repository"

if [ -d "$PROJECT_ROOT/.git" ]; then
    rm -rf "$PROJECT_ROOT/.git"
    print_success "Removed .git directory"
else
    print_info "No .git directory to remove"
fi

# Verify removal
if [ ! -d "$PROJECT_ROOT/.git" ]; then
    print_success "Git repository successfully removed"
else
    print_error "Failed to remove .git directory"
    exit 1
fi

echo ""
print_header "Step 3: Initializing Fresh Git Repository"

cd "$PROJECT_ROOT"
git init
print_success "Initialized new git repository"

echo ""
print_header "Step 4: Staging All Files"

# Count files to be committed
file_count=$(find . -type f -not -path '*/\.*' -not -path './node_modules/*' -not -path './ios/Pods/*' -not -path './android/build/*' -not -path './android/app/build/*' | wc -l | xargs)
print_info "Found approximately $file_count files to commit"

git add .
print_success "All files staged"

echo ""
print_header "Step 5: Creating Initial Commit"

# Get project name from package.json or use directory name
if [ -f "package.json" ]; then
    PROJECT_NAME=$(grep -m 1 '"name"' package.json | sed 's/.*"name": "\(.*\)".*/\1/')
else
    PROJECT_NAME=$(basename "$PROJECT_ROOT")
fi

COMMIT_MESSAGE="Initial commit - $PROJECT_NAME project"

git commit -m "$COMMIT_MESSAGE"
print_success "Created initial commit"

echo ""
print_header "Step 6: Repository Information"

echo -e "${GREEN}Current Status:${NC}"
echo "  • Branch: $(git branch --show-current)"
echo "  • Commits: $(git rev-list --count HEAD)"
echo "  • Files tracked: $(git ls-files | wc -l | xargs)"
echo ""

# Show the commit
git log -1 --stat --oneline

echo ""
print_header "✅ Git Repository Reset Complete!"

echo ""
echo -e "${CYAN}Next Steps:${NC}"
echo ""
echo "  1. Create a new repository on GitHub/GitLab/Bitbucket"
echo ""
echo "  2. Add your remote repository:"
echo -e "     ${GREEN}git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git${NC}"
echo ""
echo "  3. Push to the remote repository:"
echo -e "     ${GREEN}git branch -M main${NC}"
echo -e "     ${GREEN}git push -u origin main${NC}"
echo ""
echo "  Or if using SSH:"
echo -e "     ${GREEN}git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git${NC}"
echo -e "     ${GREEN}git branch -M main${NC}"
echo -e "     ${GREEN}git push -u origin main${NC}"
echo ""
echo -e "${YELLOW}Optional: Set default branch to main (if not already)${NC}"
echo -e "     ${GREEN}git config --global init.defaultBranch main${NC}"
echo ""
print_success "Done! Your repository is ready to be pushed to a new remote."
echo ""

#!/bin/bash

# ============================================================================
# Backup Files Cleanup Script
# ============================================================================
# This script removes all backup files created by setup scripts.
# It searches for files with .backup extension in the project.
#
# Features:
# - Finds all .backup files in the project
# - Shows list of files before deletion
# - Asks for confirmation before deleting
# - Provides option to view file before deletion
# - Shows summary of deleted files
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

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${MAGENTA}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

# ============================================================================
# Main Functions
# ============================================================================

find_backup_files() {
    print_header "Backup Files Cleanup Script"
    
    echo -e "${CYAN}Searching for backup files in the project...${NC}"
    echo ""
    
    # Find all .backup files in the project (excluding node_modules, ios/Pods, etc.)
    BACKUP_FILES=$(find "$PROJECT_ROOT" \
        -type f \
        -name "*.backup" \
        ! -path "*/node_modules/*" \
        ! -path "*/ios/Pods/*" \
        ! -path "*/android/build/*" \
        ! -path "*/ios/build/*" \
        ! -path "*/.git/*" \
        2>/dev/null)
    
    # Count files
    FILE_COUNT=$(echo "$BACKUP_FILES" | grep -c . || echo "0")
    
    if [ "$FILE_COUNT" -eq 0 ] || [ -z "$BACKUP_FILES" ]; then
        print_info "No backup files found in the project."
        echo ""
        print_success "Project is clean! 🎉"
        exit 0
    fi
    
    print_success "Found $FILE_COUNT backup file(s)"
    echo ""
}

display_backup_files() {
    print_step "Backup files found:"
    echo ""
    
    local index=1
    while IFS= read -r file; do
        # Get relative path from project root
        local rel_path="${file#$PROJECT_ROOT/}"
        
        # Get file size
        if [[ "$OSTYPE" == "darwin"* ]]; then
            local size=$(ls -lh "$file" | awk '{print $5}')
        else
            local size=$(ls -lh "$file" | awk '{print $5}')
        fi
        
        # Get modification time
        if [[ "$OSTYPE" == "darwin"* ]]; then
            local mod_time=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$file")
        else
            local mod_time=$(stat -c "%y" "$file" | cut -d'.' -f1)
        fi
        
        echo -e "  ${YELLOW}$index.${NC} $rel_path"
        echo -e "     Size: $size | Modified: $mod_time"
        echo ""
        
        index=$((index + 1))
    done <<< "$BACKUP_FILES"
}

show_file_categories() {
    echo -e "${CYAN}Backup files by category:${NC}"
    echo ""
    
    # Count by type (using safer grep -c logic)
    local env_count=0
    local android_count=0
    local ios_count=0
    local ts_count=0
    local tsx_count=0
    
    while IFS= read -r file; do
        [[ "$file" =~ \.env\.backup$ ]] && env_count=$((env_count + 1))
        [[ "$file" =~ android/ ]] && android_count=$((android_count + 1))
        [[ "$file" =~ ios/ ]] && ios_count=$((ios_count + 1))
        [[ "$file" =~ \.ts\.backup$ ]] && ts_count=$((ts_count + 1))
        [[ "$file" =~ \.tsx\.backup$ ]] && tsx_count=$((tsx_count + 1))
    done <<< "$BACKUP_FILES"
    
    [ "$env_count" -gt 0 ] && echo "  • Environment files (.env): $env_count"
    [ "$android_count" -gt 0 ] && echo "  • Android files: $android_count"
    [ "$ios_count" -gt 0 ] && echo "  • iOS files: $ios_count"
    [ "$ts_count" -gt 0 ] && echo "  • TypeScript files (.ts): $ts_count"
    [ "$tsx_count" -gt 0 ] && echo "  • TypeScript React files (.tsx): $tsx_count"
    echo ""
}

confirm_deletion() {
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}⚠️  WARNING: This will permanently delete all backup files listed above!${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    # Offer options
    echo -e "${CYAN}What would you like to do?${NC}"
    echo ""
    echo "  1. Delete all backup files"
    echo "  2. View and delete selectively"
    echo "  3. Cancel (keep backups)"
    echo ""
    
    read -p "Enter your choice (1-3): " -n 1 -r choice
    echo ""
    echo ""
    
    case $choice in
        1)
            delete_all_backups
            ;;
        2)
            delete_selectively
            ;;
        3)
            print_info "Deletion cancelled. Backup files preserved."
            exit 0
            ;;
        *)
            print_error "Invalid choice. Exiting."
            exit 1
            ;;
    esac
}

delete_all_backups() {
    print_header "Deleting All Backup Files"
    
    echo -e "${RED}Are you absolutely sure you want to delete ALL backup files?${NC}"
    read -p "Type 'yes' to confirm: " confirm
    echo ""
    
    if [ "$confirm" != "yes" ]; then
        print_info "Deletion cancelled."
        exit 0
    fi
    
    print_step "Deleting backup files..."
    echo ""
    
    local deleted_count=0
    local failed_count=0
    
    while IFS= read -r file; do
        local rel_path="${file#$PROJECT_ROOT/}"
        
        if rm "$file" 2>/dev/null; then
            echo -e "  ${GREEN}✓${NC} Deleted: $rel_path"
            deleted_count=$((deleted_count + 1))
        else
            echo -e "  ${RED}✗${NC} Failed to delete: $rel_path"
            failed_count=$((failed_count + 1))
        fi
    done <<< "$BACKUP_FILES"
    
    echo ""
    print_success "Deleted $deleted_count backup file(s)"
    
    if [ "$failed_count" -gt 0 ]; then
        print_warning "Failed to delete $failed_count file(s)"
    fi
    
    echo ""
    print_success "Cleanup complete! 🎉"
}

delete_selectively() {
    print_header "Selective Deletion"
    
    local index=1
    local deleted_count=0
    
    while IFS= read -r file; do
        local rel_path="${file#$PROJECT_ROOT/}"
        
        echo ""
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}File $index of $FILE_COUNT:${NC} $rel_path"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        
        # Show file info
        if [[ "$OSTYPE" == "darwin"* ]]; then
            local size=$(ls -lh "$file" | awk '{print $5}')
            local mod_time=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$file")
        else
            local size=$(ls -lh "$file" | awk '{print $5}')
            local mod_time=$(stat -c "%y" "$file" | cut -d'.' -f1)
        fi
        
        echo "  Size: $size"
        echo "  Modified: $mod_time"
        echo "  Full path: $file"
        echo ""
        
        # Ask what to do
        echo "Options:"
        echo "  d - Delete this file"
        echo "  v - View file content"
        echo "  s - Skip this file"
        echo "  q - Quit (stop deletion)"
        echo ""
        
        read -p "Your choice (d/v/s/q): " -n 1 -r action
        echo ""
        
        case $action in
            d|D)
                if rm "$file" 2>/dev/null; then
                    print_success "Deleted: $rel_path"
                    deleted_count=$((deleted_count + 1))
                else
                    print_error "Failed to delete: $rel_path"
                fi
                ;;
            v|V)
                echo ""
                echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
                echo -e "${CYAN}File Content:${NC}"
                echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
                head -50 "$file"
                echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
                echo ""
                read -p "Delete this file? (y/n): " -n 1 -r delete_choice
                echo ""
                
                if [[ $delete_choice =~ ^[Yy]$ ]]; then
                    if rm "$file" 2>/dev/null; then
                        print_success "Deleted: $rel_path"
                        deleted_count=$((deleted_count + 1))
                    else
                        print_error "Failed to delete: $rel_path"
                    fi
                else
                    print_info "Skipped: $rel_path"
                fi
                ;;
            s|S)
                print_info "Skipped: $rel_path"
                ;;
            q|Q)
                echo ""
                print_info "Deletion stopped by user."
                if [ "$deleted_count" -gt 0 ]; then
                    print_success "Deleted $deleted_count backup file(s) before stopping."
                fi
                exit 0
                ;;
            *)
                print_warning "Invalid choice. Skipping file."
                ;;
        esac
        
        index=$((index + 1))
    done <<< "$BACKUP_FILES"
    
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    print_success "Selective deletion complete!"
    print_success "Deleted $deleted_count out of $FILE_COUNT backup file(s)"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    clear
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    # Find backup files
    find_backup_files
    
    # Display found files
    display_backup_files
    
    # Show categories
    show_file_categories
    
    # Confirm and delete
    confirm_deletion
}

# Run main function
main

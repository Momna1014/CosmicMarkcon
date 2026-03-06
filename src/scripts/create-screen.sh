#!/bin/bash

# Script to create a new screen folder with index.tsx and styles.ts
# Usage: ./src/scripts/create-screen.sh ScreenName

set -e

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if screen name is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Screen name is required${NC}"
    echo "Usage: ./src/scripts/create-screen.sh ScreenName"
    echo "Example: ./src/scripts/create-screen.sh Dashboard"
    exit 1
fi

SCREEN_NAME=$1
SCREENS_DIR="./src/screens"
SCREEN_DIR="${SCREENS_DIR}/${SCREEN_NAME}"
NAVIGATION_DIR="./src/navigation"

# Check if screen already exists
if [ -d "$SCREEN_DIR" ]; then
    echo -e "${RED}Error: Screen '${SCREEN_NAME}' already exists!${NC}"
    exit 1
fi

# Ask for navigation configuration
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     Navigation Configuration Setup            ║${NC}"
echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
echo ""
echo -e "${YELLOW}Where would you like to add this screen?${NC}"
echo ""
echo -e "  ${GREEN}1)${NC} Bottom Tab Navigator    - Add as a new tab"
echo -e "  ${GREEN}2)${NC} Stack Navigator         - Add as a stack screen"
echo -e "  ${GREEN}3)${NC} Drawer Navigator        - Add to drawer menu"
echo -e "  ${GREEN}4)${NC} Skip Navigation         - Just create the screen files"
echo ""
echo -ne "${BLUE}Enter your choice [1-4]: ${NC}"
read -r NAV_CHOICE

# Validate choice
if [[ ! "$NAV_CHOICE" =~ ^[1-4]$ ]]; then
    echo -e "${RED}Invalid choice. Defaulting to 'Skip Navigation'${NC}"
    NAV_CHOICE=4
fi

# For Tab Navigator, ask for icon/label
TAB_LABEL=""
TAB_ICON=""
if [ "$NAV_CHOICE" = "1" ]; then
    echo ""
    echo -e "${YELLOW}Tab Configuration:${NC}"
    echo -ne "${BLUE}Tab Label (default: ${SCREEN_NAME}): ${NC}"
    read -r TAB_LABEL
    TAB_LABEL=${TAB_LABEL:-$SCREEN_NAME}
    
    echo -ne "${BLUE}Tab Icon emoji (default: 📱): ${NC}"
    read -r TAB_ICON
    TAB_ICON=${TAB_ICON:-📱}
fi

# For Drawer, ask for icon/label
DRAWER_LABEL=""
DRAWER_ICON=""
if [ "$NAV_CHOICE" = "3" ]; then
    echo ""
    echo -e "${YELLOW}Drawer Configuration:${NC}"
    echo -ne "${BLUE}Drawer Label (default: ${SCREEN_NAME}): ${NC}"
    read -r DRAWER_LABEL
    DRAWER_LABEL=${DRAWER_LABEL:-$SCREEN_NAME}
    
    echo -ne "${BLUE}Drawer Icon emoji (default: 📱): ${NC}"
    read -r DRAWER_ICON
    DRAWER_ICON=${DRAWER_ICON:-📱}
fi

echo ""

# Create screen directory
echo -e "${YELLOW}Creating screen directory: ${SCREEN_DIR}${NC}"
mkdir -p "$SCREEN_DIR"

# Create index.tsx
echo -e "${YELLOW}Creating index.tsx...${NC}"
cat > "${SCREEN_DIR}/index.tsx" << 'EOF'
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useScreenView, useButtonClick } from '../../hooks/useFacebookAnalytics';
import { 
  trackContentView,
  trackSearch,
} from '../../analytics';
import firebaseService from '../../services/firebase/FirebaseService';
import { useStyles } from './styles';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  navigation: any;
  route?: any;
};

const SCREEN_NAMEScreen: React.FC<Props> = ({ navigation, route }) => {
  // Get dynamic styles based on current theme
  const styles = useStyles();
  const theme = useTheme();
  
  // Track screen view automatically
  useScreenView('SCREEN_NAMEScreen', {
    screen_category: 'SCREEN_NAME_LOWER',
    previous_screen: route?.params?.from || 'unknown',
  });

  /**
   * Log Firebase event helper
   */
  const logFirebaseEvent = (eventName: string, params?: Record<string, any>) => {
    firebaseService.logEvent(eventName, params);
  };

  // State
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  /**
   * Fetch data on mount
   */
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Fetch data from API
   */
  const fetchData = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call
      // const response = await api.get(API_ENDPOINTS.YOUR_ENDPOINT);
      // setData(response);
      
      // Track content view
      trackContentView(
        'article',
        'SCREEN_NAME_LOWER_list',
        'SCREEN_NAMEScreen Content',
        'SCREEN_NAME_LOWER'
      );

      // Log Firebase event
      logFirebaseEvent('SCREEN_NAME_LOWER_data_loaded', {
        screen: 'SCREEN_NAMEScreen',
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Log error to Firebase
      logFirebaseEvent('SCREEN_NAME_LOWER_fetch_error', {
        error: String(error),
        screen: 'SCREEN_NAMEScreen',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle item press
   */
  const handleItemPress = (item: any) => {
    // Log Firebase event
    logFirebaseEvent('SCREEN_NAME_LOWER_item_clicked', {
      item_id: item?.id,
      item_name: item?.name,
      screen: 'SCREEN_NAMEScreen',
    });

    // Navigate to details or perform action
    // navigation.navigate('Details', { id: item.id });
  };

  /**
   * Handle search
   */
  const handleSearch = (query: string) => {
    // Track search event
    trackSearch(query, 0, 'SCREEN_NAME_LOWER');

    // Log Firebase event
    logFirebaseEvent('SCREEN_NAME_LOWER_search', {
      query,
      screen: 'SCREEN_NAMEScreen',
    });

    // TODO: Implement search logic
  };

  /**
   * Handle refresh
   */
  const handleRefresh = () => {
    // Log Firebase event
    logFirebaseEvent('SCREEN_NAME_LOWER_refreshed', {
      screen: 'SCREEN_NAMEScreen',
    });
    
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>SCREEN_NAMEScreen</Text>
        <Text style={styles.subtitle}>Welcome to SCREEN_NAMEScreen</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {data.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No data available</Text>
            <TouchableOpacity 
              style={styles.button}
              onPress={handleRefresh}
            >
              <Text style={styles.buttonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          data.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.item}
              onPress={() => handleItemPress(item)}
            >
              <Text style={styles.itemText}>{item.name}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default SCREEN_NAMEScreen;
EOF

# Create styles.ts
echo -e "${YELLOW}Creating styles.ts...${NC}"
cat > "${SCREEN_DIR}/styles.ts" << 'EOF'
import { StyleSheet } from 'react-native';
import { AppTheme } from '../../theme';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * Create styles function that accepts theme
 * This allows dynamic theming based on device color scheme
 */
const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingIndicator: {
    color: theme.colors.primary,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fonts.sizes.md,
    fontFamily: theme.fonts.families.poppinsRegular,
    color: theme.colors.textSecondary,
  },

  // Header
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fonts.sizes.xxl,
    fontFamily: theme.fonts.families.poppinsBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fonts.sizes.md,
    fontFamily: theme.fonts.families.poppinsRegular,
    color: theme.colors.textSecondary,
  },

  // Content
  content: {
    flex: 1,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: theme.fonts.sizes.lg,
    fontFamily: theme.fonts.families.poppinsRegular,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },

  // Button
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.base,
    ...theme.shadows.base,
  },
  buttonText: {
    fontSize: theme.fonts.sizes.md,
    fontFamily: theme.fonts.families.poppinsSemiBold,
    color: theme.colors.white,
    textAlign: 'center',
  },

  // Item
  item: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.base,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  itemText: {
    fontSize: theme.fonts.sizes.md,
    fontFamily: theme.fonts.families.poppinsRegular,
    color: theme.colors.text,
  },
});

/**
 * Hook to get styles with current theme
 * Usage: const styles = useStyles();
 */
export const useStyles = () => {
  const theme = useTheme();
  return createStyles(theme);
};

// Export createStyles for custom usage
export default createStyles;
EOF

# Replace SCREEN_NAME placeholder with actual screen name
# Convert to lowercase using tr for compatibility
SCREEN_NAME_LOWER=$(echo "$SCREEN_NAME" | tr '[:upper:]' '[:lower:]')

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - Replace SCREEN_NAME_LOWER first to avoid partial replacement
    sed -i '' "s/SCREEN_NAME_LOWER/${SCREEN_NAME_LOWER}/g" "${SCREEN_DIR}/index.tsx"
    sed -i '' "s/SCREEN_NAME/${SCREEN_NAME}/g" "${SCREEN_DIR}/index.tsx"
else
    # Linux - Replace SCREEN_NAME_LOWER first to avoid partial replacement
    sed -i "s/SCREEN_NAME_LOWER/${SCREEN_NAME_LOWER}/g" "${SCREEN_DIR}/index.tsx"
    sed -i "s/SCREEN_NAME/${SCREEN_NAME}/g" "${SCREEN_DIR}/index.tsx"
fi

echo -e "${GREEN}✓ Screen '${SCREEN_NAME}' created successfully!${NC}"
echo -e "${GREEN}✓ Location: ${SCREEN_DIR}${NC}"
echo ""
echo -e "${YELLOW}Files created:${NC}"
echo "  - ${SCREEN_DIR}/index.tsx"
echo "  - ${SCREEN_DIR}/styles.ts"

# ==================== ADD TO NAVIGATION ====================

add_to_navigation() {
    case $NAV_CHOICE in
        1)
            # Add to Tab Navigator
            echo ""
            echo -e "${YELLOW}Adding to Tab Navigator...${NC}"
            add_to_tab_navigator
            ;;
        2)
            # Add to Stack Navigator
            echo ""
            echo -e "${YELLOW}Adding to Stack Navigator...${NC}"
            add_to_stack_navigator
            ;;
        3)
            # Add to Drawer Navigator
            echo ""
            echo -e "${YELLOW}Adding to Drawer Navigator...${NC}"
            add_to_drawer_navigator
            ;;
        4)
            # Skip navigation
            echo ""
            echo -e "${BLUE}Skipped navigation configuration${NC}"
            ;;
    esac
}

# Function to add screen to Tab Navigator
add_to_tab_navigator() {
    TAB_FILE="${NAVIGATION_DIR}/TabNavigator.tsx"
    DEEPLINKING_FILE="${NAVIGATION_DIR}/deepLinking.ts"
    
    if [ ! -f "$TAB_FILE" ]; then
        echo -e "${RED}Error: TabNavigator.tsx not found${NC}"
        return 1
    fi
    
    # Add import at the top
    IMPORT_LINE="import ${SCREEN_NAME}Screen from '../screens/${SCREEN_NAME}';"
    
    # Check if import already exists
    if grep -qF "${SCREEN_NAME}Screen" "$TAB_FILE"; then
        echo -e "${YELLOW}  Import already exists, skipping...${NC}"
    else
        # Find the line number of the last import statement
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS - Add after the last import
            LAST_IMPORT_LINE=$(grep -n "import.*from.*screens" "$TAB_FILE" | tail -1 | cut -d: -f1)
            if [ -n "$LAST_IMPORT_LINE" ]; then
                sed -i '' "${LAST_IMPORT_LINE}a\\
$IMPORT_LINE
" "$TAB_FILE"
            fi
        else
            sed -i "/import.*Screen from/a $IMPORT_LINE" "$TAB_FILE"
        fi
        echo -e "${GREEN}  ✓ Added import${NC}"
    fi
    
    # Add Tab.Screen before the last closing tag
    # Create temporary file for the screen configuration
    TEMP_SCREEN_FILE=$(mktemp)
    cat > "$TEMP_SCREEN_FILE" << SCREEN_EOF
      <Tab.Screen
        name="${SCREEN_NAME}"
        component={${SCREEN_NAME}Screen}
        options={{
          tabBarLabel: '${TAB_LABEL}',
          title: '${TAB_LABEL}',
        }}
      />
SCREEN_EOF
    
    # Find the position to insert (before </Tab.Navigator>)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS - use awk for more reliable insertion
        awk '/<\/Tab.Navigator>/ {system("cat '"$TEMP_SCREEN_FILE"'")} {print}' "$TAB_FILE" > "${TAB_FILE}.tmp" && mv "${TAB_FILE}.tmp" "$TAB_FILE"
    else
        # Linux - use sed
        TAB_SCREEN=$(cat "$TEMP_SCREEN_FILE")
        sed -i "/<\/Tab.Navigator>/i $TAB_SCREEN" "$TAB_FILE"
    fi
    
    rm -f "$TEMP_SCREEN_FILE"
    
    echo -e "${GREEN}  ✓ Added tab screen configuration${NC}"
    echo -e "${CYAN}  Tab: ${TAB_LABEL} ${TAB_ICON}${NC}"
    
    # Add TypeScript type definition to MainTabParamList
    add_to_tab_type_definitions
}

# Function to add screen to MainTabParamList type
add_to_tab_type_definitions() {
    DEEPLINKING_FILE="${NAVIGATION_DIR}/deepLinking.ts"
    
    if [ ! -f "$DEEPLINKING_FILE" ]; then
        echo -e "${YELLOW}  Warning: deepLinking.ts not found, skipping type definition${NC}"
        return 0
    fi
    
    # Check if type already exists in MainTabParamList
    if grep -A 10 "MainTabParamList" "$DEEPLINKING_FILE" | grep -qF "${SCREEN_NAME}:"; then
        echo -e "${YELLOW}  Tab type definition already exists, skipping...${NC}"
        return 0
    fi
    
    # Add type to MainTabParamList (before closing brace)
    TYPE_LINE="  ${SCREEN_NAME}: undefined;"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # Find MainTabParamList closing brace and add before it
        awk '/export type MainTabParamList = {/,/^};$/ { 
            if (/^};$/ && !found) { 
                print "'"$TYPE_LINE"'"
                found=1
            }
        } 
        {print}' "$DEEPLINKING_FILE" > "${DEEPLINKING_FILE}.tmp" && mv "${DEEPLINKING_FILE}.tmp" "$DEEPLINKING_FILE"
    else
        # For Linux, find the closing of MainTabParamList and insert before it
        sed -i '/export type MainTabParamList = {/,/^};$/{ /^};$/i\'"$TYPE_LINE"' }' "$DEEPLINKING_FILE"
    fi
    
    echo -e "${GREEN}  ✓ Added TypeScript type definition to MainTabParamList${NC}"
}

# Function to add screen to Stack Navigator
add_to_stack_navigator() {
    STACK_FILE="${NAVIGATION_DIR}/StackNavigator.tsx"
    DEEPLINKING_FILE="${NAVIGATION_DIR}/deepLinking.ts"
    
    if [ ! -f "$STACK_FILE" ]; then
        echo -e "${RED}Error: StackNavigator.tsx not found${NC}"
        return 1
    fi
    
    # Add import
    IMPORT_LINE="import ${SCREEN_NAME}Screen from '../screens/${SCREEN_NAME}';"
    
    if grep -qF "${SCREEN_NAME}Screen" "$STACK_FILE"; then
        echo -e "${YELLOW}  Import already exists, skipping...${NC}"
    else
        if [[ "$OSTYPE" == "darwin"* ]]; then
            LAST_IMPORT_LINE=$(grep -n "import.*from.*screens" "$STACK_FILE" | tail -1 | cut -d: -f1)
            if [ -n "$LAST_IMPORT_LINE" ]; then
                sed -i '' "${LAST_IMPORT_LINE}a\\
$IMPORT_LINE
" "$STACK_FILE"
            fi
        else
            sed -i "/import.*Screen from/a $IMPORT_LINE" "$STACK_FILE"
        fi
        echo -e "${GREEN}  ✓ Added import${NC}"
    fi
    
    # Add Stack.Screen
    TEMP_SCREEN_FILE=$(mktemp)
    cat > "$TEMP_SCREEN_FILE" << SCREEN_EOF
      <Stack.Screen
        name="${SCREEN_NAME}"
        component={${SCREEN_NAME}Screen}
        options={{
          title: '${SCREEN_NAME}',
        }}
      />
SCREEN_EOF
    
    # Insert before {/* Modal Screens */} comment
    if [[ "$OSTYPE" == "darwin"* ]]; then
        awk '/{\/\* Modal Screens \*\/}/ {system("cat '"$TEMP_SCREEN_FILE"'")} {print}' "$STACK_FILE" > "${STACK_FILE}.tmp" && mv "${STACK_FILE}.tmp" "$STACK_FILE"
    else
        STACK_SCREEN=$(cat "$TEMP_SCREEN_FILE")
        sed -i "/{\/\* Modal Screens \*\/}/i $STACK_SCREEN" "$STACK_FILE"
    fi
    
    rm -f "$TEMP_SCREEN_FILE"
    
    echo -e "${GREEN}  ✓ Added stack screen configuration${NC}"
    
    # Add TypeScript type definition to deepLinking.ts
    add_to_type_definitions
}

# Function to add screen to RootStackParamList type
add_to_type_definitions() {
    DEEPLINKING_FILE="${NAVIGATION_DIR}/deepLinking.ts"
    
    if [ ! -f "$DEEPLINKING_FILE" ]; then
        echo -e "${YELLOW}  Warning: deepLinking.ts not found, skipping type definition${NC}"
        return 0
    fi
    
    # Check if type already exists
    if grep -qF "${SCREEN_NAME}:" "$DEEPLINKING_FILE"; then
        echo -e "${YELLOW}  Type definition already exists, skipping...${NC}"
        return 0
    fi
    
    # Add type to RootStackParamList (before Settings or last item)
    TYPE_LINE="  ${SCREEN_NAME}: undefined;"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # Find the line with "Settings: undefined;" and add before it
        sed -i '' "/Settings: undefined;/i\\
$TYPE_LINE
" "$DEEPLINKING_FILE"
    else
        sed -i "/Settings: undefined;/i $TYPE_LINE" "$DEEPLINKING_FILE"
    fi
    
    echo -e "${GREEN}  ✓ Added TypeScript type definition${NC}"
}

# Function to add screen to Drawer Navigator
add_to_drawer_navigator() {
    DRAWER_FILE="${NAVIGATION_DIR}/DrawerNavigator.tsx"
    DEEPLINKING_FILE="${NAVIGATION_DIR}/deepLinking.ts"
    
    if [ ! -f "$DRAWER_FILE" ]; then
        echo -e "${RED}Error: DrawerNavigator.tsx not found${NC}"
        return 1
    fi
    
    # Add import
    IMPORT_LINE="import ${SCREEN_NAME}Screen from '../screens/${SCREEN_NAME}';"
    
    if grep -qF "${SCREEN_NAME}Screen" "$DRAWER_FILE"; then
        echo -e "${YELLOW}  Import already exists, skipping...${NC}"
    else
        if [[ "$OSTYPE" == "darwin"* ]]; then
            LAST_IMPORT_LINE=$(grep -n "import.*from.*screens" "$DRAWER_FILE" | tail -1 | cut -d: -f1)
            if [ -n "$LAST_IMPORT_LINE" ]; then
                sed -i '' "${LAST_IMPORT_LINE}a\\
$IMPORT_LINE
" "$DRAWER_FILE"
            fi
        else
            sed -i "/import.*Screen from/a $IMPORT_LINE" "$DRAWER_FILE"
        fi
        echo -e "${GREEN}  ✓ Added import${NC}"
    fi
    
    # Add Drawer.Screen
    TEMP_SCREEN_FILE=$(mktemp)
    cat > "$TEMP_SCREEN_FILE" << SCREEN_EOF
      <Drawer.Screen
        name="${SCREEN_NAME}"
        component={${SCREEN_NAME}Screen}
        options={{
          title: '${DRAWER_LABEL}',
          drawerLabel: '${DRAWER_LABEL}',
        }}
      />
SCREEN_EOF
    
    # Insert before </Drawer.Navigator>
    if [[ "$OSTYPE" == "darwin"* ]]; then
        awk '/<\/Drawer.Navigator>/ {system("cat '"$TEMP_SCREEN_FILE"'")} {print}' "$DRAWER_FILE" > "${DRAWER_FILE}.tmp" && mv "${DRAWER_FILE}.tmp" "$DRAWER_FILE"
    else
        DRAWER_SCREEN=$(cat "$TEMP_SCREEN_FILE")
        sed -i "/<\/Drawer.Navigator>/i $DRAWER_SCREEN" "$DRAWER_FILE"
    fi
    
    rm -f "$TEMP_SCREEN_FILE"
    
    echo -e "${GREEN}  ✓ Added drawer screen configuration${NC}"
    echo -e "${CYAN}  Drawer: ${DRAWER_ICON} ${DRAWER_LABEL}${NC}"
    
    # Add to custom drawer content
    add_to_drawer_content
    
    # Add TypeScript type definition to DrawerParamList
    add_to_drawer_type_definitions
}

# Function to add screen to DrawerParamList type
add_to_drawer_type_definitions() {
    DEEPLINKING_FILE="${NAVIGATION_DIR}/deepLinking.ts"
    
    if [ ! -f "$DEEPLINKING_FILE" ]; then
        echo -e "${YELLOW}  Warning: deepLinking.ts not found, skipping type definition${NC}"
        return 0
    fi
    
    # Check if type already exists in DrawerParamList
    if grep -A 10 "DrawerParamList" "$DEEPLINKING_FILE" | grep -qF "${SCREEN_NAME}:"; then
        echo -e "${YELLOW}  Drawer type definition already exists, skipping...${NC}"
        return 0
    fi
    
    # Add type to DrawerParamList (before closing brace)
    TYPE_LINE="  ${SCREEN_NAME}: undefined;"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # Find DrawerParamList closing brace and add before it
        awk '/export type DrawerParamList = {/,/^};$/ { 
            if (/^};$/ && !found) { 
                print "'"$TYPE_LINE"'"
                found=1
            }
        } 
        {print}' "$DEEPLINKING_FILE" > "${DEEPLINKING_FILE}.tmp" && mv "${DEEPLINKING_FILE}.tmp" "$DEEPLINKING_FILE"
    else
        # For Linux, find the closing of DrawerParamList and insert before it
        sed -i '/export type DrawerParamList = {/,/^};$/{ /^};$/i\'"$TYPE_LINE"' }' "$DEEPLINKING_FILE"
    fi
    
    echo -e "${GREEN}  ✓ Added TypeScript type definition to DrawerParamList${NC}"
}

# Function to add item to custom drawer content
add_to_drawer_content() {
    DRAWER_FILE="${NAVIGATION_DIR}/DrawerNavigator.tsx"
    
    # Create temp file for drawer item
    TEMP_ITEM_FILE=$(mktemp)
    cat > "$TEMP_ITEM_FILE" << ITEM_EOF

        <TouchableOpacity 
          style={styles.drawerItem}
          onPress={() => handleNavigate('${SCREEN_NAME}')}>
          <Text style={styles.drawerItemIcon}>${DRAWER_ICON}</Text>
          <Text style={styles.drawerItemText}>${DRAWER_LABEL}</Text>
        </TouchableOpacity>
ITEM_EOF
    
    # Insert after Settings or other items
    if [[ "$OSTYPE" == "darwin"* ]]; then
        awk "/handleNavigate\('Settings'\)/ {print; system(\"cat '"$TEMP_ITEM_FILE"'\"); next} {print}" "$DRAWER_FILE" > "${DRAWER_FILE}.tmp" && mv "${DRAWER_FILE}.tmp" "$DRAWER_FILE"
    else
        DRAWER_ITEM=$(cat "$TEMP_ITEM_FILE")
        sed -i "/handleNavigate('Settings')/a $DRAWER_ITEM" "$DRAWER_FILE"
    fi
    
    rm -f "$TEMP_ITEM_FILE"
    
    echo -e "${GREEN}  ✓ Added drawer menu item${NC}"
}

# Execute navigation configuration
if [ "$NAV_CHOICE" != "4" ]; then
    add_to_navigation
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✓ Navigation configured successfully!${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Review the navigation configuration"
echo "  2. Implement your business logic in index.tsx"
echo "  3. Customize styles in styles.ts"
if [ "$NAV_CHOICE" != "4" ]; then
    echo "  4. Test navigation to your new screen"
fi
echo ""
echo -e "${GREEN}Usage example:${NC}"
echo "  import ${SCREEN_NAME}Screen from './screens/${SCREEN_NAME}';"
echo ""
echo -e "${CYAN}Happy coding! 🚀${NC}"


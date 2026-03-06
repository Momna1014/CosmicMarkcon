/**
 * DrawerNavigator
 * 
 * Side drawer navigation for accessing settings and other sections
 */

import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

import TabNavigator from './TabNavigator';
import {DrawerParamList} from './deepLinking';
import {useApp} from '../contexts/AppContext';
import {showPaywall} from '../utils/showPaywall';
import NavigationConfig from './NavigationConfig';
import {isDrawerDisabledOnScreen, getDrawerLockMode} from '../utils/drawerUtils';

const Drawer = createDrawerNavigator<DrawerParamList>();

/**
 * Custom Drawer Content
 */
function CustomDrawerContent(props: any) {
  const {navigation} = props;
  const {onboardingCompleted, isPremium, setOnboardingCompleted} = useApp();

  const handleNavigate = (screen: string) => {
    navigation.navigate(screen);
  };

  const handleShowPaywall = () => {
    showPaywall('drawer_menu');
  };

  return (
    <View style={styles.drawerContainer}>
      {/* Header */}
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Menu</Text>
        {isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>⭐ Premium</Text>
          </View>
        )}
      </View>

      {/* Navigation Items */}
      <View style={styles.drawerItems}>
        <TouchableOpacity 
          style={styles.drawerItem}
          onPress={() => handleNavigate('MainTabs')}>
          <Text style={styles.drawerItemIcon}>🏠</Text>
          <Text style={styles.drawerItemText}>Home</Text>
        </TouchableOpacity>

        {NavigationConfig.drawer.showSettings && (
          <TouchableOpacity 
            style={styles.drawerItem}
            onPress={() => handleNavigate('Settings')}>
            <Text style={styles.drawerItemIcon}>⚙️</Text>
            <Text style={styles.drawerItemText}>Settings</Text>
          </TouchableOpacity>
        )}

        {NavigationConfig.drawer.showPremiumUpgrade && (
          <>
            <View style={styles.divider} />

            {!isPremium && (
              <TouchableOpacity 
                style={[styles.drawerItem, styles.premiumItem]}
                onPress={handleShowPaywall}>
                <Text style={styles.drawerItemIcon}>⭐</Text>
                <Text style={[styles.drawerItemText, styles.premiumItemText]}>
                  Upgrade to Premium
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Developer Options */}
        {__DEV__ && NavigationConfig.drawer.showDevTools && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Developer</Text>
            <TouchableOpacity 
              style={styles.drawerItem}
              onPress={() => handleNavigate('NotificationTest')}>
              <Text style={styles.drawerItemIcon}>🔔</Text>
              <Text style={styles.drawerItemText}>Notification Test</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.drawerItem}
              onPress={() => setOnboardingCompleted(false)}>
              <Text style={styles.drawerItemIcon}>🔄</Text>
              <Text style={styles.drawerItemText}>Reset Onboarding</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Footer */}
      <View style={styles.drawerFooter}>
        <Text style={styles.footerText}>Version 1.0.0</Text>
        <Text style={styles.footerText}>
          Onboarding: {onboardingCompleted ? '✅' : '❌'}
        </Text>
      </View>
    </View>
  );
}

/**
 * Drawer Navigator Component
 * 
 * Features:
 * - Conditionally disables drawer on specific screens via config
 * - Disables swipe gesture on disabled screens
 * - Hides hamburger icon on disabled screens
 * - Locks drawer closed when disabled
 */
const DrawerNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props: any) => <CustomDrawerContent {...props} />}
      screenOptions={({route}) => {
        // Check if drawer should be disabled on this screen
        const screenName = route.name as string;
        const isDisabled = isDrawerDisabledOnScreen(screenName);
        const lockMode = getDrawerLockMode(screenName);
        
        return {
          headerShown: true,
          drawerPosition: NavigationConfig.drawer.position,
          drawerType: NavigationConfig.drawer.type,
          swipeEnabled: !isDisabled && NavigationConfig.drawer.swipeEnabled,
          // Disable drawer gesture and lock if on disabled screen
          drawerLockMode: lockMode,
          // Ensure header is shown with hamburger icon
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#000000',
          headerTitleStyle: {
            fontWeight: '600',
          },
          // Hide hamburger icon on disabled screens
          headerLeft: isDisabled ? () => null : undefined,
        };
      }}>
      <Drawer.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{
          title: 'Home',
          drawerLabel: 'Home',
          // Hamburger icon is automatically shown by React Navigation
        }}
      />

    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  drawerHeader: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#007AFF',
  },
  drawerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  premiumBadge: {
    backgroundColor: '#FFD60A',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  drawerItems: {
    flex: 1,
    padding: 16,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  drawerItemIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  drawerItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  premiumItem: {
    backgroundColor: '#FFF3CD',
    borderWidth: 2,
    borderColor: '#FFD60A',
  },
  premiumItemText: {
    color: '#000',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginLeft: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
});

export default DrawerNavigator;

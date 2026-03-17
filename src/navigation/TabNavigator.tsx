/**
 * TabNavigator
 * 
 * Bottom tab navigation for main app screens
 * Supports conditional tab bar visibility
 * Configurable via NavigationConfig
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import {createBottomTabNavigator, BottomTabBarProps} from '@react-navigation/bottom-tabs';
import NavigationConfig from './NavigationConfig';
import BannerAdComponent from '../components/ads/BannerAdComponent';
import { BannerAdSize } from '../services/AppLovinService';
import BottomTabBar from '../components/BottomTabComponent/BottomTabBar';

// Import screens
import HomeScreen from '../screens/Home';
import HoroscopeScreen from '../screens/Horoscope';
import LoveScreen from '../screens/Love';
import ChiromancyScreen from '../screens/Chiromancy';
import ProfileScreen from '../screens/Profile';

// Types
import {MainTabParamList} from './deepLinking';

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Configuration: Screens where tab bar should be hidden
 * Can be configured in NavigationConfig.ts
 */
export const HIDDEN_TABS_SCREENS = NavigationConfig.hiddenTabScreens;

/**
 * Custom Tab Bar with Banner Ad Above
 * Renders the banner ad directly above the bottom tab bar
 */
const CustomTabBar: React.FC<BottomTabBarProps> = (props) => {
  return (
    <View style={customTabBarStyles.container}>
      <BannerAdComponent 
        size={BannerAdSize.BANNER}
        visible={true}
      />
      <BottomTabBar {...props} />
    </View>
  );
};

const customTabBarStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

/**
 * Tab Navigator Component
 * Tabs are configured via NavigationConfig.tabs
 * 
 * Note: When inside a drawer, the drawer shows the header with hamburger icon.
 * When standalone, tabs don't show a header (bottom tabs only).
 */
const TabNavigatorCore: React.FC = () => {
  const config = NavigationConfig.tabs;
  
  // Hide header when tabs are standalone
  // Drawer will show its own header with menu icon when drawer is enabled
  const shouldShowHeader = false;
  
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={({route}) => ({
        // Dynamically hide tab bar on specific screens
        tabBarStyle: getTabBarStyle(route.name),
        headerShown: shouldShowHeader,
        tabBarBackground: () => null, // Transparent background for blur effect
      })}>
      {config.showHome && (
        <Tab.Screen
          name="Home"
          component={HomeScreen as any}
          options={{
            tabBarLabel: 'Home',
            title: 'Home',
          }}
        />
      )}

      <Tab.Screen
        name="Horoscope"
        component={HoroscopeScreen}
        options={{
          tabBarLabel: 'Horoscope',
          title: 'Horoscope',
        }}
      />
      <Tab.Screen
        name="Love"
        component={LoveScreen}
        options={{
          tabBarLabel: 'Love',
          title: 'Love',
        }}
      />
      <Tab.Screen
        name="Chiromancy"
        component={ChiromancyScreen}
        options={{
          tabBarLabel: 'Chiromancy',
          title: 'Chiromancy',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Tab Navigator (exported)
 */
export const TabNavigator: React.FC = () => {
  return <TabNavigatorCore />;
};

/**
 * Helper function to determine tab bar style
 * Returns display: 'none' for screens in HIDDEN_TABS_SCREENS
 */
function getTabBarStyle(routeName: string) {
  if (HIDDEN_TABS_SCREENS.includes(routeName)) {
    return {display: 'none' as const};
  }
  return undefined;
}

/**
 * Check if tab bar should be visible for a given route
 */
export function shouldShowTabBar(routeName: string): boolean {
  return !HIDDEN_TABS_SCREENS.includes(routeName);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default TabNavigator;

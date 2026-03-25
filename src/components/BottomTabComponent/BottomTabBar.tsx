import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from '@react-native-community/blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import theme and scaling functions
import {
  moderateScale,
  radiusScale,
  verticalScale,
} from '../../theme';

// Import SVG icons - outline (inactive)
import HomeIcon from '../../assets/icons/bottomtab_icons/home.svg';
import HoroscopeIcon from '../../assets/icons/bottomtab_icons/horoscope.svg';
import LoveIcon from '../../assets/icons/bottomtab_icons/love_companion.svg';
import ChiromancyIcon from '../../assets/icons/bottomtab_icons/chiromancy.svg';
import ProfileIcon from '../../assets/icons/bottomtab_icons/profile.svg';

// Import SVG icons - filled (active)
import FillHomeIcon from '../../assets/icons/bottomtab_icons/fill_home.svg';
import FillHoroscopeIcon from '../../assets/icons/bottomtab_icons/fill_horoscope.svg';
import FillLoveIcon from '../../assets/icons/bottomtab_icons/fill_love_companion.svg';
import FillChiromancyIcon from '../../assets/icons/bottomtab_icons/fill_chiromancy.svg';

// Active color for dot indicator
const ACTIVE_COLOR = '#EEDF9B';

// Icon size
const ICON_SIZE = moderateScale(32);

// Icon map for each tab - outline icons (inactive)
const outlineIconMap: Record<string, React.FC<{ width: number; height: number }>> = {
  Home: HomeIcon,
  Horoscope: HoroscopeIcon,
  Love: LoveIcon,
  Chiromancy: ChiromancyIcon,
  Profile: ProfileIcon,
};

// Icon map for each tab - filled icons (active)
const filledIconMap: Record<string, React.FC<{ width: number; height: number }>> = {
  Home: FillHomeIcon,
  Horoscope: FillHoroscopeIcon,
  Love: FillLoveIcon,
  Chiromancy: FillChiromancyIcon,
  Profile: ProfileIcon, // Use outline for profile as no fill variant
};

interface CustomBottomTabBarProps extends BottomTabBarProps {}

const BottomTabBar: React.FC<CustomBottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={styles.container}>
      {/* Blur background - use different approach for Android to avoid hardware bitmap crash */}
      {Platform.OS === 'ios' ? (
        <BlurView
          style={styles.blurView}
          blurType="dark"
          blurAmount={56}
          reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.08)"
        />
      ) : (
  
        <View style={styles.androidBlurFallback} />
      )}
      
      {/* Semi-transparent overlay matching Figma: #00000014 */}
      <View style={styles.glassOverlay} />
      
      {/* Tab bar content */}
      <View style={[styles.tabBar, { paddingBottom: 8 + insets.bottom }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          
          // Get the appropriate icon based on active state
          const IconComponent = isFocused 
            ? filledIconMap[route.name] 
            : outlineIconMap[route.name];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={`tab-${route.name.toLowerCase()}`}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                {IconComponent && (
                  <IconComponent
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                  />
                )}
                {/* Active indicator dot - positioned exactly below icon */}
                {isFocused && <View style={styles.activeDot} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  androidBlurFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 20, 30, 0.85)', // Dark translucent background for Android
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.08)', // #00000014 from Figma
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: verticalScale(0), // Figma padding-top
    // paddingBottom handled dynamically with safe area
    alignItems: 'center',
    // minHeight: 104, // Figma height
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    bottom:moderateScale(-15)
    // backgroundColor:'pink'
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor:'red'
  },
  activeDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: radiusScale(10),
    backgroundColor: ACTIVE_COLOR,
    marginTop: verticalScale(5),
  },
});

export default BottomTabBar;
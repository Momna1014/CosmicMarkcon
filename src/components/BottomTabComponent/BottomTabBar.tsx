import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hapticLight } from '../../utils/haptics';

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
import InactiveChatIcon from '../../assets/icons/chat_icons/in_active_chat_icon.svg';
import ActiveChatIcon from '../../assets/icons/chat_icons/active_chat.svg';

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
  Chat: InactiveChatIcon,
};

// Icon map for each tab - filled icons (active)
const filledIconMap: Record<string, React.FC<{ width: number; height: number }>> = {
  Home: FillHomeIcon,
  Horoscope: FillHoroscopeIcon,
  Love: FillLoveIcon,
  Chiromancy: FillChiromancyIcon,
};

// Tabs that use SVG components for active state
const activeSvgMap: Record<string, React.FC<{ width: number; height: number }> | undefined> = {
  Chat: ActiveChatIcon,
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
      {/* Top glow border line */}
      <LinearGradient
        colors={['rgba(194,209,243,0)', 'rgba(194,209,243,0.18)', 'rgba(194,209,243,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topGlowLine}
      />

      {/* Blur background */}
      {Platform.OS === 'ios' ? (
        <BlurView
          style={styles.blurView}
          blurType="dark"
          blurAmount={56}
          reducedTransparencyFallbackColor="rgba(5,7,17,0.95)"
        />
      ) : (
        <View style={styles.androidBlurFallback} />
      )}

      {/* Gradient top fade for depth */}
      <LinearGradient
        colors={['rgba(30,35,60,0.55)', 'rgba(5,7,17,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.topFadeGradient}
      />

      {/* Semi-transparent background */}
      <View style={styles.glassOverlay} />
      
      {/* Tab bar content */}
      <View style={[styles.tabBar, { paddingBottom: 8 + insets.bottom }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          
          // Get the appropriate icon based on active state
          const ActiveSvg = activeSvgMap[route.name] ?? null;
          const IconComponent = isFocused 
            ? (ActiveSvg ? null : filledIconMap[route.name]) 
            : outlineIconMap[route.name];

          const onPress = () => {
            hapticLight();
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
              hitSlop={{ top: 15, bottom: 15, left: 10, right: 10 }}
            >
              <View style={styles.iconContainer}>
                {isFocused && ActiveSvg ? (
                  <ActiveSvg width={ICON_SIZE} height={ICON_SIZE} />
                ) : IconComponent ? (
                  <IconComponent
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                  />
                ) : null}
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
  topGlowLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    zIndex: 10,
  },
  topFadeGradient: {
    ...StyleSheet.absoluteFillObject,
    height: 24,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  androidBlurFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0D1E',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,7,17,0.88)',
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: verticalScale(3),
    // paddingBottom handled dynamically with safe area
    alignItems: 'center',
    // minHeight: 104, // Figma height
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    bottom:Platform.OS ==='ios'? moderateScale(-10):undefined
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
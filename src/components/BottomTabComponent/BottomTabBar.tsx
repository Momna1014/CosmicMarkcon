import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { SvgProps } from 'react-native-svg';

// Import theme and scaling functions
import {
  Colors,
  FontFamilies,
  verticalScale,
  moderateScale,
  fontScale,
} from '../../theme';

// import HomeSvg from '../../assets/icons/svgicons/BottomTabIcons/Home.svg';
// import DiscoverSvg from '../../assets/icons/svgicons/BottomTabIcons/Discover.svg';
// import LibrarySvg from '../../assets/icons/svgicons/BottomTabIcons/Library.svg';
// import MeSvg from '../../assets/icons/svgicons/BottomTabIcons/Me.svg';

// import ActiveHomeSvg from '../../assets/icons/svgicons/BottomTabIcons/active_home.svg';
// import ActiveDiscoverSvg from '../../assets/icons/svgicons/BottomTabIcons/active_discover.svg';
// import ActiveLibrarySvg from '../../assets/icons/svgicons/BottomTabIcons/active_library.svg';
// import ActiveMeSvg from '../../assets/icons/svgicons/BottomTabIcons/active_me.svg';

// interface TabIconProps extends SvgProps {
//   focused: boolean;
//   size?: number;
// }

// const HomeIcon: React.FC<TabIconProps> = ({ focused, size = moderateScale(32), ...props }) => (
//   focused ? (
//     <ActiveHomeSvg width={size} height={size} {...props} />
//   ) : (
//     <HomeSvg width={size} height={size} stroke={Colors.dark.textSecondary} {...props} />
//   )
// );

// const DiscoverIcon: React.FC<TabIconProps> = ({ focused, size = moderateScale(32), ...props }) => (
//   focused ? (
//     <ActiveDiscoverSvg width={size} height={size} {...props} />
//   ) : (
//     <DiscoverSvg width={size} height={size} stroke={Colors.dark.textSecondary} {...props} />
//   )
// );

// const LibraryIcon: React.FC<TabIconProps> = ({ focused, size = moderateScale(32), ...props }) => (
//   focused ? (
//     <ActiveLibrarySvg width={size} height={size} {...props} />
//   ) : (
//     <LibrarySvg width={size} height={size} stroke={Colors.dark.textSecondary} {...props} />
//   )
// );

// const MeIcon: React.FC<TabIconProps> = ({ focused, size = moderateScale(32), ...props }) => (
//   focused ? (
//     <ActiveMeSvg width={size} height={size} {...props} />
//   ) : (
//     <MeSvg width={size} height={size} stroke={Colors.dark.textSecondary} {...props} />
//   )
// );

// const iconMap: Record<string, React.FC<TabIconProps>> = {
//   Home: HomeIcon,
//   Discover: DiscoverIcon,
//   Library: LibraryIcon,
//   Me: MeIcon,
// };

interface CustomBottomTabBarProps extends BottomTabBarProps {}

const BottomTabBar: React.FC<CustomBottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;
          // const IconComponent = iconMap[route.name];

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
                {/* {IconComponent && (
                  <IconComponent focused={isFocused} size={moderateScale(32)} />
                )} */}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? Colors.white : Colors.dark.textSecondary,
                  },
                ]}
              >
                {typeof label === 'string' ? label : route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.background,
    paddingTop: verticalScale(12),
    // paddingBottom: verticalScale(20), // Extra padding for safe area
    // paddingHorizontal: horizontalScale(16),
    borderTopWidth: 0, // Remove default border
    elevation: 0, // Remove shadow on Android
    shadowOpacity: 0, // Remove shadow on iOS
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // paddingVertical: verticalScale(8),
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(8),
  },
  tabLabel: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(14),
    fontWeight: '400',
    lineHeight: fontScale(18), // Increased for iPad compatibility
    letterSpacing: fontScale(14) * 0.02, // 2% letter spacing
    textAlign: 'center',
  },
});

export default BottomTabBar;
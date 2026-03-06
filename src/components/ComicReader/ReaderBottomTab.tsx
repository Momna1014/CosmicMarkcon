/**
 * ReaderBottomTab Component
 * 
 * Fixed bottom tab bar for the PDF reader with Chapters, Comments, and Preference tabs
 * Reusable component that can be used across different reader screens
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Colors,
  FontFamilies,
  verticalScale,
  moderateScale,
} from '../../theme';
import { ReaderBottomTabType, ReaderBottomTabItem } from './types';

// Import SVG icons - using vector icons as fallback
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ReaderBottomTabProps {
  activeTab: ReaderBottomTabType | null;
  onTabPress: (tab: ReaderBottomTabType) => void;
}

const TAB_ITEMS: ReaderBottomTabItem[] = [
  { key: 'chapters', label: 'Chapters', icon: 'format-list-bulleted' },
  { key: 'comments', label: 'Comments', icon: 'comment-text-outline' },
  { key: 'preference', label: 'Preference', icon: 'dots-horizontal' },
];

const TabItem = memo<{
  item: ReaderBottomTabItem;
  isActive: boolean;
  onPress: () => void;
}>(({ item, isActive, onPress }) => (
  <TouchableOpacity
    style={styles.tabItem}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="tab"
    accessibilityState={{ selected: isActive }}
    accessibilityLabel={item.label}
  >
    <Icon
      name={item.icon}
      size={moderateScale(26)}
      color={isActive ? Colors.white : Colors.white}
    />
    <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
      {item.label}
    </Text>
  </TouchableOpacity>
));

TabItem.displayName = 'TabItem';

const ReaderBottomTab: React.FC<ReaderBottomTabProps> = ({
  activeTab,
  onTabPress,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, verticalScale(10));

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <View style={styles.tabsWrapper}>
        {TAB_ITEMS.map((item) => (
          <TabItem
            key={item.key}
            item={item}
            isActive={activeTab === item.key}
            onPress={() => onTabPress(item.key)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    // borderTopWidth: 1,
    // borderTopColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: verticalScale(10),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // paddingVertical: verticalScale(),
  },
  tabLabel: {
    fontSize: moderateScale(14),
    fontFamily: FontFamilies.jetBrainsMonoMedium,
    color: Colors.white,
    marginTop: verticalScale(1),
  },
  tabLabelActive: {
    color: Colors.white,
    fontFamily: FontFamilies.poppinsMedium,
  },
});

export default memo(ReaderBottomTab);

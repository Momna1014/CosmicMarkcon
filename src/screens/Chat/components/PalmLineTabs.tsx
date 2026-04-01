import React, {memo, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
} from '../../../theme';

const PALM_LINES = [
  {id: 'heart', label: 'Heart Line', icon: '❤️'},
  {id: 'head', label: 'Head Line', icon: '🧠'},
  {id: 'life', label: 'Life Line', icon: '🌿'},
  {id: 'fate', label: 'Fate Line', icon: '🔮'},
  {id: 'sun', label: 'Sun Line', icon: '☀️'},
  {id: 'mercury', label: 'Mercury Line', icon: '⚕️'},
  {id: 'marriage', label: 'Marriage Lines', icon: '💍'},
  {id: 'venus', label: 'Girdle of Venus', icon: '✨'},
  {id: 'travel', label: 'Travel Lines', icon: '🌍'},
] as const;

interface PalmLineTabsProps {
  onLinePress: (lineName: string) => void;
  disabled?: boolean;
}

const PalmLineTab = memo(
  ({
    label,
    icon,
    onPress,
    disabled,
  }: {
    label: string;
    icon: string;
    onPress: () => void;
    disabled?: boolean;
  }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = useCallback(() => {
      Animated.spring(scaleAnim, {
        toValue: 0.93,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }, [scaleAnim]);

    const handlePressOut = useCallback(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
        bounciness: 6,
      }).start();
    }, [scaleAnim]);

    return (
      <Animated.View style={{transform: [{scale: scaleAnim}]}}>
        <TouchableOpacity
          style={styles.tab}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
          disabled={disabled}>
          <Text style={styles.tabIcon}>{icon}</Text>
          <Text style={styles.tabLabel} numberOfLines={1}>
            {label}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  },
);

PalmLineTab.displayName = 'PalmLineTab';

const PalmLineTabs: React.FC<PalmLineTabsProps> = memo(({onLinePress, disabled}) => {
  const handlePress = useCallback(
    (label: string) => {
      onLinePress(label);
    },
    [onLinePress],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {PALM_LINES.map(line => (
          <PalmLineTab
            key={line.id}
            label={line.label}
            icon={line.icon}
            onPress={() => handlePress(line.label)}
            disabled={disabled}
          />
        ))}
      </ScrollView>
    </View>
  );
});

PalmLineTabs.displayName = 'PalmLineTabs';

const styles = StyleSheet.create({
  container: {
    paddingVertical: verticalScale(6),
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(12),
    gap: horizontalScale(8),
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(194, 209, 243, 0.08)',
    borderRadius: radiusScale(20),
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(8),
    borderWidth: 1,
    borderColor: 'rgba(221, 196, 96, 0.25)',
  },
  tabIcon: {
    fontSize: fontScale(14),
    marginRight: horizontalScale(5),
  },
  tabLabel: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(12.5),
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.2,
  },
});

export default PalmLineTabs;

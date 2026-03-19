import React, {memo, useCallback} from 'react';
import {View, ScrollView, Text, TouchableOpacity} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {styles} from '../../screens/Home/styles';
import {TransitData} from './types';
import {moderateScale} from '../../theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface TransitsSectionProps {
  transits: TransitData[];
}

// Internal Transit Item - not exported
const TransitItem = memo(({item, index}: {item: TransitData; index: number}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, {damping: 15});
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, {damping: 15});
  }, [scale]);

  const IconComponent = item.Icon;

  return (
    <Animated.View
      entering={FadeInRight.delay(100 + index * 80).springify()}
      style={styles.transitItem}>
      <AnimatedTouchable
        style={[styles.transitIconContainer, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}>
        <IconComponent width={moderateScale(48)} height={moderateScale(48)} />
      </AnimatedTouchable>
      <Text style={styles.transitName}>{item.name}</Text>
      <Text style={styles.transitSubtext}>{item.subtext}</Text>
    </Animated.View>
  );
});

TransitItem.displayName = 'TransitItem';

const TransitsSection: React.FC<TransitsSectionProps> = memo(({transits}) => {
  return (
    <View style={styles.sectionContainer}>
      <Animated.Text
        entering={FadeInDown.delay(250).springify()}
        style={styles.sectionTitle}>
        Todays Transits
      </Animated.Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.transitsContainer}
        style={styles.transitsScrollView}>
        {transits.map((item, index) => (
          <TransitItem key={item.id} item={item} index={index} />
        ))}
      </ScrollView>
    </View>
  );
});

TransitsSection.displayName = 'TransitsSection';

export default TransitsSection;

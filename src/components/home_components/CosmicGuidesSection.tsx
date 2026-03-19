import React, {memo, useCallback} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {styles} from '../../screens/Home/styles';
import {CosmicGuideData} from './types';
import {moderateScale} from '../../theme';

// Right Arrow Icon
import RightArrowIcon from '../../assets/icons/home_icons/right_arrow.svg';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface CosmicGuidesSectionProps {
  guides: CosmicGuideData[];
  onGuidePress?: (guideId: string) => void;
}

// Internal Cosmic Guide Card - not exported
interface CosmicGuideCardProps {
  item: CosmicGuideData;
  index: number;
  onPress?: () => void;
}

const CosmicGuideCard = memo(({item, index, onPress}: CosmicGuideCardProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, {damping: 15});
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, {damping: 15});
  }, [scale]);

  const IconComponent = item.Icon;

  return (
    <Animated.View entering={FadeInDown.delay(400 + index * 100).springify()}>
      <AnimatedTouchable
        style={[styles.guideCard, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={0.9}>
        <View style={styles.guideCardContent}>
          <View style={styles.guideIconContainer}>
            <IconComponent width={moderateScale(40)} height={moderateScale(40)} />
          </View>
          <View style={styles.guideTextContainer}>
            <Text style={styles.guideTitle}>{item.title}</Text>
          </View>
          <RightArrowIcon width={moderateScale(20)} height={moderateScale(20)} />
        </View>
      </AnimatedTouchable>
    </Animated.View>
  );
});

CosmicGuideCard.displayName = 'CosmicGuideCard';

const CosmicGuidesSection: React.FC<CosmicGuidesSectionProps> = memo(({guides, onGuidePress}) => {
  const handleGuidePress = useCallback((guideId: string) => {
    onGuidePress?.(guideId);
  }, [onGuidePress]);

  return (
    <View style={styles.sectionContainer}>
      <Animated.Text
        entering={FadeInDown.delay(350).springify()}
        style={styles.sectionTitle}>
        Cosmic Guides
      </Animated.Text>
      <View style={styles.cosmicGuidesContainer}>
        {guides.map((item, index) => (
          <CosmicGuideCard 
            key={item.id} 
            item={item} 
            index={index} 
            onPress={() => handleGuidePress(item.id)}
          />
        ))}
      </View>
    </View>
  );
});

CosmicGuidesSection.displayName = 'CosmicGuidesSection';

export default CosmicGuidesSection;

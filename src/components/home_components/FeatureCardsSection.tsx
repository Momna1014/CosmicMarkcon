import React, {memo, useCallback} from 'react';
import {View, Text, TouchableOpacity, ImageBackground} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {SvgProps} from 'react-native-svg';
import {styles} from '../../screens/Home/styles';
import {
  SynastryBackground,
  ChiromancyBackground,
  SynastryHeartIcon,
  ChiromancyHandIcon,
} from './constants';
import {moderateScale} from '../../theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface FeatureCardsSectionProps {
  onSynastryPress?: () => void;
  onChiromancyPress?: () => void;
}

// Internal Feature Card - not exported
const FeatureCard = memo(
  ({
    title,
    subtitle,
    Icon,
    backgroundImage,
    index,
    onPress,
  }: {
    title: string;
    subtitle: string;
    Icon: React.FC<SvgProps>;
    backgroundImage: number;
    index: number;
    onPress?: () => void;
  }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{scale: scale.value}],
    }));

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.96, {damping: 15});
    }, [scale]);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, {damping: 15});
    }, [scale]);

    return (
      <Animated.View
        entering={FadeInDown.delay(300 + index * 100).springify()}
        style={styles.featureCard}>
        <TouchableOpacity
          style={[styles.flexOne]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          activeOpacity={0.9}>
          <ImageBackground
            source={backgroundImage}
            style={styles.featureCardBackground}
            resizeMode="cover"
          />
          <View style={styles.featureCardContent}>
            <Icon width={moderateScale(40)} height={moderateScale(40)} />
            <Text style={styles.featureCardTitle}>{title}</Text>
            <Text style={styles.featureCardSubtitle}>{subtitle}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  },
);

FeatureCard.displayName = 'FeatureCard';

const FeatureCardsSection: React.FC<FeatureCardsSectionProps> = memo(
  ({onSynastryPress, onChiromancyPress}) => {
    return (
      <View style={styles.featureCardsContainer}>
        <FeatureCard
          title="Synastry"
          subtitle="COMPATIBILITY"
          Icon={SynastryHeartIcon}
          backgroundImage={SynastryBackground}
          index={0}
          onPress={onSynastryPress}
        />
        <FeatureCard
          title="Chiromancy"
          subtitle="PALM READING"
          Icon={ChiromancyHandIcon}
          backgroundImage={ChiromancyBackground}
          index={1}
          onPress={onChiromancyPress}
        />
      </View>
    );
  },
);

FeatureCardsSection.displayName = 'FeatureCardsSection';

export default FeatureCardsSection;

/**
 * OnboardingButton Component
 * Reusable white button used across all onboarding screens
 */

import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {
  Colors,
  FontFamilies,
  fontScale,
  verticalScale,
  radiusScale,
} from '../theme';
import {hapticLight} from '../utils/haptics';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface OnboardingButtonProps extends Omit<TouchableOpacityProps, 'onPress'> {
  text: string;
  onPress: () => void;
  disabled?: boolean;
}

export const OnboardingButton: React.FC<OnboardingButtonProps> = ({
  text,
  onPress,
  disabled = false,
  style,
  ...props
}) => {
  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: buttonScale.value}],
  }));

  const handlePress = () => {
    if (disabled) return;
    hapticLight();
    buttonScale.value = withSequence(
      withTiming(1.02, {duration: 100}),
      withTiming(1, {duration: 100}),
    );
    // Small delay to let animation play before action
    setTimeout(() => {
      onPress();
    }, 150);
  };

  return (
    <AnimatedTouchable
      style={[
        styles.button,
        buttonAnimatedStyle,
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled}
      {...props}>
      <Text style={styles.buttonText}>{text}</Text>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#F3EFE7',
    borderRadius: radiusScale(16),
    paddingVertical: verticalScale(19),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: FontFamilies.interSemiBold,
    fontWeight: '600',
    fontSize: fontScale(16),
    color: Colors.black,
  },
});

export default OnboardingButton;

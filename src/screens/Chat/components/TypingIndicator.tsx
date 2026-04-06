import React, {memo, useEffect, useRef} from 'react';
import {View, Animated, StyleSheet} from 'react-native';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
  radiusScale,
} from '../../../theme';
import UserStarIcon from '../../../assets/icons/chat_icons/user_star.svg';

const DOT_SIZE = moderateScale(8);
const ANIMATION_DURATION = 400;

const TypingIndicator: React.FC = memo(() => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: ANIMATION_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: ANIMATION_DURATION,
            useNativeDriver: true,
          }),
        ]),
      );

    const a1 = animateDot(dot1, 0);
    const a2 = animateDot(dot2, 150);
    const a3 = animateDot(dot3, 300);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  const makeDotStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.2],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <UserStarIcon width={moderateScale(40)} height={moderateScale(40)} />
      </View>
      <View style={styles.bubble}>
        <Animated.View style={[styles.dot, makeDotStyle(dot1)]} />
        <Animated.View style={[styles.dot, makeDotStyle(dot2)]} />
        <Animated.View style={[styles.dot, makeDotStyle(dot3)]} />
      </View>
    </View>
  );
});

TypingIndicator.displayName = 'TypingIndicator';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(4),
    marginBottom: verticalScale(4),
  },
  avatarContainer: {
    marginRight: horizontalScale(8),
    marginBottom: verticalScale(2),
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(194, 209, 243, 0.12)',
    borderRadius: radiusScale(18),
    borderTopLeftRadius: radiusScale(4),
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.15)',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(14),
    gap: horizontalScale(6),
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: 'rgba(221, 197, 96, 0.9)',
  },
});

export default TypingIndicator;

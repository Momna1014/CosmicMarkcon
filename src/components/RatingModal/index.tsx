/**
 * RatingModal Component
 * 
 * Modern, engaging rating modal with:
 * - Dynamic emoji face that changes with rating
 * - Animated sparkle decorations
 * - Personality-driven copywriting
 * - Smooth animations
 * 
 * @component
 */

import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Pressable,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import LinearGradientView from 'react-native-linear-gradient';
import {
  Colors,
  FontFamilies,
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../theme';
import CrossIcon from '../../assets/icons/svgicons/HomeSvgIcons/cross.svg';

// Sparkle SVG Component
const SparkleIcon: React.FC<{ size?: number; color?: string }> = memo(({ size = 16, color = '#FFD700' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
      fill={color}
    />
  </Svg>
));

SparkleIcon.displayName = 'SparkleIcon';

// Animated Sparkle Component
const AnimatedSparkle: React.FC<{ 
  delay?: number; 
  size?: number; 
  color?: string;
  style?: any;
}> = memo(({ delay = 0, size = 16, color = '#FFD700', style }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(1000),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animate());
    };
    animate();
  }, [delay, scaleAnim, opacityAnim]);

  return (
    <Animated.View style={[style, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
      <SparkleIcon size={size} color={color} />
    </Animated.View>
  );
});

AnimatedSparkle.displayName = 'AnimatedSparkle';

// Star Icon Component with fill state
interface StarIconProps {
  filled: boolean;
  size?: number;
  onPress?: () => void;
  animatedScale?: Animated.Value;
}

const StarIcon: React.FC<StarIconProps> = memo(({ filled, size = 40, onPress, animatedScale }) => {
  const starPath = "M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z";
  
  const animatedStyle = animatedScale ? {
    transform: [{ scale: animatedScale }],
  } : {};

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
    >
      <Animated.View style={animatedStyle}>
        <Svg width={size} height={size} viewBox="0 0 24 24">
          {filled ? (
            <>
              <Defs>
                <LinearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#FFD700" />
                  <Stop offset="50%" stopColor="#FFA500" />
                  <Stop offset="100%" stopColor="#FF8C00" />
                </LinearGradient>
              </Defs>
              <Path
                d={starPath}
                fill="url(#starGradient)"
                stroke="#FFB800"
                strokeWidth={1}
              />
            </>
          ) : (
            <Path
              d={starPath}
              fill="transparent"
              stroke={Colors.inactive}
              strokeWidth={1.5}
            />
          )}
        </Svg>
      </Animated.View>
    </TouchableOpacity>
  );
});

StarIcon.displayName = 'StarIcon';

// Props interface
interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmitRating: (rating: number) => void;
}

const RatingModal: React.FC<RatingModalProps> = memo(({
  visible,
  onClose,
  onSubmitRating,
}) => {
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [starScales] = useState<Animated.Value[]>(() => 
    Array.from({ length: 5 }, () => new Animated.Value(1))
  );
  const emojiScale = useRef(new Animated.Value(1)).current;

  /**
   * Animate emoji when rating changes
   */
  useEffect(() => {
    Animated.sequence([
      Animated.timing(emojiScale, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(emojiScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedRating, emojiScale]);

  /**
   * Get emoji based on rating
   */
  const getEmoji = () => {
    switch (selectedRating) {
      case 0: return '🤔';
      case 1: return '😔';
      case 2: return '😕';
      case 3: return '🙂';
      case 4: return '😊';
      case 5: return '🤩';
      default: return '🤔';
    }
  };

  /**
   * Handle star press with animation
   */
  const handleStarPress = useCallback((rating: number) => {
    if (selectedRating === rating) {
      setSelectedRating(rating - 1);
      return;
    }
    
    setSelectedRating(rating);

    const starIndex = rating - 1;
    Animated.sequence([
      Animated.timing(starScales[starIndex], {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(starScales[starIndex], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [starScales, selectedRating]);

  /**
   * Handle submit button press
   */
  const handleSubmit = useCallback(() => {
    if (selectedRating > 0) {
      onSubmitRating(selectedRating);
      setSelectedRating(0);
    }
  }, [selectedRating, onSubmitRating]);

  /**
   * Handle modal close
   */
  const handleClose = useCallback(() => {
    setSelectedRating(0);
    onClose();
  }, [onClose]);

  /**
   * Get dynamic content based on rating
   */
  const getContent = () => {
    switch (selectedRating) {
      case 0:
        return {
          title: 'Rate Your Experience',
          subtitle: 'We\'d love to hear what you think',
          buttonText: 'Rate your experience',
        };
      case 1:
        return {
          title: 'We\'ll Do Better',
          subtitle: 'We\'ll work hard to fix it',
          buttonText: 'Send Feedback',
        };
      case 2:
        return {
          title: 'We Can Do Better',
          subtitle: 'Thanks for your honesty',
          buttonText: 'Send Feedback',
        };
      case 3:
        return {
          title: 'Not Bad At All',
          subtitle: 'We\'re always improving',
     buttonText: 'Send Feedback',
        };
      case 4:
        return {
          title: 'Glad You Like It!',
          subtitle: 'Mind sharing your thoughts',
  buttonText: 'Send Feedback',
        };
      case 5:
        return {
          title: 'You Made Our Day! ✨',
          subtitle: 'A quick review means the world to us',
        buttonText: 'Send Feedback',
        };
      default:
        return {
          title: 'Rate Your Experience',
          subtitle: 'We\'d love to hear what you think',
          buttonText: 'Rate your experience',
        };
    }
  };

  const content = getContent();
  const showSparkles = selectedRating >= 4;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Glass Background */}
        {Platform.OS === 'ios' ? (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={20}
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.85)"
          />
        ) : (
          <Pressable 
            style={[StyleSheet.absoluteFill, styles.androidBlur]} 
            onPress={handleClose}
          />
        )}

        {/* Modal Content */}
        <View style={styles.modalContainer}>
          {/* Sparkle decorations for high ratings */}
          {showSparkles && (
            <>
              <AnimatedSparkle 
                delay={0} 
                size={moderateScale(14)} 
                color="#FFD700"
                style={styles.sparkle1}
              />
              <AnimatedSparkle 
                delay={200} 
                size={moderateScale(10)} 
                color="#FF6B8A"
                style={styles.sparkle2}
              />
              <AnimatedSparkle 
                delay={400} 
                size={moderateScale(12)} 
                color="#4ECDC4"
                style={styles.sparkle3}
              />
              <AnimatedSparkle 
                delay={300} 
                size={moderateScale(8)} 
                color="#FFD700"
                style={styles.sparkle4}
              />
            </>
          )}

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <CrossIcon width={moderateScale(28)} height={moderateScale(28)} />
          </TouchableOpacity>

          {/* Dynamic Emoji Face */}
          <View style={styles.emojiContainer}>
            <LinearGradientView
              colors={selectedRating >= 4 ? ['#FF6B8A', '#FF3E57'] : ['#3A3A3C', '#2C2C2E']}
              style={styles.emojiBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Animated.Text style={[styles.emoji, { transform: [{ scale: emojiScale }] }]}>
                {getEmoji()}
              </Animated.Text>
            </LinearGradientView>
          </View>

          {/* Title */}
          <Text style={styles.title}>{content.title}</Text>
          
          {/* Subtitle */}
          <Text style={styles.subtitle}>{content.subtitle}</Text>

          {/* Stars Row */}
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                filled={star <= selectedRating}
                size={moderateScale(44)}
                onPress={() => handleStarPress(star)}
                animatedScale={starScales[star - 1]}
              />
            ))}
          </View>

          {/* Rating Label */}
          {/* <View style={styles.ratingLabelContainer}>
            {selectedRating > 0 ? (
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingBadgeText}>
                  {selectedRating === 1 && 'Poor'}
                  {selectedRating === 2 && 'Fair'}
                  {selectedRating === 3 && 'Good'}
                  {selectedRating === 4 && 'Great'}
                  {selectedRating === 5 && 'Excellent!'}
                </Text>
              </View>
            ) : (
              <Text style={styles.tapHint}>Tap to rate</Text>
            )}
          </View> */}

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              selectedRating === 0 && styles.submitButtonDisabled,
            //   selectedRating >= 4 && styles.submitButtonHighlight,
            ]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={selectedRating === 0}
          >
            {/* {selectedRating >= 4 ? (
 <Text style={styles.submitButtonText}>{content.buttonText}</Text>
            ) : ( */}
              <Text style={styles.submitButtonText}>{content.buttonText}</Text>
            {/* )} */}
          </TouchableOpacity>

          {/* Skip Link */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
          >
            <Text style={styles.skipText}>Not now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

RatingModal.displayName = 'RatingModal';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(24),
  },
  androidBlur: {
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  },
  modalContainer: {
    width: '100%',
    maxWidth: moderateScale(340),
    backgroundColor: '#1C1C1E',
    borderRadius: moderateScale(24),
    paddingTop: verticalScale(32),
    paddingBottom: verticalScale(24),
    paddingHorizontal: horizontalScale(24),
    alignItems: 'center',
    // Shadow
    shadowColor: '#FF3E57',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
    // Border
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  closeButton: {
    position: 'absolute',
    top: moderateScale(14),
    right: moderateScale(14),
    zIndex: 10,
    padding: moderateScale(4),
    opacity: 0.6,
  },
  emojiContainer: {
    marginBottom: verticalScale(20),
  },
  emojiBackground: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: moderateScale(42),
  },
  title: {
    fontFamily: FontFamilies.poppinsBold,
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: verticalScale(6),
  },
  subtitle: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: moderateScale(14),
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: verticalScale(24),
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: moderateScale(6),
    marginBottom: verticalScale(8),
  },
  ratingLabelContainer: {
    height: verticalScale(32),
    justifyContent: 'center',
    marginBottom: verticalScale(20),
  },
  ratingBadge: {
    backgroundColor: 'rgba(255, 62, 87, 0.15)',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: 'rgba(255, 62, 87, 0.3)',
  },
  ratingBadgeText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: moderateScale(13),
    color: Colors.primary,
    fontWeight: '600',
  },
  tapHint: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: moderateScale(13),
    color: 'rgba(255, 255, 255, 0.4)',
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#2C2C2E',
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(12),
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonHighlight: {
    backgroundColor: 'transparent',
    padding: 0,
  },
  gradientButton: {
    width: '100%',
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontFamily: FontFamilies.poppinsSemiBold,
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skipButton: {
    paddingVertical: verticalScale(6),
  },
  skipText: {
    fontFamily: FontFamilies.poppinsRegular,
    fontSize: moderateScale(14),
    color: 'rgba(255, 255, 255, 0.4)',
  },
  // Sparkle positions
  sparkle1: {
    position: 'absolute',
    top: moderateScale(20),
    left: moderateScale(30),
  },
  sparkle2: {
    position: 'absolute',
    top: moderateScale(45),
    right: moderateScale(25),
  },
  sparkle3: {
    position: 'absolute',
    top: moderateScale(80),
    left: moderateScale(20),
  },
  sparkle4: {
    position: 'absolute',
    top: moderateScale(15),
    right: moderateScale(60),
  },
});

export default RatingModal;

import React, {memo, useCallback, useState, useRef, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import FastImage, {OnLoadEvent} from 'react-native-fast-image';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
  moderateScale,
} from '../../../theme';
import {ChatMessage} from '../chatMockData';

// AI Avatar icon
import UserStarIcon from '../../../assets/icons/chat_icons/user_star.svg';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const MAX_BUBBLE_WIDTH = SCREEN_WIDTH * 0.75;
const MAX_IMAGE_WIDTH = SCREEN_WIDTH * 0.55;
const MAX_IMAGE_HEIGHT = SCREEN_WIDTH * 0.7;
const MIN_IMAGE_HEIGHT = SCREEN_WIDTH * 0.3;

interface ImageDimensions {
  width: number;
  height: number;
}

interface MessageBubbleProps {
  message: ChatMessage;
  onImagePress?: (imageUrl: string) => void;
}

// Separate component for adaptive image to prevent parent re-renders
const AdaptiveImage = memo(({
  imageUrl,
  onPress,
}: {
  imageUrl: string;
  onPress: () => void;
}) => {
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);

  const handleLoad = useCallback((event: OnLoadEvent) => {
    const {width, height} = event.nativeEvent;
    setDimensions({width, height});
  }, []);

  const imageStyle = useMemo(() => {
    if (!dimensions) {
      // Default placeholder size while loading
      return {
        width: MAX_IMAGE_WIDTH,
        height: MAX_IMAGE_WIDTH * 0.75,
      };
    }

    const aspectRatio = dimensions.width / dimensions.height;
    let displayWidth: number;
    let displayHeight: number;

    if (aspectRatio >= 1) {
      // Landscape or square
      displayWidth = MAX_IMAGE_WIDTH;
      displayHeight = Math.max(displayWidth / aspectRatio, MIN_IMAGE_HEIGHT);
    } else {
      // Portrait
      displayHeight = Math.min(MAX_IMAGE_HEIGHT, MAX_IMAGE_WIDTH / aspectRatio);
      displayWidth = displayHeight * aspectRatio;
      // Ensure minimum width
      if (displayWidth < MAX_IMAGE_WIDTH * 0.5) {
        displayWidth = MAX_IMAGE_WIDTH * 0.5;
        displayHeight = displayWidth / aspectRatio;
      }
    }

    return {
      width: displayWidth,
      height: displayHeight,
    };
  }, [dimensions]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={styles.imageContainer}>
      <FastImage
        source={{uri: imageUrl}}
        style={[styles.messageImage, imageStyle]}
        resizeMode={FastImage.resizeMode.contain}
        onLoad={handleLoad}
      />
    </TouchableOpacity>
  );
});

AdaptiveImage.displayName = 'AdaptiveImage';

// Cosmic copy feedback with floating pill design
const CopyFeedback = memo(({visible, animValue}: {visible: boolean; animValue: Animated.Value}) => {
  // Shimmer animation
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      shimmerAnim.setValue(0);
      Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ).start();
    }
  }, [visible, shimmerAnim]);

  const pillStyle = useMemo(() => ({
    opacity: animValue,
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 0.3, 0.6, 1],
          outputRange: [0.3, 1.15, 0.95, 1],
        }),
      },
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [10, 0],
        }),
      },
    ],
  }), [animValue]);

  const checkmarkStyle = useMemo(() => ({
    opacity: animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0, 1],
    }),
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 0.6, 0.8, 1],
          outputRange: [0, 0, 1.3, 1],
        }),
      },
      {
        rotate: animValue.interpolate({
          inputRange: [0, 0.6, 1],
          outputRange: ['0deg', '0deg', '360deg'],
        }),
      },
    ],
  }), [animValue]);

  const shimmerStyle = useMemo(() => ({
    transform: [{
      translateX: shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-60, 60],
      }),
    }],
    opacity: shimmerAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.6, 0],
    }),
  }), [shimmerAnim]);

  if (!visible) return null;

  return (
    <View style={styles.copyFeedbackOverlay}>
      <Animated.View style={[styles.copyPill, pillStyle]}>
        {/* Gradient background layers */}
        <View style={styles.copyPillGradient1} />
        <View style={styles.copyPillGradient2} />
        
        {/* Shimmer effect */}
        <Animated.View style={[styles.copyShimmer, shimmerStyle]} />
        
        {/* Content */}
        <View style={styles.copyPillContent}>
          <Animated.View style={[styles.copyIconContainer, checkmarkStyle]}>
            <View style={styles.copyIconRing}>
              <Text style={styles.copyCheckIcon}>✓</Text>
            </View>
          </Animated.View>
          <Text style={styles.copyPillText}>Copied</Text>
        </View>
        
        {/* Glow effect */}
        <View style={styles.copyPillGlow} />
      </Animated.View>
      
      {/* Sparkle particles */}
      <Animated.View style={[styles.sparkle, styles.sparkle1, {opacity: animValue}]} />
      <Animated.View style={[styles.sparkle, styles.sparkle2, {opacity: animValue}]} />
      <Animated.View style={[styles.sparkle, styles.sparkle3, {opacity: animValue}]} />
    </View>
  );
});

CopyFeedback.displayName = 'CopyFeedback';

const MessageBubble: React.FC<MessageBubbleProps> = memo(
  ({message, onImagePress}) => {
    const isAI = message.sender === 'ai';
    const [showCopyFeedback, setShowCopyFeedback] = useState(false);
    const copyAnimValue = useRef(new Animated.Value(0)).current;
    const animationRef = useRef<Animated.CompositeAnimation | null>(null);

    const handleImagePress = useCallback(() => {
      if (message.imageUrl && onImagePress) {
        onImagePress(message.imageUrl);
      }
    }, [message.imageUrl, onImagePress]);

    const handleLongPress = useCallback(() => {
      if (!message.content) return;

      // Copy to clipboard
      Clipboard.setString(message.content);

      // Cancel any existing animation
      if (animationRef.current) {
        animationRef.current.stop();
      }

      // Reset and show feedback
      copyAnimValue.setValue(0);
      setShowCopyFeedback(true);

      // Animate in, hold, then out
      animationRef.current = Animated.sequence([
        Animated.timing(copyAnimValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.delay(800),
        Animated.timing(copyAnimValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]);

      animationRef.current.start(() => {
        setShowCopyFeedback(false);
      });
    }, [message.content, copyAnimValue]);

    const renderImage = useCallback(() => {
      if (!message.imageUrl) return null;
      return (
        <AdaptiveImage
          imageUrl={message.imageUrl}
          onPress={handleImagePress}
        />
      );
    }, [message.imageUrl, handleImagePress]);

    const renderContent = useCallback(() => {
      if (message.type === 'image') {
        return renderImage();
      }

      return (
        <TouchableOpacity
          onLongPress={handleLongPress}
          delayLongPress={400}
          activeOpacity={0.9}
          style={[styles.bubble, isAI ? styles.aiBubble : styles.userBubble]}>
          {message.type === 'text_with_image' && renderImage()}
          {message.content && (
            <Text
              style={[styles.messageText, isAI ? styles.aiText : styles.userText]}
              selectable={Platform.OS === 'android'}>
              {message.content}
            </Text>
          )}
          <CopyFeedback visible={showCopyFeedback} animValue={copyAnimValue} />
        </TouchableOpacity>
      );
    }, [message, isAI, renderImage, handleLongPress, showCopyFeedback, copyAnimValue]);

    return (
      <View style={[styles.container, isAI ? styles.aiContainer : styles.userContainer]}>
        {isAI && (
          <View style={styles.avatarContainer}>
            <UserStarIcon width={moderateScale(40)} height={moderateScale(40)} />
          </View>
        )}
        <View style={styles.bubbleWrapper}>{renderContent()}</View>
      </View>
    );
  },
);

MessageBubble.displayName = 'MessageBubble';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(12),
  },
  aiContainer: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  userContainer: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  avatarContainer: {
    // width: moderateScale(36),
    // height: moderateScale(36),
    // borderRadius: moderateScale(18),
    // backgroundColor: 'rgba(194, 209, 243, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: horizontalScale(12),
    // marginTop: verticalScale(4),
    bottom:moderateScale(6)
  },
  bubbleWrapper: {
    maxWidth: MAX_BUBBLE_WIDTH,
  },
  bubble: {
    borderRadius: radiusScale(24),
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(12),
    position: 'relative',
    overflow: 'hidden',
  },
  aiBubble: {
    backgroundColor: 'rgba(194, 209, 243, 0.07)',
    borderTopLeftRadius: radiusScale(2),
  },
  userBubble: {
    backgroundColor: 'rgba(75, 123, 236, 0.3)',
    borderTopRightRadius: radiusScale(2),
  },
  messageText: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(14),
    lineHeight: fontScale(21),
  },
  aiText: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  userText: {
    color: '#FFFFFF',
  },
  imageContainer: {
    marginBottom: verticalScale(8),
    borderRadius: radiusScale(16),
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  messageImage: {
    borderRadius: radiusScale(12),
  },
  // Copy feedback styles - Cosmic floating pill design
  copyFeedbackOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: radiusScale(16),
  },
  copyPill: {
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(10),
    borderRadius: radiusScale(24),
    overflow: 'hidden',
    position: 'relative',
    minWidth: moderateScale(100),
  },
  copyPillGradient1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(221, 197, 96, 1)',
  },
  copyPillGradient2: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '60%',
    backgroundColor: 'rgba(221, 197, 96, 0.85)',
    borderTopLeftRadius: radiusScale(50),
    borderBottomLeftRadius: radiusScale(50),
  },
  copyShimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: moderateScale(30),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{skewX: '-20deg'}],
  },
  copyPillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: horizontalScale(8),
  },
  copyIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyIconRing: {
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: moderateScale(11),
    backgroundColor: 'rgba(221, 197, 96, 1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  copyCheckIcon: {
    fontSize: fontScale(12),
    color: '#FFFFFF',
    fontWeight: '700',
  },
  copyPillText: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: fontScale(13),
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  copyPillGlow: {
    position: 'absolute',
    top: -moderateScale(10),
    left: '50%',
    marginLeft: -moderateScale(30),
    width: moderateScale(60),
    height: moderateScale(10),
    backgroundColor: 'rgba(221, 197, 96, 1)',
    borderRadius: moderateScale(10),
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(221, 197, 96, 1)',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.6,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  // Sparkle particles
  sparkle: {
    position: 'absolute',
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: 'rgba(221, 197, 96, 0.8)',
  },
  sparkle1: {
    top: '25%',
    left: '20%',
  },
  sparkle2: {
    top: '30%',
    right: '15%',
  },
  sparkle3: {
    bottom: '25%',
    left: '25%',
  },
});

export default MessageBubble;

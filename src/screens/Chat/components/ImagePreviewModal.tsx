import React, {memo, useCallback, useRef, useEffect} from 'react';
import {
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  PanResponder,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {moderateScale} from '../../../theme';
import CrossIcon from '../../../assets/icons/home_icons/cross.svg';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

interface ImagePreviewModalProps {
  visible: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = memo(
  ({visible, imageUrl, onClose}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (visible) {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.8);
        translateY.setValue(0);
      }
    }, [visible, fadeAnim, scaleAnim, translateY]);

    const handleClose = useCallback(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onClose();
      });
    }, [fadeAnim, scaleAnim, onClose]);

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dy) > 10;
        },
        onPanResponderMove: (_, gestureState) => {
          translateY.setValue(gestureState.dy);
          // Fade out as user drags
          const opacity = Math.max(0, 1 - Math.abs(gestureState.dy) / 300);
          fadeAnim.setValue(opacity);
        },
        onPanResponderRelease: (_, gestureState) => {
          if (Math.abs(gestureState.dy) > 100 || Math.abs(gestureState.vy) > 0.5) {
            // Dismiss
            const direction = gestureState.dy > 0 ? SCREEN_HEIGHT : -SCREEN_HEIGHT;
            Animated.parallel([
              Animated.timing(translateY, {
                toValue: direction,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start(() => {
              onClose();
              translateY.setValue(0);
            });
          } else {
            // Spring back
            Animated.parallel([
              Animated.spring(translateY, {
                toValue: 0,
                friction: 8,
                useNativeDriver: true,
              }),
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
              }),
            ]).start();
          }
        },
      }),
    ).current;

    if (!imageUrl) return null;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={handleClose}>
        <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.9)" />
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
            },
          ]}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}>
            <CrossIcon width={moderateScale(40)} height={moderateScale(40)} />
          </TouchableOpacity>

          {/* Image */}
          <Animated.View
            style={[
              styles.imageContainer,
              {
                transform: [
                  {scale: scaleAnim},
                  {translateY: translateY},
                ],
              },
            ]}
            {...panResponder.panHandlers}>
            <FastImage
              source={{uri: imageUrl}}
              style={styles.image}
              resizeMode={FastImage.resizeMode.contain}
            />
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  },
);

ImagePreviewModal.displayName = 'ImagePreviewModal';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: moderateScale(80),
    right: moderateScale(10),
    zIndex: 10,
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH - 20,
    height: '100%',
    borderRadius: moderateScale(8),
  },
});

export default ImagePreviewModal;

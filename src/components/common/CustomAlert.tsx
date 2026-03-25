import React, {memo, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import {
  FontFamilies,
  horizontalScale,
  verticalScale,
  moderateScale,
  radiusScale,
  fontScale,
} from '../../theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface CustomAlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive' | 'primary';
}

export interface CustomAlertProps {
  visible: boolean;
  type?: AlertType;
  title: string;
  message?: string;
  buttons?: CustomAlertButton[];
  onDismiss?: () => void;
  autoHide?: boolean;
  autoHideDuration?: number;
}

const getTypeColor = (type: AlertType): string => {
  switch (type) {
    case 'success':
      return 'rgba(221, 197, 96, 1)'; // Golden
    case 'error':
      return 'rgba(239, 68, 68, 1)'; // Red
    case 'warning':
      return 'rgba(245, 158, 11, 1)'; // Orange
    case 'info':
    default:
      return 'rgba(125, 211, 252, 1)'; // Cyan
  }
};

const getTypeIcon = (type: AlertType): string => {
  switch (type) {
    case 'success':
      return '✓';
    case 'error':
      return '✕';
    case 'warning':
      return '⚠';
    case 'info':
    default:
      return 'ℹ';
  }
};

const CustomAlert: React.FC<CustomAlertProps> = memo(({
  visible,
  type = 'info',
  title,
  message,
  buttons = [{text: 'OK', style: 'primary' as const}],
  onDismiss,
  autoHide = false,
  autoHideDuration = 3000,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const handleDismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  }, [onDismiss, scaleAnim, opacityAnim]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      if (autoHide) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, autoHideDuration);
        return () => clearTimeout(timer);
      }
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible, autoHide, autoHideDuration, handleDismiss, scaleAnim, opacityAnim]);

  const handleButtonPress = (button: CustomAlertButton) => {
    button.onPress?.();
    handleDismiss();
  };

  const typeColor = getTypeColor(type);
  const typeIcon = getTypeIcon(type);

  const getButtonStyle = (buttonStyle?: 'default' | 'cancel' | 'destructive' | 'primary') => {
    switch (buttonStyle) {
      case 'primary':
        return {
          backgroundColor: 'rgba(221, 197, 96, 0.36)',
          borderColor: 'rgba(221, 197, 96, 1)',
          textColor: '#FFFFFF',
        };
      case 'destructive':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          borderColor: 'rgba(239, 68, 68, 0.6)',
          textColor: 'rgba(239, 68, 68, 1)',
        };
      case 'cancel':
        return {
          backgroundColor: 'rgba(194, 209, 243, 0.1)',
          borderColor: 'rgba(194, 209, 243, 0.3)',
          textColor: 'rgba(194, 209, 243, 0.8)',
        };
      default:
        return {
          backgroundColor: 'rgba(125, 211, 252, 0.36)',
          borderColor: 'rgba(125, 211, 252, 1)',
          textColor: '#FFFFFF',
        };
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}>
      <Animated.View style={[styles.overlay, {opacity: opacityAnim}]}>
        <Animated.View
          style={[
            styles.alertContainer,
            {transform: [{scale: scaleAnim}]},
          ]}>
          {/* Icon Circle */}
          <View style={[styles.iconCircle, {backgroundColor: typeColor}]}>
            <Text style={styles.iconText}>{typeIcon}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          {message && <Text style={styles.message}>{message}</Text>}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => {
              const buttonStyles = getButtonStyle(button.style);
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    {
                      backgroundColor: buttonStyles.backgroundColor,
                      borderColor: buttonStyles.borderColor,
                    },
                  ]}
                  onPress={() => handleButtonPress(button)}
                  activeOpacity={0.7}>
                  <Text style={[styles.buttonText, {color: buttonStyles.textColor}]}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
});

CustomAlert.displayName = 'CustomAlert';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 22, 40, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: SCREEN_WIDTH - horizontalScale(48),
    backgroundColor: '#0F1E35',
    borderRadius: radiusScale(24),
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.2)',
    paddingTop: verticalScale(28),
    paddingHorizontal: horizontalScale(24),
    paddingBottom: verticalScale(24),
    alignItems: 'center',
  },
  iconCircle: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  iconText: {
    fontSize: moderateScale(26),
    color: '#0A1628',
    fontWeight: 'bold',
  },
  title: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(22),
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: verticalScale(10),
  },
  message: {
    fontFamily: FontFamilies.interRegular,
    fontSize: fontScale(14),
    color: 'rgba(194, 209, 243, 0.8)',
    textAlign: 'center',
    marginBottom: verticalScale(24),
    lineHeight: fontScale(20),
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: horizontalScale(12),
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radiusScale(30),
    borderWidth: 1,
  },
  buttonText: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(14),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default CustomAlert;

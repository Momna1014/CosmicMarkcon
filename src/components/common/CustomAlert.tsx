import React, { memo, useEffect, useRef, useCallback } from 'react';
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
  Colors,
  FontFamilies,
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface CustomAlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
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
      return '#4CAF50';
    case 'error':
      return '#F44336';
    case 'warning':
      return '#FF9800';
    case 'info':
    default:
      return Colors.primary || '#2196F3';
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
  buttons = [{ text: 'OK', style: 'default' as const }],
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

  const getButtonStyle = (buttonStyle?: 'default' | 'cancel' | 'destructive') => {
    switch (buttonStyle) {
      case 'destructive':
        return { color: '#F44336' };
      case 'cancel':
        return { color: Colors.inactive };
      default:
        return { color: typeColor };
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View
          style={[
            styles.alertContainer,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Icon Circle */}
          <View style={[styles.iconCircle, { backgroundColor: typeColor }]}>
            <Text style={styles.iconText}>{typeIcon}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          {message && <Text style={styles.message}>{message}</Text>}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  index < buttons.length - 1 && styles.buttonSeparator,
                ]}
                onPress={() => handleButtonPress(button)}
                activeOpacity={0.7}
              >
                <Text style={[styles.buttonText, getButtonStyle(button.style)]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: SCREEN_WIDTH - horizontalScale(60),
    backgroundColor: Colors.cardBackground || '#1E1E21',
    borderRadius: moderateScale(16),
    paddingTop: verticalScale(24),
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(16),
    alignItems: 'center',
  },
  iconCircle: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  iconText: {
    fontSize: moderateScale(28),
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    fontFamily: FontFamilies.jetBrainsMonoBold,
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  message: {
    fontFamily: FontFamilies.outfitRegular,
    fontSize: moderateScale(14),
    color: Colors.inactive,
    textAlign: 'center',
    marginBottom: verticalScale(20),
    lineHeight: moderateScale(20),
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: verticalScale(8),
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSeparator: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonText: {
    fontFamily: FontFamilies.outfitSemiBold,
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});

export default CustomAlert;

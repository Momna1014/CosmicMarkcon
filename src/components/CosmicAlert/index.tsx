import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import {FontFamilies, moderateScale, horizontalScale, verticalScale} from '../../theme';

const {width} = Dimensions.get('window');

interface CosmicAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onDismiss: () => void;
}

const CosmicAlert: React.FC<CosmicAlertProps> = ({
  visible,
  title,
  message,
  buttonText = 'Continue',
  onDismiss,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.sequence([
        Animated.delay(150),
        Animated.spring(iconScale, {
          toValue: 1,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
      iconScale.setValue(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, {opacity: opacityAnim}]}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: opacityAnim,
              transform: [{scale: scaleAnim}],
            },
          ]}>
          {/* Icon */}
          <Animated.View style={[styles.iconContainer, {transform: [{scale: iconScale}]}]}>
            <View style={styles.iconRing}>
              <Text style={styles.icon}>✨</Text>
            </View>
          </Animated.View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Button */}
          <TouchableOpacity onPress={onDismiss} activeOpacity={0.8} style={styles.buttonContainer}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>{buttonText}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(24),
  },
  card: {
    width: width * 0.82,
    borderRadius: moderateScale(24),
    backgroundColor: '#1A1530',
    borderWidth: 1,
    borderColor: 'rgba(139, 126, 200, 0.2)',
    paddingTop: verticalScale(32),
    paddingBottom: verticalScale(28),
    paddingHorizontal: horizontalScale(24),
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: verticalScale(18),
  },
  iconRing: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(35),
    backgroundColor: 'rgba(139, 126, 200, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(139, 126, 200, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: moderateScale(30),
  },
  title: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: moderateScale(22),
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: verticalScale(10),
  },
  message: {
    fontFamily: FontFamilies.interRegular,
    fontSize: moderateScale(14),
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    lineHeight: moderateScale(21),
    marginBottom: verticalScale(24),
    paddingHorizontal: horizontalScale(4),
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: '#7B6CB8',
    paddingVertical: verticalScale(15),
    borderRadius: moderateScale(14),
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: moderateScale(15),
    color: '#FFFFFF',
  },
});

export default CosmicAlert;

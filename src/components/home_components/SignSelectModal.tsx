import React, {memo, useCallback, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {
  FontFamilies,
  fontScale,
  horizontalScale,
  verticalScale,
  radiusScale,
  moderateScale,
} from '../../theme';

// Import zodiac sign SVGs
import GeminisIcon from '../../assets/icons/horoscope_icons/geminis.svg';
import TauroIcon from '../../assets/icons/horoscope_icons/tauro.svg';
import AriesIcon from '../../assets/icons/horoscope_icons/aries.svg';
import CancerIcon from '../../assets/icons/horoscope_icons/cancer.svg';
import CapricornioIcon from '../../assets/icons/horoscope_icons/capricornio.svg';
import VirgoIcon from '../../assets/icons/horoscope_icons/virgo.svg';
import PiscisIcon from '../../assets/icons/horoscope_icons/piscis.svg';
import AcuarioIcon from '../../assets/icons/horoscope_icons/acuario.svg';
import EscorpioIcon from '../../assets/icons/horoscope_icons/escorpio.svg';
import SagitarioIcon from '../../assets/icons/horoscope_icons/sagitario.svg';
import LeoIcon from '../../assets/icons/horoscope_icons/leo.svg';
import LibraIcon from '../../assets/icons/horoscope_icons/libra.svg';

export interface ZodiacSignItem {
  id: string;
  name: string;
  displayName: string;
}

// Zodiac signs data
const ZODIAC_SIGNS: ZodiacSignItem[] = [
  {id: 'gemini', name: 'Gemini', displayName: 'Geminis'},
  {id: 'taurus', name: 'Taurus', displayName: 'Tauro'},
  {id: 'aries', name: 'Aries', displayName: 'Aries'},
  {id: 'cancer', name: 'Cancer', displayName: 'Cancer'},
  {id: 'capricorn', name: 'Capricorn', displayName: 'Capricornio'},
  {id: 'virgo', name: 'Virgo', displayName: 'Virgo'},
  {id: 'pisces', name: 'Pisces', displayName: 'Piscis'},
  {id: 'aquarius', name: 'Aquarius', displayName: 'Acuario'},
  {id: 'scorpio', name: 'Scorpio', displayName: 'Escorpio'},
  {id: 'sagittarius', name: 'Sagittarius', displayName: 'Sagitario'},
  {id: 'leo', name: 'Leo', displayName: 'Leo'},
  {id: 'libra', name: 'Libra', displayName: 'Libra'},
];

// Icon size
const ICON_SIZE = moderateScale(64);

// Get zodiac icon component
const getZodiacIcon = (id: string): React.ReactElement | null => {
  const props = {width: ICON_SIZE, height: ICON_SIZE};

  switch (id) {
    case 'gemini':
      return <GeminisIcon {...props} />;
    case 'taurus':
      return <TauroIcon {...props} />;
    case 'aries':
      return <AriesIcon {...props} />;
    case 'cancer':
      return <CancerIcon {...props} />;
    case 'capricorn':
      return <CapricornioIcon {...props} />;
    case 'virgo':
      return <VirgoIcon {...props} />;
    case 'pisces':
      return <PiscisIcon {...props} />;
    case 'aquarius':
      return <AcuarioIcon {...props} />;
    case 'scorpio':
      return <EscorpioIcon {...props} />;
    case 'sagittarius':
      return <SagitarioIcon {...props} />;
    case 'leo':
      return <LeoIcon {...props} />;
    case 'libra':
      return <LibraIcon {...props} />;
    default:
      return null;
  }
};

interface SignSelectModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectSign: (sign: ZodiacSignItem) => void;
}

// Zodiac sign item component
const ZodiacSignItemComponent = memo(
  ({
    item,
    onSelect,
  }: {
    item: ZodiacSignItem;
    onSelect: (sign: ZodiacSignItem) => void;
  }) => {
    const scaleValue = useRef(new Animated.Value(1)).current;
    const opacityValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = useCallback(() => {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 0.85,
          useNativeDriver: true,
          speed: 20,
          bounciness: 8,
        }),
        Animated.timing(opacityValue, {
          toValue: 0.7,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, [scaleValue, opacityValue]);

    const handlePressOut = useCallback(() => {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 10,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }, [scaleValue, opacityValue]);

    const handlePress = useCallback(() => {
      onSelect(item);
    }, [item, onSelect]);

    return (
      <TouchableOpacity
        style={styles.signItem}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}>
        <Animated.View
          style={[
            styles.signIconContainer,
            {transform: [{scale: scaleValue}], opacity: opacityValue},
          ]}>
          {getZodiacIcon(item.id)}
        </Animated.View>
        <Text style={styles.signName}>{item.displayName}</Text>
      </TouchableOpacity>
    );
  },
);

const SignSelectModal: React.FC<SignSelectModalProps> = memo(
  ({visible, onClose, onSelectSign}) => {
    const renderItem = useCallback(
      ({item}: {item: ZodiacSignItem}) => (
        <ZodiacSignItemComponent item={item} onSelect={onSelectSign} />
      ),
      [onSelectSign],
    );

    const keyExtractor = useCallback(
      (item: ZodiacSignItem) => item.id,
      [],
    );

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}>
        {Platform.OS === 'ios' ? (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={20}
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.9)"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidBlur]} />
        )}
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.modalContainer} onPress={e => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Select a Sign</Text>
                <Text style={styles.subtitle}>READ FOR SOMEONE ELSE</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Zodiac signs grid */}
            <FlatList
              data={ZODIAC_SIGNS}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              numColumns={3}
              columnWrapperStyle={styles.row}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              contentContainerStyle={styles.gridContainer}
            />
          </Pressable>
        </Pressable>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  androidBlur: {
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  },
  modalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.17)',
    borderRadius: radiusScale(36),
    borderWidth: 1,
    borderColor: 'rgba(194, 209, 243, 0.2)',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(20),
    width: '90%',
    maxWidth: horizontalScale(380),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(20),
  },
  title: {
    fontFamily: FontFamilies.sunlightDreams,
    fontSize: fontScale(24),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  subtitle: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(14),
    color: 'rgba(194, 209, 243, 1)',
    marginTop: verticalScale(6),
    letterSpacing: 1,
  },
  closeButton: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: radiusScale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: fontScale(16),
    color: 'rgba(255, 255, 255, 0.6)',
  },
  gridContainer: {
    paddingBottom: verticalScale(10),
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: verticalScale(10),
  },
  signItem: {
    alignItems: 'center',
    width: '25%',
  },
  signIconContainer: {
    // width: moderateScale(75),
    height: moderateScale(85),
    // backgroundColor: 'rgba(194, 209, 243, 0.08)',
    // borderRadius: radiusScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    // marginBottom: verticalScale(),
  },
  signName: {
    fontFamily: FontFamilies.interMedium,
    fontSize: fontScale(14),
    color: 'rgba(193, 171, 117, 1)',
    textAlign: 'center',
  },
});

export default SignSelectModal;
export {ZODIAC_SIGNS, getZodiacIcon};
